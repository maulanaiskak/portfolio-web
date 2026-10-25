'use client';

import { useRef, useState } from 'react';
import { ImageUp, Loader2, Trash2 } from 'lucide-react';
import RemoteImage from '@/components/content/RemoteImage';
import { adminApi } from '@/lib/admin-api';
import { ApiError } from '@/lib/api';
import { useToast } from './Toast';

/** Cover image picker: drop/click to upload, shows a preview, can clear. */
export default function ImageUploadField({ value, onChange, label = 'Cover image' }: { value: string; onChange: (url: string) => void; label?: string }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const img = await adminApi.upload(file);
      onChange(img.url);
      toast.success(`Uploaded ${img.width}×${img.height}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files[0]);
        }}
        className={`relative overflow-hidden rounded-2xl border border-dashed transition-colors ${
          dragging ? 'border-accent bg-accent/5' : 'border-white/15 bg-white/[0.02]'
        }`}
      >
        {value ? (
          <div className="group relative aspect-[16/10]">
            <RemoteImage src={value} alt="Cover preview" fill sizes="320px" className="object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button type="button" onClick={() => input.current?.click()} className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25">
                Replace
              </button>
              <button type="button" onClick={() => onChange('')} className="rounded-lg bg-red-500/20 p-1.5 text-red-200 hover:bg-red-500/30" aria-label="Remove image">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-300"
          >
            {uploading ? <Loader2 className="animate-spin" /> : <ImageUp />}
            {uploading ? 'Uploading…' : 'Drop an image or click to upload'}
            <span className="text-xs text-gray-600">JPEG, PNG or WebP · metadata stripped</span>
          </button>
        )}
        {uploading && value && (
          <div className="absolute inset-0 grid place-items-center bg-black/60">
            <Loader2 className="animate-spin text-accent" />
          </div>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          void upload(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
