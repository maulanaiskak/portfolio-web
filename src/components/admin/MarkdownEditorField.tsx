'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ImagePlus, Loader2 } from 'lucide-react';
import '@uiw/react-md-editor/markdown-editor.css';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import { adminApi } from '@/lib/admin-api';
import { ApiError } from '@/lib/api';
import { useToast } from './Toast';

const MDEditor = dynamic(() => import('@uiw/react-md-editor/nohighlight'), {
  ssr: false,
  loading: () => <div className="h-[520px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />,
});

/** Markdown editor with live preview rendered by the same component as the
 * public site, plus image upload via button, paste or drag-and-drop. */
export default function MarkdownEditorField({
  value,
  onChange,
  height = 520,
}: {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}) {
  const toast = useToast();
  const [uploading, setUploading] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const insertAtCursor = useCallback(
    (snippet: string) => {
      const el = textareaRef.current;
      const current = valueRef.current;
      const pos = el ? el.selectionStart : current.length;
      const before = current.slice(0, pos);
      const after = current.slice(pos);
      const pad = before && !before.endsWith('\n') ? '\n\n' : '';
      onChange(`${before}${pad}${snippet}\n${after}`);
    },
    [onChange],
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const images = files.filter((f) => f.type.startsWith('image/'));
      for (const file of images) {
        setUploading((n) => n + 1);
        try {
          const img = await adminApi.upload(file);
          const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 80);
          insertAtCursor(`![${alt}](${img.url})`);
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : `Upload failed: ${file.name}`);
        } finally {
          setUploading((n) => n - 1);
        }
      }
    },
    [insertAtCursor, toast],
  );

  return (
    <div
      data-color-mode="dark"
      className="relative"
      onDrop={(e) => {
        if (e.dataTransfer.files.length) {
          e.preventDefault();
          void uploadFiles([...e.dataTransfer.files]);
        }
      }}
      onDragOver={(e) => e.dataTransfer.types.includes('Files') && e.preventDefault()}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-gray-500">Markdown · paste or drop images to upload</p>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white"
        >
          {uploading > 0 ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {uploading > 0 ? `Uploading ${uploading}…` : 'Insert image'}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => {
            void uploadFiles([...(e.target.files ?? [])]);
            e.target.value = '';
          }}
        />
      </div>
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? '')}
        height={height}
        preview="live"
        visibleDragbar
        textareaProps={{
          placeholder: 'Write in markdown…',
          onFocus: (e) => {
            textareaRef.current = e.currentTarget;
          },
          onPaste: (e) => {
            const files = [...e.clipboardData.files];
            if (files.some((f) => f.type.startsWith('image/'))) {
              e.preventDefault();
              textareaRef.current = e.currentTarget;
              void uploadFiles(files);
            }
          },
        }}
        components={{ preview: (source) => <MarkdownRenderer source={source} className="!prose-base p-4" /> }}
      />
    </div>
  );
}
