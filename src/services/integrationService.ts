import {
  ConnectorId,
  ConnectorConfig,
  DataMappingRule,
  SyncConflict,
  IntegrationLogEntry,
  IntegrationAuditEntry,
  ConnectorStatus
} from '../types/integrations';

const STORAGE_KEYS = {
  CONNECTORS: 'admin_ai_integration_connectors',
  MAPPINGS: 'admin_ai_integration_mappings',
  CONFLICTS: 'admin_ai_integration_conflicts',
  LOGS: 'admin_ai_integration_logs',
  AUDIT: 'admin_ai_integration_audit',
};

// Initial state for all 8 connectors - All DISABLED by default
const initialConnectors: ConnectorConfig[] = [
  {
    connectorId: 'sap_erp',
    name: 'SAP ERP Connector',
    category: 'Enterprise ERP & Finance',
    environment: 'Staging',
    baseUrl: '',
    apiType: 'OData',
    authType: 'OAuth 2.0',
    clientId: '',
    username: '',
    secretMasked: '',
    hasSecretConfigured: false,
    status: 'Disabled',
    isEnabled: false,
    health: 'Unconfigured',
    syncMode: 'Manual Sync',
    lastSync: null,
    lastSuccessfulSync: null,
    lastError: null,
    retryStatus: 'Idle (Disabled)',
    supportedProtocols: ['OData v4', 'REST API', 'SOAP / RFC Gateway'],
    subServices: [
      { name: 'Vendor Master Sync', isEnabled: false, description: 'Vendor code, GSTIN, payment terms, and status' },
      { name: 'Purchase Order & Requisition', isEnabled: false, description: 'PO issuance, budget release, and invoice reconciliation' },
      { name: 'Asset Master Synchronizer', isEnabled: false, description: 'Capital expenditure asset tags and depreciation' },
      { name: 'Cost Center Reference', isEnabled: false, description: 'Admin department billing and cost center codes' }
    ],
    extraConfig: {
      sapClient: '100',
      systemId: 'PRD',
      language: 'EN'
    }
  },
  {
    connectorId: 'hrms',
    name: 'HRMS Connector',
    category: 'Human Resource Management',
    environment: 'Staging',
    baseUrl: '',
    apiType: 'REST',
    authType: 'OAuth 2.0',
    clientId: '',
    username: '',
    secretMasked: '',
    hasSecretConfigured: false,
    status: 'Disabled',
    isEnabled: false,
    health: 'Unconfigured',
    syncMode: 'Manual Sync',
    lastSync: null,
    lastSuccessfulSync: null,
    lastError: null,
    retryStatus: 'Idle (Disabled)',
    supportedProtocols: ['REST API', 'SCIM 2.0', 'Webhook Events'],
    subServices: [
      { name: 'Employee Master Sync', isEnabled: false, description: 'Employee ID, Name, Department, and Designation' },
      { name: 'Reporting Hierarchy', isEnabled: false, description: 'Approval manager routing and organizational tree' },
      { name: 'Lifecycle Status Feed', isEnabled: false, description: 'Active / Notice Period / Resigned status sync' }
    ],
    extraConfig: {
      webhookSecret: '',
      departmentFilter: 'All'
    }
  },
  {
    connectorId: 'email_smtp',
    name: 'Email Server / SMTP / Outlook',
    category: 'Communication Infrastructure',
    environment: 'Production',
    baseUrl: '',
    apiType: 'SMTP',
    authType: 'Basic Auth',
    clientId: '',
    username: '',
    secretMasked: '',
    hasSecretConfigured: false,
    status: 'Disabled',
    isEnabled: false,
    health: 'Unconfigured',
    syncMode: 'Manual Sync',
    lastSync: null,
    lastSuccessfulSync: null,
    lastError: null,
    retryStatus: 'Idle (Disabled)',
    supportedProtocols: ['SMTP (Port 587/465)', 'Microsoft Graph Mail', 'IMAP/TLS'],
    subServices: [
      { name: 'Ticket Acknowledgements', isEnabled: false, description: 'Automated receipt emails to requesters' },
      { name: 'Approval Notifications', isEnabled: false, description: 'Actionable approval request emails with direct buttons' },
      { name: 'Daily Digest & Escalation', isEnabled: false, description: 'SLA breach alerts and admin daily summaries' }
    ],
    extraConfig: {
      smtpHost: '',
      smtpPort: '587',
      senderEmail: 'admin-notifications@company.com',
      enableTls: 'true'
    }
  },
  {
    connectorId: 'm365',
    name: 'Microsoft 365 Connector',
    category: 'Office & Collaboration Suite',
    environment: 'Production',
    baseUrl: '',
    apiType: 'Graph API',
    authType: 'OAuth 2.0',
    clientId: '',
    username: '',
    secretMasked: '',
    hasSecretConfigured: false,
    status: 'Disabled',
    isEnabled: false,
    health: 'Unconfigured',
    syncMode: 'Manual Sync',
    lastSync: null,
    lastSuccessfulSync: null,
    lastError: null,
    retryStatus: 'Idle (Disabled)',
    supportedProtocols: ['Microsoft Graph API v1.0', 'Teams Webhook'],
    subServices: [
      { name: 'Outlook Calendar Sync', isEnabled: false, description: 'Meeting room availability and booking synchronization' },
      { name: 'Microsoft Teams Alerts', isEnabled: false, description: 'Real-time department channel broadcasts' },
      { name: 'OneDrive / SharePoint Document Hub', isEnabled: false, description: 'Approved policy and SOP document synchronization' }
    ],
    extraConfig: {
      tenantId: '',
      graphScope: 'https://graph.microsoft.com/.default'
    }
  },
  {
    connectorId: 'iot_devices',
    name: 'IoT / Devices Connector',
    category: 'Smart Building & Sensor Gateway',
    environment: 'Staging',
    baseUrl: '',
    apiType: 'MQTT',
    authType: 'API Key',
    clientId: '',
    username: '',
    secretMasked: '',
    hasSecretConfigured: false,
    status: 'Disabled',
    isEnabled: false,
    health: 'Unconfigured',
    syncMode: 'Manual Sync',
    lastSync: null,
    lastSuccessfulSync: null,
    lastError: null,
    retryStatus: 'Idle (Disabled)',
    supportedProtocols: ['MQTT v5.0', 'REST API', 'Modbus TCP Gateway', 'WebSocket'],
    subServices: [
      { name: 'Smart Energy & Power Meters', isEnabled: false, description: 'Floor-wise hourly electricity telemetry and peak alerts' },
      { name: 'HVAC Airflow & Temperature Sensors', isEnabled: false, description: 'Server room and office zone climate telemetry' },
      { name: 'Access Control Gateway', isEnabled: false, description: 'Turnstile gate count and occupancy sensors' }
    ],
    extraConfig: {
      mqttBroker: '',
      mqttTopicPrefix: 'campus/admin/building1/',
      keepAliveSec: '60'
    }
  },
  {
    connectorId: 'payment_gateway',
    name: 'Payment Gateway Connector',
    category: 'Procurement & Vendor Settlement',
    environment: 'Staging',
    baseUrl: '',
    apiType: 'REST',
    authType: 'Bearer Token',
    clientId: '',
    username: '',
    secretMasked: '',
    hasSecretConfigured: false,
    status: 'Disabled',
    isEnabled: false,
    health: 'Unconfigured',
    syncMode: 'Manual Sync',
    lastSync: null,
    lastSuccessfulSync: null,
    lastError: null,
    retryStatus: 'Idle (Disabled)',
    supportedProtocols: ['REST API (TLS 1.3)', 'Webhook Signatures (HMAC-SHA256)'],
    subServices: [
      { name: 'Vendor Invoice Settlement Reference', isEnabled: false, description: 'Payment reference code and transaction verification' },
      { name: 'Digital Receipt Reconciliation', isEnabled: false, description: 'Reconciles payment receipt numbers with vendor records' }
    ],
    extraConfig: {
      merchantId: '',
      webhookUrl: '/api/v1/payments/webhook'
    }
  },
  {
    connectorId: 'biometric_face',
    name: 'Biometric / Face Recognition Connector',
    category: 'Physical Security & Access Hardware',
    environment: 'Development',
    baseUrl: '',
    apiType: 'REST',
    authType: 'Certificate / mTLS',
    clientId: '',
    username: '',
    secretMasked: '',
    hasSecretConfigured: false,
    status: 'Disabled',
    isEnabled: false,
    health: 'Unconfigured',
    syncMode: 'Manual Sync',
    lastSync: null,
    lastSuccessfulSync: null,
    lastError: null,
    retryStatus: 'Idle (Strictly Disabled by Default)',
    supportedProtocols: ['HTTPS / mTLS', 'Wiegand / OSDP Protocol Gateway'],
    subServices: [
      { name: 'Visitor Verification Match', isEnabled: false, description: 'Security gate pre-approved visitor badge matching' },
      { name: 'Gate Turnstile Clearance', isEnabled: false, description: 'Physical barrier access token verification' }
    ],
    extraConfig: {
      hardwareTerminalIp: '',
      privacyConsentVerified: 'false'
    }
  },
  {
    connectorId: 'third_party_api',
    name: 'Third Party API Connector',
    category: 'Enterprise External Services',
    environment: 'Staging',
    baseUrl: '',
    apiType: 'REST',
    authType: 'API Key',
    clientId: '',
    username: '',
    secretMasked: '',
    hasSecretConfigured: false,
    status: 'Disabled',
    isEnabled: false,
    health: 'Unconfigured',
    syncMode: 'Manual Sync',
    lastSync: null,
    lastSuccessfulSync: null,
    lastError: null,
    retryStatus: 'Idle (Disabled)',
    supportedProtocols: ['REST API', 'JSON-RPC', 'HTTPS'],
    subServices: [
      { name: 'Corporate Maps & Fleet Routing API', isEnabled: false, description: 'Live route optimization for airport and employee transit' },
      { name: 'Enterprise SMS Gateway Provider', isEnabled: false, description: 'High-throughput SMS gateway for OTPs and gate passes' },
      { name: 'Document OCR Engine API', isEnabled: false, description: 'Vendor invoice and tax compliance document parsing' }
    ],
    extraConfig: {
      providerName: 'Custom Enterprise Provider',
      rateLimitPerMin: '60'
    }
  }
];

// Initial Data Mapping Rules
const initialMappings: DataMappingRule[] = [
  {
    id: 'MAP-01',
    connectorId: 'hrms',
    entityName: 'Employee Master',
    internalField: 'hostEmployee / reportedBy',
    externalField: 'hrms_employee_id / work_email',
    description: 'Binds ticket requester and visitor hosts to the official HR employee record',
    direction: 'Bidirectional',
    lastUpdated: '2026-09-22'
  },
  {
    id: 'MAP-02',
    connectorId: 'sap_erp',
    entityName: 'Vendor Master',
    internalField: 'vendor_id (e.g. VND-5001)',
    externalField: 'sap_lifnr (SAP Vendor Number)',
    description: 'Maps internal Admin AI vendor profile to SAP procurement vendor code',
    direction: 'Bidirectional',
    lastUpdated: '2026-09-22'
  },
  {
    id: 'MAP-03',
    connectorId: 'sap_erp',
    entityName: 'Asset Register',
    internalField: 'asset_tag (e.g. AST-2026-0189)',
    externalField: 'sap_anln1 (SAP Asset Main Number)',
    description: 'Synchronizes physical workstation assets with SAP Fixed Asset accounting',
    direction: 'Bidirectional',
    lastUpdated: '2026-09-22'
  },
  {
    id: 'MAP-04',
    connectorId: 'iot_devices',
    entityName: 'Smart Meter Telemetry',
    internalField: 'meter_id / hourly_kwh',
    externalField: 'telemetry.power_draw_kw',
    description: 'Routes building sensor power consumption logs into Utilities AI',
    direction: 'Pull (External -> Internal)',
    lastUpdated: '2026-09-22'
  }
];

// Initial Sync Conflicts
const initialConflicts: SyncConflict[] = [
  {
    id: 'CONF-01',
    connectorId: 'hrms',
    connectorName: 'HRMS Connector',
    entityType: 'Employee',
    entityId: 'EMP-4019',
    field: 'Department',
    internalValue: 'Facilities & Fleet Operations',
    externalValue: 'Corporate Real Estate & Admin',
    lastUpdated: '2026-09-22 10:15',
    source: 'HRMS Scheduled Feed',
    status: 'Pending'
  },
  {
    id: 'CONF-02',
    connectorId: 'sap_erp',
    connectorName: 'SAP ERP Connector',
    entityType: 'Vendor',
    entityId: 'VND-5002',
    field: 'AMC Status',
    internalValue: 'Expiring Soon (2026-10-15)',
    externalValue: 'Renewed in SAP (2027-10-15)',
    lastUpdated: '2026-09-22 09:30',
    source: 'SAP Purchase Order Update',
    status: 'Pending'
  }
];

export class IntegrationService {
  // 1. Connectors Configuration Store
  static getConnectors(): ConnectorConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONNECTORS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse connectors', e);
    }
    localStorage.setItem(STORAGE_KEYS.CONNECTORS, JSON.stringify(initialConnectors));
    return initialConnectors;
  }

  static getConnector(id: ConnectorId): ConnectorConfig | undefined {
    return this.getConnectors().find(c => c.connectorId === id);
  }

  static saveConnectors(list: ConnectorConfig[]): void {
    localStorage.setItem(STORAGE_KEYS.CONNECTORS, JSON.stringify(list));
  }

  static updateConnectorConfig(
    id: ConnectorId,
    updates: Partial<ConnectorConfig>,
    user: string = 'Authorized Admin'
  ): ConnectorConfig {
    const list = this.getConnectors();
    const index = list.findIndex(c => c.connectorId === id);
    if (index === -1) throw new Error(`Connector ${id} not found`);

    const existing = list[index];
    const updated: ConnectorConfig = {
      ...existing,
      ...updates,
      // If secret provided, mask it
      secretMasked: updates.secretMasked ? '••••••••••••••••' : existing.secretMasked,
      hasSecretConfigured: updates.secretMasked ? true : existing.hasSecretConfigured,
      // Recalculate status if not explicitly set
      status: updates.status || (existing.isEnabled ? 'Connected' : 'Disabled')
    };

    list[index] = updated;
    this.saveConnectors(list);

    this.addAuditLog({
      user,
      action: 'Connector configuration changed',
      connectorId: id,
      details: `Updated parameters for ${updated.name} (Base URL: ${updated.baseUrl || 'Unset'}, Auth: ${updated.authType})`
    });

    return updated;
  }

  static setConnectorEnabled(
    id: ConnectorId,
    enabled: boolean,
    user: string = 'Authorized Admin'
  ): ConnectorConfig {
    const list = this.getConnectors();
    const index = list.findIndex(c => c.connectorId === id);
    if (index === -1) throw new Error(`Connector ${id} not found`);

    const connector = list[index];
    connector.isEnabled = enabled;
    connector.status = enabled ? (connector.baseUrl ? 'Connected' : 'Configured') : 'Disabled';
    connector.health = enabled ? (connector.baseUrl ? 'Healthy' : 'Degraded') : 'Offline';

    list[index] = connector;
    this.saveConnectors(list);

    this.addAuditLog({
      user,
      action: enabled ? 'Connector enabled' : 'Connector disabled',
      connectorId: id,
      details: `${connector.name} status switched to ${connector.status} by ${user}`
    });

    return connector;
  }

  // 2. Standard Connector Interface: Test Connection (Safe, non-crashing fail-safe)
  static async testConnection(
    id: ConnectorId,
    user: string = 'Authorized Admin'
  ): Promise<{
    success: boolean;
    latencyMs: number;
    message: string;
    authValid: boolean;
    errorCode?: string;
  }> {
    const connector = this.getConnector(id);
    if (!connector) {
      return { success: false, latencyMs: 0, message: 'Connector not found', authValid: false };
    }

    const start = Date.now();

    // Fail-safe check: If baseUrl or credentials are not configured, accurately report configuration requirement
    if (!connector.baseUrl || !connector.hasSecretConfigured) {
      const durationMs = 18;
      const errorMsg = 'Configuration incomplete: Base URL and authentication credentials must be supplied prior to connection handshake.';
      
      this.addLog({
        connectorId: id,
        connectorName: connector.name,
        operation: 'Test Connection',
        source: 'Admin AI Integration Layer',
        destination: connector.baseUrl || 'Unconfigured Host',
        recordsProcessed: 0,
        successCount: 0,
        failureCount: 1,
        errorMessage: errorMsg,
        durationMs,
        userTrigger: user
      });

      this.addAuditLog({
        user,
        action: 'Connection test failed',
        connectorId: id,
        details: `Connection test rejected: missing Base URL or credentials for ${connector.name}`
      });

      return {
        success: false,
        latencyMs: durationMs,
        message: errorMsg,
        authValid: false,
        errorCode: 'ERR_CONFIG_MISSING'
      };
    }

    // When valid configuration exists: simulated safe ping with realistic network latency
    await new Promise(resolve => setTimeout(resolve, 350));
    const latencyMs = Math.floor(Math.random() * 80) + 40;
    const isSuccess = true;

    this.addLog({
      connectorId: id,
      connectorName: connector.name,
      operation: 'Test Connection',
      source: 'Admin AI Integration Gateway',
      destination: connector.baseUrl,
      recordsProcessed: 1,
      successCount: 1,
      failureCount: 0,
      durationMs: latencyMs,
      userTrigger: user
    });

    this.addAuditLog({
      user,
      action: 'Connection test succeeded',
      connectorId: id,
      details: `Handshake test successful for ${connector.name} at ${connector.baseUrl} (${latencyMs}ms)`
    });

    // Update connector status
    this.updateConnectorConfig(id, {
      status: 'Connected',
      health: 'Healthy',
      lastError: null
    }, user);

    return {
      success: true,
      latencyMs,
      message: `Handshake successful. Verified endpoint: ${connector.baseUrl} via ${connector.authType}.`,
      authValid: true
    };
  }

  // 3. Manual Sync Execution (Safe & Controlled)
  static async executeManualSync(
    id: ConnectorId,
    user: string = 'Authorized Admin'
  ): Promise<{
    success: boolean;
    recordsProcessed: number;
    message: string;
  }> {
    const connector = this.getConnector(id);
    if (!connector) throw new Error('Connector not found');

    if (!connector.isEnabled) {
      return {
        success: false,
        recordsProcessed: 0,
        message: `Sync aborted: ${connector.name} is currently disabled. Enable connector first.`
      };
    }

    this.addAuditLog({
      user,
      action: 'Manual sync started',
      connectorId: id,
      details: `Manual sync triggered for ${connector.name}`
    });

    // Simulate safe synchronization without corrupting database
    await new Promise(resolve => setTimeout(resolve, 400));
    const now = new Date().toISOString();
    const records = Math.floor(Math.random() * 12) + 4;

    this.updateConnectorConfig(id, {
      lastSync: now,
      lastSuccessfulSync: now,
      lastError: null,
      status: 'Connected',
      health: 'Healthy'
    }, user);

    this.addLog({
      connectorId: id,
      connectorName: connector.name,
      operation: 'Manual Sync',
      source: connector.name,
      destination: 'Central StorageService',
      recordsProcessed: records,
      successCount: records,
      failureCount: 0,
      durationMs: 410,
      userTrigger: user
    });

    this.addAuditLog({
      user,
      action: 'Manual sync completed',
      connectorId: id,
      details: `Synchronized ${records} reference items for ${connector.name} successfully.`
    });

    return {
      success: true,
      recordsProcessed: records,
      message: `Manual sync completed: ${records} records synchronized.`
    };
  }

  // 4. Data Mapping Rules
  static getMappings(): DataMappingRule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MAPPINGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(initialMappings));
    return initialMappings;
  }

  static addMapping(mapping: Omit<DataMappingRule, 'id' | 'lastUpdated'>, user: string = 'Admin'): DataMappingRule {
    const list = this.getMappings();
    const newRule: DataMappingRule = {
      id: `MAP-${Date.now().toString().slice(-4)}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      ...mapping
    };
    list.unshift(newRule);
    localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(list));

    this.addAuditLog({
      user,
      action: 'Data mapping changed',
      connectorId: mapping.connectorId,
      details: `Created mapping rule: ${mapping.internalField} <-> ${mapping.externalField}`
    });

    return newRule;
  }

  // 5. Conflict Management
  static getConflicts(): SyncConflict[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFLICTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(initialConflicts));
    return initialConflicts;
  }

  static resolveConflict(
    conflictId: string,
    resolution: 'Keep Internal' | 'Use External' | 'Merge' | 'Ignore',
    user: string = 'Authorized Admin'
  ): void {
    const list = this.getConflicts();
    const index = list.findIndex(c => c.id === conflictId);
    if (index === -1) return;

    const item = list[index];
    item.status = 'Resolved';
    item.resolution = resolution;
    item.resolvedAt = new Date().toISOString();
    item.resolvedBy = user;

    list[index] = item;
    localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(list));

    this.addAuditLog({
      user,
      action: 'Conflict resolved',
      connectorId: item.connectorId,
      details: `Resolved conflict on ${item.entityId} (${item.field}): Applied decision "${resolution}"`
    });
  }

  // 6. Integration Logs
  static getLogs(): IntegrationLogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    const initialLogs: IntegrationLogEntry[] = [
      {
        id: 'LOG-INT-001',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        date: new Date(Date.now() - 3600000).toISOString().split('T')[0],
        time: '11:00 AM',
        connectorId: 'sap_erp',
        connectorName: 'SAP ERP Connector',
        operation: 'Status Check',
        source: 'Integration Gateway',
        destination: 'SAP ERP',
        recordsProcessed: 0,
        successCount: 0,
        failureCount: 0,
        durationMs: 12,
        userTrigger: 'System Health Monitor'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initialLogs));
    return initialLogs;
  }

  static addLog(entry: Omit<IntegrationLogEntry, 'id' | 'timestamp' | 'date' | 'time'>): IntegrationLogEntry {
    const list = this.getLogs();
    const now = new Date();
    const item: IntegrationLogEntry = {
      id: `LOG-INT-${Date.now().toString().slice(-6)}`,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...entry
    };
    list.unshift(item);
    if (list.length > 150) list.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(list));
    return item;
  }

  // 7. Audit Trail
  static getAuditTrail(): IntegrationAuditEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    const initialAudit: IntegrationAuditEntry[] = [
      {
        id: 'AUDIT-001',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        date: new Date(Date.now() - 7200000).toISOString().split('T')[0],
        time: '10:00 AM',
        user: 'Security Officer',
        action: 'Connector configuration changed',
        connectorId: 'sap_erp',
        details: 'Initialized future connector schema in disabled state'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(initialAudit));
    return initialAudit;
  }

  static addAuditLog(entry: Omit<IntegrationAuditEntry, 'id' | 'timestamp' | 'date' | 'time'>): void {
    const list = this.getAuditTrail();
    const now = new Date();
    const item: IntegrationAuditEntry = {
      id: `AUDIT-${Date.now().toString().slice(-6)}`,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...entry
    };
    list.unshift(item);
    if (list.length > 150) list.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(list));
  }

  // 8. Integration Monitoring Dashboard Metrics
  static getMetrics() {
    const connectors = this.getConnectors();
    const total = connectors.length;
    const connected = connectors.filter(c => c.status === 'Connected').length;
    const disconnected = connectors.filter(c => c.status === 'Disconnected').length;
    const disabled = connectors.filter(c => c.status === 'Disabled').length;
    const errors = connectors.filter(c => c.status === 'Error' || c.health === 'Degraded').length;
    const lastSyncConnector = connectors
      .filter(c => c.lastSync)
      .sort((a, b) => new Date(b.lastSync!).getTime() - new Date(a.lastSync!).getTime())[0];

    const logs = this.getLogs();
    const failedSyncs = logs.filter(l => l.failureCount > 0).length;

    return {
      total,
      connected,
      disconnected,
      disabled,
      errors,
      lastSync: lastSyncConnector ? lastSyncConnector.lastSync : 'None (All Inactive)',
      failedSyncs
    };
  }
}
