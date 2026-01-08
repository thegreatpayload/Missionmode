
import React, { useState, useMemo } from 'react';
import type { ScheduleTask, Priority } from '../types';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Bell, BellOff, Flame, PlusCircle, Trash2, Settings, Check, ArrowUpDown, GripVertical } from 'lucide-react';
import { PRIORITY_MAP } from '../constants';
import { AlarmSound } from '../types';
import TaskDetailModal from './TaskDetailModal';

type SortOrder = 'time' | 'priority' | 'completed' | 'custom';

interface DailyScheduleProps {
  selectedDate: Date;
  schedule: ScheduleTask[];
  onScheduleChange: (newSchedule: ScheduleTask[]) => void;
  alarmSound: AlarmSound;
  setAlarmSound: (sound: AlarmSound) => void;
  isDarkMode: boolean;
}

const alarmSounds: AlarmSound[] = ['bell', 'chime', 'digital'];

const DailySchedule: React.FC<DailyScheduleProps> = ({ selectedDate, schedule, onScheduleChange, alarmSound, setAlarmSound, isDarkMode }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('time');
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);

  const handleTaskUpdate = (updatedTask: ScheduleTask) => {
      onScheduleChange(schedule.map(t => t.id === updatedTask.id ? updatedTask : t));
  };
  const handleCompletionToggle = (id: string) => {
    onScheduleChange(schedule.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };
  const addTask = () => {
    const newTask: ScheduleTask = { id: self.crypto.randomUUID(), time: "12:00", task: "New Task", completed: false, priority: 'medium', hasReminder: false, subTasks: [], notes: '' };
    const newSchedule = [...schedule, newTask];
    setSortOrder('time'); // Default to time sort when adding new task
    onScheduleChange(newSchedule.sort((a,b) => a.time.localeCompare(b.time)));
  }
  const removeTask = (id: string) => {
    onScheduleChange(schedule.filter(item => item.id !== id));
  }

  const sortedSchedule = useMemo(() => {
    const scheduleCopy = [...schedule];
    switch(sortOrder) {
        case 'time': return scheduleCopy.sort((a,b) => a.time.localeCompare(b.time));
        case 'priority': 
            const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2};
            return scheduleCopy.sort((a,b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        case 'completed': return scheduleCopy.sort((a,b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0));
        case 'custom':
        default: return schedule;
    }
  }, [schedule, sortOrder]);

  const handleReorder = (newOrder: ScheduleTask[]) => {
      setSortOrder('custom');
      onScheduleChange(newOrder);
  }

  const completedTasks = schedule.filter(t => t.completed).length;
  const totalTasks = schedule.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <>
    <div className="p-2 sm:p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg h-full flex flex-col max-h-[calc(100vh-14rem)]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4">
        <div>
            <h2 className="text-xl font-bold mb-1">Daily Schedule</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="relative">
                <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><Settings size={20}/></button>
                <AnimatePresence>{isSettingsOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-10 p-2 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs font-semibold px-2 py-1 text-gray-500 dark:text-gray-400">Sort By</p>
                        {(['time', 'priority', 'completed'] as SortOrder[]).map(order => <button key={order} onClick={() => { setSortOrder(order); setIsSettingsOpen(false);}} className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"><span className="capitalize">{order}</span>{sortOrder === order && <Check size={16} className="text-indigo-500" />}</button>)}
                        <div className="border-t my-1 border-gray-200 dark:border-gray-600"></div>
                        <p className="text-xs font-semibold px-2 py-1 text-gray-500 dark:text-gray-400">Alarm Sound</p>
                        {alarmSounds.map(sound => <button key={sound} onClick={() => { setAlarmSound(sound); setIsSettingsOpen(false); }} className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"><span className="capitalize">{sound}</span>{alarmSound === sound && <Check size={16} className="text-indigo-500" />}</button>)}
                    </motion.div>
                )}</AnimatePresence>
            </div>
            <button onClick={addTask} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"><PlusCircle size={20}/> <span className="hidden sm:inline">Add Task</span></button>
        </div>
      </div>
      
      <div className="mb-4"><div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"><motion.div className="bg-indigo-600 h-2.5 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}/></div><p className="text-sm text-right mt-1 text-gray-500 dark:text-gray-400">{completedTasks} / {totalTasks} tasks completed</p></div>

      <div className="overflow-y-auto flex-grow pr-2">
        <Reorder.Group axis="y" values={sortedSchedule} onReorder={handleReorder}>
          <AnimatePresence>
          {sortedSchedule.map((item) => (
            <Reorder.Item key={item.id} value={item} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <motion.div 
                layout 
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 p-3 rounded-lg border-l-4 group ${PRIORITY_MAP[item.priority].border}`}
                animate={{
                    opacity: item.completed ? 0.6 : 1,
                    backgroundColor: item.completed
                      ? (isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)')
                      : (isDarkMode ? 'rgba(31, 41, 55, 0)' : 'rgba(255, 255, 255, 0)'),
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3 flex-grow cursor-pointer min-w-0 w-full" onClick={() => setEditingTask(item)}>
                  <input type="checkbox" checked={item.completed} onChange={(e) => { e.stopPropagation(); handleCompletionToggle(item.id);}} className="w-5 h-5 rounded text-indigo-600 bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 focus:ring-indigo-500 flex-shrink-0"/>
                  <div className="flex-grow min-w-0">
                    <motion.span 
                      className={`block break-words`}
                      animate={{
                          textDecoration: item.completed ? 'line-through' : 'none',
                          color: item.completed ? (isDarkMode ? '#6b7280' : '#9ca3af') : (isDarkMode ? '#d1d5db' : '#374151')
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      {item.task}
                    </motion.span>
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{item.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 self-end sm:self-center flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Flame size={16} className={PRIORITY_MAP[item.priority].color} />
                    <button onClick={() => removeTask(item.id)} className="p-1 rounded-md text-gray-400 hover:text-red-500" title="Delete task"><Trash2 size={16}/></button>
                    <div className="cursor-grab" onPointerDown={(e) => e.preventDefault()}><GripVertical size={18} className="text-gray-400"/></div>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
    <AnimatePresence>
        {editingTask && <TaskDetailModal task={editingTask} onClose={() => setEditingTask(null)} onSave={handleTaskUpdate} onDelete={removeTask} alarmSound={alarmSound} />}
    </AnimatePresence>
    </>
  );
};

export default DailySchedule;