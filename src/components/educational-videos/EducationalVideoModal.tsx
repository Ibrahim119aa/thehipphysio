
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EducationalVideo, useEducationalVideoStore } from '@/stores/useEducationalVideoStore';


// Zod schema (v4)
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  categories: z.array(z.string()).optional().default([]),
  duration: z.coerce.number().optional(),

  video: z
    .any()
    .refine((file) => {
      // ✅ Allow existing string URL (edit mode)
      if (typeof file === "string") return true;
      if (!file || file.length === 0) return false;
      return true;
    }, {
      message: "Video is required.",
    })
    .refine((file) => {
      if (typeof file === "string") return true; // ✅ Skip check for URL
      if (!file || !file[0]) return false;
      const type = file[0]?.type;
      return type === "video/mp4" || type === "video/quicktime";
    }, {
      message: "Only MP4 or MOV files are allowed.",
    })
    .refine(async (file) => {
      // ✅ Skip for existing URLs
      if (typeof file === "string") return true;
      if (!file || !file[0]) return false;

      const fl = file[0];
      if (!(fl instanceof File)) return true;

      const url = URL.createObjectURL(fl);
      return new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = url;
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          const valid = video.videoWidth <= 1280 && video.videoHeight <= 720;
          resolve(valid);
        };
        video.onerror = () => resolve(false);
      });
    }, {
      message: "Video resolution must be ≤ 1280x720 (HD).",
    }),

  thumbnail: z.any().optional(),
});


type FormInput = z.input<typeof formSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initialData?: EducationalVideo | null;
  isLoading: boolean;
}

export function EducationalVideoModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: Props) {

  const { fetchCategories, categories } = useEducationalVideoStore();

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      categories: [],
      duration: undefined,
      // video & thumbnail default undefined
    },
  });

  // fetch categories when opening
  useEffect(() => {
    if (isOpen && categories.length === 0) fetchCategories();
  }, [isOpen, fetchCategories, categories.length]);

  // Map initial categories (object[] or id[]) to id[]
  const initialCategoryIds = useMemo<string[]>(() => {
    if (!initialData?.categories) return [];
    type CategoryWithId = { _id: string };
    const arr = initialData.categories as (string | CategoryWithId)[];
    return arr.map((c) => (typeof c === 'string' ? c : c._id)).filter(Boolean);
  }, [initialData]);

  useEffect(() => {
    console.log("this is initial data ");
    console.log(initialData);
    if (initialData) {
      form.reset({
        title: initialData.title,
        video: initialData.videoUrl ?? '',
        description: initialData.description ?? '',
        categories: initialCategoryIds,
        duration: initialData.duration as unknown, // allow unknown to go into input
      });
    } else {
      form.reset();
    }
  }, [initialData, form, isOpen, initialCategoryIds]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  useEffect(() => {
    setSelectedIds(initialCategoryIds);
  }, [initialCategoryIds, isOpen]);

  const toggleCategory = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
    form.setValue(
      'categories',
      checked
        ? [...(form.getValues('categories') ?? []), id]
        : (form.getValues('categories') ?? []).filter((x) => x !== id)
    );
  };

  const handleFormSubmit: SubmitHandler<FormInput> = (values) => {
    const formData = new FormData();

    formData.append('title', String(values.title ?? ''));
    formData.append('description', String(values.description ?? ''));

    // categories — send both formats for compatibility
    const ids = (values.categories ?? []) as string[];
    if (ids.length) {
      const ids = (values.categories ?? []) as string[];
      ids.forEach((id) => formData.append('categories[]', id));
    }

    if (values.duration !== undefined && values.duration !== null && values.duration !== '') {
      formData.append('duration', String(values.duration));
    }

    const maybeAppendFirst = (key: 'video' | 'thumbnail', fl: unknown) => {
      const fileList = fl as FileList | undefined | null;
      if (fileList && fileList[0]) formData.append(key, fileList[0]);
    };
    maybeAppendFirst('video', values.video);
    maybeAppendFirst('thumbnail', values.thumbnail);

    if (initialData?._id) formData.append('_id', initialData._id);

    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[700px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Educational Video' : 'Add Educational Video'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="educational-video-form"
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex-1 overflow-y-auto pr-6 -mr-6 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                name="duration"
                render={({ field }) => {
                  const { value, onChange, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Duration (mintes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          value={value === undefined || value === null ? '' : String(value)}
                          onChange={(e) => {
                            const v = e.currentTarget.value;
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

            {/* Category multi-select (checkbox list) */}
            <FormField
              control={form.control}
              name="categories"
              render={() => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <ScrollArea className="h-36 rounded-md border p-3">
                      <div className="space-y-2">
                        {categories.length === 0 ? (
                          <div className="text-sm text-muted-foreground">No categories found.</div>
                        ) : (
                          categories.map((c) => (
                            <label key={c._id} className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedIds.includes(c._id)}
                                onCheckedChange={(checked) => toggleCategory(c._id, Boolean(checked))}
                              />
                              <span className="text-sm">{c.title}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File uploads */}
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
          <Button type="submit" form="educational-video-form" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
