import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { MomentumBar } from './MomentumBar';

export function CanvassButton() {
    const canvass = useStore(state => state.canvass);
    const totalClicks = useStore(state => state.totalClicks);

    return (
        <div className="glass-card p-6">
            {/* Header */}
            <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-slate-200">
                    The Power of One
                </h2>
                <p className="text-sm text-slate-400">
                    Your energy drives the movement forward
                </p>
            </div>

            {/* Canvass Button */}
            <motion.button
                onClick={canvass}
                className="w-full py-6 px-8 rounded-2xl font-bold text-xl text-white btn-press relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />

                {/* Button content */}
                <div className="relative flex items-center justify-center gap-3">
                    <span className="text-2xl">🚪</span>
                    <span>CANVASS NEIGHBOR</span>
                </div>

                {/* Ripple effect on click */}
                <motion.div
                    className="absolute inset-0 bg-white/20 rounded-2xl"
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 0, opacity: 0 }}
                    whileTap={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                />
            </motion.button>

            {/* Click counter */}
            <div className="text-center mt-3 text-sm text-slate-500">
                {totalClicks.toLocaleString()} doors knocked
            </div>

            {/* Momentum Bar */}
            <div className="mt-6">
                <MomentumBar />
            </div>
        </div>
    );
}
