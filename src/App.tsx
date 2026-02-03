import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameLoop } from './hooks/useGameLoop';
import { useNewsEvents } from './hooks/useNewsEvents';
import { useDilemmas } from './hooks/useDilemmas';
import { AudioProvider } from './hooks/useAudio';
import { useStore } from './store/useStore';
import { ACTIVITIES } from './config/activities';
import { STAGES } from './config/stages';
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
import { PowerStructureList } from './components/PowerStructureList';
import { RecruitmentModal } from './components/RecruitmentModal';
import { HappinessBar } from './components/HappinessBar';
import { StageIndicator } from './components/StageIndicator';
import { PolicyImpactModal } from './components/PolicyImpactModal';
import { UtopiaModal } from './components/UtopiaModal';
import { ResetGameModal } from './components/ResetGameModal';
import { SettingsModal } from './components/SettingsModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { DilemmaModal } from './components/DilemmaModal';
import { BackgroundLayer } from './components/BackgroundLayer';
import { ScrapbookModal } from './components/ScrapbookModal';
import { MemoryNotification } from './components/MemoryNotification';
import { DebateModal } from './components/DebateModal';
import { FloatingStats } from './components/FloatingStats';
import { SkillTreeModal } from './components/SkillTreeModal';
import { LevelUpNotification } from './components/LevelUpNotification';
import { XPBar } from './components/XPBar';

type TabType = 'activities' | 'policies' | 'capital' | 'log';

function App() {
  const [isPrestigeOpen, setIsPrestigeOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScrapbookOpen, setIsScrapbookOpen] = useState(false);
  const [isSkillTreeOpen, setIsSkillTreeOpen] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{ earnings: number; seconds: number } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('activities');
  const [showFloatingStats, setShowFloatingStats] = useState(false);

  const calculateOfflineProgress = useStore(state => state.calculateOfflineProgress);
  const currentRankId = useStore(state => state.currentRankId);
  const highestLifetimeEarnings = useStore(state => state.highestLifetimeEarnings);
  const volunteers = useStore(state => state.volunteers);
  const unlockedPolicies = useStore(state => state.unlockedPolicies);
  const activities = useStore(state => state.activities);
  const currentStageIndex = useStore(state => state.currentStageIndex);
  const runId = useStore(state => state.runId);
  const hardReset = useStore(state => state.hardReset);

  const currentRank = getRankById(currentRankId);
  const nextRank = getNextRank(currentRankId);
  const currentStage = STAGES[currentStageIndex];

  // Track stage changes for celebration effect
  const [showCelebration, setShowCelebration] = useState(false);
  const prevStageIndex = useRef(currentStageIndex);

  // Start game loops
  useGameLoop();
  useNewsEvents();
  useDilemmas();  // Phase 9: Interactive dilemmas

  // Stage promotion celebration effect
  useEffect(() => {
    if (currentStageIndex > prevStageIndex.current) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      prevStageIndex.current = currentStageIndex;
      return () => clearTimeout(timer);
    }
    prevStageIndex.current = currentStageIndex;
  }, [currentStageIndex]);

  // Check for offline progress on mount
  useEffect(() => {
    const progress = calculateOfflineProgress();
    if (progress.earnings > 0 && progress.seconds > 10) {
      setWelcomeData(progress);
    }
  }, [calculateOfflineProgress]);

  // Scroll detection for floating stats (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingStats(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { id: 'capital', label: 'Build Power', icon: '✊' },
    { id: 'log', label: 'Log', icon: '📋' },
  ];

  // Get stage-based color theme
  const getStageGradient = () => {
    switch (currentStage?.colorTheme) {
      case 'slate': return 'from-slate-600 to-slate-500';
      case 'blue': return 'from-blue-600 to-blue-500';
      case 'cyan': return 'from-cyan-600 to-cyan-500';
      case 'indigo': return 'from-indigo-600 to-indigo-500';
      case 'violet': return 'from-violet-600 to-violet-500';
      case 'purple': return 'from-purple-600 to-purple-500';
      case 'rose': return 'from-rose-600 to-rose-500';
      default: return 'from-blue-600 to-blue-500';
    }
  };

  return (
    <AudioProvider>
      <div className={`min-h-screen flex flex-col transition-colors duration-1000 ${currentStage?.backgroundStyle || 'bg-slate-900/50'}`}>
        <BackgroundLayer />
        {/* Stage Promotion Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Confetti particles */}
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ['#fbbf24', '#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981'][Math.floor(Math.random() * 6)],
                  }}
                  initial={{ y: -20, opacity: 1, rotate: 0, scale: Math.random() * 0.5 + 0.5 }}
                  animate={{
                    y: window.innerHeight + 100,
                    opacity: [1, 1, 0],
                    rotate: Math.random() * 720 - 360,
                    x: Math.random() * 200 - 100,
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    ease: 'easeOut',
                    delay: Math.random() * 0.5,
                  }}
                />
              ))}
              {/* Flash overlay */}
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* News Ticker - Top */}
        <NewsTicker />

        {/* Header with Rank & Stage */}
        <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl lg:text-3xl text-2xl">{currentStage?.emoji || currentRank?.emoji || '✊'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base lg:text-lg font-bold text-white leading-tight">
                      Political Revolution
                    </h1>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getStageGradient()} text-white`}>
                      {currentStage?.name}
                    </span>
                  </div>
                  {/* Rank info - simplified on mobile */}
                  <div className="hidden lg:flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-400">
                      {currentRank?.title || 'Concerned Neighbor'}
                    </span>
                    {nextRank && (
                      <span className="text-xs text-slate-500">
                        → {formatMoney(nextRank.threshold - highestLifetimeEarnings)} to {nextRank.title}
                      </span>
                    )}
                  </div>
                  {/* Compact rank on mobile */}
                  <div className="lg:hidden">
                    <span className="text-xs font-medium text-blue-400">
                      {currentRank?.title || 'Concerned Neighbor'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Skills Button */}
                <motion.button
                  onClick={() => setIsSkillTreeOpen(true)}
                  className="px-3 py-2 rounded-lg bg-amber-900/50 text-amber-400 hover:text-amber-300 hover:bg-amber-800/50 transition-colors border border-amber-700/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Skill Tree"
                >
                  🌳
                </motion.button>

                {/* Settings Button */}
                <motion.button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Settings"
                >
                  ⚙️
                </motion.button>

                {/* Scrapbook Button */}
                <motion.button
                  onClick={() => setIsScrapbookOpen(true)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Memories"
                >
                  📷
                </motion.button>

                <motion.button
                  onClick={() => setIsResetOpen(true)}
                  className="hidden lg:flex px-3 py-2 rounded-lg bg-rose-900/20 text-xs text-rose-300 hover:bg-rose-900/40 transition-colors border border-rose-800/30 items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Start a completely new game"
                >
                  🔥 New Game
                </motion.button>

                <motion.button
                  onClick={() => setIsPrestigeOpen(true)}
                  className="hidden lg:block px-4 py-2 rounded-lg bg-slate-800 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📦 Run Again
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        {/* Floating Stats Pill - Mobile only, shows when scrolled */}
        <FloatingStats isVisible={showFloatingStats} />

        {/* Main Dashboard - 3 Columns on Desktop */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-4 pb-32 lg:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT COLUMN - The Candidate */}
            <div className="lg:col-span-3 space-y-4">
              {/* XP Bar - Clickable to open Skill Tree */}
              <XPBar onOpenSkillTree={() => setIsSkillTreeOpen(true)} />

              <StatsDisplay />
              <HappinessBar />
              <CanvassButton />

              {/* Stage Indicator */}
              <StageIndicator />

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
              <div className="hidden lg:flex gap-1 p-1 bg-slate-800/50 rounded-xl">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    id={index === 0 ? 'outreach-tab' : index === 1 ? 'policies-tab' : undefined}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                      ? tab.id === 'capital'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
                        : 'bg-blue-600 text-white shadow-lg'
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
                    {/* Buy Mode Toggle - Desktop only (mobile has floating version) */}
                    <div className="hidden lg:flex justify-end mb-4">
                      <BuyModeToggle />
                    </div>

                    <div className="grid gap-3 lg:gap-4 sm:grid-cols-2">
                      {ACTIVITIES.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          id={index === 0 ? 'first-activity' : undefined}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
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

                {activeTab === 'capital' && (
                  <motion.div
                    key="capital"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <PowerStructureList />
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
            <div key={`run-${runId}`} className="hidden lg:block lg:col-span-3 space-y-4">
              {/* Rank Progress */}
              <div id="career-progress" className="glass-card p-4">
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

        {/* Floating Buy Mode Toggle - Mobile only */}
        <div className="lg:hidden fixed bottom-16 right-4 z-30">
          <BuyModeToggle />
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

        {/* Phase 9: Political Dilemmas */}
        <DilemmaModal />

        {/* Phase 11: Debate Battles */}
        <DebateModal />

        {/* Milestone Notifications */}
        <UnlockNotification />

        {/* Recruitment Drive Mini-Game */}
        <RecruitmentModal />

        {/* Policy Impact Modal */}
        <PolicyImpactModal />

        {/* Utopia Victory Modal */}
        <UtopiaModal />
        <ResetGameModal
          isOpen={isResetOpen}
          onClose={() => setIsResetOpen(false)}
          onConfirm={hardReset}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Tutorial Overlay */}
        <TutorialOverlay />

        <ScrapbookModal
          isOpen={isScrapbookOpen}
          onClose={() => setIsScrapbookOpen(false)}
        />

        {/* Memory Notification */}
        <MemoryNotification />

        {/* Skill Tree Modal */}
        <SkillTreeModal
          isOpen={isSkillTreeOpen}
          onClose={() => setIsSkillTreeOpen(false)}
        />

        {/* Level Up Notification */}
        <LevelUpNotification />
      </div>
    </AudioProvider>
  );
}

export default App;
