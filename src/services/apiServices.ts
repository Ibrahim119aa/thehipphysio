// services/apiService.ts
import { DashboardAnalytics, Exercise, UserWithAnalytics, RehabPlan, Notification, ContentPage } from '@/lib/types';
import { mockDashboardData, mockUsers, mockExercises, mockPlans, mockNotifications } from '@/lib/mockData';
import config from '@/config/config';
import { toast } from 'sonner';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const apiService = {
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    await delay(500);
    console.log("Fetching dashboard analytics...");
    return mockDashboardData;
  },
  getUsers: async (): Promise<UserWithAnalytics[]> => {
    await delay(500);
    console.log("Fetching users...");
    return mockUsers;
  },
  getExercises: async (): Promise<Exercise[]> => {
    await delay(500);
    console.log("Fetching exercises...");
    return mockExercises as Exercise[];
  },
  getRehabPlans: async (): Promise<RehabPlan[]> => {
    await delay(500);
    console.log("Fetching rehab plans...");
    return mockPlans as RehabPlan[];
  },
  getNotifications: async (): Promise<Notification[]> => {
    await delay(500);
    console.log("Fetching notifications...");
    return mockNotifications as Notification[];
  },
  sendNotification: async (notification: Omit<Notification, '_id' | 'status' | 'sentTime'>): Promise<Notification> => {
    await delay(500);
    console.log("Sending notification:", notification);
    const newNotification: Notification = {
      _id: `notif_${Date.now()}`,
      status: 'Sent',
      // sentTime: new Date().toISOString(),
      ...notification
    };
    mockNotifications.unshift(newNotification);
    return newNotification;
  },
  getContentPages: async (): Promise<unknown> => {
    await delay(500);
    console.log("Fetching content pages...");
    return []; // Return an empty array or appropriate mock data
  },
  updateContentPage: async(slug: string, contentHtml: string): Promise<ContentPage> => {
    try {
      const response = await fetch(`${config.baseUri}/api/editable-content/${slug}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentHtml }),
      });

      const data = await response.json();    
      
      if(!data.success) {
        toast.error(data.message)
      }
      
      return data.data;

    } catch (error) {
      console.error("Failed to fetch content pages:", error);
      throw error;
    }
  }
  
};