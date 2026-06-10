const storageKeys = {
  theme: "bfv-theme",
  progress: "bfv-progress",
  quizScore: "bfv-quiz-score"
};

const components = [
  {
    title: "Block",
    icon: "▣",
    intro: "A container that stores ledger information.",
    definition: "A block is a package of records plus details that identify and connect it to the blockchain.",
    analogy: "Like one page in a notebook where several entries are written together.",
    example: "A payment block may contain many transfers made during a short time period."
  },
  {
    title: "Chain",
    icon: "⛓",
    intro: "The ordered connection between blocks.",
    definition: "A chain is the sequence of blocks linked from oldest to newest.",
    analogy: "Like numbered pages in a book where page 5 follows page 4.",
    example: "Block 103 points back to block 102, which points back to block 101."
  },
  {
    title: "Node",
    icon: "◎",
    intro: "A participant computer in the network.",
    definition: "A node is a device that stores, checks, or shares blockchain information.",
    analogy: "Like a classmate who keeps their own copy of a shared project notebook.",
    example: "A node receives a new transaction and forwards it to other nodes."
  },
  {
    title: "Ledger",
    icon: "☷",
    intro: "The record book of activity.",
    definition: "A ledger is a list of records showing what happened and in what order.",
    analogy: "Like a bank passbook or attendance register.",
    example: "A ledger can show that A sent 5 tokens to B at 10:30 AM."
  },
  {
    title: "Hash",
    icon: "#",
    intro: "A digital fingerprint for data.",
    definition: "A hash is a fixed-looking code produced from data. If the data changes, the hash changes.",
    analogy: "Like a unique fingerprint for a document.",
    example: "Changing one letter in a record creates a different hash value."
  },
  {
    title: "Transaction",
    icon: "⇄",
    intro: "An action recorded on the ledger.",
    definition: "A transaction is a record of something being created, moved, approved, or updated.",
    analogy: "Like a receipt showing a purchase.",
    example: "A buyer sends payment to a seller, and the transfer becomes a transaction."
  },
  {
    title: "Consensus",
    icon: "✓",
    intro: "Agreement before updates are accepted.",
    definition: "Consensus is the process nodes use to agree that a new record is valid.",
    analogy: "Like a group vote before adding a final answer to a shared sheet.",
    example: "Nodes check that a transaction follows the rules before adding it."
  },
  {
    title: "Immutability",
    icon: "◆",
    intro: "Records become difficult to alter.",
    definition: "Immutability means past records are designed to resist unnoticed changes.",
    analogy: "Like writing in permanent ink and giving copies to many people.",
    example: "If one old block is edited, its hash changes and the following links no longer match."
  }
];

const useCases = [
  ["₿", "Cryptocurrency", "Digital money can move between people without one central payment controller.", "A student sends crypto to a friend, and the transfer is recorded on a public blockchain."],
  ["📦", "Supply Chain", "Products can be tracked as they move from source to store.", "A coffee bag records farm origin, shipping checkpoint, warehouse arrival, and store delivery."],
  ["✚", "Healthcare Records", "Important medical events can be shared securely between approved parties.", "A hospital and clinic verify the same vaccination record without retyping it."],
  ["⌂", "Land Registration", "Property ownership history can be recorded in a tamper-resistant way.", "A land office records each sale so future buyers can inspect ownership history."],
  ["☑", "Voting", "Votes can be recorded with audit trails that are easier to verify.", "A student election uses a blockchain-style ledger to show that each eligible voter voted once."],
  ["★", "Digital Certificates", "Certificates can be verified without calling the issuing institution.", "An employer checks that a course certificate hash matches the issuer's record."],
  ["💳", "Banking and Payments", "Payments and settlements can be shared across institutions.", "Two banks update a shared ledger after a cross-border transfer is confirmed."],
  ["⚙", "Smart Contracts", "Rules can run automatically when conditions are met.", "A rental deposit is released automatically when both parties confirm checkout." ]
];

const quizQuestions = [
  {
    question: "What does blockchain mainly store data in?",
    options: ["Folders", "Blocks", "Slides", "Tables only"],
    answer: "Blocks"
  },
  {
    question: "What does distributed mean in blockchain?",
    options: ["Stored by only one person", "Shared across many participants", "Deleted after reading", "Hidden from all users"],
    answer: "Shared across many participants"
  },
  {
    question: "What is a ledger?",
    options: ["A record book", "A password", "A screen size", "A computer cable"],
    answer: "A record book"
  },
  {
    question: "Why is blockchain difficult to tamper with?",
    options: ["Records are linked and copied across nodes", "It has no records", "Only one person can see it", "It uses bigger fonts"],
    answer: "Records are linked and copied across nodes"
  },
  {
    question: "What is a node?",
    options: ["A network participant", "A color theme", "A page heading", "A type of mouse"],
    answer: "A network participant"
  },
  {
    question: "What does a hash act like?",
    options: ["A digital fingerprint", "A keyboard shortcut", "A cloud folder", "A battery"],
    answer: "A digital fingerprint"
  },
  {
    question: "What connects one block to the previous block?",
    options: ["Previous hash", "Screen brightness", "Username only", "File size"],
    answer: "Previous hash"
  },
  {
    question: "What is consensus?",
    options: ["Network agreement", "A private diary", "A design color", "A random guess"],
    answer: "Network agreement"
  },
  {
    question: "Which system usually has one main authority?",
    options: ["Traditional database", "Distributed blockchain", "Peer-to-peer network", "Public ledger"],
    answer: "Traditional database"
  },
  {
    question: "What happens when a new valid record is added to a distributed ledger?",
    options: ["Participants receive updated copies", "All old records disappear", "Only the title changes", "The network shuts down"],
    answer: "Participants receive updated copies"
  }
];

const flowAnswer = [
  "Transaction Created",
  "Transaction Shared with Network",
  "Network Validates",
  "Block Created",
  "Block Added to Chain",
  "Ledger Updated"
];

const state = {
  completedSections: new Set(JSON.parse(localStorage.getItem(storageKeys.progress) || "[]")),
  quizIndex: 0,
  quizScore: 0,
  answeredCurrent: false,
  ledgerRecords: ["Genesis record"],
  draggedItem: null
};

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];

// Bootstraps the module from static data so future phases can add new sections easily.
function init() {
  applyStoredTheme();
  renderComponents();
  renderNetwork("database");
  renderLedgerNodes();
  renderUseCases();
  renderQuiz();
  renderFlowItems(shuffle([...flowAnswer]));
  bindEvents();
  observeSections();
  updateProgressDisplay();
}

function applyStoredTheme() {
  const storedTheme = localStorage.getItem(storageKeys.theme);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
    document.body.classList.add("dark");
  }
}

function bindEvents() {
  qs(".theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(storageKeys.theme, document.body.classList.contains("dark") ? "dark" : "light");
  });

  const navToggle = qs(".nav-toggle");
  const navLinks = qs(".nav-links");
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  qsa(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  qsa("[data-network]").forEach(button => {
    button.addEventListener("click", () => {
      qsa("[data-network]").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      renderNetwork(button.dataset.network);
    });
  });

  qs("#addRecordBtn").addEventListener("click", addRecord);
  qs("#resetLedgerBtn").addEventListener("click", resetLedger);
  qs("#nextQuestionBtn").addEventListener("click", nextQuestion);
  qs("#restartQuizBtn").addEventListener("click", restartQuiz);
  qs("#checkFlowBtn").addEventListener("click", checkFlow);
  qs("#shuffleFlowBtn").addEventListener("click", () => {
    renderFlowItems(shuffle([...flowAnswer]));
    setFeedback(qs("#flowFeedback"), "", "");
  });

  qs(".modal-close").addEventListener("click", closeModal);
  qs("#componentModal").addEventListener("click", event => {
    if (event.target.id === "componentModal") closeModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", () => {
    const active = qs("[data-network].active")?.dataset.network || "database";
    renderNetwork(active);
  });
}

// Component cards share one accessible modal instead of creating many hidden dialogs.
function renderComponents() {
  const grid = qs("#componentGrid");
  grid.innerHTML = components.map((item, index) => `
    <button class="component-card" type="button" data-component="${index}">
      <span class="card-icon" aria-hidden="true">${item.icon}</span>
      <h3>${item.title}</h3>
      <p>${item.intro}</p>
    </button>
  `).join("");

  qsa(".component-card", grid).forEach(card => {
    card.addEventListener("click", () => openComponentModal(components[Number(card.dataset.component)]));
  });
}

function openComponentModal(item) {
  qs("#modalTitle").textContent = item.title;
  qs("#modalDefinition").textContent = item.definition;
  qs("#modalAnalogy").textContent = item.analogy;
  qs("#modalExample").textContent = item.example;
  qs("#componentModal").classList.remove("hidden");
  qs(".modal-close").focus();
}

function closeModal() {
  qs("#componentModal").classList.add("hidden");
}

// Draws either a centralized server model or a peer-to-peer blockchain model.
function renderNetwork(type) {
  const visual = qs("#networkVisual");
  visual.innerHTML = "";

  if (type === "database") {
    const server = createNode("server", "Central Server");
    visual.append(server);
    const users = [
      { label: "User A", x: 12, y: 16 },
      { label: "User B", x: 72, y: 18 },
      { label: "User C", x: 14, y: 70 },
      { label: "User D", x: 72, y: 68 }
    ];
    users.forEach(user => {
      const node = createNode("network-node", user.label);
      place(node, user.x, user.y);
      visual.append(node);
      connectElements(visual, node, server);
    });
    return;
  }

  const nodes = [
    { label: "Node 1 Ledger", x: 42, y: 8 },
    { label: "Node 2 Ledger", x: 76, y: 30 },
    { label: "Node 3 Ledger", x: 62, y: 72 },
    { label: "Node 4 Ledger", x: 20, y: 72 },
    { label: "Node 5 Ledger", x: 8, y: 30 }
  ].map(item => {
    const node = createNode("network-node", item.label);
    place(node, item.x, item.y);
    visual.append(node);
    return node;
  });

  nodes.forEach((node, index) => {
    connectElements(visual, node, nodes[(index + 1) % nodes.length]);
    connectElements(visual, node, nodes[(index + 2) % nodes.length]);
  });
}

function createNode(className, label) {
  const node = document.createElement("div");
  node.className = className;
  node.textContent = label;
  return node;
}

function place(element, leftPercent, topPercent) {
  element.style.left = `${leftPercent}%`;
  element.style.top = `${topPercent}%`;
}

function connectElements(container, from, to) {
  requestAnimationFrame(() => {
    const parent = container.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const ax = a.left + a.width / 2 - parent.left;
    const ay = a.top + a.height / 2 - parent.top;
    const bx = b.left + b.width / 2 - parent.left;
    const by = b.top + b.height / 2 - parent.top;
    const length = Math.hypot(bx - ax, by - ay);
    const angle = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
    const line = document.createElement("span");
    line.className = "connection";
    line.style.left = `${ax}px`;
    line.style.top = `${ay}px`;
    line.style.width = `${length}px`;
    line.style.transform = `rotate(${angle}deg)`;
    container.prepend(line);
  });
}

// All nodes render from the same ledger array to demonstrate synchronized copies.
function renderLedgerNodes() {
  const grid = qs("#nodeGrid");
  grid.innerHTML = Array.from({ length: 5 }, (_, index) => `
    <article class="node-card">
      <h3><span>Node ${index + 1}</span><span>Copy</span></h3>
      <ul class="ledger-list">
        ${state.ledgerRecords.map((record, recordIndex) => `<li class="${recordIndex === state.ledgerRecords.length - 1 ? "new-record" : ""}">${record}</li>`).join("")}
      </ul>
    </article>
  `).join("");
}

function addRecord() {
  const nextNumber = state.ledgerRecords.length;
  const record = `Record ${nextNumber}: verified entry ${String(nextNumber).padStart(2, "0")}`;
  state.ledgerRecords.push(record);
  renderLedgerNodes();
  qs("#ledgerMessage").textContent = "Every participant receives the updated ledger copy.";
}

function resetLedger() {
  state.ledgerRecords = ["Genesis record"];
  renderLedgerNodes();
  qs("#ledgerMessage").textContent = "Each node starts with the same ledger copy.";
}

function renderUseCases() {
  const grid = qs("#usecaseGrid");
  grid.innerHTML = useCases.map(([icon, title, text, example], index) => `
    <article class="usecase-card">
      <span class="card-icon" aria-hidden="true">${icon}</span>
      <h3>${title}</h3>
      <p>${text}</p>
      <button class="secondary-action" type="button" data-usecase="${index}">View Example</button>
    </article>
  `).join("");

  qsa("[data-usecase]", grid).forEach(button => {
    button.addEventListener("click", () => {
      const [, title, , example] = useCases[Number(button.dataset.usecase)];
      qs("#examplePanel").innerHTML = `<strong>${title} example</strong><p>${example}</p>`;
    });
  });
}

// Quiz state is intentionally small so it can be reset or extended without routing.
function renderQuiz() {
  const question = quizQuestions[state.quizIndex];
  qs("#questionCounter").textContent = `Question ${Math.min(state.quizIndex + 1, quizQuestions.length)} of ${quizQuestions.length}`;
  qs("#scoreTracker").textContent = `Score: ${state.quizScore}`;
  qs("#questionText").textContent = question ? question.question : "Quiz complete";
  qs("#quizFeedback").textContent = "";
  qs("#quizFeedback").className = "feedback";
  qs("#nextQuestionBtn").disabled = true;
  state.answeredCurrent = false;

  const optionsGrid = qs("#optionsGrid");
  if (!question) {
    const percent = Math.round((state.quizScore / quizQuestions.length) * 100);
    qs("#questionText").textContent = `Final score: ${state.quizScore}/${quizQuestions.length} (${percent}%)`;
    optionsGrid.innerHTML = "";
    qs("#nextQuestionBtn").classList.add("hidden");
    qs("#restartQuizBtn").classList.remove("hidden");
    localStorage.setItem(storageKeys.quizScore, String(state.quizScore));
    return;
  }

  qs("#nextQuestionBtn").classList.remove("hidden");
  qs("#restartQuizBtn").classList.add("hidden");
  optionsGrid.innerHTML = question.options.map(option => `
    <button class="option-button" type="button">${option}</button>
  `).join("");

  qsa(".option-button", optionsGrid).forEach(button => {
    button.addEventListener("click", () => answerQuestion(button, question.answer));
  });
}

function answerQuestion(button, correctAnswer) {
  if (state.answeredCurrent) return;
  state.answeredCurrent = true;
  const isCorrect = button.textContent === correctAnswer;
  if (isCorrect) state.quizScore += 1;

  qsa(".option-button").forEach(option => {
    option.disabled = true;
    if (option.textContent === correctAnswer) option.classList.add("correct");
  });

  if (!isCorrect) button.classList.add("wrong");
  setFeedback(
    qs("#quizFeedback"),
    isCorrect ? "Correct. Nice work." : `Not quite. The correct answer is: ${correctAnswer}.`,
    isCorrect ? "success" : "error"
  );
  qs("#scoreTracker").textContent = `Score: ${state.quizScore}`;
  qs("#nextQuestionBtn").disabled = false;
}

function nextQuestion() {
  state.quizIndex += 1;
  renderQuiz();
}

function restartQuiz() {
  state.quizIndex = 0;
  state.quizScore = 0;
  renderQuiz();
}

// Supports mouse drag and keyboard reordering for the blockchain flow activity.
function renderFlowItems(items) {
  const list = qs("#dragList");
  list.innerHTML = items.map(item => `
    <li class="drag-item" draggable="true" tabindex="0">
      <span class="drag-handle" aria-hidden="true">☰</span>
      <span>${item}</span>
    </li>
  `).join("");

  qsa(".drag-item", list).forEach(item => {
    item.addEventListener("dragstart", () => {
      state.draggedItem = item;
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      state.draggedItem = null;
    });
    item.addEventListener("keydown", event => moveFlowItemWithKeyboard(event, item));
  });

  list.addEventListener("dragover", event => {
    event.preventDefault();
    const afterElement = getDragAfterElement(list, event.clientY);
    if (!state.draggedItem) return;
    if (afterElement == null) {
      list.appendChild(state.draggedItem);
    } else {
      list.insertBefore(state.draggedItem, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  return qsa(".drag-item:not(.dragging)", container).reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function moveFlowItemWithKeyboard(event, item) {
  if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  const sibling = event.key === "ArrowUp" ? item.previousElementSibling : item.nextElementSibling;
  if (!sibling) return;
  if (event.key === "ArrowUp") {
    item.parentNode.insertBefore(item, sibling);
  } else {
    item.parentNode.insertBefore(sibling, item);
  }
  item.focus();
}

function checkFlow() {
  const current = qsa(".drag-item span:last-child").map(item => item.textContent);
  const isCorrect = current.every((item, index) => item === flowAnswer[index]);
  setFeedback(
    qs("#flowFeedback"),
    isCorrect ? "Correct sequence. The ledger flow is ready." : "Some steps are out of order. Try again from transaction to ledger update.",
    isCorrect ? "success" : "error"
  );
}

// Section visibility drives saved learning progress and navigation highlighting.
function observeSections() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      state.completedSections.add(id);
      localStorage.setItem(storageKeys.progress, JSON.stringify([...state.completedSections]));
      updateProgressDisplay();
      highlightActiveNav(id);
    });
  }, { threshold: 0.45 });

  qsa(".section-track").forEach(section => observer.observe(section));
}

function updateProgressDisplay() {
  const total = qsa(".section-track").length;
  const completed = Math.min(state.completedSections.size, total);
  qs("#completionText").textContent = `${completed} of ${total} sections completed`;
  qs("#savedStatus").textContent = `Progress saved: ${completed}/${total}`;
  updateScrollProgress();
}

function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  const completionPercent = (state.completedSections.size / qsa(".section-track").length) * 100;
  qs("#progressBar").style.width = `${Math.max(scrollPercent, completionPercent)}%`;
}

function highlightActiveNav(id) {
  qsa(".nav-links a").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

function setFeedback(element, message, type) {
  element.textContent = message;
  element.className = `feedback ${type}`.trim();
}

function shuffle(items) {
  return items
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(item => item.value);
}

init();
