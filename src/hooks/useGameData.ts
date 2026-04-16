import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { GameDataRow, DataCategory, CATEGORIES } from "@/src/types/game";

export function useGameData(category: DataCategory) {
  const [data, setData] = useState<GameDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const config = CATEGORIES.find((c) => c.id === category);
    if (!config) return;

    setLoading(true);
    fetch(config.file)
      .then((response) => response.text())
      .then((csv) => {
        Papa.parse<GameDataRow>(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data);
            setLoading(false);
          },
          error: (err: any) => {
            setError(err.message);
            setLoading(false);
          },
        });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [category]);

  return { data, loading, error };
}
