import { createHash } from "./blockchainEngine.js";

const words = [
  "orbit", "river", "copper", "signal", "harbor", "velvet", "matrix", "forest", "anchor", "cactus", "planet", "silver",
  "rocket", "meadow", "castle", "studio", "fabric", "winter", "summit", "marble", "yellow", "magnet", "canvas", "future"
];

export function generateWallet(label = "Learner Wallet") {
  const entropy = `${label}|${Date.now()}|${Math.random()}`;
  const privateKey = `priv_${createHash(entropy).slice(0, 48)}`;
  const publicKey = derivePublicKey(privateKey);
  const address = deriveAddress(publicKey);
  return {
    id: crypto.randomUUID(),
    label,
    privateKey,
    publicKey,
    address,
    balance: 50,
    seedPhrase: generateSeedPhrase(entropy)
  };
}

export function derivePublicKey(privateKey) {
  return `pub_${createHash(`public:${privateKey}`).slice(0, 48)}`;
}

export function deriveAddress(publicKey) {
  return `0x${createHash(`address:${publicKey}`).slice(0, 40)}`;
}

export function generateSeedPhrase(seed) {
  const hash = createHash(seed);
  return Array.from({ length: 12 }, (_, index) => {
    const hex = hash.slice(index * 2, index * 2 + 2);
    return words[parseInt(hex, 16) % words.length];
  });
}

export function signOwnershipMessage(wallet, message) {
  return createHash(`${wallet.privateKey}|${message}`).slice(0, 56);
}

export function verifyOwnershipSignature(wallet, message, signature) {
  return signOwnershipMessage(wallet, message) === signature;
}

export function makeAddressBook(wallets) {
  return wallets.map(wallet => ({
    name: wallet.label,
    address: wallet.address,
    trusted: true
  }));
}

export function shortAddress(address) {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function shortSecret(key) {
  return `${key.slice(0, 10)}...${key.slice(-6)}`;
}

export function createSendDraft(wallet, receiverAddress, amount) {
  return {
    id: crypto.randomUUID(),
    senderAddress: wallet.address,
    receiverAddress,
    amount: Number(amount),
    preparedAt: new Date().toISOString(),
    signature: "",
    status: "Prepared"
  };
}

export function signSendDraft(wallet, draft, privateKey) {
  return {
    ...draft,
    signature: createHash(`${draft.senderAddress}|${draft.receiverAddress}|${draft.amount}|${privateKey}`).slice(0, 56),
    status: privateKey === wallet.privateKey ? "Signed" : "Wrong Key"
  };
}

export function verifySendDraft(wallet, draft) {
  const expected = createHash(`${draft.senderAddress}|${draft.receiverAddress}|${draft.amount}|${wallet.privateKey}`).slice(0, 56);
  const checks = {
    senderMatches: draft.senderAddress === wallet.address,
    hasSignature: Boolean(draft.signature),
    signatureValid: draft.signature === expected,
    hasBalance: Number(draft.amount) > 0 && Number(draft.amount) <= wallet.balance,
    receiverLooksValid: /^0x[a-f0-9]{40}$/i.test(draft.receiverAddress)
  };
  const valid = Object.values(checks).every(Boolean);
  return {
    valid,
    checks,
    reason: valid ? "Ready to broadcast" : firstSendFailure(checks)
  };
}

function firstSendFailure(checks) {
  if (!checks.senderMatches) return "Sender address does not match wallet";
  if (!checks.receiverLooksValid) return "Receiver address format is wrong";
  if (!checks.hasBalance) return "Insufficient balance";
  if (!checks.hasSignature) return "Missing signature";
  if (!checks.signatureValid) return "Wrong private key signature";
  return "Send rejected";
}
