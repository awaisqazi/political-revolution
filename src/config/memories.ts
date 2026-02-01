import type { GameState } from '../store/useStore';

export interface Memory {
    id: string;
    title: string;
    description: string; // Added description for more flavor
    img: string;
    trigger: (state: GameState) => boolean;
}

export const MEMORIES: Memory[] = [
    {
        id: 'spark',
        title: 'The Beginning',
        description: 'Ten people in a basement. It starts here.',
        img: '/images/memory-spark.jpg',
        trigger: (s) => s.volunteers >= 10
    },
    {
        id: 'victory',
        title: 'First Win',
        description: 'The crowd goes wild. We actually did it.',
        img: '/images/memory-victory.jpg',
        trigger: (s) => s.currentStageIndex > 0
    },
    {
        id: 'utopia',
        title: 'A New World',
        description: 'The future we fought for is finally here.',
        img: '/images/memory-utopia.jpg',
        trigger: (s) => s.happiness >= 100 && s.currentStageIndex === 2 // Utopia condition
    }
];
