export const riskScenarios = [
  {
    id: "sharing-private-key",
    title: "Sharing private key",
    risk: "Anyone with your private key can authorize spending from your wallet.",
    safeAction: "Never share it. Use your public address when someone needs to send you tokens.",
    severity: "critical"
  },
  {
    id: "losing-key",
    title: "Losing key",
    risk: "If the private key or seed phrase is lost, ownership access may be gone permanently.",
    safeAction: "Back up the seed phrase offline in a secure place.",
    severity: "high"
  },
  {
    id: "phishing",
    title: "Phishing link",
    risk: "A fake website can trick you into signing something dangerous.",
    safeAction: "Check the site, transaction details, and wallet prompt before signing.",
    severity: "high"
  },
  {
    id: "wrong-address",
    title: "Wrong address",
    risk: "Sending to the wrong address can be irreversible.",
    safeAction: "Compare the first and last characters, use an address book, and test small transfers.",
    severity: "medium"
  },
  {
    id: "fake-support",
    title: "Fake support request",
    risk: "Support scammers ask for seed phrases or private keys.",
    safeAction: "Real support should never need your seed phrase or private key.",
    severity: "critical"
  }
];

export const phase4Quiz = [
  {
    question: "Which key should stay secret?",
    options: ["Private key", "Public key", "Wallet address", "Transaction hash"],
    answer: "Private key"
  },
  {
    question: "What is a wallet address mainly used for?",
    options: ["Receiving tokens", "Revealing your seed phrase", "Editing old blocks", "Deleting signatures"],
    answer: "Receiving tokens"
  },
  {
    question: "What authorizes a transaction?",
    options: ["A signature made with the private key", "Only the receiver address", "A theme toggle", "A public announcement"],
    answer: "A signature made with the private key"
  },
  {
    question: "What should you do with a seed phrase?",
    options: ["Store it securely offline", "Post it in chat", "Email it to support", "Use it as a username"],
    answer: "Store it securely offline"
  },
  {
    question: "Why verify a receiver address?",
    options: ["Transfers can be irreversible", "It changes the font", "It creates a public key", "It repairs the chain"],
    answer: "Transfers can be irreversible"
  }
];
