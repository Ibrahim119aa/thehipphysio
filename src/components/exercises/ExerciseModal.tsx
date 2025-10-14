
'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Exercise } from '@/lib/types';
import { useCategoryStore } from '@/stores/useCategoryStore';

// ────────────────────────────────────────────────────────────────────────────────
// Zod v4 schema (no required_error on z.string). Use min(1, '...') for required.
// Note: z.coerce.number() ⇒ input type is unknown, output type is number.
// ────────────────────────────────────────────────────────────────────────────────
const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  category: z.string().min(1, 'Category is required.'),
  reps: z.string().min(1, 'Reps are required.'),
  sets: z.string().min(1, 'Sets are required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  tags: z.string().min(2, 'At least one tag is required.'),
  bodyPart: z.string().min(2, 'Body part is required.'),
  difficulty: z.enum(['Beginner', 'Medium', 'Advanced']),
  estimatedDuration: z.coerce.number().optional(),
  // File inputs come in as FileList (or undefined)
  video: z.any().refine((file) => file != null, {
    message: "Video is required.",
  }),
  thumbnail: z.any().optional()
});

// Very important with z.coerce: type the form with the **input** type
type FormInput = z.input<typeof formSchema>;

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initialData?: Exercise | null;
  isLoading: boolean;
}

export function ExerciseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: ExerciseModalProps) {
  const { categories, fetchCategories } = useCategoryStore();

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      reps: '',
      sets: '',
      description: '',
      tags: '',
      bodyPart: '',
      difficulty: 'Medium',
      // leave estimatedDuration undefined (optional)
      // video & thumbnail default to undefined automatically
    },
  });

  useEffect(() => {
    const getCategories = async () => {
      await fetchCategories();
    };
    if (isOpen && categories.length === 0) getCategories();
  }, [isOpen, fetchCategories, categories.length]);


  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        category: (initialData as { category?: { _id: string } })?.category?._id ?? '', // guard for safety
        reps: String(initialData.reps ?? ''),
        sets: String(initialData.sets ?? ''),
        description: initialData.description ?? '',
        tags: (initialData.tags ?? []).join(', '),
        bodyPart: initialData.bodyPart ?? '',
        difficulty: initialData.difficulty as 'Beginner' | 'Medium' | 'Advanced',
        estimatedDuration: initialData.estimatedDuration as unknown, // input type can be unknown
      });
    } else {
      form.reset();
    }
  }, [initialData, form, isOpen]);

  const handleFormSubmit: SubmitHandler<FormInput> = (values) => {
    const formData = new FormData();

    // Append simple fields
    formData.append('name', String(values.name ?? ''));
    formData.append('category', String(values.category ?? ''));
    formData.append('reps', String(values.reps ?? ''));
    formData.append('sets', String(values.sets ?? ''));
    formData.append('description', String(values.description ?? ''));
    formData.append('tags', String(values.tags ?? ''));
    formData.append('bodyPart', String(values.bodyPart ?? ''));
    formData.append('difficulty', String(values.difficulty ?? 'Medium'));

    if (values.estimatedDuration !== undefined && values.estimatedDuration !== null && values.estimatedDuration !== '') {
      formData.append('estimatedDuration', String(values.estimatedDuration));
    }

    // Append files (first file only as per your logic)
    const maybeAppendFirst = (key: 'video' | 'thumbnail', fl: unknown) => {
      const fileList = fl as FileList | undefined | null;
      if (fileList && fileList[0]) formData.append(key, fileList[0]);
    };
    maybeAppendFirst('video', values.video);
    maybeAppendFirst('thumbnail', values.thumbnail);

    if (initialData?._id) {
      formData.append('_id', initialData._id);
    }

    onSubmit(formData);
  };

  console.log('categories', categories);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[625px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Exercise' : 'Add New Exercise'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="exercise-form"
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex-1 overflow-y-auto pr-6 -mr-6 space-y-4"
          >
            {/* Name and Body Part */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bodyPart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Part</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Legs, Core" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category, Reps, Sets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reps</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sets</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Difficulty and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => {
                  const { value, onChange, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Duration (mins)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          // value must be string | number | undefined (not unknown)
                          value={value === undefined || value === null ? '' : String(value)}
                          onChange={(e) => {
                            const v = e.currentTarget.value;
                            // keep optional truly optional
                            onChange(v === '' ? undefined : v);
                          }}
                          {...rest}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Description and Tags */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma separated)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Uploads (avoid passing value to file inputs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="video"
                render={({ field: { onChange, name, ref } }) => (
                  <FormItem>
                    <FormLabel>Video File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="video/*"
                        name={name}
                        ref={ref}
                        onChange={(e) => onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field: { onChange, name, ref } }) => (
                  <FormItem>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        name={name}
                        ref={ref}
                        onChange={(e) => onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="exercise-form" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
