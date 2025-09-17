// // lib/mockData.ts

// import { User } from "./types";


// export const mockUsers: User[] = [
//   { id: 'usr_1', name: 'John Doe', email: 'john.d@example.com', avatar: '/avatars/01.png', plan: 'FAI Post Op', status: 'Active', startDate: '2025-07-01', lastLogin: '2025-07-28', compliance: 95, irritability: 2 },
//   { id: 'usr_2', name: 'Jane Smith', email: 'jane.s@example.com', avatar: '/avatars/02.png', plan: 'Hip Replacement', status: 'Active', startDate: '2025-06-15', lastLogin: '2025-07-27', compliance: 88, irritability: 4 },
//   { id: 'usr_3', name: 'Mike Johnson', email: 'mike.j@example.com', avatar: '/avatars/03.png', plan: 'Free Plan', status: 'Inactive', startDate: '2025-05-20', lastLogin: '2025-07-10', compliance: 40, irritability: 7 },
//   { id: 'usr_4', name: 'Sarah Williams', email: 'sarah.w@example.com', avatar: '/avatars/04.png', plan: 'FAI Post Op', status: 'Active', startDate: '2025-07-10', lastLogin: '2025-07-28', compliance: 100, irritability: 1 },
//   { id: 'usr_5', name: 'David Brown', email: 'david.b@example.com', avatar: '/avatars/05.png', plan: 'Hip Replacement', status: 'Active', startDate: '2025-06-25', lastLogin: '2025-07-25', compliance: 75, irritability: 6 },
// ];

// export const userGrowthData = [
//   { month: 'Mar', users: 20 },
//   { month: 'Apr', users: 35 },
//   { month: 'May', users: 50 },
//   { month: 'Jun', users: 80 },
//   { month: 'Jul', users: 120 },
// ];

// export const sessionCompletionData = [
//   { day: 'Mon', completed: 90, missed: 10 },
//   { day: 'Tue', completed: 85, missed: 15 },a
//   { day: 'Wed', completed: 95, missed: 5 },
//   { day: 'Thu', completed: 80, missed: 20 },
//   { day: 'Fri', completed: 75, missed: 25 },
//   { day: 'Sat', completed: 98, missed: 2 },
//   { day: 'Sun', completed: 92, missed: 8 },
// ];


// lib/mockData.ts
import { DashboardAnalytics, UserWithAnalytics, Exercise, RehabPlan, Notification, ContentPage } from '@/lib/types';

export const mockUsers: UserWithAnalytics[] = [
  { _id: 'usr_1', username: 'John Doe', email: 'john.d@example.com', status: 'active', plan: 'FAI Post Op', startDate: '2025-07-01T00:00:00Z', lastLogin: '2025-07-28T10:00:00Z', analytics: { complianceRate: 95, averageIrritability: 2.1 } },
  { _id: 'usr_2', username: 'Jane Smith', email: 'jane.s@example.com', status: 'active', plan: 'Hip Replacement', startDate: '2025-06-15T00:00:00Z', lastLogin: '2025-07-27T14:00:00Z', analytics: { complianceRate: 88, averageIrritability: 4.5 } },
  { _id: 'usr_3', username: 'Mike Johnson', email: 'mike.j@example.com', status: 'inactive', plan: 'Free Plan', startDate: '2025-05-20T00:00:00Z', lastLogin: '2025-07-10T09:00:00Z', analytics: { complianceRate: 40, averageIrritability: 7.0 } },
  { _id: 'usr_4', username: 'Sarah Williams', email: 'sarah.w@example.com', status: 'active', plan: 'FAI Post Op', startDate: '2025-07-10T00:00:00Z', lastLogin: '2025-07-28T11:00:00Z', analytics: { complianceRate: 100, averageIrritability: 1.2 } },
  { _id: 'usr_5', username: 'David Brown', email: 'david.b@example.com', status: 'active', plan: 'Hip Replacement', startDate: '2025-06-25T00:00:00Z', lastLogin: '2025-07-25T18:00:00Z', analytics: { complianceRate: 75, averageIrritability: 6.3 } },
];

export const mockExercises: unknown[] = [
  { _id: 'ex_1', name: 'Glute Bridge', description: 'Lie on your back with knees bent...', videoUrl: 'https://example.com/video1.mp4', reps: '15', sets: '3', category: 'Hip / Strengthening', tags: ['Phase 1', 'Core'] },
  { _id: 'ex_2', name: 'Clamshell', description: 'Lie on your side with knees bent...', videoUrl: 'https://example.com/video2.mp4', reps: '20', sets: '3', category: 'Hip / Strengthening', tags: ['Phase 1', 'Pilates'] },
  { _id: 'ex_3', name: 'Standing Hip Abduction', description: 'Stand tall and lift one leg out to the side...', videoUrl: 'https://example.com/video3.mp4', reps: '12', sets: '3', category: 'Strengthening', tags: ['Phase 2', 'Balance'] },
];
interface RehabPlan1 {
  _id: string;
  name: string;
  durationWeeks: number;
}

export const mockPlans: unknown[] = [
  { _id: 'plan_1', name: 'FAI Post Operative', durationWeeks: 12 },
  { _id: 'plan_2', name: 'Hip Replacement Phase 1', durationWeeks: 4 },
  { _id: 'plan_3', name: 'General Hip Mobility', durationWeeks: 2 },
];

export const mockNotifications: unknown[] = [
  { _id: 'notif_1', title: 'Weekly Check-in', body: 'Don\'t forget to log your weekly resilience score!', status: 'Sent', sentTime: '2025-07-25T10:00:00Z' },
  { _id: 'notif_2', title: 'New Video Added!', body: 'Check out our new video on managing post-surgery pain.', status: 'Sent', sentTime: '2025-07-22T15:00:00Z' },
];

export const mockContentPages: unknown[] = [
  {
    _id: 'page_1',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: '<h1>Privacy Policy</h1><p>Your data is safe with us...</p>',
    updatedAt: '2025-06-01T12:00:00Z'
  },
  {
    _id: 'page_2',
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    content: '<h1>Terms & Conditions</h1><p>By using this app, you agree to...</p>',
    updatedAt: '2025-06-01T12:00:00Z'
  },
  {
    _id: 'page_3',
    title: 'Help / FAQs',
    slug: 'help-faqs',
    content: '<h1>FAQs</h1><p><strong>How do I reset my password?</strong>...</p>',
    updatedAt: '2025-07-15T11:00:00Z'
  },
];

export const mockDashboardData: DashboardAnalytics = {
  kpi: {
    totalUsers: 125,
    activeUsers: 98,
    highestIrritability: { value: '7.0', user: 'Mike Johnson' },
    leastCompliant: { value: '40%', user: 'Mike Johnson' },
  },
  charts: {
    userGrowth: [
      { month: 'Mar', users: 20 }, { month: 'Apr', users: 35 }, { month: 'May', users: 50 },
      { month: 'Jun', users: 80 }, { month: 'Jul', users: 125 },
    ],
    sessionCompletion: [
      { day: 'Mon', completed: 90, missed: 10 }, { day: 'Tue', completed: 85, missed: 15 },
      { day: 'Wed', completed: 95, missed: 5 }, { day: 'Thu', completed: 80, missed: 20 },
      { day: 'Fri', completed: 75, missed: 25 }, { day: 'Sat', completed: 98, missed: 2 },
      { day: 'Sun', completed: 92, missed: 8 },
    ],
  },
  tables: {
    leastCompliantUsers: mockUsers.sort((a, b) => a.analytics.complianceRate - b.analytics.complianceRate).slice(0, 5),
  },
};
