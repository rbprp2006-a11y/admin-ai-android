import React, { useState } from 'react';
import { 
  Sparkles, Plus, Search, Download, ArrowLeft, Trash2, Edit3, X, 
  CheckSquare, Square, Clock, User, CheckCircle2, AlertCircle
} from 'lucide-react';
import { HousekeepingTask, Language } from '../types/modules';
import { StorageService } from '../services/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { HardwareDisclaimer } from '../components/HardwareDisclaimer';
import { translations } from '../i18n/translations';

interface Props {
  onBack: () => void;
  lang: Language;
}

export const HousekeepingView: React.FC<Props> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [tasks, setTasks] = useState<HousekeepingTask[]>(() => StorageService.getHousekeepingTasks());
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HousekeepingTask | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form inputs
  const [areaZone, setAreaZone] = useState('');
  const [shift, setShift] = useState<HousekeepingTask['shift']>('Morning');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [supervisor, setSupervisor] = useState('Sunil Patil (Operations Supervisor)');
  const [checklistRaw, setChecklistRaw] = useState('Sanitize desks\nVacuum carpets\nRestock hand wash\nClear trash bins');
  const [formError, setFormError] = useState('');

  const filteredTasks = tasks.filter(item => {
    const matchSearch =
      item.areaZone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedStaff.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supervisor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchShift = shiftFilter === 'All' || item.shift === shiftFilter;
    return matchSearch && matchShift;
  });

  const handleOpenCreate = () => {
    setEditingTask(null);
    setAreaZone('');
    setShift('Morning');
    setAssignedStaff('Sunita Gaikwad');
    setSupervisor('Sunil Patil (Operations Supervisor)');
    setChecklistRaw('Sanitize desks\nVacuum carpets\nRestock hand wash\nClear trash bins');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: HousekeepingTask) => {
    setEditingTask(item);
    setAreaZone(item.areaZone);
    setShift(item.shift);
    setAssignedStaff(item.assignedStaff);
    setSupervisor(item.supervisor);
    const list = item.checklist || (item.checklists as any) || [];
    setChecklistRaw(list.map((c: any) => c.task || c.label || '').join('\n'));
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaZone.trim() || !assignedStaff.trim()) {
      setFormError('Please enter Area Zone and Assigned Staff.');
      return;
    }

    const checklistItems = checklistRaw
      .split('\n')
      .map(x => x.trim())
      .filter(Boolean)
      .map((t, idx) => ({ id: `c-${idx + 1}`, task: t, done: false }));

    let updated: HousekeepingTask[];
    if (editingTask) {
      updated = tasks.map(item => {
        if (item.id === editingTask.id) {
          return {
            ...item,
            areaZone,
            shift,
            assignedStaff,
            supervisor,
            checklist: checklistItems.length ? checklistItems : item.checklist,
          };
        }
        return item;
      });
    } else {
      const newId = `HK-${8000 + tasks.length + 1}`;
      const newTask: HousekeepingTask = {
        id: newId,
        areaZone,
        shift,
        assignedStaff,
        supervisor,
        checklist: checklistItems.length ? checklistItems : [{ id: 'c-1', task: 'General cleaning', done: false }],
        completionPercentage: 0,
        supervisorSignoff: false,
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
      };
      updated = [newTask, ...tasks];
    }

    setTasks(updated);
    StorageService.saveHousekeepingTasks(updated);
    setIsFormOpen(false);
  };

  const handleToggleCheckItem = (taskId: string, checkItemId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const currentList = t.checklist || (t.checklists as any) || [];
        const nextChecklist = currentList.map((c: any) => c.id === checkItemId ? { ...c, done: !c.done } : c);
        const doneCount = nextChecklist.filter((c: any) => c.done).length;
        const pct = nextChecklist.length > 0 ? Math.round((doneCount / nextChecklist.length) * 100) : 0;
        return {
          ...t,
          checklist: nextChecklist,
          checklists: nextChecklist,
          completionPercentage: pct,
          status: (pct === 100 ? 'Completed' : pct > 0 ? 'In Progress' : 'Scheduled') as HousekeepingTask['status']
        };
      }
      return t;
    });
    setTasks(updated);
    StorageService.saveHousekeepingTasks(updated);
  };

  const handleToggleSignoff = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          supervisorSignoff: !t.supervisorSignoff
        };
      }
      return t;
    });
    setTasks(updated);
    StorageService.saveHousekeepingTasks(updated);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const updated = tasks.filter(item => item.id !== deleteTargetId);
    setTasks(updated);
    StorageService.saveHousekeepingTasks(updated);
    setDeleteTargetId(null);
  };

  const handleExport = () => {
    StorageService.exportToCsv('housekeeping_audit_tasks', tasks);
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
        <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 px-2.5 py-1 rounded-full border border-pink-200 dark:border-pink-900">
          Module 8 / 11
        </span>
      </div>

      {/* Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-700 via-rose-800 to-slate-900 text-white shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
            <Sparkles className="w-6 h-6 text-pink-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{t.modules.housekeeping.title}</h2>
            <p className="text-xs text-pink-100 leading-snug">{t.modules.housekeeping.desc}</p>
          </div>
        </div>

        {/* Completion rate strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-pink-200 uppercase font-medium">Completed</span>
            <p className="text-base font-bold text-emerald-300">{tasks.filter(x => x.status === 'Completed').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-pink-200 uppercase font-medium">In Progress</span>
            <p className="text-base font-bold text-amber-300">{tasks.filter(x => x.status === 'In Progress').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-pink-200 uppercase font-medium">Sign-off Done</span>
            <p className="text-base font-bold">{tasks.filter(x => x.supervisorSignoff).length}</p>
          </div>
        </div>
      </div>

      <HardwareDisclaimer 
        featureName="Hygiene Verification & NFC Patrol Checks" 
        requirements="Housekeeping staff touch physical NFC tags placed in restrooms & wings to record timestamps. Real-time checklist syncs during inspection sweeps."
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
              placeholder="Search area, staff, supervisor..."
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
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs shadow-md shadow-pink-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          {['All', 'Morning', 'Afternoon', 'Night'].map((st) => (
            <button
              key={st}
              onClick={() => setShiftFilter(st)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                shiftFilter === st
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st} Shift
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">{t.noRecordsFound}</p>
          </div>
        ) : (
          filteredTasks.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-pink-600 dark:text-pink-400">
                      {item.id}
                    </span>
                    <span className="text-[10px] bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full font-bold">
                      {item.shift} Shift
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      item.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.areaZone}
                  </h3>
                </div>

                <button
                  onClick={() => handleToggleSignoff(item.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                    item.supervisorSignoff
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-50 text-slate-500 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {item.supervisorSignoff ? '✓ Signed Off' : 'Pending Sign-off'}
                </button>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Task Checklist Completion</span>
                  <span>{item.completionPercentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      item.completionPercentage === 100 ? 'bg-emerald-500' : 'bg-pink-500'
                    }`}
                    style={{ width: `${item.completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Interactive checklist */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Checklist Items (Tap to toggle)
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {(item.checklist || (item.checklists as any) || []).map((chk: any) => (
                    <div
                      key={chk.id}
                      onClick={() => handleToggleCheckItem(item.id, chk.id)}
                      className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:text-pink-600 transition"
                    >
                      {chk.done ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span className={chk.done ? 'line-through text-slate-400' : ''}>
                        {chk.task || chk.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Staff: <strong className="text-slate-700 dark:text-slate-300">{item.assignedStaff}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-pink-600 p-1 rounded-lg"
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

      {/* Housekeeping Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingTask ? 'Edit Housekeeping Allocation' : 'Create Housekeeping Duty'}
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
                  Area / Zone Name *
                </label>
                <input
                  type="text"
                  value={areaZone}
                  onChange={(e) => setAreaZone(e.target.value)}
                  placeholder="e.g. Floor 2 Restrooms & Executive Washrooms"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Shift
                  </label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Morning">Morning (06:00 - 14:00)</option>
                    <option value="Afternoon">Afternoon (14:00 - 22:00)</option>
                    <option value="Night">Night (22:00 - 06:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Staff *
                  </label>
                  <input
                    type="text"
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    placeholder="Staff Full Name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supervising Lead
                </label>
                <input
                  type="text"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  placeholder="Supervisor Name"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Checklist Items (One item per line)
                </label>
                <textarea
                  rows={4}
                  value={checklistRaw}
                  onChange={(e) => setChecklistRaw(e.target.value)}
                  placeholder="Mop floor\nDisinfect sink mirrors\nRefill liquid soap"
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
                  className="px-4 py-2 font-semibold rounded-xl bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-600/20"
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
