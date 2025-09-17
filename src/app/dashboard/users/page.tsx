
'use client';
import { CreateUserPayload } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

import {
  useUserStore,
  type User,
} from '@/stores/useUserStore';
import { UserModal } from '@/components/user/UserModal'; // change to '@/components/users/UserModal' if that's your path

function RowActions({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
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
            onEdit(user);
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500"
          onSelect={() => {
            setOpen(false);
            onDelete(user);
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function UsersPage() {
  const {
    users,
    loading,
    fetchUsers,
    deleteUser,
    addUser,
    updateUser,
  } = useUserStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenModal = (user: User | null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleOpenConfirm = (user: User) => {
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser._id);
      await fetchUsers();
    }
    handleCloseConfirm();
  };

  // Create/Update from modal
  const handleFormSubmit = async (values: Partial<User>) => {
    setSaving(true);
    try {
      if (selectedUser) {
        // update user
        await updateUser({ _id: selectedUser._id, ...values });
      } else {
        // create user
        if (typeof values.password === 'string') {
          const payload: CreateUserPayload = {
            name: values.name ?? '',
            email: values.email ?? '',
            role: values.role as "admin" | "user" | "therapist",
            password: values.password,
          };
          await addUser({
            name: values.name ?? '',
            email: values.email ?? '',
            password: values.password,
            role: values.role as "user" | "admin",
          });

        } else {
          throw new Error('Password is required when creating a user.');
        }
      }
      await fetchUsers();
      handleCloseModal();
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (row) => <div className="font-medium">{row.name}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: (row) => row.email,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: (row) => row.role,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'default' : 'destructive'}>
          {row.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (user) => (
        <RowActions
          user={user}
          onEdit={handleOpenModal}
          onDelete={handleOpenConfirm}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="User Management"
        actionButtonText="Add New User"
        onActionButtonClick={openCreateModal}
      />

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        isLoading={loading && users.length === 0}
      />

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={selectedUser}
        isLoading={saving}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDeleteConfirm}
        title="Delete user?"
        description={`This will permanently delete "${selectedUser?.name ?? ''}".`}
      />
    </div>
  );
}
