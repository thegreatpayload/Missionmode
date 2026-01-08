
import React, { useState, useEffect } from 'react';

interface TypewriterProps {
    lines: string[];
    className?: string;
}

const Typewriter: React.FC<TypewriterProps> = ({ lines, className }) => {
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (currentLineIndex >= lines.length) return;

        const currentLine = lines[currentLineIndex];

        const handleTyping = () => {
            setDisplayedText(currentLine.substring(0, displayedText.length + 1));
        };

        if (displayedText.length === currentLine.length) {
            // Finished typing the line, pause then move to next
            setTimeout(() => {
                setCurrentLineIndex(currentLineIndex + 1);
                setDisplayedText('');
            }, 1000); // Pause before next line
            return;
        }

        const timeoutId = setTimeout(handleTyping, 100); // Typing speed
        return () => clearTimeout(timeoutId);

    }, [displayedText, lines, currentLineIndex]);

    return (
        <p className={className}>
            {displayedText}
            <span className="animate-flicker">_</span>
        </p>
    );
};

export default Typewriter;
