import { useDeferredValue, useMemo, useState } from "react";
import { GameDataRow, GroupedGameEntry } from "@/src/types/game";
import { ArrowDownAZ, ArrowUpAZ, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps {
  data: GameDataRow[];
  selectedLanguage: string;
}

type SortConfig = {
  key: "title" | "comment" | "desc" | "GroupID";
  direction: "asc" | "desc";
};

const PRIMARY_ROW_TYPES = new Set(["title", "comment"]);

function getLocalizedValue(row: GameDataRow | undefined, selectedLanguage: string) {
  return row?.[selectedLanguage]?.trim() || "";
}

function buildGroupedEntries(
  data: GameDataRow[],
  selectedLanguage: string
): GroupedGameEntry[] {
  const rowsByGroupId = data.reduce((acc, row) => {
    const key = row.GroupID?.trim() || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {} as Record<string, GameDataRow[]>);

  return Object.entries(rowsByGroupId).map(([groupId, rows]) => {
    const titleRow = rows.find((row) => row.TextID?.trim().toLowerCase() === "title");
    const commentRow = rows.find((row) => row.TextID?.trim().toLowerCase() === "comment");
    const details = rows
      .filter((row) => !PRIMARY_ROW_TYPES.has(row.TextID?.trim().toLowerCase()))
      .map((row) => ({
        label: row.TextID?.trim() || "Desc",
        value: getLocalizedValue(row, selectedLanguage),
      }))
      .filter((field) => field.value);

    const descField =
      details.find((field) => field.label.toLowerCase() === "desc") ?? details[0];

    return {
      GroupID: groupId,
      title: getLocalizedValue(titleRow, selectedLanguage) || groupId,
      comment: getLocalizedValue(commentRow, selectedLanguage),
      desc: descField?.value || "",
      primaryDescLabel: descField?.label || "Desc",
      extraFields: descField
        ? details.filter((field) => field !== descField)
        : [],
      rowCount: rows.length,
    };
  });
}

export function DataTable({ data, selectedLanguage }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortConfig>({ key: "title", direction: "asc" });
  const deferredSearch = useDeferredValue(search);

  const groupedEntries = useMemo(
    () => buildGroupedEntries(data, selectedLanguage),
    [data, selectedLanguage]
  );

  const filteredEntries = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    if (!normalizedSearch) return groupedEntries;

    return groupedEntries.filter((entry) =>
      [
        entry.GroupID,
        entry.title,
        entry.comment,
        entry.desc,
        ...entry.extraFields.flatMap((field) => [field.label, field.value]),
      ].some((value) => value.toLowerCase().includes(normalizedSearch))
    );
  }, [deferredSearch, groupedEntries]);

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      const aValue = a[sort.key].toLowerCase();
      const bValue = b[sort.key].toLowerCase();

      if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredEntries, sort]);

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-primary/70" />
          </div>
          <input
            type="text"
            className="w-full glass-input pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
            placeholder="Search database nodes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 items-center text-sm">
          <span className="text-white/40 hidden sm:inline-block mr-2 font-medium tracking-wide">SORT PARAMS</span>
          
          <Select
            value={sort.key}
            onValueChange={(value) => setSort((prev) => ({ ...prev, key: value as SortConfig["key"] }))}
          >
            <SelectTrigger className="w-[140px] glass-input border-white/10 text-white/80 h-10 hover:bg-white/5">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="glass-panel border-white/10 bg-background/95 backdrop-blur-xl">
              <SelectItem value="title" className="focus:bg-primary/20">Name / Title</SelectItem>
              <SelectItem value="GroupID" className="focus:bg-primary/20">Group ID</SelectItem>
              <SelectItem value="comment" className="focus:bg-primary/20">Comment</SelectItem>
              <SelectItem value="desc" className="focus:bg-primary/20">Description</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sort.direction}
            onValueChange={(value) => setSort((prev) => ({ ...prev, direction: value as SortConfig["direction"] }))}
          >
            <SelectTrigger className="w-[110px] glass-input border-white/10 text-white/80 h-10 hover:bg-white/5">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent className="glass-panel border-white/10 bg-background/95 backdrop-blur-xl">
              <SelectItem value="asc" className="focus:bg-primary/20">
                <span className="flex items-center gap-2"><ArrowUpAZ className="h-4 w-4 text-primary" /> Asc</span>
              </SelectItem>
              <SelectItem value="desc" className="focus:bg-primary/20">
                <span className="flex items-center gap-2"><ArrowDownAZ className="h-4 w-4 text-primary" /> Desc</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6 space-y-4">
        <AnimatePresence>
          {sortedEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedEntries.map((entry, idx) => (
                <motion.article
                  key={entry.GroupID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.4 }}
                  whileHover={{ scale: 1.02, translateY: -4 }}
                  className="group relative rounded-2xl glass-panel p-5 overflow-hidden border border-white/10 hover:border-primary/50 transition-colors duration-500"
                >
                  {/* Subtle hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col h-full space-y-4">
                    {/* Header: Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-white/80 tracking-wider">
                          {entry.GroupID}
                        </span>
                      </div>
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest border border-primary/20">
                        {entry.rowCount} LNs
                      </span>
                    </div>

                    {/* Title & Comment */}
                    <div>
                      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        {entry.title}
                      </h3>
                      {entry.comment && (
                        <p className="text-sm text-primary/80 mt-1.5 font-medium italic">
                          "{entry.comment}"
                        </p>
                      )}
                    </div>

                    <div className="flex-1" />

                    {/* Description Content */}
                    {entry.desc && (
                      <div className="bg-black/40 rounded-xl p-3 border border-white/5 inset-shadow-sm">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                          {entry.primaryDescLabel}
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                          {entry.desc}
                        </p>
                      </div>
                    )}

                    {/* Extra Fields (Grid) */}
                    {entry.extraFields.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {entry.extraFields.map((field) => (
                          <div key={field.label} className="bg-white/5 rounded-lg p-2 border border-white/[0.02]">
                            <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-0.5 truncate">
                              {field.label}
                            </div>
                            <p className="text-xs text-white/90 truncate font-mono">
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Sparkles className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-xl font-medium text-white/80">No Nodes Found</h3>
              <p className="text-sm text-white/40 mt-2 max-w-sm">
                Try adjusting your search parameters to locate specific database entries.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
