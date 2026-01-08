
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, setIsDarkMode }) => {
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <button
      onClick={toggleTheme}
      className={`w-14 h-8 rounded-full p-1 flex items-center transition-colors ${
        isDarkMode ? 'bg-indigo-600 justify-end' : 'bg-yellow-400 justify-start'
      }`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
      >
        {isDarkMode ? <Moon size={16} className="text-indigo-600" /> : <Sun size={16} className="text-yellow-500" />}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
