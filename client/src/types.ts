import React from "react";

export type NCStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface NonConformity {
  name: string;
  origin: string;
  evaluation: string;
  comment: string;
  actions: string;
  status: NCStatus;
  reportedAt: string; // ISO string
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: "admin" | "editor" | "viewer";
  avatar?: string;
}

export interface AuthResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  accessToken: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<never>;
}

/* MACRO PROCESS, PROCESS, INDICATOR, MEASUREMENT */

export interface Measurement {
  id: number;
  measurementDate: string;
  value: number;
  notes: string;
  indicatorId: string;
}

export type IndicatorFrequency = "ANNUAL" | "MONTHLY" | "SEMESTER" | "TRIMESTER";

export interface Indicator {
  id: number;
  name: string;
  formula: string;
  frequency: IndicatorFrequency;
  owner?: string;
  measurements: Measurement[];
}

export interface Process {
  id: number;
  name: string;
  objective: string;
}

export interface ProcessSummary extends Process {
  indicators: Indicator[];
}

export interface MacroProcess {
  id: number;
  name: string;
}

export interface MacroProcessSummary extends MacroProcess {
  processes: ProcessSummary[];
}

export interface IndicatorProcess {
  id: number;
  processName: string;
  macroProcessName: string;
}

export interface IndicatorSimple {
  id: number;
  name: string;
  frequency: IndicatorFrequency;
  owner?: string;
}

export interface IndicatorWithProcesses extends Indicator {
  processes: IndicatorProcess[];
  owner: string;
  indicatorYearId?: number;
  indicatorId?: number;
  goal?: number;
}

export interface IndicatorFullResponse extends Indicator {
  processes: ProcessSummary[];
}

export interface YearOption {
  id: number;
  year: number;
  selected: boolean;
}

export interface IndicatorHierarchyResponse {
  indicatorYearId: number;
  indicatorId: number;
  name: string;
  formula: string;
  frequency: IndicatorFrequency;
  goal: number | null;
  measurements: MeasurementResponseDTO[];
  years: YearOption[];
}

export interface MeasurementResponseDTO {
  id: number;
  measurementDate: string;
  measurementValue: number;
  notes: string;
  indicatorYearId: number;
}

export interface QualityObjectiveInfo {
  id: number;
  yearId: number;
  objectiveTitle: string;
}

export interface ProcessHierarchyItem {
  processYearId: number;
  processId: number;
  name: string;
  objective: string;
  owner: UserSummary | null;
  indicators: IndicatorHierarchyResponse[];
  years: YearOption[];
  qualityObjectives: QualityObjectiveInfo[];
}

export interface MacroProcessHierarchyItem {
  macroProcessYearId: number;
  macroProcessId: number;
  name: string;
  processes: ProcessHierarchyItem[];
  years: YearOption[];
}

export interface ProcessHierarchyResponse {
  macroProcesses: MacroProcessHierarchyItem[];
  standaloneProcesses: ProcessHierarchyItem[];
}

/* SCOPE */

export type DocumentStatus = "UNDER_REVIEW" | "APPROVED" | "OBSOLETE";

export interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface DocumentVersionResponse {
  versionId: number;
  version: number;
  fileName: string;
  fileType: string;
  uploadedBy: UserSummary;
  status: DocumentStatus;
  uploadedAt: string;
  obsoleteAt: string | null;
  downloadUrl: string;
}

export interface DocumentWithVersionsResponse {
  documentId: number;
  versions: DocumentVersionResponse[];
}

export interface SingletonDocumentResponse {
  id: number;
  description: string | null;
  document: DocumentWithVersionsResponse | null;
}

export type ScopeResponse = SingletonDocumentResponse;
export type SystemPolicyResponse = SingletonDocumentResponse;
export type ResponsibilityAuthorityResponse = SingletonDocumentResponse;

/* YEAR */

export interface YearResponse {
  id: number;
  year: number;
}

/* LEADERSHIP COMMITMENT (5.1) */

export interface LeadershipCommitmentYearDetail {
  leadershipCommitmentYearId: number;
  yearId: number;
  year: number;
  documents: DocumentWithVersionsResponse[];
}

export interface LeadershipCommitmentResponse {
  id: number;
  description: string | null;
  years: LeadershipCommitmentYearDetail[];
}

/* AWARENESS (7.3) */

export interface AwarenessYearDetail {
  awarenessYearId: number;
  yearId: number;
  year: number;
  documents: DocumentWithVersionsResponse[];
}

export interface AwarenessResponse {
  id: number;
  description: string | null;
  years: AwarenessYearDetail[];
}

/* CHANGE (6.3) */

export type ChangeStatus = "INITIATED" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";

export interface ChangeResponse {
  id: number;
  description: string | null;
  origin: string | null;
  whatWillBeDone: string | null;
  why: string | null;
  createdBy: UserSummary | null;
  startDate: string | null;
  timeLimitInDays: number | null;
  expectedEndDate: string | null;
  realEndDate: string | null;
  where: string | null;
  how: string | null;
  howMuch: string | null;
  status: ChangeStatus;
  notes: string | null;
  createdAt: string;
}

export interface ChangeRequest {
  description?: string | null;
  origin?: string | null;
  whatWillBeDone?: string | null;
  why?: string | null;
  createdById?: number | null;
  startDate?: string | null;
  timeLimitInDays?: number | null;
  expectedEndDate?: string | null;
  realEndDate?: string | null;
  where?: string | null;
  how?: string | null;
  howMuch?: string | null;
  status?: ChangeStatus | null;
  notes?: string | null;
}

/* INTERESTED PARTIES (4.2) */

export type InterestedPartyType = "INTERNAL" | "EXTERNAL";

export interface ProcessOptionResponse {
  processYearId: number;
  processId: number;
  processName: string;
  macroProcessName: string | null;
}

export interface InterestedPartyResponse {
  id: number;
  interestedPartyYearId: number;
  name: string;
  type: InterestedPartyType;
  category: string;
  contactInfo: string;
  yearId: number;
  year: number;
  needs: string | null;
  communicationAndMonitoringPlan: string | null;
  processes: ProcessOptionResponse[];
  evidences: DocumentWithVersionsResponse[];
}

export interface CreateInterestedPartyRequest {
  name: string;
  type: InterestedPartyType;
  category: string;
  contactInfo: string;
  yearId: number;
  needs?: string | null;
  communicationAndMonitoringPlan?: string | null;
  processYearIds?: number[] | null;
}

export interface UpdateInterestedPartyRequest {
  name?: string | null;
  type?: InterestedPartyType | null;
  category?: string | null;
  contactInfo?: string | null;
  needs?: string | null;
  communicationAndMonitoringPlan?: string | null;
}
