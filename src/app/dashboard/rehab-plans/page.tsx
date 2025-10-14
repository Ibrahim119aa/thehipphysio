
'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef, DataTable } from '@/components/common/DataTables';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

import { RehabPlanModal } from '@/components/rehab-plans/RehabPlanModal';
import { AssignPlanModal } from '@/components/rehab-plans/AssignPlanModal';
import { AddSessionModal } from '@/components/rehab-plans/AddSessionModal';

import { useRehabPlanStore } from '@/stores/useRehabPlanStore';
import { useUserStore } from '@/stores/useUserStore';
import { RehabPlan } from '@/lib/types';
import { AddEducationalVideoModal } from '@/components/rehab-plans/AddEducationalVideoModal';

const isPlan = (x: unknown): x is RehabPlan => !!x && typeof (x as RehabPlan)._id === 'string';

/** Row actions — menu closes before opening any overlay */
function RowActions({
  plan,
  onEdit,
  onAddSession,
  openAddEducationalVideo,
  onAssign,
  onDelete,
  onDuplicate
}: {
  plan: RehabPlan;
  onEdit: (p: RehabPlan) => void;
  onAddSession: (p: RehabPlan) => void;
  openAddEducationalVideo: (p: RehabPlan) => void;
  onDuplicate: (p: RehabPlan) => void;
  onAssign: (p: RehabPlan) => void;
  onDelete: (p: RehabPlan) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => { setOpen(false); onEdit(plan); }}>
          Edit Plan
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { setOpen(false); onAddSession(plan); }}>
          Add Session
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { setOpen(false); openAddEducationalVideo(plan); }}>
          Add Educational Video
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { setOpen(false); onAssign(plan); }}>
          Assign to User
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { setOpen(false); onDuplicate(plan); }}>
          Duplicate Plan
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500"
          onSelect={() => { setOpen(false); onDelete(plan); }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
type AddPlanInput = {
  name: string;
  planType: "free" | "monthly-paid" | 'yearly-paid';
  totalWeeks: number;
  description?: string;
  weekStart: number;
  weekEnd: number;
  category: string[];
  equipment: string[];
};
type UpdatePlanInput = {
  _id: string;
  name: string;
  planType: "free" | "monthly-paid" | "yearly-paid";
  totalWeeks: number;
  description?: string;
  weekStart: number;
  weekEnd: number;
  category: string[];
  equipment: string[];
};
export default function RehabPlansPage() {
  const {
    plans,
    loading,
    fetchPlans,

    addPlan,
    updatePlan,
    duplicatePlan,
    deletePlan,
    assignPlanToUser,
    createRehabPlanEducationVideo,
    createSessionAndAttach, // session-first flow
  } = useRehabPlanStore();

  const { usersPickList, fetchUsersPickList } = useUserStore();

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [isAddEducationalVideoOpen, setIsAddEducationalVideoOpen] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<RehabPlan | null>(null);

  useEffect(() => {
    if (!plans || plans.length === 0) {
      fetchPlans();
    }
  }, [plans, fetchPlans]);


  // Create/Edit
  const openCreate = () => { setSelectedPlan(null); setIsPlanModalOpen(true); };
  const openEdit = (plan: RehabPlan) => {
    console.log("this is edit plan");
    console.log(plan);
    setSelectedPlan(plan);
    setIsPlanModalOpen(true);
  };
  const closePlanModal = () => { setIsPlanModalOpen(false); setSelectedPlan(null); };

  // Add Session
  const openAddSession = (plan: RehabPlan) => { setSelectedPlan(plan); setIsAddSessionOpen(true); };
  const closeAddSession = () => { setIsAddSessionOpen(false); setSelectedPlan(null); };


  const openAddEducationalVideo = (plan: RehabPlan) => { setSelectedPlan(plan); setIsAddEducationalVideoOpen(true); };
  const closeAddEducationalVideo = () => { setIsAddEducationalVideoOpen(false); setSelectedPlan(null); };

  const handleAddSessionSubmit = async (p: {
    weekNumber: number; dayNumber: number; title: string; exerciseIds: string[];
  }) => {
    if (!selectedPlan) return;
    const ok = await createSessionAndAttach({ planId: selectedPlan._id, ...p });
    if (ok) closeAddSession();
  };


  const handleAddEducationalVideoSubmit = async (p: {
    title: string; exerciseIds: string[];
  }) => {
    console.log("this is submit plan");
    console.log(selectedPlan?._id);
    console.log(p);

    if (!selectedPlan) return;
    const ok = await createRehabPlanEducationVideo({ planId: selectedPlan._id, title: p.title, videoIds: p.exerciseIds });
    if (ok) closeAddEducationalVideo();
  };

  const duplicateRehabPlan = async (plan: RehabPlan) => {
    console.log("this is rehab plan");
    console.log(plan);

    setSelectedPlan(plan);

    // ✅ Call the store method (not itself!)
    const ok = await duplicatePlan(plan._id);

    if (ok) closePlanModal();
  };
  // Assign
  const openAssign = async (plan: RehabPlan) => {
    setSelectedPlan(plan);
    if (!usersPickList?.length) await fetchUsersPickList();
    setIsAssignOpen(true);
  };
  const closeAssign = () => { setIsAssignOpen(false); setSelectedPlan(null); };

  // Delete
  const openDelete = (plan: RehabPlan) => { setSelectedPlan(plan); setIsConfirmOpen(true); };
  const closeDelete = () => { setIsConfirmOpen(false); setSelectedPlan(null); };
  const handleDeleteConfirm = async () => {
    if (selectedPlan) await deletePlan(selectedPlan._id);
    closeDelete();
  };

  // Submit plan (create/update)
  const handlePlanSubmit = async (payload: Record<string, unknown>) => {
    console.log("this is payload");
    console.log(payload);
    const ok = selectedPlan
      ? await updatePlan({
        _id: selectedPlan._id,
        ...payload
      } as UpdatePlanInput)
      : await addPlan(payload as AddPlanInput);

    if (ok) closePlanModal();
  };


  // Submit assign
  const handleAssignSubmit = async (userId: string) => {
    if (!selectedPlan) return;
    const ok = await assignPlanToUser({ planId: selectedPlan._id, userId });
    if (ok) closeAssign();
  };

  const safePlans = (plans ?? []).filter(isPlan);

  const columns: ColumnDef<RehabPlan>[] = [
    {
      accessorKey: 'name',
      header: 'Plan Name',
      cell: (row) => <div className="font-medium">{row.name}</div>,
    },
    {
      accessorKey: 'planType',
      header: 'Type',
      cell: (row) => (
        <Badge variant={(row.planType === 'monthly-paid' || row.planType === 'yearly-paid') ? 'default' : 'outline'}>
          {row.planType === 'monthly-paid' ? 'Monthly Paid':row.planType === 'yearly-paid'?'Yearly Paid' : 'Free'}
        </Badge>
      ),
    },
    {
      accessorKey: 'planDurationInWeeks',
      header: 'Duration',
      cell: (row) => (row.openEnded ? 'Open-ended' : `${row.planDurationInWeeks ?? 0} weeks`),
    },
    {
      accessorKey: 'phase',
      header: 'Phase',
      cell: (row) => row.phase ?? '—',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: (row) => ((row.planType === 'monthly-paid' || row.planType === 'yearly-paid') ? `£${Number(row.price ?? 0).toFixed(2)}` : '—'),
    },
    {
      accessorKey: '_id',
      header: 'Actions',
      cell: (row) => (
        <RowActions
          plan={row}
          onDuplicate={duplicateRehabPlan}
          onEdit={openEdit}
          onAddSession={openAddSession}
          openAddEducationalVideo={openAddEducationalVideo}
          onAssign={openAssign}
          onDelete={openDelete}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Rehab Plans"
        actionButtonText="Create New Plan"
        onActionButtonClick={openCreate}
      />

      <DataTable
        columns={columns}
        data={safePlans}
        searchKey="name"
        isLoading={loading && safePlans.length === 0}
      />

      <RehabPlanModal
        isOpen={isPlanModalOpen}
        onClose={closePlanModal}
        onSubmit={handlePlanSubmit}
        initialData={selectedPlan}
        isLoading={loading}
      />

      <AssignPlanModal
        isOpen={isAssignOpen}
        onClose={closeAssign}
        users={usersPickList ?? []}
        onSubmit={handleAssignSubmit}
        isLoading={loading}
      />

      <AddSessionModal
        isOpen={isAddSessionOpen}
        onClose={closeAddSession}
        plan={selectedPlan}
        onSubmit={handleAddSessionSubmit}
        isLoading={loading}
      />
      <AddEducationalVideoModal
        isOpen={isAddEducationalVideoOpen}
        onClose={closeAddEducationalVideo}
        plan={selectedPlan}
        onSubmit={handleAddEducationalVideoSubmit}
        isLoading={loading}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeDelete}
        onConfirm={handleDeleteConfirm}
        title="Delete plan?"
        description={`This will permanently delete "${selectedPlan?.name ?? ''}".`}
      />
    </div>
  );
}
