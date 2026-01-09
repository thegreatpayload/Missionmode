
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, BrainCircuit, Clock } from 'lucide-react';
import type { CommunityPost, User, Achievement } from '../types';
import Certificate from './Certificate';

interface CommunityProps {
    currentUser: User;
    posts: CommunityPost[];
    setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
    achievements: Achievement[];
    onAchievementsUpdate: (achievements: Achievement[]) => void;
}

type SortBy = 'date' | 'likes';

const SortButton: React.FC<{
    currentSort: SortBy;
    sortValue: SortBy;
    setSort: (sortBy: SortBy) => void;
    label: string;
    icon: React.ReactNode;
}> = ({ currentSort, sortValue, setSort, label, icon }) => (
    <button
        onClick={() => setSort(sortValue)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            currentSort === sortValue
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
    >
        {icon}
        {label}
    </button>
);

const Community: React.FC<CommunityProps> = ({ currentUser, posts, setPosts, achievements, onAchievementsUpdate }) => {
    const [selectedAchievementId, setSelectedAchievementId] = useState<string>('');
    const [animatingLikeId, setAnimatingLikeId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortBy>('date');

    const unpostedAchievements = achievements.filter(a => !a.isPosted);

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAchievementId) {
            alert("Please select an achievement to share.");
            return;
        }

        const achievement = achievements.find(a => a.id === selectedAchievementId);
        if (!achievement) return;

        const newPost: CommunityPost = {
            id: self.crypto.randomUUID(),
            userId: currentUser.id,
            username: currentUser.username,
            achievement: achievement,
            createdAt: new Date().toISOString(),
            likes: [],
            status: 'pending',
        };

        setPosts(prev => [newPost, ...prev]);
        onAchievementsUpdate(achievements.map(a => a.id === selectedAchievementId ? { ...a, isPosted: true } : a));
        
        setSelectedAchievementId('');
    };
    
    const handleLike = (postId: string) => {
        setPosts(posts.map(p => {
            if (p.id === postId) {
                const isLiked = p.likes.includes(currentUser.id);
                const newLikes = isLiked
                    ? p.likes.filter(id => id !== currentUser.id)
                    : [...p.likes, currentUser.id];
                return { ...p, likes: newLikes };
            }
            return p;
        }));
    };

    const handleDoubleClickLike = (postId: string) => {
        setAnimatingLikeId(postId);
        setTimeout(() => setAnimatingLikeId(null), 1000);

        // Only add a like via double tap, don't toggle.
        setPosts(posts.map(p => {
            if (p.id === postId && !p.likes.includes(currentUser.id)) {
                return { ...p, likes: [...p.likes, currentUser.id] };
            }
            return p;
        }));
    };

    const sortedPosts = useMemo(() => {
        const approvedPosts = posts.filter(p => p.status === 'approved');
        const postsToSort = [...approvedPosts];
        if (sortBy === 'likes') {
            postsToSort.sort((a, b) => b.likes.length - a.likes.length);
        } else { // 'date'
            postsToSort.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return postsToSort;
    }, [posts, sortBy]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg sticky top-24">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BrainCircuit /> Share Your Success</h2>
                    {unpostedAchievements.length > 0 && !currentUser.isBanned ? (
                        <form onSubmit={handlePost} className="space-y-4">
                            <select value={selectedAchievementId} onChange={e => setSelectedAchievementId(e.target.value)} className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                <option value="">Select an achievement to post</option>
                                {unpostedAchievements.map(ach => <option key={ach.id} value={ach.id}>{ach.title}</option>)}
                            </select>

                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400" disabled={!selectedAchievementId}>
                                <Send size={16}/> Submit for Review
                            </button>
                        </form>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                            {currentUser.isBanned ? "Your account is suspended from posting." : "Achieve a dream to post it here!"}
                        </p>
                    )}
                </div>
            </div>
            <div className="lg:col-span-2">
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Community Feed</h2>
                    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <SortButton currentSort={sortBy} sortValue="date" setSort={setSortBy} label="Newest" icon={<Clock size={14}/>} />
                        <SortButton currentSort={sortBy} sortValue="likes" setSort={setSortBy} label="Most Liked" icon={<Heart size={14}/>} />
                    </div>
                </div>
                <div className="space-y-8">
                    {sortedPosts.map(post => (
                        <motion.div 
                            key={post.id} 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden relative"
                            onDoubleClick={() => handleDoubleClickLike(post.id)}
                        >
                            <AnimatePresence>
                                {animatingLikeId === post.id && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 1.2, opacity: 0, transition: { duration: 0.3 } }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                                    >
                                        <Heart
                                            size={120}
                                            className="text-red-500 drop-shadow-lg"
                                            fill="currentColor"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            <Certificate achievement={post.achievement} username={post.username} />
                            
                            <div className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{post.username}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Posted on {new Date(post.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => handleLike(post.id)} disabled={currentUser.isBanned} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 disabled:cursor-not-allowed px-3 py-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors">
                                    <Heart size={20} className={post.likes.includes(currentUser.id) ? 'text-red-500 fill-current' : ''} />
                                    {post.likes.length}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {sortedPosts.length === 0 && <p className="text-center text-gray-500 py-16">The community feed is empty. Be the first to share an achievement!</p>}
                </div>
            </div>
        </div>
    );
};

export default Community;
