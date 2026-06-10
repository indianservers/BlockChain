export const phase3Quiz = [
  {
    question: "What proves that the sender approved a transaction?",
    options: ["Digital signature", "Theme color", "Receiver name only", "Block height"],
    answer: "Digital signature"
  },
  {
    question: "Which key should be used to sign a transaction?",
    options: ["Sender private key", "Receiver public key", "Random key", "Block hash"],
    answer: "Sender private key"
  },
  {
    question: "What is the mempool?",
    options: ["A waiting area for valid transactions", "A deleted wallet", "A CSS file", "A private database password"],
    answer: "A waiting area for valid transactions"
  },
  {
    question: "Why can a changed receiver make a transaction invalid?",
    options: ["The signature was made for different data", "The amount becomes invisible", "The sender disappears", "The block becomes smaller"],
    answer: "The signature was made for different data"
  },
  {
    question: "What should happen to a transaction with insufficient balance?",
    options: ["It should be rejected", "It should always be added", "It should skip verification", "It should delete all wallets"],
    answer: "It should be rejected"
  }
];

export const invalidDemoTypes = [
  ["fake-signature", "Fake signature"],
  ["wrong-key", "Wrong key"],
  ["changed-receiver", "Changed receiver"],
  ["missing-signature", "Missing signature"]
];
