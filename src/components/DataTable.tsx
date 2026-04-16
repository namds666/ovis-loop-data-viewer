import { useDeferredValue, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GameDataRow, GroupedGameEntry } from "@/src/types/game";
import { ArrowDownAZ, ArrowUpAZ, Search } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4" /> Search
          </label>
          <Input
            placeholder="Search grouped entries..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select
              value={sort.key}
              onValueChange={(value) =>
                setSort((prev) => ({ ...prev, key: value as SortConfig["key"] }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="comment">Comment</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="GroupID">Group ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Direction</label>
            <Select
              value={sort.direction}
              onValueChange={(value) =>
                setSort((prev) => ({ ...prev, direction: value as SortConfig["direction"] }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">
                  <span className="flex items-center gap-2">
                    <ArrowUpAZ className="h-4 w-4" />
                    Asc
                  </span>
                </SelectItem>
                <SelectItem value="desc">
                  <span className="flex items-center gap-2">
                    <ArrowDownAZ className="h-4 w-4" />
                    Desc
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{sortedEntries.length} grouped entries</span>
        <span>Rows with the same Group ID are merged into one card.</span>
      </div>

      <div className="rounded-md border bg-card">
        <ScrollArea className="h-[600px]">
          <div className="space-y-4 p-4">
            {sortedEntries.map((entry) => (
              <article
                key={entry.GroupID}
                className="rounded-xl border bg-background/70 p-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{entry.GroupID}</Badge>
                    <Badge variant="outline">{entry.rowCount} rows</Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold leading-tight">{entry.title}</h3>
                    {entry.comment ? (
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {entry.comment}
                      </p>
                    ) : null}
                  </div>
                </div>

                {entry.desc ? (
                  <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {entry.primaryDescLabel}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{entry.desc}</p>
                  </div>
                ) : null}

                {entry.extraFields.length ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {entry.extraFields.map((field) => (
                      <div
                        key={`${entry.GroupID}-${field.label}`}
                        className="rounded-lg border p-3"
                      >
                        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          {field.label}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm">{field.value}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}

            {!sortedEntries.length ? (
              <div className="flex h-[240px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                No grouped entries matched your search.
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
