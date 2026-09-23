import { ModuleId } from './modules';

export type AgentId = 
  | 'coordinator'
  | 'ticket_resolution'
  | 'notification_communication'
  | 'workflow_automation'
  | 'data_insight'
  | 'knowledge'
  | 'integration'
  | 'learning_improvement';

export type TicketLifecycleState =
  | 'New'
  | 'Assigned'
  | 'Accepted'
  | 'In Progress'
  | 'Pending'
  | 'Resolved'
  | 'Verified'
  | 'Closed'
  | 'Reopened';

export interface AiActionConfirmation {
  id: string;
  intent: string;
  moduleName: string;
  moduleId: ModuleId;
  agentId: AgentId;
  action: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  slaHours?: number;
  escalationPolicy?: string;
  details: Record<string, any>;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Edited';
  requiresHumanApproval: boolean;
  timestamp: string;
}

export interface AiActivityLogEntry {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  user: string;
  request: string;
  detectedIntent: string;
  selectedModule: string;
  selectedAgent: string;
  actionPerformed: string;
  result: string;
  approvalStatus: 'Approved' | 'Pending' | 'Auto-Executed' | 'Rejected' | 'N/A';
  error?: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: 'SOP' | 'Policy' | 'Manual' | 'FAQ' | 'Historical';
  tags: string[];
  content: string;
  sourceDocument?: string;
  version: string;
  lastUpdated: string;
  approvedBy: string;
}

export type FeedbackType = 'Helpful' | 'Not Helpful' | 'Correct' | 'Incorrect' | 'Suggestion' | 'Complaint';

export interface AgentFeedback {
  id: string;
  timestamp: string;
  messageId?: string;
  feedbackType: FeedbackType;
  comment?: string;
  user: string;
  appliedStatus: 'Under Review' | 'Admin Approved' | 'Implemented' | 'Rejected';
}

export interface WorkflowRule {
  id: string;
  name: string;
  module: ModuleId;
  trigger: string;
  stages: {
    order: number;
    role: string;
    action: string;
    slaHours: number;
    autoEscalate: boolean;
  }[];
  status: 'Active' | 'Draft' | 'Paused';
}

export interface IntegrationConnector {
  id: string;
  name: string;
  channelType: 'Mobile App' | 'Mobile SMS' | 'Web Portal' | 'Voice Assistant' | 'Kiosk' | 'Email / Outlook' | 'Microsoft Teams';
  status: 'Connected' | 'Degraded' | 'Healthy' | 'Offline';
  lastSync: string;
  lastSuccessfulConnection: string;
  errorStatus?: string;
  retryStatus?: string;
  latencyMs: number;
}

export interface ProcessImprovementRecommendation {
  id: string;
  detectedBottleneck: string;
  module: ModuleId;
  recommendation: string;
  expectedImpact: string;
  requiresAdminApproval: true;
  approvalStatus: 'Pending Admin Approval' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface PredictiveInsight {
  id: string;
  category: 'SLA breach risk' | 'Complaint volume trends' | 'Energy trends' | 'Asset maintenance risk' | 'Vendor delay patterns';
  metric: string;
  prediction: string;
  confidence: number; // percentage
  isEstimateNotice: true;
  recommendedAction: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  intent?: string;
  module?: ModuleId;
  agent?: AgentId;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  confirmation?: AiActionConfirmation;
  sources?: { title: string; category: string; snippet: string }[];
  executedAction?: { label: string; success: boolean; data?: any };
  suggestedFollowups?: string[];
}
