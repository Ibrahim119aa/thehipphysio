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
import { RehabPlanCategory, useRehabPlanCategoryStore } from '@/stores/rehabPlanCategories';
import { PlanCategoryModal } from '@/components/plan-categories/PlanCategoriesModal';

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
    rehabPlanCategories,
    loading,
    fetchRehabPlanCategories,
    addRehabPlanCategory,
    updateRehabPlanCategory,
    deleteRehabPlanCategory,
  } = useRehabPlanCategoryStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<RehabPlanCategory | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRehabPlanCategories();
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
      await deleteRehabPlanCategory(selectedCategory._id);
      await fetchRehabPlanCategories();
    }
    handleCloseConfirm();
  };

  const handleFormSubmit = async (payload: { title: string; description: string }) => {
    setSaving(true);
    try {
      if (selectedCategory) {
        await updateRehabPlanCategory({ _id: selectedCategory._id, ...payload });
      } else {
        await addRehabPlanCategory(payload);
      }
      await fetchRehabPlanCategories();
      handleCloseModal();
    } finally {
      setSaving(false);
    }
  };

  const isCategory = (x: any): x is RehabPlanCategory => !!x && typeof x.title === 'string' && typeof x._id === 'string';

  const safeCategories = rehabPlanCategories.filter(isCategory);

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
        title="Rehab Plan Categories"
        actionButtonText="Add New Rehab Plan Category"
        onActionButtonClick={openCreateModal}
      />

      <DataTable
        columns={columns}
        data={safeCategories}
        searchKey="title"
        isLoading={loading && rehabPlanCategories.length === 0}
      />

      <PlanCategoryModal
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
