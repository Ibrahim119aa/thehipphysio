'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PickUser = { _id: string; name: string; email?: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  users: PickUser[];
  onSubmit: (userId: string) => void;
  isLoading: boolean;
}

export function AssignPlanModal({
  isOpen,
  onClose,
  users,
  onSubmit,
  isLoading,
}: Props) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId('');
      setFilter('');
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = (filter ?? '').toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [users, filter]);

  const handleAssign = () => {
    if (selectedUserId) onSubmit(selectedUserId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Assign Plan to User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search users by name or email…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />

          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {filtered.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No users found
                </div>
              )}
              {filtered.map((u) => (
                <SelectItem key={u._id} value={u._id}>
                  {u.name} {u.email ? `— ${u.email}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedUserId || isLoading}>
            {isLoading ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
