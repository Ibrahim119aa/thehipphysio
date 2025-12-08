
import { create } from 'zustand';
import config from '@/config/config';

/** Row type used in tables (compatible with dashboard page) */
export type UserWithAnalytics = {
  _id: string;
  username: string;
  plan: string;
  analytics: {
    complianceRate?: number;   // %
    irritability?: number;     // 0-10
    resilience?: number;       // 1-10 (or 1-5 depending on source)
    engagementScore?: number;  // 0-100
    missedDays: number
  };
};

/** KPI cards & headline stats */
export type DashboardKPI = {
  totalUsers: number;
  activeUsers: number;
  highestIrritability: { user: string; value: number };
  lowestResilience: { user: string; value: number };
  leastCompliant: { user: string; value: number }; // lowest compliance %
};

/** Chart data used by page */
export type DashboardCharts = {
  userGrowth: { month: string; users: number }[]; // LineChart
  sessionCompletion: { day: string; completed: number; missed: number }[]; // BarChart
};

/** Tables used by page and future widgets */
export type DashboardTables = {
  leastCompliantUsers: UserWithAnalytics[];
  topUsersByEngagement: UserWithAnalytics[];
};

/** Overall analytics object consumed by the dashboard page */
export type DashboardAnalytics = {
  kpi: DashboardKPI;
  charts: DashboardCharts;
  tables: DashboardTables;
  meta?: {
    windowDays: number;
    irritabilityDays: number;
    growthMonths: number;
    generatedAt: string;
  };
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export interface DashboardState {
  analytics: DashboardAnalytics | null;
  loading: boolean;
  error: string | null;
  fetchAnalytics: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  analytics: null,
  loading: false,
  error: null,

  fetchAnalytics: async () => {
    set({ loading: true, error: null });

    try {
      const url = new URL(`${config.baseUri}/api/dashboard/analytics`);
      url.searchParams.set('windowDays', '7');
      url.searchParams.set('irritabilityDays', '30');
      url.searchParams.set('growthMonths', '12');

      const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      // Parse JSON safely
      const raw: ApiEnvelope<DashboardAnalytics> & Partial<DashboardAnalytics> =
        await res.json().catch(() => ({} as unknown));

      console.log('[dashboard] raw payload:', raw);

      // API wraps the payload under `data`, but allow direct payload too
      const payload = (raw.data as DashboardAnalytics) ?? (raw as unknown as DashboardAnalytics);

      if (!res.ok) {
        const msg =
          (raw as { message?: string; error?: string })?.message ||
          (raw as { message?: string; error?: string })?.error ||
          `HTTP ${res.status}`;
        throw new Error(msg);
      }

      if (!payload?.kpi || !payload?.charts || !payload?.tables) {
        throw new Error('Malformed payload: missing kpi/charts/tables');
      }

      // Normalize arrays to avoid undefined issues in UI
      const normalized: DashboardAnalytics = {
        kpi: payload.kpi,
        charts: {
          userGrowth: Array.isArray(payload.charts.userGrowth) ? payload.charts.userGrowth : [],
          sessionCompletion: Array.isArray(payload.charts.sessionCompletion) ? payload.charts.sessionCompletion : [],
        },
        tables: {
          leastCompliantUsers: Array.isArray(payload.tables.leastCompliantUsers) ? payload.tables.leastCompliantUsers : [],
          topUsersByEngagement: Array.isArray(payload.tables.topUsersByEngagement) ? payload.tables.topUsersByEngagement : [],
        },
        meta: payload.meta,
      };

      set({ analytics: normalized, loading: false, error: null });
    } catch (err: unknown) {
      console.error('[dashboard] fetchAnalytics error:', err);
      set({
        analytics: null,
        loading: false,
        error: (err as { message?: string })?.message || 'Failed to fetch analytics',
      });
    }
  },
}));
