'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'; // if you have it; otherwise use a div with borders
import { PageHeader } from '@/components/common/PageHeader';
import { useRehabPlanStore } from '@/stores/useRehabPlanStore';
import { usePlanScheduleStore } from '@/stores/usePlanScheduleStore';
import { AddExercisesToSessionModal } from '@/components/rehab-plans/AddExercisesToSessionModal';
import { Trash2 } from 'lucide-react';
import type { RehabPlan } from '@/lib/types';

export default function RehabPlanSessionsPage() {
  // plans list
  const { plans, fetchPlans, loading: plansLoading } = useRehabPlanStore();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // schedule store
  const {
    schedule,
    loading: scheduleLoading,
    fetchSchedule,
    addExercisesToSession,
    removeExerciseFromSession,
  } = usePlanScheduleStore();

  // modal for add exercises to a specific session
  const [targetSessionId, setTargetSessionId] = useState<string | null>(null);
  const [targetSessionTitle, setTargetSessionTitle] = useState<string | undefined>(undefined);
  const [alreadyIn,   setAlreadyIn]   = useState<string[]>([]);
  const [isAddOpen,   setIsAddOpen]   = useState(false);

  useEffect(() => {
    if (!plans?.length) fetchPlans();
  }, [plans?.length, fetchPlans]);

  useEffect(() => {
    if (selectedPlanId) fetchSchedule(selectedPlanId);
  }, [selectedPlanId, fetchSchedule]);

  // choose first plan by default (once plans load)
  useEffect(() => {
    if (!selectedPlanId && (plans ?? []).length > 0) {
      setSelectedPlanId((plans![0] as RehabPlan)._id);
    }
  }, [plans?.length, selectedPlanId]);

  const headerTitle = useMemo(() => {
    const p = (plans ?? []).find((x) => x._id === selectedPlanId) as RehabPlan | undefined;
    if (!p) return 'Plan Sessions';
    return p.phase ? `${p.name} — ${p.phase}` : p.name;
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
    if (!targetSessionId || exerciseIds.length === 0) return;
    const ok = await addExercisesToSession({ sessionId: targetSessionId, exerciseIds });
    if (ok) closeAddExercises();
  };

  const handleRemoveExercise = async (sessionId: string, exerciseId: string) => {
    await removeExerciseFromSession({ sessionId, exerciseId });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Plan Sessions"
        actionButtonText=""
        onActionButtonClick={() => {}}
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
          {(plans ?? []).map((p: any) => (
            <option key={p._id} value={p._id}>
              {p.phase ? `${p.name} — ${p.phase}` : p.name}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={() => selectedPlanId && fetchSchedule(selectedPlanId)} disabled={!selectedPlanId || scheduleLoading}>
          Refresh
        </Button>
      </div>

      {/* Schedule view */}
      <div className="space-y-6">
        {!schedule || scheduleLoading ? (
          <div className="text-sm text-muted-foreground">Loading schedule…</div>
        ) : schedule.weeks.length === 0 ? (
          <div className="text-sm text-muted-foreground">No sessions yet for this plan.</div>
        ) : (
          schedule.weeks.map((w) => (
            <div key={w.week} className="space-y-3">
              <h3 className="text-lg font-semibold">Week {w.week}</h3>
              <div className="grid gap-3">
                {w.days.map((d) => (
                  <div key={`${w.week}-${d.day}`} className="rounded-md border p-3 bg-white">
                    <div className="mb-2 font-medium">Day {d.day}</div>

                    {d.sessions.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No session.</div>
                    ) : (
                      d.sessions.map((s) => (
                        <div key={s.sessionId} className="rounded-md border p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{s.title}</div>
                            <Button
                              size="sm"
                              onClick={() =>
                                openAddExercises(
                                  s.sessionId,
                                  s.title,
                                  (s.exercises ?? []).map((e) => e._id)
                                )
                              }
                            >
                              Add exercises
                            </Button>
                          </div>

                          {/* exercises list */}
                          {(s.exercises ?? []).length === 0 ? (
                            <div className="text-sm text-muted-foreground">No exercises yet.</div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {s.exercises.map((ex) => (
                                <div key={ex._id} className="flex items-center gap-3 rounded-md border p-2">
                                  {ex.thumbnailUrl ? (
                                    <img
                                      src={ex.thumbnailUrl}
                                      alt={ex.name}
                                      className="h-12 w-12 rounded object-cover border"
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded bg-muted grid place-items-center text-xs text-muted-foreground">
                                      No image
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">{ex.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {(ex.category?.title ?? '—')} • {(ex.bodyPart ?? '—')}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleRemoveExercise(s.sessionId, ex._id)}
                                    aria-label="Remove exercise"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ))}
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
