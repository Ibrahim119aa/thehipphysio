'use client';

import { useEffect, useState } from 'react';
import { useExerciseStore } from '@/stores/useExerciseStore';
import { Exercise } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { ColumnDef, DataTable } from '@/components/common/DataTables';
import { PageHeader } from '@/components/common/PageHeader';
import { ExerciseModal } from '@/components/exercises/ExerciseModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

/* Row Action Menu */
function RowActions({
  exercise,
  onEdit,
  onDelete,
}: {
  exercise: Exercise;
  onEdit: (e: Exercise) => void;
  onDelete: (e: Exercise) => void;
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
        <DropdownMenuItem onSelect={() => { setOpen(false); onEdit(exercise); }}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500"
          onSelect={() => { setOpen(false); onDelete(exercise); }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ExercisesPage() {
  const {
    exercises,
    loading,
    pagination,
    fetchExercises,
    addExercise,
    updateExercise,
    deleteExercise,
  } = useExerciseStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalKey, setModalKey] = useState(0);

  /* Load first page */
  useEffect(() => {
    fetchExercises(1, 10);
  }, []);

  const handleOpenModal = (exercise: Exercise | null = null) => {
    setSelectedExercise(exercise);
    setModalKey(k => k + 1);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExercise(null);
  };

  const handleOpenConfirm = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setSelectedExercise(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedExercise) {
      await deleteExercise(selectedExercise._id);
      await fetchExercises(pagination?.currentPage || 1, 10);
    }
    handleCloseConfirm();
  };

  const handleFormSubmit = async (formData: FormData) => {
    const success = selectedExercise
      ? await updateExercise(formData)
      : await addExercise(formData);

    if (success) {
      handleCloseModal();
      await fetchExercises(pagination?.currentPage || 1, 10);
    }
  };

  const columns: ColumnDef<Exercise>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (row) => <div className="font-medium">{row.name}</div>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: (row) => row.category?.title ?? '—',
    },
    {
      accessorKey: 'bodyPart',
      header: 'Body Part',
      cell: (row) => row.bodyPart,
    },
    {
      accessorKey: 'difficulty',
      header: 'Difficulty',
      cell: (row) => (
        <Badge variant={row.difficulty === 'Advanced' ? 'destructive' : 'secondary'}>
          {row.difficulty}
        </Badge>
      ),
    },
    { accessorKey: 'reps', header: 'Reps', cell: (row) => row.reps },
    { accessorKey: 'sets', header: 'Sets', cell: (row) => row.sets },
    {
      accessorKey: '_id',
      header: 'Actions',
      cell: (row) => (
        <RowActions
          exercise={row}
          onEdit={handleOpenModal}
          onDelete={handleOpenConfirm}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Exercise Library"
        actionButtonText="Add New Exercise"
        onActionButtonClick={() => handleOpenModal()}
      />

      <DataTable<Exercise>
        columns={columns}
        data={exercises}
        searchKey="name"
        isLoading={loading && exercises.length === 0}
        pagination={pagination ? {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          onPageChange: (newPage) => fetchExercises(newPage, 10),
        } : undefined}
      />

      <ExerciseModal
        key={selectedExercise?._id ?? `new-${modalKey}`}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={selectedExercise}
        isLoading={loading}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDeleteConfirm}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete the "${selectedExercise?.name ?? ''}" exercise.`}
      />
    </div>
  );
}
