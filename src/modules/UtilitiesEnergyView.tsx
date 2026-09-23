import React, { useState } from 'react';
import { 
  Zap, Plus, Search, Download, ArrowLeft, Trash2, Edit3, X, 
  Droplets, Flame, Sun, AlertTriangle, TrendingDown, IndianRupee, Activity
} from 'lucide-react';
import { UtilityLog, Language } from '../types/modules';
import { StorageService } from '../services/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { HardwareDisclaimer } from '../components/HardwareDisclaimer';
import { translations } from '../i18n/translations';

interface Props {
  onBack: () => void;
  lang: Language;
}

export const UtilitiesEnergyView: React.FC<Props> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [logs, setLogs] = useState<UtilityLog[]>(() => StorageService.getUtilityLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<UtilityLog | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form inputs
  const [utilityType, setUtilityType] = useState<UtilityLog['utilityType']>('Electricity');
  const [meterId, setMeterId] = useState('');
  const [dailyConsumption, setDailyConsumption] = useState(1200);
  const [unit, setUnit] = useState('kWh');
  const [estimatedCost, setEstimatedCost] = useState(13200);
  const [alertThreshold, setAlertThreshold] = useState(1500);
  const [optimizationTip, setOptimizationTip] = useState('');
  const [formError, setFormError] = useState('');

  const filteredLogs = logs.filter(item => {
    const matchSearch =
      item.meterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.utilityType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'All' || item.utilityType === typeFilter;
    return matchSearch && matchType;
  });

  const handleOpenCreate = () => {
    setEditingLog(null);
    setUtilityType('Electricity');
    setMeterId('MTR-E-101');
    setDailyConsumption(1250);
    setUnit('kWh');
    setEstimatedCost(13750);
    setAlertThreshold(1500);
    setOptimizationTip('Shift chiller pre-cooling cycle to 05:00 AM off-peak tariff window.');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: UtilityLog) => {
    setEditingLog(item);
    setUtilityType(item.utilityType);
    setMeterId(item.meterId);
    setDailyConsumption(item.dailyConsumption);
    setUnit(item.unit);
    setEstimatedCost(item.estimatedCost);
    setAlertThreshold(item.alertThreshold);
    setOptimizationTip(item.optimizationTip || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meterId.trim()) {
      setFormError('Please enter Meter ID / Location descriptor.');
      return;
    }

    let updated: UtilityLog[];
    if (editingLog) {
      updated = logs.map(item => {
        if (item.id === editingLog.id) {
          return {
            ...item,
            utilityType,
            meterId,
            dailyConsumption,
            unit,
            estimatedCost,
            alertThreshold,
            optimizationTip,
          };
        }
        return item;
      });
    } else {
      const newId = `UTL-${9000 + logs.length + 1}`;
      const newLog: UtilityLog = {
        id: newId,
        utilityType,
        meterId,
        date: new Date().toISOString().split('T')[0],
        dailyConsumption,
        unit,
        estimatedCost,
        alertThreshold,
        status: dailyConsumption > alertThreshold ? 'Peak Surge Alert' : 'Normal',
        optimizationTip: optimizationTip || 'Regular monitoring in effect.',
      };
      updated = [newLog, ...logs];
    }

    setLogs(updated);
    StorageService.saveUtilityLogs(updated);
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const updated = logs.filter(item => item.id !== deleteTargetId);
    setLogs(updated);
    StorageService.saveUtilityLogs(updated);
    setDeleteTargetId(null);
  };

  const handleExport = () => {
    StorageService.exportToCsv('utilities_energy_monitoring', logs);
  };

  const totalCost = logs.reduce((sum, l) => sum + (l.estimatedCost || 0), 0);

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
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900">
          Module 9 / 11
        </span>
      </div>

      {/* Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-700 to-slate-900 text-white shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
            <Zap className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{t.modules.utilities.title}</h2>
            <p className="text-xs text-amber-100 leading-snug">{t.modules.utilities.desc}</p>
          </div>
        </div>

        {/* Energy Cost Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-amber-200 uppercase font-medium">Daily Expense</span>
            <p className="text-base font-bold text-amber-200">₹{totalCost.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-amber-200 uppercase font-medium">Active Meters</span>
            <p className="text-base font-bold">{logs.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-amber-200 uppercase font-medium">Surge Alerts</span>
            <p className="text-base font-bold text-rose-300">{logs.filter(x => x.status.includes('Surge') || x.status.includes('Alert')).length}</p>
          </div>
        </div>
      </div>

      <HardwareDisclaimer 
        featureName="Smart Meter RS-485 / Modbus Telemetry" 
        requirements="Smart energy and flow meters stream telemetry via Modbus/BACnet IoT gateways. Manual log entries allow administrative verification during meter audits."
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
              placeholder="Search meter ID, utility type..."
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
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          {['All', 'Electricity', 'Water', 'Diesel Generator', 'Solar Power'].map((st) => (
            <button
              key={st}
              onClick={() => setTypeFilter(st)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                typeFilter === st
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Meter Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <Zap className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">{t.noRecordsFound}</p>
          </div>
        ) : (
          filteredLogs.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      {item.meterId}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Normal' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                      {item.utilityType}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {item.dailyConsumption.toLocaleString()} {item.unit}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    ₹{item.estimatedCost.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">Est. Daily Bill</span>
                </div>
              </div>

              {/* Progress towards surge limit */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Consumption vs Threshold ({item.alertThreshold} {item.unit})</span>
                  <span>{Math.round((item.dailyConsumption / item.alertThreshold) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      item.dailyConsumption > item.alertThreshold ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((item.dailyConsumption / item.alertThreshold) * 100))}%` }}
                  />
                </div>
              </div>

              {item.optimizationTip && (
                <div className="flex items-start space-x-2 p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                  <TrendingDown className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong className="font-semibold">AI Recommendation: </strong>
                    {item.optimizationTip}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400">Date Logged: {item.date}</span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-amber-600 p-1 rounded-lg"
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

      {/* Meter Log Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingLog ? 'Edit Utility Meter Record' : 'Log Daily Meter Reading'}
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
                    Utility Type
                  </label>
                  <select
                    value={utilityType}
                    onChange={(e) => {
                      const ut = e.target.value as any;
                      setUtilityType(ut);
                      if (ut === 'Electricity') setUnit('kWh');
                      else if (ut === 'Water') setUnit('kL');
                      else if (ut === 'Diesel Generator') setUnit('Liters');
                      else if (ut === 'Solar Power') setUnit('kWh Generated');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Electricity">Electricity</option>
                    <option value="Water">Water</option>
                    <option value="Diesel Generator">Diesel Generator</option>
                    <option value="Solar Power">Solar Power</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meter ID / Area *
                  </label>
                  <input
                    type="text"
                    value={meterId}
                    onChange={(e) => setMeterId(e.target.value)}
                    placeholder="MTR-E-101"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Reading
                  </label>
                  <input
                    type="number"
                    value={dailyConsumption}
                    onChange={(e) => setDailyConsumption(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Surge Alert Threshold ({unit})
                </label>
                <input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  AI Energy Optimization Advisory
                </label>
                <textarea
                  rows={2}
                  value={optimizationTip}
                  onChange={(e) => setOptimizationTip(e.target.value)}
                  placeholder="e.g. Reduce HVAC cooling load between 14:00-16:00 peak tariff."
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
                  className="px-4 py-2 font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
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
