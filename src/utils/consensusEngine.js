export const thresholds = {
  "51%": 0.51,
  "67%": 0.67,
  "75%": 0.75
};

export function createConsensusNodes() {
  return Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    name: `Node ${index + 1}`,
    online: true,
    honest: index !== 5,
    stake: [18, 12, 24, 9, 15, 7, 20][index],
    vote: null,
    chain: "A"
  }));
}

export function toggleNode(nodes, id, field) {
  return nodes.map(node => (node.id === id ? { ...node, [field]: !node[field], vote: null } : node));
}

export function simulateVotes(nodes, proposal, attackMode = false) {
  return nodes.map(node => {
    if (!node.online) return { ...node, vote: null };
    if (!node.honest && attackMode) return { ...node, vote: "reject" };
    if (!node.honest) return { ...node, vote: proposal.valid ? "reject" : "accept" };
    return { ...node, vote: proposal.valid ? "accept" : "reject" };
  });
}

export function consensusResult(nodes, thresholdName) {
  const online = nodes.filter(node => node.online);
  const accepts = online.filter(node => node.vote === "accept").length;
  const required = Math.ceil(online.length * thresholds[thresholdName]);
  return {
    online: online.length,
    accepts,
    rejects: online.filter(node => node.vote === "reject").length,
    required,
    reached: accepts >= required && online.length > 0
  };
}

export function createProposal(type = "normal") {
  if (type === "double-spend") {
    return {
      id: crypto.randomUUID(),
      title: "Block proposal with double spend",
      transactions: ["Alice → Bob: 20", "Alice → Charlie: 20"],
      valid: false,
      issue: "Same funds are spent twice"
    };
  }
  return {
    id: crypto.randomUUID(),
    title: "Valid block proposal",
    transactions: ["Alice → Bob: 8", "Charlie → Dana: 4"],
    valid: true,
    issue: "No conflict detected"
  };
}

export function makeFork(nodes) {
  return nodes.map(node => ({
    ...node,
    chain: node.id <= 3 ? "A" : "B"
  }));
}

export function resolveFork(nodes, preferred = "B") {
  return nodes.map(node => ({
    ...node,
    chain: preferred
  }));
}

export function forkStats(nodes) {
  return {
    A: nodes.filter(node => node.chain === "A").length,
    B: nodes.filter(node => node.chain === "B").length
  };
}

export function selectPoSValidator(nodes) {
  const onlineHonest = nodes.filter(node => node.online && node.honest);
  const pool = onlineHonest.length ? onlineHonest : nodes.filter(node => node.online);
  const totalStake = pool.reduce((sum, node) => sum + node.stake, 0);
  let pick = Math.random() * totalStake;
  for (const node of pool) {
    pick -= node.stake;
    if (pick <= 0) return node;
  }
  return pool[0] ?? null;
}

export function bftStatus(nodes) {
  const online = nodes.filter(node => node.online);
  const malicious = online.filter(node => !node.honest).length;
  const maxFaults = Math.floor((online.length - 1) / 3);
  return {
    online: online.length,
    malicious,
    maxFaults,
    safe: malicious <= maxFaults
  };
}

export const consensusTypes = [
  ["Proof of Work", "Miners compete with computation; the valid chain is backed by costly work."],
  ["Proof of Stake", "Validators are selected based on stake and protocol rules."],
  ["DPoS", "Token holders delegate block production to elected validators."],
  ["PBFT", "Known validators exchange votes and tolerate limited Byzantine faults."],
  ["Proof of Authority", "Approved identities validate blocks in a permissioned network."]
];
