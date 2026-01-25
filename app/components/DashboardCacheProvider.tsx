"use client";

import React, { createContext, useContext, useState, useRef } from "react";

interface CacheState {
  traffic?: any;
  stars?: {
    data: any[];
    chartData: any[];
    totalCount: number;
  };
  contributors?: {
    data: any[];
    stats: any[];
    recentCommit: any;
    totalCount: number;
    totalPages: number;
  };
  issues?: {
    issues: any[];
    stats: any;
    chartData: any[];
  };
}

interface DashboardCacheContextType {
  cache: CacheState;
  setCache: (key: keyof CacheState, data: any) => void;
  // We can also store the 'last fetched' timestamp if we wanted cache expiration
}

const DashboardCacheContext = createContext<
  DashboardCacheContextType | undefined
>(undefined);

export function DashboardCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cache, setCacheState] = useState<CacheState>({});

  const setCache = (key: keyof CacheState, data: any) => {
    setCacheState((prev) => ({
      ...prev,
      [key]: data,
    }));
  };

  return (
    <DashboardCacheContext.Provider value={{ cache, setCache }}>
      {children}
    </DashboardCacheContext.Provider>
  );
}

export function useDashboardCache() {
  const context = useContext(DashboardCacheContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardCache must be used within a DashboardCacheProvider",
    );
  }
  return context;
}
