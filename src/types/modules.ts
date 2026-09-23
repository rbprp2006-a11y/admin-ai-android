export type Language = 'en' | 'hi' | 'mr';

export type BottomTab = 'home' | 'tasks' | 'notifications' | 'profile';

export type ModuleId =
  | 'facility'
  | 'visitor'
  | 'transport'
  | 'asset'
  | 'vendor'
  | 'meeting'
  | 'gatepass'
  | 'housekeeping'
  | 'utilities'
  | 'cafeteria'
  | 'document';

// 1. Facility Maintenance
export interface FacilityTicket {
  id: string;
  title: string;
  category: 'Electrical' | 'Plumbing' | 'HVAC / AC' | 'Carpentry' | 'Civil' | 'Network / IT';
  location: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo: string;
  slaHours: number;
  slaDeadline: string; // ISO
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  reportedBy: string;
  createdAt: string;
  resolutionNotes?: string;
}

// 2. Visitor Management
export interface VisitorRecord {
  id: string;
  name: string;
  phone: string;
  company: string;
  hostEmployee: string;
  purpose: string;
  preApproved: boolean;
  gateNumber: string;
  checkInTime?: string;
  checkOutTime?: string;
  qrCode: string;
  faceRecognitionStatus: 'Verified' | 'Pending' | 'Not Configured';
  status: 'Pre-Approved' | 'Checked In' | 'Checked Out' | 'Denied';
  createdAt: string;
}

// 3. Transport Management
export interface TransportBooking {
  id: string;
  vehicleNumber: string;
  vehicleType: 'Sedan' | 'SUV' | 'Minibus (14-seater)' | 'Shuttle Bus (32-seater)' | 'Electric Van';
  driverName: string;
  driverPhone: string;
  routeStart: string;
  routeEnd: string;
  departureTime: string;
  passengers: number;
  assignedDepartment: string;
  status: 'Scheduled' | 'On Route' | 'Completed' | 'Cancelled';
  createdAt: string;
}

// 4. Asset Management
export interface AssetRecord {
  id: string;
  assetTag: string; // e.g. AST-2026-0042
  name: string;
  category: 'IT Hardware' | 'Furniture' | 'HVAC Equipment' | 'Security Device' | 'Pantry Machine';
  floorLocation: string;
  assignedUser: string;
  purchaseCost: number;
  condition: 'Brand New' | 'Good' | 'Fair' | 'Maintenance Required' | 'Scrapped';
  qrCode: string;
  warrantyExpiry: string;
  lifecycleStage: 'Procured' | 'Allocated' | 'In Repair' | 'Retired';
  lastAudited: string;
}

// 5. Vendor Management
export interface VendorRecord {
  id: string;
  companyName: string;
  serviceCategory: 'Facility Services' | 'Security Personnel' | 'HVAC Maintenance' | 'Catering' | 'Stationery & Office Supplies';
  contactPerson: string;
  phone: string;
  email: string;
  amcStatus: 'Active' | 'Expiring Soon' | 'Expired';
  amcEndDate: string;
  pendingPoCount: number;
  pendingInvoicesAmount: number;
  performanceScore: number; // 1 to 5 stars
  createdAt: string;
}

// 6. Meeting Room Booking
export interface MeetingRoomBooking {
  id: string;
  roomName: 'Boardroom Sapphire (20p)' | 'Emerald Conference (12p)' | 'Ruby Huddle (6p)' | 'Amber Brainstorm (8p)' | 'Diamond Auditorium (50p)';
  organizer: string;
  title: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  attendeesCount: number;
  calendarSynced: boolean;
  autoCheckedIn: boolean;
  status: 'Confirmed' | 'In Session' | 'Completed' | 'Cancelled';
}

// 7. Gate Pass AI
export interface GatePassRecord {
  id: string;
  passNumber: string; // GP-2026-XXXX
  passType: 'Material Inward' | 'Material Outward' | 'Contractor Entry' | 'Employee Asset Relocation';
  requesterName: string;
  department: string;
  itemDescription: string;
  quantity: string;
  approverName: string;
  approvalStatus: 'Pending Approval' | 'Approved' | 'Rejected';
  securityVerification: 'Verified at Gate' | 'Pending Verification';
  qrToken: string;
  validUntil: string;
  createdAt: string;
}

// 8. Housekeeping & Facility AI
export interface HousekeepingTask {
  id: string;
  areaZone: string;
  shift: 'Morning (07:00 - 15:00)' | 'General (09:00 - 18:00)' | 'Evening (14:00 - 22:00)' | 'Night Deep Clean';
  supervisor: string;
  assignedStaff: string;
  checklists: { id: string; label: string; done: boolean }[];
  completionPercentage: number;
  status: 'Pending' | 'In Progress' | 'Supervised & Passed' | 'Action Required';
  inspectionNotes?: string;
  updatedAt: string;
}

// 9. Utilities & Energy AI
export interface UtilityMeterLog {
  id: string;
  meterId: string;
  utilityType: 'Grid Electricity' | 'Solar Power' | 'Fresh Water Supply' | 'Diesel Generator';
  currentReading: number;
  unit: 'kWh' | 'kL' | 'Litres';
  dailyConsumption: number;
  estimatedCost: number;
  recordedDate: string;
  status: 'Normal' | 'Peak Surge Alert' | 'Energy Efficient';
  remarks?: string;
}

// 10. Cafeteria AI
export interface CafeteriaDailyLog {
  id: string;
  date: string;
  mealType: 'Breakfast' | 'Executive Lunch' | 'Evening Tea & Snacks' | 'Night Shift Dinner';
  expectedHeadcount: number;
  actualServed: number;
  foodWastageKg: number;
  costPerMeal: number;
  wasteReductionRate: number; // percentage
  status: 'Log Finalized' | 'Audit Flagged' | 'Optimal';
  notes?: string;
}

// 11. Document AI
export interface DocumentAiRecord {
  id: string;
  title: string;
  category: 'Vendor Contracts (AMC)' | 'Invoices & Receipts' | 'Regulatory Compliance' | 'Safety & Fire NOC' | 'Lease & Property';
  uploadedBy: string;
  fileSize: string;
  uploadDate: string;
  ocrStatus: 'Extracted' | 'Pending OCR' | 'Needs Review';
  ocrSummary: string;
  confidenceScore: number; // 0 to 100
  tags: string[];
}

// Global Notification
export interface AdminNotification {
  id: string;
  moduleId: ModuleId;
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'normal' | 'high';
  read: boolean;
  actionRequired?: boolean;
}

// Global Unified Task
export interface AdminTaskItem {
  id: string;
  moduleId: ModuleId;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed';
  category: string;
}
