import React, { useState } from 'react';
import { 
  Briefcase, Plus, Search, Download, ArrowLeft, Trash2, Edit3, X, 
  Phone, Mail, Calendar, FileText, Star, AlertCircle, CheckCircle2, IndianRupee
} from 'lucide-react';
import { VendorRecord, Language } from '../types/modules';
import { StorageService } from '../services/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { HardwareDisclaimer } from '../components/HardwareDisclaimer';
import { translations } from '../i18n/translations';

interface Props {
  onBack: () => void;
  lang: Language;
}

export const VendorManagementView: React.FC<Props> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [vendors, setVendors] = useState<VendorRecord[]>(() => StorageService.getVendorRecords());
  const [searchTerm, setSearchTerm] = useState('');
  const [amcFilter, setAmcFilter] = useState<string>('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorRecord | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form inputs
  const [companyName, setCompanyName] = useState('');
  const [serviceCategory, setServiceCategory] = useState<VendorRecord['serviceCategory']>('HVAC Maintenance');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [amcStatus, setAmcStatus] = useState<VendorRecord['amcStatus']>('Active');
  const [amcEndDate, setAmcEndDate] = useState('2027-03-31');
  const [pendingPoCount, setPendingPoCount] = useState(1);
  const [pendingInvoicesAmount, setPendingInvoicesAmount] = useState(150000);
  const [performanceScore, setPerformanceScore] = useState(4.5);
  const [formError, setFormError] = useState('');

  const filteredVendors = vendors.filter(item => {
    const matchSearch =
      item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAmc = amcFilter === 'All' || item.amcStatus === amcFilter;
    return matchSearch && matchAmc;
  });

  const handleOpenCreate = () => {
    setEditingVendor(null);
    setCompanyName('');
    setServiceCategory('HVAC Maintenance');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAmcStatus('Active');
    setAmcEndDate('2027-03-31');
    setPendingPoCount(1);
    setPendingInvoicesAmount(100000);
    setPerformanceScore(4.5);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: VendorRecord) => {
    setEditingVendor(item);
    setCompanyName(item.companyName);
    setServiceCategory(item.serviceCategory);
    setContactPerson(item.contactPerson);
    setPhone(item.phone);
    setEmail(item.email);
    setAmcStatus(item.amcStatus);
    setAmcEndDate(item.amcEndDate);
    setPendingPoCount(item.pendingPoCount);
    setPendingInvoicesAmount(item.pendingInvoicesAmount);
    setPerformanceScore(item.performanceScore);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim() || !phone.trim()) {
      setFormError('Please enter Company Name, Contact Person and Phone.');
      return;
    }

    let updated: VendorRecord[];
    if (editingVendor) {
      updated = vendors.map(item => {
        if (item.id === editingVendor.id) {
          return {
            ...item,
            companyName,
            serviceCategory,
            contactPerson,
            phone,
            email,
            amcStatus,
            amcEndDate,
            pendingPoCount,
            pendingInvoicesAmount,
            performanceScore,
          };
        }
        return item;
      });
    } else {
      const newId = `VND-${5000 + vendors.length + 1}`;
      const newRecord: VendorRecord = {
        id: newId,
        companyName,
        serviceCategory,
        contactPerson,
        phone,
        email: email || 'contact@vendor.com',
        amcStatus,
        amcEndDate,
        pendingPoCount,
        pendingInvoicesAmount,
        performanceScore,
        createdAt: new Date().toISOString(),
      };
      updated = [newRecord, ...vendors];
    }

    setVendors(updated);
    StorageService.saveVendorRecords(updated);
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const updated = vendors.filter(item => item.id !== deleteTargetId);
    setVendors(updated);
    StorageService.saveVendorRecords(updated);
    setDeleteTargetId(null);
  };

  const handleExport = () => {
    StorageService.exportToCsv('vendor_amc_contracts', vendors);
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
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-900">
          Module 5 / 11
        </span>
      </div>

      {/* Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-950 text-white shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
            <Briefcase className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{t.modules.vendor.title}</h2>
            <p className="text-xs text-purple-100 leading-snug">{t.modules.vendor.desc}</p>
          </div>
        </div>

        {/* Contract Health Strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-purple-200 uppercase font-medium">Active AMCs</span>
            <p className="text-base font-bold text-emerald-300">{vendors.filter(x => x.amcStatus === 'Active').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-purple-200 uppercase font-medium">Expiring Soon</span>
            <p className="text-base font-bold text-amber-300">{vendors.filter(x => x.amcStatus === 'Expiring Soon').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-purple-200 uppercase font-medium">Pending POs</span>
            <p className="text-base font-bold">{vendors.reduce((s, v) => s + (v.pendingPoCount || 0), 0)}</p>
          </div>
        </div>
      </div>

      <HardwareDisclaimer 
        featureName="AMC Watchdog & Invoice Reconciliation" 
        requirements="Automated reminder triggers 30 days prior to contract expiration. ERP invoice synchronization connects with SAP/Oracle finance endpoints."
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
              placeholder="Search vendor company, contact, category..."
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
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          {['All', 'Active', 'Expiring Soon', 'Expired'].map((st) => (
            <button
              key={st}
              onClick={() => setAmcFilter(st)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                amcFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors List */}
      <div className="space-y-3">
        {filteredVendors.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">{t.noRecordsFound}</p>
          </div>
        ) : (
          filteredVendors.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                      {item.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.amcStatus === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      item.amcStatus === 'Expiring Soon' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      AMC: {item.amcStatus}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                      {item.serviceCategory}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.companyName}
                  </h3>
                </div>

                <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded-xl border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{item.performanceScore.toFixed(1)}</span>
                </div>
              </div>

              {/* Vendor details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Contact Person</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.contactPerson}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Phone & Email</span>
                  <span className="truncate block font-semibold text-slate-800 dark:text-slate-200">{item.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">AMC End Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.amcEndDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Pending Invoices</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{item.pendingInvoicesAmount.toLocaleString()} ({item.pendingPoCount} POs)</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-purple-600 p-1 rounded-lg"
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
          ))
        )}
      </div>

      {/* Vendor Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingVendor ? 'Edit Vendor AMC Contract' : 'Register New Vendor'}
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
                  Vendor Company Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Blue Star Climate Solutions Ltd."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Service Category
                  </label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="HVAC Maintenance">HVAC Maintenance</option>
                    <option value="Facility Services">Facility Services</option>
                    <option value="Security Personnel">Security Personnel</option>
                    <option value="Catering">Catering</option>
                    <option value="Stationery & Office Supplies">Stationery & Office</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    AMC Status
                  </label>
                  <select
                    value={amcStatus}
                    onChange={(e) => setAmcStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon (30 Days)</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Anand Mehta"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="corporate@vendor.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    AMC Expiry Date
                  </label>
                  <input
                    type="date"
                    value={amcEndDate}
                    onChange={(e) => setAmcEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pending Invoices (₹)
                  </label>
                  <input
                    type="number"
                    value={pendingInvoicesAmount}
                    onChange={(e) => setPendingInvoicesAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pending POs
                  </label>
                  <input
                    type="number"
                    value={pendingPoCount}
                    onChange={(e) => setPendingPoCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={performanceScore}
                    onChange={(e) => setPerformanceScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
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
                  className="px-4 py-2 font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
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
