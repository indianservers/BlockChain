export const phase7Quiz = [
  {
    question: "What does a smart contract function do?",
    options: ["Runs rules and may update contract state", "Stores a seed phrase publicly", "Deletes the blockchain", "Changes browser theme only"],
    answer: "Runs rules and may update contract state"
  },
  {
    question: "What is an event log used for?",
    options: ["Recording what happened during contract execution", "Hiding private keys", "Increasing screen size", "Skipping validation"],
    answer: "Recording what happened during contract execution"
  },
  {
    question: "Who should call deposit() in this escrow lab?",
    options: ["Buyer", "Seller", "Random visitor", "No one"],
    answer: "Buyer"
  },
  {
    question: "Why can releasePayment() be rejected?",
    options: ["The state is not Confirmed", "The page is responsive", "The owner has a public key", "The event log is visible"],
    answer: "The state is not Confirmed"
  },
  {
    question: "What is a common smart contract bug?",
    options: ["Missing permission check", "Using cards in UI", "Having a timestamp", "Showing a balance"],
    answer: "Missing permission check"
  }
];

export const smartContractUseCases = [
  ["Escrow", "Hold payment until delivery is confirmed."],
  ["Crowdfunding", "Release funds only if a funding goal is reached."],
  ["Insurance", "Pay claims automatically when verified conditions are met."],
  ["NFT minting", "Create digital assets according to contract rules."],
  ["DAO voting", "Record proposals and execute approved decisions."]
];
