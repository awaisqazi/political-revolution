import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';
import { useStore } from '../store/useStore';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { muted, toggle } = useAudio();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [importData, setImportData] = useState('');
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get the raw save data from localStorage
    const getSaveData = (): string => {
        const data = localStorage.getItem('political-revolution-save');
        if (!data) return '{}';
        try {
            return JSON.stringify(JSON.parse(data), null, 2);
        } catch {
            return data;
        }
    };

    // Download save as file
    const handleDownload = () => {
        const data = getSaveData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `political-revolution-save-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Copy save to clipboard
    const handleCopy = async () => {
        const data = getSaveData();
        await navigator.clipboard.writeText(data);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Import save data
    const handleImport = async () => {
        setImportError(null);
        setImportSuccess(false);

        const trimmedData = importData.trim();
        if (!trimmedData) {
            setImportError('Please paste your save data');
            return;
        }

        try {
            const parsed = JSON.parse(trimmedData);

            // Basic validation - must be an object
            if (typeof parsed !== 'object' || parsed === null) {
                throw new Error('Invalid save format');
            }

            // Check if it's the zustand persist format (has 'state' wrapper) or raw state
            // Zustand format: { state: { funds, volunteers, ... }, version: 0 }
            // Raw format: { funds, volunteers, ... }
            const hasStateWrapper = 'state' in parsed && typeof parsed.state === 'object';
            const stateToValidate = hasStateWrapper ? parsed.state : parsed;

            // Validate that we have expected game state keys
            const hasGameStateKeys = 'funds' in stateToValidate ||
                'volunteers' in stateToValidate ||
                'activities' in stateToValidate;

            if (!hasGameStateKeys) {
                throw new Error('Save data appears corrupted - missing required game fields');
            }

            // Ensure we have the correct zustand format with version
            let dataToStore: { state: unknown; version: number };
            if (hasStateWrapper) {
                // Already has state wrapper, ensure version exists
                dataToStore = {
                    state: parsed.state,
                    version: typeof parsed.version === 'number' ? parsed.version : 0
                };
            } else {
                // Raw state, wrap it
                dataToStore = { state: parsed, version: 0 };
            }

            console.log('[Import] Storing to localStorage:', dataToStore);

            // Store to localStorage - this is the key zustand uses
            localStorage.setItem('political-revolution-save', JSON.stringify(dataToStore));

            // Use zustand's persist API to rehydrate from localStorage
            // This loads the saved state into memory without page reload
            await useStore.persist.rehydrate();

            console.log('[Import] Rehydrated store, new funds:', useStore.getState().funds);

            setImportSuccess(true);
            setImportData('');

            // Close the modal after success
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (e) {
            console.error('[Import] Error:', e);
            if (e instanceof SyntaxError) {
                setImportError('Invalid JSON format - please check your save data');
            } else {
                setImportError(e instanceof Error ? e.message : 'Import failed');
            }
        }
    };

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setImportData(content);
            setImportError(null);
            setImportSuccess(false);
        };
        reader.onerror = () => {
            setImportError('Failed to read file');
        };
        reader.readAsText(file);
    };

    // Hard reset - clear everything and reload
    const handleHardReset = () => {
        localStorage.removeItem('political-revolution-save');
        localStorage.removeItem('political-revolution-audio-muted');
        localStorage.removeItem('political-revolution-tutorial');
        window.location.reload();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-card p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            ⚙️ Settings
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Settings Options */}
                    <div className="space-y-4">
                        {/* Audio Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{muted ? '🔇' : '🔊'}</span>
                                <div>
                                    <div className="font-medium text-white">Sound Effects</div>
                                    <div className="text-sm text-slate-400">
                                        {muted ? 'Audio is muted' : 'Audio is enabled'}
                                    </div>
                                </div>
                            </div>
                            <motion.button
                                onClick={toggle}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${muted
                                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    : 'bg-blue-600 text-white hover:bg-blue-500'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {muted ? 'Unmute' : 'Mute'}
                            </motion.button>
                        </div>

                        {/* Export Save */}
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">💾</span>
                                    <div>
                                        <div className="font-medium text-white">Export Save</div>
                                        <div className="text-sm text-slate-400">
                                            Backup your progress
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <motion.button
                                        onClick={handleCopy}
                                        className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${copied
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-blue-600 text-white hover:bg-blue-500'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {copied ? '✓ Copied!' : '📋 Copy'}
                                    </motion.button>
                                    <motion.button
                                        onClick={handleDownload}
                                        className="px-3 py-2 rounded-lg font-medium text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        📥 Download
                                    </motion.button>
                                    <motion.button
                                        onClick={() => setShowExport(!showExport)}
                                        className="px-3 py-2 rounded-lg font-medium text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {showExport ? 'Hide' : 'View'}
                                    </motion.button>
                                </div>
                            </div>
                            <AnimatePresence>
                                {showExport && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <textarea
                                            readOnly
                                            value={getSaveData()}
                                            className="w-full h-32 p-3 mt-2 bg-slate-900 rounded-lg text-xs text-slate-300 font-mono resize-none border border-slate-700 focus:outline-none focus:border-blue-500"
                                            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            Click to select all • Copy to save
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Import Save */}
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📤</span>
                                    <div>
                                        <div className="font-medium text-white">Import Save</div>
                                        <div className="text-sm text-slate-400">
                                            Restore from backup
                                        </div>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => {
                                        setShowImport(!showImport);
                                        setImportError(null);
                                        setImportSuccess(false);
                                    }}
                                    className="px-4 py-2 rounded-lg font-medium text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {showImport ? 'Cancel' : 'Import'}
                                </motion.button>
                            </div>
                            <AnimatePresence>
                                {showImport && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        {/* File Upload */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".json"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <motion.button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full py-3 px-4 mt-2 rounded-lg border-2 border-dashed border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all text-sm"
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            📁 Upload .json file
                                        </motion.button>

                                        <div className="text-center text-slate-500 text-xs my-2">— or paste below —</div>

                                        <textarea
                                            value={importData}
                                            onChange={(e) => {
                                                setImportData(e.target.value);
                                                setImportError(null);
                                                setImportSuccess(false);
                                            }}
                                            placeholder="Paste your save data here..."
                                            className="w-full h-24 p-3 bg-slate-900 rounded-lg text-xs text-slate-300 font-mono resize-none border border-slate-700 focus:outline-none focus:border-blue-500"
                                        />

                                        {importError && (
                                            <p className="text-xs text-rose-400 mt-2">❌ {importError}</p>
                                        )}

                                        {importSuccess && (
                                            <p className="text-xs text-emerald-400 mt-2">✅ Import successful!</p>
                                        )}

                                        <motion.button
                                            onClick={handleImport}
                                            disabled={!importData.trim() || importSuccess}
                                            className="w-full mt-3 py-2 px-4 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={{ scale: importData.trim() ? 1.02 : 1 }}
                                            whileTap={{ scale: importData.trim() ? 0.98 : 1 }}
                                        >
                                            Apply Import
                                        </motion.button>

                                        <p className="text-xs text-amber-400/70 mt-2">
                                            ⚠️ Importing will overwrite your current progress
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Danger Zone */}
                        <div className="p-4 bg-rose-900/20 border border-rose-800/30 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🔥</span>
                                    <div>
                                        <div className="font-medium text-rose-300">Danger Zone</div>
                                        <div className="text-sm text-rose-400/70">
                                            Permanently delete all progress
                                        </div>
                                    </div>
                                </div>
                                {!showResetConfirm ? (
                                    <motion.button
                                        onClick={() => setShowResetConfirm(true)}
                                        className="px-4 py-2 rounded-lg font-medium text-sm bg-rose-900/50 text-rose-300 hover:bg-rose-800/50 border border-rose-700/50 transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Resign & Wipe
                                    </motion.button>
                                ) : (
                                    <div className="flex gap-2">
                                        <motion.button
                                            onClick={() => setShowResetConfirm(false)}
                                            className="px-3 py-2 rounded-lg font-medium text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Cancel
                                        </motion.button>
                                        <motion.button
                                            onClick={handleHardReset}
                                            className="px-3 py-2 rounded-lg font-medium text-sm bg-rose-600 text-white hover:bg-rose-500 transition-all"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Confirm Reset
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                            {showResetConfirm && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-rose-400 mt-3"
                                >
                                    ⚠️ This will delete ALL progress including volunteers. This cannot be undone!
                                </motion.p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-slate-500">
                        Political Revolution v1.0 • Made with ✊
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
