export const realWorldUseCases = [
  ["Supply Chain", "Track product checkpoints with shared audit trails."],
  ["Certificates", "Verify credentials without calling the issuer."],
  ["Land Registry", "Record ownership transfers with tamper-resistant history."],
  ["Healthcare", "Share verified medical events between approved parties."],
  ["Payments", "Settle digital value across borders or institutions."],
  ["Trade Finance", "Coordinate invoices, documents, and shipment milestones."],
  ["Identity", "Let users prove claims without exposing every detail."],
  ["Carbon Credits", "Track issuance, ownership, and retirement of credits."]
];

export const riskCards = [
  ["Bugs", "Code mistakes can lock or lose funds."],
  ["Scams", "Fake apps and social engineering can trick users."],
  ["Key loss", "Lost keys can mean lost access."],
  ["Regulation", "Rules vary by country and may change."],
  ["Volatility", "Asset prices can move quickly."],
  ["Oracle risk", "Bad external data can trigger bad outcomes."],
  ["Privacy", "Public ledgers can leak transaction patterns."]
];

export const phase9Quiz = [
  {
    question: "What formula powers the swap simulator?",
    options: ["x * y = k", "a + b = c", "51% + 49%", "hash = key"],
    answer: "x * y = k"
  },
  {
    question: "What does LTV compare?",
    options: ["Borrowed amount to collateral value", "Votes to blocks", "NFT ID to metadata", "Gas to nonce"],
    answer: "Borrowed amount to collateral value"
  },
  {
    question: "What is a DAO proposal?",
    options: ["A decision submitted for community vote", "A private key backup", "A token image", "A mining nonce"],
    answer: "A decision submitted for community vote"
  },
  {
    question: "What do liquidity providers earn in this lab?",
    options: ["Swap fees", "Private keys", "Consensus votes only", "Seed phrases"],
    answer: "Swap fees"
  },
  {
    question: "Why hash supply-chain checkpoints?",
    options: ["To link each checkpoint to previous history", "To hide all products", "To create a wallet", "To remove regulation"],
    answer: "To link each checkpoint to previous history"
  }
];
