'use client';
import { useEffect, useState } from 'react';
import { useContentStore } from '@/stores/useContentStore';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import config from '@/config/config';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Editor } from '@tinymce/tinymce-react';

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const { pages, loading, fetchPages, updatePage } = useContentStore();
  const [content, setContent] = useState('');

  const page = pages.find((p) => p.slug === slug);

  useEffect(() => {
    if (pages.length === 0) {
      fetchPages();
    }
  }, [pages, fetchPages]);

  useEffect(() => {
    if (page) {
      setContent(page.contentHtml);
    }
  }, [page]);

  const handleSave = async () => {
    if (!page) return;
    await updatePage(page.slug, content);
    router.push('/dashboard/settings');
  };

  if (loading && !page) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (!page) {
    return <div>Page not found.</div>;
  }

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/settings"
        className="flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Content Management
      </Link>

      <h1 className="text-3xl font-bold">{page.title}</h1>
      <p className="text-muted-foreground">
        Edit the content below with the rich text editor.
      </p>

      {/* ✅ TinyMCE bound to `content` */}
      <Editor
        apiKey={config.tinymceApiKey}
        value={content}
        onEditorChange={(newValue) => setContent(newValue)}
        init={{
          height: 500,
          menubar: false,
          plugins:
            'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
          toolbar:
            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
            'link image media table | align lineheight | numlist bullist indent outdent | ' +
            'emoticons charmap | removeformat',
        }}
      />

      <Button onClick={handleSave} disabled={loading}>
        <Save className="mr-2 h-4 w-4" />
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
