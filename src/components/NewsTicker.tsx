import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEffect, useState } from 'react';

// Ambient news headlines - random political satire
const AMBIENT_HEADLINES = [
    "📊 Polls show 99% of voters love free pizza",
    "🐕 Candidate spotted high-fiving a Golden Retriever",
    "☕ Local coffee shops report increase in 'political debates'",
    "📱 Viral TikTok shows grassroots campaign in action",
    "🎤 Town hall ends in spontaneous dance party",
    "🌳 City proposes planting trees in every parking lot",
    "📰 Breaking: Politicians agree that Tuesday is a day",
    "🗳️ Voter turnout expected to be 'higher than last Tuesday'",
    "🍕 Campaign promises free pizza Fridays for all",
    "📢 Local activist described as 'concerningly motivated'",
    "🏠 Neighborhood canvasser sets new door-knocking record",
    "✊ Grassroots movement gains momentum in local polls",
    "🎯 Campaign hits fundraising milestone ahead of schedule",
    "📋 New policy proposal described as 'actually readable'",
    "🤝 Historic bipartisan agreement on pizza toppings",
    "🌟 Young voters showing unprecedented engagement",
    "📈 Community organizing efforts show measurable impact",
    "🎪 Campaign rally features surprise celebrity endorsement",
    "💪 Volunteers report 'feeling the momentum'",
    "🗣️ Phone banking volunteer breaks personal record",
];

// Reactive headlines based on game events
const REACTIVE_HEADLINES: Record<string, string[]> = {
    'leafleting': [
        "📋 Flyer distribution reaches new neighborhoods",
        "🚶 Grassroots literature campaign expands reach",
    ],
    'phone-banking': [
        "📞 Phone banking calls flood local airwaves",
        "☎️ Campaign hotline reports record call volume",
    ],
    'farmers-market': [
        "🎪 Campaign booth draws crowds at farmers market",
        "🥕 Voters respond positively to fresh approach",
    ],
    'town-hall': [
        "🏛️ Town hall meeting draws standing-room crowd",
        "🎤 Community voices heard at local forum",
    ],
    'union-rally': [
        "✊ Workers rally behind progressive candidate",
        "🏭 Labor unions announce new endorsement",
    ],
    'bus-tour': [
        "🚌 Campaign bus tour hits the road",
        "🗺️ Multi-city campaign tour draws enthusiasm",
    ],
    'tiktok': [
        "📱 Campaign video goes viral on social media",
        "🎬 TikTok generation embraces grassroots message",
    ],
    'televised-debate': [
        "📺 Candidate delivers powerful debate performance",
        "💬 Key debate moments trend nationwide",
    ],
    'stadium-event': [
        "🏟️ Stadium rally breaks attendance records",
        "🎉 Massive turnout signals momentum shift",
    ],
    // Policies
    'comfy-sneakers': [
        "👟 Campaign invests in volunteer comfort",
    ],
    'auto-dialer': [
        "🤖 New phone technology boosts outreach",
    ],
    'union-endorsement': [
        "✊ Major union endorses campaign platform",
        "🏭 Labor movement backs progressive agenda",
    ],
};

export function NewsTicker() {
    const [headlines, setHeadlines] = useState<string[]>([]);
    const activeEvent = useStore(state => state.activeEvent);
    const unlockedPolicies = useStore(state => state.unlockedPolicies);
    const activities = useStore(state => state.activities);

    // Build headline list
    // Build headline list - ONLY when ownership changes
    const ownedActivitiesId = Object.entries(activities)
        .filter(([_, s]) => s.owned > 0)
        .map(([k]) => k)
        .sort()
        .join(',');

    const unlockedPoliciesId = unlockedPolicies.slice().sort().join(',');

    useEffect(() => {
        const newHeadlines: string[] = [];

        // Add reactive headlines for owned activities
        Object.entries(activities).forEach(([id, state]) => {
            if (state.owned > 0 && REACTIVE_HEADLINES[id]) {
                newHeadlines.push(...REACTIVE_HEADLINES[id]);
            }
        });

        // Add reactive headlines for unlocked policies
        unlockedPolicies.forEach(policyId => {
            if (REACTIVE_HEADLINES[policyId]) {
                newHeadlines.push(...REACTIVE_HEADLINES[policyId]);
            }
        });

        // Fill remaining with ambient headlines
        // Always maintain at least a decent buffer
        const remainingSlots = Math.max(10, 15 - newHeadlines.length);
        const shuffled = [...AMBIENT_HEADLINES].sort(() => Math.random() - 0.5);
        newHeadlines.push(...shuffled.slice(0, remainingSlots));

        // Shuffle once
        setHeadlines(newHeadlines.sort(() => Math.random() - 0.5));

        // Depend on stable string IDs, not the full objects
    }, [ownedActivitiesId, unlockedPoliciesId, activeEvent]);

    // Create doubled content for seamless loop
    const tickerContent = [...headlines, ...headlines].join('   •   ');

    return (
        <div className="bg-gradient-to-r from-blue-900/80 to-blue-800/80 border-b border-blue-600/30 overflow-hidden">
            <div className="relative py-2">
                {/* Breaking news label */}
                <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-red-600 px-3 text-white text-xs font-bold uppercase tracking-wider">
                    📰 Live
                </div>

                {/* Scrolling marquee */}
                <div className="ml-16 overflow-hidden">
                    <motion.div
                        key={headlines.length} // Force remount when headlines change
                        className="whitespace-nowrap text-sm text-blue-100"
                        animate={{
                            x: ['0%', '-50%'],
                        }}
                        transition={{
                            x: {
                                // ~40px per second - standard ticker speed
                                // Note: We only animate to -50%, so effective speed is halved relative to duration
                                duration: tickerContent.length * 0.005,
                                repeat: Infinity,
                                ease: 'linear',
                            },
                        }}
                    >
                        {tickerContent}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
