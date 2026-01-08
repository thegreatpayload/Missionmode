
import React, { useState, useMemo, useEffect } from 'react';
import type { Habit } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle, RefreshCw, Flame } from 'lucide-react';

const StreakVisualizer: React.FC<{ completedDays: string[] }> = ({ completedDays }) => {
    const dates = useMemo(() => new Set(completedDays), [completedDays]);
    const grid = useMemo(() => {
        const result = [];
        const today = new Date();
        today.setHours(0,0,0,0);
        for(let i=34; i>=0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            result.push({ date: dateStr, completed: dates.has(dateStr) });
        }
        return result;
    }, [dates]);

    return (
        <div className="grid grid-cols-7 gap-1.5 mt-3">
            <AnimatePresence>
            {grid.map(({ date, completed }, index) => (
                <motion.div
                    key={date}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: index * 0.02 } }}
                    title={date}
                    className={`w-full h-4 rounded-sm ${completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                />
            ))}
            </AnimatePresence>
        </div>
    );
};


const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;
    const sortedDates = [...new Set(dates)].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);

    const firstDate = new Date(sortedDates[0]);
    firstDate.setHours(0,0,0,0);

    if(firstDate.getTime() === today.getTime() || firstDate.getTime() === today.getTime() - 86400000){
         streak = 1;
    } else {
        return 0;
    }
    
    for (let i = 0; i < sortedDates.length - 1; i++) {
        const current = new Date(sortedDates[i]);
        current.setHours(0,0,0,0);
        const next = new Date(sortedDates[i+1]);
        next.setHours(0,0,0,0);
        
        if (current.getTime() - next.getTime() === 86400000) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
};

interface HabitTrackerProps {
  habit: Habit | null;
  setHabit: React.Dispatch<React.SetStateAction<Habit | null>>;
  onGoalReached: (habitName: string, goal: number) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habit, setHabit, onGoalReached }) => {
  const [goalDays, setGoalDays] = useState('30');
  const [habitName, setHabitName] = useState('New Habit');
  
  const todayStr = new Date().toISOString().split('T')[0];

  const startNewHabit = () => {
    const goal = parseInt(goalDays, 10);
    if (goal > 0 && habitName.trim()) {
      setHabit({ goal: goal, name: habitName.trim(), completedDays: [] });
    }
  };

  const resetHabit = () => setHabit(null);

  const markTodayAsComplete = () => {
    if (habit && !habit.completedDays.includes(todayStr)) {
      const newCompletedDays = [...habit.completedDays, todayStr];
      const newHabit = { ...habit, completedDays: newCompletedDays };
      setHabit(newHabit);

      // Check for goal completion right after updating
      if (new Set(newCompletedDays).size === newHabit.goal) {
          onGoalReached(newHabit.name, newHabit.goal);
      }
    }
  };

  const { daysCompleted, progress, streak, isCompletedToday } = useMemo(() => {
    if (!habit) return { daysCompleted: 0, progress: 0, streak: 0, isCompletedToday: false };
    
    const completed = new Set(habit.completedDays).size;
    const prog = (completed / habit.goal) * 100;
    const currentStreak = calculateStreak(habit.completedDays);
    const completedToday = habit.completedDays.includes(todayStr);

    return { daysCompleted: completed, progress: Math.min(100, prog), streak: currentStreak, isCompletedToday: completedToday };
  }, [habit, todayStr]);

  if (habit) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
              <div>
                  <h2 className="text-lg font-bold">Habit: {habit.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Goal: {habit.goal} days</p>
              </div>
              <button onClick={resetHabit} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><RefreshCw size={16} /></button>
          </div>
          <div className="text-center my-4 flex justify-around items-center">
            <div><p className="text-4xl font-bold">{daysCompleted}</p><p className="text-sm text-gray-500 dark:text-gray-400">Days Done</p></div>
            <div className="flex items-center gap-1"><p className="text-4xl font-bold text-orange-500">{streak}</p><Flame className="text-orange-500" size={32} /><p className="text-sm text-gray-500 dark:text-gray-400 self-end pb-1">Streak</p></div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-1">
              <motion.div className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
          </div>
          <p className="text-sm text-right text-gray-500 dark:text-gray-400">{daysCompleted} / {habit.goal} days</p>
          <StreakVisualizer completedDays={habit.completedDays} />
        </div>
        <button onClick={markTodayAsComplete} disabled={isCompletedToday} className="w-full mt-4 bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isCompletedToday ? <><CheckCircle size={18}/> Completed for Today</> : 'Complete for Today'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <h2 className="text-lg font-bold flex items-center gap-2"><Target size={20} /> New Habit Mission</h2>
      <div className="mt-4 space-y-3">
        <div>
            <label className="text-sm font-medium">Habit Name</label>
            <input type="text" value={habitName} onChange={(e) => setHabitName(e.target.value)} className="w-full mt-1 p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" placeholder="e.g., Daily Workout" />
        </div>
        <div>
            <label className="text-sm font-medium">Goal (days)</label>
            <input type="number" value={goalDays} onChange={(e) => setGoalDays(e.target.value)} className="w-full mt-1 p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
        </div>
        <button onClick={startNewHabit} className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition-colors">Start Mission</button>
      </div>
    </div>
  );
};

export default HabitTracker;
