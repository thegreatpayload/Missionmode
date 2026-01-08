
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Plus, Trash2, Check, Star, CalendarClock, X } from 'lucide-react';
import type { Dream } from '../types';

interface DreamsProps {
    dreams: Dream[];
    setDreams: React.Dispatch<React.SetStateAction<Dream[]>>;
    onDreamAchieved: (dream: Dream) => void;
}

const calculateTimeRemaining = (targetDate: string | undefined): string => {
    if (!targetDate) return '';
    const remaining = new Date(targetDate).getTime() - new Date().getTime();
    if (remaining < 0) return 'Overdue';
    const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''} left`;
}

const Dreams: React.FC<DreamsProps> = ({ dreams, setDreams, onDreamAchieved }) => {
    const [newDream, setNewDream] = useState('');
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [isCustomDate, setIsCustomDate] = useState(false);
    const [activePreset, setActivePreset] = useState<'3m' | '6m' | null>(null);
    const [customDuration, setCustomDuration] = useState<{ value: number; unit: 'd' | 'm' | 'y' }>({ value: 30, unit: 'd' });

    useEffect(() => {
        if (isCustomDate) {
            const date = new Date();
            const value = customDuration.value || 0;
            if (value > 0) {
                switch (customDuration.unit) {
                    case 'd':
                        date.setDate(date.getDate() + value);
                        break;
                    case 'm':
                        date.setMonth(date.getMonth() + value);
                        break;
                    case 'y':
                        date.setFullYear(date.getFullYear() + value);
                        break;
                }
                setTargetDate(date);
            } else {
                setTargetDate(null);
            }
        }
    }, [isCustomDate, customDuration]);

    const setPresetDate = (months: 3 | 6) => {
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        setTargetDate(date);
        setIsCustomDate(false);
        setActivePreset(months === 3 ? '3m' : '6m');
    }

    const toggleCustomDate = () => {
        const shouldBeCustom = !isCustomDate;
        setIsCustomDate(shouldBeCustom);
        setActivePreset(null);
        if (!shouldBeCustom) {
            setTargetDate(null);
        }
    };

    const clearTargetDate = () => {
        setTargetDate(null);
        setIsCustomDate(false);
        setActivePreset(null);
    };

    const addDream = (e: React.FormEvent) => {
        e.preventDefault();
        if(newDream.trim()) {
            const dream: Dream = {
                id: self.crypto.randomUUID(),
                text: newDream.trim(),
                createdAt: new Date().toISOString(),
                targetDate: targetDate?.toISOString()
            };
            setDreams([dream, ...dreams]);
            setNewDream('');
            clearTargetDate();
            setCustomDuration({value: 30, unit: 'd'});
        }
    };

    const deleteDream = (id: string) => {
        setDreams(dreams.filter(d => d.id !== id));
    };

    const achieveDream = (dream: Dream) => {
        onDreamAchieved(dream);
        deleteDream(dream.id);
    };
    
    const sortedDreams = useMemo(() => 
        [...dreams].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    , [dreams]);

    return (
        <div className="p-4">
             <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <BrainCircuit size={32} className="text-indigo-500" />
                My Dreams & Aspirations
            </h1>

            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Set a New Dream</h2>
                <form onSubmit={addDream} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" value={newDream} onChange={e => setNewDream(e.target.value)} placeholder="What is your 'why'? What drives you?" className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"/>
                        <button type="submit" className="p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"><Plus size={24} /></button>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Set a Target Date (Optional)</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <button type="button" onClick={() => setPresetDate(3)} className={`px-3 py-1 rounded-full text-sm ${activePreset === '3m' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>3 Months</button>
                            <button type="button" onClick={() => setPresetDate(6)} className={`px-3 py-1 rounded-full text-sm ${activePreset === '6m' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>6 Months</button>
                            <button type="button" onClick={toggleCustomDate} className={`px-3 py-1 rounded-full text-sm ${isCustomDate ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Custom</button>
                            {targetDate && <button type="button" onClick={clearTargetDate} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"><X size={16}/></button>}
                        </div>
                         <AnimatePresence>
                        {isCustomDate && (
                            <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="flex gap-2 items-center mt-2">
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={customDuration.value} 
                                    onChange={(e) => setCustomDuration(p => ({ ...p, value: parseInt(e.target.value, 10) || 1 }))} 
                                    className="w-24 p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                />
                                <select 
                                    value={customDuration.unit} 
                                    onChange={(e) => setCustomDuration(p => ({ ...p, unit: e.target.value as 'd' | 'm' | 'y' }))}
                                    className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                >
                                    <option value="d">Days</option>
                                    <option value="m">Months</option>
                                    <option value="y">Years</option>
                                </select>
                            </motion.div>
                        )}
                         </AnimatePresence>
                        {targetDate && <p className="text-xs text-indigo-500 mt-2">Target: {targetDate.toLocaleDateString()}</p>}
                    </div>
                </form>
            </div>
            
            <AnimatePresence>
            {sortedDreams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedDreams.map((dream) => (
                        <motion.div
                            key={dream.id}
                            layout
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                            className="flex flex-col justify-between p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg group min-h-[150px]"
                        >
                            <p className="flex-grow text-gray-800 dark:text-gray-200 break-words">{dream.text}</p>
                            {dream.targetDate && <div className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 mt-2 flex items-center gap-1.5"><CalendarClock size={14}/><span>{new Date(dream.targetDate).toLocaleDateString()} ({calculateTimeRemaining(dream.targetDate)})</span></div>}
                            <div className="flex items-end justify-between pt-2">
                                <p className="text-xs text-gray-400">Set on: {new Date(dream.createdAt).toLocaleDateString()}</p>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => achieveDream(dream)} title="Mark as Achieved" className="p-1.5 rounded-full text-green-500 hover:bg-green-500/10"><Check size={18}/></button>
                                    <button onClick={() => deleteDream(dream.id)} title="Delete Dream" className="p-1.5 rounded-full text-red-500 hover:bg-red-500/10"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <Star size={48} className="mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">The journey begins with a dream.</h2>
                    <p>Set your life goals and long-term aspirations here.</p>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default Dreams;
