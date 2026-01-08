
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Plus, Trash2, Check, Star } from 'lucide-react';
import type { Dream } from '../types';

interface DreamSetterProps {
    dreams: Dream[];
    setDreams: React.Dispatch<React.SetStateAction<Dream[]>>;
    onDreamAchieved: (dream: Dream) => void;
}

const DreamSetter: React.FC<DreamSetterProps> = ({ dreams, setDreams, onDreamAchieved }) => {
    const [newDream, setNewDream] = useState('');

    const addDream = (e: React.FormEvent) => {
        e.preventDefault();
        if(newDream.trim()) {
            const dream: Dream = {
                id: self.crypto.randomUUID(),
                text: newDream.trim(),
                createdAt: new Date().toISOString()
            };
            setDreams([dream, ...dreams]);
            setNewDream('');
        }
    };

    const deleteDream = (id: string) => {
        setDreams(dreams.filter(d => d.id !== id));
    };

    const achieveDream = (dream: Dream) => {
        onDreamAchieved(dream);
        deleteDream(dream.id);
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg h-full flex flex-col">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-3"><BrainCircuit size={20} /> My Dreams</h2>
            <form onSubmit={addDream} className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={newDream}
                    onChange={e => setNewDream(e.target.value)}
                    placeholder="What is your 'why'?"
                    className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                />
                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    <Plus size={20} />
                </button>
            </form>
            <div className="flex-grow overflow-y-auto pr-2">
                <AnimatePresence>
                {dreams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dreams.map(dream => (
                            <motion.div
                                key={dream.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 group h-28"
                            >
                                <span className="flex-grow text-sm">{dream.text}</span>
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => achieveDream(dream)} title="Mark as Achieved" className="p-1 rounded-md text-green-500 hover:bg-green-500/10"><Check size={16}/></button>
                                    <button onClick={() => deleteDream(dream.id)} title="Delete Dream" className="p-1 rounded-md text-red-500 hover:bg-red-500/10"><Trash2 size={16}/></button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <Star size={24} className="mx-auto mb-2" />
                        Set your big goals to fuel your daily mission.
                    </div>
                )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DreamSetter;
