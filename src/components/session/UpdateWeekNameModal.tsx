'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectWeekNumber: string;
  weekName: string;
  selectPlanId: string;
  onSubmit: (planId: string, week: string, weekName: string) => void;
  isLoading: boolean;
}

export function UpdateWeekNameModal({
  isOpen,
  onClose,
  selectWeekNumber,
  selectPlanId,
  weekName,
  onSubmit,
  isLoading,
}: Props) {
  const [filter, setFilter] = useState(weekName);

  // ✅ Update input when modal opens or weekName changes
  useEffect(() => {
    if (isOpen) {
      setFilter(weekName || '');
    }
  }, [isOpen, weekName]);

  const handleAssign = () => {
    onSubmit(selectPlanId, selectWeekNumber, filter);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Update Week Name</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Enter week name…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
