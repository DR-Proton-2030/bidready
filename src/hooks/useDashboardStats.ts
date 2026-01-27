"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/utils/api";

export default function useDashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("@token") : null;
      const response = await api.project.getDashboardStats(token || undefined);
      if (response && response.data) {
        setStats(response.data);
      }
    } catch (err: any) {
      console.error("useDashboardStats error:", err);
      setError(err.message || "Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
}
