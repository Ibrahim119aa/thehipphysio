'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
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
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EducationalVideoModal } from '@/components/educational-videos/EducationalVideoModal';
import { useEducationalVideoStore, type EducationalVideo } from '@/stores/useEducationalVideoStore';

/** Controlled row actions: menu always closes before opening dialogs */
function RowActions({
  video,
  onEdit,
  onDelete,
}: {
  video: EducationalVideo;
  onEdit: (v: EducationalVideo) => void;
  onDelete: (v: EducationalVideo) => void;
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
        <DropdownMenuItem onSelect={() => { setOpen(false); onEdit(video); }}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500"
          onSelect={() => { setOpen(false); onDelete(video); }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function EducationalVideosPage() {
  const {
    videos,
    categories,
    loading,
    fetchVideos,
    fetchCategories,
    addVideo,
    updateVideo,
    deleteVideo,
  } = useEducationalVideoStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<EducationalVideo | null>(null);
  const [modalKey, setModalKey] = useState(0);

  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, [fetchVideos, fetchCategories]);

  const handleOpenModal = (video: EducationalVideo | null = null) => {
    setSelectedVideo(video);
    setModalKey(k => k + 1); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const handleOpenConfirm = (video: EducationalVideo) => {
    setSelectedVideo(video);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setSelectedVideo(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedVideo) deleteVideo(selectedVideo._id);
    handleCloseConfirm();
  };

  const handleFormSubmit = async (formData: FormData) => {
    const success = selectedVideo
      ? await updateVideo(formData)
      : await addVideo(formData);
    if (success) {
      handleCloseModal();
      await fetchVideos();
    }
  };

  const columns: ColumnDef<EducationalVideo>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: (v) => <div className="font-medium">{v.title}</div>,
    },
    {
      accessorKey: 'categories',
      header: 'Categories',
      cell: (v) => {
        const names = Array.isArray(v.categories)
          ? (v.categories as unknown[]).map((c) => {
              if (typeof c === 'string') {
                return categories.find((x) => x._id === c)?.title;
              }
              return typeof c === 'object' && c !== null && 'title' in c ? (c as { title: string }).title : undefined;
            }).filter(Boolean)
          : [];
        const text = names.length ? names.join(', ') : '—';
        return <span className="text-sm text-muted-foreground">{text}</span>;
      },
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: (v) => {
        const minutes = Math.floor(v.duration);
        return <span>{minutes} min {v.thumbnailUrl}</span>;
      },
    },
    {
      accessorKey: 'thumbnailUrl',
      header: 'Preview',
      cell: (v) => (
        <Image
          width={64}
          height={40}
          src={v.thumbnailUrl}
          alt={v.title}
          className="h-10 w-16 rounded object-cover border"
        />
      ),
    },
    {
      accessorKey: '_id',
      header: 'Actions',
      cell: (video) => (
        <RowActions
          video={video}
          onEdit={handleOpenModal}
          onDelete={handleOpenConfirm}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Educational Videos"
        actionButtonText="Add New Video"
        onActionButtonClick={() => handleOpenModal()}
      />

      <DataTable
        columns={columns}
        data={videos}
        searchKey="title"
        isLoading={loading && videos.length === 0}
      />

      <EducationalVideoModal
        key={selectedVideo?._id ?? `new-${modalKey}`}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={selectedVideo}
        isLoading={loading}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDeleteConfirm}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete "${selectedVideo?.title ?? ''}".`}
      />
    </div>
  );
}
