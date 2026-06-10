export const phase2Quiz = [
  {
    question: "Which field links one block to the block before it?",
    options: ["Previous hash", "Theme", "Username", "Screen size"],
    answer: "Previous hash"
  },
  {
    question: "What happens when block data is edited?",
    options: ["Its hash changes", "Its number disappears", "The browser closes", "The timestamp always resets to zero"],
    answer: "Its hash changes"
  },
  {
    question: "What is the genesis block?",
    options: ["The first block in a chain", "The last invalid block", "A deleted block", "A user profile"],
    answer: "The first block in a chain"
  },
  {
    question: "Why do following blocks become invalid after tampering?",
    options: ["Their previous hash no longer matches", "They are too colorful", "They need a database", "They have no number"],
    answer: "Their previous hash no longer matches"
  },
  {
    question: "What does repairing the chain do in this simulation?",
    options: ["Recalculates hashes and links", "Deletes all data", "Turns off validation", "Creates a backend"],
    answer: "Recalculates hashes and links"
  }
];

export const anatomyFields = [
  ["Block number", "The block's position in the chain."],
  ["Timestamp", "When the block was created."],
  ["Data", "The record or transactions stored in the block."],
  ["Previous hash", "The fingerprint of the block before this one."],
  ["Current hash", "This block's fingerprint, calculated from its contents."],
  ["Nonce", "A number used to vary the hash during mining-style simulations."]
];
