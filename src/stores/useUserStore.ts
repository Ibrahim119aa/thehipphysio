
import { create } from 'zustand';
import config from '@/config/config';
import { toast } from 'sonner';

// ========= Types (real backend) =========
type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'inactive';
  occupation?: string | null;
  dob?: string | null;
};

type UpdateUserPayload = {
  _id: string;
  name?: string;
  email?: string;
  password?: string; // optional on edit
  role?: 'user' | 'admin';
  status?: 'active' | 'inactive';
  occupation?: string | null;
  dob?: string | null;
};

export interface UsersPickLIst {
  _id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  occupation?: string | null;
  dob?: string | null;           // backend returns string
  profile_photo?: string;
  fcmToken?: string | null;
  startDate: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  notifications: string[];
  purchasedPlans: string[];
}

// ========= Zustand State & Actions =========
export interface UserState {
  users: User[];
  usersPickList: UsersPickLIst[];
  loading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  addUser: (payload: CreateUserPayload) => Promise<User>;
  updateUser: (payload: UpdateUserPayload) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;

  fetchUsersPickList: () => Promise<void>;
}

// ========= Helpers =========
const normalizeUser = (u: unknown): User => {
  const obj = typeof u === 'object' && u !== null ? u as Partial<User> : {};
  return {
    _id: obj._id ?? '',
    name: (obj.name ?? (obj as { username?: string })?.username) ?? '',
    email: obj.email ?? '',
    password: obj.password,
    role: obj.role ?? 'user',
    status: obj.status ?? 'active',
    occupation: obj.occupation ?? null,
    dob: obj.dob ?? null,
    profile_photo: obj.profile_photo,
    fcmToken: obj.fcmToken ?? null,
    startDate: obj.startDate ?? '',
    lastLogin: obj.lastLogin ?? '',
    createdAt: obj.createdAt ?? '',
    updatedAt: obj.updatedAt ?? '',
    notifications: Array.isArray(obj.notifications) ? obj.notifications : [],
    purchasedPlans: Array.isArray(obj.purchasedPlans) ? obj.purchasedPlans : [],
  };
};

const clean = <T extends Record<string, unknown>>(obj: T): T => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out as T;
};

// ========= Store =========
export const useUserStore = create<UserState>((set) => ({
  users: [],
  usersPickList: [],
  loading: false,
  error: null,

  // READ
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${config.baseUri}/api/user/all`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const result = await response.json().catch(() => ({} as unknown));
      if (!result?.success) {
        set({ loading: false });
        toast.error(result?.message || 'Failed to fetch users');
        return;
      }

      const data = Array.isArray(result.data) ? result.data : [];
      set({ users: data.map(normalizeUser), loading: false });
    } catch {
      set({ error: 'Failed to fetch users', loading: false });
      toast.error('Failed to fetch users');
    }
  },

  // CREATE
  addUser: async (payload) => {
    try {
      const res = await fetch(`${config.baseUri}/api/user/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: payload.name,
          email: payload.email.toLowerCase().trim(),
          password: payload.password,
          role: payload.role ?? 'user',
          status: payload.status ?? 'active',
          occupation: payload.occupation ?? null,
          dob: payload.dob ?? null,
        }),
      });

      const result = await res.json().catch(() => ({} as unknown));
      if (!res.ok || !result?.success) {
        throw new Error((result?.message || result?.error || 'Failed to create user') as string);
      }

      const created: User = normalizeUser(result?.data ?? result?.user);
      set((s) => ({ users: [created, ...s.users] }));
      toast.success('User created');
      return created;
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to create user');
      throw err;
    }
  },

  // UPDATE (partial)
  updateUser: async ({ _id, ...rest }) => {
    try {
      const body = clean(rest);
      const res = await fetch(`${config.baseUri}/api/user/update/${_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const result = await res.json().catch(() => ({} as unknown));
      if (!res.ok || !result?.success) {
        throw new Error((result?.message || result?.error || 'Failed to update user') as string);
      }

      const updated: User = normalizeUser(result?.data ?? result?.user);
      set((s) => ({ users: s.users.map((u) => (u._id === _id ? updated : u)) }));
      toast.success('User updated');
      return updated;
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to update user');
      throw err;
    }
  },

  // DELETE
  deleteUser: async (id) => {
    try {
      const res = await fetch(`${config.baseUri}/api/user/update/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await res.json().catch(() => ({} as unknown));
      if (!res.ok || !result?.success) {
        throw new Error((result?.message || result?.error || 'Failed to delete user') as string);
      }

      set((s) => ({ users: s.users.filter((u) => u._id !== id) }));
      toast.success('User deleted');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete user');
      throw err;
    }
  },

  // AUTH

  login: async (email, password) => {
    try {
      const res = await fetch(`${config.baseUri}/api/user/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      

      const result = await res.json().catch(() => ({} as unknown));
      if (!result?.success) {
        toast.error(result?.message || 'Login failed.');
        return false;
      }
      localStorage.setItem("token", result.token);
      return true;
    } catch {
      toast.error('Login failed.');
      return false;
    }
  },

  logout: async () => {
    try {
      const res = await fetch(`${config.baseUri}/api/user/admin/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json().catch(() => ({} as unknown));

      if (!result?.success) {
        toast.error(result?.message || 'Logout failed.');
        return false;
      }
      toast.success('Logout successful!');
      return true;
    } catch {
      toast.error('Logout failed. Please try again.');
      return false;
    }
  },

  // PICKLIST
  fetchUsersPickList: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${config.baseUri}/api/user/notification-picklist`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const result = await response.json().catch(() => ({} as unknown));
      if (!result?.success) {
        set({ loading: false });
        toast.error(result?.message || 'Failed to fetch users');
        return;
      }

      set({ usersPickList: (result.users ?? result.data ?? []) as UsersPickLIst[], loading: false });
    } catch {
      set({ error: 'Failed to fetch users', loading: false });
    }
  },
}));
