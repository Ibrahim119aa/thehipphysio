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
import { EducationalCategoryModal } from '@/components/educational-categories/EducationalCategoryModal';
import {
  EducationalCategory,
  useEducationalCategoryStore,
} from '@/stores/useEducationalCategoryStore';

/** Controlled row actions to avoid lingering overlays */
function RowActions({
  category,
  onEdit,
  onDelete,
}: {
  category: EducationalCategory;
  onEdit: (c: EducationalCategory) => void;
  onDelete: (c: EducationalCategory) => void;
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

export default function EducationalCategoriesPage() {
  // NOTE: no selector object => avoids getServerSnapshot issues
  const {
    categories,
    loading,
    pagination,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useEducationalCategoryStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EducationalCategory | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories(1, 10);
  }, [fetchCategories]);

  const openCreateModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenModal = (category: EducationalCategory | null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleOpenConfirm = (category: EducationalCategory) => {
    setSelectedCategory(category);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCategory) {
      await deleteCategory(selectedCategory._id);
      await fetchCategories(pagination?.currentPage || 1, 10);
    }
    handleCloseConfirm();
  };

  // Modal submit expects a plain object (no files here)
  const handleFormSubmit = async (payload: {
    title: string;
    description: string;
  }) => {
    setSaving(true);
    try {
      if (selectedCategory) {
        await updateCategory({ _id: selectedCategory._id, ...payload });
      } else {
        await addCategory(payload);
      }
      await fetchCategories(pagination?.currentPage || 1, 10);
      handleCloseModal();
    } finally {
      setSaving(false);
    }
  };

  // ── Debug + Guard: ensure rows have title/description; log the first bad one
  const isCategory = (x: unknown): x is EducationalCategory =>
    !!x &&
    typeof (x as EducationalCategory).title === 'string' &&
    typeof (x as EducationalCategory).description === 'string' &&
    typeof (x as EducationalCategory)._id === 'string';

  const firstBadIndex = categories.findIndex((c) => !isCategory(c));
  if (firstBadIndex !== -1) {
    // See exactly what broke your list (undefined row or wrong shape)
    // Check your Network → Response for create/update shape (category vs data)
    console.warn(
      'Bad category row at index:',
      firstBadIndex,
      categories[firstBadIndex]
    );
  }

  const safeCategories = categories.filter(isCategory);

  // Columns: only Title / Description / Actions
  const columns: ColumnDef<EducationalCategory>[] = [
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
        title="Educational Categories"
        actionButtonText="Add New Category"
        onActionButtonClick={openCreateModal}
      />

      <DataTable
        columns={columns}
        data={safeCategories}
        searchKey="title"
        isLoading={loading && categories.length === 0}
        pagination={pagination ? {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          onPageChange: (newPage) => fetchCategories(newPage, 10),
        } : undefined}
      />

      <EducationalCategoryModal
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
