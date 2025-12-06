'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RehabPlan } from '@/lib/types';
import { useRehabPlanCategoryStore } from '@/stores/rehabPlanCategories';
import { useRehabPlanEquipmentStore } from '@/stores/rehabPlanEquipments';
import { X } from 'lucide-react';
const optionalNumString = z.union([z.string(), z.number()]).optional();


// Inside your component RehabPlanModal

// Add a new form field for discount/promo code in the schema
const schema = z.object({
  name: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
  planType: z.enum(['free', 'monthly-paid', 'yearly-paid']),
  openEnded: z.boolean(),
  price: optionalNumString,
  phase: z.string().optional(),
  weekStart: optionalNumString,
  weekEnd: optionalNumString,
  planDurationInWeeks: optionalNumString,
  discountCode: z.number().default(0), // <-- add discount/promo code
})
  .refine((data) => {
    const duration = Number(data.planDurationInWeeks) || 0;

    if (data.planType === 'monthly-paid' && duration > 5) return false;
    if (data.planType === 'yearly-paid' && duration > 52) return false;

    return true;
  }, {
    message: "Invalid duration: Monthly plan can't exceed 5 weeks, yearly plan can't exceed 52 weeks.",
    path: ['planDurationInWeeks'],
  });


type FormInput = z.input<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;                     // API expects 'name'
    description?: string;
    planType: 'free' | 'monthly-paid' | 'yearly-paid';
    openEnded: boolean;
    price?: number;
    discountCode?: number;
    phase?: string;
    weekStart?: number | null;
    weekEnd?: number | null;
    planDurationInWeeks?: number;
    category: string[];               // API expects 'category'
  }) => void;
  initialData?: RehabPlan | null;
  isLoading: boolean;
}

export function RehabPlanModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: Props) {

  /** categories store */
  const { fetchRehabPlanCategories, rehabPlanCategories } = useRehabPlanCategoryStore();

  /** equipments store */
  const { fetchRehabPlanEquipment, rehabPlanEquipment } = useRehabPlanEquipmentStore();

  /** local selection state for category IDs (checkbox list) */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);


  useEffect(() => {
    if (isOpen && (!rehabPlanCategories || rehabPlanCategories.length === 0)) {
      fetchRehabPlanCategories();
    }
    if (isOpen && (!rehabPlanEquipment || rehabPlanEquipment.length === 0)) {
      fetchRehabPlanEquipment();
    }
  }, [isOpen, rehabPlanCategories, fetchRehabPlanCategories, rehabPlanEquipment, fetchRehabPlanEquipment]);


  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      planType: 'free',
      openEnded: false,
      price: '',
      phase: '',
      discountCode: 0,
      weekStart: '',
      weekEnd: '',
      planDurationInWeeks: '',
    } as unknown as FormInput,
  });

  /** initialize/reset form + category checkboxes from initialData */

  useEffect(() => {
    console.log("this is initial data");
    console.log(initialData);

    if (initialData) {
      form.reset({
        name: initialData.name ?? '',
        description: initialData.description ?? '',
        planType: initialData.planType ?? 'free',
        openEnded: !!initialData.openEnded,
        price:
          initialData.price === null || initialData.price === undefined
            ? ''
            : String(initialData.price),
        phase: initialData.phase ?? '',
        weekStart:
          initialData.weekStart === null || initialData.weekStart === undefined
            ? ''
            : String(initialData.weekStart),
        weekEnd:
          initialData.weekEnd === null || initialData.weekEnd === undefined
            ? ''
            : String(initialData.weekEnd),
        planDurationInWeeks:
          initialData.planDurationInWeeks === null ||
            initialData.planDurationInWeeks === undefined
            ? ''
            : String(initialData.planDurationInWeeks),
        discountCode: initialData.discountCode ?? 0, // <-- set discount here
      } as FormInput);

      setSelectedIds((initialData.categories ?? []).map((c) => c._id));
      setSelectedEquipmentIds((initialData.equipment ?? []).map((c) => c._id));
    } else {
      form.reset({
        name: '',
        description: '',
        planType: 'free',
        openEnded: false,
        price: '',
        phase: '',
        weekStart: '',
        weekEnd: '',
        planDurationInWeeks: '',
        discountCode: 0, // <-- default empty for new plans
      } as FormInput);

      setSelectedIds([]);
      setSelectedEquipmentIds([]);
    }
  }, [initialData, form, isOpen]);

  /** checkbox toggle helper */
  const toggleCategory = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((x) => x !== id);
    });
  };
  const toggleEquipment = (id: string, checked: boolean) => {
    setSelectedEquipmentIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((x) => x !== id);
    });
  }

  /** submit => map to API payload (note: title -> name, selectedIds -> category) */
  const handleSubmitForm: SubmitHandler<FormInput> = (values) => {
    const toNum = (v: unknown) => v === '' || v === null || v === undefined ? undefined : Number(v);

    const payload = {
      name: values.name,
      description: values.description || undefined,
      planType: values.planType,
      openEnded: !!values.openEnded,
      price: values.planType === 'free' ? 0 : toNum(values.price),
      phase: values.phase || undefined,
      weekStart: toNum(values.weekStart),
      weekEnd: toNum(values.weekEnd),
      planDurationInWeeks: toNum(values.planDurationInWeeks),
      category: selectedIds,
      equipment: selectedEquipmentIds,
      discountCode: values.discountCode || 0, // <-- include discount
    };

    console.log("this is payload");
    console.log(payload);


    onSubmit(payload);
  };

  const planType = form.watch('planType');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[720px] max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Rehab Plan' : 'Add Rehab Plan'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="rehab-plan-form"
            onSubmit={form.handleSubmit(handleSubmitForm)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Type</FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value as 'free' | 'monthly-paid' | 'yearly-paid')}
                      >
                        <option value="free">Free</option>
                        <option value="monthly-paid">Monthly-Paid</option>
                        <option value="yearly-paid">Yearly-Paid</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={4} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phase (optional) */}
            <FormField
              control={form.control}
              name="phase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phase (optional)</FormLabel>
                  <FormControl><Input placeholder="e.g., Phase 1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {planType !== 'free' && (
              <FormField
                control={form.control}
                name="discountCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter  Discount in  Percantage for coupon</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter promo code"
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.currentTarget.value))}
                      />

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}


            {/* Category multi-select (checkbox list) */}
            <FormField
              control={form.control}
              name="name" // dummy hook to keep RHF tree happy; selection is local state
              render={() => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <ScrollArea className="h-36 rounded-md border p-3">
                      <div className="space-y-2">
                        {(rehabPlanCategories ?? []).length === 0 ? (
                          <div className="text-sm text-muted-foreground">
                            No categories found.
                          </div>
                        ) : (
                          (rehabPlanCategories ?? []).map((c) => (
                            <label key={c._id} className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedIds.includes(c._id)}
                                onCheckedChange={(checked) =>
                                  toggleCategory(c._id, Boolean(checked))
                                }
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

            <FormField
              control={form.control}
              name="name" // dummy hook to keep RHF tree happy; selection is local state
              render={() => (
                <FormItem>
                  <FormLabel>Equipments</FormLabel>
                  <FormControl>
                    <ScrollArea className="h-36 rounded-md border p-3">
                      <div className="space-y-2">
                        {(rehabPlanEquipment ?? []).length === 0 ? (
                          <div className="text-sm text-muted-foreground">
                            No equipments found.
                          </div>
                        ) : (
                          (rehabPlanEquipment ?? []).map((c) => (
                            <label key={c._id} className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedEquipmentIds.includes(c._id)}
                                onCheckedChange={(checked) =>
                                  toggleEquipment(c._id, Boolean(checked))
                                }
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.currentTarget.value)}
                        placeholder="e.g., 9.99"
                        disabled={planType === 'free'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weekStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week Start</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.currentTarget.value)}
                        placeholder="e.g., 1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weekEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week End</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.currentTarget.value)}
                        placeholder="e.g., 8"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="planDurationInWeeks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Duration (weeks)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.currentTarget.value)}
                      placeholder="e.g., 8"
                      disabled={form.watch('openEnded')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nicer switch for openEnded */}

          </form>
        </Form>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="rehab-plan-form" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
