
import React, { useRef, useCallback, useMemo } from 'react';
import { Download, Award, Clock } from 'lucide-react';
import type { Achievement } from '../types';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

interface CertificateProps {
    achievement: Achievement;
    username: string;
}

const calculateDuration = (start: string, end: string): string => {
    let startDate = new Date(start);
    let endDate = new Date(end);
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    if (days < 0) {
        months--;
        const prevMonthLastDay = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
        days += prevMonthLastDay;
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days > 0 || (years === 0 && months === 0)) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    return parts.join(', ');
};

const Certificate: React.FC<CertificateProps> = ({ achievement, username }) => {
    const achievementDate = new Date(achievement.date);
    const certificateRef = useRef<HTMLDivElement>(null);

    const missionDuration = useMemo(() => {
        if (achievement.type === 'dream' && achievement.createdAt) {
            return calculateDuration(achievement.createdAt, achievement.date);
        }
        return null;
    }, [achievement]);

    const handleDownloadJpg = useCallback(() => {
        if (certificateRef.current) {
            toJpeg(certificateRef.current, { quality: 1.0, pixelRatio: 3 })
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.download = `Certificate-${username}-${achievement.id.substring(0,6)}.jpg`;
                    link.href = dataUrl;
                    link.click();
                })
                .catch(err => console.error("Failed to generate JPG", err));
        }
    }, [username, achievement.id]);
    
    const handleDownloadPdf = useCallback(() => {
        if (certificateRef.current) {
             toJpeg(certificateRef.current, { quality: 1.0, pixelRatio: 3 })
                .then((dataUrl) => {
                    const pdf = new jsPDF('landscape', 'pt', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const certRatio = 4 / 3;
                    let certWidth = pdfWidth;
                    let certHeight = pdfWidth / certRatio;

                    if (certHeight > pdfHeight) {
                        certHeight = pdfHeight;
                        certWidth = pdfHeight * certRatio;
                    }
                    
                    const x = (pdfWidth - certWidth) / 2;
                    const y = (pdfHeight - certHeight) / 2;
                    
                    pdf.addImage(dataUrl, 'JPEG', x, y, certWidth, certHeight);
                    pdf.save(`Certificate-${username}-${achievement.id.substring(0,6)}.pdf`);
                })
                .catch(err => console.error("Failed to generate PDF", err));
        }
    }, [username, achievement.id]);

    return (
        <div className="relative group shadow-2xl">
            <div ref={certificateRef} className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 aspect-[4/3] p-2 relative font-serif">
                <div className="w-full h-full p-4 border-2 border-yellow-700/80 dark:border-yellow-500/80 flex flex-col relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 dark:opacity-[0.02]">
                        <Award size={200} className="text-yellow-500" />
                    </div>
                    <div className="text-center z-10">
                        <h1 className="text-3xl font-bold tracking-wider">CERTIFICATE of ACHIEVEMENT</h1>
                        <p className="text-sm tracking-widest mt-1">PROUDLY PRESENTED TO</p>
                    </div>

                    <div className="flex-grow flex flex-col items-center justify-center text-center z-10">
                        <p className="text-5xl font-extrabold font-sans text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 my-4">{username}</p>
                        <p className="max-w-md mx-auto">
                            In recognition of their outstanding dedication and perseverance in successfully completing the mission:
                        </p>
                        <p className="font-semibold text-lg mt-2 text-gray-700 dark:text-gray-300">"{achievement.title}"</p>
                    </div>

                    <div className="flex justify-between items-end z-10">
                        <div className="text-center">
                            <p className="font-semibold">{achievementDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            <hr className="border-gray-600 dark:border-gray-400 mt-1"/>
                            <p className="text-xs">Date</p>
                        </div>
                        {missionDuration && (
                             <div className="text-center">
                                <p className="font-semibold flex items-center gap-1.5"><Clock size={14}/> {missionDuration}</p>
                                <hr className="border-gray-600 dark:border-gray-400 mt-1"/>
                                <p className="text-xs">Mission Duration</p>
                            </div>
                        )}
                        <div className="text-center">
                             <p className="text-2xl italic" style={{fontFamily: "'Brush Script MT', cursive"}}>Mission Control</p>
                            <hr className="border-gray-600 dark:border-gray-400 mt-1"/>
                            <p className="text-xs">Signature</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button onClick={handleDownloadJpg} className="flex items-center gap-2 px-4 py-2 bg-white/90 text-black font-semibold rounded-lg hover:bg-white">
                    <Download size={16}/> JPG
                </button>
                 <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-white/90 text-black font-semibold rounded-lg hover:bg-white">
                    <Download size={16}/> PDF
                </button>
            </div>
        </div>
    );
};

export default Certificate;