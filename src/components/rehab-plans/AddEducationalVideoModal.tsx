'use client';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import {
    Form,  FormLabel,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

import type {  RehabPlan } from '@/lib/types';
import { EducationalVideo, useEducationalVideoStore } from '@/stores/useEducationalVideoStore';

const schema = z.object({
    weekNumber: z.coerce.number().int().min(1, 'Week must be at least 1'),
    dayNumber: z.coerce.number().int().min(1, 'Day must be 1-7').max(7, 'Day must be 1-7'),
});

type FormInput = z.input<typeof schema>;



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

export function AddEducationalVideoModal({
    isOpen,
    onClose,
    plan,
    onSubmit,
    isLoading,
}: Props) {
    // use the store as-is (no selector object => avoids getServerSnapshot issues)
    const {
        videos,
        loading,
        fetchVideos,
    } = useEducationalVideoStore();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (isOpen && (!videos || videos.length === 0)) {
            fetchVideos();
        }
    }, [isOpen, videos, fetchVideos]);


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
        if (!q) return videos ?? [];
        return (videos ?? []).filter((e) => {
            const inName = e.title?.toLowerCase().includes(q);
            const inCat = (e.description ?? '').toLowerCase().includes(q)
            return inName || inCat;
        });
    }, [videos, query]);

    const toggle = (id: string, checked: boolean) => {
        setSelectedIds((prev) => (checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)));
    };

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
                        Add Educational Video in {plan?.name ? `— ${plan.name}` : ''} Plan
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form id="add-session-form" onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-4">

                        <div>
                            <FormLabel>Educational Videos</FormLabel>
                            <ScrollArea className="h-[360px] rounded-md border p-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {(filtered ?? []).map((ex: EducationalVideo) => (
                                        <label key={ex._id} className="flex items-center gap-3 rounded-md border p-2 hover:bg-accent transition">
                                            <Checkbox
                                                checked={selectedIds.includes(ex._id)}
                                                onCheckedChange={(checked) => toggle(ex._id, Boolean(checked))}
                                            />
                                            {ex.thumbnailUrl ? (
                                                <Image width={48} height={48} src={ex.thumbnailUrl} alt={ex.title} className="h-12 w-12 rounded object-cover border" />
                                            ) : (
                                                <div className="h-12 w-12 rounded bg-muted grid place-items-center text-xs text-muted-foreground">
                                                    No image
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">{ex.title}</div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {(ex.description ?? '—')}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {((filtered ?? []).length === 0) && (
                                    <div className="text-sm text-muted-foreground py-6 text-center">
                                        {loading ? 'Loading exercises…' : 'No Education Video found.'}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </form>
                </Form>

                <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="add-session-form" disabled={isLoading || loading}>
                        {isLoading ? 'Saving…' : 'Save Educational Video'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
