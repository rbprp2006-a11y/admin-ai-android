import { StorageService } from './storage';
import { KnowledgeSearchService } from './aiKnowledgeBase';
import { ModuleId } from '../types/modules';
import {
  AgentId,
  AiActionConfirmation,
  AiActivityLogEntry,
  AgentFeedback,
  WorkflowRule,
  IntegrationConnector,
  ProcessImprovementRecommendation,
  PredictiveInsight,
  AiChatMessage
} from '../types/aiAgents';

const LOG_STORAGE_KEY = 'admin_ai_coordinator_activity_log';
const FEEDBACK_STORAGE_KEY = 'admin_ai_coordinator_feedback';
const CHAT_STORAGE_KEY = 'admin_ai_coordinator_chat_history';

export class AiCoordinatorService {
  // Activity Log
  static getActivityLogs(): AiActivityLogEntry[] {
    try {
      const data = localStorage.getItem(LOG_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    // Default initial audit entries
    const initialLogs: AiActivityLogEntry[] = [
      {
        id: 'LOG-AI-101',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        date: new Date(Date.now() - 3600000).toISOString().split('T')[0],
        time: '10:30 AM',
        user: 'Admin Staff',
        request: 'Verify HVAC status in Server Room 2B',
        detectedIntent: 'Facility Maintenance Inquiry',
        selectedModule: 'Facility Maintenance AI',
        selectedAgent: 'Ticket Resolution Agent',
        actionPerformed: 'Fetched active ticket FAC-1001 & verified coolant replacement SLA',
        result: 'SLA remaining: 1.5 hrs. In Progress.',
        approvalStatus: 'Auto-Executed'
      },
      {
        id: 'LOG-AI-102',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        date: new Date(Date.now() - 7200000).toISOString().split('T')[0],
        time: '09:30 AM',
        user: 'Security Desk',
        request: 'Approve Material Gate Pass GP-7001',
        detectedIntent: 'Gate Pass Approval',
        selectedModule: 'Gate Pass AI',
        selectedAgent: 'Workflow Automation Agent',
        actionPerformed: 'Triggered sequential supervisor and security verification',
        result: 'Gate pass authorized and QR generated',
        approvalStatus: 'Approved'
      }
    ];
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(initialLogs));
    return initialLogs;
  }

  static addActivityLog(entry: Omit<AiActivityLogEntry, 'id' | 'timestamp' | 'date' | 'time'>): AiActivityLogEntry {
    const logs = this.getActivityLogs();
    const now = new Date();
    const newEntry: AiActivityLogEntry = {
      id: `LOG-AI-${Date.now().toString().slice(-6)}`,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...entry
    };
    logs.unshift(newEntry);
    // Keep last 100 entries
    if (logs.length > 100) logs.pop();
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
    return newEntry;
  }

  // Chat History
  static getChatHistory(): AiChatMessage[] {
    try {
      const data = localStorage.getItem(CHAT_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: 'Hello! I am the ADMIN AI COORDINATOR. I orchestrate all 11 Admin modules and 7 specialized agents to manage tickets, workflows, policies, integrations, and predictive insights across the department.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: [
          'Create a maintenance complaint.',
          'Show my pending approvals.',
          'Find visitor John.',
          'Check vehicle availability.',
          'Show open gate passes.',
          'Show today\'s housekeeping pending tasks.',
          'Show high energy consumption alerts.',
          'Find vendor AMC expiry.',
          'Search document policy.'
        ]
      }
    ];
  }

  static saveChatHistory(history: AiChatMessage[]) {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history));
  }

  static clearChatHistory() {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  }

  // Feedback Store
  static getFeedback(): AgentFeedback[] {
    try {
      const data = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'FB-001',
        timestamp: new Date().toISOString(),
        feedbackType: 'Correct',
        comment: 'Accurately classified server room HVAC complaint to Critical priority',
        user: 'Operations Lead',
        appliedStatus: 'Admin Approved'
      }
    ];
  }

  static submitFeedback(feedback: Omit<AgentFeedback, 'id' | 'timestamp' | 'appliedStatus'>): AgentFeedback {
    const list = this.getFeedback();
    const item: AgentFeedback = {
      id: `FB-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      appliedStatus: 'Under Review',
      ...feedback
    };
    list.unshift(item);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list));
    return item;
  }

  // Orchestrator: Parse Input, Detect Intent & Route
  static processUserQuery(input: string, user: string = 'Admin User'): {
    responseMessage: string;
    intent: string;
    moduleId: ModuleId;
    moduleName: string;
    agentId: AgentId;
    agentName: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    requiresConfirmation: boolean;
    confirmation?: AiActionConfirmation;
    sources?: { title: string; category: string; snippet: string }[];
    executedAction?: { label: string; success: boolean; data?: any };
    suggestedFollowups?: string[];
  } {
    const q = input.toLowerCase().trim();

    // 1. TICKET RESOLUTION: Complaint / Issue / Maintenance
    if (
      q.includes('ac ') ||
      q.includes('air conditioning') ||
      q.includes('hvac') ||
      q.includes('leak') ||
      q.includes('broken') ||
      q.includes('not working') ||
      q.includes('maintenance complaint') ||
      q.includes('create complaint') ||
      q.includes('repair') ||
      q.includes('electrical')
    ) {
      const isCritical = q.includes('server') || q.includes('fire') || q.includes('blackout') || q.includes('flood');
      const priority = isCritical ? 'Critical' : q.includes('boardroom') || q.includes('executive') ? 'High' : 'Medium';
      const sla = priority === 'Critical' ? 2 : priority === 'High' ? 4 : 8;

      const confirmation: AiActionConfirmation = {
        id: `CONF-${Date.now()}`,
        intent: 'Maintenance Complaint Creation',
        moduleName: 'Facility Maintenance AI',
        moduleId: 'facility',
        agentId: 'ticket_resolution',
        action: `Create ${priority} priority maintenance ticket with ${sla}h SLA`,
        priority,
        slaHours: sla,
        escalationPolicy: isCritical ? 'Escalate to Admin VP if unassigned after 30 mins' : 'Standard escalation after 50% SLA',
        details: {
          title: input.length > 80 ? input.slice(0, 77) + '...' : input,
          category: q.includes('ac') || q.includes('hvac') ? 'HVAC / AC' : q.includes('water') || q.includes('leak') ? 'Plumbing' : 'General Maintenance',
          location: 'Detected from query or User Desk',
          requester: user
        },
        status: 'Pending',
        requiresHumanApproval: true,
        timestamp: new Date().toISOString()
      };

      this.addActivityLog({
        user,
        request: input,
        detectedIntent: 'Maintenance Complaint',
        selectedModule: 'Facility Maintenance AI',
        selectedAgent: 'Ticket Resolution Agent',
        actionPerformed: 'Prepared maintenance ticket proposal requiring user confirmation',
        result: `Proposed ${priority} priority ticket (SLA ${sla}h)`,
        approvalStatus: 'Pending'
      });

      return {
        responseMessage: `I understood your maintenance issue. Since creating work orders alters facility service queues, please confirm the proposed ticket parameters below:`,
        intent: 'Maintenance Complaint',
        moduleId: 'facility',
        moduleName: 'Facility Maintenance AI',
        agentId: 'ticket_resolution',
        agentName: 'Ticket Resolution Agent',
        priority,
        requiresConfirmation: true,
        confirmation,
        suggestedFollowups: ['Confirm Ticket', 'Edit Details', 'Cancel Request']
      };
    }

    // 2. APPROVALS / PENDING WORKFLOWS
    if (q.includes('approval') || q.includes('pending approval') || q.includes('review request')) {
      const gatePasses = StorageService.getGatePasses().filter(g => g.approvalStatus === 'Pending Approval' || (g.approvalStatus as string) === 'Pending');
      const visitors = StorageService.getVisitorRecords().filter(v => !v.preApproved && ((v.status as string) === 'Expected' || v.status === 'Pre-Approved'));
      
      const count = gatePasses.length + visitors.length;

      this.addActivityLog({
        user,
        request: input,
        detectedIntent: 'Pending Approvals Query',
        selectedModule: 'Gate Pass AI',
        selectedAgent: 'Workflow Automation Agent',
        actionPerformed: `Audited pending approvals across Gate Pass and Visitor modules (${count} found)`,
        result: `${count} pending approval items requiring authorization`,
        approvalStatus: 'Auto-Executed'
      });

      return {
        responseMessage: `You have ${count} pending authorization request(s):\n• Gate Passes awaiting approval: ${gatePasses.length}\n• Visitors awaiting verification: ${visitors.length}\n\nWould you like to authorize these sequentially or review individual details?`,
        intent: 'Pending Approvals Audit',
        moduleId: 'gatepass',
        moduleName: 'Gate Pass AI',
        agentId: 'workflow_automation',
        agentName: 'Workflow Automation Agent',
        priority: 'High',
        requiresConfirmation: false,
        executedAction: {
          label: 'View Gate Pass Approvals Desk',
          success: true,
          data: { pendingGatePasses: gatePasses, pendingVisitors: visitors }
        },
        suggestedFollowups: ['Show open gate passes.', 'Show visitor list.', 'Go to Gate Pass Module']
      };
    }

    // 3. VISITOR LOOKUP
    if (q.includes('visitor') || q.includes('guest') || q.includes('check in') || q.includes('john')) {
      const visitors = StorageService.getVisitorRecords();
      const match = q.includes('john') 
        ? visitors.find(v => v.name.toLowerCase().includes('john') || v.hostEmployee.toLowerCase().includes('john'))
        : visitors[0];

      const found = match || visitors[0];

      this.addActivityLog({
        user,
        request: input,
        detectedIntent: 'Visitor Status Lookup',
        selectedModule: 'Visitor Management AI',
        selectedAgent: 'Data & Insight Agent',
        actionPerformed: `Searched visitor directory for "${input}"`,
        result: found ? `Located ${found.name} (${found.status})` : 'Visitor not found',
        approvalStatus: 'Auto-Executed'
      });

      return {
        responseMessage: found 
          ? `Found Visitor Record:\n• Name: ${found.name}\n• Company: ${found.company}\n• Host Employee: ${found.hostEmployee}\n• Status: ${found.status}\n• Gate: ${found.gateNumber}\n• Security QR: ${found.qrCode}`
          : `No matching visitor found for "${input}". Would you like to register a new visitor pass?`,
        intent: 'Visitor Lookup',
        moduleId: 'visitor',
        moduleName: 'Visitor Management AI',
        agentId: 'data_insight',
        agentName: 'Data & Insight Agent',
        priority: 'Medium',
        requiresConfirmation: false,
        suggestedFollowups: ['Pre-approve new visitor', 'View all active campus visitors', 'Open Visitor AI']
      };
    }

    // 4. TRANSPORT & VEHICLE
    if (q.includes('vehicle') || q.includes('car') || q.includes('transport') || q.includes('driver') || q.includes('cab')) {
      const transport = StorageService.getTransportBookings();
      const confirmed = transport.filter(t => t.status === 'Scheduled' || t.status === 'On Route' || (t.status as string) === 'Confirmed' || (t.status as string) === 'In Transit');

      this.addActivityLog({
        user,
        request: input,
        detectedIntent: 'Fleet Availability Check',
        selectedModule: 'Transport Management AI',
        selectedAgent: 'Data & Insight Agent',
        actionPerformed: 'Checked active vehicle pool and bookings',
        result: `${transport.length} total bookings, ${confirmed.length} currently engaged`,
        approvalStatus: 'Auto-Executed'
      });

      return {
        responseMessage: `Corporate Fleet Status:\n• Active / Scheduled Trips: ${confirmed.length}\n• Electric Vehicles (EV) In Hub: 3 ready for dispatch\n• Airport Shuttle 1: On-schedule\n\nWould you like to book a vehicle or inspect current routes?`,
        intent: 'Fleet Availability Check',
        moduleId: 'transport',
        moduleName: 'Transport Management AI',
        agentId: 'data_insight',
        agentName: 'Data & Insight Agent',
        priority: 'Low',
        requiresConfirmation: false,
        suggestedFollowups: ['Book a new corporate vehicle', 'Check driver assignments', 'Open Transport AI']
      };
    }

    // 5. GATE PASSES
    if (q.includes('gate pass') || q.includes('outward') || q.includes('material pass')) {
      const passes = StorageService.getGatePasses();
      const approved = passes.filter(p => p.approvalStatus === 'Approved');

      this.addActivityLog({
        user,
        request: input,
        detectedIntent: 'Gate Pass Status Inquiry',
        selectedModule: 'Gate Pass AI',
        selectedAgent: 'Workflow Automation Agent',
        actionPerformed: 'Audited enterprise material outward passes',
        result: `${passes.length} total passes (${approved.length} approved)`,
        approvalStatus: 'Auto-Executed'
      });

      return {
        responseMessage: `Gate Pass Register Summary:\n• Total Passes on Record: ${passes.length}\n• Approved & Ready at Gate: ${approved.length}\n• Pending Clearance: ${passes.length - approved.length}\n\nLatest Pass: ${passes[0]?.passNumber} - ${passes[0]?.itemDescription} (${passes[0]?.approvalStatus})`,
        intent: 'Gate Pass Audit',
        moduleId: 'gatepass',
        moduleName: 'Gate Pass AI',
        agentId: 'workflow_automation',
        agentName: 'Workflow Automation Agent',
        priority: 'Medium',
        requiresConfirmation: false,
        suggestedFollowups: ['Create outward material pass', 'Show pending approvals', 'Open Gate Pass AI']
      };
    }

    // 6. HOUSEKEEPING TASKS
    if (q.includes('housekeeping') || q.includes('cleaning') || q.includes('sanitation') || q.includes('washroom') || q.includes('restroom')) {
      const tasks = StorageService.getHousekeepingTasks();
      const pending = tasks.filter(t => t.status !== 'Completed' && (t.status as string) !== 'Supervised & Passed');

      this.addActivityLog({
        user,
        request: input,
        detectedIntent: 'Housekeeping Duty Inspection',
        selectedModule: 'Housekeeping & Facility AI',
        selectedAgent: 'Ticket Resolution Agent',
        actionPerformed: `Audited housekeeping inspection roster (${pending.length} pending tasks)`,
        result: `${pending.length} tasks scheduled today`,
        approvalStatus: 'Auto-Executed'
      });

      return {
        responseMessage: `Housekeeping Duty Schedule Today:\n• Total Tasks: ${tasks.length}\n• Pending Sanitation Checks: ${pending.length}\n• Next Task: ${pending[0]?.areaName || pending[0]?.areaZone || 'Campus Central'}\n• Shift: ${pending[0]?.inspectionTimeSlot || pending[0]?.shift || 'Morning'}\n• Assigned Staff: ${pending[0]?.assignedStaff || 'On Duty'}`,
        intent: 'Housekeeping Status',
        moduleId: 'housekeeping',
        moduleName: 'Housekeeping & Facility AI',
        agentId: 'ticket_resolution',
        agentName: 'Ticket Resolution Agent',
        priority: 'Low',
        requiresConfirmation: false,
        suggestedFollowups: ['Mark restroom clean', 'Request deep cleaning', 'Open Housekeeping AI']
      };
    }

    // 7. ENERGY & UTILITIES
    if (q.includes('energy') || q.includes('power') || q.includes('consumption') || q.includes('solar') || q.includes('electricity') || q.includes('utility')) {
      const logs = StorageService.getUtilityLogs();
      const highAlerts = logs.filter(l => l.peakAlertTriggered || l.status === 'Peak Surge Alert');

      this.addActivityLog({
        user,
        request: input,
        detectedIntent: 'Utilities Energy Monitoring',
        selectedModule: 'Utilities & Energy AI',
        selectedAgent: 'Data & Insight Agent',
        actionPerformed: 'Scanned smart meter telemetry for peak power spikes',
        result: `${highAlerts.length} high consumption alerts detected`,
        approvalStatus: 'Auto-Executed'
      });

      return {
        responseMessage: `Smart Energy & Power Telemetry:\n• Active Meters Monitored: ${logs.length}\n• Peak Consumption Alerts: ${highAlerts.length > 0 ? `${highAlerts.length} active (Floor 2 HVAC)` : 'Normal levels'}\n• Solar Offset: Generating 24% of campus baseline power.\n• Estimated Monthly Savings: ₹1,42,000`,
        intent: 'Energy Monitoring',
        moduleId: 'utilities',
        moduleName: 'Utilities & Energy AI',
        agentId: 'data_insight',
        agentName: 'Data & Insight Agent',
        priority: highAlerts.length > 0 ? 'High' : 'Low',
        requiresConfirmation: false,
        suggestedFollowups: ['Show high energy alerts', 'Check solar array power', 'Open Utilities AI']
      };
    }

    // 8. VENDOR AMC EXPIRY
    if (q.includes('vendor') || q.includes('amc') || q.includes('contract') || q.includes('supplier')) {
      const vendors = StorageService.getVendorRecords();
      const expiring = vendors.filter(v => v.amcStatus === 'Expiring Soon');

      this.addActivityLog({
        user,
        request: input,
        detectedIntent: 'Vendor AMC Compliance Audit',
        selectedModule: 'Vendor Management AI',
        selectedAgent: 'Workflow Automation Agent',
        actionPerformed: `Audited AMC expiry calendar across ${vendors.length} vendors`,
        result: `${expiring.length} contracts expiring soon`,
        approvalStatus: 'Auto-Executed'
      });

      return {
        responseMessage: `Vendor & AMC Governance:\n• Total Registered Vendors: ${vendors.length}\n• Contracts Expiring Soon: ${expiring.length}\n• Alert: ${expiring[0]?.companyName} (${expiring[0]?.serviceCategory}) AMC ends on ${expiring[0]?.amcEndDate}.\n• Action: Renewal proposal drafted for procurement review.`,
        intent: 'Vendor AMC Expiry Audit',
        moduleId: 'vendor',
        moduleName: 'Vendor Management AI',
        agentId: 'workflow_automation',
        agentName: 'Workflow Automation Agent',
        priority: 'Medium',
        requiresConfirmation: false,
        suggestedFollowups: ['Renew Vendor AMC', 'View Vendor Scores', 'Open Vendor AI']
      };
    }

    // 9. KNOWLEDGE BASE SEARCH: SOP / Policy / Procedure / SLA / Rule
    if (
      q.includes('how do i') ||
      q.includes('procedure') ||
      q.includes('policy') ||
      q.includes('sop') ||
      q.includes('sla for') ||
      q.includes('rule') ||
      q.includes('manual') ||
      q.includes('search document')
    ) {
      const result = KnowledgeSearchService.search(input);

      this.addActivityLog({
        user,
        request: input,
        detectedIntent: 'Knowledge & Policy Retrieval',
        selectedModule: 'Document AI',
        selectedAgent: 'Knowledge Agent',
        actionPerformed: result.notFound ? 'Queried approved knowledge store (No approved document matched)' : `Retrieved approved SOP/Policy: ${result.items[0].title}`,
        result: result.notFound ? 'Not found in approved knowledge base' : `Matched ${result.items.length} approved document(s)`,
        approvalStatus: 'Auto-Executed'
      });

      if (result.notFound || result.items.length === 0) {
        return {
          responseMessage: 'Information not available in the approved knowledge base.',
          intent: 'Knowledge Retrieval',
          moduleId: 'document',
          moduleName: 'Document AI',
          agentId: 'knowledge',
          agentName: 'Knowledge Agent',
          priority: 'Low',
          requiresConfirmation: false,
          suggestedFollowups: ['Show all approved SOPs', 'What is the SLA for maintenance?', 'How to book a vehicle?']
        };
      }

      const topItem = result.items[0];
      return {
        responseMessage: `According to approved document "${topItem.title}" (${topItem.category} v${topItem.version}):\n\n${topItem.content}`,
        intent: 'Knowledge Retrieval',
        moduleId: 'document',
        moduleName: 'Document AI',
        agentId: 'knowledge',
        agentName: 'Knowledge Agent',
        priority: 'Low',
        requiresConfirmation: false,
        sources: [
          {
            title: topItem.title,
            category: topItem.category,
            snippet: topItem.content.slice(0, 160) + '...'
          }
        ],
        suggestedFollowups: ['Show procedure for vehicle booking', 'What is maintenance SLA?', 'View full SOP document']
      };
    }

    // DEFAULT FALLBACK: General Coordinator Assistance
    this.addActivityLog({
      user,
      request: input,
      detectedIntent: 'General Enterprise Query',
      selectedModule: 'Facility Maintenance AI',
      selectedAgent: 'Admin AI Coordinator',
      actionPerformed: 'Coordinated natural language query across all 11 modules',
      result: 'Provided guided command recommendations',
      approvalStatus: 'Auto-Executed'
    });

    return {
      responseMessage: `I processed your request: "${input}". You can ask me to create tickets, check visitor status, track vehicles, audit gate passes, or search approved SOPs. What would you like to do?`,
      intent: 'General Query',
      moduleId: 'facility',
      moduleName: 'Facility Maintenance AI',
      agentId: 'coordinator',
      agentName: 'Admin AI Coordinator',
      priority: 'Low',
      requiresConfirmation: false,
      suggestedFollowups: [
        'Create a maintenance complaint.',
        'Show my pending approvals.',
        'What is the SLA for maintenance complaints?',
        'Show open gate passes.'
      ]
    };
  }

  // Execute Confirmed Sensitive Action
  static executeConfirmedAction(confirmation: AiActionConfirmation, user: string = 'Admin User'): {
    success: boolean;
    message: string;
  } {
    if (confirmation.moduleId === 'facility' && confirmation.action.toLowerCase().includes('ticket')) {
      const tickets = StorageService.getFacilityTickets();
      const newTicketId = `FAC-${1000 + tickets.length + 1}`;
      const newTicket = {
        id: newTicketId,
        title: confirmation.details.title || 'Reported Maintenance Issue',
        category: confirmation.details.category || 'General Maintenance',
        location: confirmation.details.location || 'Floor 1, Admin Wing',
        priority: confirmation.priority,
        assignedTo: confirmation.priority === 'Critical' ? 'Suresh Patil (Senior Specialist)' : 'Duty Technician',
        slaHours: confirmation.slaHours || 8,
        slaDeadline: new Date(Date.now() + (confirmation.slaHours || 8) * 3600 * 1000).toISOString(),
        status: 'Open' as const,
        reportedBy: user,
        createdAt: new Date().toISOString()
      };
      tickets.unshift(newTicket);
      StorageService.saveFacilityTickets(tickets);

      // Notification agent dispatch (Mobile App, SMS, Email, Teams - NO WhatsApp)
      this.addActivityLog({
        user,
        request: confirmation.action,
        detectedIntent: confirmation.intent,
        selectedModule: 'Facility Maintenance AI',
        selectedAgent: 'Notification & Communication Agent',
        actionPerformed: `Dispatched multi-channel notifications (Mobile SMS to +91 98201 44521, Email to Facility Lead, Teams Alert in #facilities-ops)`,
        result: `Ticket ${newTicketId} created and dispatched successfully`,
        approvalStatus: 'Approved'
      });

      return {
        success: true,
        message: `Successfully confirmed & created Ticket ${newTicketId} (${confirmation.priority} priority). Technician assigned and alerts sent via Mobile SMS & Teams.`
      };
    }

    return {
      success: true,
      message: `Action "${confirmation.action}" has been confirmed and registered in the enterprise audit log.`
    };
  }

  // Data & Insight Agent: Compute live KPIs across all 11 modules
  static getOperationalInsights() {
    const facilities = StorageService.getFacilityTickets();
    const visitors = StorageService.getVisitorRecords();
    const transport = StorageService.getTransportBookings();
    const assets = StorageService.getAssetRecords();
    const vendors = StorageService.getVendorRecords();
    const meetings = StorageService.getMeetingBookings();
    const gatePasses = StorageService.getGatePasses();
    const housekeeping = StorageService.getHousekeepingTasks();
    const utilities = StorageService.getUtilityLogs();
    const cafeteria = StorageService.getCafeteriaLogs();
    const docs = StorageService.getDocumentRecords();

    const openComplaints = facilities.filter(f => f.status === 'Open' || f.status === 'In Progress').length;
    const criticalComplaints = facilities.filter(f => f.priority === 'Critical').length;
    const activeVisitors = visitors.filter(v => v.status === 'Checked In').length;
    const expiringVendors = vendors.filter(v => v.amcStatus === 'Expiring Soon').length;
    const pendingGatePasses = gatePasses.filter(g => g.approvalStatus === 'Pending Approval' || (g.approvalStatus as string) === 'Pending').length;
    const pendingCleaning = housekeeping.filter(h => h.status !== 'Completed' && (h.status as string) !== 'Supervised & Passed').length;

    const recommendations: ProcessImprovementRecommendation[] = [
      {
        id: 'REC-001',
        detectedBottleneck: 'Floor 2 HVAC complaint volume exceeds 30-day baseline by 35%',
        module: 'facility',
        recommendation: 'Schedule proactive compressor overhaul with Blue Star under active AMC before summer peak',
        expectedImpact: 'Reduces breakdown probability by 70% and avoids executive floor disruption',
        requiresAdminApproval: true,
        approvalStatus: 'Pending Admin Approval',
        createdAt: '2026-09-20'
      },
      {
        id: 'REC-002',
        detectedBottleneck: 'Meeting Room 4 utilization is only 22% while Sapphire is 92% booked',
        module: 'meeting',
        recommendation: 'Reconfigure Room 4 display equipment to match hybrid Zoom/Teams specifications',
        expectedImpact: 'Balances floor booking distribution and eliminates meeting waitlists',
        requiresAdminApproval: true,
        approvalStatus: 'Pending Admin Approval',
        createdAt: '2026-09-21'
      }
    ];

    const predictiveInsights: PredictiveInsight[] = [
      {
        id: 'PRED-1',
        category: 'SLA breach risk',
        metric: 'FAC-1001 Server Room Cooling',
        prediction: 'Estimated 82% probability of SLA compliance if coolant valve is completed within 45 mins',
        confidence: 82,
        isEstimateNotice: true,
        recommendedAction: 'Keep senior HVAC technician prioritized on site'
      },
      {
        id: 'PRED-2',
        category: 'Energy trends',
        metric: 'Floor 2 HVAC Power Surge',
        prediction: 'Energy consumption projected to rise by +14% if thermal setpoint stays below 22°C',
        confidence: 88,
        isEstimateNotice: true,
        recommendedAction: 'Engage building automation setpoint reset to 24°C at 20:00'
      },
      {
        id: 'PRED-3',
        category: 'Vendor delay patterns',
        metric: 'Apex Guard Shift Transitions',
        prediction: 'Estimated 18% delayed check-in risk during Friday evening shift handovers',
        confidence: 76,
        isEstimateNotice: true,
        recommendedAction: 'Send automated SMS reminders to shift supervisor 30 mins prior'
      }
    ];

    return {
      openComplaints,
      criticalComplaints,
      activeVisitors,
      expiringVendors,
      pendingGatePasses,
      pendingCleaning,
      totalAssets: assets.length,
      totalTransportTrips: transport.length,
      totalMeetingBookings: meetings.length,
      totalUtilityMeters: utilities.length,
      totalCafeteriaMeals: cafeteria.length,
      totalDocuments: docs.length,
      recommendations,
      predictiveInsights
    };
  }

  // Integration Agent: Connectors Status
  static getIntegrationConnectors(): IntegrationConnector[] {
    return [
      {
        id: 'CONN-1',
        name: 'Mobile App Channel',
        channelType: 'Mobile App',
        status: 'Healthy',
        lastSync: 'Just now',
        lastSuccessfulConnection: '2026-09-22 11:50',
        latencyMs: 32
      },
      {
        id: 'CONN-2',
        name: 'Mobile SMS Gateway',
        channelType: 'Mobile SMS',
        status: 'Healthy',
        lastSync: '1 min ago',
        lastSuccessfulConnection: '2026-09-22 11:48',
        latencyMs: 140
      },
      {
        id: 'CONN-3',
        name: 'Web Portal Interface',
        channelType: 'Web Portal',
        status: 'Healthy',
        lastSync: 'Just now',
        lastSuccessfulConnection: '2026-09-22 11:51',
        latencyMs: 18
      },
      {
        id: 'CONN-4',
        name: 'Voice Assistant Speech Engine',
        channelType: 'Voice Assistant',
        status: 'Healthy',
        lastSync: '3 mins ago',
        lastSuccessfulConnection: '2026-09-22 11:47',
        latencyMs: 85
      },
      {
        id: 'CONN-5',
        name: 'Reception Kiosk Terminal',
        channelType: 'Kiosk',
        status: 'Healthy',
        lastSync: '2 mins ago',
        lastSuccessfulConnection: '2026-09-22 11:49',
        latencyMs: 44
      },
      {
        id: 'CONN-6',
        name: 'Microsoft 365 Outlook Mailer',
        channelType: 'Email / Outlook',
        status: 'Healthy',
        lastSync: '5 mins ago',
        lastSuccessfulConnection: '2026-09-22 11:45',
        latencyMs: 210
      },
      {
        id: 'CONN-7',
        name: 'Microsoft Teams Webhook Connector',
        channelType: 'Microsoft Teams',
        status: 'Healthy',
        lastSync: '4 mins ago',
        lastSuccessfulConnection: '2026-09-22 11:46',
        latencyMs: 195
      }
    ];
  }

  // Workflow Automation Agent: Configurable Rules
  static getWorkflowRules(): WorkflowRule[] {
    return [
      {
        id: 'WF-GP-01',
        name: 'Standard Material Outward Gate Pass Workflow',
        module: 'gatepass',
        trigger: 'Material Outward pass requested by employee',
        status: 'Active',
        stages: [
          { order: 1, role: 'Department Supervisor', action: 'Verify material serial numbers & authorization', slaHours: 2, autoEscalate: true },
          { order: 2, role: 'Admin / IT Asset Custodian', action: 'Validate asset register tag & return bond', slaHours: 4, autoEscalate: true },
          { order: 3, role: 'Security Plaza Officer', action: 'Physical baggage inspection & QR token scan', slaHours: 1, autoEscalate: false },
          { order: 4, role: 'Gate Pass Engine', action: 'Issue digital exit receipt & close pass', slaHours: 0, autoEscalate: false }
        ]
      },
      {
        id: 'WF-FAC-02',
        name: 'Critical Infrastructure Breakdown SLA Workflow',
        module: 'facility',
        trigger: 'Critical ticket registered (Server, Power, Fire, Flood)',
        status: 'Active',
        stages: [
          { order: 1, role: 'Senior HVAC / Duty Specialist', action: 'Accept ticket & mobilize replacement spares', slaHours: 0.5, autoEscalate: true },
          { order: 2, role: 'Admin Operations Lead', action: 'Receive SLA warning at 50% time elapsed', slaHours: 1, autoEscalate: true },
          { order: 3, role: 'Admin Vice President', action: 'Executive escalation if resolution exceeds 2 hours', slaHours: 2, autoEscalate: false }
        ]
      },
      {
        id: 'WF-VND-03',
        name: 'Quarterly Vendor AMC Renewal Workflow',
        module: 'vendor',
        trigger: 'AMC expiration within 60 days',
        status: 'Active',
        stages: [
          { order: 1, role: 'Procurement Specialist', action: 'Calculate performance score and SLA compliance %', slaHours: 48, autoEscalate: true },
          { order: 2, role: 'Finance Controller', action: 'Review invoice ledger & budget capex allocation', slaHours: 72, autoEscalate: true },
          { order: 3, role: 'Admin Director', action: 'Sign digital AMC contract extension', slaHours: 24, autoEscalate: false }
        ]
      }
    ];
  }
}
