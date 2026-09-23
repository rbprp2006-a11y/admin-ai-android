import React, { useState } from 'react';
import { 
  FileText, Plus, Search, Download, ArrowLeft, Trash2, Edit3, X, 
  UploadCloud, CheckCircle2, Eye, Tag, Calendar, Database, Sparkles
} from 'lucide-react';
import { DocumentRecord, Language } from '../types/modules';
import { StorageService } from '../services/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { HardwareDisclaimer } from '../components/HardwareDisclaimer';
import { translations } from '../i18n/translations';

interface Props {
  onBack: () => void;
  lang: Language;
}

export const DocumentAiView: React.FC<Props> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [docs, setDocs] = useState<DocumentRecord[]>(() => StorageService.getDocumentRecords());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DocumentRecord | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentRecord['category']>('Invoice');
  const [fileName, setFileName] = useState('');
  const [tagsRaw, setTagsRaw] = useState('Admin, Finance, FY2026');
  const [extractedRaw, setExtractedRaw] = useState('{\n  "Vendor": "Apex Logistics",\n  "Amount": "₹2,40,000",\n  "GSTIN": "27AAACA1234D1Z5"\n}');
  const [formError, setFormError] = useState('');

  const filteredDocs = docs.filter(item => {
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleOpenCreate = () => {
    setTitle('');
    setCategory('Invoice');
    setFileName('Admin_Document_Scan.pdf');
    setTagsRaw('Admin, Verified, FY2026');
    setExtractedRaw('{\n  "DocumentType": "Tax Invoice",\n  "Vendor": "Godrej Interio",\n  "Amount": "₹1,80,000",\n  "PO_Reference": "PO-2026-881"\n}');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileName.trim()) {
      setFormError('Please enter Document Title and File Name.');
      return;
    }

    let parsedJson: Record<string, string> = {};
    try {
      parsedJson = JSON.parse(extractedRaw);
    } catch {
      parsedJson = { rawText: extractedRaw };
    }

    const tags = tagsRaw.split(',').map(x => x.trim()).filter(Boolean);
    const newId = `DOC-${1000 + docs.length + 1}`;
    const newDoc: DocumentRecord = {
      id: newId,
      title,
      category,
      fileName,
      fileSize: '1.4 MB',
      ocrStatus: 'Extracted',
      extractedData: parsedJson,
      tags: tags.length ? tags : ['General Admin'],
      uploadedAt: new Date().toISOString(),
    };

    const updated = [newDoc, ...docs];
    setDocs(updated);
    StorageService.saveDocumentRecords(updated);
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const updated = docs.filter(item => item.id !== deleteTargetId);
    setDocs(updated);
    StorageService.saveDocumentRecords(updated);
    setDeleteTargetId(null);
  };

  const handleExport = () => {
    StorageService.exportToCsv('document_ai_archive', docs);
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
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
          Module 11 / 11
        </span>
      </div>

      {/* Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 text-white shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
            <FileText className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{t.modules.document.title}</h2>
            <p className="text-xs text-emerald-100 leading-snug">{t.modules.document.desc}</p>
          </div>
        </div>

        {/* OCR Repository metrics */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-emerald-200 uppercase font-medium">Digital Archive</span>
            <p className="text-base font-bold">{docs.length} Docs</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-emerald-200 uppercase font-medium">OCR Extracted</span>
            <p className="text-base font-bold text-emerald-300">{docs.filter(x => x.ocrStatus === 'Extracted').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-emerald-200 uppercase font-medium">Auto-Indexed</span>
            <p className="text-base font-bold text-cyan-200">100%</p>
          </div>
        </div>
      </div>

      <HardwareDisclaimer 
        featureName="OCR Document Parsing & AI Field Extractor" 
        requirements="Simulated OCR entity extraction reads structured PO, Vendor, and GST fields. Production runtime connects with Google Cloud Document AI & Tesseract OCR."
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
              placeholder="Search document title, tags, filename..."
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
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md shadow-emerald-700/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          {['All', 'Contract', 'Invoice', 'Compliance', 'Audit Report', 'Warranty'].map((st) => (
            <button
              key={st}
              onClick={() => setCategoryFilter(st)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                categoryFilter === st
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Docs List */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">{t.noRecordsFound}</p>
          </div>
        ) : (
          filteredDocs.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {item.id}
                    </span>
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      {item.category}
                    </span>
                    <span className="text-[10px] bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-full font-medium">
                      OCR: {item.ocrStatus}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {item.fileName} • {item.fileSize}
                  </p>
                </div>

                <button
                  onClick={() => setViewingDoc(item)}
                  className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition flex items-center space-x-1"
                  title="View OCR Extracted Data"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-[10px] font-bold">OCR Data</span>
                </button>
              </div>

              {/* Parsed key values preview */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Extracted Metadata Entities
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  {Object.entries(item.extractedData).slice(0, 4).map(([k, v]) => (
                    <div key={k} className="truncate">
                      <span className="text-slate-400">{k}: </span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {item.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400">Archived: {item.uploadedAt.split('T')[0]}</span>

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

      {/* Upload/Index Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Index & Process New Document
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
                  Document Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. FY2026 Facility Pest Control AMC"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    <option value="Contract">Contract</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Audit Report">Audit Report</option>
                    <option value="Warranty">Warranty</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    File Attachment Name *
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Document_Scan.pdf"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  placeholder="Admin, Finance, AMC"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Extracted JSON Entities (Simulated OCR Engine)
                </label>
                <textarea
                  rows={4}
                  value={extractedRaw}
                  onChange={(e) => setExtractedRaw(e.target.value)}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
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
                  className="px-4 py-2 font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document OCR View Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {viewingDoc.title}
                </h3>
                <p className="text-xs font-mono text-slate-400">{viewingDoc.fileName}</p>
              </div>
              <button onClick={() => setViewingDoc(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                OCR Parsed Fields
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                {Object.entries(viewingDoc.extractedData).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-1">
                    <span className="text-slate-500">{k}:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setViewingDoc(null)}
              className="w-full py-2.5 font-semibold text-xs rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition"
            >
              Close
            </button>
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
