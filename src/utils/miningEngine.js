import { createHash } from "./blockchainEngine.js";

export const difficulties = {
  Easy: { prefix: "0", batch: 80, label: "Starts with 1 zero" },
  Medium: { prefix: "00", batch: 160, label: "Starts with 2 zeroes" },
  Hard: { prefix: "000", batch: 280, label: "Starts with 3 zeroes" },
  Extreme: { prefix: "0000", batch: 420, label: "Starts with 4 zeroes" }
};

export function createCandidateBlock({ index = 1, data = "Reward learner with 12.5 tokens", previousHash = "0".repeat(64), miner = "Miner A" } = {}) {
  const block = {
    index,
    timestamp: new Date().toISOString(),
    data,
    previousHash,
    miner,
    nonce: 0,
    reward: 12.5
  };
  return {
    ...block,
    hash: calculateMiningHash(block)
  };
}

export function calculateMiningHash(block) {
  return createHash(`${block.index}|${block.timestamp}|${block.data}|${block.previousHash}|${block.miner}|${block.nonce}|${block.reward}`);
}

export function setNonce(block, nonce) {
  const next = { ...block, nonce: Number(nonce) };
  return {
    ...next,
    hash: calculateMiningHash(next)
  };
}

export function validateProof(block, difficultyName) {
  const prefix = difficulties[difficultyName].prefix;
  const expectedHash = calculateMiningHash(block);
  return {
    validHash: expectedHash === block.hash,
    meetsTarget: block.hash.startsWith(prefix),
    target: `${prefix}${"*".repeat(Math.max(0, 8 - prefix.length))}`,
    prefix,
    expectedHash
  };
}

export function mineBatch(block, difficultyName, batchSize = difficulties[difficultyName].batch) {
  let candidate = block;
  for (let step = 0; step < batchSize; step += 1) {
    candidate = setNonce(candidate, candidate.nonce + 1);
    if (validateProof(candidate, difficultyName).meetsTarget) {
      return { block: candidate, found: true, attempts: step + 1 };
    }
  }
  return { block: candidate, found: false, attempts: batchSize };
}

export function tamperMinedBlock(block) {
  return {
    ...block,
    data: `${block.data} (tampered)`,
    hash: block.hash
  };
}

export function createMinedBlockFrom(previousBlock, data, miner = "Learner Miner") {
  return createCandidateBlock({
    index: previousBlock ? previousBlock.index + 1 : 1,
    data,
    previousHash: previousBlock ? previousBlock.hash : "0".repeat(64),
    miner
  });
}

export const minerProfiles = [
  { name: "Miner A", speed: 35, color: "bg-blue-500" },
  { name: "Miner B", speed: 55, color: "bg-cyanx" },
  { name: "Miner C", speed: 80, color: "bg-emerald-500" }
];
