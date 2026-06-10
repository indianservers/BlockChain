import { createHash } from "./blockchainEngine.js";

export const checkpointStages = [
  "Manufacturer",
  "Warehouse",
  "Port",
  "Customs",
  "Distributor",
  "Retail / Customer"
];

export function createSupplyChainCaseState() {
  const product = {
    id: `PROD-${createHash(`product:${Date.now()}:${Math.random()}`).slice(0, 8).toUpperCase()}`,
    name: "Organic Coffee Batch",
    origin: "Chikmagalur, India",
    batch: `BATCH-${Math.floor(1000 + Math.random() * 8999)}`,
    manufacturer: "IndianServers Agro Co.",
    createdAt: new Date().toLocaleString()
  };
  return {
    product,
    checkpoints: [],
    qrScan: null,
    completed: false,
    events: [event("ProductIdentityCreated", `${product.name} identity created on-chain.`)]
  };
}

export function addSupplyCheckpoint(state, stage, actor, location, note = "") {
  const previousHash = state.checkpoints.at(-1)?.hash ?? createHash(JSON.stringify(state.product));
  const base = {
    id: state.checkpoints.length + 1,
    stage,
    actor,
    location,
    note,
    timestamp: new Date().toLocaleString(),
    previousHash
  };
  const checkpoint = {
    ...base,
    hash: checkpointHash(base)
  };
  const checkpoints = [...state.checkpoints, checkpoint];
  return {
    ...state,
    checkpoints,
    completed: checkpoints.length >= checkpointStages.length && validateSupplyChain({ ...state, checkpoints }).invalidCount === 0,
    events: [event("CheckpointRecorded", `${stage} checkpoint recorded by ${actor}.`), ...state.events]
  };
}

export function addNextCheckpoint(state) {
  const stage = checkpointStages[state.checkpoints.length];
  if (!stage) return state;
  const defaults = {
    Manufacturer: ["Factory QA Team", "Chikmagalur Factory", "Batch packed and quality checked."],
    Warehouse: ["Warehouse Operator", "Bengaluru Warehouse", "Inventory received and sealed."],
    Port: ["Port Authority", "Chennai Port", "Container loaded for export."],
    Customs: ["Customs Officer", "Chennai Customs", "Documents and seal verified."],
    Distributor: ["Distribution Partner", "Hyderabad Hub", "Shipment received by distributor."],
    "Retail / Customer": ["Retail Store", "Hyderabad Retail", "Customer scanned product QR."]
  };
  const [actor, location, note] = defaults[stage];
  return addSupplyCheckpoint(state, stage, actor, location, note);
}

export function tamperCheckpoint(state, id, field, value) {
  return {
    ...state,
    checkpoints: state.checkpoints.map(checkpoint =>
      checkpoint.id === id ? { ...checkpoint, [field]: value, tampered: true } : checkpoint
    ),
    events: [event("TamperAttempt", `Checkpoint #${id} ${field} changed without updating hash.`), ...state.events]
  };
}

export function repairSupplyChain(state) {
  const checkpoints = state.checkpoints.reduce((records, checkpoint, index) => {
    const previousHash = index === 0 ? createHash(JSON.stringify(state.product)) : records[index - 1].hash;
    const base = { ...checkpoint, previousHash };
    delete base.hash;
    delete base.tampered;
    records.push({ ...base, hash: checkpointHash(base) });
    return records;
  }, []);
  return {
    ...state,
    checkpoints,
    completed: checkpoints.length >= checkpointStages.length,
    events: [event("TraceRepaired", "Checkpoint hashes recalculated for demonstration."), ...state.events]
  };
}

export function validateSupplyChain(state) {
  const productHash = createHash(JSON.stringify(state.product));
  const results = state.checkpoints.map((checkpoint, index) => {
    const expectedPreviousHash = index === 0 ? productHash : state.checkpoints[index - 1].hash;
    const base = { ...checkpoint };
    delete base.hash;
    delete base.tampered;
    const expectedHash = checkpointHash(base);
    const hashValid = checkpoint.hash === expectedHash;
    const linkValid = checkpoint.previousHash === expectedPreviousHash;
    return {
      id: checkpoint.id,
      valid: hashValid && linkValid,
      hashValid,
      linkValid,
      expectedHash,
      expectedPreviousHash
    };
  });
  return {
    results,
    invalidCount: results.filter(result => !result.valid).length,
    firstInvalid: results.find(result => !result.valid)?.id ?? null
  };
}

export function simulateQrVerification(state) {
  const validation = validateSupplyChain(state);
  const authentic = state.checkpoints.length >= checkpointStages.length && validation.invalidCount === 0;
  return {
    ...state,
    qrScan: {
      scannedAt: new Date().toLocaleString(),
      authentic,
      message: authentic
        ? "QR verified: product trace is complete and hash-linked."
        : "QR warning: trace is incomplete or tampered."
    },
    completed: authentic,
    events: [event("QRScanned", authentic ? "Customer verified authentic product." : "Customer scan found traceability warning."), ...state.events]
  };
}

function checkpointHash(checkpoint) {
  return createHash(`${checkpoint.id}|${checkpoint.stage}|${checkpoint.actor}|${checkpoint.location}|${checkpoint.note}|${checkpoint.timestamp}|${checkpoint.previousHash}`);
}

function event(name, message) {
  return {
    id: crypto.randomUUID(),
    name,
    message,
    time: new Date().toLocaleTimeString()
  };
}
