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

/** Controlled row actions: menu always closes before opening dialogs */
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
        {/* Use onSelect so Radix closes the menu reliably */}
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
    fetchExercises,
    addExercise,
    updateExercise,
    deleteExercise,
  } = useExerciseStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalKey, setModalKey] = useState(0);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // const handleOpenModal = (exercise: Exercise | null = null) => {
  //   setSelectedExercise(exercise);
  //   setIsModalOpen(true);
  // };

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

  const handleDeleteConfirm = () => {
    if (selectedExercise) {
      deleteExercise(selectedExercise._id);
    }
    handleCloseConfirm();
  };

  const handleFormSubmit = async (formData: FormData) => {
    const success = selectedExercise
      ? await updateExercise(formData)
      : await addExercise(formData);
    if (success) {
      handleCloseModal();
      await fetchExercises();
    }
  };

  const columns: ColumnDef<Exercise>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (exercise) => <div className="font-medium">{exercise.name}</div>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: (exercise) => exercise.category?.title ?? '—',
    },
    {
      accessorKey: 'bodyPart',
      header: 'Body Part',
      cell: (exercise) => exercise.bodyPart,
    },
    {
      accessorKey: 'difficulty',
      header: 'Difficulty',
      cell: (exercise) => (
        <Badge variant={exercise.difficulty === 'Advanced' ? 'destructive' : 'secondary'}>
          {exercise.difficulty}
        </Badge>
      ),
    },
    { accessorKey: 'reps', header: 'Reps', cell: (exercise) => exercise.reps },
    { accessorKey: 'sets', header: 'Sets', cell: (exercise) => exercise.sets },
    {
      accessorKey: '_id',
      header: 'Actions',
      cell: (exercise) => (
        <RowActions
          exercise={exercise}
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
      />

      {/* Exercise Modal — only call onClose when Radix asks to CLOSE (see file change below) */}
      <ExerciseModal
        key={selectedExercise?._id ?? `new-${modalKey}`}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={selectedExercise}
        isLoading={loading}
      />

      {/* Confirm Dialog — same close guard (see file change below) */}
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
