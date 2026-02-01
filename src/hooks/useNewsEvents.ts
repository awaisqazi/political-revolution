import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

interface NewsEventTemplate {
    title: string;
    description: string;
    popularityChange: number;
    weight: number; // Higher = more likely
}

const POSITIVE_EVENTS: NewsEventTemplate[] = [
    {
        title: '🎉 Celebrity Endorsement!',
        description: 'A major celebrity endorsed your campaign on social media!',
        popularityChange: 0.15,
        weight: 10,
    },
    {
        title: '📰 Positive Press Coverage',
        description: 'The local paper ran a glowing story about your grassroots efforts.',
        popularityChange: 0.1,
        weight: 20,
    },
    {
        title: '✊ Union Backing',
        description: 'A major union has officially endorsed your campaign!',
        popularityChange: 0.12,
        weight: 15,
    },
    {
        title: '🎓 Student Movement',
        description: 'College students across the state are organizing for your cause.',
        popularityChange: 0.08,
        weight: 25,
    },
    {
        title: '💬 Viral Debate Moment',
        description: 'Your quote is trending! The people love your authenticity.',
        popularityChange: 0.2,
        weight: 5,
    },
];

const NEGATIVE_EVENTS: NewsEventTemplate[] = [
    {
        title: '😬 Campaign Misstep',
        description: 'A staff member made an embarrassing statement to the press.',
        popularityChange: -0.08,
        weight: 20,
    },
    {
        title: '📉 Negative Poll Released',
        description: 'A new poll shows you trailing. Time to work harder!',
        popularityChange: -0.05,
        weight: 25,
    },
    {
        title: '🗞️ Attack Ad Campaign',
        description: 'Opposition launched attack ads against you.',
        popularityChange: -0.1,
        weight: 15,
    },
    {
        title: '⚡ Controversy',
        description: 'An old quote resurfaced and is being taken out of context.',
        popularityChange: -0.12,
        weight: 10,
    },
];

function weightedRandom<T extends { weight: number }>(items: T[]): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
        random -= item.weight;
        if (random <= 0) return item;
    }

    return items[items.length - 1];
}

export function useNewsEvents() {
    const triggerEvent = useStore(state => state.triggerEvent);
    const activeEvent = useStore(state => state.activeEvent);
    const lifetimeEarnings = useStore(state => state.lifetimeEarnings);
    const lastEventTime = useRef<number>(Date.now());

    useEffect(() => {
        // Only start events after some progress
        if (lifetimeEarnings < 100) return;

        const interval = setInterval(() => {
            // Don't trigger if there's already an active event
            if (activeEvent) return;

            // Random chance every 30-60 seconds
            const timeSinceLastEvent = Date.now() - lastEventTime.current;
            if (timeSinceLastEvent < 30000) return;

            // 20% chance every check (every 5 seconds)
            if (Math.random() > 0.2) return;

            // 60% positive, 40% negative
            const isPositive = Math.random() < 0.6;
            const eventPool = isPositive ? POSITIVE_EVENTS : NEGATIVE_EVENTS;
            const event = weightedRandom(eventPool);

            triggerEvent({
                title: event.title,
                description: event.description,
                popularityChange: event.popularityChange,
            });

            lastEventTime.current = Date.now();
        }, 5000);

        return () => clearInterval(interval);
    }, [triggerEvent, activeEvent, lifetimeEarnings]);
}
