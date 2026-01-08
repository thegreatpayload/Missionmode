import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { ScheduleTask } from '../types';

interface QuickAddTaskProps {
    onAddTask: (task: Omit<ScheduleTask, 'id'>) => void;
}

const QuickAddTask: React.FC<QuickAddTaskProps> = ({ onAddTask }) => {
    const [quickTask, setQuickTask] = useState('');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (quickTask.trim()) {
            const now = new Date();
            // FIX: Added missing 'subTasks' and 'notes' to match the Omit<ScheduleTask, 'id'> type.
            const newTask: Omit<ScheduleTask, 'id'> = {
                time: now.toTimeString().substring(0, 5),
                task: quickTask.trim(),
                completed: false,
                priority: 'medium',
                hasReminder: false,
                subTasks: [],
                notes: '',
            };
            onAddTask(newTask);
            setQuickTask('');
        }
    };

    return (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full">
            <h2 className="text-lg font-bold text-left mb-3">Quick Add Task</h2>
            <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                    type="text"
                    placeholder="Add to today's schedule..."
                    value={quickTask}
                    onChange={e => setQuickTask(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center">
                    <Plus size={20} />
                </button>
            </form>
        </div>
    );
};

export default QuickAddTask;