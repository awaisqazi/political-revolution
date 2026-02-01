import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

const IMAGES = [
    '/images/bg-city.jpg',
    '/images/bg-state.jpg',
    '/images/bg-national.jpg',
];

export const BackgroundLayer = () => {
    const currentStageIndex = useStore((state) => state.currentStageIndex);

    // Safe fallback if index is out of bounds
    const imageIndex = Math.min(currentStageIndex, IMAGES.length - 1);
    const currentImage = IMAGES[imageIndex];

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-black">
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Main Image */}
                    <img
                        src={currentImage}
                        alt="background"
                        className="w-full h-full object-cover"
                    />

                    {/* Dark Overlay for Readability */}
                    <div className="absolute inset-0 bg-black/60 pointer-events-none" />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
