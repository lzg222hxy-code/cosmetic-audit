export interface ParameterLimit {
  id: string;
  name: string; // e.g., "Main Pot Temperature"
  min: number;
  max: number;
  unit: string;
}

export interface EquipmentProfile {
  id: string; // Internal ID
  code: string; // The Equipment Number displayed in PDF (e.g., "FMA010")
  name: string; // Descriptive name (e.g., "500L Vacuum Homogenizer")
  parameters: ParameterLimit[];
}

export interface AppSettings {
  baseUrl: string; // For China proxy support
  modelName: string; // Allow switching models
}

export interface AuditContext {
  fileBase64: string | null; // For PDF content
  textData: string | null;   // Fallback for demo text
  equipmentProfiles: EquipmentProfile[]; // Changed from flat parameters
  settings: AppSettings;
}

export interface AuditResponse {
  summary: string;
  detectedEquipment: string | null; // New field to tell user which equipment was matched
  issues: Issue[];
  complianceScore: number;
  gmpcNotes: string;
}

export interface Issue {
  type: 'error' | 'warning' | 'info';
  category: 'formula' | 'process' | 'consistency' | 'gmpc' | 'equipment';
  title: string;
  description: string;
  location?: string;
}

export enum AppView {
  INPUT = 'input',
  SETTINGS = 'settings',
  REPORT = 'report'
}