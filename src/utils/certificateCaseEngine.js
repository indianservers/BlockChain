import { createHash } from "./blockchainEngine.js";

export function createCertificateCaseState() {
  const student = {
    name: "Aarav Sharma",
    studentId: "STU-2026-1042",
    email: "aarav@example.edu"
  };
  const certificate = {
    certificateId: "CERT-BC-FOUND-001",
    studentName: student.name,
    course: "Blockchain Foundations",
    institute: "IndianServers Blockchain Academy",
    issueDate: new Date().toISOString().slice(0, 10),
    grade: "A",
    instructor: "Dr. Meera Rao"
  };
  return {
    student,
    certificate,
    blockchainRegistry: {},
    revocationRegistry: {},
    verificationInput: certificate,
    verification: null,
    completed: false,
    events: [event("CaseStarted", "Digital certificate verification case initialized.")]
  };
}

export function certificateHash(certificate) {
  return createHash([
    certificate.certificateId,
    certificate.studentName,
    certificate.course,
    certificate.institute,
    certificate.issueDate,
    certificate.grade,
    certificate.instructor
  ].join("|"));
}

export function updateStudent(state, field, value) {
  const student = { ...state.student, [field]: value };
  return {
    ...state,
    student,
    certificate: field === "name" ? { ...state.certificate, studentName: value } : state.certificate
  };
}

export function updateCertificate(state, field, value) {
  return {
    ...state,
    certificate: { ...state.certificate, [field]: value }
  };
}

export function storeCertificateHash(state) {
  const hash = certificateHash(state.certificate);
  return {
    ...state,
    blockchainRegistry: {
      ...state.blockchainRegistry,
      [state.certificate.certificateId]: {
        hash,
        storedAt: new Date().toLocaleString(),
        issuer: state.certificate.institute
      }
    },
    verificationInput: state.certificate,
    events: [event("CertificateHashStored", `Stored hash for ${state.certificate.certificateId} on blockchain registry.`), ...state.events]
  };
}

export function updateVerificationInput(state, field, value) {
  return {
    ...state,
    verificationInput: { ...state.verificationInput, [field]: value }
  };
}

export function verifyCertificate(state) {
  const input = state.verificationInput;
  const computedHash = certificateHash(input);
  const registry = state.blockchainRegistry[input.certificateId];
  const revoked = Boolean(state.revocationRegistry[input.certificateId]);
  const valid = Boolean(registry) && registry.hash === computedHash && !revoked;
  const result = {
    computedHash,
    storedHash: registry?.hash ?? "",
    exists: Boolean(registry),
    hashMatches: Boolean(registry) && registry.hash === computedHash,
    revoked,
    valid,
    status: revoked ? "Revoked" : valid ? "Valid" : "Tampered or Not Found"
  };
  return {
    ...state,
    verification: result,
    completed: valid,
    events: [event("CertificateVerified", `Employer verification result: ${result.status}.`), ...state.events]
  };
}

export function tamperVerificationInput(state) {
  return updateVerificationInput(state, "grade", state.verificationInput.grade === "A" ? "B" : "A");
}

export function revokeCertificate(state) {
  return {
    ...state,
    revocationRegistry: {
      ...state.revocationRegistry,
      [state.certificate.certificateId]: {
        revokedAt: new Date().toLocaleString(),
        reason: "Issuer revoked certificate for demonstration."
      }
    },
    events: [event("CertificateRevoked", `${state.certificate.certificateId} added to revocation registry.`), ...state.events]
  };
}

function event(name, message) {
  return {
    id: crypto.randomUUID(),
    name,
    message,
    time: new Date().toLocaleTimeString()
  };
}
