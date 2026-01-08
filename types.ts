
export type RainbowColor = 'violet' | 'indigo' | 'blue' | 'green' | 'yellow' | 'orange' | 'red';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: RainbowColor | null;
  createdAt: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface SubTask {
    id: string;
    text: string;
    completed: boolean;
}

export interface ScheduleTask {
  id:string;
  time: string;
  task: string;
  completed: boolean;
  priority: Priority;
  hasReminder: boolean;
  alarmSound?: AlarmSound; // Allow per-task sound selection
  // New detailed fields
  subTasks: SubTask[];
  notes: string;
}

export type Highlight = Record<string, RainbowColor>;

export interface Habit {
  goal: number;
  name: string;
  completedDays: string[]; // Dates stored as 'YYYY-MM-DD'
}

export interface CalendarEvent {
  id: string;
  text: string;
  time: string;
  hasReminder: boolean;
}

export type Events = Record<string, CalendarEvent[]>; // Keyed by 'YYYY-MM-DD'

export interface User {
    id: string;
    username: string;
    passwordHash: string;
    hasChangedDefaultPassword?: boolean;
    fullName: string;
    email: string;
    phone: string;
    isBanned?: boolean;
}

export type AlarmSound = 'bell' | 'chime' | 'digital';

export interface Dream {
  id: string;
  text: string;
  createdAt: string;
  targetDate?: string; // Optional: For setting a completion goal
}

export type AchievementType = 'habit' | 'dream';

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  date: string; // ISO string for when it was achieved
  isPosted?: boolean; // To track if shared to community
  createdAt?: string; // Optional: ISO string for when the goal was set (e.g., dream creation)
}

export interface CommunityPost {
    id: string;
    userId: string;
    username: string;
    achievement: Achievement; // Embed the whole achievement for rich display
    createdAt: string;
    likes: string[]; // Array of user IDs
    status: 'pending' | 'approved';
}

export interface Query {
    id:string;
    userId: string;
    username: string;
    queryText: string;
    responseText: string | null;
    status: 'pending' | 'answered';
    createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}