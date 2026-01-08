
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Palette, X, PlusCircle, Trash2, Edit2, CircleDot, Calendar, List, Bell, BellOff } from 'lucide-react';
import type { Highlight, RainbowColor, Habit, Events, CalendarEvent } from '../types';
import ColorPicker from './ColorPicker';

const EventModal: React.FC<{
    date: Date;
    events: CalendarEvent[];
    onClose: () => void;
    onSave: (newEvents: CalendarEvent[]) => void;
}> = ({ date, events, onClose, onSave }) => {
    const [localEvents, setLocalEvents] = useState(events);
    const [newEventText, setNewEventText] = useState("");
    const [newEventTime, setNewEventTime] = useState("09:00");
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

    const addEvent = () => {
        if(newEventText.trim()) {
            setLocalEvents([...localEvents, { id: self.crypto.randomUUID(), text: newEventText.trim(), time: newEventTime, hasReminder: true }]);
            setNewEventText("");
            setNewEventTime("09:00");
        }
    }
    const deleteEvent = (id: string) => {
        setLocalEvents(localEvents.filter(e => e.id !== id));
    }
    const toggleReminder = (id: string) => {
        setLocalEvents(localEvents.map(e => e.id === id ? { ...e, hasReminder: !e.hasReminder } : e));
    }
    const handleSave = () => {
        onSave(localEvents);
        onClose();
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold mb-4">Events for {date.toLocaleDateString()}</h3>
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2">
                    {localEvents.map(event => (
                        <div key={event.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-md group">
                            <div>
                                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{event.time}</span>
                                <span className="ml-2">{event.text}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleReminder(event.id)} className="text-gray-500 hover:text-indigo-500" title="Toggle Reminder">
                                    {event.hasReminder ? <Bell size={16} className="text-indigo-500"/> : <BellOff size={16}/>}
                                </button>
                                {confirmingDeleteId === event.id ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-red-500">Sure?</span>
                                        <button onClick={() => { deleteEvent(event.id); setConfirmingDeleteId(null); }} className="px-2 py-0.5 text-xs bg-red-500 text-white rounded">Yes</button>
                                        <button onClick={() => setConfirmingDeleteId(null)} className="px-2 py-0.5 text-xs bg-gray-300 dark:bg-gray-600 rounded">No</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setConfirmingDeleteId(event.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="flex gap-2">
                    <input 
                        type="time"
                        value={newEventTime}
                        onChange={e => setNewEventTime(e.target.value)}
                        className="p-2 w-28 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                    />
                    <input 
                        type="text" 
                        value={newEventText} 
                        onChange={e => setNewEventText(e.target.value)}
                        placeholder="New event..."
                        className="flex-grow p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                    />
                    <button onClick={addEvent} className="p-2 bg-indigo-600 text-white rounded-md"><PlusCircle size={20} /></button>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Save</button>
                </div>
            </motion.div>
        </motion.div>
    )
}

interface ExtremeCalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  highlights: Highlight;
  onHighlight: (date: Date, color: RainbowColor | null) => void;
  habit: Habit | null;
  events: Events;
  setEvents: React.Dispatch<React.SetStateAction<Events>>;
}

const ExtremeCalendar: React.FC<ExtremeCalendarProps> = ({ selectedDate, setSelectedDate, highlights, onHighlight, habit, events, setEvents }) => {
  const [currentDate, setCurrentDate] = useState(new Date(Math.max(selectedDate.getTime(), new Date(2026, 0, 1).getTime())));
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [view, setView] = useState<'calendar' | 'agenda'>('calendar');
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const changeMonth = (amount: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1);
    if (newDate.getFullYear() >= 2026) setCurrentDate(newDate);
  };
  const changeYear = (amount: number) => {
    const newYear = currentDate.getFullYear() + amount;
    if (newYear >= 2026 && newYear <= 3000) setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
  };
  
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = []; let day = 1;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth || day > daysInMonth) week.push(null);
        else { week.push(new Date(year, month, day)); day++; }
      }
      grid.push(week);
      if (day > daysInMonth) break;
    }
    return grid;
  }, [currentDate]);

  const filteredEvents = useMemo(() => {
      const allEvents = Object.entries(events)
          // FIX: Add type guard to prevent calling .map on a non-array value, which resolves the TypeScript error.
          .flatMap(([dateStr, eventList]) => Array.isArray(eventList) ? eventList.map(event => ({ date: new Date(dateStr), event })) : [])
          .sort((a,b) => a.date.getTime() - b.date.getTime());
      
      const today = new Date();
      today.setHours(0,0,0,0);

      switch(filter) {
          case 'week':
              const nextWeek = new Date(today);
              nextWeek.setDate(today.getDate() + 7);
              return allEvents.filter(({date}) => date >= today && date < nextWeek);
          case 'month':
              const nextMonth = new Date(today);
              nextMonth.setDate(today.getDate() + 30);
              return allEvents.filter(({date}) => date >= today && date < nextMonth);
          case 'all':
          default:
              return allEvents.filter(({date}) => date >= today);
      }
  }, [events, filter]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setModalDate(date);
  };

  const handleSaveEvents = (date: Date, newEvents: CalendarEvent[]) => {
    const key = date.toISOString().split('T')[0];
    setEvents(prev => {
        const updatedEvents = {...prev};
        if(newEvents.length > 0) updatedEvents[key] = newEvents;
        else delete updatedEvents[key];
        return updatedEvents;
    });
  }

  const ViewButton: React.FC<{ type: 'calendar' | 'agenda', label: string, icon: React.ReactNode }> = ({ type, label, icon }) => (
      <button onClick={() => setView(type)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${view === type ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
          {icon} {label}
      </button>
  );

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <button onClick={() => changeYear(-1)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronsLeft size={20} /></button>
          <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft size={20} /></button>
        </div>
        <div className="text-center font-semibold text-lg">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
        <div className="flex items-center gap-1">
          <button onClick={() => changeMonth(1)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight size={20} /></button>
          <button onClick={() => changeYear(1)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronsRight size={20} /></button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <ViewButton type="calendar" label="Calendar" icon={<Calendar size={16}/>} />
        <ViewButton type="agenda" label="Agenda" icon={<List size={16}/>} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {view === 'calendar' ? (
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {dayNames.map(day => <div key={day} className="font-bold text-xs text-gray-500 dark:text-gray-400">{day}</div>)}
                {calendarGrid.flat().map((date, index) => {
                  if (!date) return <div key={`empty-${index}`} />;
                  const dateKey = date.toISOString().split('T')[0];
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  const highlightColor = highlights[dateKey];
                  const hasEvent = events[dateKey] && events[dateKey].length > 0;
                  let habitClass = '';
                  const today = new Date(); today.setHours(0, 0, 0, 0);

                  if(habit && habit.completedDays.includes(dateKey) && date < today) { habitClass = 'bg-green-500/50'; }
                  
                  const colorClasses = highlightColor ? `border-2 border-${highlightColor}-500/50` : '';

                  return (
                    <div key={dateKey} className="relative py-1 flex justify-center items-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        onClick={() => handleDateClick(date)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 text-sm flex items-center justify-center rounded-full transition-colors mx-auto relative group ${
                            isSelected ? 'bg-indigo-600 text-white font-bold' : habitClass || 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        } ${colorClasses}`}
                      >
                        {date.getDate()}
                        {hasEvent && <span className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full border border-white dark:border-gray-800"></span>}
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                           <PlusCircle size={20} className={isSelected ? 'text-indigo-200' : 'text-gray-500'}/>
                        </div>
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    <div className="flex gap-2">
                        {(['all', 'week', 'month'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-2 py-1 text-xs rounded-md ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {f === 'all' ? 'All Upcoming' : f === 'week' ? 'Next 7 Days' : 'Next 30 Days'}
                            </button>
                        ))}
                    </div>
                    {filteredEvents.length > 0 ? filteredEvents.map(({date, event}) => (
                         <div key={event.id} className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div className="text-center flex-shrink-0 w-12">
                               <p className="font-bold text-indigo-600 dark:text-indigo-400">{date.toLocaleDateString('en-US', {month: 'short'})}</p>
                               <p className="text-xl font-bold">{date.getDate()}</p>
                            </div>
                            <div className="border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                                <p className="font-semibold">{event.text}</p>
                                <p className="text-xs text-gray-500">{date.toLocaleDateString('en-US', {weekday: 'long'})}</p>
                            </div>
                         </div>
                    )) : <p className="text-center text-gray-500 py-8">No upcoming events for the selected range.</p>}
                </div>
            )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {modalDate && (
            <EventModal 
                date={modalDate} 
                events={events[modalDate.toISOString().split('T')[0]] || []} 
                onClose={() => setModalDate(null)}
                onSave={(newEvents) => handleSaveEvents(modalDate, newEvents)}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExtremeCalendar;