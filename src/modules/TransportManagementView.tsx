import React, { useState } from 'react';
import { 
  Bus, Plus, Search, Download, ArrowLeft, Trash2, Edit3, X, 
  MapPin, Phone, Users, Clock, Navigation, CheckCircle2, Shield
} from 'lucide-react';
import { TransportBooking, Language } from '../types/modules';
import { StorageService } from '../services/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { HardwareDisclaimer } from '../components/HardwareDisclaimer';
import { translations } from '../i18n/translations';

interface Props {
  onBack: () => void;
  lang: Language;
}

export const TransportManagementView: React.FC<Props> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [trips, setTrips] = useState<TransportBooking[]>(() => StorageService.getTransportBookings());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TransportBooking | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form inputs
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<TransportBooking['vehicleType']>('Electric Van');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [routeStart, setRouteStart] = useState('Campus HQ Terminal');
  const [routeEnd, setRouteEnd] = useState('');
  const [departureTime, setDepartureTime] = useState('11:00 AM');
  const [passengers, setPassengers] = useState(4);
  const [assignedDepartment, setAssignedDepartment] = useState('Employee Transit');
  const [formError, setFormError] = useState('');

  const filteredTrips = trips.filter(item => {
    const matchSearch =
      item.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.routeEnd.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenCreate = () => {
    setEditingTrip(null);
    setVehicleNumber('');
    setVehicleType('Electric Van');
    setDriverName('');
    setDriverPhone('');
    setRouteStart('Campus HQ Terminal');
    setRouteEnd('');
    setDepartureTime('11:00 AM');
    setPassengers(4);
    setAssignedDepartment('Corporate Admin');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: TransportBooking) => {
    setEditingTrip(item);
    setVehicleNumber(item.vehicleNumber);
    setVehicleType(item.vehicleType);
    setDriverName(item.driverName);
    setDriverPhone(item.driverPhone);
    setRouteStart(item.routeStart);
    setRouteEnd(item.routeEnd);
    setDepartureTime(item.departureTime);
    setPassengers(item.passengers);
    setAssignedDepartment(item.assignedDepartment);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim() || !driverName.trim() || !routeEnd.trim()) {
      setFormError('Please enter Vehicle Number, Driver Name, and Destination.');
      return;
    }

    let updated: TransportBooking[];
    if (editingTrip) {
      updated = trips.map(item => {
        if (item.id === editingTrip.id) {
          return {
            ...item,
            vehicleNumber,
            vehicleType,
            driverName,
            driverPhone,
            routeStart,
            routeEnd,
            departureTime,
            passengers,
            assignedDepartment,
          };
        }
        return item;
      });
    } else {
      const newId = `TRP-${3000 + trips.length + 1}`;
      const newBooking: TransportBooking = {
        id: newId,
        vehicleNumber,
        vehicleType,
        driverName,
        driverPhone: driverPhone || '+91 98000 00000',
        routeStart,
        routeEnd,
        departureTime,
        passengers,
        assignedDepartment,
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
      };
      updated = [newBooking, ...trips];
    }

    setTrips(updated);
    StorageService.saveTransportBookings(updated);
    setIsFormOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: TransportBooking['status']) => {
    const updated = trips.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setTrips(updated);
    StorageService.saveTransportBookings(updated);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const updated = trips.filter(item => item.id !== deleteTargetId);
    setTrips(updated);
    StorageService.saveTransportBookings(updated);
    setDeleteTargetId(null);
  };

  const handleExport = () => {
    StorageService.exportToCsv('transport_fleet_trips', trips);
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
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-full border border-sky-200 dark:border-sky-900">
          Module 3 / 11
        </span>
      </div>

      {/* Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-sky-700 via-blue-800 to-indigo-950 text-white shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
            <Bus className="w-6 h-6 text-sky-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{t.modules.transport.title}</h2>
            <p className="text-xs text-sky-100 leading-snug">{t.modules.transport.desc}</p>
          </div>
        </div>

        {/* Fleet Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-sky-200 uppercase font-medium">On Route</span>
            <p className="text-base font-bold text-amber-300">{trips.filter(x => x.status === 'On Route').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-sky-200 uppercase font-medium">Scheduled</span>
            <p className="text-base font-bold text-sky-200">{trips.filter(x => x.status === 'Scheduled').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-sky-200 uppercase font-medium">Completed</span>
            <p className="text-base font-bold text-emerald-300">{trips.filter(x => x.status === 'Completed').length}</p>
          </div>
        </div>
      </div>

      <HardwareDisclaimer 
        featureName="Fleet Telemetry & GPS Tracking" 
        requirements="Live transit positions are managed via driver route logging. Production telemetry connects to vehicle OBD-II telematics & Google Maps Geolocation."
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
              placeholder="Search vehicle number, driver, destination..."
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
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          {['All', 'Scheduled', 'On Route', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                statusFilter === st
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-3">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <Bus className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">{t.noRecordsFound}</p>
          </div>
        ) : (
          filteredTrips.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                      {item.id}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                      {item.vehicleType}
                    </span>
                    <span className="text-[10px] bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-medium">
                      {item.assignedDepartment}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.vehicleNumber}
                  </h3>
                </div>

                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value as TransportBooking['status'])}
                  className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none transition ${
                    item.status === 'On Route' ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300' :
                    item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' :
                    item.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300' :
                    'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-300'
                  }`}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="On Route">On Route</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Route & Driver Details */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-400">{item.routeStart}</span>
                    <span className="mx-1.5 text-slate-400 font-bold">➔</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.routeEnd}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Driver: <strong className="text-slate-800 dark:text-slate-200">{item.driverName}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.driverPhone}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Departs: <strong>{item.departureTime}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Capacity: <strong>{item.passengers} Pax</strong></span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-sky-600 p-1 rounded-lg"
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

      {/* Trip Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingTrip ? 'Edit Vehicle Trip' : 'Allocate New Transport Trip'}
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
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="MH 12 AB 1234"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Electric Van">Electric Van</option>
                    <option value="Minibus (14-seater)">Minibus (14-seater)</option>
                    <option value="Shuttle Bus (32-seater)">Shuttle Bus (32-seater)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Driver Full Name *
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Santosh Gaikwad"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Driver Phone
                  </label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Origin (Start)
                  </label>
                  <input
                    type="text"
                    value={routeStart}
                    onChange={(e) => setRouteStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Destination *
                  </label>
                  <input
                    type="text"
                    value={routeEnd}
                    onChange={(e) => setRouteEnd(e.target.value)}
                    placeholder="Pune Airport T2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="11:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Passenger Headcount
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Department / Group
                </label>
                <input
                  type="text"
                  value={assignedDepartment}
                  onChange={(e) => setAssignedDepartment(e.target.value)}
                  placeholder="e.g. Executive Board Transit"
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
                  className="px-4 py-2 font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20"
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
