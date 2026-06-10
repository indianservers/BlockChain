import { createHash } from "./blockchainEngine.js";

export const initialWallets = [
  {
    name: "Alice",
    publicKey: "PUB_ALICE_7F3A",
    privateKey: "PRIV_ALICE_91K",
    balance: 120
  },
  {
    name: "Bob",
    publicKey: "PUB_BOB_4D22",
    privateKey: "PRIV_BOB_63Q",
    balance: 75
  },
  {
    name: "Charlie",
    publicKey: "PUB_CHARLIE_8C10",
    privateKey: "PRIV_CHARLIE_27Z",
    balance: 45
  }
];

export function createTransaction({ sender, receiver, amount }) {
  const transaction = {
    id: crypto.randomUUID(),
    sender,
    receiver,
    amount: Number(amount),
    timestamp: new Date().toISOString(),
    signature: "",
    status: "Draft"
  };
  return {
    ...transaction,
    hash: transactionHash(transaction)
  };
}

export function transactionHash(transaction) {
  return createHash(`${transaction.sender}|${transaction.receiver}|${transaction.amount}|${transaction.timestamp}`);
}

export function signTransaction(transaction, privateKey) {
  return {
    ...transaction,
    hash: transactionHash(transaction),
    signature: createSignature(transaction, privateKey),
    status: "Signed"
  };
}

export function createSignature(transaction, privateKey) {
  return createHash(`${transactionHash(transaction)}|${privateKey}`).slice(0, 48);
}

export function verifyTransaction(transaction, wallets) {
  const senderWallet = wallets.find(wallet => wallet.name === transaction.sender);
  const receiverWallet = wallets.find(wallet => wallet.name === transaction.receiver);
  const recalculatedHash = transactionHash(transaction);
  const expectedSignature = senderWallet ? createSignature(transaction, senderWallet.privateKey) : "";
  const checks = {
    senderExists: Boolean(senderWallet),
    receiverExists: Boolean(receiverWallet),
    hasSignature: Boolean(transaction.signature),
    hashMatchesData: transaction.hash === recalculatedHash,
    validSignature: Boolean(transaction.signature) && transaction.signature === expectedSignature,
    positiveAmount: Number(transaction.amount) > 0,
    sufficientBalance: Boolean(senderWallet) && Number(transaction.amount) <= senderWallet.balance
  };

  const valid = Object.values(checks).every(Boolean);
  return {
    valid,
    status: valid ? "Verified" : "Rejected",
    reason: valid ? "Ready for mempool" : firstFailure(checks),
    checks,
    expectedHash: recalculatedHash
  };
}

export function applyTransactionsToWallets(wallets, transactions) {
  return wallets.map(wallet => {
    const outgoing = transactions
      .filter(transaction => transaction.sender === wallet.name)
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
    const incoming = transactions
      .filter(transaction => transaction.receiver === wallet.name)
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
    return {
      ...wallet,
      balance: wallet.balance - outgoing + incoming
    };
  });
}

export function tamperTransaction(transaction, field, value) {
  return {
    ...transaction,
    [field]: field === "amount" ? Number(value) : value,
    status: "Tampered"
  };
}

export function makeInvalidDemo(type, wallets) {
  const base = createTransaction({ sender: "Alice", receiver: "Bob", amount: 10 });
  const signed = signTransaction(base, wallets[0].privateKey);

  if (type === "fake-signature") {
    return { ...signed, signature: "FAKE_SIGNATURE_000000", status: "Rejected" };
  }
  if (type === "wrong-key") {
    return signTransaction(base, wallets[1].privateKey);
  }
  if (type === "changed-receiver") {
    return tamperTransaction(signed, "receiver", "Charlie");
  }
  return { ...base, status: "Rejected" };
}

function firstFailure(checks) {
  if (!checks.senderExists) return "Unknown sender wallet";
  if (!checks.receiverExists) return "Unknown receiver wallet";
  if (!checks.positiveAmount) return "Amount must be greater than zero";
  if (!checks.hasSignature) return "Missing signature";
  if (!checks.hashMatchesData) return "Transaction data was changed after hashing";
  if (!checks.validSignature) return "Signature does not match sender key";
  if (!checks.sufficientBalance) return "Insufficient balance";
  return "Rejected by verification";
}

export function shortKey(key) {
  return `${key.slice(0, 8)}...${key.slice(-3)}`;
}
