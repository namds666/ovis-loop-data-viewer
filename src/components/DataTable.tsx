import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { GameDataRow } from "@/src/types/game";
import { ChevronDown, ChevronUp, Search, Filter, Layers } from "lucide-react";

interface DataTableProps {
  data: GameDataRow[];
  selectedLanguage: string;
}

type SortConfig = {
  key: keyof GameDataRow | null;
  direction: "asc" | "desc";
};

export function DataTable({ data, selectedLanguage }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortConfig>({ key: null, direction: "asc" });
  const [groupBy, setGroupBy] = useState<keyof GameDataRow | "none">("none");

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sort.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = String(a[sort.key!] || "");
      const bVal = String(b[sort.key!] || "");

      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sort]);

  const groupedData = useMemo(() => {
    if (groupBy === "none") return { "All Items": sortedData };

    return sortedData.reduce((acc, row) => {
      const key = String(row[groupBy] || "Unknown");
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {} as Record<string, GameDataRow[]>);
  }, [sortedData, groupBy]);

  const handleSort = (key: keyof GameDataRow) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const columns: (keyof GameDataRow)[] = ["GroupID", "TextID", "Comment", selectedLanguage as keyof GameDataRow];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Search className="w-4 h-4" /> Search
          </label>
          <Input
            placeholder="Search all fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Layers className="w-4 h-4" /> Group By
          </label>
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="GroupID">Group ID</SelectItem>
              <SelectItem value="TextID">Text ID</SelectItem>
              <SelectItem value="Comment">Comment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary z-10">
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort(col)}
                  >
                    <div className="flex items-center gap-2">
                      {col}
                      {sort.key === col ? (
                        sort.direction === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      ) : null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Object.entries(groupedData) as [string, GameDataRow[]][]).map(([groupName, rows]) => (
                <React.Fragment key={groupName}>
                  {groupBy !== "none" && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={columns.length} className="font-bold py-2">
                        <Badge variant="outline" className="mr-2">
                          {groupName}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          ({rows.length} items)
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map((row, i) => (
                    <TableRow key={`${groupName}-${i}`}>
                      {columns.map((col) => (
                        <TableCell key={col} className="max-w-[300px] truncate">
                          <span title={row[col]}>{row[col]}</span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
