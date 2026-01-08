
import React, { useState, useEffect, useRef } from 'react';
import { useUserSpecificLocalStorage } from './hooks/useUserSpecificLocalStorage';
import type { Note, ScheduleTask, Highlight, Habit, Events, AlarmSound, Dream, Achievement, User, CommunityPost, Query, CalendarEvent, Notification } from './types';
import Header from './components/Header';
import Home from './components/Home';
import ExtremeCalendar from './components/ExtremeCalendar';
import DailySchedule from './components/DailySchedule';
import Notes from './components/Notes';
import Toast from './components/Toast';
import { AnimatePresence } from 'framer-motion';
import { DEFAULT_SCHEDULE } from './constants';
import { Home as HomeIcon, ListChecks, StickyNote, Award, Shield, BrainCircuit, HelpCircle, Brain, Bell } from 'lucide-react';
import HabitTracker from './components/HabitTracker';
import Achievements from './components/Achievements';
import AdminPanel from './components/AdminPanel';
import Community from './components/Community';
import QueryComponent from './components/Query';
import ProfileModal from './components/ProfileModal';
import Dreams from './components/Dreams';
import Notifications from './components/Notifications';

type Tab = 'home' | 'schedule' | 'notes' | 'dreams' | 'notifications' | 'achievements' | 'community' | 'query' | 'admin';

interface MainAppProps {
    currentUser: User;
    onLogout: () => void;
    isDarkMode: boolean;
    setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
    onPasswordChange: (userId: string, currentPassword: string, newPassword: string) => { success: boolean; message: string };
    isAdmin: boolean;
    allUsersData?: any; 
    communityPosts: CommunityPost[];
    setCommunityPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
    queries: Query[];
    setQueries: React.Dispatch<React.SetStateAction<Query[]>>;
    // Admin functions
    deleteUser?: (userId: string) => void;
    deleteNoteForUser?: (userId: string, noteId: string) => void;
    deleteDreamForUser?: (userId: string, dreamId: string) => void;
    resetHabitForUser?: (userId: string) => void;
    banUser?: (userId: string, isBanned: boolean) => void;
    approvePost?: (postId: string) => void;
    deletePost?: (postId: string) => void;
    respondToQuery?: (queryId: string, response: string) => void;
    deleteQuery?: (queryId: string) => void;
}

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

const playSound = (type: AlarmSound) => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);

    switch (type) {
        case 'bell':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
            break;
        case 'chime':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(1500, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1800, audioContext.currentTime + 0.05);
            oscillator.frequency.setValueAtTime(2200, audioContext.currentTime + 0.1);
            break;
        case 'digital':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.1);
            break;
    }

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);
    oscillator.stop(audioContext.currentTime + 1);
};


const MainApp: React.FC<MainAppProps> = (props) => {
  const { currentUser, onLogout, isDarkMode, setIsDarkMode, onPasswordChange, isAdmin, allUsersData, communityPosts, setCommunityPosts, queries, setQueries } = props;
  const { deleteUser, deleteNoteForUser, deleteDreamForUser, resetHabitForUser, banUser, approvePost, deletePost, respondToQuery, deleteQuery } = props;
  const userId = currentUser.id;

  const [notes, setNotes] = useUserSpecificLocalStorage<Note[]>('notes', [], userId);
  const [schedules, setSchedules] = useUserSpecificLocalStorage<Record<string, ScheduleTask[]>>('schedules', {}, userId);
  const [highlights, setHighlights] = useUserSpecificLocalStorage<Highlight>('highlights', {}, userId);
  const [habit, setHabit] = useUserSpecificLocalStorage<Habit | null>('habit', null, userId);
  const [events, setEvents] = useUserSpecificLocalStorage<Events>('events', {}, userId);
  const [alarmSound, setAlarmSound] = useUserSpecificLocalStorage<AlarmSound>('alarmSound', 'bell', userId);
  const [dreams, setDreams] = useUserSpecificLocalStorage<Dream[]>('dreams', [], userId);
  const [achievements, setAchievements] = useUserSpecificLocalStorage<Achievement[]>('achievements', [], userId);
  const [notifications, setNotifications] = useUserSpecificLocalStorage<Notification[]>('notifications', [], userId);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [toast, setToast] = useState<{message: string; id: number} | null>(null);
  const [remindedTasks, setRemindedTasks] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  
  const addNotification = (message: string) => {
    const newNotification: Notification = {
      id: self.crypto.randomUUID(),
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    // Add to the beginning and limit to 50 notifications
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  };
  
  useEffect(() => {
    const checkReminders = () => {
        const now = new Date();
        const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
        const todayKey = now.toISOString().split('T')[0];
        
        const todaysSchedule = schedules[todayKey] || [];
        todaysSchedule.forEach(task => {
            if (task.time === currentTime && task.hasReminder && !task.completed && !remindedTasks.has(task.id)) {
                playSound(task.alarmSound || alarmSound);
                const message = `It's time for: ${task.task}`;
                setToast({ message, id: Date.now() });
                addNotification(message);
                setRemindedTasks(prev => new Set(prev).add(task.id));
            }
        });

        const todaysEvents = events[todayKey] || [];
        todaysEvents.forEach(event => {
            if (event.time === currentTime && event.hasReminder && !remindedTasks.has(event.id)) {
                playSound(alarmSound);
                const message = `Event Reminder: ${event.text}`;
                setToast({ message, id: Date.now() });
                addNotification(message);
                setRemindedTasks(prev => new Set(prev).add(event.id));
            }
        });
    };

    const scheduleNextCheck = () => {
        const now = new Date();
        const seconds = now.getSeconds();
        const millis = now.getMilliseconds();
        const delay = (60 - seconds) * 1000 - millis;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = window.setTimeout(() => {
            checkReminders();
            scheduleNextCheck();
        }, delay);
    };

    scheduleNextCheck();

    return () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };
}, [schedules, events, remindedTasks, alarmSound, setNotifications]);


  const dateKey = selectedDate.toISOString().split('T')[0];
  const getScheduleForDate = (key: string): ScheduleTask[] => schedules[key] ?? DEFAULT_SCHEDULE.map(task => ({ ...task, id: self.crypto.randomUUID() }));
  const handleScheduleChange = (newSchedule: ScheduleTask[]) => setSchedules(prev => ({ ...prev, [dateKey]: newSchedule }));
  
  const handleQuickAddTask = (task: Omit<ScheduleTask, 'id' | 'subTasks' | 'notes'>) => {
    const todayKey = new Date().toISOString().split('T')[0];
    const todaysSchedule = getScheduleForDate(todayKey);
    const newTask = { ...task, id: self.crypto.randomUUID(), subTasks: [], notes: '' };
    const newSchedule = [...todaysSchedule, newTask].sort((a,b) => a.time.localeCompare(b.time));
    setSchedules(prev => ({ ...prev, [todayKey]: newSchedule }));
    setToast({ message: `Added: ${task.task}`, id: Date.now() });
  };
  
  const handleHabitGoalReached = (habitName: string, goal: number) => {
    const newAchievement: Achievement = { id: self.crypto.randomUUID(), type: 'habit', title: `Completed a ${goal}-Day Mission: ${habitName}`, date: new Date().toISOString() };
    setAchievements(prev => [newAchievement, ...prev]);
    setToast({ message: `Mission Accomplished! Certificate earned.`, id: Date.now() });
  };
  
  const handleDreamAchieved = (dream: Dream) => {
    const newAchievement: Achievement = { 
        id: self.crypto.randomUUID(), 
        type: 'dream', 
        title: `Achieved Dream: ${dream.text}`, 
        date: new Date().toISOString(),
        createdAt: dream.createdAt, // Store the creation date for duration calculation
    };
    setAchievements(prev => [newAchievement, ...prev]);
    setToast({ message: `Dream Achieved! Certificate earned. You can now post it to the community.`, id: Date.now() });
  };
  
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const renderContent = () => {
    switch(activeTab) {
        case 'home': return <Home habit={habit} events={events} onAddTask={handleQuickAddTask} achievements={achievements} />;
        case 'schedule': return (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1 space-y-8"><ExtremeCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} highlights={highlights} onHighlight={(date, color) => setHighlights(p => ({...p, [date.toISOString().split('T')[0]]: color }))} habit={habit} events={events} setEvents={setEvents} /><HabitTracker habit={habit} setHabit={setHabit} onGoalReached={handleHabitGoalReached} /></div>
                <div className="xl:col-span-2"><DailySchedule key={dateKey} selectedDate={selectedDate} schedule={getScheduleForDate(dateKey)} onScheduleChange={handleScheduleChange} alarmSound={alarmSound} setAlarmSound={setAlarmSound} isDarkMode={isDarkMode} /></div>
            </div>);
        case 'notes': return <Notes notes={notes} setNotes={setNotes} />;
        case 'dreams': return <Dreams dreams={dreams} setDreams={setDreams} onDreamAchieved={handleDreamAchieved} />;
        case 'notifications': return <Notifications notifications={notifications} setNotifications={setNotifications} />;
        case 'achievements': return <Achievements achievements={achievements} username={currentUser.username} />;
        case 'community': return <Community currentUser={currentUser} posts={communityPosts} setPosts={setCommunityPosts} achievements={achievements} onAchievementsUpdate={(newAchievements) => setAchievements(newAchievements)} />;
        case 'query': return <QueryComponent currentUser={currentUser} queries={queries.filter(q => q.userId === userId)} setQueries={setQueries} />;
        case 'admin': return isAdmin ? <AdminPanel allUsersData={allUsersData} deleteUser={deleteUser!} deleteNoteForUser={deleteNoteForUser!} deleteDreamForUser={deleteDreamForUser!} resetHabitForUser={resetHabitForUser!} banUser={banUser!} approvePost={approvePost!} deletePost={deletePost!} respondToQuery={respondToQuery!} deleteQuery={deleteQuery!} /> : <div>Access Denied</div>;
        default: return <Home habit={habit} events={events} onAddTask={handleQuickAddTask} achievements={achievements} />;
    }
  };

  const TabButton: React.FC<{tab: Tab, icon: React.ReactNode, label: string, badge?: number}> = ({ tab, icon, label, badge }) => (
    <button onClick={() => setActiveTab(tab)} className={`relative flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
        {icon}<span className="hidden md:inline">{label}</span>
        {badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white ring-2 ring-gray-100 dark:ring-gray-900">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} onLogout={onLogout} onOpenProfile={() => setIsProfileModalOpen(true)} />
      <div className="w-full overflow-x-auto">
        <nav className="p-2 md:px-8 flex justify-start md:justify-center items-center gap-1 md:gap-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <TabButton tab="home" icon={<HomeIcon size={20} />} label="Home" /><TabButton tab="schedule" icon={<ListChecks size={20} />} label="Schedule" /><TabButton tab="notes" icon={<StickyNote size={20} />} label="Notes" /><TabButton tab="dreams" icon={<Brain size={20} />} label="Dreams" /><TabButton tab="notifications" icon={<Bell size={20} />} label="Notifications" badge={unreadNotificationsCount} /><TabButton tab="achievements" icon={<Award size={20} />} label="Achievements" /><TabButton tab="community" icon={<BrainCircuit size={20} />} label="Community" /><TabButton tab="query" icon={<HelpCircle size={20} />} label="Query" />
          {isAdmin && <TabButton tab="admin" icon={<Shield size={20} />} label="Admin Panel" />}
        </nav>
      </div>
      <main className="p-2 sm:p-4 md:p-8 max-w-screen-2xl mx-auto">{renderContent()}</main>
      <AnimatePresence>{toast && <Toast key={toast.id} message={toast.message} onClose={() => setToast(null)} />}</AnimatePresence>
      <AnimatePresence>
        {isProfileModalOpen && (
          <ProfileModal
            currentUser={currentUser}
            onClose={() => setIsProfileModalOpen(false)}
            onPasswordChange={onPasswordChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainApp;