import { createHash } from "./blockchainEngine.js";

export function createDaoTreasuryState() {
  const holders = [
    holder("Asha", 420),
    holder("Ben", 260),
    holder("Chen", 180),
    holder("Dia", 90),
    holder("Evan", 50)
  ];
  return {
    treasury: {
      name: "BuilderDAO Treasury",
      balance: 125000,
      tokenSymbol: "GOV",
      quorumPercent: 60
    },
    holders,
    proposal: null,
    selectedHolderId: holders[0].id,
    completed: false,
    events: [event("TreasuryReady", "DAO treasury initialized with shared token-holder governance.")]
  };
}

export function totalVotingPower(holders) {
  return holders.reduce((sum, holder) => sum + Number(holder.tokens), 0);
}

export function createProposal(state, details) {
  const amount = Number(details.amount);
  const proposal = {
    id: crypto.randomUUID(),
    title: details.title || "Fund community learning grant",
    recipient: details.recipient || "0xGrantWallet",
    amount: Number.isFinite(amount) ? amount : 0,
    reason: details.reason || "Treasury payment for approved DAO work.",
    malicious: Boolean(details.malicious),
    votes: [],
    status: "Voting",
    createdAt: new Date().toLocaleTimeString(),
    executed: false,
    paymentTx: null
  };
  return patch(state, { proposal }, "ProposalCreated", `${proposal.title} requests ${money(proposal.amount)}.`);
}

export function castVote(state, holderId, side) {
  if (!state.proposal || state.proposal.status !== "Voting") return state;
  const holder = state.holders.find(item => item.id === holderId);
  if (!holder) return state;
  const votes = [
    ...state.proposal.votes.filter(vote => vote.holderId !== holderId),
    { holderId, name: holder.name, side, power: holder.tokens, time: new Date().toLocaleTimeString() }
  ];
  const proposal = finalizeIfReady({ ...state.proposal, votes }, state);
  return patch(state, { proposal }, "VoteCast", `${holder.name} voted ${side} with ${holder.tokens} ${state.treasury.tokenSymbol}.`);
}

export function executeTreasuryPayment(state) {
  if (!state.proposal || state.proposal.status !== "Passed" || state.proposal.executed) {
    return patch(state, {}, "ExecutionRejected", "Payment can execute only after quorum is met and the proposal passes.");
  }
  if (state.proposal.malicious) {
    return patch(state, { proposal: { ...state.proposal, status: "Blocked" } }, "MaliciousBlocked", "Payment blocked because the proposal is flagged as malicious.");
  }
  if (state.proposal.amount > state.treasury.balance) {
    return patch(state, { proposal: { ...state.proposal, status: "Rejected" } }, "ExecutionRejected", "Treasury cannot execute a payment larger than its balance.");
  }
  const tx = createHash(`${state.proposal.id}|${state.proposal.recipient}|${state.proposal.amount}|${Date.now()}`);
  return patch(
    state,
    {
      treasury: { ...state.treasury, balance: state.treasury.balance - state.proposal.amount },
      proposal: { ...state.proposal, executed: true, status: "Executed", paymentTx: tx },
      completed: true
    },
    "PaymentExecuted",
    `${money(state.proposal.amount)} paid to ${state.proposal.recipient}.`
  );
}

export function resetDaoCase() {
  return createDaoTreasuryState();
}

export function daoMetrics(state) {
  const total = totalVotingPower(state.holders);
  const votes = state.proposal?.votes ?? [];
  const forPower = votes.filter(vote => vote.side === "for").reduce((sum, vote) => sum + vote.power, 0);
  const againstPower = votes.filter(vote => vote.side === "against").reduce((sum, vote) => sum + vote.power, 0);
  const participated = forPower + againstPower;
  const quorumNeeded = Math.ceil(total * (state.treasury.quorumPercent / 100));
  return {
    total,
    forPower,
    againstPower,
    participated,
    quorumNeeded,
    quorumMet: participated >= quorumNeeded,
    passed: participated >= quorumNeeded && forPower > againstPower,
    forPercent: total ? Math.round((forPower / total) * 100) : 0,
    againstPercent: total ? Math.round((againstPower / total) * 100) : 0,
    quorumPercent: total ? Math.round((participated / total) * 100) : 0
  };
}

function finalizeIfReady(proposal, state) {
  const metrics = daoMetrics({ ...state, proposal });
  if (!metrics.quorumMet) return { ...proposal, status: "Voting" };
  return { ...proposal, status: metrics.passed ? "Passed" : "Rejected" };
}

function holder(name, tokens) {
  return {
    id: crypto.randomUUID(),
    name,
    tokens,
    wallet: `0x${createHash(`dao:${name}`).slice(0, 40)}`
  };
}

function patch(state, changes, name, message) {
  return {
    ...state,
    ...changes,
    events: [event(name, message), ...state.events]
  };
}

function event(name, message) {
  return {
    id: crypto.randomUUID(),
    name,
    message,
    time: new Date().toLocaleTimeString()
  };
}

function money(value) {
  return `$${Number(value).toLocaleString()}`;
}
