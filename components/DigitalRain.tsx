
import React, { useRef, useEffect } from 'react';

const DigitalRain: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();

        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/?;:"|[]{}=+-_()*&^%$#@!~`';
        const columns = Math.floor(canvas.width / 20);
        const drops = Array.from({ length: columns }).map(() => 1);
        const colors = ['#00bfff', '#00ffff', '#7fffd4', '#0ff'];

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.font = '16px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * 20, drops[i] * 20);

                if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const animate = () => {
            draw();
            animationFrameId = window.requestAnimationFrame(animate);
        };
        animate();

        window.addEventListener('resize', resizeCanvas);
        
        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />;
};

export default DigitalRain;
