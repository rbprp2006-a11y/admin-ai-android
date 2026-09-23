import React, { useState } from 'react';
import { 
  PackageCheck, Plus, Search, Download, ArrowLeft, Trash2, Edit3, X, 
  QrCode, ShieldCheck, MapPin, User, Calendar, IndianRupee, Tag
} from 'lucide-react';
import { AssetRecord, Language } from '../types/modules';
import { StorageService } from '../services/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { QRViewerModal } from '../components/QRViewerModal';
import { HardwareDisclaimer } from '../components/HardwareDisclaimer';
import { translations } from '../i18n/translations';

interface Props {
  onBack: () => void;
  lang: Language;
}

export const AssetManagementView: React.FC<Props> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [assets, setAssets] = useState<AssetRecord[]>(() => StorageService.getAssetRecords());
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [activeQrAsset, setActiveQrAsset] = useState<AssetRecord | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetRecord['category']>('IT Hardware');
  const [floorLocation, setFloorLocation] = useState('');
  const [assignedUser, setAssignedUser] = useState('');
  const [purchaseCost, setPurchaseCost] = useState(50000);
  const [condition, setCondition] = useState<AssetRecord['condition']>('Good');
  const [warrantyExpiry, setWarrantyExpiry] = useState('2028-12-31');
  const [lifecycleStage, setLifecycleStage] = useState<AssetRecord['lifecycleStage']>('Allocated');
  const [formError, setFormError] = useState('');

  const filteredAssets = assets.filter(item => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.floorLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStage = stageFilter === 'All' || item.lifecycleStage === stageFilter;
    return matchSearch && matchStage;
  });

  const handleOpenCreate = () => {
    setEditingAsset(null);
    setName('');
    setCategory('IT Hardware');
    setFloorLocation('');
    setAssignedUser('');
    setPurchaseCost(45000);
    setCondition('Good');
    setWarrantyExpiry('2028-12-31');
    setLifecycleStage('Allocated');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: AssetRecord) => {
    setEditingAsset(item);
    setName(item.name);
    setCategory(item.category);
    setFloorLocation(item.floorLocation);
    setAssignedUser(item.assignedUser);
    setPurchaseCost(item.purchaseCost);
    setCondition(item.condition);
    setWarrantyExpiry(item.warrantyExpiry);
    setLifecycleStage(item.lifecycleStage);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !floorLocation.trim()) {
      setFormError('Please enter Asset Name and Location.');
      return;
    }

    let updated: AssetRecord[];
    if (editingAsset) {
      updated = assets.map(item => {
        if (item.id === editingAsset.id) {
          return {
            ...item,
            name,
            category,
            floorLocation,
            assignedUser: assignedUser || 'Unallocated Pool',
            purchaseCost,
            condition,
            warrantyExpiry,
            lifecycleStage,
            lastAudited: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      });
    } else {
      const newId = `AST-${4000 + assets.length + 1}`;
      const newTag = `AST-2026-${String(assets.length + 1).padStart(4, '0')}`;
      const newRecord: AssetRecord = {
        id: newId,
        assetTag: newTag,
        name,
        category,
        floorLocation,
        assignedUser: assignedUser || 'General Inventory Pool',
        purchaseCost,
        condition,
        qrCode: `QR-${newTag}`,
        warrantyExpiry,
        lifecycleStage,
        lastAudited: new Date().toISOString().split('T')[0],
      };
      updated = [newRecord, ...assets];
    }

    setAssets(updated);
    StorageService.saveAssetRecords(updated);
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const updated = assets.filter(item => item.id !== deleteTargetId);
    setAssets(updated);
    StorageService.saveAssetRecords(updated);
    setDeleteTargetId(null);
  };

  const handleExport = () => {
    StorageService.exportToCsv('enterprise_assets_register', assets);
  };

  const totalValuation = assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);

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
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-900">
          Module 4 / 11
        </span>
      </div>

      {/* Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
            <PackageCheck className="w-6 h-6 text-indigo-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{t.modules.asset.title}</h2>
            <p className="text-xs text-indigo-100 leading-snug">{t.modules.asset.desc}</p>
          </div>
        </div>

        {/* Valuation and Count */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-indigo-200 uppercase font-medium">Total Assets</span>
            <p className="text-base font-bold">{assets.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-indigo-200 uppercase font-medium">Allocated</span>
            <p className="text-base font-bold text-emerald-300">{assets.filter(x => x.lifecycleStage === 'Allocated').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-indigo-200 uppercase font-medium">Total Book Value</span>
            <p className="text-sm font-bold text-amber-300 truncate">₹{(totalValuation / 100000).toFixed(1)}L</p>
          </div>
        </div>
      </div>

      <HardwareDisclaimer 
        featureName="Asset Tagging & QR Verification"
        requirements="Physical asset tags and barcodes are mapped to digital records. Handheld RFID scanners or mobile CameraX read tags during quarterly inventory audits."
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
              placeholder="Search asset tag, item name, user, floor..."
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
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          {['All', 'Procured', 'Allocated', 'In Repair', 'Retired'].map((st) => (
            <button
              key={st}
              onClick={() => setStageFilter(st)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                stageFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Cards List */}
      <div className="space-y-3">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <PackageCheck className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">{t.noRecordsFound}</p>
          </div>
        ) : (
          filteredAssets.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {item.assetTag}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.lifecycleStage === 'Allocated' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      item.lifecycleStage === 'In Repair' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {item.lifecycleStage}
                    </span>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.name}
                  </h3>
                </div>

                <button
                  onClick={() => setActiveQrAsset(item)}
                  className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition flex items-center space-x-1"
                  title="View Asset QR Tag"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-[10px] font-bold">QR Tag</span>
                </button>
              </div>

              {/* Asset Meta Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{item.floorLocation}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{item.assignedUser}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Cost: ₹{item.purchaseCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Warranty: {item.warrantyExpiry}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400">
                  Condition: <strong className="text-slate-700 dark:text-slate-300">{item.condition}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 p-1 rounded-lg"
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

      {/* Asset Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingAsset ? 'Edit Asset Registration' : 'Register New Enterprise Asset'}
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
                  Asset Title / Description *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cisco Core Switch Catalyst 9300"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    <option value="IT Hardware">IT Hardware</option>
                    <option value="Furniture">Furniture</option>
                    <option value="HVAC Equipment">HVAC Equipment</option>
                    <option value="Security Device">Security Device</option>
                    <option value="Pantry Machine">Pantry Machine</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lifecycle Stage
                  </label>
                  <select
                    value={lifecycleStage}
                    onChange={(e) => setLifecycleStage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Procured">Procured</option>
                    <option value="Allocated">Allocated</option>
                    <option value="In Repair">In Repair</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Floor Location *
                  </label>
                  <input
                    type="text"
                    value={floorLocation}
                    onChange={(e) => setFloorLocation(e.target.value)}
                    placeholder="Floor 1, Server Room"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Custodian / User
                  </label>
                  <input
                    type="text"
                    value={assignedUser}
                    onChange={(e) => setAssignedUser(e.target.value)}
                    placeholder="Infrastructure NOC"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Maintenance Required">Maintenance</option>
                    <option value="Scrapped">Scrapped</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Warranty Expiry
                  </label>
                  <input
                    type="date"
                    value={warrantyExpiry}
                    onChange={(e) => setWarrantyExpiry(e.target.value)}
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
                  className="px-4 py-2 font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Viewer */}
      {activeQrAsset && (
        <QRViewerModal
          isOpen={!!activeQrAsset}
          title={`Asset Tag: ${activeQrAsset.assetTag}`}
          token={activeQrAsset.qrCode}
          subtitle={activeQrAsset.name}
          details={{
            'Category': activeQrAsset.category,
            'Location': activeQrAsset.floorLocation,
            'Assigned To': activeQrAsset.assignedUser,
            'Condition': activeQrAsset.condition,
            'Warranty Till': activeQrAsset.warrantyExpiry,
            'Last Audit Date': activeQrAsset.lastAudited
          }}
          onClose={() => setActiveQrAsset(null)}
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
