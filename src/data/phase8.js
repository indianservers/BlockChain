export const tokenStandards = [
  ["ERC-20", "Fungible tokens where every unit is interchangeable."],
  ["ERC-721", "Unique NFTs where each token has a distinct ID and metadata."],
  ["ERC-1155", "Multi-token standard for fungible and non-fungible assets."],
  ["Soulbound", "Non-transferable tokens for identity, reputation, or credentials."],
  ["Governance Token", "Tokens used for voting power in protocols or DAOs."],
  ["Stablecoin", "Fungible token designed to track a stable value."]
];

export const phase8Quiz = [
  {
    question: "What does fungible mean?",
    options: ["Each unit is interchangeable", "Every token is unique", "The token cannot move", "The metadata is hidden"],
    answer: "Each unit is interchangeable"
  },
  {
    question: "Which standard is commonly used for unique NFTs?",
    options: ["ERC-721", "ERC-20", "PBFT", "Proof of Work"],
    answer: "ERC-721"
  },
  {
    question: "What does approve() allow in ERC-20 style tokens?",
    options: ["A spender can use a limited allowance", "Anyone can mint forever", "NFT metadata disappears", "A wallet loses its address"],
    answer: "A spender can use a limited allowance"
  },
  {
    question: "What does NFT metadata usually describe?",
    options: ["Name, description, image, and attributes", "Only gas price", "Consensus threshold", "Private key"],
    answer: "Name, description, image, and attributes"
  },
  {
    question: "What happens when an NFT is bought in the marketplace simulator?",
    options: ["Ownership transfers to buyer", "It becomes fungible", "The token is burned automatically", "The buyer gets the seller's private key"],
    answer: "Ownership transfers to buyer"
  }
];
