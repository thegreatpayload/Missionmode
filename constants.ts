import type { RainbowColor, ScheduleTask, Priority } from './types';

export const RAINBOW_COLORS: RainbowColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

export const COLOR_MAP: Record<RainbowColor, { bg: string, text: string, border: string }> = {
  red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/50' },
  violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/50' },
};

export const PRIORITY_MAP: Record<Priority, { color: string, border: string }> = {
  low: { color: 'text-blue-500', border: 'border-blue-500/50' },
  medium: { color: 'text-orange-500', border: 'border-orange-500/50' },
  high: { color: 'text-red-500', border: 'border-red-500/50' },
};


// FIX: Added missing 'subTasks' and 'notes' properties to each default schedule task.
export const DEFAULT_SCHEDULE: Omit<ScheduleTask, 'id'>[] = [
  { time: "06:00", task: "Wake Up & Hydrate", completed: false, priority: 'medium', hasReminder: false, subTasks: [], notes: '' },
  { time: "06:15", task: "Meditation / Journaling", completed: false, priority: 'medium', hasReminder: false, subTasks: [], notes: '' },
  { time: "07:00", task: "Workout", completed: false, priority: 'high', hasReminder: false, subTasks: [], notes: '' },
  { time: "08:00", task: "Breakfast & Plan Day", completed: false, priority: 'medium', hasReminder: false, subTasks: [], notes: '' },
  { time: "09:00", task: "Deep Work Block 1", completed: false, priority: 'high', hasReminder: false, subTasks: [], notes: '' },
  { time: "11:00", task: "Short Break", completed: false, priority: 'low', hasReminder: false, subTasks: [], notes: '' },
  { time: "11:15", task: "Deep Work Block 2", completed: false, priority: 'high', hasReminder: false, subTasks: [], notes: '' },
  { time: "13:00", task: "Lunch", completed: false, priority: 'medium', hasReminder: false, subTasks: [], notes: '' },
  { time: "14:00", task: "Shallow Work / Emails", completed: false, priority: 'medium', hasReminder: false, subTasks: [], notes: '' },
  { time: "15:00", task: "Deep Work Block 3", completed: false, priority: 'high', hasReminder: false, subTasks: [], notes: '' },
  { time: "17:00", task: "Wrap up work", completed: false, priority: 'medium', hasReminder: false, subTasks: [], notes: '' },
  { time: "18:00", task: "Break / Relax", completed: false, priority: 'low', hasReminder: false, subTasks: [], notes: '' },
  { time: "19:00", task: "Dinner", completed: false, priority: 'medium', hasReminder: false, subTasks: [], notes: '' },
  { time: "20:00", task: "Skill Development / Reading", completed: false, priority: 'medium', hasReminder: false, subTasks: [], notes: '' },
  { time: "21:00", task: "Wind Down / Family Time", completed: false, priority: 'low', hasReminder: false, subTasks: [], notes: '' },
  { time: "22:00", task: "Prepare for Tomorrow", completed: false, priority: 'medium', hasReminder: false, subTasks: [], notes: '' },
  { time: "22:30", task: "Sleep", completed: false, priority: 'medium', hasReminder: false, subTasks: [], notes: '' },
];