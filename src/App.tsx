import React, { useState, useEffect } from 'react';
import { 
  Wrench, Users, Bus, PackageCheck, Briefcase, CalendarCheck2, 
  ShieldCheck, Sparkles, Zap, UtensilsCrossed, FileText, Search, 
  Sun, Moon, Globe, RotateCcw, ArrowRight, ShieldAlert, CheckCircle2,
  Building2, Layers, Radio, Smartphone, Tv, Mic, Network, Bot, Activity, Sliders,
  Server, HardDrive, Terminal, Wifi
} from 'lucide-react';
import { ModuleId, Language } from './types/modules';
import { translations } from './i18n/translations';
import { StorageService } from './services/storage';

// Section 1: Multi-Channel User Access Views
import { UserAccessChannelsView } from './modules/UserAccessChannelsView';
import { KioskTouchView } from './modules/channels/KioskTouchView';
import { VoiceAssistantView } from './modules/channels/VoiceAssistantView';
import { WebPortalView } from './modules/channels/WebPortalView';

// Section 3: AI Agent Layer (Intelligence & Orchestration)
import { AiAgentsDashboardView } from './modules/ai/AiAgentsDashboardView';
import { FloatingAiButton } from './components/FloatingAiButton';

// Section 4: Integration Layer (Future-Ready External Systems)
import { IntegrationManagementView } from './modules/integrations/IntegrationManagementView';

// Section 6: Infrastructure, Security & Monitoring
import { InfrastructureMonitoringView } from './modules/infrastructure/InfrastructureMonitoringView';
import { AndroidBridgeService } from './services/androidBridgeService';

// Section 2: 11 Admin AI Module Views
import { FacilityMaintenanceView } from './modules/FacilityMaintenanceView';
import { VisitorManagementView } from './modules/VisitorManagementView';
import { TransportManagementView } from './modules/TransportManagementView';
import { AssetManagementView } from './modules/AssetManagementView';
import { VendorManagementView } from './modules/VendorManagementView';
import { MeetingRoomView } from './modules/MeetingRoomView';
import { GatePassView } from './modules/GatePassView';
import { HousekeepingView } from './modules/HousekeepingView';
import { UtilitiesEnergyView } from './modules/UtilitiesEnergyView';
import { CafeteriaView } from './modules/CafeteriaView';
import { DocumentAiView } from './modules/DocumentAiView';

// Modals
import { SearchModal } from './components/SearchModal';
import { ConfirmationModal } from './components/ConfirmationModal';

export type AppView = ModuleId | 'dashboard' | 'channels' | 'kiosk_mode' | 'voice_assistant' | 'web_portal_mode' | 'ai_agents' | 'integrations' | 'infrastructure';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('admin_ai_lang') as Language) || 'en';
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('admin_ai_theme') === 'dark';
  });
  const [activeModule, setActiveModule] = useState<AppView>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Sync theme class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin_ai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin_ai_theme', 'light');
    }
  }, [isDark]);

  // Android hardware back button and network connectivity listeners
  useEffect(() => {
    AndroidBridgeService.init(() => {
      if (activeModule !== 'dashboard') {
        setActiveModule('dashboard');
        return true;
      }
      return false;
    });
  }, [activeModule]);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('admin_ai_lang', newLang);
  };

  const handleResetData = () => {
    StorageService.resetAll();
    setIsResetConfirmOpen(false);
    window.location.reload();
  };

  const t = translations[lang];

  // Dynamic badge counts for dashboard
  const openFacility = StorageService.getFacilityTickets().filter(x => x.status !== 'Resolved').length;
  const activeVisitors = StorageService.getVisitorRecords().filter(x => x.status === 'Checked In').length;
  const onRouteTrips = StorageService.getTransportBookings().filter(x => x.status === 'On Route').length;
  const allocatedAssets = StorageService.getAssetRecords().filter(x => x.lifecycleStage === 'Allocated').length;
  const activeVendors = StorageService.getVendorRecords().filter(x => x.amcStatus === 'Active').length;
  const confirmedMeetings = StorageService.getMeetingBookings().filter(x => x.status === 'Confirmed' || x.status === 'In Session').length;
  const pendingPasses = StorageService.getGatePasses().filter(x => x.approvalStatus === 'Pending').length;
  const activeHousekeeping = StorageService.getHousekeepingTasks().filter(x => x.status !== 'Completed').length;
  const surgeUtilities = StorageService.getUtilityLogs().filter(x => x.status.includes('Surge')).length;
  const cafeteriaMeals = StorageService.getCafeteriaLogs().reduce((acc, curr) => acc + (curr.actualServed || 0), 0);
  const documentCount = StorageService.getDocumentRecords().length;

  const moduleCards = [
    {
      id: 'facility' as ModuleId,
      title: t.modules.facility.title,
      desc: t.modules.facility.desc,
      icon: Wrench,
      gradient: 'from-blue-600 to-indigo-700',
      badge: `${openFacility} Active Tickets`,
      badgeColor: openFacility > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'visitor' as ModuleId,
      title: t.modules.visitor.title,
      desc: t.modules.visitor.desc,
      icon: Users,
      gradient: 'from-teal-600 to-cyan-700',
      badge: `${activeVisitors} In Campus`,
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
    },
    {
      id: 'transport' as ModuleId,
      title: t.modules.transport.title,
      desc: t.modules.transport.desc,
      icon: Bus,
      gradient: 'from-sky-600 to-blue-700',
      badge: `${onRouteTrips} On Route`,
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
    },
    {
      id: 'asset' as ModuleId,
      title: t.modules.asset.title,
      desc: t.modules.asset.desc,
      icon: PackageCheck,
      gradient: 'from-indigo-600 to-purple-700',
      badge: `${allocatedAssets} Allocated`,
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
    },
    {
      id: 'vendor' as ModuleId,
      title: t.modules.vendor.title,
      desc: t.modules.vendor.desc,
      icon: Briefcase,
      gradient: 'from-purple-600 to-pink-700',
      badge: `${activeVendors} Active AMCs`,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
    },
    {
      id: 'meeting' as ModuleId,
      title: t.modules.meeting.title,
      desc: t.modules.meeting.desc,
      icon: CalendarCheck2,
      gradient: 'from-emerald-600 to-teal-700',
      badge: `${confirmedMeetings} Today's Sessions`,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
    },
    {
      id: 'gatepass' as ModuleId,
      title: t.modules.gatepass.title,
      desc: t.modules.gatepass.desc,
      icon: ShieldCheck,
      gradient: 'from-rose-600 to-red-700',
      badge: `${pendingPasses} Pending Approvals`,
      badgeColor: pendingPasses > 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-800'
    },
    {
      id: 'housekeeping' as ModuleId,
      title: t.modules.housekeeping.title,
      desc: t.modules.housekeeping.desc,
      icon: Sparkles,
      gradient: 'from-pink-600 to-rose-700',
      badge: `${activeHousekeeping} Active Shifts`,
      badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
    },
    {
      id: 'utilities' as ModuleId,
      title: t.modules.utilities.title,
      desc: t.modules.utilities.desc,
      icon: Zap,
      gradient: 'from-amber-600 to-orange-700',
      badge: surgeUtilities > 0 ? `${surgeUtilities} Peak Alerts` : 'Nominal Grid',
      badgeColor: surgeUtilities > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'cafeteria' as ModuleId,
      title: t.modules.cafeteria.title,
      desc: t.modules.cafeteria.desc,
      icon: UtensilsCrossed,
      gradient: 'from-orange-600 to-amber-700',
      badge: `${cafeteriaMeals} Pax Served`,
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
    },
    {
      id: 'document' as ModuleId,
      title: t.modules.document.title,
      desc: t.modules.document.desc,
      icon: FileText,
      gradient: 'from-teal-700 to-emerald-800',
      badge: `${documentCount} OCR Archived`,
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Logo & Name */}
          <div 
            onClick={() => setActiveModule('dashboard')} 
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ADMIN AI
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModule('infrastructure');
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-emerald-100 dark:from-blue-950 dark:via-indigo-950 dark:to-emerald-950 text-emerald-700 dark:text-emerald-300 hover:opacity-90 transition border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1"
                  title="View Section 6: Infrastructure, Security & Monitoring"
                >
                  <Server className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                  <span>Section 1 - 6</span>
                </button>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Smart Admin Department
              </p>
            </div>
          </div>

          {/* Quick Actions Strip */}
          <div className="flex items-center space-x-1.5">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={t.search}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 text-[11px] font-semibold">
              <button
                onClick={() => handleLangChange('en')}
                className={`px-2 py-1 rounded-lg transition ${lang === 'en' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                EN
              </button>
              <button
                onClick={() => handleLangChange('hi')}
                className={`px-2 py-1 rounded-lg transition ${lang === 'hi' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                हि
              </button>
              <button
                onClick={() => handleLangChange('mr')}
                className={`px-2 py-1 rounded-lg transition ${lang === 'mr' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                म
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Light/Dark Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Reset Seed Data */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Reset Sample Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 pb-24">
        {activeModule === 'dashboard' ? (
          <div className="space-y-4 animate-fadeIn">
            {/* Hero Enterprise Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200">
                  Enterprise Operations Core
                </span>
                <h1 className="text-xl font-extrabold tracking-tight">
                  {t.tagline}
                </h1>
                <p className="text-xs text-blue-100 max-w-md pt-0.5 leading-relaxed">
                  Real-time coordination of 11 operational modules: facilities, security passes, fleet, energy, assets, and document archives.
                </p>
              </div>

              {/* Quick Summary Strip */}
              <div className="grid grid-cols-4 gap-2 pt-4 mt-3 border-t border-white/10 text-center text-xs">
                <div>
                  <span className="text-[10px] text-blue-200 uppercase font-medium">Complaints</span>
                  <p className="text-sm font-bold text-amber-300">{openFacility}</p>
                </div>
                <div>
                  <span className="text-[10px] text-blue-200 uppercase font-medium">In Campus</span>
                  <p className="text-sm font-bold text-teal-300">{activeVisitors}</p>
                </div>
                <div>
                  <span className="text-[10px] text-blue-200 uppercase font-medium">Passes</span>
                  <p className="text-sm font-bold text-rose-300">{pendingPasses}</p>
                </div>
                <div>
                  <span className="text-[10px] text-blue-200 uppercase font-medium">Docs OCR</span>
                  <p className="text-sm font-bold text-emerald-300">{documentCount}</p>
                </div>
              </div>
            </div>

            {/* SECTION 1: USER ACCESS (MULTI-CHANNEL) */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-lg space-y-3.5 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300">
                      Section 1 • Communication Layer
                    </span>
                    <h2 className="text-base font-extrabold text-white">
                      User Access & 7 Channels
                    </h2>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Unified DB
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Connect employees, visitors, vendors, security, and management through 7 standardized interfaces: Mobile App, Mobile SMS, Web Portal, Voice Assistant, Kiosk, Email/Outlook, and Microsoft Teams.
              </p>

              {/* 7 Channel Pills */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  '1. Mobile App',
                  '2. Mobile SMS',
                  '3. Web Portal',
                  '4. Voice Assistant',
                  '5. Kiosk / Touch',
                  '6. Email / Outlook',
                  '7. MS Teams'
                ].map((ch, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-slate-200 border border-white/10"
                  >
                    {ch}
                  </span>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 text-xs font-bold">
                <button
                  onClick={() => setActiveModule('channels')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow font-bold flex items-center space-x-1.5 transition"
                >
                  <span>Open Channels & Access Matrix</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveModule('kiosk_mode')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] transition flex items-center space-x-1"
                  >
                    <Tv className="w-3 h-3 text-emerald-400" />
                    <span>Touch Kiosk</span>
                  </button>
                  <button
                    onClick={() => setActiveModule('voice_assistant')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] transition flex items-center space-x-1"
                  >
                    <Mic className="w-3 h-3 text-purple-300" />
                    <span>Voice AI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: AI AGENT LAYER (INTELLIGENCE & ORCHESTRATION) */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white shadow-xl space-y-3.5 border border-purple-900/40 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-400/30 text-purple-300">
                    <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300">
                      Section 3 • Orchestration & Intelligence
                    </span>
                    <h2 className="text-base font-extrabold text-white">
                      AI Agent Layer
                    </h2>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                  Coordinator Active
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Centralized Admin AI Coordinator orchestrating 7 Specialized AI Agents across all 11 modules and 7 user access channels on a single central database.
              </p>

              {/* 7 Specialized Agents Badges */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  '1. Ticket Resolution',
                  '2. Notification & Comm',
                  '3. Workflow Automation',
                  '4. Data & Insight',
                  '5. Knowledge Base',
                  '6. Integration Agent',
                  '7. Learning & Improvement'
                ].map((ag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-purple-100 border border-white/10"
                  >
                    {ag}
                  </span>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 text-xs font-bold">
                <button
                  onClick={() => setActiveModule('ai_agents')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow font-bold flex items-center space-x-1.5 transition"
                >
                  <Bot className="w-4 h-4 text-amber-300" />
                  <span>Open AI Assistant & Chat</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveModule('ai_agents')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] transition flex items-center space-x-1"
                  >
                    <Layers className="w-3 h-3 text-emerald-400" />
                    <span>7 Agents Workbench</span>
                  </button>
                  <button
                    onClick={() => setActiveModule('ai_agents')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] transition flex items-center space-x-1"
                  >
                    <Activity className="w-3 h-3 text-cyan-300" />
                    <span>Activity Log</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 4: INTEGRATION LAYER (EXTERNAL SYSTEMS - FUTURE READY) */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl space-y-3.5 border border-indigo-900/40 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300">
                    <Network className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                      Section 4 • External Systems
                    </span>
                    <h2 className="text-base font-extrabold text-white">
                      Integration Layer (Future-Ready)
                    </h2>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  8 Connectors Ready
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Future-ready integration architecture for enterprise systems. Connectors remain disabled by default, credential-ready, and fail-safe without affecting core modules.
              </p>

              {/* 8 Connectors Badges */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  '1. SAP ERP',
                  '2. HRMS',
                  '3. Email / SMTP',
                  '4. Microsoft 365',
                  '5. IoT / Devices',
                  '6. Payment Gateway',
                  '7. Biometric / Face',
                  '8. Third Party APIs'
                ].map((conn, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-indigo-100 border border-white/10"
                  >
                    {conn}
                  </span>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 text-xs font-bold">
                <button
                  onClick={() => setActiveModule('integrations')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow font-bold flex items-center space-x-1.5 transition"
                >
                  <Network className="w-4 h-4 text-indigo-200" />
                  <span>Open Integration Management</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-amber-300/90 font-medium hidden sm:inline">
                    Disabled by default (Admin control)
                  </span>
                  <button
                    onClick={() => setActiveModule('integrations')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] transition flex items-center space-x-1"
                  >
                    <Sliders className="w-3 h-3 text-cyan-300" />
                    <span>Data Mapping</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 6: INFRASTRUCTURE, SECURITY & MONITORING */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xl space-y-3.5 border border-emerald-900/40 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600/30 border border-emerald-400/30 text-emerald-300">
                    <Server className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
                      Section 6 • Enterprise Core
                    </span>
                    <h2 className="text-base font-extrabold text-white">
                      Infrastructure, Security & Monitoring
                    </h2>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  Authoritative & Secure
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Shared PostgreSQL/SQLite authority, local-network Android connectivity (never hardcoded localhost), real RBAC authentication, sanitized diagnostics, and offline local-first sync.
              </p>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  '1. Authoritative Backend',
                  '2. Shared DB (11 Modules)',
                  '3. Local Wi-Fi Network API',
                  '4. RBAC & Data Masking',
                  '5. Offline Local Queue',
                  '6. Free Debug APK Project'
                ].map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-emerald-100 border border-white/10"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 text-xs font-bold">
                <button
                  onClick={() => setActiveModule('infrastructure')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow font-bold flex items-center space-x-1.5 transition"
                >
                  <Server className="w-4 h-4 text-emerald-200" />
                  <span>Open Infrastructure Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveModule('infrastructure')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] transition flex items-center space-x-1"
                  >
                    <Activity className="w-3 h-3 text-emerald-300" />
                    <span>System Health</span>
                  </button>
                  <button
                    onClick={() => setActiveModule('infrastructure')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] transition flex items-center space-x-1"
                  >
                    <Smartphone className="w-3 h-3 text-cyan-300" />
                    <span>APK Guide</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200">
                  {t.adminModulesTitle}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tap any card below to launch its dedicated workflow & actions
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                11 Modules
              </span>
            </div>

            {/* 11 Module Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {moduleCards.map((mod, index) => {
                const IconComponent = mod.icon;
                return (
                  <div
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${mod.gradient} text-white shadow-md group-hover:scale-105 transition`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mod.badgeColor}`}>
                          {mod.badge}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {String(index + 1).padStart(2, '0')}.
                          </span>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            {mod.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {mod.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-semibold">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Render Active Sub-Module Screen */
          <div>
            {activeModule === 'channels' && (
              <UserAccessChannelsView 
                onBack={() => setActiveModule('dashboard')} 
                onLaunchKiosk={() => setActiveModule('kiosk_mode')}
                onLaunchVoiceAssistant={() => setActiveModule('voice_assistant')}
                onLaunchWebPortal={() => setActiveModule('web_portal_mode')}
                onNavigateToModule={(modId) => setActiveModule(modId)}
                lang={lang} 
              />
            )}
            {activeModule === 'kiosk_mode' && (
              <KioskTouchView onBack={() => setActiveModule('channels')} lang={lang} />
            )}
            {activeModule === 'voice_assistant' && (
              <VoiceAssistantView 
                onBack={() => setActiveModule('channels')} 
                onNavigateToModule={(modId) => setActiveModule(modId)}
                lang={lang} 
              />
            )}
            {activeModule === 'web_portal_mode' && (
              <WebPortalView 
                onBack={() => setActiveModule('channels')} 
                onNavigateToModule={(modId) => setActiveModule(modId)}
                lang={lang} 
              />
            )}
            {activeModule === 'facility' && (
              <FacilityMaintenanceView onBack={() => setActiveModule('dashboard')} lang={lang} />
            )}
            {activeModule === 'visitor' && (
              <VisitorManagementView onBack={() => setActiveModule('dashboard')} lang={lang} />
            )}
            {activeModule === 'transport' && (
              <TransportManagementView onBack={() => setActiveModule('dashboard')} lang={lang} />
            )}
            {activeModule === 'asset' && (
              <AssetManagementView onBack={() => setActiveModule('dashboard')} lang={lang} />
            )}
            {activeModule === 'vendor' && (
              <VendorManagementView onBack={() => setActiveModule('dashboard')} lang={lang} />
            )}
            {activeModule === 'meeting' && (
              <MeetingRoomView onBack={() => setActiveModule('dashboard')} lang={lang} />
            )}
            {activeModule === 'gatepass' && (
              <GatePassView onBack={() => setActiveModule('dashboard')} lang={lang} />
            )}
            {activeModule === 'housekeeping' && (
              <HousekeepingView onBack={() => setActiveModule('dashboard')} lang={lang} />
            )}
            {activeModule === 'utilities' && (
              <UtilitiesEnergyView onBack={() => setActiveModule('dashboard')} lang={lang} />
            )}
            {activeModule === 'cafeteria' && (
              <CafeteriaView onBack={() => setActiveModule('dashboard')} lang={lang} />
            )}
            {activeModule === 'document' && (
              <DocumentAiView onBack={() => setActiveModule('dashboard')} lang={lang} />
            )}
            {activeModule === 'ai_agents' && (
              <AiAgentsDashboardView
                onBack={() => setActiveModule('dashboard')}
                onNavigateToModule={(modId) => setActiveModule(modId)}
                lang={lang}
              />
            )}
            {activeModule === 'integrations' && (
              <IntegrationManagementView
                onBack={() => setActiveModule('dashboard')}
                lang={lang}
              />
            )}
            {activeModule === 'infrastructure' && (
              <InfrastructureMonitoringView
                onBack={() => setActiveModule('dashboard')}
                lang={lang}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating AI Button (Accessible across all screens) */}
      <FloatingAiButton
        onClick={() => setActiveModule('ai_agents')}
        isOpen={activeModule === 'ai_agents'}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-3 py-2">
        <div className="max-w-2xl mx-auto flex items-center justify-around text-xs">
          <button
            onClick={() => setActiveModule('dashboard')}
            className={`flex flex-col items-center p-1.5 rounded-xl transition ${
              activeModule === 'dashboard'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveModule('channels')}
            className={`flex flex-col items-center p-1.5 rounded-xl transition ${
              activeModule === 'channels' || activeModule === 'kiosk_mode' || activeModule === 'voice_assistant' || activeModule === 'web_portal_mode'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Radio className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Channels</span>
          </button>

          <button
            onClick={() => setActiveModule('ai_agents')}
            className={`flex flex-col items-center p-1.5 rounded-xl transition ${
              activeModule === 'ai_agents'
                ? 'text-purple-600 dark:text-purple-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5 text-purple-600 dark:text-purple-400" />
            <span className="text-[11px]">AI Agent</span>
          </button>

          <button
            onClick={() => setActiveModule('integrations')}
            className={`flex flex-col items-center p-1.5 rounded-xl transition ${
              activeModule === 'integrations'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Network className="w-5 h-5 mb-0.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px]">Integrate</span>
          </button>

          <button
            onClick={() => setActiveModule('infrastructure')}
            className={`flex flex-col items-center p-1.5 rounded-xl transition ${
              activeModule === 'infrastructure'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Server className="w-5 h-5 mb-0.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px]">Infra</span>
          </button>

          <button
            onClick={() => setActiveModule('facility')}
            className={`flex flex-col items-center p-1.5 rounded-xl transition ${
              activeModule === 'facility'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Wrench className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Facility</span>
          </button>

          <button
            onClick={() => setActiveModule('gatepass')}
            className={`flex flex-col items-center p-1.5 rounded-xl transition ${
              activeModule === 'gatepass'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Gate Pass</span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Search</span>
          </button>
        </div>
      </nav>

      {/* Global Search Modal across all 11 modules */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectModule={(modId) => setActiveModule(modId)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        title="Reset Sample Enterprise Data"
        message="This will reset all 11 modules back to the initial sample enterprise records. Any created tickets or entries will be restored to defaults."
        onConfirm={handleResetData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};

export default App;
