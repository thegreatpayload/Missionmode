
import React, { useState, useEffect, useMemo } from 'react';
import type { Habit, Events, Dream, ScheduleTask, Achievement } from '../types';
import QuickAddTask from './QuickAddTask';
import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';

interface HomeProps {
    habit: Habit | null;
    events: Events;
    onAddTask: (task: Omit<ScheduleTask, 'id' | 'subTasks' | 'notes'>) => void;
    achievements: Achievement[];
}

const Home: React.FC<HomeProps> = ({ habit, events, onAddTask, achievements }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { todaysEvents, upcomingEvents } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayKey = today.toISOString().split('T')[0];

        const todays = events[todayKey] || [];

        const upcoming = Object.entries(events)
            .filter(([dateStr]) => dateStr > todayKey)
            .flatMap(([dateStr, eventList]) =>
                Array.isArray(eventList) ? eventList.map(event => ({ ...event, date: dateStr })) : []
            )
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 5); // Limit to next 5 upcoming events

        return { todaysEvents: todays, upcomingEvents: upcoming };
    }, [events]);


    const { daysRemaining } = useMemo(() => {
        if (!habit) return { daysRemaining: 0 };
        const completedCount = new Set(habit.completedDays).size;
        const remaining = Math.max(0, habit.goal - completedCount);
        return { daysRemaining: remaining };
    }, [habit]);

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    const achievedDreams = useMemo(() => {
        return achievements.filter(a => a.type === 'dream').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [achievements]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-[calc(100vh-15rem)]">
            <div className="flex flex-col items-center justify-center text-center">
                 <div className="font-mono text-7xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">
                    {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                </div>
                <p className="text-xl md:text-2xl mt-4 text-gray-600 dark:text-gray-300">
                    {time.toLocaleDateString('en-US', dateOptions)}
                </p>
                {habit && (
                    <div className="mt-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full max-w-sm">
                        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Mission In Progress</p>
                        <p className="text-5xl font-bold mt-2 text-indigo-600 dark:text-indigo-400">{daysRemaining}</p>
                        <p className="text-gray-600 dark:text-gray-300">days remaining in '{habit.name}'</p>
                    </div>
                )}
            </div>
            
            <div className="flex flex-col gap-8 w-full h-[calc(100vh-15rem)]">
                <div className="flex-shrink-0">
                    <QuickAddTask onAddTask={onAddTask} />
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full flex-shrink-0">
                    <h2 className="text-lg font-bold text-left mb-3">Agenda</h2>
                     <div className="space-y-4 max-h-40 overflow-y-auto pr-2">
                        {todaysEvents.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Today</h3>
                                <ul className="space-y-2 text-left">
                                    {todaysEvents.map(event => (
                                        <li key={event.id} className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                            <span className="text-gray-800 dark:text-gray-200">{event.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {upcomingEvents.length > 0 && (
                             <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-3 mb-2">Upcoming</h3>
                                 <ul className="space-y-2 text-left">
                                    {upcomingEvents.map(event => (
                                        <li key={event.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                                                <span className="text-gray-800 dark:text-gray-200">{event.text}</span>
                                            </div>
                                            <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                                {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                         {todaysEvents.length === 0 && upcomingEvents.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 text-left">No events scheduled.</p>
                        )}
                    </div>
                </div>
                <div className="flex-grow min-h-0">
                   <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg h-full flex flex-col">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-3"><Award size={20} /> Achieved Dreams</h2>
                    <div className="flex-grow overflow-y-auto pr-2">
                        <AnimatePresence>
                            {achievedDreams.length > 0 ? (
                                <div className="space-y-3">
                                    {achievedDreams.map(dream => (
                                        <motion.div
                                            key={dream.id}
                                            layout
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            className="p-3 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-800 dark:text-yellow-200"
                                        >
                                            <p className="font-semibold">{dream.title.replace('Achieved Dream: ', '')}</p>
                                            <p className="text-xs opacity-70">Achieved on: {new Date(dream.date).toLocaleDateString()}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400 h-full flex flex-col justify-center items-center">
                                    <Award size={24} className="mx-auto mb-2" />
                                    <p>Your achieved dreams will appear here.</p>
                                    <p className="text-sm">Go to the Dreams tab to set your goals!</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default Home;