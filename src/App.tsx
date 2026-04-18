import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/src/components/DataTable";
import { useGameData } from "@/src/hooks/useGameData";
import { DataCategory, CATEGORIES } from "@/src/types/game";
import { Loader2, AlertCircle, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "motion/react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ko", label: "한국어" },
  { code: "jp", label: "日本語" },
  { code: "zh", label: "中文" },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["code"];

const STORAGE_KEY = "ovis-loop-data-viewer-language";

function getStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && LANGUAGES.some((l) => l.code === stored)) {
    return stored as LanguageCode;
  }
  return "en";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<DataCategory>("skills");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(getStoredLanguage);
  const { data, loading, error } = useGameData(activeTab);
  const groupCount = useMemo(() => new Set(data.map((row) => row.GroupID)).size, [data]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedLanguage);
  }, [selectedLanguage]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans text-foreground">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 flex flex-col h-screen">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 glass-panel p-4 md:px-8">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-white/80 to-primary/80 bg-clip-text text-transparent italic tracking-tight">
              OVIS LOOP
            </h1>
            <p className="text-sm text-white/40 tracking-wider uppercase">Data Viewer Nexus</p>
          </div>

          <div className="flex items-center gap-3 glass-panel px-4 py-2 bg-black/20">
            <Globe className="w-4 h-4 text-primary" />
            <Select value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as LanguageCode)}>
              <SelectTrigger className="w-[130px] border-none bg-transparent hover:bg-white/5 focus:ring-0 shadow-none h-8 text-sm">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-white/10 bg-background/95 backdrop-blur-xl">
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="focus:bg-primary/20 cursor-pointer">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 justify-center md:justify-start">
          {CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-300 ${
                  isActive ? "text-primary" : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 block">{cat.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <main className="flex-1 min-h-0 relative glass-panel flex flex-col p-6 overflow-hidden">
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-2 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl text-white/90 font-medium">
                {CATEGORIES.find(c => c.id === activeTab)?.label} Database
              </h2>
              <p className="text-sm text-white/40 mt-1">
                Viewing <span className="text-primary font-medium">{groupCount}</span> groups compiled from <span className="text-primary font-medium">{data.length}</span> base records.
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                >
                  <div className="relative">
                    <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
                    <div className="absolute inset-0 bg-primary blur-md opacity-30 w-10 h-10 rounded-full animate-pulse" />
                  </div>
                  <p className="text-primary/70 uppercase tracking-widest text-sm animate-pulse font-medium">
                    Compiling Data...
                  </p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="glass-panel border-destructive/20 bg-destructive/5 p-8 max-w-md text-center space-y-4">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-destructive/90">System Malfunction</p>
                      <p className="text-sm text-white/50 mt-1">{error}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col"
                >
                  <DataTable data={data} selectedLanguage={selectedLanguage} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
