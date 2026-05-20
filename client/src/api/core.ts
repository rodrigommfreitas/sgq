import { api } from "./axios";
import type {
  MacroProcessSummary,
  ProcessHierarchyResponse,
  IndicatorWithProcesses,
  MacroProcess,
  SingletonDocumentResponse,
  LeadershipCommitmentResponse,
  LeadershipCommitmentYearDetail,
  AwarenessResponse,
  AwarenessYearDetail,
  YearResponse,
  DocumentWithVersionsResponse,
  ChangeResponse,
  ChangeRequest,
  InterestedPartyResponse,
  CreateInterestedPartyRequest,
  UpdateInterestedPartyRequest,
  ProcessOptionResponse,
} from "@/types.ts";

export const getMacroProcessHierarchy = async (yearId: number): Promise<ProcessHierarchyResponse> => {
  const res = await api.get(`/macroprocess-hierarchy/${yearId}`);
  return res.data;
};

export const getMacroProcesses = async (yearId: number): Promise<MacroProcess[]> => {
  const res = await api.get("/macroprocesses", { params: { yearId } });
  return res.data;
};

export const createMacroProcess = async (data: { name: string; yearId: number }) => {
  const res = await api.post("/macroprocesses", data);
  return res.data;
};

export const createProcess = async (data: {
  name: string;
  objective?: string;
  ownerId?: number | null;
  yearId: number;
  macroProcessYearId?: number | null;
}) => {
  const res = await api.post("/processes", data);
  return res.data;
};

export const deleteMacroProcess = async (id: number) => {
  await api.delete(`/macroprocesses/${id}`);
};

export const deleteProcess = async (id: number) => {
  await api.delete(`/processes/${id}`);
};

export const moveProcess = async (processId: number, macroProcessId: number | null) => {
  await api.put(`/processes/${processId}/macroprocess`, { macroProcessId });
};

export const getIndicatorsByYear = async (yearId: number): Promise<IndicatorWithProcesses[]> => {
  const res = await api.get(`/indicators/year/${yearId}`);
  return res.data;
};

export const getIndicatorsSimple = async (yearId: number): Promise<IndicatorWithProcesses[]> => {
  const res = await api.get(`/indicators/year/${yearId}/options`);
  return res.data;
};

/* SINGLETON DOCUMENT HELPERS */

async function uploadSingletonDocument(
  endpoint: string,
  file: File,
  version: number,
  uploadedById: number,
  existingDocumentId?: number | null,
): Promise<SingletonDocumentResponse> {
  const formData = new FormData();
  const data = JSON.stringify({
    documentId: existingDocumentId ?? null,
    versioned: true,
    version,
    requiresApproval: true,
    uploadedById,
  });
  formData.append("data", new Blob([data], { type: "application/json" }));
  formData.append("file", file);
  const res = await api.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

async function getSingleton(path: string): Promise<SingletonDocumentResponse> {
  const res = await api.get(path);
  return res.data;
}

async function updateSingleton(path: string, data: { description: string }): Promise<SingletonDocumentResponse> {
  const res = await api.patch(path, data);
  return res.data;
}

/* SCOPE */

export const getScope = () => getSingleton("/scope");
export const updateScope = (data: { description: string }) => updateSingleton("/scope", data);
export const uploadScopeDocument = (
  file: File, version: number, uploadedById: number, existingDocumentId?: number | null,
) => uploadSingletonDocument("/scope/document", file, version, uploadedById, existingDocumentId);

/* SYSTEM POLICY */

export const getSystemPolicy = () => getSingleton("/system-policy");
export const updateSystemPolicy = (data: { description: string }) => updateSingleton("/system-policy", data);
export const uploadSystemPolicyDocument = (
  file: File, version: number, uploadedById: number, existingDocumentId?: number | null,
) => uploadSingletonDocument("/system-policy/document", file, version, uploadedById, existingDocumentId);

/* RESPONSIBILITY & AUTHORITY */

export const getResponsibilityAuthority = () => getSingleton("/responsibility-authority");
export const updateResponsibilityAuthority = (data: { description: string }) => updateSingleton("/responsibility-authority", data);
export const uploadResponsibilityAuthorityDocument = (
  file: File, version: number, uploadedById: number, existingDocumentId?: number | null,
) => uploadSingletonDocument("/responsibility-authority/document", file, version, uploadedById, existingDocumentId);

/* DOCUMENT VERSIONS */

export const approveDocumentVersion = async (versionId: number): Promise<void> => {
  await api.post(`/documents/versions/${versionId}/approve`);
};

export const deleteDocumentVersion = async (versionId: number): Promise<void> => {
  await api.delete(`/documents/versions/${versionId}`);
};

export const deleteDocument = async (documentId: number): Promise<void> => {
  await api.delete(`/documents/${documentId}`);
};

export const downloadDocumentVersion = async (versionId: number, fileName: string): Promise<void> => {
  const res = await api.get(`/documents/versions/${versionId}/download/${fileName}`, {
    responseType: "blob",
  });

  const cleanName = stripUuidSuffix(fileName);

  const url = window.URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = cleanName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export function stripUuidSuffix(name: string): string {
  const uuidPattern = /_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  return name.replace(uuidPattern, "");
}

/* YEARS */

export const getYears = async (): Promise<YearResponse[]> => {
  const res = await api.get("/years");
  return res.data;
};

/* LEADERSHIP COMMITMENT (5.1) */

export const getLeadershipCommitment = async (): Promise<LeadershipCommitmentResponse> => {
  const res = await api.get("/leadership-commitments");
  return res.data;
};

export const updateLeadershipCommitment = async (data: { description: string }): Promise<LeadershipCommitmentResponse> => {
  const res = await api.patch("/leadership-commitments", data);
  return res.data;
};

export const getLeadershipCommitmentByYear = async (yearId: number): Promise<LeadershipCommitmentYearDetail> => {
  const res = await api.get(`/leadership-commitments/year/${yearId}`);
  return res.data;
};

export const uploadLeadershipCommitmentDocument = async (
  yearId: number,
  file: File,
  version: number,
  uploadedById: number,
  existingDocumentId?: number | null,
): Promise<LeadershipCommitmentYearDetail> => {
  const formData = new FormData();
  const data = JSON.stringify({
    documentId: existingDocumentId ?? null,
    versioned: true,
    version,
    requiresApproval: true,
    uploadedById,
  });
  formData.append("data", new Blob([data], { type: "application/json" }));
  formData.append("file", file);
  const res = await api.post(`/leadership-commitments/years/${yearId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteLeadershipCommitmentDocument = async (documentId: number): Promise<void> => {
  await api.delete(`/leadership-commitments/documents/${documentId}`);
};

/* AWARENESS (7.3) */

export const getAwareness = async (): Promise<AwarenessResponse> => {
  const res = await api.get("/awareness");
  return res.data;
};

export const updateAwareness = async (data: { description: string }): Promise<AwarenessResponse> => {
  const res = await api.patch("/awareness", data);
  return res.data;
};

export const getAwarenessByYear = async (yearId: number): Promise<AwarenessYearDetail> => {
  const res = await api.get(`/awareness/year/${yearId}`);
  return res.data;
};

export const uploadAwarenessDocument = async (
  yearId: number,
  file: File,
  version: number,
  uploadedById: number,
  existingDocumentId?: number | null,
): Promise<AwarenessYearDetail> => {
  const formData = new FormData();
  const data = JSON.stringify({
    documentId: null,
    versioned: false,
    version: 1,
    uploadedById,
  });
  formData.append("data", new Blob([data], { type: "application/json" }));
  formData.append("file", file);
  const res = await api.post(`/awareness/years/${yearId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteAwarenessDocument = async (documentId: number): Promise<void> => {
  await api.delete(`/awareness/documents/${documentId}`);
};

/* CHANGES (6.3) */

export const getChanges = async (): Promise<ChangeResponse[]> => {
  const res = await api.get("/changes");
  return res.data;
};

export const getChangesByYear = async (year: number): Promise<ChangeResponse[]> => {
  const res = await api.get(`/changes/year/${year}`);
  return res.data;
};

export const createChange = async (data: ChangeRequest): Promise<ChangeResponse> => {
  const res = await api.post("/changes", data);
  return res.data;
};

export const updateChange = async (id: number, data: ChangeRequest): Promise<ChangeResponse> => {
  const res = await api.put(`/changes/${id}`, data);
  return res.data;
};

export const patchChange = async (id: number, data: ChangeRequest): Promise<ChangeResponse> => {
  const res = await api.patch(`/changes/${id}`, data);
  return res.data;
};

export const deleteChange = async (id: number): Promise<void> => {
  await api.delete(`/changes/${id}`);
};

/* INTERESTED PARTIES (4.2) */

export const getInterestedPartiesByYear = async (yearId: number): Promise<InterestedPartyResponse[]> => {
  const res = await api.get(`/interested-parties/year/${yearId}`);
  return res.data;
};

export const getInterestedParty = async (id: number): Promise<InterestedPartyResponse> => {
  const res = await api.get(`/interested-parties/${id}`);
  return res.data;
};

export const createInterestedParty = async (data: CreateInterestedPartyRequest): Promise<InterestedPartyResponse> => {
  const res = await api.post("/interested-parties", data);
  return res.data;
};

export const updateInterestedParty = async (id: number, data: UpdateInterestedPartyRequest): Promise<InterestedPartyResponse> => {
  const res = await api.put(`/interested-parties/${id}`, data);
  return res.data;
};

export const deleteInterestedParty = async (id: number): Promise<void> => {
  await api.delete(`/interested-parties/${id}`);
};

export const associateInterestedPartyYears = async (id: number, yearIds: number[]): Promise<void> => {
  await api.put(`/interested-parties/${id}/years/associate`, { yearIds });
};

export const associateInterestedPartyYearsFull = async (id: number, yearIds: number[]): Promise<void> => {
  await api.put(`/interested-parties/${id}/years/associate/full`, { yearIds });
};

export const disassociateInterestedPartyYears = async (id: number, yearIds: number[]): Promise<void> => {
  await api.put(`/interested-parties/${id}/years/disassociate`, { yearIds });
};

export const associateInterestedPartyProcesses = async (interestedPartyYearId: number, processYearIds: number[]): Promise<void> => {
  await api.put(`/interested-parties/${interestedPartyYearId}/processes/associate`, { processesIds: processYearIds });
};

export const disassociateInterestedPartyProcesses = async (interestedPartyYearId: number, processYearIds: number[]): Promise<void> => {
  await api.put(`/interested-parties/${interestedPartyYearId}/processes/disassociate`, { processesIds: processYearIds });
};

export const getProcessOptionsByYear = async (yearId: number): Promise<ProcessOptionResponse[]> => {
  const res = await api.get(`/processes/year/${yearId}/options`);
  return res.data;
};

export const uploadInterestedPartyEvidence = async (
  interestedPartyYearId: number,
  file: File,
  uploadedById: number,
): Promise<void> => {
  const formData = new FormData();
  const data = JSON.stringify({
    documentId: null,
    versioned: false,
    version: 1,
    requiresApproval: false,
    uploadedById,
  });
  formData.append("data", new Blob([data], { type: "application/json" }));
  formData.append("file", file);
  await api.post(`/interested-parties/${interestedPartyYearId}/document`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
