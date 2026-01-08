
import React, { useState } from 'react';
// FIX: Import AnimatePresence to resolve 'Cannot find name' errors.
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, ListChecks, StickyNote, Bell, BellOff, Flame, Music4 } from 'lucide-react';
import type { ScheduleTask, SubTask, AlarmSound } from '../types';
import { PRIORITY_MAP } from '../constants';

const alarmSounds: AlarmSound[] = ['bell', 'chime', 'digital'];

interface TaskDetailModalProps {
    task: ScheduleTask;
    onClose: () => void;
    onSave: (updatedTask: ScheduleTask) => void;
    onDelete: (taskId: string) => void;
    alarmSound: AlarmSound; // Global default
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onSave, onDelete, alarmSound }) => {
    const [editedTask, setEditedTask] = useState<ScheduleTask>(task);
    const [newSubTask, setNewSubTask] = useState('');

    const handleSubTaskToggle = (id: string) => {
        setEditedTask(prev => ({
            ...prev,
            subTasks: prev.subTasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st)
        }));
    };

    const addSubTask = () => {
        if (newSubTask.trim()) {
            const sub: SubTask = { id: self.crypto.randomUUID(), text: newSubTask.trim(), completed: false };
            setEditedTask(prev => ({...prev, subTasks: [...prev.subTasks, sub]}));
            setNewSubTask('');
        }
    };
    
    const deleteSubTask = (id: string) => {
        setEditedTask(prev => ({...prev, subTasks: prev.subTasks.filter(st => st.id !== id)}));
    };
    
    const handleSave = () => { onSave(editedTask); onClose(); };
    const handleDelete = () => { onDelete(task.id); onClose(); };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 flex-shrink-0">
                    <div className="flex justify-between items-center gap-4">
                        <input 
                            type="time"
                            value={editedTask.time}
                            onChange={(e) => setEditedTask(prev => ({...prev, time: e.target.value}))}
                            className="text-lg font-mono bg-transparent p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input 
                            type="text"
                            value={editedTask.task}
                            onChange={(e) => setEditedTask(prev => ({...prev, task: e.target.value}))}
                            className="text-2xl font-bold bg-transparent w-full focus:outline-none focus:border-b-2 focus:border-indigo-500 dark:focus:border-indigo-400"
                        />
                        <button onClick={onClose} className="p-1 -mt-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
                    </div>
                </div>

                <div className="px-6 pb-6 overflow-y-auto max-h-[calc(80vh-150px)]">
                    <div className="mt-6">
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><Flame size={18}/> Priority</h3>
                        <div className="flex gap-2">
                            {(['low', 'medium', 'high'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setEditedTask(prev => ({...prev, priority: p}))}
                                    className={`flex-1 capitalize text-sm px-3 py-1.5 rounded-md border-2 font-semibold transition-colors ${
                                        editedTask.priority === p 
                                        ? `${PRIORITY_MAP[p].border} ${PRIORITY_MAP[p].color} ${
                                            p === 'low' ? 'bg-blue-500/20' : p === 'medium' ? 'bg-orange-500/20' : 'bg-red-500/20'
                                          }`
                                        : 'border-transparent bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                         <h3 className="font-semibold flex items-center gap-2 mb-2"><ListChecks size={18}/> Sub-tasks</h3>
                         <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                             {editedTask.subTasks.map(sub => (
                                <div key={sub.id} className="flex items-center gap-3 group">
                                    <input type="checkbox" checked={sub.completed} onChange={() => handleSubTaskToggle(sub.id)} className="w-4 h-4 rounded text-indigo-600"/>
                                    <span className={`flex-grow ${sub.completed ? 'line-through text-gray-500' : ''}`}>{sub.text}</span>
                                    <button onClick={() => deleteSubTask(sub.id)} className="text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                                </div>
                             ))}
                         </div>
                         <div className="flex gap-2 mt-2">
                            <input value={newSubTask} onChange={e => setNewSubTask(e.target.value)} placeholder="Add a sub-task" className="w-full text-sm p-1.5 bg-gray-100 dark:bg-gray-700 rounded"/>
                            <button onClick={addSubTask} className="p-1.5 bg-indigo-500 text-white rounded"><Plus size={16}/></button>
                         </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold flex items-center gap-2"><StickyNote size={18}/> Notes</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEditedTask(prev => ({...prev, hasReminder: !prev.hasReminder}))}
                                    className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full transition-colors ${
                                        editedTask.hasReminder
                                        ? 'bg-blue-500/20 text-blue-500'
                                        : 'bg-gray-500/10 text-gray-500'
                                    }`}
                                >
                                    {editedTask.hasReminder ? <Bell size={14}/> : <BellOff size={14}/>}
                                    Reminder
                                </button>
                                <AnimatePresence>
                                {editedTask.hasReminder && (
                                    <motion.div initial={{width:0, opacity: 0}} animate={{width:'auto', opacity: 1}} exit={{width:0, opacity: 0}} className="relative flex items-center">
                                         <Music4 size={14} className="absolute left-2 text-gray-400 pointer-events-none"/>
                                         <select 
                                            value={editedTask.alarmSound || alarmSound} 
                                            onChange={e => setEditedTask(prev => ({...prev, alarmSound: e.target.value as AlarmSound}))}
                                            className="text-sm pl-7 pr-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                                         >
                                            {alarmSounds.map(sound => <option key={sound} value={sound} className="capitalize">{sound.charAt(0).toUpperCase() + sound.slice(1)}</option>)}
                                         </select>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <textarea
                            value={editedTask.notes}
                            onChange={e => setEditedTask(prev => ({...prev, notes: e.target.value}))}
                            placeholder="Add details..."
                            className="w-full p-2 text-sm bg-gray-100 dark:bg-gray-700 rounded h-24 resize-none"
                        />
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-between rounded-b-2xl flex-shrink-0">
                    <button onClick={handleDelete} className="px-4 py-2 text-sm font-semibold text-red-600 rounded-md hover:bg-red-500/10">Delete Task</button>
                    <button onClick={handleSave} className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Changes</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TaskDetailModal;