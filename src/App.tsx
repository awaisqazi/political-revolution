import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameLoop } from './hooks/useGameLoop';
import { useNewsEvents } from './hooks/useNewsEvents';
import { ACTIVITIES } from './config/activities';
import { CanvassButton } from './components/CanvassButton';
import { StatsDisplay } from './components/StatsDisplay';
import { ActivityCard } from './components/ActivityCard';
import { PrestigeModal } from './components/PrestigeModal';
import { NewsEvent } from './components/NewsEvent';

function App() {
  const [isPrestigeOpen, setIsPrestigeOpen] = useState(false);

  // Start game loops
  useGameLoop();
  useNewsEvents();

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✊</span>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">
                  Political Revolution
                </h1>
                <p className="text-xs text-slate-400">
                  The Power of One
                </p>
              </div>
            </div>

            <motion.button
              onClick={() => setIsPrestigeOpen(true)}
              className="px-3 py-2 rounded-lg bg-slate-800 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🗳️ Run Again
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <StatsDisplay />

        {/* Canvass Section */}
        <CanvassButton />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          <span className="text-sm text-slate-500 uppercase tracking-wider">
            Outreach Programs
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>

        {/* Activities Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {ACTIVITIES.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ActivityCard activity={activity} />
            </motion.div>
          ))}
        </div>
      </main>

      {/* Modals */}
      <PrestigeModal
        isOpen={isPrestigeOpen}
        onClose={() => setIsPrestigeOpen(false)}
      />

      {/* News Events */}
      <NewsEvent />
    </div>
  );
}

export default App;
