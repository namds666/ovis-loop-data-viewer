import { useState, useEffect } from "react";
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
    setError(null);

    const baseUrl = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const fileUrl = `${baseUrl}${config.file}`;

    fetch(fileUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${config.file} (${response.status})`);
        }

        return response.text();
      })
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
