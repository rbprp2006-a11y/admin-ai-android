export type Environment = 'development' | 'staging' | 'production';

export type UserRole =
  | 'Super Admin'
  | 'Facility Manager'
  | 'Security Officer'
  | 'Department Employee'
  | 'Compliance Auditor';

export interface ConfigState {
  environment: Environment;
  backendUrl: string; // e.g. "http://192.168.1.100:8000/api"
  appVersion: string;
  databaseType: 'PostgreSQL (Shared Authority)' | 'SQLite Local Cache' | 'Enterprise Hybrid';
  storageType: 'Local Encrypted Storage' | 'MinIO / S3 Bucket' | 'Encrypted Device Sandbox';
  logLevel: 'Debug' | 'Info' | 'Warning' | 'Error';
  backupRetentionDays: number;
  sessionTimeoutMinutes: number;
  requireExternalAiConsent: boolean;
  enableLocalNetworkApi: boolean;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
  };
  token: string;
  expiresAt: string;
  loginTime: string;
  lastActiveTime: string;
  isAuthenticated: boolean;
}

export interface SystemHealthItem {
  id: string;
  name: string;
  category: 'Backend' | 'Database' | 'Local Network' | 'Device Storage' | 'Offline Sync' | 'AI Layer' | 'Integrations' | 'Backup' | 'Runtime';
  status: 'Healthy' | 'Warning' | 'Error' | 'Offline' | 'Not Configured';
  endpoint: string;
  latencyMs: number | null;
  details: string;
  lastChecked: string;
}

export interface DiagnosticLog {
  id: string;
  timestamp: string;
  category: 'Android Runtime' | 'Backend API' | 'Database' | 'Uploads/Files' | 'Offline Sync' | 'AI Agents' | 'Integrations' | 'Security/Auth';
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  message: string;
  sanitized: boolean;
  metadata?: Record<string, any>;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  source: 'Backend' | 'Database' | 'Storage' | 'Backup' | 'Sync' | 'Auth' | 'Integration';
  severity: 'High' | 'Medium' | 'Low';
  message: string;
  channelsSent: Array<{
    channel: 'In-App' | 'Mobile SMS' | 'Email/Outlook' | 'MS Teams';
    status: 'Delivered' | 'Queued (Provider Not Configured)' | 'Failed';
  }>;
}

export interface OfflineQueueItem {
  id: string;
  timestamp: string;
  action: string;
  moduleId: string;
  payloadSummary: string;
  status: 'Cached Locally (Offline)' | 'Syncing' | 'Synced to Authority';
  retryCount: number;
}
