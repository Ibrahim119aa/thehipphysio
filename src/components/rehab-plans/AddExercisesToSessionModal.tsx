'use client';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormLabel,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import type { Exercise } from '@/lib/types';
import { useExerciseStore } from '@/stores/useExerciseStore';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle?: string;
  alreadyInSession: string[]; // exercise IDs already present
  onSubmit: (exerciseIds: string[]) => void;
  isLoading: boolean;
};

export function AddExercisesToSessionModal({
  isOpen,
  onClose,
  sessionTitle,
  alreadyInSession,
  onSubmit,
  isLoading,
}: Props) {
  const { exercises, fetchExercises, loading: exLoading } = useExerciseStore();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && (!exercises || exercises.length === 0)) {
      fetchExercises();
    }
  }, [isOpen, exercises, fetchExercises]);


  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelected([]);
    }
  }, [isOpen]);

  const form = useForm({ defaultValues: {} });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = exercises ?? [];
    if (!q) return list;
    return list.filter((e) => {
      const inName = e.name?.toLowerCase().includes(q);
      const inTags = (e.tags ?? []).join(',').toLowerCase().includes(q);
      const inCat = (e.category?.title ?? '').toLowerCase().includes(q);
      return inName || inTags || inCat;
    });
  }, [exercises, query]);

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => (checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)));
  };

  const save = () => {
    // Only send exercises that are not already in the session
    const toAdd = selected.filter((id) => !alreadyInSession.includes(id));
    onSubmit(toAdd);
  };

  const selectVisible = () => {
    const ids = (filtered ?? []).map((e) => e._id).filter(Boolean) as string[];
    setSelected((prev) => Array.from(new Set([...prev, ...ids])));
  };
  const clearSelection = () => setSelected([]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[860px] max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add Exercises {sessionTitle ? `— ${sessionTitle}` : ''}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="add-exercises-to-session-form" className="space-y-4" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <FormLabel>Search</FormLabel>
                <FormControl>
                  <Input placeholder="Filter by name, tag, or category…" value={query} onChange={(e) => setQuery(e.target.value)} />
                </FormControl>
              </div>
              <Button type="button" variant="secondary" onClick={selectVisible}>Select visible</Button>
              <Button type="button" variant="outline" onClick={clearSelection}>Clear</Button>
            </div>

            <ScrollArea className="h-[420px] rounded-md border p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(filtered ?? []).map((ex: Exercise) => {
                  const inSession = alreadyInSession.includes(ex._id);
                  return (
                    <label key={ex._id} className="flex items-center gap-3 rounded-md border p-2 hover:bg-accent transition">
                      <Checkbox
                        checked={selected.includes(ex._id) || inSession}
                        disabled={inSession}
                        onCheckedChange={(checked) => toggle(ex._id, Boolean(checked))}
                      />
                      {ex.thumbnailUrl ? (
                        <Image width={48} height={48} src={ex.thumbnailUrl} alt={ex.name} className="h-12 w-12 rounded object-cover border" />
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted grid place-items-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {ex.name} {inSession && <span className="text-xs text-muted-foreground">(already in)</span>}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {(ex.category?.title ?? '—')} • {(ex.bodyPart ?? '—')}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {((filtered ?? []).length === 0) && (
                <div className="text-sm text-muted-foreground py-6 text-center">
                  {exLoading ? 'Loading exercises…' : 'No exercises found.'}
                </div>
              )}
            </ScrollArea>
          </form>
        </Form>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="add-exercises-to-session-form" disabled={isLoading || exLoading}>
            {isLoading ? 'Saving…' : 'Add Selected'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
