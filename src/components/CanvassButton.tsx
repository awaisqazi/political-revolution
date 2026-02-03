import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAudio } from '../hooks/useAudio';
import { MomentumBar } from './MomentumBar';
import { formatMoney } from '../utils/formatting';
import { calculateSkillEffects } from '../config/skills';
import { getMomentumMultiplier, VOLUNTEER_BONUS_PER } from '../config/gameConfig';
import { getMoraleMultiplier } from '../config/stages';
import { getPowerStructureMultiplier } from '../config/powerStructures';
import { getPolicyById } from '../config/policies';

interface FloatingNumber {
    id: number;
    value: number;
    x: number;
    y: number;
}

export function CanvassButton() {
    const canvass = useStore(state => state.canvass);
    const totalClicks = useStore(state => state.totalClicks);
    const popularity = useStore(state => state.popularity);
    const volunteers = useStore(state => state.volunteers);
    const momentum = useStore(state => state.momentum);
    const happiness = useStore(state => state.happiness);
    const unlockedPolicies = useStore(state => state.unlockedPolicies);
    const unlockedStructures = useStore(state => state.unlockedStructures);
    const unlockedSkills = useStore(state => state.unlockedSkills);

    const { play } = useAudio();
    const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);

    const handleCanvass = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        // Calculate actual click value with all multipliers
        const skillEffects = calculateSkillEffects(unlockedSkills);
        const momentumMultiplier = getMomentumMultiplier(momentum);
        const volunteerMultiplier = 1 + (volunteers * VOLUNTEER_BONUS_PER);
        const moraleMultiplier = getMoraleMultiplier(happiness);
        const structureMultiplier = getPowerStructureMultiplier(unlockedStructures);

        // Calculate global policy multiplier
        const globalPolicyMultiplier = unlockedPolicies.reduce((mult, policyId) => {
            const policy = getPolicyById(policyId);
            if (policy && policy.type === 'global') {
                return mult * policy.multiplier;
            }
            return mult;
        }, 1);

        const totalMultiplier = popularity * volunteerMultiplier * momentumMultiplier *
            globalPolicyMultiplier * structureMultiplier * moraleMultiplier;

        // Apply skill click value multiplier
        const clickValue = 1 * totalMultiplier * skillEffects.clickValueMult;

        // Spawn floating number at click position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const id = Date.now() + Math.random();
        setFloatingNumbers(prev => [...prev, { id, value: clickValue, x, y }]);

        // Remove after animation
        setTimeout(() => {
            setFloatingNumbers(prev => prev.filter(n => n.id !== id));
        }, 800);

        // Trigger the actual canvass action
        canvass();

        // Play sound effect
        play('canvass');
    }, [canvass, play, popularity, volunteers, momentum, happiness, unlockedPolicies, unlockedStructures, unlockedSkills]);

    return (
        <div id="canvass-button" className="glass-card p-6">
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
                onClick={handleCanvass}
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

                {/* Floating Numbers */}
                <AnimatePresence>
                    {floatingNumbers.map(num => (
                        <motion.div
                            key={num.id}
                            className="absolute pointer-events-none font-bold text-lg"
                            style={{
                                left: num.x,
                                top: num.y,
                                color: '#22c55e',
                                textShadow: '0 0 10px rgba(34, 197, 94, 0.6), 0 2px 4px rgba(0,0,0,0.5)',
                            }}
                            initial={{ opacity: 1, y: 0, scale: 1 }}
                            animate={{ opacity: 0, y: -40, scale: 1.3 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                        >
                            +{formatMoney(num.value)}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.button>

            {/* Click counter */}
            <div className="text-center mt-3 text-sm text-slate-500">
                {totalClicks.toLocaleString()} doors knocked
            </div>

            {/* Momentum Bar */}
            <div id="momentum-bar" className="mt-6">
                <MomentumBar />
            </div>
        </div>
    );
}

