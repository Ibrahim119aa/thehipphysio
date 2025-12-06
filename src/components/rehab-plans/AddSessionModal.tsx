'use client';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

import type { Exercise, RehabPlan } from '@/lib/types';
import { useExerciseStore } from '@/stores/useExerciseStore';

const schema = z.object({
  weekNumber: z.coerce.number().int().min(1, 'Week must be at least 1'),
  dayNumber: z.coerce.number().int().min(1, 'Day must be 1-7').max(7, 'Day must be 1-7'),
});

type FormInput = z.input<typeof schema>;

type InputValue = string | number | readonly string[] | undefined;
const toInputValue = (v: unknown): InputValue => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number' || typeof v === 'string') return v;
  return ''; // fallback so TS never sees `{}` here
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: RehabPlan | null;
  onSubmit: (p: {
    weekNumber: number;
    dayNumber: number;
    title: string;          // e.g. "week 1 - day 2"
    exerciseIds: string[];
  }) => void;
  isLoading: boolean;
}

export function AddSessionModal({
  isOpen,
  onClose,
  plan,
  onSubmit,
  isLoading,
}: Props) {
  // use the store as-is (no selector object => avoids getServerSnapshot issues)
  const { exercises, fetchExercises, loading: exLoading } = useExerciseStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen && (!exercises || exercises.length === 0)) {
      fetchExercises();
    }
  }, [isOpen, exercises, fetchExercises]);


  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
      setQuery('');
    }
  }, [isOpen, plan?._id]);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { weekNumber: 1, dayNumber: 1 },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises ?? [];
    return (exercises ?? []).filter((e) => {
      const inName = e.name?.toLowerCase().includes(q);
      const inTags = (e.tags ?? []).join(',').toLowerCase().includes(q);
      const inCat = (e.category?.title ?? '').toLowerCase().includes(q);
      return inName || inTags || inCat;
    });
  }, [exercises, query]);

  const toggle = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)));
  };

  const selectVisible = () => {
    const ids = (filtered ?? []).map((e) => e._id).filter(Boolean) as string[];
    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };
  const clearAll = () => setSelectedIds([]);

  const handleSubmitForm: SubmitHandler<FormInput> = (values) => {
    const title = `week ${values.weekNumber} - day ${values.dayNumber}`;
    onSubmit({
      weekNumber: Number(values.weekNumber),
      dayNumber: Number(values.dayNumber),
      title,
      exerciseIds: selectedIds,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[860px] max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            Add Session  {plan?.name ? `— ${plan.name}` : ''}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="add-session-form" onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-4">
            {/* Week / Day / Bulk */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="weekNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={toInputValue(field.value)}
                        onChange={(e) => field.onChange(e.currentTarget.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dayNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day (1–7)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={7}
                        value={toInputValue(field.value)}
                        onChange={(e) => field.onChange(e.currentTarget.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col">
                <FormLabel className="opacity-0 select-none">Actions</FormLabel>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={selectVisible}>Select visible</Button>
                  <Button type="button" variant="outline" onClick={clearAll}>Clear</Button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div>
              <FormLabel>Search exercises</FormLabel>
              <Input
                placeholder="Filter by name, tag, or category…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Exercises list (with thumbnails) */}
            <div>
              <FormLabel>Exercises</FormLabel>
              <ScrollArea className="h-[360px] rounded-md border p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                  {(filtered ?? []).map((ex: Exercise) => (
                    <label key={ex._id} className="flex items-center gap-3 rounded-md border p-2 hover:bg-accent transition">
                      <Checkbox
                        checked={selectedIds.includes(ex._id)}
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
                        <div className="font-medium truncate">{ex.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {(ex.category?.title ?? '—')} • {(ex.bodyPart ?? '—')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {((filtered ?? []).length === 0) && (
                  <div className="text-sm text-muted-foreground py-6 text-center">
                    {exLoading ? 'Loading exercises…' : 'No exercises found.'}
                  </div>
                )}
              </ScrollArea>
            </div>
          </form>
        </Form>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="add-session-form" disabled={isLoading || exLoading}>
            {isLoading ? 'Saving…' : 'Save Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
