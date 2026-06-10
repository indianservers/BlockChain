export const phase5Quiz = [
  {
    question: "What is a nonce?",
    options: ["A number miners change to search for a valid hash", "A wallet password", "A receiver address", "A deleted block"],
    answer: "A number miners change to search for a valid hash"
  },
  {
    question: "What does proof of work require?",
    options: ["Finding a hash that meets the difficulty target", "Sharing a private key", "Skipping verification", "Changing the receiver"],
    answer: "Finding a hash that meets the difficulty target"
  },
  {
    question: "What happens when mined block data is tampered with?",
    options: ["The proof becomes invalid", "The nonce becomes invisible", "The wallet address changes color", "The block is automatically repaired"],
    answer: "The proof becomes invalid"
  },
  {
    question: "Why does higher difficulty take longer?",
    options: ["Fewer hashes meet the target", "The UI is darker", "The miner name is longer", "Rewards are hidden"],
    answer: "Fewer hashes meet the target"
  },
  {
    question: "Why should mining loops be controlled in a browser?",
    options: ["To avoid freezing the page", "To delete localStorage", "To hide the hash", "To prevent dark mode"],
    answer: "To avoid freezing the page"
  }
];

export const energyProfiles = [
  ["Low", "Small lab machine", 0.02],
  ["Moderate", "Classroom mining rig", 0.08],
  ["High", "Industrial miner", 0.22]
];
