import { notFound } from 'next/navigation';
import ContentEditor from '@/components/admin/ContentEditor';

export default async function EditPostsPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <ContentEditor kind="posts" id={id} />;
}
