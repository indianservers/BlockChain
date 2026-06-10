import { createHash } from "./blockchainEngine.js";

export function createLandRegistryState() {
  const property = {
    propertyId: `LAND-${createHash(`land:${Date.now()}:${Math.random()}`).slice(0, 8).toUpperCase()}`,
    surveyNumber: "SY-42/9A",
    location: "Hyderabad, Telangana",
    area: "2,400 sq ft",
    landUse: "Residential",
    geoHash: "tsk9-17a-plot"
  };
  const owner = {
    name: "Priya Reddy",
    wallet: walletAddress("priya"),
    kycStatus: "Verified"
  };
  const title = {
    documentId: "TITLE-2026-8842",
    registrar: "Telangana Digital Land Office",
    issuedDate: new Date().toISOString().slice(0, 10),
    documentText: "Registered residential plot title for survey SY-42/9A."
  };
  const titleHash = titleDocumentHash(property, owner, title);
  return {
    property,
    owner,
    buyer: {
      name: "Arjun Menon",
      wallet: walletAddress("arjun"),
      kycStatus: "Verified"
    },
    registrarNode: {
      name: "Government Registrar Node",
      online: true,
      approved: false
    },
    title,
    titleHash,
    saleAgreement: {
      buyerName: "Arjun Menon",
      sellerName: owner.name,
      price: 8500000,
      terms: "Full payment before mutation approval.",
      hash: ""
    },
    encumbrance: {
      hasLoan: false,
      hasCourtStay: false,
      taxDue: false
    },
    history: [
      mutation("TitleCreated", owner.name, owner.wallet, titleHash, "Initial title hash recorded.")
    ],
    verification: null,
    fraudCheck: null,
    completed: false,
    events: [event("PropertyRecordCreated", `${property.propertyId} digital land record created.`)]
  };
}

export function titleDocumentHash(property, owner, title) {
  return createHash(`${property.propertyId}|${property.surveyNumber}|${property.location}|${property.area}|${owner.name}|${owner.wallet}|${title.documentId}|${title.documentText}`);
}

export function saleAgreementHash(agreement, propertyId) {
  return createHash(`${propertyId}|${agreement.buyerName}|${agreement.sellerName}|${agreement.price}|${agreement.terms}`);
}

export function updateProperty(state, field, value) {
  return {
    ...state,
    property: { ...state.property, [field]: value }
  };
}

export function updateOwner(state, field, value) {
  return {
    ...state,
    owner: { ...state.owner, [field]: value }
  };
}

export function updateBuyer(state, field, value) {
  return {
    ...state,
    buyer: { ...state.buyer, [field]: value }
  };
}

export function updateSaleAgreement(state, field, value) {
  return {
    ...state,
    saleAgreement: { ...state.saleAgreement, [field]: field === "price" ? Number(value) : value }
  };
}

export function storeTitleHash(state) {
  const titleHash = titleDocumentHash(state.property, state.owner, state.title);
  return {
    ...state,
    titleHash,
    history: [
      mutation("TitleHashStored", state.owner.name, state.owner.wallet, titleHash, "Title document hash stored by registrar."),
      ...state.history
    ],
    events: [event("TitleHashStored", "Government registrar stored title hash on blockchain."), ...state.events]
  };
}

export function registrarApprove(state) {
  return {
    ...state,
    registrarNode: { ...state.registrarNode, approved: true },
    events: [event("RegistrarApproved", "Registrar node approved property for transfer verification."), ...state.events]
  };
}

export function buyerVerify(state) {
  const computed = titleDocumentHash(state.property, state.owner, state.title);
  const validTitle = computed === state.titleHash;
  const clear = !state.encumbrance.hasLoan && !state.encumbrance.hasCourtStay && !state.encumbrance.taxDue;
  return {
    ...state,
    verification: {
      validTitle,
      registrarApproved: state.registrarNode.approved,
      clear,
      status: validTitle && state.registrarNode.approved && clear ? "Verified for sale" : "Warning"
    },
    events: [event("BuyerVerification", validTitle && clear ? "Buyer verified title and encumbrance status." : "Buyer verification found warning."), ...state.events]
  };
}

export function generateSaleAgreement(state) {
  const hash = saleAgreementHash(state.saleAgreement, state.property.propertyId);
  return {
    ...state,
    saleAgreement: { ...state.saleAgreement, hash },
    events: [event("SaleAgreementHashed", "Sale agreement hash generated."), ...state.events]
  };
}

export function transferOwnership(state) {
  const verification = state.verification ?? buyerVerify(state).verification;
  const agreementHash = state.saleAgreement.hash || saleAgreementHash(state.saleAgreement, state.property.propertyId);
  if (verification.status !== "Verified for sale") {
    return {
      ...state,
      events: [event("TransferRejected", "Ownership transfer blocked by verification warning."), ...state.events]
    };
  }
  const newOwner = {
    name: state.buyer.name,
    wallet: state.buyer.wallet,
    kycStatus: state.buyer.kycStatus
  };
  const newTitleHash = createHash(`${state.titleHash}|${agreementHash}|${newOwner.wallet}`);
  return {
    ...state,
    owner: newOwner,
    titleHash: newTitleHash,
    completed: true,
    history: [
      mutation("OwnershipTransferred", newOwner.name, newOwner.wallet, newTitleHash, `Sale agreement ${agreementHash.slice(0, 12)}... executed.`),
      ...state.history
    ],
    events: [event("OwnershipTransferred", `Property transferred to ${newOwner.name}.`), ...state.events]
  };
}

export function tamperLandRecord(state) {
  return {
    ...state,
    property: { ...state.property, area: "3,000 sq ft" },
    fraudCheck: {
      status: "Tampered",
      message: "Area was changed without updating the stored title hash."
    },
    events: [event("FraudAttempt", "Property area tampered without registrar mutation."), ...state.events]
  };
}

export function runFraudCheck(state) {
  const computed = titleDocumentHash(state.property, state.owner, state.title);
  const valid = computed === state.titleHash;
  return {
    ...state,
    fraudCheck: {
      status: valid ? "Clean" : "Tampered",
      message: valid ? "Stored title hash matches current record." : "Current record does not match stored title hash."
    },
    events: [event("FraudCheck", valid ? "Fraud check passed." : "Fraud check detected hash mismatch."), ...state.events]
  };
}

export function toggleEncumbrance(state, field) {
  const encumbrance = { ...state.encumbrance, [field]: !state.encumbrance[field] };
  return {
    ...state,
    encumbrance,
    events: [event("EncumbranceUpdated", `${field} set to ${encumbrance[field]}.`), ...state.events]
  };
}

function mutation(action, ownerName, wallet, hash, note) {
  return {
    id: crypto.randomUUID(),
    action,
    ownerName,
    wallet,
    hash,
    note,
    time: new Date().toLocaleString()
  };
}

function walletAddress(seed) {
  return `0x${createHash(`land-wallet:${seed}`).slice(0, 40)}`;
}

function event(name, message) {
  return {
    id: crypto.randomUUID(),
    name,
    message,
    time: new Date().toLocaleTimeString()
  };
}
