import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/src/components/DataTable";
import { useGameData } from "@/src/hooks/useGameData";
import { DataCategory, CATEGORIES } from "@/src/types/game";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedLanguage);
  }, [selectedLanguage]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as LanguageCode)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DataCategory)} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto p-1 bg-muted/50 rounded-xl">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="rounded-lg py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="mt-6 focus-visible:outline-none">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{cat.label} Database</CardTitle>
                      <CardDescription>
                        Managing {data.length} entries in the {cat.label} category.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-muted-foreground animate-pulse">Loading data from {cat.file}...</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-destructive">
                      <AlertCircle className="w-12 h-12" />
                      <div className="text-center">
                        <p className="font-bold text-lg">Error Loading Data</p>
                        <p className="text-sm opacity-80">{error}</p>
                      </div>
                    </div>
                  ) : (
                    <DataTable data={data} selectedLanguage={selectedLanguage} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
