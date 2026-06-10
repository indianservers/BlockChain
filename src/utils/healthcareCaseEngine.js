import { createHash } from "./blockchainEngine.js";

export function createHealthcareCaseState() {
  const patient = {
    name: "Nisha Kumar",
    wallet: walletAddress("patient-nisha"),
    consentStatus: "No active consent"
  };
  const hospital = {
    name: "CityCare Hospital",
    nodeId: "HOSP-NODE-204",
    recordId: "MED-REC-2026-441",
    recordSummary: "Annual health checkup, blood panel, allergy history.",
    labReport: "Hemoglobin normal; cholesterol borderline; vitamin D low."
  };
  const doctor = {
    name: "Dr. Arjun Iyer",
    wallet: walletAddress("doctor-arjun"),
    department: "Cardiology"
  };
  const recordHash = medicalRecordHash(hospital);
  const labHash = labReportHash(hospital.labReport);
  return {
    patient,
    hospital,
    doctor,
    recordHash,
    labHash,
    accessRequest: null,
    permission: null,
    unauthorizedAttempt: null,
    labVerification: null,
    completed: false,
    audit: [audit("RecordHashStored", `${hospital.name} stored medical record hash ${recordHash.slice(0, 12)}...`)]
  };
}

export function medicalRecordHash(hospital) {
  return createHash(`${hospital.recordId}|${hospital.recordSummary}|${hospital.name}|${hospital.nodeId}`);
}

export function labReportHash(report) {
  return createHash(`lab:${report}`);
}

export function updatePatient(state, field, value) {
  return { ...state, patient: { ...state.patient, [field]: value } };
}

export function updateHospital(state, field, value) {
  const hospital = { ...state.hospital, [field]: value };
  return {
    ...state,
    hospital,
    recordHash: medicalRecordHash(hospital),
    labHash: labReportHash(hospital.labReport)
  };
}

export function updateDoctor(state, field, value) {
  return { ...state, doctor: { ...state.doctor, [field]: value } };
}

export function requestDoctorAccess(state, purpose = "Review medical record for consultation") {
  const request = {
    id: crypto.randomUUID(),
    doctor: state.doctor.name,
    doctorWallet: state.doctor.wallet,
    purpose,
    requestedAt: Date.now(),
    status: "Pending"
  };
  return {
    ...state,
    accessRequest: request,
    audit: [audit("AccessRequested", `${state.doctor.name} requested access: ${purpose}.`), ...state.audit]
  };
}

export function grantAccess(state, minutes = 15) {
  if (!state.accessRequest) return state;
  const now = Date.now();
  const permission = {
    doctorWallet: state.accessRequest.doctorWallet,
    grantedBy: state.patient.wallet,
    grantedAt: now,
    expiresAt: now + Number(minutes) * 60 * 1000,
    active: true,
    purpose: state.accessRequest.purpose
  };
  return {
    ...state,
    patient: { ...state.patient, consentStatus: `Access granted for ${minutes} minutes` },
    accessRequest: { ...state.accessRequest, status: "Granted" },
    permission,
    completed: true,
    audit: [audit("AccessGranted", `${state.patient.name} granted access to ${state.doctor.name} for ${minutes} minutes.`), ...state.audit]
  };
}

export function revokeAccess(state) {
  if (!state.permission) return state;
  return {
    ...state,
    patient: { ...state.patient, consentStatus: "Access revoked" },
    permission: { ...state.permission, active: false },
    audit: [audit("AccessRevoked", `${state.patient.name} revoked doctor access.`), ...state.audit]
  };
}

export function expireAccessNow(state) {
  if (!state.permission) return state;
  return {
    ...state,
    patient: { ...state.patient, consentStatus: "Access expired" },
    permission: { ...state.permission, expiresAt: Date.now() - 1000 },
    audit: [audit("AccessExpired", "Permission expiry timer reached zero."), ...state.audit]
  };
}

export function checkAccess(state, wallet = state.doctor.wallet) {
  const allowed = Boolean(
    state.permission &&
    state.permission.active &&
    state.permission.doctorWallet === wallet &&
    state.permission.expiresAt > Date.now()
  );
  return {
    ...state,
    unauthorizedAttempt: {
      wallet,
      allowed,
      checkedAt: new Date().toLocaleTimeString(),
      message: allowed ? "Access allowed by active patient consent." : "Unauthorized access rejected."
    },
    audit: [audit(allowed ? "AccessAllowed" : "UnauthorizedRejected", allowed ? "Doctor accessed record under active consent." : `Rejected wallet ${wallet.slice(0, 10)}...`), ...state.audit]
  };
}

export function verifyLabReport(state, report = state.hospital.labReport) {
  const computed = labReportHash(report);
  const valid = computed === state.labHash;
  return {
    ...state,
    labVerification: {
      computed,
      stored: state.labHash,
      valid,
      status: valid ? "Lab report verified" : "Lab report tampered"
    },
    audit: [audit("LabReportVerified", valid ? "Lab report hash matches stored hospital hash." : "Lab report hash mismatch detected."), ...state.audit]
  };
}

export function tamperLabReport(state) {
  return {
    ...state,
    hospital: { ...state.hospital, labReport: `${state.hospital.labReport} Altered value.` },
    audit: [audit("LabTamperDemo", "Lab report text changed without updating stored hash."), ...state.audit]
  };
}

export function permissionRemaining(permission) {
  if (!permission) return 0;
  return Math.max(0, Math.ceil((permission.expiresAt - Date.now()) / 60000));
}

function walletAddress(seed) {
  return `0x${createHash(`health:${seed}`).slice(0, 40)}`;
}

function audit(action, message) {
  return {
    id: crypto.randomUUID(),
    action,
    message,
    time: new Date().toLocaleTimeString()
  };
}
