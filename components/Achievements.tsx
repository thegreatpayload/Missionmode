
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';
import type { Achievement } from '../types';
import Certificate from './Certificate';

interface AchievementsProps {
    achievements: Achievement[];
    username: string;
}

const Achievements: React.FC<AchievementsProps> = ({ achievements, username }) => {
    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Award size={32} className="text-indigo-500" />
                Hall of Fame
            </h1>

            <AnimatePresence>
                {achievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {achievements.map((ach, index) => (
                            <motion.div
                                key={ach.id}
                                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: index * 0.1 } }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                layout
                            >
                                <Certificate achievement={ach} username={username} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 text-gray-500 dark:text-gray-400"
                    >
                        <Award size={48} className="mx-auto mb-4" />
                        <h2 className="text-xl font-semibold">Your Trophy Room is Awaiting</h2>
                        <p>Complete a Habit Mission or achieve a Dream to earn your first certificate.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Achievements;
