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

export type AIProvider = 'google' | 'deepseek';

export interface AppSettings {
  provider: AIProvider; // 'google' | 'deepseek'
  baseUrl: string; // For China proxy support or DeepSeek API URL
  modelName: string; // Allow switching models
  apiKey?: string; // Optional user-provided override
}

export interface AuditContext {
  fileBase64: string | null;      // File 1: Production Record (Required)
  filingFileBase64: string | null; // File 2: Regulatory Filing Record (Optional)
  textData: string | null;        // Fallback for demo text
  equipmentProfiles: EquipmentProfile[]; 
  settings: AppSettings;
}

export interface AuditResponse {
  summary: string;
  detectedEquipment: string | null; 
  issues: Issue[];
  complianceScore: number;
  gmpcNotes: string;
}

export interface Issue {
  type: 'error' | 'warning' | 'info';
  category: 'formula' | 'process' | 'consistency' | 'gmpc' | 'equipment' | 'regulatory';
  title: string;
  description: string;
  location?: string;
}

export enum AppView {
  INPUT = 'input',
  SETTINGS = 'settings',
  REPORT = 'report'
}

// 补充定义：防止 npm run build 时 TypeScript 报错找不到 process
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY?: string;
      [key: string]: string | undefined;
    }
  }
}
