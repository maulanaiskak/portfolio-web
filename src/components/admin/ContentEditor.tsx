'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/api';
import type { MilestoneInput, PostInput, Trip, TripInput, TripPhoto } from '@/types';
import { kinds, slugify, type KindKey } from './content-kinds';
import ImageUploadField from './ImageUploadField';
import MarkdownEditorField from './MarkdownEditorField';
import PhotoManager from './PhotoManager';
import { useToast } from './Toast';
import { Button, Card, ConfirmButton, Field, StatusBadge, TextArea, TextInput } from './ui';

type AnyInput = PostInput & TripInput & MilestoneInput;

/** Create/edit screen shared by posts, trips and career milestones.
 * Cmd/Ctrl+S saves; leaving with unsaved changes asks first. */
export default function ContentEditor({ kind: kindKey, id }: { kind: KindKey; id?: number }) {
  const kind = kinds[kindKey];
  const router = useRouter();
  const toast = useToast();
  const isNew = id === undefined;

  const [input, setInput] = useState<AnyInput>(() => kind.empty() as AnyInput);
  const [saved, setSaved] = useState<string>(() => JSON.stringify(kind.empty()));
  const [photos, setPhotos] = useState<TripPhoto[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tagsText, setTagsText] = useState('');

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (kind.get as (id: number) => Promise<Parameters<typeof kind.toInput>[0]>)(id!)
      .then((entity) => {
        if (cancelled) return;
        const next = (kind.toInput as (e: unknown) => AnyInput)(entity);
        setInput(next);
        setSaved(JSON.stringify(next));
        setTagsText((next.tags ?? []).join(', '));
        if (kindKey === 'trips') setPhotos((entity as Trip).photos);
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load');
        router.replace(kind.adminPath);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const dirty = useMemo(() => JSON.stringify(input) !== saved, [input, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = <K extends keyof AnyInput>(key: K, value: AnyInput[K]) =>
    setInput((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !slugTouched) next.slug = slugify(String(value));
      return next;
    });

  const save = useCallback(
    async (statusOverride?: 'draft' | 'published') => {
      const payload = { ...input, ...(statusOverride ? { status: statusOverride } : {}) };
      if (!payload.title.trim()) {
        toast.error('Title is required');
        return;
      }
      setSaving(true);
      try {
        const create = kind.create as (i: AnyInput) => Promise<{ id: number }>;
        const update = kind.update as (id: number, i: AnyInput) => Promise<{ id: number }>;
        const result = isNew ? await create(payload) : await update(id!, payload);
        const next = (kind.toInput as (e: unknown) => AnyInput)(result);
        setInput(next);
        setSaved(JSON.stringify(next));
        toast.success(isNew ? `Created ${kind.singular}` : 'Saved');
        if (isNew) router.replace(`${kind.adminPath}/${result.id}`);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Save failed');
      } finally {
        setSaving(false);
      }
    },
    [input, isNew, id, kind, router, toast],
  );

  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function remove() {
    setDeleting(true);
    try {
      await kind.remove(id!);
      setSaved(JSON.stringify(input)); // suppress unsaved-changes prompt
      toast.success(`Deleted ${kind.singular}`);
      router.replace(kind.adminPath);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-32">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );
  }

  const published = input.status === 'published';

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={kind.adminPath}
          onClick={(e) => dirty && !confirm('Discard unsaved changes?') && e.preventDefault()}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={16} /> {kind.plural}
        </Link>
        <div className="flex items-center gap-2">
          {dirty ? <span className="text-xs text-amber">Unsaved changes</span> : !isNew && <span className="text-xs text-gray-600">All changes saved</span>}
          {!isNew && published && (
            <a href={`${kind.publicPath}/${input.slug}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white">
              <ExternalLink size={15} /> View live
            </a>
          )}
          {published ? (
            <>
              <Button onClick={() => save('draft')} disabled={saving}>
                Unpublish
              </Button>
              <Button variant="primary" loading={saving} onClick={() => save()}>
                {isNew ? 'Create' : 'Update'}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => save()} loading={saving}>
                Save draft
              </Button>
              <Button variant="primary" onClick={() => save('published')} disabled={saving}>
                Publish
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <div>
            <label htmlFor="title" className="sr-only">
              Title
            </label>
            <input
              id="title"
              value={input.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder={`${kind.singular[0].toUpperCase()}${kind.singular.slice(1)} title`}
              maxLength={200}
              className="w-full bg-transparent text-3xl font-bold tracking-tight text-white placeholder:text-gray-700 md:text-4xl"
              autoFocus={isNew}
            />
            <p className="mt-2 font-mono text-xs text-gray-600">
              {kind.publicPath}/<span className="text-gray-400">{input.slug || '…'}</span>
            </p>
          </div>

          <Field label="Summary" hint="Shown on cards and in search/social previews. 1–2 sentences.">
            {(fid) => <TextArea id={fid} value={input.summary} onChange={(e) => set('summary', e.target.value)} maxLength={1000} rows={2} />}
          </Field>

          <MarkdownEditorField value={input.bodyMarkdown} onChange={(v) => set('bodyMarkdown', v)} />

          {kindKey === 'trips' && !isNew && (
            <PhotoManager tripId={id!} photos={photos} onChange={setPhotos} onUseAsCover={(url) => set('coverImageUrl', url)} />
          )}
          {kindKey === 'trips' && isNew && <p className="text-sm text-gray-500">Save the trip first to add gallery photos.</p>}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Status</span>
              <StatusBadge status={input.status} />
            </div>
            <Field label="Slug" hint="Lowercase, digits and dashes.">
              {(fid) => (
                <TextInput
                  id={fid}
                  value={input.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  }}
                  className="font-mono"
                />
              )}
            </Field>
          </Card>

          <Card>
            <ImageUploadField value={input.coverImageUrl} onChange={(url) => set('coverImageUrl', url)} />
          </Card>

          <Card className="space-y-4">
            {kindKey === 'posts' && (
              <Field label="Tags" hint="Comma-separated, max 10.">
                {(fid) => (
                  <TextInput
                    id={fid}
                    value={tagsText}
                    onChange={(e) => {
                      setTagsText(e.target.value);
                      set(
                        'tags',
                        e.target.value
                          .split(',')
                          .map((t) => slugify(t))
                          .filter(Boolean),
                      );
                    }}
                    placeholder="go, backend, career"
                  />
                )}
              </Field>
            )}

            {kindKey === 'trips' && (
              <>
                <Field label="Location">{(fid) => <TextInput id={fid} value={input.location} onChange={(e) => set('location', e.target.value)} placeholder="Tokyo & Kyoto, Japan" maxLength={200} />}</Field>
                <Field label="Country code" hint="ISO 2-letter, e.g. JP, MY.">
                  {(fid) => (
                    <TextInput
                      id={fid}
                      value={input.countryCode}
                      onChange={(e) => set('countryCode', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2))}
                      placeholder="JP"
                      className="font-mono uppercase"
                    />
                  )}
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start">{(fid) => <TextInput id={fid} type="date" value={input.startDate ?? ''} onChange={(e) => set('startDate', e.target.value || null)} />}</Field>
                  <Field label="End">{(fid) => <TextInput id={fid} type="date" value={input.endDate ?? ''} min={input.startDate ?? undefined} onChange={(e) => set('endDate', e.target.value || null)} />}</Field>
                </div>
              </>
            )}

            {kindKey === 'career' && (
              <>
                <Field label="Date">{(fid) => <TextInput id={fid} type="date" value={input.milestoneDate ?? ''} onChange={(e) => set('milestoneDate', e.target.value || null)} />}</Field>
                <Field label="Role">{(fid) => <TextInput id={fid} value={input.role} onChange={(e) => set('role', e.target.value)} placeholder="Backend Engineer" maxLength={200} />}</Field>
                <Field label="Company / place">{(fid) => <TextInput id={fid} value={input.company} onChange={(e) => set('company', e.target.value)} placeholder="Nanovest" maxLength={200} />}</Field>
              </>
            )}
          </Card>

          {!isNew && (
            <Card>
              <p className="mb-3 text-xs text-gray-500">Deleting is permanent{kindKey === 'trips' ? ' and removes the gallery' : ''}.</p>
              <ConfirmButton onConfirm={remove} loading={deleting} className="w-full">
                Delete {kind.singular}
              </ConfirmButton>
            </Card>
          )}
          <p className="text-center text-xs text-gray-600">⌘/Ctrl + S to save</p>
        </aside>
      </div>
    </div>
  );
}
