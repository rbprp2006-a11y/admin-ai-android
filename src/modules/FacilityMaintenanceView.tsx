import React, { useState } from 'react';
import { 
  Wrench, Plus, Search, Filter, Download, ArrowLeft, Clock, AlertTriangle, 
  CheckCircle2, Trash2, Edit3, X, UserCheck, MapPin, ShieldAlert, Tag
} from 'lucide-react';
import { FacilityTicket, Language } from '../types/modules';
import { StorageService } from '../services/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { HardwareDisclaimer } from '../components/HardwareDisclaimer';
import { translations } from '../i18n/translations';

interface Props {
  onBack: () => void;
  lang: Language;
}

export const FacilityMaintenanceView: React.FC<Props> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [tickets, setTickets] = useState<FacilityTicket[]>(() => StorageService.getFacilityTickets());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<FacilityTicket | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FacilityTicket['category']>('Electrical');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<FacilityTicket['priority']>('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [slaHours, setSlaHours] = useState(4);
  const [reportedBy, setReportedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const filteredTickets = tickets.filter(item => {
    const matchSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || item.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleOpenCreate = () => {
    setEditingTicket(null);
    setTitle('');
    setCategory('Electrical');
    setLocation('');
    setPriority('Medium');
    setAssignedTo('Facilities Maintenance Desk');
    setSlaHours(4);
    setReportedBy('Admin Desk Operator');
    setNotes('');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: FacilityTicket) => {
    setEditingTicket(item);
    setTitle(item.title);
    setCategory(item.category);
    setLocation(item.location);
    setPriority(item.priority);
    setAssignedTo(item.assignedTo);
    setSlaHours(item.slaHours);
    setReportedBy(item.reportedBy);
    setNotes(item.resolutionNotes || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      setFormError('Please enter both Title and Location details.');
      return;
    }

    let updated: FacilityTicket[];
    if (editingTicket) {
      updated = tickets.map(item => {
        if (item.id === editingTicket.id) {
          return {
            ...item,
            title,
            category,
            location,
            priority,
            assignedTo,
            slaHours,
            reportedBy,
            resolutionNotes: notes,
          };
        }
        return item;
      });
    } else {
      const newId = `FAC-${1000 + tickets.length + 1}`;
      const newTicket: FacilityTicket = {
        id: newId,
        title,
        category,
        location,
        priority,
        assignedTo,
        slaHours,
        slaDeadline: new Date(Date.now() + slaHours * 3600 * 1000).toISOString(),
        status: 'Open',
        reportedBy,
        createdAt: new Date().toISOString(),
        resolutionNotes: notes,
      };
      updated = [newTicket, ...tickets];
    }

    setTickets(updated);
    StorageService.saveFacilityTickets(updated);
    setIsFormOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: FacilityTicket['status']) => {
    const updated = tickets.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setTickets(updated);
    StorageService.saveFacilityTickets(updated);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const updated = tickets.filter(item => item.id !== deleteTargetId);
    setTickets(updated);
    StorageService.saveFacilityTickets(updated);
    setDeleteTargetId(null);
  };

  const handleExport = () => {
    StorageService.exportToCsv('facility_maintenance_tickets', tickets);
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
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900">
          Module 1 / 11
        </span>
      </div>

      {/* Module Title Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
            <Wrench className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{t.modules.facility.title}</h2>
            <p className="text-xs text-blue-100 leading-snug">{t.modules.facility.desc}</p>
          </div>
        </div>

        {/* SLA Watchdog Stats Strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-blue-200 uppercase font-medium">Active Tickets</span>
            <p className="text-base font-bold">{tickets.filter(x => x.status !== 'Resolved').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-blue-200 uppercase font-medium">Critical / High</span>
            <p className="text-base font-bold text-amber-300">{tickets.filter(x => x.priority === 'Critical' || x.priority === 'High').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-blue-200 uppercase font-medium">Resolved</span>
            <p className="text-base font-bold text-emerald-300">{tickets.filter(x => x.status === 'Resolved').length}</p>
          </div>
        </div>
      </div>

      <HardwareDisclaimer 
        featureName="SLA Escalation AI Engine" 
        requirements="Automated background SLA monitoring checks ticket deadlines every 15 mins. Escalates to Facility Director upon breach threshold."
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
              placeholder="Search complaint, location, engineer..."
              className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}><X className="w-3.5 h-3.5 text-slate-400" /></button>
            )}
          </div>
          <button
            onClick={handleExport}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          {['All', 'Open', 'In Progress', 'Resolved', 'Escalated'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <Wrench className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">{t.noRecordsFound}</p>
          </div>
        ) : (
          filteredTickets.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {item.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.priority === 'Critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      item.priority === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {item.priority}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {item.title}
                  </h3>
                </div>

                {/* Status Switcher dropdown */}
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value as FacilityTicket['status'])}
                  className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none transition ${
                    item.status === 'Resolved' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300' :
                    item.status === 'In Progress' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300' :
                    item.status === 'Escalated' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300' :
                    'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300'
                  }`}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{item.assignedTo}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>SLA: {item.slaHours}h target</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">By: {item.reportedBy}</span>
                </div>
              </div>

              {item.resolutionNotes && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Notes: </span>
                  {item.resolutionNotes}
                </div>
              )}

              {/* Actions strip */}
              <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t.edit}</span>
                </button>
                <button
                  onClick={() => setDeleteTargetId(item.id)}
                  className="flex items-center space-x-1 text-rose-600 dark:text-rose-400 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.delete}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingTicket ? 'Edit Maintenance Ticket' : 'Register New Complaint Ticket'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Server Room 2B AC Temperature Alert"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="HVAC / AC">HVAC / AC</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Civil">Civil</option>
                    <option value="Network / IT">Network / IT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Low">Low (24h SLA)</option>
                    <option value="Medium">Medium (8h SLA)</option>
                    <option value="High">High (4h SLA)</option>
                    <option value="Critical">Critical (2h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location / Specific Floor Wing *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Floor 2, Server Room 2B"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Technician
                  </label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="e.g. Suresh Patil"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SLA Window (Hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={72}
                    value={slaHours}
                    onChange={(e) => setSlaHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reported By (Employee / Dept)
                </label>
                <input
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  placeholder="e.g. Admin Desk Operator"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resolution / Inspection Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add diagnostic notes or spare parts required..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
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
                  className="px-4 py-2 font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
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
