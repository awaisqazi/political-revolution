import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { formatMoney } from '../utils/formatting';

interface FloatingTextInstance {
    id: number;
    amount: number;
    x: number;
    y: number;
}

interface FloatingTextProps {
    containerRef: React.RefObject<HTMLElement | null>;
}

export function useFloatingText() {
    const [instances, setInstances] = useState<FloatingTextInstance[]>([]);

    const spawn = useCallback((amount: number, x: number, y: number) => {
        const id = Date.now() + Math.random();
        setInstances(prev => [...prev, { id, amount, x, y }]);

        // Remove after animation
        setTimeout(() => {
            setInstances(prev => prev.filter(i => i.id !== id));
        }, 1000);
    }, []);

    return { instances, spawn };
}

export function FloatingText({ containerRef }: FloatingTextProps) {
    const [instances, setInstances] = useState<FloatingTextInstance[]>([]);

    // Expose spawn method via ref or callback
    const spawn = useCallback((amount: number, event: React.MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const id = Date.now() + Math.random();
        setInstances(prev => [...prev, { id, amount, x, y }]);

        // Remove after animation
        setTimeout(() => {
            setInstances(prev => prev.filter(i => i.id !== id));
        }, 1000);
    }, [containerRef]);

    // Attach spawn to container ref for external access
    if (containerRef.current) {
        (containerRef.current as HTMLElement & { spawnFloatingText?: typeof spawn }).spawnFloatingText = spawn;
    }

    return (
        <AnimatePresence>
            {instances.map(instance => (
                <motion.div
                    key={instance.id}
                    className="absolute pointer-events-none z-50 font-bold text-lg"
                    style={{
                        left: instance.x,
                        top: instance.y,
                        color: instance.amount > 0 ? '#22c55e' : '#ef4444',
                        textShadow: '0 0 10px rgba(34, 197, 94, 0.5), 0 2px 4px rgba(0,0,0,0.5)',
                    }}
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -50, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    +{formatMoney(instance.amount)}
                </motion.div>
            ))}
        </AnimatePresence>
    );
}

// Simplified version for direct usage
export function FloatingTextSimple({ amount, x, y, onComplete }: {
    amount: number;
    x: number;
    y: number;
    onComplete: () => void;
}) {
    return (
        <motion.div
            className="fixed pointer-events-none z-50 font-bold text-lg"
            style={{
                left: x,
                top: y,
                color: amount > 0 ? '#22c55e' : '#ef4444',
                textShadow: '0 0 10px rgba(34, 197, 94, 0.5), 0 2px 4px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -50, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            onAnimationComplete={onComplete}
        >
            +{formatMoney(amount)}
        </motion.div>
    );
}
