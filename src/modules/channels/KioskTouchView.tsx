import React, { useState } from 'react';
import { 
  ArrowLeft, Users, ShieldCheck, Wrench, Search, 
  CheckCircle2, AlertCircle, Sparkles, Building, QrCode, Phone,
  UserCheck, LogIn, LogOut, Clock, FileText, ChevronRight
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { ChannelService } from '../../services/channelService';
import { FacilityTicket, VisitorRecord, GatePassRecord } from '../../types/modules';

interface KioskTouchViewProps {
  onBack: () => void;
  lang?: string;
}

type KioskAction = 'menu' | 'register_visitor' | 'checkin_out' | 'verify_gatepass' | 'lodge_complaint' | 'lookup_status';

export const KioskTouchView: React.FC<KioskTouchViewProps> = ({ onBack }) => {
  const [activeAction, setActiveAction] = useState<KioskAction>('menu');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 1. Visitor Registration State
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorCompany, setVisitorCompany] = useState('');
  const [visitorHost, setVisitorHost] = useState('Neha Kulkarni (Facilities Director)');
  const [visitorPurpose, setVisitorPurpose] = useState('Vendor Meeting / Site Inspection');

  // 2. Check-in/out State
  const [searchQuery, setSearchQuery] = useState('');
  const [foundVisitor, setFoundVisitor] = useState<VisitorRecord | null>(null);

  // 3. Gate Pass verification State
  const [gatePassQuery, setGatePassQuery] = useState('');
  const [foundPass, setFoundPass] = useState<GatePassRecord | null>(null);

  // 4. Complaint State
  const [complaintCategory, setComplaintCategory] = useState<'Electrical' | 'Plumbing' | 'HVAC / AC' | 'Carpentry' | 'Civil' | 'Network / IT'>('Electrical');
  const [complaintLocation, setComplaintLocation] = useState('Floor 1 Reception Lobby');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [reporterName, setReporterName] = useState('Reception Kiosk User');

  // Handlers
  const handleRegisterVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone) {
      setFeedbackMessage({ text: 'Please enter visitor name and mobile number.', type: 'error' });
      return;
    }

    const newRecord: VisitorRecord = {
      id: `VIS-${Math.floor(1000 + Math.random() * 9000)}`,
      name: visitorName,
      phone: visitorPhone,
      company: visitorCompany || 'Independent / Client',
      hostEmployee: visitorHost,
      purpose: visitorPurpose,
      preApproved: true,
      gateNumber: 'Gate 1 (Main Security Plaza)',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      qrCode: `QR-KIOSK-${Date.now()}`,
      faceRecognitionStatus: 'Verified',
      status: 'Checked In',
      createdAt: new Date().toISOString()
    };

    StorageService.addVisitorRecord(newRecord);
    ChannelService.addLog({
      channelId: 'kiosk',
      channelName: 'Kiosk / Touch Screen',
      event: 'Kiosk Visitor Registered & Checked In',
      recipientOrUser: visitorName,
      details: `Badge issued: ${newRecord.id} at Gate 1 Reception`,
      status: 'Active'
    });

    setFeedbackMessage({ text: `Visitor ${visitorName} registered successfully! Badge: ${newRecord.id}`, type: 'success' });
    setVisitorName('');
    setVisitorPhone('');
    setVisitorCompany('');
    setActiveAction('menu');
  };

  const handleSearchVisitor = () => {
    const list = StorageService.getVisitorRecords();
    const query = searchQuery.trim().toLowerCase();
    const match = list.find(v => 
      v.phone.includes(query) || 
      v.name.toLowerCase().includes(query) || 
      v.id.toLowerCase() === query
    );

    if (match) {
      setFoundVisitor(match);
      setFeedbackMessage(null);
    } else {
      setFoundVisitor(null);
      setFeedbackMessage({ text: 'No visitor record found for this mobile number or ID.', type: 'error' });
    }
  };

  const handleToggleVisitorCheckInOut = () => {
    if (!foundVisitor) return;
    const isCheckedIn = foundVisitor.status === 'Checked In';
    const newStatus: VisitorRecord['status'] = isCheckedIn ? 'Checked Out' : 'Checked In';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    StorageService.updateVisitorRecord(foundVisitor.id, {
      status: newStatus,
      checkInTime: isCheckedIn ? foundVisitor.checkInTime : nowTime,
      checkOutTime: isCheckedIn ? nowTime : undefined
    });

    setFoundVisitor(prev => prev ? { ...prev, status: newStatus } : null);
    setFeedbackMessage({ 
      text: `Visitor ${foundVisitor.name} has been ${newStatus.toUpperCase()}!`, 
      type: 'success' 
    });

    ChannelService.addLog({
      channelId: 'kiosk',
      channelName: 'Kiosk / Touch Screen',
      event: `Kiosk ${newStatus}`,
      recipientOrUser: foundVisitor.name,
      details: `Status updated to ${newStatus} at Reception Kiosk`,
      status: 'Active'
    });
  };

  const handleSearchGatePass = () => {
    const list = StorageService.getGatePasses();
    const q = gatePassQuery.trim().toLowerCase();
    const pass = list.find(p => p.passNumber.toLowerCase().includes(q) || p.id.toLowerCase() === q);
    if (pass) {
      setFoundPass(pass);
      setFeedbackMessage(null);
    } else {
      setFoundPass(null);
      setFeedbackMessage({ text: 'Gate Pass number not found in security database.', type: 'error' });
    }
  };

  const handleVerifyGatePass = () => {
    if (!foundPass) return;
    StorageService.updateGatePass(foundPass.id, { securityVerification: 'Verified at Gate' });
    setFoundPass(prev => prev ? { ...prev, securityVerification: 'Verified at Gate' } : null);
    setFeedbackMessage({ text: `Pass ${foundPass.passNumber} verified and stamped at Security Gate!`, type: 'success' });
    ChannelService.addLog({
      channelId: 'kiosk',
      channelName: 'Kiosk / Touch Screen',
      event: 'Gate Pass Verified at Security Kiosk',
      recipientOrUser: foundPass.requesterName,
      details: `Gate Pass ${foundPass.passNumber} stamped "Verified at Gate"`,
      status: 'Active'
    });
  };

  const handleRegisterComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintTitle) {
      setFeedbackMessage({ text: 'Please describe the facility issue.', type: 'error' });
      return;
    }

    const newTicket: FacilityTicket = {
      id: `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: complaintTitle,
      category: complaintCategory,
      location: complaintLocation,
      priority: 'Medium',
      assignedTo: 'On-Duty Maintenance Desk',
      slaHours: 4,
      slaDeadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      status: 'Open',
      reportedBy: `${reporterName} (Kiosk)`,
      createdAt: new Date().toISOString()
    };

    StorageService.addFacilityTicket(newTicket);
    setFeedbackMessage({ text: `Complaint registered! Ticket ID: ${newTicket.id}. Assigned to Facilities.`, type: 'success' });
    setComplaintTitle('');
    ChannelService.addLog({
      channelId: 'kiosk',
      channelName: 'Kiosk / Touch Screen',
      event: 'Complaint Registered via Reception Kiosk',
      recipientOrUser: reporterName,
      details: `Generated Ticket ${newTicket.id} (${newTicket.category})`,
      status: 'Active'
    });
    setActiveAction('menu');
  };

  return (
    <div className="min-h-[85vh] bg-slate-900 text-white rounded-3xl p-4 sm:p-8 shadow-2xl border-4 border-slate-700 font-sans flex flex-col justify-between">
      {/* Kiosk Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={activeAction === 'menu' ? onBack : () => { setActiveAction('menu'); setFeedbackMessage(null); }}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white transition active:scale-95 flex items-center space-x-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-sm font-bold uppercase">{activeAction === 'menu' ? 'Exit Kiosk' : 'Main Menu'}</span>
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white uppercase">
                RECEPTION & GATE KIOSK
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Touch-Optimized Terminal • Gate 1 Main Plaza
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-right">
          <Clock className="w-5 h-5 text-blue-400" />
          <div className="text-xs">
            <p className="font-bold text-slate-200">{new Date().toLocaleDateString()}</p>
            <p className="text-slate-400">Live Campus Terminal</p>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div className={`p-4 mb-6 rounded-2xl flex items-center space-x-3 text-sm font-bold ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
        }`}>
          {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
          <p>{feedbackMessage.text}</p>
        </div>
      )}

      {/* KIOSK MAIN MENU */}
      {activeAction === 'menu' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
          {/* 1. Register Visitor */}
          <button
            onClick={() => setActiveAction('register_visitor')}
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-left transition transform active:scale-95 shadow-xl flex items-center justify-between group"
          >
            <div className="space-y-2">
              <div className="p-3 w-fit rounded-2xl bg-white/10">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Visitor Registration</h2>
              <p className="text-xs text-blue-100">Self check-in for scheduled guests & new campus visitors</p>
            </div>
            <ChevronRight className="w-8 h-8 text-blue-200 group-hover:translate-x-1 transition" />
          </button>

          {/* 2. Check-In / Check-Out */}
          <button
            onClick={() => { setActiveAction('checkin_out'); setSearchQuery(''); setFoundVisitor(null); }}
            className="p-6 rounded-3xl bg-gradient-to-br from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 text-left transition transform active:scale-95 shadow-xl flex items-center justify-between group"
          >
            <div className="space-y-2">
              <div className="p-3 w-fit rounded-2xl bg-white/10">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Visitor Check-In / Out</h2>
              <p className="text-xs text-teal-100">Quick QR code or mobile number gate check-in and checkout</p>
            </div>
            <ChevronRight className="w-8 h-8 text-teal-200 group-hover:translate-x-1 transition" />
          </button>

          {/* 3. Gate Pass Verification */}
          <button
            onClick={() => { setActiveAction('verify_gatepass'); setGatePassQuery(''); setFoundPass(null); }}
            className="p-6 rounded-3xl bg-gradient-to-br from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-left transition transform active:scale-95 shadow-xl flex items-center justify-between group"
          >
            <div className="space-y-2">
              <div className="p-3 w-fit rounded-2xl bg-white/10">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Gate Pass Verification</h2>
              <p className="text-xs text-rose-100">Security verification for Material & Contractor gate passes</p>
            </div>
            <ChevronRight className="w-8 h-8 text-rose-200 group-hover:translate-x-1 transition" />
          </button>

          {/* 4. Lodge Complaint */}
          <button
            onClick={() => setActiveAction('lodge_complaint')}
            className="p-6 rounded-3xl bg-gradient-to-br from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-left transition transform active:scale-95 shadow-xl flex items-center justify-between group"
          >
            <div className="space-y-2">
              <div className="p-3 w-fit rounded-2xl bg-white/10">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Lodge Complaint</h2>
              <p className="text-xs text-amber-100">Report AC, electrical, or housekeeping issues on-site</p>
            </div>
            <ChevronRight className="w-8 h-8 text-amber-200 group-hover:translate-x-1 transition" />
          </button>
        </div>
      )}

      {/* ACTION 1: VISITOR REGISTRATION FORM */}
      {activeAction === 'register_visitor' && (
        <form onSubmit={handleRegisterVisitor} className="max-w-xl mx-auto w-full space-y-4 my-auto">
          <div className="text-center space-y-1 mb-4">
            <h2 className="text-2xl font-black">Visitor Badge Registration</h2>
            <p className="text-xs text-slate-400">Please enter your details on the touch screen</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={visitorName}
                onChange={e => setVisitorName(e.target.value)}
                placeholder="e.g. Anand Mahindra"
                className="w-full p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white text-lg font-semibold focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Mobile Number (SMS)</label>
                <input
                  type="tel"
                  required
                  value={visitorPhone}
                  onChange={e => setVisitorPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white text-lg font-semibold focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={visitorCompany}
                  onChange={e => setVisitorCompany(e.target.value)}
                  placeholder="e.g. Siemens / TCS"
                  className="w-full p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white text-lg font-semibold focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Host Employee / Department</label>
              <select
                value={visitorHost}
                onChange={e => setVisitorHost(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white text-base font-semibold focus:border-blue-500 focus:outline-none"
              >
                <option value="Neha Kulkarni (Facilities Director)">Neha Kulkarni (Facilities Director)</option>
                <option value="Suresh Patil (Senior HVAC Specialist)">Suresh Patil (Senior HVAC Specialist)</option>
                <option value="Vikram Joshi (Audio Visual Lead)">Vikram Joshi (Audio Visual Lead)</option>
                <option value="Security Control Room">Security Control Room</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setActiveAction('menu')}
              className="w-1/3 p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-lg active:scale-95 transition"
            >
              Print Badge & Check In
            </button>
          </div>
        </form>
      )}

      {/* ACTION 2: CHECK-IN / CHECK-OUT */}
      {activeAction === 'checkin_out' && (
        <div className="max-w-xl mx-auto w-full space-y-4 my-auto">
          <div className="text-center space-y-1 mb-4">
            <h2 className="text-2xl font-black">Visitor Gate Status Lookup</h2>
            <p className="text-xs text-slate-400">Search by Mobile Number or Visitor Pass ID</p>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Enter Phone or ID (e.g. VIS-2001 or 98201)"
              className="flex-1 p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white text-lg font-semibold focus:border-teal-500 focus:outline-none"
            />
            <button
              onClick={handleSearchVisitor}
              className="px-6 p-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-lg active:scale-95 transition"
            >
              Search
            </button>
          </div>

          {/* Result Card */}
          {foundVisitor && (
            <div className="p-6 rounded-3xl bg-slate-800 border-2 border-teal-500/50 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-teal-400 font-bold">{foundVisitor.id}</span>
                  <h3 className="text-xl font-bold text-white">{foundVisitor.name}</h3>
                  <p className="text-xs text-slate-400">{foundVisitor.company} • Host: {foundVisitor.hostEmployee}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  foundVisitor.status === 'Checked In' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {foundVisitor.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-2xl border border-slate-700">
                <div><span className="text-slate-400">Phone:</span> {foundVisitor.phone}</div>
                <div><span className="text-slate-400">Gate:</span> {foundVisitor.gateNumber}</div>
                <div><span className="text-slate-400">Check In:</span> {foundVisitor.checkInTime || 'Not checked in'}</div>
                <div><span className="text-slate-400">Check Out:</span> {foundVisitor.checkOutTime || 'Active In Campus'}</div>
              </div>

              <button
                onClick={handleToggleVisitorCheckInOut}
                className={`w-full p-4 rounded-2xl font-black text-lg transition active:scale-95 shadow-lg flex items-center justify-center space-x-2 ${
                  foundVisitor.status === 'Checked In'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {foundVisitor.status === 'Checked In' ? (
                  <>
                    <LogOut className="w-6 h-6" />
                    <span>Check Out Visitor</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6" />
                    <span>Check In Visitor</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ACTION 3: GATE PASS VERIFICATION */}
      {activeAction === 'verify_gatepass' && (
        <div className="max-w-xl mx-auto w-full space-y-4 my-auto">
          <div className="text-center space-y-1 mb-4">
            <h2 className="text-2xl font-black">Gate Pass Security Desk</h2>
            <p className="text-xs text-slate-400">Verify Material Outward or Contractor Entry Passes</p>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={gatePassQuery}
              onChange={e => setGatePassQuery(e.target.value)}
              placeholder="Enter Pass # (e.g. GP-2026-001)"
              className="flex-1 p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white text-lg font-semibold focus:border-rose-500 focus:outline-none"
            />
            <button
              onClick={handleSearchGatePass}
              className="px-6 p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-lg active:scale-95 transition"
            >
              Verify
            </button>
          </div>

          {foundPass && (
            <div className="p-6 rounded-3xl bg-slate-800 border-2 border-rose-500/50 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-rose-400 font-bold">{foundPass.passNumber}</span>
                  <h3 className="text-xl font-bold text-white">{foundPass.itemDescription}</h3>
                  <p className="text-xs text-slate-400">{foundPass.passType} • Qty: {foundPass.quantity}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  foundPass.approvalStatus === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {foundPass.approvalStatus}
                </span>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-700 text-xs space-y-1">
                <p><span className="text-slate-400">Requester:</span> {foundPass.requesterName} ({foundPass.department})</p>
                <p><span className="text-slate-400">Approved By:</span> {foundPass.approverName}</p>
                <p><span className="text-slate-400">Security Status:</span> <strong className="text-blue-300">{foundPass.securityVerification}</strong></p>
              </div>

              {foundPass.securityVerification !== 'Verified at Gate' ? (
                <button
                  onClick={handleVerifyGatePass}
                  className="w-full p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg transition active:scale-95 shadow-lg flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Stamp Gate Clearance</span>
                </button>
              ) : (
                <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl text-center text-sm font-bold">
                  ✓ Pass Already Cleared At Security Gate
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ACTION 4: LODGE COMPLAINT */}
      {activeAction === 'lodge_complaint' && (
        <form onSubmit={handleRegisterComplaint} className="max-w-xl mx-auto w-full space-y-4 my-auto">
          <div className="text-center space-y-1 mb-4">
            <h2 className="text-2xl font-black">Lodge Facility Complaint</h2>
            <p className="text-xs text-slate-400">Report an urgent issue directly to the maintenance team</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Issue Category</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Electrical', 'Plumbing', 'HVAC / AC', 'Carpentry', 'Civil', 'Network / IT'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setComplaintCategory(cat)}
                    className={`p-3 rounded-xl text-xs font-bold transition ${
                      complaintCategory === cat 
                        ? 'bg-amber-500 text-slate-950 font-black' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Location / Floor</label>
              <input
                type="text"
                required
                value={complaintLocation}
                onChange={e => setComplaintLocation(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white text-base font-semibold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Issue Description</label>
              <textarea
                required
                rows={3}
                value={complaintTitle}
                onChange={e => setComplaintTitle(e.target.value)}
                placeholder="e.g. AC cooling unit making noise, or corridor water tap dripping..."
                className="w-full p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white text-base font-semibold focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setActiveAction('menu')}
              className="w-1/3 p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 p-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg shadow-lg active:scale-95 transition"
            >
              Submit Ticket (SLA Assigned)
            </button>
          </div>
        </form>
      )}

      {/* Footer Info */}
      <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>Admin AI Kiosk Subsystem • Single Central Database</span>
        <span>Touch Target: 48dp Compliant</span>
      </div>
    </div>
  );
};
