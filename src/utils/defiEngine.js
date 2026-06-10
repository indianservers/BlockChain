import { createHash } from "./blockchainEngine.js";

export function createDeFiState() {
  return {
    pool: {
      tokenA: "ETH",
      tokenB: "USDC",
      reserveA: 100,
      reserveB: 200000,
      feeRate: 0.003,
      lpShares: 1000,
      userShares: 0,
      feesEarned: 0
    },
    lending: {
      collateral: 10,
      collateralPrice: 2000,
      borrowed: 5000,
      liquidationThreshold: 0.75
    },
    staking: {
      staked: 0,
      rewardRate: 0.0015,
      pendingRewards: 0,
      days: 0
    },
    dao: {
      proposal: null,
      votesFor: 0,
      votesAgainst: 0,
      quorum: 60,
      executed: false
    },
    supplyChain: {
      checkpoints: []
    },
    events: [event("LabReady", "DeFi, DAO, and real-world blockchain lab initialized.")],
    challenge: {
      swapped: false,
      liquidity: false,
      borrowed: false,
      staked: false,
      voted: false,
      supplyTracked: false
    }
  };
}

export function swapTokens(state, inputToken, amount) {
  const value = Number(amount);
  if (value <= 0) return state;
  const pool = state.pool;
  const inputIsA = inputToken === pool.tokenA;
  const inputReserve = inputIsA ? pool.reserveA : pool.reserveB;
  const outputReserve = inputIsA ? pool.reserveB : pool.reserveA;
  const amountAfterFee = value * (1 - pool.feeRate);
  const output = (outputReserve * amountAfterFee) / (inputReserve + amountAfterFee);
  const nextPool = inputIsA
    ? { ...pool, reserveA: pool.reserveA + value, reserveB: pool.reserveB - output, feesEarned: pool.feesEarned + value * pool.feeRate }
    : { ...pool, reserveB: pool.reserveB + value, reserveA: pool.reserveA - output, feesEarned: pool.feesEarned + value * pool.feeRate };
  return patch(state, { pool: nextPool, challenge: { ...state.challenge, swapped: true } }, "Swap", `Swapped ${value} ${inputToken} for ${output.toFixed(4)} ${inputIsA ? pool.tokenB : pool.tokenA}.`);
}

export function addLiquidity(state, amountA, amountB) {
  const a = Number(amountA);
  const b = Number(amountB);
  const pool = state.pool;
  const shareMinted = Math.min(a / pool.reserveA, b / pool.reserveB) * pool.lpShares;
  const nextPool = {
    ...pool,
    reserveA: pool.reserveA + a,
    reserveB: pool.reserveB + b,
    lpShares: pool.lpShares + shareMinted,
    userShares: pool.userShares + shareMinted
  };
  return patch(state, { pool: nextPool, challenge: { ...state.challenge, liquidity: true } }, "LiquidityAdded", `Added ${a} ${pool.tokenA} and ${b} ${pool.tokenB}. Minted ${shareMinted.toFixed(2)} LP shares.`);
}

export function removeLiquidity(state, shareAmount) {
  const shares = Math.min(Number(shareAmount), state.pool.userShares);
  const pool = state.pool;
  if (shares <= 0) return state;
  const ratio = shares / pool.lpShares;
  const amountA = pool.reserveA * ratio;
  const amountB = pool.reserveB * ratio;
  const nextPool = {
    ...pool,
    reserveA: pool.reserveA - amountA,
    reserveB: pool.reserveB - amountB,
    lpShares: pool.lpShares - shares,
    userShares: pool.userShares - shares
  };
  return patch(state, { pool: nextPool }, "LiquidityRemoved", `Removed ${shares.toFixed(2)} LP shares for ${amountA.toFixed(4)} ${pool.tokenA} and ${amountB.toFixed(2)} ${pool.tokenB}.`);
}

export function lendingMetrics(lending) {
  const collateralValue = lending.collateral * lending.collateralPrice;
  const ltv = collateralValue ? lending.borrowed / collateralValue : 0;
  const healthFactor = lending.borrowed ? (collateralValue * lending.liquidationThreshold) / lending.borrowed : Infinity;
  return {
    collateralValue,
    ltv,
    healthFactor,
    liquidationRisk: healthFactor < 1.15
  };
}

export function updateLending(state, patchValues) {
  const next = { ...state.lending, ...patchValues };
  return patch(state, { lending: next, challenge: { ...state.challenge, borrowed: Number(next.borrowed) > 0 } }, "LendingUpdated", `Collateral ${next.collateral} ETH, borrowed ${next.borrowed} USDC.`);
}

export function stakeTokens(state, amount) {
  const value = Number(amount);
  return patch(state, { staking: { ...state.staking, staked: state.staking.staked + value }, challenge: { ...state.challenge, staked: true } }, "Staked", `Staked ${value} LRN tokens.`);
}

export function advanceStakingTime(state, days) {
  const value = Number(days);
  const rewards = state.staking.staked * state.staking.rewardRate * value;
  return patch(state, { staking: { ...state.staking, days: state.staking.days + value, pendingRewards: state.staking.pendingRewards + rewards } }, "RewardsAccrued", `Advanced ${value} days and earned ${rewards.toFixed(3)} rewards.`);
}

export function unstakeTokens(state) {
  return patch(state, { staking: { ...state.staking, staked: 0, pendingRewards: 0 } }, "Unstaked", `Unstaked and claimed ${state.staking.pendingRewards.toFixed(3)} rewards.`);
}

export function createProposal(state, title) {
  return patch(state, { dao: { proposal: title, votesFor: 0, votesAgainst: 0, quorum: state.dao.quorum, executed: false } }, "ProposalCreated", `DAO proposal created: ${title}.`);
}

export function voteProposal(state, side, votingPower) {
  if (!state.dao.proposal) return state;
  const dao = side === "for"
    ? { ...state.dao, votesFor: state.dao.votesFor + Number(votingPower) }
    : { ...state.dao, votesAgainst: state.dao.votesAgainst + Number(votingPower) };
  return patch(state, { dao, challenge: { ...state.challenge, voted: true } }, "VoteCast", `Voted ${side} with ${votingPower} power.`);
}

export function daoMetrics(dao) {
  const total = dao.votesFor + dao.votesAgainst;
  return {
    total,
    quorumMet: total >= dao.quorum,
    passed: dao.votesFor > dao.votesAgainst && total >= dao.quorum
  };
}

export function executeProposal(state) {
  const metrics = daoMetrics(state.dao);
  if (!metrics.passed) return patch(state, {}, "ExecutionRejected", "Proposal cannot execute until quorum passes and yes votes win.");
  return patch(state, { dao: { ...state.dao, executed: true } }, "ProposalExecuted", `Executed proposal: ${state.dao.proposal}.`);
}

export function addCheckpoint(state, label, actor) {
  const previousHash = state.supplyChain.checkpoints.at(-1)?.hash ?? "0".repeat(64);
  const checkpoint = {
    id: state.supplyChain.checkpoints.length + 1,
    label,
    actor,
    previousHash,
    hash: createHash(`${label}|${actor}|${previousHash}|${Date.now()}`),
    time: new Date().toLocaleTimeString()
  };
  const checkpoints = [...state.supplyChain.checkpoints, checkpoint];
  return patch(state, { supplyChain: { checkpoints }, challenge: { ...state.challenge, supplyTracked: checkpoints.length >= 4 } }, "CheckpointAdded", `${label} checkpoint added by ${actor}.`);
}

function patch(state, changes, eventName, message) {
  return {
    ...state,
    ...changes,
    events: [event(eventName, message), ...state.events]
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
