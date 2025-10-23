
'use client';

import { useEffect, useState } from 'react';
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
import { RehabPlanCategory } from '@/stores/rehabPlanCategories';
import { PlanEquipmentModal } from '@/components/plan-equipments/PlanEquipmentModal';
import { useRehabPlanEquipmentStore } from '@/stores/rehabPlanEquipments';

function RowActions({
  category,
  onEdit,
  onDelete,
}: {
  category: RehabPlanCategory;
  onEdit: (c: RehabPlanCategory) => void;
  onDelete: (c: RehabPlanCategory) => void;
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
        <DropdownMenuItem
          onSelect={() => {
            setOpen(false);
            onEdit(category);
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500"
          onSelect={() => {
            setOpen(false);
            onDelete(category);
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ExerciseCategoriesPage() {
  const {
    rehabPlanEquipment ,
    loading,
    fetchRehabPlanEquipment,
    addRehabPlanEquipment,
    updateRehabPlanEquipment,
    deleteRehabPlanEquipment,
  } = useRehabPlanEquipmentStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<RehabPlanCategory | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRehabPlanEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenModal = (category: RehabPlanCategory | null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleOpenConfirm = (category: RehabPlanCategory) => {
    setSelectedCategory(category);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCategory) {
      await deleteRehabPlanEquipment(selectedCategory._id);
      await fetchRehabPlanEquipment();
    }
    handleCloseConfirm();
  };

  const handleFormSubmit = async (payload: { title: string; description: string }) => {
    setSaving(true);
    try {
      if (selectedCategory) {
        await updateRehabPlanEquipment({ _id: selectedCategory._id, ...payload });
      } else {
        await addRehabPlanEquipment(payload);
      }
      await fetchRehabPlanEquipment();
      handleCloseModal();
    } finally {
      setSaving(false);
    }
  };

  const isCategory = (x: unknown): x is RehabPlanCategory => !!x && typeof (x as RehabPlanCategory).title === 'string' && typeof (x as RehabPlanCategory)._id === 'string';

  const safeCategories = rehabPlanEquipment.filter(isCategory);

  const columns: ColumnDef<RehabPlanCategory>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: (c) => <div className="font-medium">{c.title}</div>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: (c) => (
        <div className="text-sm text-muted-foreground line-clamp-2">
          {c.description}
        </div>
      ),
    },
    {
      accessorKey: '_id',
      header: 'Actions',
      cell: (category) => (
        <RowActions
          category={category}
          onEdit={(c) => handleOpenModal(c)}
          onDelete={(c) => handleOpenConfirm(c)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Rehab Plan Equipments"
        actionButtonText="Add New Rehab Plan Equipment"
        onActionButtonClick={openCreateModal}
      />

      <DataTable
        columns={columns}
        data={safeCategories}
        searchKey="title"
        isLoading={loading && rehabPlanEquipment.length === 0}
      />

      <PlanEquipmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={selectedCategory}
        isLoading={saving}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDeleteConfirm}
        title="Delete category?"
        description={`This will permanently delete "${selectedCategory?.title ?? ''}".`}
      />
    </div>
  );
}
