export const certificateCaseQuiz = [
  {
    question: "What is stored on-chain in this certificate case?",
    options: ["Certificate hash", "Student private key", "Full browser page", "Wallet password"],
    answer: "Certificate hash"
  },
  {
    question: "How does an employer detect tampering?",
    options: ["Compare computed hash with stored hash", "Change the theme", "Mine a nonce", "Vote in a DAO"],
    answer: "Compare computed hash with stored hash"
  },
  {
    question: "What happens if certificate details change after issuance?",
    options: ["The computed hash changes", "The stored hash changes automatically", "The certificate becomes an NFT", "The address disappears"],
    answer: "The computed hash changes"
  },
  {
    question: "What does a revocation registry show?",
    options: ["Certificates no longer considered valid", "Only mining rewards", "Private keys", "Mempool fees"],
    answer: "Certificates no longer considered valid"
  },
  {
    question: "Why store a hash instead of only trusting a PDF?",
    options: ["The hash lets anyone verify integrity", "The PDF becomes larger", "It creates liquidity", "It disables verification"],
    answer: "The hash lets anyone verify integrity"
  }
];
