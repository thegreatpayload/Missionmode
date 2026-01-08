import React from 'react';
// FIX: Import Variants to fix type error
import { motion, Variants } from 'framer-motion';
import DigitalRain from './DigitalRain';

interface LandingProps {
    onGetStarted: () => void;
}

// FIX: Add Variants type to fix type inference issue with transition properties.
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
            delayChildren: 0.2,
        },
    },
    exit: {
        opacity: 0,
        y: -50,
        transition: { duration: 0.5 }
    }
};

// FIX: Add Variants type to fix type inference issue with transition properties.
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};


const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
    return (
        <motion.div 
            className="fixed inset-0 flex flex-col items-center justify-center p-4 overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <DigitalRain />
            <div className="absolute inset-0 bg-black/50"></div>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] border-2 border-cyan-300/20 rounded-full animate-pulse" />
                <div className="absolute w-[400px] h-[400px] md:w-[700px] md:h-[700px] border border-cyan-300/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <motion.div variants={itemVariants} className="relative z-10 text-center">
                <h1 className="text-5xl md:text-8xl font-black font-orbitron tracking-widest text-cyan-300 neon-text-blue">
                    MISSION MODE
                </h1>
                <p className="text-3xl md:text-5xl font-bold font-orbitron text-white mt-2 animate-flicker">ON</p>
            </motion.div>

            <motion.div variants={itemVariants} className="relative z-10 mt-12">
                 <button 
                    onClick={onGetStarted}
                    className="text-2xl font-orbitron font-bold px-10 py-4 border-2 border-cyan-300 text-cyan-300 bg-black/50 rounded-sm relative overflow-hidden
                               hover:bg-cyan-400 hover:text-black transition-all duration-300 ease-in-out glitch-hover group"
                    data-text="GET STARTED"
                >
                     <span className="absolute left-0 top-0 h-full w-1 bg-cyan-300 animate-hud-scan group-hover:bg-cyan-800"></span>
                     GET STARTED
                 </button>
            </motion.div>
        </motion.div>
    );
};

export default Landing;
