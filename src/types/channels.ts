export type ChannelId =
  | 'mobile_app'
  | 'mobile_sms'
  | 'web_portal'
  | 'voice_assistant'
  | 'kiosk'
  | 'email_outlook'
  | 'ms_teams';

export type UserRole =
  | 'Employees'
  | 'Visitors'
  | 'Vendors'
  | 'Security'
  | 'Admin Staff'
  | 'Management';

export type ChannelStatus = 'Active' | 'Inactive';

export interface ChannelConfig {
  id: ChannelId;
  name: string;
  shortName: string;
  status: ChannelStatus;
  description: string;
  provider: string;
  lastActivity: string;
  supportedRoles: UserRole[];
  settings: Record<string, any>;
}

export type SmsTriggerEvent =
  | 'Ticket acknowledgement'
  | 'Complaint number'
  | 'Approval request alerts'
  | 'Approval confirmation'
  | 'Rejection alerts'
  | 'SLA reminders'
  | 'Escalation alerts'
  | 'Visitor approval notification'
  | 'Gate pass notification'
  | 'Vehicle allocation alerts'
  | 'Maintenance status update'
  | 'Task completion notification'
  | 'OTP / verification messages';

export interface SmsNotificationSetting {
  id: string;
  triggerEvent: SmsTriggerEvent;
  enabled: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  recipientRole: UserRole | 'Requester' | 'Approver' | 'Visitor' | 'Driver';
  sampleRecipientNumber: string;
  template: string;
}

export interface ChannelActivityLog {
  id: string;
  channelId: ChannelId;
  channelName: string;
  event: string;
  recipientOrUser: string;
  details: string;
  timestamp: string;
  status: 'Delivered' | 'Pending Config' | 'Simulated' | 'Active';
}

export interface VoiceCommandAction {
  query: string;
  detectedIntent:
    | 'search_complaint'
    | 'check_ticket_status'
    | 'find_visitor_status'
    | 'check_pending_approvals'
    | 'search_asset'
    | 'check_room_availability'
    | 'open_module'
    | 'unknown';
  parameters?: Record<string, string>;
  responseMessage: string;
  targetModule?: string;
}
