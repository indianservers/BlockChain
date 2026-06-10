import { createHash } from "./blockchainEngine.js";

export const escrowStates = ["Created", "Funded", "Delivered", "Confirmed", "Completed"];

export function createEscrowContract() {
  return {
    address: `0xSC${createHash(`contract:${Date.now()}:${Math.random()}`).slice(0, 36)}`,
    owner: "Arbiter",
    buyer: "Buyer",
    seller: "Seller",
    state: "Created",
    price: 25,
    balance: 0,
    released: false,
    disputed: false,
    gasUsed: 0,
    events: [
      event("ContractCreated", "Escrow contract deployed with buyer, seller, and arbiter.")
    ]
  };
}

export const functionSpecs = {
  deposit: {
    label: "deposit()",
    caller: "Buyer",
    gas: 21000,
    description: "Buyer locks payment inside the contract."
  },
  markDelivered: {
    label: "markDelivered()",
    caller: "Seller",
    gas: 17000,
    description: "Seller says the item/service was delivered."
  },
  confirmDelivery: {
    label: "confirmDelivery()",
    caller: "Buyer",
    gas: 16000,
    description: "Buyer confirms delivery and unlocks release."
  },
  releasePayment: {
    label: "releasePayment()",
    caller: "Contract",
    gas: 24000,
    description: "Contract releases payment to seller after confirmation."
  },
  dispute: {
    label: "dispute()",
    caller: "Buyer or Seller",
    gas: 15000,
    description: "Either party pauses the flow for arbiter review."
  }
};

export function callEscrowFunction(contract, functionName, caller) {
  const validation = validateEscrowCall(contract, functionName, caller);
  const gas = functionSpecs[functionName]?.gas ?? 12000;
  const withGas = {
    ...contract,
    gasUsed: contract.gasUsed + gas
  };

  if (!validation.valid) {
    return {
      contract: {
        ...withGas,
        events: [event("CallRejected", `${functionSpecs[functionName]?.label ?? functionName} rejected: ${validation.reason}`), ...contract.events]
      },
      validation
    };
  }

  const updated = applyEscrowCall(withGas, functionName, caller);
  return {
    contract: updated,
    validation
  };
}

export function validateEscrowCall(contract, functionName, caller) {
  const actorError = validateCaller(functionName, caller);
  if (actorError) return { valid: false, reason: actorError };
  if (contract.disputed && functionName !== "releasePayment") return { valid: false, reason: "Contract is in dispute review" };

  if (functionName === "deposit" && contract.state !== "Created") return { valid: false, reason: "Deposit only allowed in Created state" };
  if (functionName === "markDelivered" && contract.state !== "Funded") return { valid: false, reason: "Delivery can be marked only after funding" };
  if (functionName === "confirmDelivery" && contract.state !== "Delivered") return { valid: false, reason: "Buyer can confirm only after delivery" };
  if (functionName === "releasePayment" && contract.state !== "Confirmed") return { valid: false, reason: "Payment release requires Confirmed state" };
  if (functionName === "releasePayment" && contract.released) return { valid: false, reason: "Payment was already released" };
  if (functionName === "dispute" && contract.state === "Completed") return { valid: false, reason: "Completed escrow cannot be disputed" };

  return { valid: true, reason: "Rule check passed" };
}

function validateCaller(functionName, caller) {
  if (functionName === "deposit" && caller !== "Buyer") return "Only Buyer can deposit";
  if (functionName === "markDelivered" && caller !== "Seller") return "Only Seller can mark delivery";
  if (functionName === "confirmDelivery" && caller !== "Buyer") return "Only Buyer can confirm delivery";
  if (functionName === "releasePayment" && caller !== "Contract") return "Only Contract automation can release payment";
  if (functionName === "dispute" && !["Buyer", "Seller"].includes(caller)) return "Only Buyer or Seller can dispute";
  return "";
}

function applyEscrowCall(contract, functionName, caller) {
  if (functionName === "deposit") {
    return {
      ...contract,
      state: "Funded",
      balance: contract.price,
      events: [event("Deposited", `${caller} deposited ${contract.price} tokens.`), ...contract.events]
    };
  }
  if (functionName === "markDelivered") {
    return {
      ...contract,
      state: "Delivered",
      events: [event("Delivered", `${caller} marked the item as delivered.`), ...contract.events]
    };
  }
  if (functionName === "confirmDelivery") {
    return {
      ...contract,
      state: "Confirmed",
      events: [event("Confirmed", `${caller} confirmed delivery.`), ...contract.events]
    };
  }
  if (functionName === "releasePayment") {
    return {
      ...contract,
      state: "Completed",
      balance: 0,
      released: true,
      events: [event("PaymentReleased", `Contract released ${contract.price} tokens to Seller.`), ...contract.events]
    };
  }
  if (functionName === "dispute") {
    return {
      ...contract,
      disputed: true,
      events: [event("Disputed", `${caller} opened a dispute.`), ...contract.events]
    };
  }
  return contract;
}

function event(name, message) {
  return {
    id: crypto.randomUUID(),
    name,
    message,
    time: new Date().toLocaleTimeString()
  };
}

export const contractBugDemos = [
  {
    title: "Missing permission check",
    code: "function markDelivered() public { state = Delivered; }",
    risk: "Anyone could mark delivery, even if they are not the seller.",
    fix: "Require msg.sender == seller before changing state."
  },
  {
    title: "Double release",
    code: "function releasePayment() public { seller.transfer(balance); }",
    risk: "Payment might be released twice if state or released flag is not updated.",
    fix: "Set released = true and state = Completed before external transfer."
  },
  {
    title: "Wrong state",
    code: "function confirmDelivery() public { state = Confirmed; }",
    risk: "Buyer could confirm before delivery is marked.",
    fix: "Require state == Delivered."
  },
  {
    title: "Hardcoded owner",
    code: "address owner = 0xABC...123;",
    risk: "The wrong permanent owner may control admin actions.",
    fix: "Set owner safely during deployment and allow secure transfer."
  }
];
