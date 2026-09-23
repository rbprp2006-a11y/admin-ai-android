import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Wrench, Users, Bus, PackageCheck, Briefcase, CalendarCheck2, ShieldCheck, Sparkles, Zap, UtensilsCrossed, FileText } from 'lucide-react';
import { StorageService } from '../services/storage';
import { ModuleId } from '../types/modules';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (moduleId: ModuleId) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectModule,
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const matches: { id: string; title: string; subtitle: string; moduleId: ModuleId; tag: string }[] = [];

    // 1. Facility
    StorageService.getFacilityTickets().forEach(t => {
      if (t.title.toLowerCase().includes(q) || t.location.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) {
        matches.push({ id: t.id, title: t.title, subtitle: `${t.category} • ${t.location} • [${t.status}]`, moduleId: 'facility', tag: 'Facility Ticket' });
      }
    });

    // 2. Visitor
    StorageService.getVisitorRecords().forEach(v => {
      if (v.name.toLowerCase().includes(q) || v.company.toLowerCase().includes(q) || v.hostEmployee.toLowerCase().includes(q)) {
        matches.push({ id: v.id, title: v.name, subtitle: `${v.company} • Host: ${v.hostEmployee} • Gate: ${v.gateNumber}`, moduleId: 'visitor', tag: 'Visitor Pass' });
      }
    });

    // 3. Transport
    StorageService.getTransportBookings().forEach(t => {
      if (t.vehicleNumber.toLowerCase().includes(q) || t.driverName.toLowerCase().includes(q) || t.routeEnd.toLowerCase().includes(q)) {
        matches.push({ id: t.id, title: `${t.vehicleType} - ${t.vehicleNumber}`, subtitle: `To: ${t.routeEnd} • Driver: ${t.driverName}`, moduleId: 'transport', tag: 'Transport Trip' });
      }
    });

    // 4. Asset
    StorageService.getAssetRecords().forEach(a => {
      if (a.name.toLowerCase().includes(q) || a.assetTag.toLowerCase().includes(q) || a.floorLocation.toLowerCase().includes(q)) {
        matches.push({ id: a.id, title: a.name, subtitle: `Tag: ${a.assetTag} • Loc: ${a.floorLocation}`, moduleId: 'asset', tag: 'Asset Record' });
      }
    });

    // 5. Vendor
    StorageService.getVendorRecords().forEach(vn => {
      if (vn.companyName.toLowerCase().includes(q) || vn.serviceCategory.toLowerCase().includes(q) || vn.contactPerson.toLowerCase().includes(q)) {
        matches.push({ id: vn.id, title: vn.companyName, subtitle: `${vn.serviceCategory} • Contact: ${vn.contactPerson}`, moduleId: 'vendor', tag: 'Vendor AMC' });
      }
    });

    // 6. Meeting
    StorageService.getMeetingBookings().forEach(m => {
      if (m.title.toLowerCase().includes(q) || m.roomName.toLowerCase().includes(q) || m.organizer.toLowerCase().includes(q)) {
        matches.push({ id: m.id, title: m.title, subtitle: `${m.roomName} • Time: ${m.startTime}-${m.endTime}`, moduleId: 'meeting', tag: 'Room Booking' });
      }
    });

    // 7. Gate Pass
    StorageService.getGatePasses().forEach(g => {
      if (g.passNumber.toLowerCase().includes(q) || g.itemDescription.toLowerCase().includes(q) || g.requesterName.toLowerCase().includes(q)) {
        matches.push({ id: g.id, title: `${g.passNumber}: ${g.passType}`, subtitle: `${g.itemDescription} • [${g.approvalStatus}]`, moduleId: 'gatepass', tag: 'Gate Pass' });
      }
    });

    // 8. Housekeeping
    StorageService.getHousekeepingTasks().forEach(h => {
      if (h.areaZone.toLowerCase().includes(q) || h.assignedStaff.toLowerCase().includes(q)) {
        matches.push({ id: h.id, title: h.areaZone, subtitle: `Shift: ${h.shift} • Staff: ${h.assignedStaff}`, moduleId: 'housekeeping', tag: 'Housekeeping' });
      }
    });

    // 9. Utilities
    StorageService.getUtilityLogs().forEach(u => {
      if (u.utilityType.toLowerCase().includes(q) || u.meterId.toLowerCase().includes(q)) {
        matches.push({ id: u.id, title: `${u.utilityType} (${u.meterId})`, subtitle: `Daily: ${u.dailyConsumption} ${u.unit} • ₹${u.estimatedCost}`, moduleId: 'utilities', tag: 'Utility Meter' });
      }
    });

    // 10. Cafeteria
    StorageService.getCafeteriaLogs().forEach(c => {
      if (c.mealType.toLowerCase().includes(q) || c.date.includes(q)) {
        matches.push({ id: c.id, title: `${c.mealType} - ${c.date}`, subtitle: `Served: ${c.actualServed} pax • Waste: ${c.foodWastageKg} kg`, moduleId: 'cafeteria', tag: 'Cafeteria Log' });
      }
    });

    // 11. Document AI
    StorageService.getDocumentRecords().forEach(d => {
      if (d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q))) {
        matches.push({ id: d.id, title: d.title, subtitle: `${d.category} • OCR: ${d.ocrStatus}`, moduleId: 'document', tag: 'Document AI' });
      }
    });

    return matches.slice(0, 12);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all 11 admin modules..."
            className="w-full bg-transparent text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs font-semibold text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40">
            Esc
          </button>
        </div>

        {/* Results view */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {query.trim().length < 2 ? (
            <div className="text-center py-10 px-4 text-slate-400">
              <p className="text-xs font-medium">Type at least 2 characters to search across complaints, visitors, assets, passes, rooms, and contracts.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No records found for "{query}"</p>
              <p className="text-xs mt-1">Try keywords like "HVAC", "Visitor", "Gate", "Laptop", or "Apex".</p>
            </div>
          ) : (
            results.map((item) => (
              <div
                key={`${item.moduleId}-${item.id}`}
                onClick={() => {
                  onSelectModule(item.moduleId);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition cursor-pointer group"
              >
                <div className="space-y-0.5 max-w-[85%]">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {item.tag}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{item.id}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.subtitle}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition transform group-hover:translate-x-1" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
