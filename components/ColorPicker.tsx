
import React from 'react';
import { motion } from 'framer-motion';
import { RAINBOW_COLORS } from '../constants';
import type { RainbowColor } from '../types';

interface ColorPickerProps {
  onSelectColor: (color: RainbowColor) => void;
  onClear?: () => void;
}

const tailwindColorMap: Record<RainbowColor, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    violet: 'bg-violet-500',
};

const ColorPicker: React.FC<ColorPickerProps> = ({ onSelectColor, onClear }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {RAINBOW_COLORS.map(color => (
        <motion.button
          key={color}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelectColor(color)}
          className={`w-6 h-6 rounded-full ${tailwindColorMap[color]} border-2 border-white/50 dark:border-black/50`}
          aria-label={`Select ${color}`}
        />
      ))}
      {onClear && (
        <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClear}
            className="w-6 h-6 rounded-full bg-transparent border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center text-gray-400 dark:text-gray-500"
            aria-label="Clear color"
        >
          <div className="w-4 h-0.5 bg-gray-400 dark:bg-gray-500 transform rotate-45"></div>
        </motion.button>
      )}
    </div>
  );
};

export default ColorPicker;
