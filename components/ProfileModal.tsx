
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, User, KeyRound, Save, Database, Download, Upload } from 'lucide-react';
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
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    const handleBackup = () => {
        const backupData: { [key: string]: string } = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('mission-mode-')) {
                backupData[key] = localStorage.getItem(key)!;
            }
        }
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.download = `mission-mode-backup-${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setSuccess('Backup downloaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error('Invalid file format');
                
                const restoredData = JSON.parse(text);
                
                const isValid = Object.keys(restoredData).every(key => key.startsWith('mission-mode-'));
                if (!isValid || Object.keys(restoredData).length === 0) {
                    throw new Error('This does not appear to be a valid Mission Mode backup file.');
                }

                if (window.confirm('Are you sure you want to restore? This will overwrite all your current data.')) {
                    const keysToRemove: string[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith('mission-mode-')) {
                            keysToRemove.push(key);
                        }
                    }
                    keysToRemove.forEach(key => localStorage.removeItem(key));

                    for (const key in restoredData) {
                        localStorage.setItem(key, restoredData[key]);
                    }

                    alert('Restore successful! The application will now reload.');
                    window.location.reload();
                }
            } catch (err: any) {
                setError(err.message || 'Failed to parse backup file.');
            } finally {
                if(fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
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
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold flex items-center gap-3"><User /> My Profile</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(100vh-150px)]">
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

                     <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Database /> Data Management</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Save your entire Mission Mode setup to a file or restore from a previous backup. This is useful for transferring data between browsers or as a failsafe.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleBackup}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <Download size={16}/> Backup All Data
                            </button>
                            <button
                                onClick={handleRestoreClick}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                            >
                                <Upload size={16}/> Restore from Backup
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".json"
                            className="hidden"
                        />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProfileModal;
