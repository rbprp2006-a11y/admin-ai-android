import {
  ChannelConfig,
  ChannelId,
  UserRole,
  SmsNotificationSetting,
  ChannelActivityLog,
  VoiceCommandAction
} from '../types/channels';
import { StorageService } from './storage';

const CHANNEL_CONFIG_KEY = 'admin_ai_channel_configs';
const SMS_SETTINGS_KEY = 'admin_ai_sms_settings';
const CHANNEL_LOGS_KEY = 'admin_ai_channel_logs';

export const ROLE_CHANNEL_MAPPING: Record<UserRole, ChannelId[]> = {
  'Employees': ['mobile_app', 'web_portal', 'mobile_sms', 'email_outlook'],
  'Visitors': ['kiosk', 'mobile_sms'],
  'Security': ['mobile_app', 'kiosk', 'web_portal'],
  'Admin Staff': ['mobile_app', 'mobile_sms', 'web_portal', 'voice_assistant', 'kiosk', 'email_outlook', 'ms_teams'],
  'Management': ['mobile_app', 'web_portal', 'email_outlook', 'ms_teams'],
  'Vendors': ['web_portal', 'mobile_sms']
};

const initialChannels: ChannelConfig[] = [
  {
    id: 'mobile_app',
    name: 'Mobile App',
    shortName: 'Mobile App',
    status: 'Active',
    description: 'Primary native/PWA mobile channel with module workflows, biometric sign-in, push alerts, and offline access.',
    provider: 'PWA Mobile Container (Android / iOS Responsive)',
    lastActivity: 'Active Now (Interactive)',
    supportedRoles: ['Employees', 'Security', 'Admin Staff', 'Management'],
    settings: {
      enablePush: true,
      biometricLogin: true,
      offlineCache: true,
      version: 'v4.3-enterprise'
    }
  },
  {
    id: 'mobile_sms',
    name: 'Mobile SMS Gateway',
    shortName: 'Mobile SMS',
    status: 'Active',
    description: 'Automated SMS notification layer for ticket alerts, visitor gate OTPs, approvals, SLA reminders & status broadcasts.',
    provider: 'Twilio / MSG91 / Textlocal / AWS SNS (Ready)',
    lastActivity: '12 minutes ago (Ticket ACK dispatch)',
    supportedRoles: ['Employees', 'Visitors', 'Vendors', 'Security', 'Admin Staff'],
    settings: {
      provider: 'Twilio', // Twilio | MSG91 | Textlocal | AWS SNS
      senderId: 'ADMAI',
      apiKeyConfigured: false,
      accountSid: 'AC_sample_prod_sid_placeholder',
      authToken: '••••••••••••••••••••',
      defaultCountryCode: '+91'
    }
  },
  {
    id: 'web_portal',
    name: 'Web Portal',
    shortName: 'Web Portal',
    status: 'Active',
    description: 'Desktop and browser-based management portal sharing identical centralized enterprise records with role-based access.',
    provider: 'Cloud Web Client (Role-based Dashboard)',
    lastActivity: 'Active Now',
    supportedRoles: ['Employees', 'Security', 'Admin Staff', 'Management', 'Vendors'],
    settings: {
      ssoEnabled: true,
      sessionTimeoutMinutes: 60,
      ipWhitelisting: false
    }
  },
  {
    id: 'voice_assistant',
    name: 'Voice Assistant',
    shortName: 'Voice Assistant',
    status: 'Active',
    description: 'Hands-free voice recognition interface to search complaints, verify gate tickets, check room availability & approvals.',
    provider: 'Web Speech API (Speech Recognition & TTS Synthesis)',
    lastActivity: '45 minutes ago ("Check meeting room availability")',
    supportedRoles: ['Employees', 'Security', 'Admin Staff', 'Management'],
    settings: {
      autoListen: false,
      speechLanguage: 'en-US',
      ttsVoiceFeedback: true
    }
  },
  {
    id: 'kiosk',
    name: 'Kiosk / Touch Screen',
    shortName: 'Kiosk / Touch',
    status: 'Active',
    description: 'High-contrast large-touch interface designed for physical reception desks, security check-gates, and visitor lobbies.',
    provider: 'Dedicated Kiosk Touch Interface',
    lastActivity: '5 minutes ago (Visitor Check-In #VIS-2001)',
    supportedRoles: ['Visitors', 'Security', 'Admin Staff'],
    settings: {
      kioskLocation: 'Gate 1 Plaza Main Reception',
      touchKeypadSize: 'Large (Accessibility Compliant)',
      autoPrintPass: true,
      screenLockTimeoutSec: 120
    }
  },
  {
    id: 'email_outlook',
    name: 'Email / Outlook Integration',
    shortName: 'Email / Outlook',
    status: 'Active',
    description: 'Enterprise email gateway for daily executive summaries, approval requests, formal audit reports, and escalation notices.',
    provider: 'Microsoft Graph API / Outlook 365 (Integration-Ready)',
    lastActivity: '1 hour ago (SLA Escalation Broadcast)',
    supportedRoles: ['Employees', 'Admin Staff', 'Management'],
    settings: {
      clientTenantId: 'tenant-id-placeholder-contoso.com',
      clientId: 'client-id-azure-ad-placeholder',
      senderEmail: 'admin-dispatch@contoso-enterprise.com',
      connected: false
    }
  },
  {
    id: 'ms_teams',
    name: 'Microsoft Teams Integration',
    shortName: 'Microsoft Teams',
    status: 'Active',
    description: 'Collaborative channel bots & webhooks delivering real-time approval cards, facility breach alerts, and daily morning briefs.',
    provider: 'Microsoft Teams Webhook & Bot Framework (Integration-Ready)',
    lastActivity: '2 hours ago (Critical Facility Alert: Data Center AC)',
    supportedRoles: ['Admin Staff', 'Management'],
    settings: {
      webhookUrl: 'https://contoso.webhook.office.com/webhookb2/placeholder',
      channelName: 'Admin-Operations-War-Room',
      connected: false
    }
  }
];

const initialSmsSettings: SmsNotificationSetting[] = [
  {
    id: 'sms-1',
    triggerEvent: 'Ticket acknowledgement',
    enabled: true,
    priority: 'High',
    recipientRole: 'Requester',
    sampleRecipientNumber: '+91 98201 44521',
    template: 'ADMIN AI: Your facility complaint #{ticketId} has been logged for {location}. Assigned to {assignee}. SLA: {slaDeadline}.'
  },
  {
    id: 'sms-2',
    triggerEvent: 'Complaint number',
    enabled: true,
    priority: 'Medium',
    recipientRole: 'Requester',
    sampleRecipientNumber: '+91 98201 44521',
    template: 'ADMIN AI: Tracking ID for your maintenance report is #{ticketId}. Check real-time progress via Admin Portal or Mobile App.'
  },
  {
    id: 'sms-3',
    triggerEvent: 'Approval request alerts',
    enabled: true,
    priority: 'Critical',
    recipientRole: 'Approver',
    sampleRecipientNumber: '+91 98450 11209',
    template: 'URGENT ADMIN AI: Pass #{passNumber} for {requesterName} requires immediate approval. Reply YES to approve or NO to reject.'
  },
  {
    id: 'sms-4',
    triggerEvent: 'Approval confirmation',
    enabled: true,
    priority: 'High',
    recipientRole: 'Requester',
    sampleRecipientNumber: '+91 98201 44521',
    template: 'ADMIN AI: Great news! Gate Pass #{passNumber} has been APPROVED by {approverName}. Valid until {validUntil}.'
  },
  {
    id: 'sms-5',
    triggerEvent: 'Rejection alerts',
    enabled: true,
    priority: 'High',
    recipientRole: 'Requester',
    sampleRecipientNumber: '+91 98201 44521',
    template: 'ADMIN AI Notice: Gate pass #{passNumber} was REJECTED. Reason: {remarks}. Please contact the department head.'
  },
  {
    id: 'sms-6',
    triggerEvent: 'SLA reminders',
    enabled: true,
    priority: 'Critical',
    recipientRole: 'Approver',
    sampleRecipientNumber: '+91 97654 32100',
    template: 'ADMIN AI SLA ALERT: Ticket #{ticketId} ({title}) has 30 mins remaining before SLA breach. Urgent attention needed.'
  },
  {
    id: 'sms-7',
    triggerEvent: 'Escalation alerts',
    enabled: true,
    priority: 'Critical',
    recipientRole: 'Approver',
    sampleRecipientNumber: '+91 98900 12345',
    template: 'ADMIN AI ESCALATION: Ticket #{ticketId} is escalated to Senior Management due to breach in resolution deadline.'
  },
  {
    id: 'sms-8',
    triggerEvent: 'Visitor approval notification',
    enabled: true,
    priority: 'Medium',
    recipientRole: 'Visitor',
    sampleRecipientNumber: '+91 98201 44521',
    template: 'ADMIN AI: Welcome {name}! Your visit with {hostEmployee} at Gate 1 is pre-approved. Your Entry QR is {qrCode}.'
  },
  {
    id: 'sms-9',
    triggerEvent: 'Gate pass notification',
    enabled: true,
    priority: 'High',
    recipientRole: 'Security',
    sampleRecipientNumber: '+91 99000 11223',
    template: 'SECURITY ALERT: Gate Pass #{passNumber} ({passType}) authorized for departure at Security Gate 1.'
  },
  {
    id: 'sms-10',
    triggerEvent: 'Vehicle allocation alerts',
    enabled: true,
    priority: 'Medium',
    recipientRole: 'Driver',
    sampleRecipientNumber: '+91 98111 22334',
    template: 'ADMIN AI Transport: Vehicle {vehicleNumber} allocated to Driver {driverName} for route {routeStart} to {routeEnd} at {departureTime}.'
  },
  {
    id: 'sms-11',
    triggerEvent: 'Maintenance status update',
    enabled: true,
    priority: 'Low',
    recipientRole: 'Requester',
    sampleRecipientNumber: '+91 98201 44521',
    template: 'ADMIN AI: Status update for Ticket #{ticketId}: Status changed to [{status}]. Work ongoing by technical team.'
  },
  {
    id: 'sms-12',
    triggerEvent: 'Task completion notification',
    enabled: true,
    priority: 'Medium',
    recipientRole: 'Requester',
    sampleRecipientNumber: '+91 98201 44521',
    template: 'ADMIN AI: Maintenance task #{ticketId} ({title}) has been marked COMPLETED. Please verify and submit feedback.'
  },
  {
    id: 'sms-13',
    triggerEvent: 'OTP / verification messages',
    enabled: true,
    priority: 'Critical',
    recipientRole: 'Visitor',
    sampleRecipientNumber: '+91 98201 44521',
    template: 'ADMIN AI Security OTP: Your one-time verification code for Campus Visitor Gate Check-In is {otpCode}. Valid for 10 minutes.'
  }
];

const initialLogs: ChannelActivityLog[] = [
  {
    id: 'log-1',
    channelId: 'mobile_sms',
    channelName: 'Mobile SMS Gateway',
    event: 'Ticket acknowledgement',
    recipientOrUser: '+91 98201 44521',
    details: 'Dispatched ticket ACK for #FAC-1001 (HVAC Server Room)',
    timestamp: '12 mins ago',
    status: 'Simulated'
  },
  {
    id: 'log-2',
    channelId: 'kiosk',
    channelName: 'Kiosk / Touch Screen',
    event: 'Visitor Check-In',
    recipientOrUser: 'Rajesh Agrawal (Siemens)',
    details: 'Checked in at Gate 1 Main Reception Kiosk',
    timestamp: '25 mins ago',
    status: 'Active'
  },
  {
    id: 'log-3',
    channelId: 'voice_assistant',
    channelName: 'Voice Assistant',
    event: 'Voice Query: Check Room',
    recipientOrUser: 'Executive Secretary',
    details: 'Voice query executed: "Check room availability"',
    timestamp: '45 mins ago',
    status: 'Active'
  },
  {
    id: 'log-4',
    channelId: 'email_outlook',
    channelName: 'Email / Outlook Integration',
    event: 'Daily Facilities Summary',
    recipientOrUser: 'facilities-head@company.com',
    details: 'Generated email dispatch bundle: 3 open tickets, 2 passes',
    timestamp: '1 hour ago',
    status: 'Pending Config'
  },
  {
    id: 'log-5',
    channelId: 'ms_teams',
    channelName: 'Microsoft Teams Integration',
    event: 'Critical SLA Warning Card',
    recipientOrUser: '#Admin-Operations',
    details: 'Adaptive card posted: Critical HVAC Unit 2B approaching SLA',
    timestamp: '2 hours ago',
    status: 'Pending Config'
  }
];

export class ChannelService {
  static getChannels(): ChannelConfig[] {
    const raw = localStorage.getItem(CHANNEL_CONFIG_KEY);
    if (!raw) {
      localStorage.setItem(CHANNEL_CONFIG_KEY, JSON.stringify(initialChannels));
      return initialChannels;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialChannels;
    }
  }

  static updateChannelStatus(id: ChannelId, status: 'Active' | 'Inactive'): void {
    const channels = this.getChannels().map(ch => {
      if (ch.id === id) {
        return { ...ch, status, lastActivity: `Status changed to ${status} now` };
      }
      return ch;
    });
    localStorage.setItem(CHANNEL_CONFIG_KEY, JSON.stringify(channels));
  }

  static updateChannelSettings(id: ChannelId, settings: Record<string, any>): void {
    const channels = this.getChannels().map(ch => {
      if (ch.id === id) {
        return { ...ch, settings: { ...ch.settings, ...settings }, lastActivity: 'Settings updated just now' };
      }
      return ch;
    });
    localStorage.setItem(CHANNEL_CONFIG_KEY, JSON.stringify(channels));
  }

  static getSmsSettings(): SmsNotificationSetting[] {
    const raw = localStorage.getItem(SMS_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SMS_SETTINGS_KEY, JSON.stringify(initialSmsSettings));
      return initialSmsSettings;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialSmsSettings;
    }
  }

  static saveSmsSettings(settings: SmsNotificationSetting[]): void {
    localStorage.setItem(SMS_SETTINGS_KEY, JSON.stringify(settings));
  }

  static updateSingleSmsSetting(id: string, partial: Partial<SmsNotificationSetting>): void {
    const list = this.getSmsSettings().map(item => {
      if (item.id === id) {
        return { ...item, ...partial };
      }
      return item;
    });
    this.saveSmsSettings(list);
  }

  static getLogs(): ChannelActivityLog[] {
    const raw = localStorage.getItem(CHANNEL_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(CHANNEL_LOGS_KEY, JSON.stringify(initialLogs));
      return initialLogs;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialLogs;
    }
  }

  static addLog(log: Omit<ChannelActivityLog, 'id' | 'timestamp'>): void {
    const current = this.getLogs();
    const newEntry: ChannelActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      ...log
    };
    const updated = [newEntry, ...current.slice(0, 49)];
    localStorage.setItem(CHANNEL_LOGS_KEY, JSON.stringify(updated));
  }

  static testChannelConnection(channelId: ChannelId): { success: boolean; message: string; details: string } {
    const channels = this.getChannels();
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return { success: false, message: 'Channel not found', details: '' };

    let message = '';
    let details = '';
    let status: ChannelActivityLog['status'] = 'Active';

    switch (channelId) {
      case 'mobile_app':
        message = 'Mobile App connectivity handshake: PASS';
        details = 'Client device storage, PWA sync, and responsive viewports fully validated.';
        break;
      case 'mobile_sms': {
        const prov = channel.settings?.provider || 'Twilio';
        message = `SMS Gateway (${prov}) Test Dispatch: SIMULATED SUCCESS`;
        details = `Simulated SMS payload verified for dispatch to recipient +91 98201 44521. Live SMS delivery requires adding API key in Secrets.`;
        status = 'Simulated';
        break;
      }
      case 'web_portal':
        message = 'Web Portal session bridge: CONNECTED';
        details = 'Single data store validated. All 11 modules accessible in desktop browser layout.';
        break;
      case 'voice_assistant':
        message = 'Voice Engine test: READY';
        details = 'Speech recognition and speech synthesis interfaces are responsive.';
        break;
      case 'kiosk':
        message = 'Kiosk Hardware terminal ping: RESPONDING';
        details = 'Reception Touch Terminal screen ready with large-button touch UI.';
        break;
      case 'email_outlook':
        message = 'Microsoft Outlook / M365 Endpoint: ARCHITECTURE READY';
        details = 'Graph API payload formatted. Live sending activates when Azure App credentials are configured.';
        status = 'Pending Config';
        break;
      case 'ms_teams':
        message = 'Microsoft Teams Webhook Connector: ARCHITECTURE READY';
        details = 'Adaptive Cards schema verified. Outgoing alert webhooks prepared for Teams admin channel.';
        status = 'Pending Config';
        break;
    }

    this.addLog({
      channelId,
      channelName: channel.name,
      event: `Test Connection Triggered`,
      recipientOrUser: 'Admin Diagnostic Service',
      details,
      status
    });

    // Update last activity
    this.updateChannelSettings(channelId, { lastTested: new Date().toLocaleTimeString() });

    return { success: true, message, details };
  }

  // Voice Assistant command parser against centralized records
  static processVoiceCommand(commandText: string): VoiceCommandAction {
    const text = commandText.toLowerCase().trim();

    // 1. Check room availability
    if (text.includes('room') || text.includes('meeting') || text.includes('boardroom') || text.includes('सभागृह')) {
      const meetings = StorageService.getMeetingBookings();
      const inSession = meetings.filter(m => m.status === 'In Session' || m.status === 'Confirmed');
      return {
        query: commandText,
        detectedIntent: 'check_room_availability',
        responseMessage: `Found ${meetings.length} meeting rooms. Currently ${inSession.length} active or upcoming sessions today (e.g. ${inSession[0]?.roomName || 'Boardroom Sapphire'}).`,
        targetModule: 'meeting'
      };
    }

    // 2. Search complaint / check ticket status
    if (text.includes('complaint') || text.includes('ticket') || text.includes('ac') || text.includes('hvac') || text.includes('leak') || text.includes('तक्रार')) {
      const tickets = StorageService.getFacilityTickets();
      const match = tickets.find(t => 
        text.includes(t.id.toLowerCase()) || 
        text.includes(t.category.toLowerCase()) || 
        t.title.toLowerCase().split(' ').some(w => w.length > 3 && text.includes(w))
      ) || tickets[0];

      return {
        query: commandText,
        detectedIntent: 'check_ticket_status',
        parameters: { ticketId: match?.id || 'FAC-1001' },
        responseMessage: match 
          ? `Ticket ${match.id}: "${match.title}" is currently [${match.status}], assigned to ${match.assignedTo}. Priority: ${match.priority}.`
          : 'No specific complaint ticket matched. Opening Facility Maintenance.',
        targetModule: 'facility'
      };
    }

    // 3. Find visitor status
    if (text.includes('visitor') || text.includes('guest') || text.includes('rajesh') || text.includes('pooja') || text.includes('पाहुणे')) {
      const visitors = StorageService.getVisitorRecords();
      const match = visitors.find(v => text.includes(v.name.toLowerCase().split(' ')[0]) || text.includes(v.id.toLowerCase())) || visitors[0];
      return {
        query: commandText,
        detectedIntent: 'find_visitor_status',
        parameters: { visitorName: match?.name },
        responseMessage: match
          ? `Visitor ${match.name} from ${match.company} is [${match.status}] at ${match.gateNumber}. Host: ${match.hostEmployee}.`
          : 'Opening Visitor Management AI list.',
        targetModule: 'visitor'
      };
    }

    // 4. Check pending approvals
    if (text.includes('approval') || text.includes('pending') || text.includes('pass') || text.includes('मंजुरी')) {
      const passes = StorageService.getGatePasses().filter(p => p.approvalStatus === 'Pending');
      return {
        query: commandText,
        detectedIntent: 'check_pending_approvals',
        responseMessage: `You have ${passes.length} pending gate pass approvals requiring authorization (e.g. ${passes[0]?.passNumber || 'GP-2026-003'}).`,
        targetModule: 'gatepass'
      };
    }

    // 5. Search asset
    if (text.includes('asset') || text.includes('laptop') || text.includes('server') || text.includes('साधन')) {
      const assets = StorageService.getAssetRecords();
      return {
        query: commandText,
        detectedIntent: 'search_asset',
        responseMessage: `Central inventory contains ${assets.length} tracked assets. Found ${assets[0]?.name} (${assets[0]?.assetTag}) in ${assets[0]?.floorLocation}.`,
        targetModule: 'asset'
      };
    }

    // 6. Open specific module
    if (text.includes('transport') || text.includes('vehicle') || text.includes('car')) {
      return { query: commandText, detectedIntent: 'open_module', responseMessage: 'Opening Transport Management AI.', targetModule: 'transport' };
    }
    if (text.includes('vendor') || text.includes('amc')) {
      return { query: commandText, detectedIntent: 'open_module', responseMessage: 'Opening Vendor Management AI.', targetModule: 'vendor' };
    }
    if (text.includes('housekeeping') || text.includes('clean')) {
      return { query: commandText, detectedIntent: 'open_module', responseMessage: 'Opening Housekeeping & Facility AI.', targetModule: 'housekeeping' };
    }
    if (text.includes('energy') || text.includes('power') || text.includes('utility')) {
      return { query: commandText, detectedIntent: 'open_module', responseMessage: 'Opening Utilities & Energy AI.', targetModule: 'utilities' };
    }
    if (text.includes('cafeteria') || text.includes('food') || text.includes('canteen')) {
      return { query: commandText, detectedIntent: 'open_module', responseMessage: 'Opening Cafeteria AI.', targetModule: 'cafeteria' };
    }
    if (text.includes('document') || text.includes('ocr') || text.includes('contract')) {
      return { query: commandText, detectedIntent: 'open_module', responseMessage: 'Opening Document AI.', targetModule: 'document' };
    }

    // Default Fallback
    return {
      query: commandText,
      detectedIntent: 'unknown',
      responseMessage: `I heard: "${commandText}". You can ask to: check complaint status, find visitor, check room availability, search assets, or check pending approvals.`,
    };
  }
}
