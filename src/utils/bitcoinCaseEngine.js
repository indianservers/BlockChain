import { createHash } from "./blockchainEngine.js";

export const feeLevels = {
  Low: { satsPerVByte: 5, label: "Low priority" },
  Standard: { satsPerVByte: 18, label: "Normal priority" },
  High: { satsPerVByte: 45, label: "High priority" }
};

export function createBitcoinCaseState() {
  return {
    buyer: {
      name: "Buyer Wallet",
      address: btcAddress("buyer"),
      balance: 0.085
    },
    merchant: {
      name: "Merchant Wallet",
      address: btcAddress("merchant"),
      balance: 0.012
    },
    transaction: null,
    mempool: seedMempool(),
    minedBlock: null,
    confirmations: 0,
    doubleSpend: null,
    events: [event("CaseStarted", "Bitcoin payment case study initialized.")],
    completed: false
  };
}

export function createBtcTransaction(state, amount, feeLevel) {
  const fee = feeLevels[feeLevel];
  const size = 140;
  const feeBtc = (fee.satsPerVByte * size) / 100000000;
  const tx = {
    id: createHash(`${state.buyer.address}|${state.merchant.address}|${amount}|${feeLevel}|${Date.now()}`).slice(0, 24),
    from: state.buyer.address,
    to: state.merchant.address,
    amount: Number(amount),
    feeLevel,
    satsPerVByte: fee.satsPerVByte,
    feeBtc,
    size,
    status: "Created",
    confirmations: 0
  };
  return {
    ...state,
    transaction: tx,
    events: [event("TransactionCreated", `Created payment of ${amount} BTC with ${feeLevel} fee.`), ...state.events]
  };
}

export function broadcastTransaction(state) {
  if (!state.transaction) return state;
  const tx = { ...state.transaction, status: "Mempool" };
  return {
    ...state,
    transaction: tx,
    mempool: [tx, ...state.mempool.filter(item => item.id !== tx.id)].sort((a, b) => b.satsPerVByte - a.satsPerVByte),
    events: [event("Broadcast", "Transaction broadcast to mempool."), ...state.events]
  };
}

export function minerSelectTransactions(state, limit = 4) {
  const selected = [...state.mempool].sort((a, b) => b.satsPerVByte - a.satsPerVByte).slice(0, limit);
  return {
    selected,
    remaining: state.mempool.filter(tx => !selected.some(item => item.id === tx.id))
  };
}

export function mineBitcoinBlock(state) {
  const { selected, remaining } = minerSelectTransactions(state);
  if (!selected.length) return state;
  const block = {
    height: 840000 + Math.floor(Math.random() * 500),
    nonce: Math.floor(Math.random() * 999999),
    hash: createHash(selected.map(tx => tx.id).join("|")).replace(/^[a-f]/, "0"),
    transactions: selected,
    minedAt: new Date().toLocaleTimeString()
  };
  const containsPayment = selected.some(tx => tx.id === state.transaction?.id);
  return {
    ...state,
    minedBlock: block,
    mempool: remaining,
    transaction: state.transaction ? { ...state.transaction, status: containsPayment ? "Mined" : state.transaction.status, confirmations: containsPayment ? 1 : 0 } : null,
    confirmations: containsPayment ? 1 : state.confirmations,
    events: [event("BlockMined", `Miner selected ${selected.length} high-fee transaction(s).`), ...state.events]
  };
}

export function addConfirmation(state) {
  if (!state.transaction || state.transaction.status !== "Mined") return state;
  const next = Math.min(6, state.confirmations + 1);
  const settled = next >= 6;
  return {
    ...state,
    confirmations: next,
    transaction: { ...state.transaction, confirmations: next, status: settled ? "Settled" : "Mined" },
    buyer: settled ? { ...state.buyer, balance: state.buyer.balance - state.transaction.amount - state.transaction.feeBtc } : state.buyer,
    merchant: settled ? { ...state.merchant, balance: state.merchant.balance + state.transaction.amount } : state.merchant,
    completed: settled,
    events: [event(settled ? "FinalSettlement" : "Confirmation", `${next} confirmation(s) reached.`), ...state.events]
  };
}

export function attemptDoubleSpend(state) {
  if (!state.transaction) return state;
  const doubleSpend = {
    ...state.transaction,
    id: createHash(`double:${state.transaction.id}`).slice(0, 24),
    to: btcAddress("attacker"),
    status: state.confirmations > 0 ? "Rejected" : "Conflict"
  };
  return {
    ...state,
    doubleSpend,
    events: [event("DoubleSpendAttempt", state.confirmations > 0 ? "Rejected because original payment already has confirmations." : "Conflict detected in mempool."), ...state.events]
  };
}

function seedMempool() {
  return [
    mempoolTx("cafeteria", 0.003, "High"),
    mempoolTx("exchange", 0.12, "Standard"),
    mempoolTx("donation", 0.001, "Low"),
    mempoolTx("hardware", 0.025, "High"),
    mempoolTx("invoice", 0.014, "Standard")
  ].sort((a, b) => b.satsPerVByte - a.satsPerVByte);
}

function mempoolTx(seed, amount, feeLevel) {
  return {
    id: createHash(`${seed}:${amount}`).slice(0, 24),
    from: btcAddress(`${seed}-from`),
    to: btcAddress(`${seed}-to`),
    amount,
    feeLevel,
    satsPerVByte: feeLevels[feeLevel].satsPerVByte,
    feeBtc: (feeLevels[feeLevel].satsPerVByte * 140) / 100000000,
    status: "Mempool"
  };
}

function btcAddress(seed) {
  return `bc1q${createHash(seed).slice(0, 34)}`;
}

function event(name, message) {
  return {
    id: crypto.randomUUID(),
    name,
    message,
    time: new Date().toLocaleTimeString()
  };
}
