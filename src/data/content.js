import {
  BadgeCheck,
  Banknote,
  Blocks,
  Box,
  Building2,
  CheckSquare,
  Clock3,
  Database,
  FileBadge,
  FileText,
  Fingerprint,
  GitBranch,
  HeartPulse,
  Landmark,
  Link2,
  Network,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  UsersRound,
  Vote,
  WalletCards
} from "lucide-react";

export const explanationCards = [
  {
    icon: Database,
    title: "A digital ledger",
    text: "Blockchain records activity in a shared digital record book instead of a private spreadsheet."
  },
  {
    icon: Box,
    title: "Data lives in blocks",
    text: "Records are grouped into blocks that hold data, timestamp, hash, and previous hash."
  },
  {
    icon: Link2,
    title: "Blocks are connected",
    text: "Each new block points back to the previous block, creating a chronological chain."
  },
  {
    icon: ShieldCheck,
    title: "Hard to tamper with",
    text: "Changing old data breaks hashes and disagrees with copies held by other participants."
  }
];

export const concepts = [
  ["Block", Blocks, "A container for records.", "Like one page in a class register.", "A block may include 120 payment records."],
  ["Chain", GitBranch, "An ordered sequence of linked blocks.", "Like numbered pages in a book.", "Block 12 points to block 11."],
  ["Node", Network, "A participant computer in the network.", "Like each teammate keeping a project copy.", "A node checks and shares new transactions."],
  ["Ledger", FileText, "A record book of what happened.", "Like a bank passbook.", "A ledger notes that A paid B 5 tokens."],
  ["Hash", Fingerprint, "A digital fingerprint for data.", "Like a seal on a document.", "One changed letter creates a new hash."],
  ["Transaction", ReceiptText, "An action recorded on the ledger.", "Like a receipt.", "A transfer from buyer to seller."],
  ["Consensus", UsersRound, "Agreement about valid updates.", "Like a group vote.", "Nodes agree before a block is added."],
  ["Immutability", BadgeCheck, "Past records resist unnoticed edits.", "Like permanent ink plus many copies.", "Editing old data breaks later links."]
].map(([title, icon, definition, analogy, example]) => ({ title, icon, definition, analogy, example }));

export const useCases = [
  {
    title: "Cryptocurrency",
    icon: WalletCards,
    text: "Digital value can move between people without one central payment controller.",
    example: "A learner sends crypto to a friend, and the transfer is recorded on a public ledger."
  },
  {
    title: "Supply Chain",
    icon: PackageCheck,
    text: "Products can be traced from origin to customer using shared checkpoints.",
    example: "A mango export records farm, packing center, port, importer, and store arrival."
  },
  {
    title: "Healthcare",
    icon: HeartPulse,
    text: "Approved parties can verify important medical record events.",
    example: "A clinic verifies a vaccination record issued by a hospital."
  },
  {
    title: "Land Registry",
    icon: Landmark,
    text: "Ownership history can become easier to audit and harder to forge.",
    example: "A land office records each sale and links it to the previous owner record."
  },
  {
    title: "Voting",
    icon: Vote,
    text: "Votes can be counted with clearer audit trails and duplicate checks.",
    example: "A college election records one verified vote for each eligible student."
  },
  {
    title: "Certificates",
    icon: FileBadge,
    text: "Credentials can be checked without calling the issuing organization.",
    example: "An employer verifies a certificate hash against the issuer's blockchain record."
  },
  {
    title: "Payments",
    icon: Banknote,
    text: "Banks can coordinate settlement using a shared source of truth.",
    example: "Two banks update the same ledger after a cross-border payment is confirmed."
  },
  {
    title: "Smart Contracts",
    icon: Building2,
    text: "Rules can run automatically when agreed conditions are met.",
    example: "A deposit is released when both renter and owner confirm checkout."
  }
];

export const timelineSteps = [
  ["Data", Database, "A piece of information is ready to be recorded."],
  ["Transaction", ReceiptText, "The information becomes a proposed ledger action."],
  ["Verification", CheckSquare, "Network participants check whether it follows the rules."],
  ["Block", Box, "Valid transactions are grouped into a block."],
  ["Chain", Link2, "The block links to the previous block by hash."],
  ["Ledger update", Clock3, "Participants receive the updated ledger copy."]
].map(([title, icon, text]) => ({ title, icon, text }));

export const quizQuestions = [
  {
    question: "What does blockchain mainly store data in?",
    options: ["Blocks", "Folders", "Slides", "Random screens"],
    answer: "Blocks"
  },
  {
    question: "What does distributed mean?",
    options: ["Shared across many participants", "Owned by one person", "Deleted quickly", "Printed on paper"],
    answer: "Shared across many participants"
  },
  {
    question: "What is a ledger?",
    options: ["A record book", "A password", "A theme color", "A cable"],
    answer: "A record book"
  },
  {
    question: "Why is blockchain difficult to tamper with?",
    options: ["Blocks are linked and copied", "It has no records", "It uses large buttons", "Only one person checks it"],
    answer: "Blocks are linked and copied"
  },
  {
    question: "What is a node?",
    options: ["A network participant", "A page title", "A database password", "A font size"],
    answer: "A network participant"
  },
  {
    question: "What does a hash act like?",
    options: ["A digital fingerprint", "A payment card", "A speaker", "A browser tab"],
    answer: "A digital fingerprint"
  }
];

export const flowSteps = [
  "Transaction Created",
  "Transaction Shared with Network",
  "Network Validates",
  "Block Created",
  "Block Added to Chain",
  "Ledger Updated"
];
