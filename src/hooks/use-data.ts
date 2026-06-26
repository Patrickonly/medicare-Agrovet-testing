// ============================================
// MEDICARE ONE — Service Hooks
// Data access layer with simulated async operations
// ============================================

import { useState, useEffect, useCallback, useMemo } from "react";
import type { PaginatedResponse, PaginationParams } from "@/types/models";

// ── Generic async data hook ─────────────────
interface UseDataOptions<T> {
  fetchFn: () => T[];
  searchFields?: (keyof T)[];
}

interface UseDataReturn<T> {
  data: T[];
  filteredData: T[];
  isLoading: boolean;
  error: string | null;
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (ps: number) => void;
  totalPages: number;
  paginatedData: T[];
  total: number;
  refetch: () => void;
}

export function useData<T extends Record<string, any>>(
  options: UseDataOptions<T>
): UseDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    // Simulate API delay
    const timer = setTimeout(() => {
      try {
        const result = options.fetchFn();
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [options.fetchFn]);

  useEffect(() => {
    const cleanup = fetchData();
    return cleanup;
  }, [fetchData]);

  const filteredData = useMemo(() => {
    if (!search || !options.searchFields?.length) return data;
    const lower = search.toLowerCase();
    return data.filter((item) =>
      options.searchFields!.some((field) => {
        const val = item[field];
        return typeof val === "string" && val.toLowerCase().includes(lower);
      })
    );
  }, [data, search, options.searchFields]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [search]);

  return {
    data,
    filteredData,
    isLoading,
    error,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedData,
    total: filteredData.length,
    refetch: fetchData,
  };
}

// ── Stat counter animation hook ─────────────
export function useAnimatedCounter(target: number, duration = 1000): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startValue + (target - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

// ── Format helpers ──────────────────────────
export function formatCurrency(amount: number, currency = "RWF"): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatDate(date: string, format: "short" | "long" | "time" = "short"): string {
  const d = new Date(date);
  switch (format) {
    case "long":
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    case "time":
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    default:
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

export function getAge(dob: string): number {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}
