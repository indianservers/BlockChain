export const revisionPhases = [
  ["Foundations", "Distributed ledgers, nodes, blocks, and shared history.", "Foundation Explorer"],
  ["Blocks", "Hashes, previous hashes, nonce, tamper detection.", "Hash Chain Builder"],
  ["Transactions", "Transaction anatomy, signatures, verification, mempool.", "Transaction Validator"],
  ["Wallets", "Public keys, private keys, addresses, ownership, seed safety.", "Secure Wallet Operator"],
  ["Mining", "Nonce search, difficulty target, proof of work, rewards.", "Proof of Work Miner"],
  ["Consensus", "Voting, forks, double spend detection, Byzantine tolerance.", "Consensus Defender"],
  ["Smart Contracts", "Functions, rule checks, state transitions, events, bugs.", "Smart Contract Operator"],
  ["Tokens", "ERC-20, NFTs, approvals, metadata, marketplace flows.", "Token Creator"],
  ["DeFi", "Swaps, pools, lending, staking, DAO votes, real-world use.", "Blockchain Strategist"]
].map(([title, summary, badge]) => ({ title, summary, badge }));

export const capstoneBadges = [
  "Foundation Explorer",
  "Hash Chain Builder",
  "Transaction Validator",
  "Secure Wallet Operator",
  "Proof of Work Miner",
  "Consensus Defender",
  "Smart Contract Operator",
  "Token Creator",
  "Blockchain Strategist",
  "Complete Blockchain Practitioner"
];

export const securityScenarios = [
  ["Private key leak", "Revoke access where possible, move funds to a new wallet, never share the key again."],
  ["Fake transaction", "Reject it because the signature or sender authorization is invalid."],
  ["Tampered block", "Recalculate hashes and identify the first broken block."],
  ["Double spend", "Reject conflicting transactions and follow the consensus-approved chain."],
  ["Malicious node", "Do not trust one node; require threshold agreement."],
  ["Phishing", "Do not sign unknown prompts or enter seed phrases."],
  ["NFT sold by non-owner", "Reject sale because only owner or approved operator can transfer."]
];

export const matchingPairs = [
  ["Hash", "Digital fingerprint of data"],
  ["Nonce", "Number changed during mining"],
  ["Private Key", "Secret used to authorize ownership"],
  ["Mempool", "Waiting area for valid transactions"],
  ["Consensus", "Network agreement on state"],
  ["Smart Contract", "Code that runs rules on-chain"],
  ["NFT", "Unique token with metadata"],
  ["Liquidity Pool", "Reserves used for decentralized swaps"]
];

export const timelineAnswer = [
  "Wallet creation",
  "Transaction created",
  "Transaction signed",
  "Mempool validation",
  "Block built",
  "Mining or consensus",
  "Ledger updated"
];

const baseQuestions = [
  ["What is blockchain best described as?", "A distributed ledger", "A private spreadsheet", "A password manager", "A single server"],
  ["What links blocks together?", "Previous hash", "Wallet color", "Gas fee", "DAO title"],
  ["What changes when block data is tampered?", "Hash", "Font", "Browser", "Theme"],
  ["Who signs a transaction?", "Sender", "Receiver only", "Marketplace only", "Random node"],
  ["Which key must remain secret?", "Private key", "Public key", "Wallet address", "Block number"],
  ["What is a nonce used for?", "Mining hash search", "NFT image", "DAO quorum", "Seed display"],
  ["What does consensus achieve?", "Agreement on valid state", "Key exposure", "Token burn only", "UI layout"],
  ["What is a smart contract event?", "A recorded execution log", "A hidden password", "A private key", "An image file"],
  ["What is ERC-20 commonly used for?", "Fungible tokens", "Unique NFTs only", "Consensus votes only", "Mining hardware"],
  ["What is an NFT?", "A unique token", "Every identical token", "A fake signature", "A fork"],
  ["What does x*y=k model?", "Liquidity pool swaps", "Seed phrase storage", "Block height", "Node count"],
  ["What is LTV?", "Borrowed amount compared to collateral value", "Hash length", "NFT rarity only", "Gas per second"],
  ["What does a DAO use proposals for?", "Governance decisions", "Deleting wallets", "Hiding events", "Changing private keys"],
  ["What is a double spend?", "Spending same funds twice", "Minting an NFT", "Adding liquidity", "Printing a page"],
  ["What is a seed phrase?", "Recovery secret", "Public username", "Token symbol", "Gas unit"],
  ["What is mempool?", "Pending valid transactions", "Completed blocks only", "Wallet backup", "NFT metadata"],
  ["Why verify signatures?", "To prove authorization", "To increase CSS", "To hide balances", "To skip rules"],
  ["What is proof of work?", "Costly nonce search for a valid hash", "DAO vote count", "NFT listing", "Seed import"],
  ["What can a malicious node do?", "Vote against or spread invalid state", "Guarantee truth", "Create all keys", "Prevent UI"],
  ["What is fork resolution?", "Choosing one valid chain path", "Deleting all blocks", "Burning tokens", "Changing owner"]
];

export const finalQuestions = Array.from({ length: 50 }, (_, index) => {
  const q = baseQuestions[index % baseQuestions.length];
  return {
    id: index + 1,
    question: `${q[0]} (${index + 1})`,
    answer: q[1],
    options: [q[1], q[2], q[3], q[4]]
  };
});
