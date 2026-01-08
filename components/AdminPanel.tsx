
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, ChevronDown, Trash2, Users, BookOpen, BrainCircuit, Star, Repeat, CheckCircle, XCircle, UserX, UserCheck, HelpCircle, Send, FileDown } from 'lucide-react';
import type { Note, Dream, CommunityPost, Query, Achievement, CalendarEvent } from '../types';

interface AdminPanelProps {
    allUsersData: any;
    deleteUser: (userId: string) => void;
    deleteNoteForUser: (userId: string, noteId: string) => void;
    deleteDreamForUser: (userId: string, dreamId: string) => void;
    resetHabitForUser: (userId: string) => void;
    banUser: (userId: string, isBanned: boolean) => void;
    approvePost: (postId: string) => void;
    deletePost: (postId: string) => void;
    respondToQuery: (queryId: string, response: string) => void;
    deleteQuery: (queryId: string) => void;
}
const StatCard: React.FC<{icon: React.ReactNode, label: string, value: number | string}> = ({ icon, label, value}) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center gap-4"><div className="p-3 bg-indigo-500/10 rounded-full text-indigo-500">{icon}</div><div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-gray-500 dark:text-gray-400">{label}</p></div></div>
);

const calculateStreak = (dates: string[]): number => {
    if (!dates || dates.length === 0) return 0;
    const sortedDates = [...new Set(dates)].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);

    const firstDate = new Date(sortedDates[0]);
    firstDate.setHours(0,0,0,0);

    if(firstDate.getTime() === today.getTime() || firstDate.getTime() === today.getTime() - 86400000){
         streak = 1;
    } else {
        return 0;
    }
    
    for (let i = 0; i < sortedDates.length - 1; i++) {
        const current = new Date(sortedDates[i]);
        current.setHours(0,0,0,0);
        const next = new Date(sortedDates[i+1]);
        next.setHours(0,0,0,0);
        
        if (current.getTime() - next.getTime() === 86400000) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
};

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const { allUsersData, deleteUser, deleteNoteForUser, deleteDreamForUser, resetHabitForUser, banUser, approvePost, deletePost, respondToQuery, deleteQuery } = props;
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'queries'>('users');
    const [responseText, setResponseText] = useState('');

    const stats = useMemo(() => {
        if (!allUsersData) return { totalUsers: 0, totalNotes: 0, totalDreams: 0, totalAchievements: 0, pendingPosts: 0, pendingQueries: 0 };
        const nonAdminUsers = allUsersData.users.filter((u: any) => u.username !== 'admin');
        return {
            totalUsers: nonAdminUsers.length,
            totalNotes: nonAdminUsers.reduce((sum: number, user: any) => sum + (user.notes?.length || 0), 0),
            totalDreams: nonAdminUsers.reduce((sum: number, user: any) => sum + (user.dreams?.length || 0), 0),
            totalAchievements: nonAdminUsers.reduce((sum: number, user: any) => sum + (user.achievements?.length || 0), 0),
            pendingPosts: allUsersData.posts.filter((p: CommunityPost) => p.status === 'pending').length,
            pendingQueries: allUsersData.queries.filter((q: Query) => q.status === 'pending').length,
        };
    }, [allUsersData]);

    const handleExportCSV = (userId?: string) => {
        const usersToExport = userId 
            ? allUsersData.users.filter((u: any) => u.id === userId)
            : allUsersData.users.filter((u: any) => u.username !== 'admin');

        if (usersToExport.length === 0) {
            alert("No user data to export.");
            return;
        }

        const headers = [
            "Full Name", "Username", "Email", "Phone", "Password", "Current Habit Streak", 
            "Achieved Certificates", "Dreams", "Notes", "Events"
        ];

        const escapeCSV = (field: any): string => {
            if (field === null || field === undefined) return '""';
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                const escapedStr = str.replace(/"/g, '""');
                return `"${escapedStr}"`;
            }
            return `"${str}"`;
        };

        const csvRows = usersToExport.map((user: any) => {
            const decodedPassword = user.passwordHash.startsWith('hashed_') ? user.passwordHash.substring(7) : '[Encrypted]';
            const streak = user.habit ? calculateStreak(user.habit.completedDays) : 0;
            const certificates = user.achievements?.map((a: Achievement) => a.title).join('; ') || 'N/A';
            const dreams = user.dreams?.map((d: Dream) => d.text).join('; ') || 'N/A';
            const notes = user.notes?.map((n: Note) => n.title).join('; ') || 'N/A';
            const events = Object.entries(user.events || {})
                .flatMap(([date, eventList]: [string, any]) => 
                    Array.isArray(eventList) ? eventList.map((e: CalendarEvent) => `${date} ${e.time}: ${e.text}`) : []
                )
                .join('; ') || 'N/A';

            return [
                user.fullName, user.username, user.email, user.phone, decodedPassword, streak,
                certificates, dreams, notes, events
            ].map(escapeCSV).join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const fileName = userId ? `mission-mode-user-${usersToExport[0].username}.csv` : "mission-mode-all-users.csv";
        link.setAttribute("download", fileName);
        document.body.appendChild(link); // Required for Firefox and others
        link.click();
        document.body.removeChild(link);
    };

    if (!allUsersData) return <div>Loading data...</div>;
    const { users, posts, queries } = allUsersData;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <h1 className="text-3xl font-bold flex items-center gap-3"><Shield size={32} className="text-red-500" />Admin Invigilator Panel</h1>
                 <button onClick={() => handleExportCSV()} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
                    <FileDown size={16} /> Export All Users
                 </button>
            </div>
           
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon={<Users size={24}/>} label="Total Users" value={stats.totalUsers} /><StatCard icon={<BookOpen size={24}/>} label="Total Notes" value={stats.totalNotes} /><StatCard icon={<BrainCircuit size={24}/>} label="Total Dreams" value={stats.totalDreams} /><StatCard icon={<Star size={24}/>} label="Total Achievements" value={stats.totalAchievements} /><StatCard icon={<CheckCircle size={24}/>} label="Pending Posts" value={stats.pendingPosts} /><StatCard icon={<HelpCircle size={24}/>} label="Pending Queries" value={stats.pendingQueries} />
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-semibold ${activeTab === 'users' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-500'}`}>Users</button>
                <button onClick={() => setActiveTab('posts')} className={`px-4 py-2 font-semibold ${activeTab === 'posts' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-500'}`}>Posts ({stats.pendingPosts})</button>
                <button onClick={() => setActiveTab('queries')} className={`px-4 py-2 font-semibold ${activeTab === 'queries' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-500'}`}>Queries ({stats.pendingQueries})</button>
            </div>
            
            <AnimatePresence mode="wait"><motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeTab === 'users' && (
                    <div className="space-y-3">
                        {users.filter((u: any) => u.username !== 'admin').map((user: any) => (
                            <div key={user.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all ${user.isBanned ? 'opacity-60' : ''}`}>
                                <div className="p-4 flex flex-wrap items-center justify-between gap-y-2">
                                    <button onClick={() => setExpandedItem(expandedItem === user.id ? null : user.id)} className="flex items-center gap-3 flex-grow text-left">
                                        <User className={`${user.isBanned ? 'text-red-500' : 'text-indigo-500'}`}/>
                                        <div>
                                            <span className="font-semibold">{user.username}</span>
                                            {user.isBanned && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">BANNED</span>}
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </div>
                                    </button>
                                    <button onClick={() => setExpandedItem(expandedItem === user.id ? null : user.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                      <ChevronDown className={`transition-transform ${expandedItem === user.id ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className="w-full sm:w-auto flex items-center justify-end gap-2 text-sm sm:pl-4">
                                        {confirmingDelete === user.id ? (
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-red-500">Sure?</p>
                                                <button onClick={() => { deleteUser(user.id); setConfirmingDelete(null); }} className="px-2 py-1 text-xs bg-red-500 text-white rounded">Yes</button>
                                                <button onClick={() => setConfirmingDelete(null)} className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 rounded">No</button>
                                            </div>
                                        ) : (
                                            <>
                                                <button onClick={() => banUser(user.id, !user.isBanned)} title={user.isBanned ? "Unban User" : "Ban User"} className="p-1.5 rounded-md hover:bg-gray-500/10">{user.isBanned ? <UserCheck size={16} className="text-green-500"/> : <UserX size={16} className="text-red-500"/>}</button>
                                                <button onClick={() => resetHabitForUser(user.id)} title="Reset Habit" className="p-1.5 rounded-md hover:bg-yellow-500/10"><Repeat size={16} className="text-yellow-600"/></button>
                                                <button onClick={() => setConfirmingDelete(user.id)} title="Delete User" className="p-1.5 rounded-md hover:bg-red-500/10"><Trash2 size={16} className="text-red-500"/></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <AnimatePresence>
                                {expandedItem === user.id && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div><h4 className="font-semibold text-sm mb-2">User Info</h4><div className="space-y-1"><p><b>Full Name:</b> {user.fullName}</p><p><b>Phone:</b> {user.phone}</p></div></div>
                                                <div><h4 className="font-semibold text-sm mb-2">Habit Progress</h4><div>{user.habit ? `${user.habit.name}: ${new Set(user.habit.completedDays).size} / ${user.habit.goal} days` : 'No active habit.'}</div></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div><h4 className="font-semibold text-sm mb-2">Notes ({user.notes?.length || 0})</h4>
                                                    <div className="max-h-24 overflow-y-auto space-y-1 pr-2">
                                                        {user.notes?.length > 0 ? user.notes.map((note: Note) => (
                                                            <div key={note.id} className="flex justify-between items-start p-1 bg-gray-100 dark:bg-gray-700/50 rounded">
                                                                <span className="truncate pr-2" title={note.title}>{note.title}</span>
                                                                <button onClick={() => deleteNoteForUser(user.id, note.id)} className="flex-shrink-0 text-red-500 hover:text-red-700"><Trash2 size={12}/></button>
                                                            </div>
                                                        )) : <p>No notes.</p>}
                                                    </div>
                                                </div>
                                                 <div><h4 className="font-semibold text-sm mb-2">Dreams ({user.dreams?.length || 0})</h4>
                                                    <div className="max-h-24 overflow-y-auto space-y-1 pr-2">
                                                        {user.dreams?.length > 0 ? user.dreams.map((dream: Dream) => (
                                                            <div key={dream.id} className="flex justify-between items-start p-1 bg-gray-100 dark:bg-gray-700/50 rounded">
                                                                 <span className="truncate pr-2" title={dream.text}>{dream.text}</span>
                                                                <button onClick={() => deleteDreamForUser(user.id, dream.id)} className="flex-shrink-0 text-red-500 hover:text-red-700"><Trash2 size={12}/></button>
                                                            </div>
                                                        )) : <p>No dreams.</p>}
                                                    </div>
                                                 </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                                <button onClick={() => handleExportCSV(user.id)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors text-xs">
                                                    <FileDown size={14} /> Export User Data
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        ))
                    }</div>
                )}
                {activeTab === 'posts' && (<div className="space-y-4">{stats.pendingPosts > 0 ? posts.filter((p: CommunityPost) => p.status === 'pending').map((post: CommunityPost) => (<div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex gap-4 items-center"><div><p className="font-semibold">{post.achievement.title}</p><p className="text-sm text-gray-500">by {post.username}</p></div><div className="ml-auto flex flex-col gap-2"><button onClick={() => approvePost(post.id)} className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-md text-sm"><CheckCircle size={16}/> Approve</button><button onClick={() => deletePost(post.id)} className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm"><XCircle size={16}/> Delete</button></div></div>)) : <p className="text-center text-gray-500 py-8">No posts are awaiting moderation.</p>}</div>)}
                {activeTab === 'queries' && (<div className="space-y-3">{queries.map((q: Query) => (<div key={q.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md"><div className="p-4"><p className="font-semibold">{q.username} <span className="text-xs text-gray-400">({new Date(q.createdAt).toLocaleString()})</span></p><p className="mt-2 text-gray-700 dark:text-gray-300">{q.queryText}</p>{q.status === 'answered' && <p className="mt-2 text-sm p-2 bg-indigo-500/10 rounded-md"><b>Response:</b> {q.responseText}</p>}<div className="flex items-center justify-end gap-2 mt-2"><button onClick={() => setExpandedItem(expandedItem === q.id ? null : q.id)} className="text-indigo-500 text-sm font-semibold">{expandedItem === q.id ? 'Cancel' : 'Reply'}</button><button onClick={() => deleteQuery(q.id)} className="text-red-500 text-sm font-semibold">Delete</button></div></div><AnimatePresence>{expandedItem === q.id && (<motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden"><div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2"><textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} className="w-full p-2 text-sm rounded bg-gray-100 dark:bg-gray-700" placeholder="Type your response..."></textarea><button onClick={() => { respondToQuery(q.id, responseText); setResponseText(''); setExpandedItem(null); }} className="p-2 bg-indigo-500 text-white rounded"><Send size={16}/></button></div></motion.div>)}</AnimatePresence></div>))}</div>)}
            </motion.div></AnimatePresence>
        </div>
    );
};
export default AdminPanel;