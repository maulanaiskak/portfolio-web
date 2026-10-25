'use client';

import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import RemoteImage from '@/components/content/RemoteImage';
import { adminApi } from '@/lib/admin-api';
import { ApiError } from '@/lib/api';
import type { TripPhoto } from '@/types';
import { useToast } from './Toast';
import { Card, inputClass } from './ui';

/** Trip gallery editor: bulk upload, captions (saved on blur), reorder, delete. */
export default function PhotoManager({
  tripId,
  photos,
  onChange,
  onUseAsCover,
}: {
  tripId: number;
  photos: TripPhoto[];
  onChange: (photos: TripPhoto[]) => void;
  onUseAsCover: (url: string) => void;
}) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [busy, setBusy] = useState<number | null>(null);

  const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  async function addFiles(files: File[]) {
    let next = [...photos];
    for (const file of files.filter((f) => f.type.startsWith('image/'))) {
      setUploading((n) => n + 1);
      try {
        const img = await adminApi.upload(file);
        const photo = await adminApi.addPhoto(tripId, { url: img.url, caption: '' });
        next = [...next, photo];
        onChange(next);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : `Upload failed: ${file.name}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  async function saveCaption(photo: TripPhoto, caption: string) {
    if (caption === photo.caption) return;
    try {
      const updated = await adminApi.updatePhoto(tripId, photo.id, { caption, sortOrder: photo.sortOrder });
      onChange(photos.map((p) => (p.id === photo.id ? updated : p)));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save caption');
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sorted.length) return;
    // Renumber everything so order is dense and stable, then persist the two that changed.
    const reordered = [...sorted];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const renumbered = reordered.map((p, i) => ({ ...p, sortOrder: i }));
    onChange(renumbered);
    const changed = renumbered.filter((p) => photos.find((o) => o.id === p.id)?.sortOrder !== p.sortOrder);
    try {
      await Promise.all(changed.map((p) => adminApi.updatePhoto(tripId, p.id, { caption: p.caption, sortOrder: p.sortOrder })));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not reorder');
      onChange(photos);
    }
  }

  async function remove(photo: TripPhoto) {
    setBusy(photo.id);
    try {
      await adminApi.deletePhoto(tripId, photo.id);
      onChange(photos.filter((p) => p.id !== photo.id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not delete photo');
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Gallery</h2>
          <p className="text-xs text-gray-500">{photos.length} photos · shown below the story</p>
        </div>
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:border-white/25"
        >
          {uploading > 0 ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {uploading > 0 ? `Uploading ${uploading}…` : 'Add photos'}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => {
            void addFiles([...(e.target.files ?? [])]);
            e.target.value = '';
          }}
        />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void addFiles([...e.dataTransfer.files]);
        }}
      >
        {sorted.length === 0 ? (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="w-full rounded-xl border border-dashed border-white/15 py-12 text-sm text-gray-500 hover:text-gray-300"
          >
            Drop photos here or click to upload (multiple allowed)
          </button>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p, i) => (
              <li key={p.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="relative aspect-[4/3]">
                  <RemoteImage src={p.url} alt={p.caption || `Photo ${i + 1}`} fill sizes="300px" className="object-cover" />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button type="button" onClick={() => onUseAsCover(p.url)} title="Use as cover" className="grid h-8 w-8 place-items-center rounded-lg bg-black/60 text-gray-200 hover:text-amber">
                      <Star size={14} />
                    </button>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Move earlier" className="grid h-8 w-8 place-items-center rounded-lg bg-black/60 text-gray-200 hover:text-white disabled:opacity-30">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === sorted.length - 1} title="Move later" className="grid h-8 w-8 place-items-center rounded-lg bg-black/60 text-gray-200 hover:text-white disabled:opacity-30">
                      <ArrowDown size={14} />
                    </button>
                    <button type="button" onClick={() => remove(p)} title="Delete photo" className="grid h-8 w-8 place-items-center rounded-lg bg-black/60 text-red-300 hover:text-red-200">
                      {busy === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
                <input
                  defaultValue={p.caption}
                  placeholder="Caption…"
                  maxLength={500}
                  onBlur={(e) => void saveCaption(p, e.target.value.trim())}
                  className={`${inputClass} rounded-none border-0 border-t border-white/10`}
                  aria-label={`Caption for photo ${i + 1}`}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
