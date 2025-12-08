'use client';

import { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { EducationalCategory } from '@/stores/useEducationalCategoryStore';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(5, 'Description must be at least 5 characters.'),
});

type FormInput = z.input<typeof formSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => Promise<void>;
  initialData?: EducationalCategory | null;
  isLoading: boolean;
}

export function EducationalCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: Props) {
  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '' },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description ?? '',
      });
    } else {
      form.reset({ title: '', description: '' });
    }
  }, [initialData, form, isOpen]);


  const handleFormSubmit: SubmitHandler<FormInput> = async (values) => {
    const payload = { title: values.title, description: values.description };
    await onSubmit(payload);                                                 
    form.reset({ title: '', description: '' });                              
    onClose();                                                               
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="educational-category-form"
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
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
          <Button type="submit" form="educational-category-form" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
