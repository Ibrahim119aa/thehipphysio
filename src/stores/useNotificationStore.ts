import { create } from 'zustand';
import { NotificationState, Notification } from '@/lib/types';
import config from '@/config/config';
import { toast } from 'sonner';

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${config.baseUri}/api/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const result = await response.json();

      if(!result.success){
        set({ loading: false})
        toast.error(result.message);
        return;
      }

      set({ notifications: result.notifications, loading: false });

    } catch (err) {
      set({ error: 'Failed to fetch notifications', loading: false });
    }
  },
sendNotification: async (notification) => {
  set({ loading: true, error: null });
  try {
    const response = await fetch(`${config.baseUri}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
      credentials: 'include',
    });

    const result = await response.json();

    if (!result.success || !result.notificationId) {
      set({ loading: false });
      toast.error(result.message || 'Failed to send notification');
      return;
    }

    const newNotification: Notification = {
      _id: result.notificationId,
      title: notification.title,
      body: notification.body,
      audienceType: notification.audienceType,
      scheduleAt: notification.scheduleAt,
      status: notification.scheduleAt ? 'Scheduled' : 'Sent',
      sentAt: notification.scheduleAt ? undefined : new Date().toISOString(),
    };

    set({
      notifications: [newNotification, ...get().notifications],
      loading: false,
    });

    toast.success(result.message);
  } catch (err) {
    console.error(err);
    set({ error: 'Failed to send notification', loading: false });
    toast.error('Something went wrong.');
  }
}

}));
