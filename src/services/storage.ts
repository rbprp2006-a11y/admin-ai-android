import {
  FacilityTicket,
  VisitorRecord,
  TransportBooking,
  AssetRecord,
  VendorRecord,
  MeetingRoomBooking,
  GatePassRecord,
  HousekeepingTask,
  UtilityMeterLog,
  CafeteriaDailyLog,
  DocumentAiRecord,
  AdminNotification,
  AdminTaskItem,
  Language,
} from '../types/modules';

const STORAGE_KEYS = {
  FACILITY: 'admin_ai_facility_tickets',
  VISITOR: 'admin_ai_visitor_records',
  TRANSPORT: 'admin_ai_transport_bookings',
  ASSET: 'admin_ai_asset_records',
  VENDOR: 'admin_ai_vendor_records',
  MEETING: 'admin_ai_meeting_bookings',
  GATEPASS: 'admin_ai_gatepass_records',
  HOUSEKEEPING: 'admin_ai_housekeeping_tasks',
  UTILITIES: 'admin_ai_utility_logs',
  CAFETERIA: 'admin_ai_cafeteria_logs',
  DOCUMENT: 'admin_ai_document_records',
  NOTIFICATIONS: 'admin_ai_notifications',
  TASKS: 'admin_ai_tasks',
  LANG: 'admin_ai_language',
  THEME: 'admin_ai_theme',
};

// Initial realistic enterprise seed data
const initialFacilityTickets: FacilityTicket[] = [
  {
    id: 'FAC-1001',
    title: 'HVAC Airflow Failure in Data Server Room 2B',
    category: 'HVAC / AC',
    location: 'Floor 2, Wing B, Server Rack A4',
    priority: 'Critical',
    assignedTo: 'Suresh Patil (Senior HVAC Specialist)',
    slaHours: 2,
    slaDeadline: new Date(Date.now() + 1.5 * 3600 * 1000).toISOString(),
    status: 'In Progress',
    reportedBy: 'DevOps Ops Desk',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resolutionNotes: 'Compressor valve inspected; coolant replenishment in progress.',
  },
  {
    id: 'FAC-1002',
    title: 'Executive Boardroom Display HDMI Interface Broken',
    category: 'Network / IT',
    location: 'Floor 5, Boardroom Sapphire',
    priority: 'High',
    assignedTo: 'Vikram Joshi (Audio Visual Lead)',
    slaHours: 4,
    slaDeadline: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    status: 'Open',
    reportedBy: 'Executive Secretary',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'FAC-1003',
    title: 'Restroom 3F Sensor Tap Water Leakage',
    category: 'Plumbing',
    location: 'Floor 3, East Restroom',
    priority: 'Medium',
    assignedTo: 'Manoj Shinde',
    slaHours: 8,
    slaDeadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    status: 'Resolved',
    reportedBy: 'Housekeeping Supervisor',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    resolutionNotes: 'Solenoid gasket replaced and water pressure calibrated.',
  }
];

const initialVisitorRecords: VisitorRecord[] = [
  {
    id: 'VIS-2001',
    name: 'Rajesh Agrawal',
    phone: '+91 98201 44521',
    company: 'Siemens Industrial Automation',
    hostEmployee: 'Neha Kulkarni (Facilities Director)',
    purpose: 'Quarterly Building Automation Audit',
    preApproved: true,
    gateNumber: 'Gate 1 (Main Security Plaza)',
    checkInTime: '09:45 AM',
    qrCode: 'QR-VIS-2001-SEC',
    faceRecognitionStatus: 'Verified',
    status: 'Checked In',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'VIS-2002',
    name: 'Pooja Deshmukh',
    phone: '+91 98450 11209',
    company: 'Tata Consultancy Services',
    hostEmployee: 'Amit Verma (Procurement Head)',
    purpose: 'Vendor SOW Contract Signing',
    preApproved: true,
    gateNumber: 'Gate 2 (Visitor Lobby)',
    qrCode: 'QR-VIS-2002-SEC',
    faceRecognitionStatus: 'Pending',
    status: 'Pre-Approved',
    createdAt: new Date().toISOString(),
  }
];

const initialTransportBookings: TransportBooking[] = [
  {
    id: 'TRP-3001',
    vehicleNumber: 'MH 12 QX 4501',
    vehicleType: 'Electric Van',
    driverName: 'Santosh Gaikwad',
    driverPhone: '+91 97654 33210',
    routeStart: 'Campus HQ Terminal',
    routeEnd: 'Pune International Airport T2',
    departureTime: '11:30 AM',
    passengers: 4,
    assignedDepartment: 'Executive Leadership',
    status: 'Scheduled',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TRP-3002',
    vehicleNumber: 'MH 14 BF 8892',
    vehicleType: 'Shuttle Bus (32-seater)',
    driverName: 'Ramesh Pawar',
    driverPhone: '+91 98902 44102',
    routeStart: 'Campus HQ Terminal',
    routeEnd: 'Metro Junction Station (Loop 3)',
    departureTime: '10:00 AM',
    passengers: 28,
    assignedDepartment: 'Employee Transit Services',
    status: 'On Route',
    createdAt: new Date().toISOString(),
  }
];

const initialAssetRecords: AssetRecord[] = [
  {
    id: 'AST-4001',
    assetTag: 'AST-2026-0042',
    name: 'Cisco Core Switch Catalyst 9300',
    category: 'IT Hardware',
    floorLocation: 'Floor 1, Primary Server Hub',
    assignedUser: 'Infrastructure NOC Team',
    purchaseCost: 345000,
    condition: 'Good',
    qrCode: 'QR-AST-4001-9300',
    warrantyExpiry: '2028-11-30',
    lifecycleStage: 'Allocated',
    lastAudited: '2026-08-15',
  },
  {
    id: 'AST-4002',
    assetTag: 'AST-2026-0189',
    name: 'Herman Miller Aeron Ergonomic Chair',
    category: 'Furniture',
    floorLocation: 'Floor 4, Workstation 4-D12',
    assignedUser: 'Sunil Rao (Product VP)',
    purchaseCost: 89000,
    condition: 'Brand New',
    qrCode: 'QR-AST-4002-AERON',
    warrantyExpiry: '2036-05-12',
    lifecycleStage: 'Allocated',
    lastAudited: '2026-09-01',
  }
];

const initialVendorRecords: VendorRecord[] = [
  {
    id: 'VND-5001',
    companyName: 'Blue Star Climate Solutions Ltd.',
    serviceCategory: 'HVAC Maintenance',
    contactPerson: 'Anand Mehta',
    phone: '+91 98220 55114',
    email: 'corporate.service@bluestar.in',
    amcStatus: 'Active',
    amcEndDate: '2027-03-31',
    pendingPoCount: 1,
    pendingInvoicesAmount: 185000,
    performanceScore: 4.8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'VND-5002',
    companyName: 'Apex Guard Facility & Security Services',
    serviceCategory: 'Security Personnel',
    contactPerson: 'Col. K. R. Nair',
    phone: '+91 98811 77652',
    email: 'operations@apexguard.com',
    amcStatus: 'Expiring Soon',
    amcEndDate: '2026-10-15',
    pendingPoCount: 2,
    pendingInvoicesAmount: 420000,
    performanceScore: 4.6,
    createdAt: new Date().toISOString(),
  }
];

const initialMeetingBookings: MeetingRoomBooking[] = [
  {
    id: 'MR-6001',
    roomName: 'Boardroom Sapphire (20p)',
    organizer: 'Priya Sharma (Admin VP)',
    title: 'Quarterly Infrastructure & Capex Review',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:30',
    attendeesCount: 16,
    calendarSynced: true,
    autoCheckedIn: true,
    status: 'In Session',
  },
  {
    id: 'MR-6002',
    roomName: 'Emerald Conference (12p)',
    organizer: 'Rohan Mehta (Security Ops)',
    title: 'Disaster Recovery & Fire Drill Briefing',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    attendeesCount: 10,
    calendarSynced: true,
    autoCheckedIn: false,
    status: 'Confirmed',
  }
];

const initialGatePasses: GatePassRecord[] = [
  {
    id: 'GP-7001',
    passNumber: 'GP-2026-0412',
    passType: 'Material Outward',
    requesterName: 'Alok Bansal (IT Support)',
    department: 'Corporate IT',
    itemDescription: '6x Lenovo ThinkPad Laptops for Motherboard Replacement',
    quantity: '6 Units (Serial Nos attached)',
    approverName: 'Deepak Saxena (Head of IT)',
    approvalStatus: 'Approved',
    securityVerification: 'Verified at Gate',
    qrToken: 'GP-SEC-TOKEN-0412',
    validUntil: 'Today 18:00',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'GP-7002',
    passNumber: 'GP-2026-0413',
    passType: 'Contractor Entry',
    requesterName: 'Voltas Chillers Team',
    department: 'Facilities Engineering',
    itemDescription: 'Refrigerant R-410A Cylinders & Manifold Gauges',
    quantity: '2 Cylinders + 1 Toolkit',
    approverName: 'Neha Kulkarni (Facilities Lead)',
    approvalStatus: 'Pending Approval',
    securityVerification: 'Pending Verification',
    qrToken: 'GP-SEC-TOKEN-0413',
    validUntil: 'Tomorrow 20:00',
    createdAt: new Date().toISOString(),
  }
];

const initialHousekeepingTasks: HousekeepingTask[] = [
  {
    id: 'HK-8001',
    areaZone: 'Wing A - 3rd Floor Workstation & Washroom Zone',
    shift: 'Morning (07:00 - 15:00)',
    supervisor: 'Sunita Kambale',
    assignedStaff: 'Kavita M. & Rahul D.',
    checklists: [
      { id: '1', label: 'Dust and sanitize all meeting table surfaces', done: true },
      { id: '2', label: 'Restock paper towels and automated soap dispensers', done: true },
      { id: '3', label: 'Empty waste segregation bins (dry & wet)', done: true },
      { id: '4', label: 'HEPA floor vacuuming & disinfectant mop', done: false }
    ],
    completionPercentage: 75,
    status: 'In Progress',
    inspectionNotes: 'Floor mopping delayed due to morning townhall; scheduled at 11:30 AM.',
    updatedAt: new Date().toISOString(),
  }
];

const initialUtilityLogs: UtilityMeterLog[] = [
  {
    id: 'UTL-9001',
    meterId: 'MTR-GRID-01',
    utilityType: 'Grid Electricity',
    currentReading: 142580.4,
    unit: 'kWh',
    dailyConsumption: 1840.2,
    estimatedCost: 18402,
    recordedDate: new Date().toISOString().split('T')[0],
    status: 'Normal',
    remarks: 'Peak load within sanctioned 450 kVA capacity.'
  },
  {
    id: 'UTL-9002',
    meterId: 'MTR-WATER-02',
    utilityType: 'Fresh Water Supply',
    currentReading: 4892.0,
    unit: 'kL',
    dailyConsumption: 42.5,
    estimatedCost: 2125,
    recordedDate: new Date().toISOString().split('T')[0],
    status: 'Energy Efficient',
    remarks: 'STP recycled water handling 60% of flush/cooling loads.'
  }
];

const initialCafeteriaLogs: CafeteriaDailyLog[] = [
  {
    id: 'CAF-10001',
    date: new Date().toISOString().split('T')[0],
    mealType: 'Executive Lunch',
    expectedHeadcount: 420,
    actualServed: 395,
    foodWastageKg: 8.4,
    costPerMeal: 135,
    wasteReductionRate: 92.5,
    status: 'Optimal',
    notes: 'AI predicted headcount matched within 6% deviation.'
  }
];

const initialDocumentRecords: DocumentAiRecord[] = [
  {
    id: 'DOC-11001',
    title: 'FY2026-27 Fire & Safety NOC Certificate',
    category: 'Safety & Fire NOC',
    uploadedBy: 'Compliance Cell',
    fileSize: '2.4 MB PDF',
    uploadDate: '2026-09-10',
    ocrStatus: 'Extracted',
    ocrSummary: 'Extracted: CFO Approval No. MH-FIRE-2026/891. Valid through 31 Aug 2027. Sprinkler & Hydrant tests passed with 8.5 bar pressure.',
    confidenceScore: 98.4,
    tags: ['Safety', 'Fire NOC', 'Govt Regulatory', 'Valid till 2027']
  },
  {
    id: 'DOC-11002',
    title: 'Blue Star Master AMC Agreement Annexure B',
    category: 'Vendor Contracts (AMC)',
    uploadedBy: 'Legal Desk',
    fileSize: '4.8 MB PDF',
    uploadDate: '2026-08-20',
    ocrStatus: 'Extracted',
    ocrSummary: 'Extracted: Contract Term 24 months. Quarterly preventive inspections. 2-hour SLA response for critical chilled water coils.',
    confidenceScore: 99.1,
    tags: ['AMC', 'Blue Star', 'HVAC', 'SLA Mandate']
  }
];

const initialNotifications: AdminNotification[] = [
  {
    id: 'NOTIF-1',
    moduleId: 'facility',
    title: 'Urgent SLA Warning',
    message: 'HVAC Airflow Failure in Data Server Room 2B has 90 mins remaining in SLA.',
    timestamp: '15m ago',
    priority: 'high',
    read: false,
    actionRequired: true,
  },
  {
    id: 'NOTIF-2',
    moduleId: 'visitor',
    title: 'Visitor Arrival Alert',
    message: 'Rajesh Agrawal (Siemens Automation) has successfully checked in at Gate 1.',
    timestamp: '35m ago',
    priority: 'normal',
    read: false,
  },
  {
    id: 'NOTIF-3',
    moduleId: 'gatepass',
    title: 'Gate Pass Approval Requested',
    message: 'GP-2026-0413 (Contractor Entry) awaits approval by Neha Kulkarni.',
    timestamp: '1h ago',
    priority: 'normal',
    read: true,
    actionRequired: true,
  }
];

const initialTasks: AdminTaskItem[] = [
  {
    id: 'TSK-1',
    moduleId: 'facility',
    title: 'Review HVAC SLA Escalation in Server Room 2B',
    description: 'Ensure technician replaces coolant valve before 12:00 PM cutoff.',
    dueDate: 'Today 12:00 PM',
    priority: 'Critical',
    status: 'In Progress',
    category: 'Facilities'
  },
  {
    id: 'TSK-2',
    moduleId: 'gatepass',
    title: 'Authorize Contractor Entry Pass GP-2026-0413',
    description: 'Verify Voltas Chiller technician credentials and tools list.',
    dueDate: 'Today 02:00 PM',
    priority: 'High',
    status: 'Pending',
    category: 'Security'
  },
  {
    id: 'TSK-3',
    moduleId: 'vendor',
    title: 'Initiate AMC Renewal with Apex Guard Security',
    description: 'Current contract expires in 23 days. Request updated quotation.',
    dueDate: '25 Sep 2026',
    priority: 'Medium',
    status: 'Pending',
    category: 'Contracts'
  },
  {
    id: 'TSK-4',
    moduleId: 'housekeeping',
    title: 'Sign Off 3rd Floor Morning Deep Clean Checklist',
    description: 'Perform visual inspection of restroom sanitization.',
    dueDate: 'Today 03:00 PM',
    priority: 'Medium',
    status: 'Pending',
    category: 'Housekeeping'
  }
];

// Helper to load or initialize
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to store data for ${key}`, e);
  }
}

export const StorageService = {
  // Facility Tickets
  getFacilityTickets: (): FacilityTicket[] => getStored(STORAGE_KEYS.FACILITY, initialFacilityTickets),
  saveFacilityTickets: (data: FacilityTicket[]) => setStored(STORAGE_KEYS.FACILITY, data),

  // Visitor Management
  getVisitorRecords: (): VisitorRecord[] => getStored(STORAGE_KEYS.VISITOR, initialVisitorRecords),
  saveVisitorRecords: (data: VisitorRecord[]) => setStored(STORAGE_KEYS.VISITOR, data),

  // Transport Management
  getTransportBookings: (): TransportBooking[] => getStored(STORAGE_KEYS.TRANSPORT, initialTransportBookings),
  saveTransportBookings: (data: TransportBooking[]) => setStored(STORAGE_KEYS.TRANSPORT, data),

  // Asset Management
  getAssetRecords: (): AssetRecord[] => getStored(STORAGE_KEYS.ASSET, initialAssetRecords),
  saveAssetRecords: (data: AssetRecord[]) => setStored(STORAGE_KEYS.ASSET, data),

  // Vendor Management
  getVendorRecords: (): VendorRecord[] => getStored(STORAGE_KEYS.VENDOR, initialVendorRecords),
  saveVendorRecords: (data: VendorRecord[]) => setStored(STORAGE_KEYS.VENDOR, data),

  // Meeting Room
  getMeetingBookings: (): MeetingRoomBooking[] => getStored(STORAGE_KEYS.MEETING, initialMeetingBookings),
  saveMeetingBookings: (data: MeetingRoomBooking[]) => setStored(STORAGE_KEYS.MEETING, data),

  // Gate Pass
  getGatePasses: (): GatePassRecord[] => getStored(STORAGE_KEYS.GATEPASS, initialGatePasses),
  saveGatePasses: (data: GatePassRecord[]) => setStored(STORAGE_KEYS.GATEPASS, data),

  // Housekeeping
  getHousekeepingTasks: (): HousekeepingTask[] => getStored(STORAGE_KEYS.HOUSEKEEPING, initialHousekeepingTasks),
  saveHousekeepingTasks: (data: HousekeepingTask[]) => setStored(STORAGE_KEYS.HOUSEKEEPING, data),

  // Utilities & Energy
  getUtilityLogs: (): UtilityMeterLog[] => getStored(STORAGE_KEYS.UTILITIES, initialUtilityLogs),
  saveUtilityLogs: (data: UtilityMeterLog[]) => setStored(STORAGE_KEYS.UTILITIES, data),

  // Cafeteria AI
  getCafeteriaLogs: (): CafeteriaDailyLog[] => getStored(STORAGE_KEYS.CAFETERIA, initialCafeteriaLogs),
  saveCafeteriaLogs: (data: CafeteriaDailyLog[]) => setStored(STORAGE_KEYS.CAFETERIA, data),

  // Document AI
  getDocumentRecords: (): DocumentAiRecord[] => getStored(STORAGE_KEYS.DOCUMENT, initialDocumentRecords),
  saveDocumentRecords: (data: DocumentAiRecord[]) => setStored(STORAGE_KEYS.DOCUMENT, data),

  // Notifications
  getNotifications: (): AdminNotification[] => getStored(STORAGE_KEYS.NOTIFICATIONS, initialNotifications),
  saveNotifications: (data: AdminNotification[]) => setStored(STORAGE_KEYS.NOTIFICATIONS, data),

  // Tasks
  getTasks: (): AdminTaskItem[] => getStored(STORAGE_KEYS.TASKS, initialTasks),
  saveTasks: (data: AdminTaskItem[]) => setStored(STORAGE_KEYS.TASKS, data),

  // Settings
  getLanguage: (): Language => (localStorage.getItem(STORAGE_KEYS.LANG) as Language) || 'en',
  setLanguage: (lang: Language) => localStorage.setItem(STORAGE_KEYS.LANG, lang),

  getTheme: (): 'light' | 'dark' => (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light',
  setTheme: (theme: 'light' | 'dark') => localStorage.setItem(STORAGE_KEYS.THEME, theme),

  // Reset database to initial enterprise state
  resetAll: () => {
    localStorage.clear();
    setStored(STORAGE_KEYS.FACILITY, initialFacilityTickets);
    setStored(STORAGE_KEYS.VISITOR, initialVisitorRecords);
    setStored(STORAGE_KEYS.TRANSPORT, initialTransportBookings);
    setStored(STORAGE_KEYS.ASSET, initialAssetRecords);
    setStored(STORAGE_KEYS.VENDOR, initialVendorRecords);
    setStored(STORAGE_KEYS.MEETING, initialMeetingBookings);
    setStored(STORAGE_KEYS.GATEPASS, initialGatePasses);
    setStored(STORAGE_KEYS.HOUSEKEEPING, initialHousekeepingTasks);
    setStored(STORAGE_KEYS.UTILITIES, initialUtilityLogs);
    setStored(STORAGE_KEYS.CAFETERIA, initialCafeteriaLogs);
    setStored(STORAGE_KEYS.DOCUMENT, initialDocumentRecords);
    setStored(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    setStored(STORAGE_KEYS.TASKS, initialTasks);
  },

  // Export any dataset as downloadable CSV
  exportToCsv: (filename: string, rows: Record<string, any>[]) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map(row => {
          return keys
            .map(k => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              if (typeof cell === 'object') {
                cell = JSON.stringify(cell).replace(/"/g, '""');
              } else {
                cell = cell.toString().replace(/"/g, '""');
              }
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
