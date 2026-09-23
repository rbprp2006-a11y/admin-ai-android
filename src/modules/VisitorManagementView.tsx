import React, { useState } from 'react';
import { 
  Users, Plus, Search, Download, ArrowLeft, Trash2, Edit3, X, 
  QrCode, Camera, CheckCircle2, LogIn, LogOut, Clock, Building2, User
} from 'lucide-react';
import { VisitorRecord, Language } from '../types/modules';
import { StorageService } from '../services/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { QRViewerModal } from '../components/QRViewerModal';
import { HardwareDisclaimer } from '../components/HardwareDisclaimer';
import { translations } from '../i18n/translations';

interface Props {
  onBack: () => void;
  lang: Language;
}

export const VisitorManagementView: React.FC<Props> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [visitors, setVisitors] = useState<VisitorRecord[]>(() => StorageService.getVisitorRecords());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<VisitorRecord | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [activeQrVisitor, setActiveQrVisitor] = useState<VisitorRecord | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [hostEmployee, setHostEmployee] = useState('');
  const [purpose, setPurpose] = useState('');
  const [gateNumber, setGateNumber] = useState('Gate 1 (Main Security Plaza)');
  const [preApproved, setPreApproved] = useState(true);
  const [faceStatus, setFaceStatus] = useState<VisitorRecord['faceRecognitionStatus']>('Pending');
  const [formError, setFormError] = useState('');

  const filteredVisitors = visitors.filter(item => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hostEmployee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenCreate = () => {
    setEditingVisitor(null);
    setName('');
    setPhone('');
    setCompany('');
    setHostEmployee('');
    setPurpose('');
    setGateNumber('Gate 1 (Main Security Plaza)');
    setPreApproved(true);
    setFaceStatus('Pending');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: VisitorRecord) => {
    setEditingVisitor(item);
    setName(item.name);
    setPhone(item.phone);
    setCompany(item.company);
    setHostEmployee(item.hostEmployee);
    setPurpose(item.purpose);
    setGateNumber(item.gateNumber);
    setPreApproved(item.preApproved);
    setFaceStatus(item.faceRecognitionStatus);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !hostEmployee.trim()) {
      setFormError('Please enter Visitor Name, Phone and Host Employee.');
      return;
    }

    let updated: VisitorRecord[];
    if (editingVisitor) {
      updated = visitors.map(item => {
        if (item.id === editingVisitor.id) {
          return {
            ...item,
            name,
            phone,
            company,
            hostEmployee,
            purpose,
            gateNumber,
            preApproved,
            faceRecognitionStatus: faceStatus,
          };
        }
        return item;
      });
    } else {
      const newId = `VIS-${2000 + visitors.length + 1}`;
      const newRecord: VisitorRecord = {
        id: newId,
        name,
        phone,
        company: company || 'Independent / Individual',
        hostEmployee,
        purpose: purpose || 'Official Business Meeting',
        preApproved,
        gateNumber,
        qrCode: `QR-${newId}-${Math.floor(1000 + Math.random() * 9000)}`,
        faceRecognitionStatus: faceStatus,
        status: preApproved ? 'Pre-Approved' : 'Checked In',
        checkInTime: preApproved ? undefined : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      };
      updated = [newRecord, ...visitors];
    }

    setVisitors(updated);
    StorageService.saveVisitorRecords(updated);
    setIsFormOpen(false);
  };

  const handleCheckIn = (id: string) => {
    const updated = visitors.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'Checked In' as const,
          checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          faceRecognitionStatus: 'Verified' as const
        };
      }
      return v;
    });
    setVisitors(updated);
    StorageService.saveVisitorRecords(updated);
  };

  const handleCheckOut = (id: string) => {
    const updated = visitors.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'Checked Out' as const,
          checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return v;
    });
    setVisitors(updated);
    StorageService.saveVisitorRecords(updated);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const updated = visitors.filter(item => item.id !== deleteTargetId);
    setVisitors(updated);
    StorageService.saveVisitorRecords(updated);
    setDeleteTargetId(null);
  };

  const handleExport = () => {
    StorageService.exportToCsv('visitor_records', visitors);
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-900">
          Module 2 / 11
        </span>
      </div>

      {/* Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
            <Users className="w-6 h-6 text-teal-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{t.modules.visitor.title}</h2>
            <p className="text-xs text-teal-100 leading-snug">{t.modules.visitor.desc}</p>
          </div>
        </div>

        {/* Live Gate Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-teal-200 uppercase font-medium">Inside Campus</span>
            <p className="text-base font-bold text-emerald-300">{visitors.filter(x => x.status === 'Checked In').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-teal-200 uppercase font-medium">Pre-Approved</span>
            <p className="text-base font-bold text-amber-300">{visitors.filter(x => x.status === 'Pre-Approved').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-teal-200 uppercase font-medium">Completed</span>
            <p className="text-base font-bold">{visitors.filter(x => x.status === 'Checked Out').length}</p>
          </div>
        </div>
      </div>

      <HardwareDisclaimer 
        featureName="Face & Optical QR Gate System"
        requirements="Biometric Facial ID and Barcode/QR turnstiles use real-time digital pass verification. Native Android apps bind to CameraX and security gate turnstile relays."
      />

      {/* Search and Action Bar */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex-1 flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search visitor, phone, host, company..."
              className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
            {searchTerm && <button onClick={() => setSearchTerm('')}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
          </div>
          <button
            onClick={handleExport}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          {['All', 'Pre-Approved', 'Checked In', 'Checked Out'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Visitor Records List */}
      <div className="space-y-3">
        {filteredVisitors.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">{t.noRecordsFound}</p>
          </div>
        ) : (
          filteredVisitors.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                      {item.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Checked In' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      item.status === 'Pre-Approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                      {item.gateNumber.split(' ')[0]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.company} • {item.phone}
                  </p>
                </div>

                <button
                  onClick={() => setActiveQrVisitor(item)}
                  className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition flex items-center space-x-1"
                  title="View Digital QR Pass"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-[10px] font-bold">QR Pass</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Host Employee</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.hostEmployee}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Visit Purpose</span>
                  <span className="truncate block font-semibold text-slate-800 dark:text-slate-200">{item.purpose}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Check-In Time</span>
                  <span>{item.checkInTime || 'Awaiting Arrival'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Face Recognition</span>
                  <span className={`font-semibold ${item.faceRecognitionStatus === 'Verified' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                    {item.faceRecognitionStatus}
                  </span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  {item.status === 'Pre-Approved' && (
                    <button
                      onClick={() => handleCheckIn(item.id)}
                      className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 font-semibold hover:bg-emerald-100 transition"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Check-In Now</span>
                    </button>
                  )}
                  {item.status === 'Checked In' && (
                    <button
                      onClick={() => handleCheckOut(item.id)}
                      className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-200 font-semibold hover:bg-blue-100 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Check-Out</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-teal-600 p-1 rounded-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.edit}</span>
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(item.id)}
                    className="flex items-center space-x-1 text-rose-600 hover:text-rose-700 p-1 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.delete}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Visitor Registration Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingVisitor ? 'Edit Visitor Record' : 'Register New Visitor'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-600 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Visitor Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Infosys Ltd."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Host Employee (Meeting With) *
                </label>
                <input
                  type="text"
                  value={hostEmployee}
                  onChange={(e) => setHostEmployee(e.target.value)}
                  placeholder="e.g. Neha Kulkarni (Facilities)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purpose of Visit
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Vendor Technical Presentation"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designated Gate
                  </label>
                  <select
                    value={gateNumber}
                    onChange={(e) => setGateNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Gate 1 (Main Security Plaza)">Gate 1 (Main)</option>
                    <option value="Gate 2 (Visitor Lobby)">Gate 2 (Lobby)</option>
                    <option value="Gate 3 (Goods & Service)">Gate 3 (Goods)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Face Recognition Status
                  </label>
                  <select
                    value={faceStatus}
                    onChange={(e) => setFaceStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending Scan</option>
                    <option value="Not Configured">Not Configured</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="preApprovedCheck"
                  checked={preApproved}
                  onChange={(e) => setPreApproved(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="preApprovedCheck" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Pre-Approval Granted (Skip long reception queue)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Pass Viewer Modal */}
      {activeQrVisitor && (
        <QRViewerModal
          isOpen={!!activeQrVisitor}
          title={`Visitor Entry Pass: ${activeQrVisitor.name}`}
          token={activeQrVisitor.qrCode}
          subtitle={`Host: ${activeQrVisitor.hostEmployee} • Gate: ${activeQrVisitor.gateNumber}`}
          details={{
            'Visitor ID': activeQrVisitor.id,
            'Company': activeQrVisitor.company,
            'Phone': activeQrVisitor.phone,
            'Pre-Approved': activeQrVisitor.preApproved ? 'Yes (Fast-Track)' : 'No',
            'Face Verification': activeQrVisitor.faceRecognitionStatus,
            'Current Status': activeQrVisitor.status
          }}
          onClose={() => setActiveQrVisitor(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteTargetId}
        title={t.deleteConfirmTitle}
        message={t.deleteConfirmMsg}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
