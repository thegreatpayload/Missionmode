
import React, { useState } from 'react';
import type { User, Query } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Send } from 'lucide-react';

interface QueryProps {
    currentUser: User;
    queries: Query[];
    setQueries: React.Dispatch<React.SetStateAction<Query[]>>;
}

const QueryComponent: React.FC<QueryProps> = ({ currentUser, queries, setQueries }) => {
    const [newQueryText, setNewQueryText] = useState('');

    const handleSubmitQuery = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQueryText.trim()) return;

        const newQuery: Query = {
            id: self.crypto.randomUUID(),
            userId: currentUser.id,
            username: currentUser.username,
            queryText: newQueryText.trim(),
            responseText: null,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        setQueries(prev => [newQuery, ...prev]);
        setNewQueryText('');
    };
    
    const sortedQueries = [...queries].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <HelpCircle size={32} className="text-indigo-500" />
                Contact Support
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
                <form onSubmit={handleSubmitQuery} className="flex flex-col sm:flex-row gap-3">
                    <textarea
                        value={newQueryText}
                        onChange={e => setNewQueryText(e.target.value)}
                        placeholder="Have a question? Ask the admin here..."
                        className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 resize-none"
                        rows={2}
                        required
                    />
                    <button type="submit" className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors">
                        <Send size={16} /> Send
                    </button>
                </form>
            </div>

            <h2 className="text-2xl font-bold mb-4">Your Query History</h2>
            <div className="space-y-4">
                <AnimatePresence>
                    {sortedQueries.length > 0 ? sortedQueries.map(q => (
                        <motion.div
                            key={q.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5"
                        >
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-gray-500 dark:text-gray-400">You asked:</p>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.status === 'answered' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                    {q.status}
                                </span>
                            </div>
                            <p className="mt-1 mb-3 text-gray-800 dark:text-gray-200">{q.queryText}</p>
                            
                            {q.responseText && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                                    <p className="font-semibold text-indigo-500 dark:text-indigo-400">Admin replied:</p>
                                    <p className="mt-1 text-gray-800 dark:text-gray-200">{q.responseText}</p>
                                </div>
                            )}
                            <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-3">{new Date(q.createdAt).toLocaleString()}</p>
                        </motion.div>
                    )) : (
                         <p className="text-center text-gray-500 py-12">You have no past queries.</p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default QueryComponent;
