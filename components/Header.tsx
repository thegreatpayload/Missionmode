
import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
  onOpenProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode, onLogout, onOpenProfile }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const isDayTime = hours >= 6 && hours < 18;

  return (
    <header className="p-4 md:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-20 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-xl md:text-3xl font-black tracking-tighter text-gray-900 dark:text-white">
        MISSION MODE
      </h1>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 font-mono text-base sm:text-lg font-bold bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={isDayTime ? 'sun' : 'moon'}
              initial={{ opacity: 0, y: -20, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
            >
              {isDayTime ? <SunIcon /> : <MoonIcon />}
            </motion.div>
          </AnimatePresence>
          <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>
        <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <button onClick={onOpenProfile} title="My Profile" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <User size={20} />
        </button>
        <button onClick={onLogout} title="Logout" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;