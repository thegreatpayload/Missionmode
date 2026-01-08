
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, KeyRound, Save } from 'lucide-react';
import type { User as UserType } from '../types';

interface ProfileModalProps {
    currentUser: UserType;
    onClose: () => void;
    onPasswordChange: (userId: string, currentPassword: string, newPassword: string) => { success: boolean; message: string };
}

const ProfileModal: React.FC<ProfileModalProps> = ({ currentUser, onClose, onPasswordChange }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        const result = onPasswordChange(currentUser.id, currentPassword, newPassword);
        if (result.success) {
            setSuccess(result.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(onClose, 2000); // Close modal after 2 seconds on success
        } else {
            setError(result.message);
        }
    };
    
    const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</label>
            <p className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md mt-1">{value}</p>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-3"><User /> My Profile</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <InfoField label="Full Name" value={currentUser.fullName} />
                        <InfoField label="Username" value={currentUser.username} />
                        <InfoField label="Email" value={currentUser.email} />
                        <InfoField label="Phone" value={currentUser.phone} />
                    </div>
                    
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><KeyRound /> Change Password</h3>
                    <form onSubmit={handleSubmit} className="space-y-3">
                         <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"/>
                         <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"/>
                         <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"/>
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {success && <p className="text-green-500 text-sm text-center">{success}</p>}
                        
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 rounded-md hover:bg-indigo-700 transition-colors text-lg">
                            <Save size={18} /> Update Password
                        </button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProfileModal;
