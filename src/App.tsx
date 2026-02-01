import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameLoop } from './hooks/useGameLoop';
import { useNewsEvents } from './hooks/useNewsEvents';
import { useStore } from './store/useStore';
import { ACTIVITIES } from './config/activities';
import { getRankById, getNextRank } from './config/ranks';
import { formatMoney } from './utils/formatting';
import { CanvassButton } from './components/CanvassButton';
import { StatsDisplay } from './components/StatsDisplay';
import { ActivityCard } from './components/ActivityCard';
import { PrestigeModal } from './components/PrestigeModal';
import { NewsEvent } from './components/NewsEvent';
import { PolicyList } from './components/PolicyList';
import { WelcomeModal } from './components/WelcomeModal';
import { NewsTicker } from './components/NewsTicker';
import { UnlockNotification } from './components/UnlockNotification';
import { BuyModeToggle } from './components/BuyModeToggle';

type TabType = 'activities' | 'policies' | 'log';

function App() {
  const [isPrestigeOpen, setIsPrestigeOpen] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{ earnings: number; seconds: number } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('activities');

  const calculateOfflineProgress = useStore(state => state.calculateOfflineProgress);
  const currentRankId = useStore(state => state.currentRankId);
  const highestLifetimeEarnings = useStore(state => state.highestLifetimeEarnings);
  const volunteers = useStore(state => state.volunteers);
  const unlockedPolicies = useStore(state => state.unlockedPolicies);
  const activities = useStore(state => state.activities);

  const currentRank = getRankById(currentRankId);
  const nextRank = getNextRank(currentRankId);

  // Start game loops
  useGameLoop();
  useNewsEvents();

  // Check for offline progress on mount
  useEffect(() => {
    const progress = calculateOfflineProgress();
    if (progress.earnings > 0 && progress.seconds > 10) {
      setWelcomeData(progress);
    }
  }, [calculateOfflineProgress]);

  // Calculate campaign log entries
  const logEntries: string[] = [];
  Object.entries(activities).forEach(([id, state]) => {
    if (state.owned > 0) {
      const activity = ACTIVITIES.find(a => a.id === id);
      if (activity) logEntries.push(`${activity.emoji} ${activity.name} x${state.owned}`);
    }
  });
  unlockedPolicies.forEach(policyId => {
    logEntries.push(`📜 ${policyId.replace(/-/g, ' ')}`);
  });

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'activities', label: 'Outreach', icon: '📢' },
    { id: 'policies', label: 'Policies', icon: '📜' },
    { id: 'log', label: 'Log', icon: '📋' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* News Ticker - Top */}
      <NewsTicker />

      {/* Header with Rank */}
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentRank?.emoji || '✊'}</span>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">
                  Political Revolution
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-400">
                    {currentRank?.title || 'Concerned Neighbor'}
                  </span>
                  {nextRank && (
                    <span className="text-xs text-slate-500">
                      → {formatMoney(nextRank.threshold - highestLifetimeEarnings)} to {nextRank.title}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <motion.button
              onClick={() => setIsPrestigeOpen(true)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🗳️ Run Again
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Dashboard - 3 Columns on Desktop */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN - The Candidate */}
          <div className="lg:col-span-3 space-y-4">
            <StatsDisplay />
            <CanvassButton />

            {/* Volunteers Card */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Volunteers</span>
                <span className="text-lg font-bold text-emerald-400">{volunteers}</span>
              </div>
              <p className="text-xs text-slate-500">
                {volunteers > 0
                  ? `+${(volunteers * 5).toFixed(0)}% revenue bonus`
                  : 'Prestige to earn volunteers'
                }
              </p>
            </div>

            {/* Prestige Button - Desktop */}
            <div className="hidden lg:block">
              <motion.button
                onClick={() => setIsPrestigeOpen(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-sm hover:from-purple-500 hover:to-pink-500 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🗳️ Run Again (Prestige)
              </motion.button>
            </div>
          </div>

          {/* CENTER COLUMN - Strategy (Activities/Policies) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'activities' && (
                <motion.div
                  key="activities"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Buy Mode Toggle */}
                  <div className="flex justify-end mb-4">
                    <BuyModeToggle />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {ACTIVITIES.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <ActivityCard activity={activity} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'policies' && (
                <motion.div
                  key="policies"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <PolicyList />
                </motion.div>
              )}

              {activeTab === 'log' && (
                <motion.div
                  key="log"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-4"
                >
                  <h3 className="text-lg font-semibold text-white mb-3">📋 Campaign Log</h3>
                  {logEntries.length === 0 ? (
                    <p className="text-sm text-slate-500">Nothing yet. Start campaigning!</p>
                  ) : (
                    <ul className="space-y-2">
                      {logEntries.map((entry, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          {entry}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN - Info/History (Desktop only) */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Rank Progress */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">🎖️ Career Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-blue-400">{currentRank?.title}</span>
                    <span className="text-slate-400">{currentRank?.emoji}</span>
                  </div>
                  <p className="text-xs text-slate-500 italic">"{currentRank?.flavorText}"</p>
                </div>
                {nextRank && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Next: {nextRank.title}</span>
                      <span>{formatMoney(nextRank.threshold)}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (highestLifetimeEarnings / nextRank.threshold) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">📊 Campaign Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Raised</span>
                  <span className="text-emerald-400 font-medium">{formatMoney(highestLifetimeEarnings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Volunteers</span>
                  <span className="text-blue-400 font-medium">{volunteers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Policies Passed</span>
                  <span className="text-purple-400 font-medium">{unlockedPolicies.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Programs Active</span>
                  <span className="text-amber-400 font-medium">
                    {Object.values(activities).filter(a => a.owned > 0).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Campaign Log - Desktop */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">📋 Recent Activity</h3>
              {logEntries.length === 0 ? (
                <p className="text-xs text-slate-500">Nothing yet...</p>
              ) : (
                <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                  {logEntries.slice(0, 8).map((entry, i) => (
                    <li key={i} className="text-xs text-slate-400">
                      {entry}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-4 py-2">
        <div className="flex gap-1 max-w-md mx-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400'
                }`}
            >
              <div className="text-lg">{tab.icon}</div>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <PrestigeModal
        isOpen={isPrestigeOpen}
        onClose={() => setIsPrestigeOpen(false)}
      />

      <WelcomeModal
        isOpen={welcomeData !== null}
        earnings={welcomeData?.earnings ?? 0}
        seconds={welcomeData?.seconds ?? 0}
        onClose={() => setWelcomeData(null)}
      />

      {/* News Events */}
      <NewsEvent />

      {/* Milestone Notifications */}
      <UnlockNotification />
    </div>
  );
}

export default App;
