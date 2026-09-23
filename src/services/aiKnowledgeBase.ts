import { KnowledgeItem } from '../types/aiAgents';

export const APPROVED_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'KB-SOP-001',
    title: 'Procedure for Visitor Pass & Gate Pass Creation',
    category: 'SOP',
    tags: ['visitor', 'gate pass', 'security', 'entry', 'procedure'],
    sourceDocument: 'ADMIN-SEC-SOP-2026-V2.pdf',
    version: '2.4',
    lastUpdated: '2026-08-10',
    approvedBy: 'Col. K. R. Nair (Chief Security Officer)',
    content: `To create a Visitor Gate Pass:
1. Navigate to Visitor Management AI or Gate Pass AI module.
2. Enter Visitor's full name, mobile number, visiting company, and purpose of visit.
3. Select the host employee from the employee directory.
4. Pre-approval generates an instant secure QR Token sent via Mobile SMS & Mobile App.
5. Upon arrival at Gate 1 or Gate 2, the security desk scans the QR token, captures photo verification, and issues a printed RFID badge.
6. For Material Outward gate passes, Department Head approval and IT/Admin verification are mandatory before security clearance.`
  },
  {
    id: 'KB-SOP-002',
    title: 'Procedure for Corporate Vehicle & Transport Booking',
    category: 'SOP',
    tags: ['vehicle', 'transport', 'booking', 'car', 'driver', 'ev'],
    sourceDocument: 'ADMIN-TRN-SOP-2026-V1.pdf',
    version: '1.8',
    lastUpdated: '2026-07-22',
    approvedBy: 'Neha Kulkarni (Facilities & Fleet Director)',
    content: `Procedure for Corporate Vehicle Booking:
1. Bookings must be requested via the Transport Management AI module at least 4 hours prior to local airport/client visits, or 24 hours prior for inter-city travel.
2. Provide destination, estimated start and return times, number of passengers, and business justification.
3. Corporate electric vehicles (EVs) are prioritized for airport shuttles and city commutes.
4. The Transport AI assigns driver, vehicle registration number, and automated route optimization. Driver details are delivered via Mobile SMS to the traveler.
5. Drivers log odometer readings and toll receipts digitally at trip completion.`
  },
  {
    id: 'KB-POL-003',
    title: 'Service Level Agreement (SLA) for Facility Maintenance Complaints',
    category: 'Policy',
    tags: ['sla', 'maintenance', 'complaint', 'facility', 'hvac', 'electrical', 'plumbing'],
    sourceDocument: 'CORP-ADMIN-SLA-CHARTER-2026.pdf',
    version: '3.1',
    lastUpdated: '2026-09-01',
    approvedBy: 'Priya Sharma (Admin Vice President)',
    content: `Enterprise Facility Maintenance SLAs:
- Critical Priority (Server room HVAC failure, main electrical blackout, building pipe burst): Resolution SLA is 2 hours. Escalates to Admin VP if unassigned after 30 minutes.
- High Priority (Meeting room AV failure, elevator malfunction, water leakage): Resolution SLA is 4 hours.
- Medium Priority (Individual desk lighting, AC airflow adjustment, minor plumbing): Resolution SLA is 8 hours.
- Low Priority (Furniture touch-up, cosmetic painting, general signages): Resolution SLA is 24-48 hours.
Tickets cannot be closed without digital verification by the original requester.`
  },
  {
    id: 'KB-SOP-004',
    title: 'SOP for Vendor Onboarding and AMC Governance',
    category: 'SOP',
    tags: ['vendor', 'amc', 'onboarding', 'procurement', 'compliance'],
    sourceDocument: 'ADMIN-PROC-SOP-VND-04.pdf',
    version: '2.0',
    lastUpdated: '2026-06-15',
    approvedBy: 'Sunil Rao (Procurement VP)',
    content: `SOP for Vendor Onboarding:
1. Vendor submits GSTIN, PAN, ISO certification, bank mandate, and company registration documents.
2. Compliance verification by Legal and Finance departments within 3 working days.
3. Annual Maintenance Contract (AMC) is drafted with defined KPI performance benchmarks (minimum 95% uptime for critical equipment).
4. Automated AMC Expiry alerts trigger at 60 days, 30 days, and 15 days before expiration.
5. Vendor performance is rated quarterly based on punctuality, quality, and invoice accuracy.`
  },
  {
    id: 'KB-POL-005',
    title: 'Meeting Room Reservation and Auto-Release Policy',
    category: 'Policy',
    tags: ['meeting', 'conference', 'boardroom', 'booking', 'release', 'cancellation'],
    sourceDocument: 'CORP-ADMIN-FACILITY-POL-05.pdf',
    version: '1.5',
    lastUpdated: '2026-08-18',
    approvedBy: 'Deepak Saxena (Head of IT & Workspace)',
    content: `Meeting Room Reservation Policy:
1. Meeting rooms can be reserved up to 14 days in advance via Meeting Room AI or Outlook.
2. Attendees count must not exceed maximum room capacity for safety compliance.
3. Auto-Release Rule: If the meeting organizer or attendees do not check in within 15 minutes of the scheduled start time, the room is automatically released for open booking.
4. Food and beverages require prior cafeteria clearance 2 hours prior to executive meetings.`
  },
  {
    id: 'KB-SOP-006',
    title: 'Energy Conservation and High Consumption Alert Thresholds',
    category: 'Policy',
    tags: ['energy', 'utilities', 'electricity', 'meter', 'solar', 'power'],
    sourceDocument: 'CORP-GREEN-CAMPUS-POL-02.pdf',
    version: '2.1',
    lastUpdated: '2026-09-12',
    approvedBy: 'Building Operations Engineering Committee',
    content: `Energy Conservation Guidelines:
1. Main office building operates under smart climate management (target setpoint: 24°C ± 1°C).
2. HVAC automatically modulates to low-occupancy eco mode between 20:00 and 06:00.
3. Automated High Consumption Alert: Triggers whenever hourly power draw exceeds 450 kWh or solar generation drops below 60% of forecast during daylight hours.
4. Energy Audit logs are generated daily and archived in Document AI.`
  },
  {
    id: 'KB-FAQ-007',
    title: 'Housekeeping Sanitation Schedule & Deep Cleaning Frequency',
    category: 'FAQ',
    tags: ['housekeeping', 'cleaning', 'sanitization', 'restroom', 'hygiene'],
    sourceDocument: 'ADMIN-HK-SCHEDULE-2026.pdf',
    version: '1.2',
    lastUpdated: '2026-07-05',
    approvedBy: 'Vikram Joshi (Operations Lead)',
    content: `Housekeeping Sanitation Timetable:
- Restrooms: Cleaned and inspected every 2 hours with QR digital sign-off.
- Cafeteria & Dining Hall: Continuous clearing during lunch hours (12:00 - 14:30), full floor scrubbing at 15:30.
- Workstations & Carpet Vacuuming: Daily post 19:00.
- Deep disinfection: Every second Saturday of the calendar month.`
  }
];

export const KnowledgeSearchService = {
  search: (query: string): { items: KnowledgeItem[]; notFound: boolean; message?: string } => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { items: APPROVED_KNOWLEDGE_BASE, notFound: false };
    }

    const matches = APPROVED_KNOWLEDGE_BASE.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(q);
      const contentMatch = item.content.toLowerCase().includes(q);
      const tagsMatch = item.tags.some(tag => tag.toLowerCase().includes(q) || q.includes(tag.toLowerCase()));
      const categoryMatch = item.category.toLowerCase().includes(q);
      return titleMatch || contentMatch || tagsMatch || categoryMatch;
    });

    if (matches.length === 0) {
      return {
        items: [],
        notFound: true,
        message: 'Information not available in the approved knowledge base.'
      };
    }

    return { items: matches, notFound: false };
  }
};
