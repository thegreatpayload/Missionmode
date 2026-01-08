
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Auth from './components/Auth';
import MainApp from './MainApp';
import Landing from './components/Landing';
import type { User, Note, Dream, Achievement, CommunityPost, Query } from './types';
import PasswordChangeModal from './components/PasswordChangeModal';
import { AnimatePresence, motion } from 'framer-motion';

const hashPassword = (password: string) => `hashed_${password}`;

const gatherAllUserData = (users: User[], localStorage: Storage) => {
    return users.map(user => {
        const userData: any = { ...user };
        const keys = ['notes', 'schedules', 'highlights', 'habit', 'events', 'dreams', 'achievements', 'alarmSound'];
        keys.forEach(key => {
            const item = localStorage.getItem(`mission-mode-${key}-${user.id}`);
            userData[key] = item ? JSON.parse(item) : null;
        });
        return userData;
    });
};

type AppView = 'landing' | 'auth' | 'dashboard';

const App: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('mission-mode-currentUser', null);
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('mission-mode-dark-theme', true);
  const [users, setUsers] = useLocalStorage<User[]>('mission-mode-users', []);
  const [communityPosts, setCommunityPosts] = useLocalStorage<CommunityPost[]>('mission-mode-community-posts', []);
  const [queries, setQueries] = useLocalStorage<Query[]>('mission-mode-queries', []);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  
  const currentUser = users.find(u => u.id === currentUserId);
  const [view, setView] = useState<AppView>(currentUser ? 'dashboard' : 'landing');

  useEffect(() => {
    // This effect ensures that if the user logs out, they are sent to the landing page.
    if (!currentUser && view === 'dashboard') {
      setView('landing');
    }
  }, [currentUser, view]);
  
  useEffect(() => {
    if (users.length === 0) {
        const adminUser: User = {
            id: self.crypto.randomUUID(),
            username: 'admin',
            passwordHash: hashPassword('admin'),
            hasChangedDefaultPassword: false,
            fullName: 'Administrator',
            email: 'admin@missionmode.app',
            phone: '0000000000',
            isBanned: false,
        };
        setUsers([adminUser]);
    }
  }, [users, setUsers]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = () => setCurrentUserId(null);
  
  const isAdmin = currentUser?.username === 'admin';

  useEffect(() => {
    if (currentUser?.username === 'admin' && !currentUser.hasChangedDefaultPassword) {
        setNeedsPasswordChange(true);
    }
  }, [currentUser]);

  const handleAdminPasswordChange = (newPassword: string) => {
    setUsers(prevUsers => 
        prevUsers.map(user => 
            user.id === currentUser?.id 
            ? { ...user, passwordHash: hashPassword(newPassword), hasChangedDefaultPassword: true }
            : user
        )
    );
    setNeedsPasswordChange(false);
  };
  
  const handleUserPasswordChange = (userId: string, currentPassword: string, newPassword: string): { success: boolean; message: string } => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate || userToUpdate.passwordHash !== hashPassword(currentPassword)) {
        return { success: false, message: "Current password does not match." };
    }
    setUsers(prevUsers =>
        prevUsers.map(user =>
            user.id === userId ? { ...user, passwordHash: hashPassword(newPassword) } : user
        )
    );
    return { success: true, message: "Password updated successfully!" };
};

  const forceUpdateAdminPanel = () => setUsers(prev => [...prev]);

  const deleteUser = (userId: string) => {
      const keys = ['notes', 'schedules', 'highlights', 'habit', 'events', 'dreams', 'achievements', 'alarmSound'];
      keys.forEach(key => localStorage.removeItem(`mission-mode-${key}-${userId}`));
      setUsers(prev => prev.filter(u => u.id !== userId));
      setCommunityPosts(prev => prev.filter(p => p.userId !== userId));
      setQueries(prev => prev.filter(q => q.userId !== userId));
  };

  const deleteNoteForUser = (userId: string, noteId: string) => {
      const notes: Note[] = JSON.parse(localStorage.getItem(`mission-mode-notes-${userId}`) || '[]');
      localStorage.setItem(`mission-mode-notes-${userId}`, JSON.stringify(notes.filter(n => n.id !== noteId)));
      forceUpdateAdminPanel();
  };

  const deleteDreamForUser = (userId: string, dreamId: string) => {
      const dreams: Dream[] = JSON.parse(localStorage.getItem(`mission-mode-dreams-${userId}`) || '[]');
      localStorage.setItem(`mission-mode-dreams-${userId}`, JSON.stringify(dreams.filter(d => d.id !== dreamId)));
      forceUpdateAdminPanel();
  };
  
  const resetHabitForUser = (userId: string) => {
      localStorage.setItem(`mission-mode-habit-${userId}`, 'null');
      forceUpdateAdminPanel();
  };

  const banUser = (userId: string, isBanned: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned } : u));
  };

  const approvePost = (postId: string) => {
    setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'approved' } : p));
  };

  const deletePost = (postId: string) => {
    setCommunityPosts(prev => prev.filter(p => p.id !== postId));
  };
  
  const respondToQuery = (queryId: string, response: string) => {
    setQueries(prev => prev.map(q => q.id === queryId ? { ...q, responseText: response, status: 'answered' } : q));
  }

  const deleteQuery = (queryId: string) => {
    setQueries(prev => prev.filter(q => q.id !== queryId));
  }

  const renderView = () => {
    switch(view) {
      case 'landing':
        return <Landing key="landing" onGetStarted={() => setView('auth')} />;
      case 'auth':
        return <Auth 
                  key="auth"
                  onLogin={(user: User) => {
                    setCurrentUserId(user.id);
                    setView('dashboard');
                  }} 
                  users={users}
                  setUsers={setUsers}
                  onBackToLanding={() => setView('landing')}
                />;
      case 'dashboard':
        if (currentUser) {
          return (
            <motion.div key="dashboard" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              {needsPasswordChange && <PasswordChangeModal onPasswordChange={handleAdminPasswordChange} />}
              <MainApp 
                currentUser={currentUser}
                onLogout={handleLogout} 
                isDarkMode={isDarkMode} 
                setIsDarkMode={setIsDarkMode}
                onPasswordChange={handleUserPasswordChange}
                isAdmin={isAdmin}
                allUsersData={isAdmin ? { users: gatherAllUserData(users, localStorage), posts: communityPosts, queries: queries } : undefined}
                communityPosts={communityPosts}
                setCommunityPosts={setCommunityPosts}
                queries={queries}
                setQueries={setQueries}
                deleteUser={isAdmin ? deleteUser : undefined}
                deleteNoteForUser={isAdmin ? deleteNoteForUser : undefined}
                deleteDreamForUser={isAdmin ? deleteDreamForUser : undefined}
                resetHabitForUser={isAdmin ? resetHabitForUser : undefined}
                banUser={isAdmin ? banUser : undefined}
                approvePost={isAdmin ? approvePost : undefined}
                deletePost={isAdmin ? deletePost : undefined}
                respondToQuery={isAdmin ? respondToQuery : undefined}
                deleteQuery={isAdmin ? deleteQuery : undefined}
              />
            </motion.div>
          );
        }
        return null; // Should not happen if logic is correct
      default:
        return <Landing onGetStarted={() => setView('auth')} />;
    }
  }

  return (
    <AnimatePresence mode="wait">
      {renderView()}
    </AnimatePresence>
  );
};

export default App;
