
'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

import { PageHeader } from '@/components/common/PageHeader';
import { useRehabPlanStore } from '@/stores/useRehabPlanStore';
import { AddExercisesToSessionModal } from '@/components/rehab-plans/AddExercisesToSessionModal';
import { Trash2 } from 'lucide-react';
import { useRehabPlanEducationalVideoStore } from '@/stores/useRehabPlanEducationalVideo';
import type { RehabPlan } from '@/lib/types';

export default function RehabPlanEducationalVideos() {
    // plans list
    const { plans, fetchPlans, loading: plansLoading } = useRehabPlanStore();
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');

    // schedule store
    const {
        educationalVideos,
        fetchRehabPlanEducationalVideo,
        removeVideoFromPlan,
        loading: scheduleLoading,
    } = useRehabPlanEducationalVideoStore();

    // modal for add exercises to a specific session
    const [targetSessionId, setTargetSessionId] = useState<string | null>(null);
    const [targetSessionTitle, setTargetSessionTitle] = useState<string | undefined>(undefined);
    const [alreadyIn, setAlreadyIn] = useState<string[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);

    useEffect(() => {
        if (!plans?.length) fetchPlans();
    }, [plans?.length, fetchPlans]);

    useEffect(() => {
        if (selectedPlanId) fetchRehabPlanEducationalVideo(selectedPlanId);
    }, [selectedPlanId, fetchRehabPlanEducationalVideo]);


    useEffect(() => {
        if (!selectedPlanId && (plans ?? []).length > 0) {
            setSelectedPlanId((plans[0] as RehabPlan)._id);
        }
    }, [plans, selectedPlanId]);



    const openAddExercises = (sessionId: string, title: string, existing: string[]) => {
        setTargetSessionId(sessionId);
        setTargetSessionTitle(title);
        setAlreadyIn(existing);
        setIsAddOpen(true);
    };
    const closeAddExercises = () => {
        setIsAddOpen(false);
        setTargetSessionId(null);
        setTargetSessionTitle(undefined);
        setAlreadyIn([]);
    };

    const handleAddExercises = async (exerciseIds: string[]) => {
        // if (!targetSessionId || exerciseIds.length === 0) return;
        // const ok = await addExercisesToSession({ sessionId: targetSessionId, exerciseIds });
        // if (ok) closeAddExercises();
    };

    const handleRemoveVideoFromPlan = async (videoId: string, planId: string) => {
        await removeVideoFromPlan({ planId, videoId });
    };

    return (
        <div className="space-y-4">
            <PageHeader
                title="Rehab Plan Educational Videos"
                actionButtonText=""
                onActionButtonClick={() => { }}
            />

            {/* Plan picker */}
            <div className="flex items-center gap-3">
                <label className="text-sm font-medium min-w-24">Select Plan</label>
                <select
                    className="w-full max-w-md h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    disabled={plansLoading}
                >
                    {(plans ?? []).map((p: unknown) => (
                        <option key={(p as RehabPlan)._id} value={(p as RehabPlan)._id}>
                            {(p as RehabPlan).phase ? `${(p as RehabPlan).name} — ${(p as RehabPlan).phase}` : (p as RehabPlan).name}
                        </option>
                    ))}
                </select>
                <Button variant="outline" onClick={() => selectedPlanId && fetchRehabPlanEducationalVideo(selectedPlanId)} disabled={!selectedPlanId || scheduleLoading}>
                    Refresh
                </Button>
            </div>

            {/* Schedule view */}
            <div className="space-y-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {!educationalVideos || scheduleLoading ? (
                    <div className="text-sm text-muted-foreground">Loading Educational Videos…</div>
                ) : educationalVideos.video.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No Video yet for this plan.</div>
                ) : (
                    educationalVideos.video.map((w, id) => (
                        <div key={id} >

                            <div className="flex items-center gap-3 rounded-md border p-2">
                                {w.thumbnailUrl ? (
                                    <Image
                                        width={48}
                                        height={48}
                                        src={w.thumbnailUrl}
                                        alt={w.title}
                                        className="h-12 w-12 rounded object-cover border"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded bg-muted grid place-items-center text-xs text-muted-foreground">
                                        No image
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">{w.title}</div>

                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleRemoveVideoFromPlan(w._id, selectedPlanId)}
                                    aria-label="Remove Plan Video"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                        </div>



                    ))
                )}
            </div>

            {/* Add exercises modal */}
            <AddExercisesToSessionModal
                isOpen={isAddOpen}
                onClose={closeAddExercises}
                sessionTitle={targetSessionTitle}
                alreadyInSession={alreadyIn}
                onSubmit={handleAddExercises}
                isLoading={scheduleLoading}
            />
        </div>
    );
}
