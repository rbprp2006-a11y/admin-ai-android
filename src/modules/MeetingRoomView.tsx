import React, { useState } from 'react';
import { 
  CalendarCheck2, Plus, Search, Download, ArrowLeft, Trash2, Edit3, X, 
  Clock, Users, MapPin, CheckCircle2, Calendar, Radio, Sparkles
} from 'lucide-react';
import { MeetingRoomBooking, Language } from '../types/modules';
import { StorageService } from '../services/storage';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { HardwareDisclaimer } from '../components/HardwareDisclaimer';
import { translations } from '../i18n/translations';

interface Props {
  onBack: () => void;
  lang: Language;
}

export const MeetingRoomView: React.FC<Props> = ({ onBack, lang }) => {
  const t = translations[lang];
  const [bookings, setBookings] = useState<MeetingRoomBooking[]>(() => StorageService.getMeetingBookings());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<MeetingRoomBooking | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form inputs
  const [roomName, setRoomName] = useState<MeetingRoomBooking['roomName']>('Boardroom Sapphire (20p)');
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [attendeesCount, setAttendeesCount] = useState(8);
  const [calendarSynced, setCalendarSynced] = useState(true);
  const [autoCheckedIn, setAutoCheckedIn] = useState(false);
  const [formError, setFormError] = useState('');

  const filteredBookings = bookings.filter(item => {
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.roomName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenCreate = () => {
    setEditingBooking(null);
    setRoomName('Emerald Conference (12p)');
    setTitle('');
    setOrganizer('Admin Department Lead');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('14:00');
    setEndTime('15:00');
    setAttendeesCount(8);
    setCalendarSynced(true);
    setAutoCheckedIn(false);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: MeetingRoomBooking) => {
    setEditingBooking(item);
    setRoomName(item.roomName);
    setTitle(item.title);
    setOrganizer(item.organizer);
    setDate(item.date);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setAttendeesCount(item.attendeesCount);
    setCalendarSynced(item.calendarSynced);
    setAutoCheckedIn(item.autoCheckedIn);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !organizer.trim()) {
      setFormError('Please enter Meeting Subject and Organizer.');
      return;
    }

    let updated: MeetingRoomBooking[];
    if (editingBooking) {
      updated = bookings.map(item => {
        if (item.id === editingBooking.id) {
          return {
            ...item,
            roomName,
            title,
            organizer,
            date,
            startTime,
            endTime,
            attendeesCount,
            calendarSynced,
            autoCheckedIn,
          };
        }
        return item;
      });
    } else {
      const newId = `MR-${6000 + bookings.length + 1}`;
      const newBooking: MeetingRoomBooking = {
        id: newId,
        roomName,
        title,
        organizer,
        date,
        startTime,
        endTime,
        attendeesCount,
        calendarSynced,
        autoCheckedIn,
        status: 'Confirmed',
      };
      updated = [newBooking, ...bookings];
    }

    setBookings(updated);
    StorageService.saveMeetingBookings(updated);
    setIsFormOpen(false);
  };

  const handleToggleCheckIn = (id: string) => {
    const updated = bookings.map(b => {
      if (b.id === id) {
        const next = !b.autoCheckedIn;
        return {
          ...b,
          autoCheckedIn: next,
          status: (next ? 'In Session' : 'Confirmed') as MeetingRoomBooking['status']
        };
      }
      return b;
    });
    setBookings(updated);
    StorageService.saveMeetingBookings(updated);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const updated = bookings.filter(item => item.id !== deleteTargetId);
    setBookings(updated);
    StorageService.saveMeetingBookings(updated);
    setDeleteTargetId(null);
  };

  const handleExport = () => {
    StorageService.exportToCsv('meeting_room_bookings', bookings);
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
          Module 6 / 11
        </span>
      </div>

      {/* Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white shadow-xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
            <CalendarCheck2 className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{t.modules.meeting.title}</h2>
            <p className="text-xs text-emerald-100 leading-snug">{t.modules.meeting.desc}</p>
          </div>
        </div>

        {/* Room status strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-emerald-200 uppercase font-medium">In Session</span>
            <p className="text-base font-bold text-amber-300">{bookings.filter(x => x.status === 'In Session').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-emerald-200 uppercase font-medium">Confirmed</span>
            <p className="text-base font-bold text-emerald-300">{bookings.filter(x => x.status === 'Confirmed').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-emerald-200 uppercase font-medium">Total Today</span>
            <p className="text-base font-bold">{bookings.length}</p>
          </div>
        </div>
      </div>

      <HardwareDisclaimer 
        featureName="PIR Occupancy Sensor & Exchange Sync" 
        requirements="Automated room cancellation occurs if no attendee enters within 15 mins of start time. In-app calendar sync connects with Microsoft Graph / Google Calendar OAuth."
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
              placeholder="Search meeting title, room, organizer..."
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
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNew}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          {['All', 'Confirmed', 'In Session', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <CalendarCheck2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">{t.noRecordsFound}</p>
          </div>
        ) : (
          filteredBookings.map((item) => (
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'In Session' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      item.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {item.status}
                    </span>
                    {item.calendarSynced && (
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                        Synced
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.title}
                  </h3>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {item.roomName}
                  </p>
                </div>

                {/* Auto Check-in Toggle button */}
                <button
                  onClick={() => handleToggleCheckIn(item.id)}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 ${
                    item.autoCheckedIn 
                      ? 'bg-emerald-500 text-white border-emerald-600' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{item.autoCheckedIn ? 'Checked-In' : 'Auto Check-in'}</span>
                </button>
              </div>

              {/* Metadata strip */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Date: <strong>{item.date}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Slot: <strong>{item.startTime} - {item.endTime}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Organizer: <strong>{item.organizer}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Capacity: <strong>{item.attendeesCount} Attending</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-emerald-600 p-1 rounded-lg"
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

      {/* Booking Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingBooking ? 'Edit Meeting Reservation' : 'Book Conference Room'}
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
                  Meeting Title / Subject *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quarterly Budget Strategy"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Meeting Room
                </label>
                <select
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Boardroom Sapphire (20p)">Boardroom Sapphire (20p - Video Wall)</option>
                  <option value="Emerald Conference (12p)">Emerald Conference (12p - Display & Polycom)</option>
                  <option value="Ruby Huddle (6p)">Ruby Huddle (6p - Floor 3)</option>
                  <option value="Amber Brainstorm (8p)">Amber Brainstorm (8p - Whiteboard)</option>
                  <option value="Diamond Auditorium (50p)">Diamond Auditorium (50p - Sound Stage)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Organizer Name *
                  </label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Attendees
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="calendarSyncCheck"
                  checked={calendarSynced}
                  onChange={(e) => setCalendarSynced(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="calendarSyncCheck" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Sync automatically with Corporate Exchange / Calendar
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
                  className="px-4 py-2 font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
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
