'use client';
import { useEffect, useMemo, useState } from 'react';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useUserStore } from '@/stores/useUserStore';
import { Notification, SendNotificationInput, UsersPickLIst } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { ColumnDef, DataTable } from '@/components/common/DataTables';
import { PageHeader } from '@/components/common/PageHeader';

const columns: ColumnDef<Notification>[] = [
  { accessorKey: 'title', header: 'Title', cell: (row) => <div className="font-medium">{row.title}</div> },
  { accessorKey: 'body', header: 'Message', cell: (row) => <p className="truncate max-w-xs">{row.body}</p> },
  { accessorKey: 'status', header: 'Status', cell: (row) => row.status },
  { accessorKey: 'sentAt', header: 'Sent At', cell: (row) => row.sentAt ? new Date(row.sentAt).toLocaleString() : 'N/A' }
];

export default function NotificationsPage() {
  const { notifications, loading, fetchNotifications, sendNotification } = useNotificationStore();

  // 👇 reuse your existing user store
  const { usersPickList, loading: usersLoading, fetchUsersPickList } = useUserStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const [audienceType, setAudienceType] = useState<'all' | 'selected'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (notifications?.length === 0) fetchNotifications();
  }, [notifications?.length, fetchNotifications]);

  // Load users only when needed
  useEffect(() => {
    if (audienceType === 'selected' && usersPickList?.length === 0) {
      fetchUsersPickList();
    }
  }, [audienceType, usersPickList?.length, fetchUsersPickList]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return usersPickList;
    return usersPickList.filter((u: UsersPickLIst) =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  }, [usersPickList, userSearch]);

  const toggleUser = (id: string, checked: boolean) => {
    setSelectedUserIds(prev => checked ? [...new Set([...prev, id])] : prev.filter(x => x !== id));
  };

  const handleSend = async () => {
    if (!title || !body) {
      alert('Title and message are required.');
      return;
    }

    const payload: SendNotificationInput = {
      title,
      body,
      audienceType,
      userIds: audienceType === 'selected' ? selectedUserIds : undefined,
      ...(type === "custom"
        ? { scheduleAt: date }
        : '')
    };


    if (payload.audienceType === 'selected' && !payload.userIds?.length) {
      alert('Please select at least one user.');
      return;
    }

    await sendNotification(payload);
    // reset
    setTitle('');
    setBody('');
    setAudienceType('all');
    setUserSearch('');
    setSelectedUserIds([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Push Notifications" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send New Notification</CardTitle>
            <CardDescription>Send a message to all users or only selected users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Weekly Motivation" />
            </div>
            <div className="space-y-2">
              <Label>Schedule At :</Label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="now"
                    checked={type === 'now'}
                    onChange={() => setType('now')}
                  />
                  <span>Now</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="custom"
                    checked={type === 'custom'}
                    onChange={() => setType('custom')}
                  />
                  <span>Custom Date</span>
                </label>
              </div>
            </div>
            {
              type == "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="datetime-local"
                    id="dateTime"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />

                </div>
              )
            }

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Your message here..." />
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <Label>Audience</Label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="audience"
                    value="All"
                    checked={audienceType === 'all'}
                    onChange={() => setAudienceType('all')}
                  />
                  <span>All Users</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="audience"
                    value="Selected"
                    checked={audienceType === 'selected'}
                    onChange={() => setAudienceType('selected')}
                  />
                  <span>Selected Users</span>
                </label>
              </div>
            </div>


            {/* Picker */}
            {audienceType === 'selected' && (
              <div className="space-y-3 rounded-lg border p-3">
                <Label>Select Users</Label>
                <Input
                  placeholder="Search by username or email…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <div className="max-h-60 overflow-auto rounded-md border">
                  {usersLoading ? (
                    <div className="space-y-2 p-3">
                      {Array.from({ length: 6 })?.map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-4 w-4 rounded bg-gray-200" />
                          <div className="h-4 w-40 bg-gray-200" />
                        </div>
                      ))}
                    </div>
                  ) : filteredUsers?.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">No users found.</div>
                  ) : (
                    <ul className="divide-y">
                      {filteredUsers?.map((u: UsersPickLIst) => {
                        const checked = selectedUserIds.includes(u._id);
                        return (
                          <li key={u._id} className="flex items-center justify-between p-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{u.name || u.email}</p>
                              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                              {u.status === 'inactive' && (
                                <p className="text-xs text-amber-600">Inactive</p>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => toggleUser(u._id, e.target.checked)}
                              aria-label={`Select ${u.name || u.email}`}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Selected: {selectedUserIds.length}</div>
              </div>
            )}

            <Button onClick={handleSend} disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              {loading ? 'Sending…' : audienceType === 'all' ? 'Send to All Users' : 'Send to Selected Users'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>Recently sent notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={notifications}
              searchKey="title"
              isLoading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
