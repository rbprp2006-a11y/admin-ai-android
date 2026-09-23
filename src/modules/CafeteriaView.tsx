import React, { useState } from 'react';
import { 
  UtensilsCrossed, Plus, Search, Download, ArrowLeft, Trash2, Edit3, X, 
  Users, Trash, TrendingUp, AlertTriangle, Calendar, Award
} from 'lucide-react';
import { CafeteriaLog, Language } from '../types/modules';
import { StorageService } from '../services/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { HardwareDisclaimer } from '../components/HardwareDisclaimer';
import { translations } from '../i18n/translations';

interface Props {
  onBack: () => void;
  lang: Language;
}

export const CafeteriaView: React.FC<Props> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [logs, setLogs] = useState<CafeteriaLog[]>(() => StorageService.getCafeteriaLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [mealFilter, setMealFilter] = useState<string>('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<CafeteriaLog | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form inputs
  const [mealType, setMealType] = useState<CafeteriaLog['mealType']>('Lunch');
  const [predictedHeadcount, setPredictedHeadcount] = useState(500);
  const [actualServed, setActualServed] = useState(480);
  const [foodWastageKg, setFoodWastageKg] = useState(12);
  const [contractorName, setContractorName] = useState('Sodexo Food Solutions');
  const [feedbackRating, setFeedbackRating] = useState(4.2);
  const [formError, setFormError] = useState('');

  const filteredLogs = logs.filter(item => {
    const meal = (item.mealType || '').toLowerCase();
    const contractor = (item.contractorName || '').toLowerCase();
    const dateStr = item.date || '';
    const q = searchTerm.toLowerCase();
    const matchSearch = meal.includes(q) || contractor.includes(q) || dateStr.includes(q);
    const matchMeal = mealFilter === 'All' || item.mealType === mealFilter;
    return matchSearch && matchMeal;
  });

  const handleOpenCreate = () => {
    setEditingLog(null);
    setMealType('Lunch');
    setPredictedHeadcount(500);
    setActualServed(485);
    setFoodWastageKg(10);
    setContractorName('Sodexo Food Solutions');
    setFeedbackRating(4.3);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: CafeteriaLog) => {
    setEditingLog(item);
    setMealType(item.mealType);
    setPredictedHeadcount(item.predictedHeadcount);
    setActualServed(item.actualServed);
    setFoodWastageKg(item.foodWastageKg);
    setContractorName(item.contractorName);
    setFeedbackRating(item.feedbackRating);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorName.trim()) {
      setFormError('Please enter Caterer / Contractor Name.');
      return;
    }

    let updated: CafeteriaLog[];
    if (editingLog) {
      updated = logs.map(item => {
        if (item.id === editingLog.id) {
          return {
            ...item,
            mealType,
            predictedHeadcount,
            actualServed,
            foodWastageKg,
            contractorName,
            feedbackRating,
          };
        }
        return item;
      });
    } else {
      const newId = `CAF-${1000 + logs.length + 1}`;
      const newLog: CafeteriaLog = {
        id: newId,
        date: new Date().toISOString().split('T')[0],
        mealType,
        predictedHeadcount,
        actualServed,
        foodWastageKg,
        contractorName,
        feedbackRating,
      };
      updated = [newLog, ...logs];
    }

    setLogs(updated);
    StorageService.saveCafeteriaLogs(updated);
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const updated = logs.filter(item => item.id !== deleteTargetId);
    setLogs(updated);
    StorageService.saveCafeteriaLogs(updated);
    setDeleteTargetId(null);
  };

  const handleExport = () => {
    StorageService.exportToCsv('cafeteria_consumption_waste', logs);
  };

  const totalMeals = logs.reduce((sum, l) => sum + (l.actualServed || 0), 0);
  const totalWaste = logs.reduce((sum, l) => sum + (l.foodWastageKg || 0), 0);

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
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-900">
          Module 10 / 11
        </span>
      </div>

      {/* Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-700 to-slate-900 text-white shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
            <UtensilsCrossed className="w-6 h-6 text-orange-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{t.modules.cafeteria.title}</h2>
            <p className="text-xs text-orange-100 leading-snug">{t.modules.cafeteria.desc}</p>
          </div>
        </div>

        {/* Cafeteria metrics */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-orange-200 uppercase font-medium">Meals Served</span>
            <p className="text-base font-bold">{totalMeals.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-orange-200 uppercase font-medium">Total Wastage</span>
            <p className="text-base font-bold text-amber-200">{totalWaste.toFixed(1)} kg</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-orange-200 uppercase font-medium">Avg Satisfaction</span>
            <p className="text-base font-bold text-emerald-300">4.3 / 5</p>
          </div>
        </div>
      </div>

      <HardwareDisclaimer 
        featureName="Turnstile Headcount & Weighing Scale Sync" 
        requirements="Cafeteria turnstile tap counts feed headcount predictions. Smart waste weighing scales report post-meal disposal logs directly to the kitchen dashboard."
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
              placeholder="Search meal, caterer, date..."
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
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-md shadow-orange-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          {['All', 'Breakfast', 'Lunch', 'High Tea', 'Dinner'].map((st) => (
            <button
              key={st}
              onClick={() => setMealFilter(st)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                mealFilter === st
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">{t.noRecordsFound}</p>
          </div>
        ) : (
          filteredLogs.map((item) => {
            const predicted = item.predictedHeadcount || item.expectedHeadcount || 500;
            const served = item.actualServed || 0;
            const variance = served - predicted;
            const rating = typeof item.feedbackRating === 'number' ? item.feedbackRating.toFixed(1) : '4.3';
            const contractor = item.contractorName || 'Sodexo Food Solutions';
            const progress = predicted > 0 ? Math.min(100, Math.round((served / predicted) * 100)) : 100;
            return (
              <div
                key={item.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                        {item.id}
                      </span>
                      <span className="text-[10px] bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-bold">
                        {item.mealType}
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                        ★ {rating}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {served} Pax Served
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                      {item.foodWastageKg ?? 0} kg Waste
                    </span>
                    <span className="text-[10px] text-slate-400">{contractor}</span>
                  </div>
                </div>

                {/* Headcount prediction accuracy bar */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>AI Predicted: <strong>{predicted} Pax</strong></span>
                    <span>Variance: <strong className={variance > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                      {variance > 0 ? `+${variance}` : variance} Pax
                    </strong></span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-400">Service Date: {item.date}</span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-orange-600 p-1 rounded-lg"
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
            );
          })
        )}
      </div>

      {/* Cafeteria Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingLog ? 'Edit Meal Record' : 'Log Cafeteria Meal Service'}
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
                    Meal Session
                  </label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="High Tea">High Tea</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Catering Partner *
                  </label>
                  <input
                    type="text"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    placeholder="Sodexo Food Solutions"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Predicted Headcount
                  </label>
                  <input
                    type="number"
                    value={predictedHeadcount}
                    onChange={(e) => setPredictedHeadcount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Actual Served
                  </label>
                  <input
                    type="number"
                    value={actualServed}
                    onChange={(e) => setActualServed(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Food Wastage (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={foodWastageKg}
                    onChange={(e) => setFoodWastageKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Feedback Rating (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(Number(e.target.value))}
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
                  className="px-4 py-2 font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20"
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
