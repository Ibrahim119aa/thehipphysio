'use client';
import { useEffect } from 'react';
import { useContentStore } from '@/stores/useContentStore';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';

export default function SettingsPage() {
  const { pages, loading, fetchPages } = useContentStore();
  
  useEffect(() => {
    if (pages.length === 0) fetchPages();
  }, [pages, fetchPages]);

  return (
    <div className="space-y-4">
      <PageHeader title="Content Management" />
      <p className="text-muted-foreground">
        Select a page to edit its content. Changes will be reflected in the mobile app instantly.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          pages.map(page => (
            <Link key={page._id} href={`/dashboard/settings/${page.slug}`}>
              <Card className="hover:border-brand transition-colors">
                <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{page.title}</CardTitle>
                    <CardDescription>Last updated: {new Date(page.updatedAt).toLocaleDateString()}</CardDescription>
                  </div>
                  <ArrowRight className="text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
