import React, { useState } from 'react';
import { 
  ShieldCheck, Plus, Search, Download, ArrowLeft, Trash2, Edit3, X, 
  QrCode, CheckCircle2, XCircle, Clock, User, Package, Calendar, ShieldAlert
} from 'lucide-react';
import { GatePassRecord, Language } from '../types/modules';
import { StorageService } from '../services/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { QRViewerModal } from '../components/QRViewerModal';
import { HardwareDisclaimer } from '../components/HardwareDisclaimer';
import { translations } from '../i18n/translations';

interface Props {
  onBack: () => void;
  lang: Language;
}

export const GatePassView: React.FC<Props> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [passes, setPasses] = useState<GatePassRecord[]>(() => StorageService.getGatePasses());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPass, setEditingPass] = useState<GatePassRecord | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [activeQrPass, setActiveQrPass] = useState<GatePassRecord | null>(null);

  // Form inputs
  const [passType, setPassType] = useState<GatePassRecord['passType']>('Returnable Material');
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [requesterName, setRequesterName] = useState('');
  const [department, setDepartment] = useState('Hardware Lab');
  const [approverName, setApproverName] = useState('Admin Security Manager');
  const [gateNumber, setGateNumber] = useState('Gate 3 (Goods Outward)');
  const [expectedReturnDate, setExpectedReturnDate] = useState('2026-10-15');
  const [formError, setFormError] = useState('');

  const filteredPasses = passes.filter(item => {
    const matchSearch =
      item.passNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || item.approvalStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenCreate = () => {
    setEditingPass(null);
    setPassType('Returnable Material');
    setItemDescription('');
    setQuantity(1);
    setRequesterName('Vikram Rao');
    setDepartment('IT Systems');
    setApproverName('Admin Security Manager');
    setGateNumber('Gate 3 (Goods Outward)');
    setExpectedReturnDate('2026-10-15');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: GatePassRecord) => {
    setEditingPass(item);
    setPassType(item.passType);
    setItemDescription(item.itemDescription);
    setQuantity(item.quantity);
    setRequesterName(item.requesterName);
    setDepartment(item.department);
    setApproverName(item.approverName);
    setGateNumber(item.gateNumber);
    setExpectedReturnDate(item.expectedReturnDate || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDescription.trim() || !requesterName.trim()) {
      setFormError('Please enter Item Description and Requester Name.');
      return;
    }

    let updated: GatePassRecord[];
    if (editingPass) {
      updated = passes.map(item => {
        if (item.id === editingPass.id) {
          return {
            ...item,
            passType,
            itemDescription,
            quantity,
            requesterName,
            department,
            approverName,
            gateNumber,
            expectedReturnDate: passType.includes('Returnable') ? expectedReturnDate : undefined,
          };
        }
        return item;
      });
    } else {
      const newId = `GP-${7000 + passes.length + 1}`;
      const newNum = `GP-2026-${String(passes.length + 1).padStart(4, '0')}`;
      const newPass: GatePassRecord = {
        id: newId,
        passNumber: newNum,
        passType,
        itemDescription,
        quantity,
        requesterName,
        department,
        approverName,
        approvalStatus: 'Pending',
        gateNumber,
        qrVerificationCode: `GP-VERIFY-${newNum}-${Math.floor(1000 + Math.random() * 9000)}`,
        expectedReturnDate: passType.includes('Returnable') ? expectedReturnDate : undefined,
        createdAt: new Date().toISOString(),
      };
      updated = [newPass, ...passes];
    }

    setPasses(updated);
    StorageService.saveGatePasses(updated);
    setIsFormOpen(false);
  };

  const handleApprove = (id: string) => {
    const updated = passes.map(p => p.id === id ? { ...p, approvalStatus: 'Approved' as const } : p);
    setPasses(updated);
    StorageService.saveGatePasses(updated);
  };

  const handleReject = (id: string) => {
    const updated = passes.map(p => p.id === id ? { ...p, approvalStatus: 'Rejected' as const } : p);
    setPasses(updated);
    StorageService.saveGatePasses(updated);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const updated = passes.filter(item => item.id !== deleteTargetId);
    setPasses(updated);
    StorageService.saveGatePasses(updated);
    setDeleteTargetId(null);
  };

  const handleExport = () => {
    StorageService.exportToCsv('gate_passes_register', passes);
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900">
          Module 7 / 11
        </span>
      </div>

      {/* Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-700 via-pink-800 to-slate-900 text-white shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-rose-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{t.modules.gatepass.title}</h2>
            <p className="text-xs text-rose-100 leading-snug">{t.modules.gatepass.desc}</p>
          </div>
        </div>

        {/* Approval status strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-rose-200 uppercase font-medium">Pending Approval</span>
            <p className="text-base font-bold text-amber-300">{passes.filter(x => x.approvalStatus === 'Pending').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-rose-200 uppercase font-medium">Approved Passes</span>
            <p className="text-base font-bold text-emerald-300">{passes.filter(x => x.approvalStatus === 'Approved').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-rose-200 uppercase font-medium">Total Passes</span>
            <p className="text-base font-bold">{passes.length}</p>
          </div>
        </div>
      </div>

      <HardwareDisclaimer 
        featureName="Security Turnstile & Gate Outward Scanner" 
        requirements="Security guards scan digital gate passes at Outward Gates. Optical barcode verification validates tamper-proof HMAC signatures before release."
      />

      {/* Search & Actions Bar */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex-1 flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pass number, item, requester..."
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
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                statusFilter === st
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Passes List */}
      <div className="space-y-3">
        {filteredPasses.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">{t.noRecordsFound}</p>
          </div>
        ) : (
          filteredPasses.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                      {item.passNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      item.approvalStatus === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {item.approvalStatus}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                      {item.passType}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.itemDescription} ({item.quantity} units)
                  </h3>
                </div>

                <button
                  onClick={() => setActiveQrPass(item)}
                  className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition flex items-center space-x-1"
                  title="View Gate QR Pass"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-[10px] font-bold">QR Pass</span>
                </button>
              </div>

              {/* Pass details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Requester</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.requesterName} ({item.department})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Exit Gate</span>
                  <span className="truncate block font-semibold text-slate-800 dark:text-slate-200">{item.gateNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Approver Authority</span>
                  <span>{item.approverName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Expected Return</span>
                  <span>{item.expectedReturnDate || 'Non-Returnable'}</span>
                </div>
              </div>

              {/* Approval Buttons & Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  {item.approvalStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 font-semibold hover:bg-emerald-100 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="flex items-center space-x-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-xl border border-rose-200 font-semibold hover:bg-rose-100 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-rose-600 p-1 rounded-lg"
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

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingPass ? 'Edit Gate Pass' : 'Issue Electronic Gate Pass'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pass Type
                  </label>
                  <select
                    value={passType}
                    onChange={(e) => setPassType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Returnable Material">Returnable Material</option>
                    <option value="Non-Returnable Material">Non-Returnable Material</option>
                    <option value="Contractor Equipment">Contractor Equipment</option>
                    <option value="Vehicle Pass">Vehicle Pass</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Exit Gate
                  </label>
                  <select
                    value={gateNumber}
                    onChange={(e) => setGateNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Gate 1 (Main Security Plaza)">Gate 1 (Main Security Plaza)</option>
                    <option value="Gate 2 (Lobby)">Gate 2 (Lobby)</option>
                    <option value="Gate 3 (Goods Outward)">Gate 3 (Goods Outward)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Description *
                </label>
                <input
                  type="text"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="e.g. Oscilloscope Tektronix TDS2024C"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="R&D Lab"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Requester Name *
                  </label>
                  <input
                    type="text"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    placeholder="Employee Name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Approver Authority
                  </label>
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    placeholder="Security Head"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {passType.includes('Returnable') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Return Date
                  </label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              )}

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
                  className="px-4 py-2 font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Viewer */}
      {activeQrPass && (
        <QRViewerModal
          isOpen={!!activeQrPass}
          title={`Electronic Gate Pass: ${activeQrPass.passNumber}`}
          token={activeQrPass.qrVerificationCode}
          subtitle={`${activeQrPass.passType} • Exit: ${activeQrPass.gateNumber}`}
          details={{
            'Item': `${activeQrPass.itemDescription} (${activeQrPass.quantity} pcs)`,
            'Requester': `${activeQrPass.requesterName} (${activeQrPass.department})`,
            'Approver': activeQrPass.approverName,
            'Approval Status': activeQrPass.approvalStatus,
            'Expected Return': activeQrPass.expectedReturnDate || 'N/A (Non-Returnable)'
          }}
          onClose={() => setActiveQrPass(null)}
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
