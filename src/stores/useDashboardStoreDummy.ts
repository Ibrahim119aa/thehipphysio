import { create } from 'zustand';

/** Row type used in tables (compatible with your dashboard page) */
export type UserWithAnalytics = {
  _id: string;
  username: string;
  plan: string;
  analytics: {
    complianceRate: number;   // %
    irritability: number;     // 0-10
    resilience: number;       // 0-10
    engagementScore: number;  // 0-100
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

/** Chart data used by your page */
export type DashboardCharts = {
  userGrowth: { month: string; users: number }[];               // LineChart
  sessionCompletion: { day: string; completed: number; missed: number }[]; // BarChart
};

/** Tables used by your page and future widgets */
export type DashboardTables = {
  leastCompliantUsers: UserWithAnalytics[];
  topUsersByEngagement: UserWithAnalytics[];
  // You can add more tables later (e.g., “highest irritability users”)
};

/** Overall analytics object consumed by the dashboard page */
export type DashboardAnalytics = {
  kpi: DashboardKPI;
  charts: DashboardCharts;
  tables: DashboardTables;
};

export interface DashboardState {
  analytics: DashboardAnalytics | null;
  loading: boolean;
  error: string | null;
  fetchAnalytics: () => Promise<void>;
}

/* ---------------------------
   Fake API + Dummy Data
---------------------------- */
const fakeDelay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function mockFetchAnalytics(): Promise<DashboardAnalytics> {
  // Simulate network delay
  await fakeDelay(500);

  // Seeded dummy users — names/plans/metrics are illustrative
  const pool: UserWithAnalytics[] = [
    { _id: 'u1', username: 'Ayesha Khan',   plan: 'Knee Rehab',     analytics: { complianceRate: 42, irritability: 7.8, resilience: 3.1, engagementScore: 56 } },
    { _id: 'u2', username: 'Zain Ali',      plan: 'Back Pain',      analytics: { complianceRate: 58, irritability: 6.9, resilience: 4.2, engagementScore: 63 } },
    { _id: 'u3', username: 'Hira Shah',     plan: 'Shoulder Fix',   analytics: { complianceRate: 71, irritability: 5.2, resilience: 6.1, engagementScore: 78 } },
    { _id: 'u4', username: 'Omar Raza',     plan: 'Ankle Mobility', analytics: { complianceRate: 39, irritability: 8.4, resilience: 2.8, engagementScore: 49 } },
    { _id: 'u5', username: 'Fatima Noor',   plan: 'Neck Relief',    analytics: { complianceRate: 65, irritability: 4.6, resilience: 6.7, engagementScore: 81 } },
    { _id: 'u6', username: 'Bilal Ahmed',   plan: 'Posture Reset',  analytics: { complianceRate: 77, irritability: 3.9, resilience: 7.1, engagementScore: 86 } },
    { _id: 'u7', username: 'Sana Iqbal',    plan: 'Core Strength',  analytics: { complianceRate: 33, irritability: 8.7, resilience: 2.1, engagementScore: 41 } },
    { _id: 'u8', username: 'Usman Tariq',   plan: 'Sciatica Care',  analytics: { complianceRate: 52, irritability: 6.1, resilience: 4.9, engagementScore: 60 } },
    { _id: 'u9', username: 'Marium Javed',  plan: 'Pelvic Rehab',   analytics: { complianceRate: 84, irritability: 2.9, resilience: 8.4, engagementScore: 92 } },
    { _id: 'u10',username: 'Hamza Farooq',  plan: 'Hamstring Rx',   analytics: { complianceRate: 47, irritability: 7.2, resilience: 3.9, engagementScore: 58 } },
  ];

  // Tables required by UI
  const leastCompliantUsers = [...pool]
    .sort((a, b) => a.analytics.complianceRate - b.analytics.complianceRate)
    .slice(0, 5);

  const topUsersByEngagement = [...pool]
    .sort((a, b) => b.analytics.engagementScore - a.analytics.engagementScore)
    .slice(0, 5);

  // KPIs derived from pool
  const highestIrr = pool.reduce((max, u) =>
    u.analytics.irritability > max.analytics.irritability ? u : max
  );
  const lowestRes = pool.reduce((min, u) =>
    u.analytics.resilience < min.analytics.resilience ? u : min
  );
  const leastComp  = leastCompliantUsers[0];

  // Headline counts (dummy totals)
  const totalUsers  = 128;
  const activeUsers = 86;

  // Chart series (dummy)
  const userGrowth = [
    { month: 'Jan', users: 12 },
    { month: 'Feb', users: 18 },
    { month: 'Mar', users: 24 },
    { month: 'Apr', users: 31 },
    { month: 'May', users: 45 },
    { month: 'Jun', users: 52 },
    { month: 'Jul', users: 61 },
    { month: 'Aug', users: 74 },
    { month: 'Sep', users: 83 },
    { month: 'Oct', users: 93 },
    { month: 'Nov', users: 104 },
    { month: 'Dec', users: 118 },
  ];

  const sessionCompletion = [
    { day: 'Mon', completed: 42, missed: 10 },
    { day: 'Tue', completed: 47, missed:  8 },
    { day: 'Wed', completed: 39, missed: 14 },
    { day: 'Thu', completed: 51, missed:  7 },
    { day: 'Fri', completed: 44, missed: 11 },
    { day: 'Sat', completed: 36, missed: 15 },
    { day: 'Sun', completed: 28, missed: 18 },
  ];

  const kpi: DashboardKPI = {
    totalUsers,
    activeUsers,
    highestIrritability: { user: highestIrr.username, value: highestIrr.analytics.irritability },
    lowestResilience:    { user: lowestRes.username, value: lowestRes.analytics.resilience },
    leastCompliant:      { user: leastComp.username, value: leastComp.analytics.complianceRate },
  };

  const charts: DashboardCharts = { userGrowth, sessionCompletion };
  const tables: DashboardTables = { leastCompliantUsers, topUsersByEngagement };

  return { kpi, charts, tables };
}

/* ---------------------------
   Zustand Store (no apiService)
---------------------------- */
export const useDashboardStoreDummy = create<DashboardState>((set) => ({
  analytics: null,
  loading: false,
  error: null,

  fetchAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const data = await mockFetchAnalytics();
      set({ analytics: data, loading: false });
    } catch (err) {
      set({ error: `Failed to fetch analytics: ${err}`, loading: false });
    }
  },
}));
