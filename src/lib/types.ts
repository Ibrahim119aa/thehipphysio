
// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   avatar: string;
//   plan: string; // e.g., "FAI Post Op"
//   status: 'Active' | 'Inactive';
//   startDate: string;
//   lastLogin: string;
//   compliance: number; // Percentage
//   irritability: number; // 0-10 scale
// }


export interface User {
  _id: string;
  username: string;
  email: string;
  status: 'active' | 'inactive';
  plan: string; // This would be populated from RehabPlan name
  startDate: string;
  lastLogin: string;
}

// use a narrow view for the picker (no new backend type needed)
export type UserPickerItem = Pick<User, '_id' | 'username' | 'email' | 'status'>;

export interface ExerciseCategory {
  _id: string;
  title: string;
}

export interface Exercise {
  _id: string;
  name: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  reps: string;
  sets: string;
  category: ExerciseCategory;
  tags: string[];
  bodyPart: string;
  difficulty: 'Beginner' | 'Medium' | 'Advanced';
  estimatedDuration?: number;
  createdBy: string; // This would ideally be a populated User object
  createdAt: string;
  updatedAt: string;
}

// State definition for Zustand store
export interface ExerciseState {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  fetchExercises: () => Promise<void>;
  addExercise: (formData: FormData) => Promise<boolean>;
  updateExercise: (formData: FormData) => Promise<boolean>;
  deleteExercise: (exerciseId: string) => Promise<void>;
}

export interface RehabPlan {
  _id: string;
  name: string;
  description?: string;
  planType: 'free' | 'paid';
  price?: number;
  phase?: string;
  openEnded: boolean;

  weekStart?: number | null;
  weekEnd?: number | null;
  planDurationInWeeks?: number;

  totalWeeks?: number;
  totalExercises?: number;
  totalMinutes?: number;

  categories?: Array<{ _id: string; title: string }>;
  equipment?: Array<{ _id: string; title: string }>;
}


// 1) Keep a single source of truth for allowed statuses
export type NotificationStatus = 'Sent' | 'Scheduled';

export type CreateUserPayload = {
  name: string;
  email: string;
  role: string;
  password: string;
};

// 2) Shape returned/stored in state
export interface Notification {
  _id: string;
  title: string;
  body: string;
  audienceType: 'all' | 'selected';
  status: NotificationStatus;
  sentAt?: string;
  scheduleAt?: string;
}

// 3) Input when creating/sending a notification (no _id/status/sentAt)
export interface SendNotificationInput {
  title: string;
  body: string;
  audienceType: 'all' | 'selected';
  userIds?: string[];      // required if Selected
  scheduleAt?: string;
}

export interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  sendNotification: (notification: SendNotificationInput) => Promise<void>;
}

// Optional: describe your API response to help TS
// type SendNotificationResponse = {
//   success: boolean;
//   message: string;
//   notificationId?: string;
// };

export interface ContentPage {
  _id: string;
  title: string;
  slug: string;
  contentHtml: string;
  updatedAt: string;
}


// Types for API responses and Zustand stores
export interface UserWithAnalytics extends User {
  analytics: {
    complianceRate: number;
    averageIrritability: number;
  }
}

export interface UsersPickLIst {
  _id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface DashboardAnalytics {
  kpi: {
    totalUsers: number;
    activeUsers: number;
    highestIrritability: { value: string; user: string };
    leastCompliant: { value: string; user: string };
  };
  charts: {
    userGrowth: { month: string; users: number }[];
    sessionCompletion: { day: string; completed: number; missed: number }[];
  };
  tables: {
    leastCompliantUsers: User[]; // Simplified for the table
  };
}

// Zustand State & Actions
export interface UserState {
  users: UserWithAnalytics[];
  dummyUsers: UserWithAnalytics[],
  usersPickList: UsersPickLIst[]
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUsersPickList: () => Promise<void>;
  // Add addUser, updateUser, etc. later
}

export interface ExerciseState {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  fetchExercises: () => Promise<void>;
}

// export interface RehabPlanState {
//   plans: RehabPlan[];
//   loading: boolean;
//   error: string | null;
//   fetchPlans: () => Promise<void>;
// }

export interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  sendNotification: (notification: SendNotificationInput) => Promise<void>;
}

export interface ContentState {
  pages: ContentPage[];
  loading: boolean;
  error: string | null;
  fetchPages: () => Promise<void>;
  updatePage: (slug: string, content: string) => Promise<void>;
}

export interface DashboardState {
  analytics: DashboardAnalytics | null;
  loading: boolean;
  error: string | null;
  fetchAnalytics: () => Promise<void>;
}