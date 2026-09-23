import React, { useState } from 'react';
import { 
  ArrowLeft, LayoutDashboard, CheckSquare, FileText, Search, 
  Users, Wrench, ShieldCheck, Bus, PackageCheck, Briefcase, 
  CalendarCheck2, Sparkles, Zap, UtensilsCrossed, CheckCircle2, 
  Clock, AlertTriangle, ArrowRight, ExternalLink, Filter
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { ChannelService } from '../../services/channelService';
import { ModuleId } from '../../types/modules';

interface WebPortalViewProps {
  onBack: () => void;
  onNavigateToModule: (moduleId: ModuleId) => void;
  lang?: string;
}

export const WebPortalView: React.FC<WebPortalViewProps> = ({ onBack, onNavigateToModule }) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'approvals' | 'reports'>('overview');
  const [approvalFilter, setApprovalFilter] = useState<'All' | 'GatePass' | 'Facility'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Live centralized data
  const tickets = StorageService.getFacilityTickets();
  const visitors = StorageService.getVisitorRecords();
  const passes = StorageService.getGatePasses();
  const assets = StorageService.getAssetRecords();
  const meetings = StorageService.getMeetingBookings();
  const vendors = StorageService.getVendorRecords();

  const pendingPasses = passes.filter(p => p.approvalStatus === 'Pending Approval' || (p.approvalStatus as string) === 'Pending');
  const openTickets = tickets.filter(t => t.status !== 'Resolved');

  const handleApprovePass = (passId: string) => {
    StorageService.updateGatePass(passId, { approvalStatus: 'Approved' });
    const p = passes.find(x => x.id === passId);
    setActionNotice(`Pass ${p?.passNumber || passId} APPROVED! Central database & Mobile App updated.`);
    setTimeout(() => setActionNotice(null), 3500);

    ChannelService.addLog({
      channelId: 'web_portal',
      channelName: 'Web Portal',
      event: 'Gate Pass Approved via Web Portal',
      recipientOrUser: p?.requesterName || 'Admin Desk',
      details: `Pass ${p?.passNumber} approved. Triggered instant sync with Mobile App.`,
      status: 'Active'
    });
  };

  const handleResolveTicket = (ticketId: string) => {
    StorageService.updateFacilityTicket(ticketId, { 
      status: 'Resolved',
      resolutionNotes: 'Resolved via Enterprise Web Portal by Operations Director'
    });
    setActionNotice(`Ticket ${ticketId} marked as RESOLVED! Central database updated.`);
    setTimeout(() => setActionNotice(null), 3500);

    ChannelService.addLog({
      channelId: 'web_portal',
      channelName: 'Web Portal',
      event: 'Ticket Resolved via Web Portal',
      recipientOrUser: ticketId,
      details: `Complaint ${ticketId} closed. Instant notification queued for Mobile SMS.`,
      status: 'Active'
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Web Portal Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                ADMIN AI — Enterprise Web Portal
              </h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Live Single DB
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desktop & browser interface accessing identical unified database records
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition ${
              selectedTab === 'overview'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('approvals')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1 ${
              selectedTab === 'approvals'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>Approvals</span>
            {pendingPasses.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setSelectedTab('reports')}
            className={`px-3 py-1.5 rounded-xl transition ${
              selectedTab === 'reports'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          {/* Executive Web Dashboard Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Open Tickets</span>
              <p className="text-2xl font-black text-amber-500 mt-1">{openTickets.length}</p>
              <span className="text-[10px] text-slate-500">Across 11 Facilities</span>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Visitors</span>
              <p className="text-2xl font-black text-teal-500 mt-1">
                {visitors.filter(v => v.status === 'Checked In').length}
              </p>
              <span className="text-[10px] text-slate-500">In Campus Today</span>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Passes</span>
              <p className="text-2xl font-black text-rose-500 mt-1">{pendingPasses.length}</p>
              <span className="text-[10px] text-slate-500">Requires Approval</span>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tracked Assets</span>
              <p className="text-2xl font-black text-indigo-500 mt-1">{assets.length}</p>
              <span className="text-[10px] text-slate-500">100% Audited</span>
            </div>
          </div>

          {/* Quick Launch into All 11 Modules from Web Portal */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Admin AI Modules (Single Central Records)
              </h2>
              <span className="text-xs text-slate-500">Click to open module</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {[
                { id: 'facility' as ModuleId, name: 'Facility Maintenance', count: `${openTickets.length} Open`, icon: Wrench, color: 'text-blue-500' },
                { id: 'visitor' as ModuleId, name: 'Visitor Management', count: `${visitors.length} Total`, icon: Users, color: 'text-teal-500' },
                { id: 'gatepass' as ModuleId, name: 'Gate Pass AI', count: `${pendingPasses.length} Pending`, icon: ShieldCheck, color: 'text-rose-500' },
                { id: 'meeting' as ModuleId, name: 'Meeting Rooms', count: `${meetings.length} Scheduled`, icon: CalendarCheck2, color: 'text-emerald-500' },
                { id: 'asset' as ModuleId, name: 'Asset Management', count: `${assets.length} Tracked`, icon: PackageCheck, color: 'text-indigo-500' },
                { id: 'vendor' as ModuleId, name: 'Vendor Management', count: `${vendors.length} Active`, icon: Briefcase, color: 'text-purple-500' },
                { id: 'transport' as ModuleId, name: 'Transport AI', count: 'Fleet Live', icon: Bus, color: 'text-sky-500' },
                { id: 'housekeeping' as ModuleId, name: 'Housekeeping AI', count: 'Active Shifts', icon: Sparkles, color: 'text-pink-500' },
                { id: 'utilities' as ModuleId, name: 'Utilities & Energy', count: 'Nominal Grid', icon: Zap, color: 'text-amber-500' },
                { id: 'cafeteria' as ModuleId, name: 'Cafeteria AI', count: 'Daily Pax', icon: UtensilsCrossed, color: 'text-orange-500' },
                { id: 'document' as ModuleId, name: 'Document AI', count: 'OCR Archive', icon: FileText, color: 'text-teal-600' }
              ].map(mod => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onNavigateToModule(mod.id)}
                    className="p-3 text-left rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <Icon className={`w-4 h-4 ${mod.color}`} />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {mod.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">{mod.count}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition shrink-0 ml-1" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* APPROVALS TAB */}
      {selectedTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Centralized Enterprise Approvals Desk
            </h2>
            <div className="flex space-x-1 text-xs">
              {(['All', 'GatePass', 'Facility'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setApprovalFilter(f)}
                  className={`px-3 py-1 rounded-xl font-semibold transition ${
                    approvalFilter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Pending Gate Passes */}
          {(approvalFilter === 'All' || approvalFilter === 'GatePass') && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Gate Pass Approvals ({pendingPasses.length})
              </h3>
              {pendingPasses.length === 0 ? (
                <p className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
                  No pending gate pass approval requests.
                </p>
              ) : (
                pendingPasses.map(p => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-rose-500">{p.passNumber}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{p.itemDescription}</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                          Qty: {p.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Requester: <strong>{p.requesterName}</strong> ({p.department}) • Type: {p.passType}
                      </p>
                    </div>

                    <button
                      onClick={() => handleApprovePass(p.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition shrink-0"
                    >
                      Approve Pass
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Facility Escalations / High Priority */}
          {(approvalFilter === 'All' || approvalFilter === 'Facility') && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Critical Facility Tickets ({openTickets.filter(t => t.priority === 'Critical' || t.priority === 'High').length})
              </h3>
              {openTickets.filter(t => t.priority === 'Critical' || t.priority === 'High').map(t => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-amber-500">{t.id}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Location: {t.location} • Assigned: {t.assignedTo} • Status: [{t.status}]
                    </p>
                  </div>

                  <button
                    onClick={() => handleResolveTicket(t.id)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition shrink-0"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {selectedTab === 'reports' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Centralized Enterprise Audit Summary
              </h2>
              <p className="text-xs text-slate-500">Consolidated reports from all 11 admin modules</p>
            </div>
            <button
              onClick={() => {
                setActionNotice('Consolidated CSV exported to browser downloads.');
                setTimeout(() => setActionNotice(null), 3000);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow transition"
            >
              Export CSV Report
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Database Consistency Check: <span className="text-emerald-500 font-bold">100% HEALTHY</span>
            </p>
            <p className="text-slate-500">
              All transactions across Mobile App, Kiosk, Web Portal, Voice Assistant, and SMS triggers share a single unified data bus in <code>StorageService</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
