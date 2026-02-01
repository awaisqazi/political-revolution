import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { BuyMode } from '../store/useStore';

const MODE_LABELS: Record<BuyMode, string> = {
    'x1': 'Buy x1',
    'x10': 'Buy x10',
    'x100': 'Buy x100',
    'next': 'Buy Next',
    'max': 'Buy Max',
};

const MODE_COLORS: Record<BuyMode, string> = {
    'x1': 'from-blue-600 to-blue-500',
    'x10': 'from-indigo-600 to-indigo-500',
    'x100': 'from-purple-600 to-purple-500',
    'next': 'from-orange-600 to-orange-500',
    'max': 'from-emerald-600 to-emerald-500',
};

export function BuyModeToggle() {
    const buyMode = useStore(state => state.buyMode);
    const cycleBuyMode = useStore(state => state.cycleBuyMode);

    return (
        <motion.button
            onClick={cycleBuyMode}
            className={`px-4 py-2 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 bg-gradient-to-r ${MODE_COLORS[buyMode]}`}
            whileHover={{ scale: 1.05 }}
            title="Click to cycle: x1 → x10 → x100 → Next → Max"
        >
            <div className="flex items-center gap-2">
                <span>🛒</span>
                <span>{MODE_LABELS[buyMode]}</span>
                <motion.span
                    className="text-white/60 text-xs"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    ↻
                </motion.span>
            </div>
        </motion.button>
    );
}
