'use client';

import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import type { User } from '@/stores/useUserStore';

// Zod schema (occupation/dob are strings in backend)
const baseSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  email: z.string().email('Enter a valid email.'),
  role: z.enum(['user', 'admin']),
  status: z.enum(['active', 'inactive']),
  occupation: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
  // allow empty string or >= 6 chars; we'll require password on create below
  password: z.union([z.string().length(0), z.string().min(6, 'Min 6 characters')]).optional(),
});

type FormInput = z.input<typeof baseSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: User | null;
  isLoading: boolean;
  onSubmit: (values: Partial<User>) => Promise<void>; // <-- NEW
}

export function UserModal({
  isOpen,
  onClose,
  initialData,
  isLoading,
  onSubmit,
}: Props) {
  const isEdit = !!initialData;

  const resolver = useMemo(() => zodResolver(baseSchema), []);
  const form = useForm<FormInput>({
    resolver,
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
      status: 'active',
      occupation: '',
      dob: '',
      password: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? '',
        email: initialData.email ?? '',
        role: initialData.role ?? 'user',
        status: initialData.status ?? 'active',
        occupation: initialData.occupation ?? '',
        dob: initialData.dob ?? '',
        password: '', // never prefill
      });
    } else {
      form.reset({
        name: '',
        email: '',
        role: 'user',
        status: 'active',
        occupation: '',
        dob: '',
        password: '',
      });
    }
  }, [initialData, form, isOpen]);

  const handleFormSubmit: SubmitHandler<FormInput> = async (values) => {
    // Enforce password on create
    if (!isEdit && !values.password) {
      form.setError('password', { type: 'manual', message: 'Password is required for new users.' });
      return;
    }

    console.log("this is dob");
    console.log(values.dob);
    console.log("this is occupation ");
    console.log(values.occupation)
    const payload: Partial<User> = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      status: values.status,
      occupation: values.occupation?.trim() || null,
      dob: values.dob?.trim() || null,
      ...(values.password && values.password.trim().length > 0
        ? { password: values.password.trim() }
        : {}),
    };
    console.log("this is payload");
    console.log(payload);


    await onSubmit(payload);
    // parent usually closes after onSubmit, but closing here is also fine:
    // onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="user-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ''}   // fix null → ''
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth (string)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="YYYY-MM-DD or any string"
                        value={field.value ?? ''}   // fix null → ''
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password {isEdit ? <span className="text-muted-foreground">(leave blank to keep)</span> : null}
                  </FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
