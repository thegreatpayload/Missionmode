import React, { useState } from 'react';
import type { User } from '../types';
// FIX: Import Variants to fix type error
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { User as UserIcon, Lock, ArrowLeft } from 'lucide-react';
import DigitalRain from './DigitalRain';
import Typewriter from './Typewriter';

const hashPassword = (password: string) => `hashed_${password}`;

interface AuthProps {
    onLogin: (user: User) => void;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    onBackToLanding: () => void;
}

const AuthInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }> = ({ icon, ...props }) => {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-cyan-300">
                {icon}
            </div>
            <input
                {...props}
                className="w-full pl-10 pr-3 py-3 bg-black/30 border border-cyan-300/30 rounded-md focus:ring-2 focus:ring-cyan-300 focus:border-cyan-300 focus:outline-none placeholder-gray-400 transition-all duration-300"
            />
        </div>
    );
};

const Auth: React.FC<AuthProps> = ({ onLogin, users, setUsers, onBackToLanding }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const validateSignup = () => {
        // Validation logic remains the same
        if (!fullName.trim() || !email.trim() || !phone.trim() || !username.trim() || !password.trim()) { setError("All fields are required."); return false; }
        if (!/^[^\s@]+@gmail\.com$/i.test(email)) { setError("Invalid Gmail address."); return false; }
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) { setError("Email already registered."); return false; }
        if (!/^\d{11}$/.test(phone)) { setError("Invalid 11-digit phone number."); return false; }
        if (users.some(u => u.phone === phone)) { setError("Phone number already registered."); return false; }
        if (users.some(u => u.username === username)) { setError("Username already taken."); return false; }
        if (username.toLowerCase() === 'admin') { setError("Cannot register as 'admin'."); return false; }
        if (!/^[a-zA-Z0-9]{8,15}$/.test(password)) { setError("Password must be 8-15 alphanumeric characters."); return false; }
        return true;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess(''); setIsLoading(true);

        setTimeout(() => { // Simulate network delay
            if (isLogin) {
                const user = users.find(u => u.username === username);
                if (user && user.passwordHash === hashPassword(password)) {
                    if (user.isBanned) { setError("ACCOUNT SUSPENDED."); setIsLoading(false); return; }
                    setShowSuccess(true);
                    setTimeout(() => onLogin(user), 4000); // Wait for typewriter
                } else {
                    setError("OPERATOR ID or SECURITY CODE invalid.");
                    setIsLoading(false);
                }
            } else {
                if (!validateSignup()) { setIsLoading(false); return; }
                const newUser: User = { id: self.crypto.randomUUID(), username, passwordHash: hashPassword(password), fullName, email, phone, hasChangedDefaultPassword: true, isBanned: false };
                setUsers([...users, newUser]);
                setSuccess("ACCOUNT CREATED. PROCEED TO LOGIN.");
                setIsLogin(true); setPassword(''); setIsLoading(false);
            }
        }, 1000);
    };

    // FIX: Add Variants type to fix type inference issue with transition properties.
    const cardVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8, y: 100 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15, delay: 0.2 } }
    };

    return (
        <motion.div 
            className="fixed inset-0 flex flex-col items-center justify-center p-4 overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <DigitalRain />
            <button onClick={onBackToLanding} className="absolute top-4 left-4 z-20 flex items-center gap-2 text-cyan-300 hover:text-white transition-colors">
                <ArrowLeft size={16} /> BACK
            </button>
            <AnimatePresence>
                {showSuccess ? (
                    <motion.div key="success" initial={{opacity:0}} animate={{opacity:1}} className="z-10 text-center">
                       <Typewriter 
                          lines={["SYSTEM INITIALIZING...", "OPERATOR AUTHORIZED...", "MISSION COMMENCING..."]}
                          className="text-2xl md:text-3xl font-orbitron text-green-400"
                       />
                    </motion.div>
                ) : (
                    <motion.div
                        key="auth-card"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative z-10 w-full max-w-md bg-black/50 backdrop-blur-md border border-cyan-300/30 rounded-lg p-8 space-y-6"
                    >
                        <h2 className="text-3xl font-orbitron text-center text-cyan-300 neon-text-blue/70">{isLogin ? 'OPERATOR LOGIN' : 'CREATE OPERATOR ID'}</h2>

                        <div className="flex border-b border-cyan-300/30">
                            <button onClick={() => { setIsLogin(true); setError(''); setSuccess('') }} className={`flex-1 py-2 font-semibold transition-colors ${isLogin ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400'}`}>LOGIN</button>
                            <button onClick={() => { setIsLogin(false); setError(''); setSuccess('') }} className={`flex-1 py-2 font-semibold transition-colors ${!isLogin ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400'}`}>SIGN UP</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <>
                                    <AuthInput icon={<UserIcon size={16} />} type="text" placeholder="FULL NAME" value={fullName} onChange={e => setFullName(e.target.value)} required />
                                    <AuthInput icon={<UserIcon size={16} />} type="email" placeholder="EMAIL (GMAIL)" value={email} onChange={e => setEmail(e.target.value)} required />
                                    <AuthInput icon={<UserIcon size={16} />} type="tel" placeholder="PHONE (11-DIGIT)" value={phone} onChange={e => setPhone(e.target.value)} required />
                                </>
                            )}
                            <AuthInput icon={<UserIcon size={16} />} type="text" placeholder="OPERATOR ID" value={username} onChange={e => setUsername(e.target.value)} required />
                            <AuthInput icon={<Lock size={16} />} type="password" placeholder="SECURITY CODE" value={password} onChange={e => setPassword(e.target.value)} required />

                            {error && <p className="text-red-400 text-sm text-center font-orbitron animate-flicker">{error}</p>}
                            {success && <p className="text-green-400 text-sm text-center font-orbitron">{success}</p>}

                            <button type="submit" className="w-full font-orbitron bg-cyan-500/80 text-black font-bold py-3 rounded-md hover:bg-cyan-400 hover:neon-border transition-all duration-300" disabled={isLoading}>
                                {isLoading ? 'PROCESSING...' : (isLogin ? 'ENGAGE' : 'REGISTER')}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Auth;
