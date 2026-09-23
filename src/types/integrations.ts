export type ConnectorId =
  | 'sap_erp'
  | 'hrms'
  | 'email_smtp'
  | 'm365'
  | 'iot_devices'
  | 'payment_gateway'
  | 'biometric_face'
  | 'third_party_api';

export type ConnectorStatus =
  | 'Not Configured'
  | 'Configured'
  | 'Testing'
  | 'Connected'
  | 'Disconnected'
  | 'Error'
  | 'Disabled';

export type HealthStatus = 'Healthy' | 'Degraded' | 'Offline' | 'Unconfigured';

export type SyncMode = 'Manual Sync' | 'Scheduled Sync' | 'Near Real-Time Sync' | 'Event-Based Sync';

export type AuthType = 'OAuth 2.0' | 'API Key' | 'Basic Auth' | 'Bearer Token' | 'Certificate / mTLS' | 'None';

export interface ConnectorConfig {
  connectorId: ConnectorId;
  name: string;
  category: string;
  environment: 'Development' | 'Staging' | 'Production';
  baseUrl: string;
  apiType: 'REST' | 'OData' | 'GraphQL' | 'SOAP' | 'MQTT' | 'SMTP' | 'Graph API';
  authType: AuthType;
  clientId: string;
  username: string;
  secretMasked: string; // Stored masked or encrypted representation
  hasSecretConfigured: boolean;
  status: ConnectorStatus;
  isEnabled: boolean;
  health: HealthStatus;
  syncMode: SyncMode;
  lastSync: string | null;
  lastSuccessfulSync: string | null;
  lastError: string | null;
  retryStatus: string;
  supportedProtocols: string[];
  subServices?: { name: string; isEnabled: boolean; description: string }[];
  extraConfig?: Record<string, string>;
}

export interface DataMappingRule {
  id: string;
  connectorId: ConnectorId;
  entityName: string;
  internalField: string;
  externalField: string;
  description: string;
  direction: 'Bidirectional' | 'Pull (External -> Internal)' | 'Push (Internal -> External)';
  lastUpdated: string;
}

export interface SyncConflict {
  id: string;
  connectorId: ConnectorId;
  connectorName: string;
  entityType: string;
  entityId: string;
  field: string;
  internalValue: string;
  externalValue: string;
  lastUpdated: string;
  source: string;
  status: 'Pending' | 'Resolved';
  resolution?: 'Keep Internal' | 'Use External' | 'Merge' | 'Ignore';
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface IntegrationLogEntry {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  connectorId: ConnectorId;
  connectorName: string;
  operation: 'Test Connection' | 'Manual Sync' | 'Scheduled Sync' | 'Data Pull' | 'Data Push' | 'Config Update' | 'Status Check';
  source: string;
  destination: string;
  recordsProcessed: number;
  successCount: number;
  failureCount: number;
  errorMessage?: string;
  durationMs: number;
  userTrigger: string;
}

export interface IntegrationAuditEntry {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  user: string;
  action:
    | 'Connector configuration changed'
    | 'Connector enabled'
    | 'Connector disabled'
    | 'Manual sync started'
    | 'Manual sync completed'
    | 'Credential updated'
    | 'Data mapping changed'
    | 'Connection test failed'
    | 'Connection test succeeded'
    | 'Conflict resolved';
  connectorId: ConnectorId;
  details: string;
}
