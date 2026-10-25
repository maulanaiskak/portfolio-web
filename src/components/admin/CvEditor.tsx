'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Loader2, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { ApiError } from '@/lib/api';
import type { Cv, Education, Experience, Project, SkillCategory, SkillItem } from '@/types';
import { useToast } from './Toast';
import { Button, Card, Field, PageTitle, TextArea, TextInput } from './ui';

type Tab = 'experiences' | 'projects' | 'education' | 'skills';

const TABS: { key: Tab; label: string }[] = [
  { key: 'experiences', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
];

// ── list helpers ─────────────────────────────────────────────────────────────

function move<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
const replace = <T,>(list: T[], i: number, item: T) => list.map((x, k) => (k === i ? item : x));
const remove = <T,>(list: T[], i: number) => list.filter((_, k) => k !== i);

const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
const csv = (s: string) => s.split(',').map((l) => l.trim()).filter(Boolean);

/** Textarea bound to string[] (one item per line), keeping raw text while typing. */
function LinesField({ label, value, onChange, hint, rows = 4 }: { label: string; value: string[]; onChange: (v: string[]) => void; hint?: string; rows?: number }) {
  const [text, setText] = useState(value.join('\n'));
  const last = useRef(value);
  useEffect(() => {
    if (value !== last.current && value.join('\n') !== lines(text).join('\n')) setText(value.join('\n'));
    last.current = value;
  }, [value, text]);
  return (
    <Field label={label} hint={hint ?? 'One per line.'}>
      {(id) => <TextArea id={id} rows={rows} value={text} onChange={(e) => (setText(e.target.value), onChange(lines(e.target.value)))} />}
    </Field>
  );
}

/** Input bound to string[] as comma-separated values. */
function CsvField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join(', '));
  return (
    <Field label={label} hint="Comma-separated.">
      {(id) => <TextInput id={id} value={text} onChange={(e) => (setText(e.target.value), onChange(csv(e.target.value)))} />}
    </Field>
  );
}

function ItemShell({
  title,
  subtitle,
  index,
  count,
  onMove,
  onRemove,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  index: number;
  count: number;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="!p-0">
      <div className="flex items-center gap-2 p-4">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
          <ChevronDown size={18} className={`shrink-0 text-gray-500 transition-transform ${open ? '' : '-rotate-90'}`} />
          <span className="min-w-0">
            <span className="block truncate font-medium text-white">{title || <span className="text-gray-600">Untitled</span>}</span>
            {subtitle && <span className="block truncate text-xs text-gray-500">{subtitle}</span>}
          </span>
        </button>
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-30" aria-label="Move up">
          <ArrowUp size={15} />
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-30" aria-label="Move down">
          <ArrowDown size={15} />
        </button>
        <button
          type="button"
          onClick={() => confirm(`Remove "${title || 'this item'}"?`) && onRemove()}
          className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-300"
          aria-label="Remove"
        >
          <Trash2 size={15} />
        </button>
      </div>
      {open && <div className="space-y-4 border-t border-white/5 p-4 md:p-5">{children}</div>}
    </Card>
  );
}

// ── section editors ──────────────────────────────────────────────────────────

function ExperienceEditor({ items, onChange }: { items: Experience[]; onChange: (v: Experience[]) => void }) {
  return (
    <div className="space-y-3">
      {items.map((exp, i) => {
        const up = (patch: Partial<Experience>) => onChange(replace(items, i, { ...exp, ...patch }));
        return (
          <ItemShell key={exp.id ?? `new-${i}`} title={exp.position} subtitle={`${exp.company} · ${exp.period}`} index={i} count={items.length} onMove={(d) => onChange(move(items, i, d))} onRemove={() => onChange(remove(items, i))} defaultOpen={!exp.id}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Position">{(id) => <TextInput id={id} value={exp.position} onChange={(e) => up({ position: e.target.value })} />}</Field>
              <Field label="Company">{(id) => <TextInput id={id} value={exp.company} onChange={(e) => up({ company: e.target.value })} />}</Field>
              <Field label="Location">{(id) => <TextInput id={id} value={exp.location} onChange={(e) => up({ location: e.target.value })} />}</Field>
              <Field label="Period">{(id) => <TextInput id={id} value={exp.period} onChange={(e) => up({ period: e.target.value })} placeholder="Jul 2025 – Present" />}</Field>
            </div>
            {exp.responsibilities.map((r, ri) => (
              <div key={ri} className="grid gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 md:grid-cols-[180px_1fr_auto]">
                <Field label="Label">{(id) => <TextInput id={id} value={r.period} onChange={(e) => up({ responsibilities: replace(exp.responsibilities, ri, { ...r, period: e.target.value }) })} placeholder="Asset Team" />}</Field>
                <Field label="Context">{(id) => <TextArea id={id} rows={2} value={r.description} onChange={(e) => up({ responsibilities: replace(exp.responsibilities, ri, { ...r, description: e.target.value }) })} />}</Field>
                <button type="button" onClick={() => up({ responsibilities: remove(exp.responsibilities, ri) })} className="self-end rounded-lg p-2 text-gray-500 hover:text-red-300" aria-label="Remove context">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <Button variant="ghost" onClick={() => up({ responsibilities: [...exp.responsibilities, { period: '', description: '' }] })}>
              <Plus size={15} /> Add context block
            </Button>
            <LinesField label="Achievements" value={exp.projectsAndAchievements} onChange={(v) => up({ projectsAndAchievements: v })} rows={6} />
            <CsvField label="Tech" value={exp.tech} onChange={(v) => up({ tech: v })} />
          </ItemShell>
        );
      })}
      <Button onClick={() => onChange([{ company: '', location: '', position: '', period: '', responsibilities: [], projectsAndAchievements: [], tech: [] }, ...items])}>
        <Plus size={15} /> Add experience (top)
      </Button>
    </div>
  );
}

function ProjectEditor({ items, onChange }: { items: Project[]; onChange: (v: Project[]) => void }) {
  return (
    <div className="space-y-3">
      {items.map((p, i) => {
        const up = (patch: Partial<Project>) => onChange(replace(items, i, { ...p, ...patch }));
        return (
          <ItemShell key={p.id ?? `new-${i}`} title={p.title} subtitle={p.technologies.slice(0, 4).join(' · ')} index={i} count={items.length} onMove={(d) => onChange(move(items, i, d))} onRemove={() => onChange(remove(items, i))} defaultOpen={!p.id}>
            <Field label="Title">{(id) => <TextInput id={id} value={p.title} onChange={(e) => up({ title: e.target.value })} />}</Field>
            <Field label="Description">{(id) => <TextArea id={id} rows={3} value={p.description} onChange={(e) => up({ description: e.target.value })} />}</Field>
            <LinesField label="Highlights" value={p.highlights} onChange={(v) => up({ highlights: v })} />
            <CsvField label="Technologies" value={p.technologies} onChange={(v) => up({ technologies: v })} />
          </ItemShell>
        );
      })}
      <Button onClick={() => onChange([...items, { title: '', description: '', technologies: [], image: '', highlights: [] }])}>
        <Plus size={15} /> Add project
      </Button>
    </div>
  );
}

function EducationEditor({ items, onChange }: { items: Education[]; onChange: (v: Education[]) => void }) {
  return (
    <div className="space-y-3">
      {items.map((ed, i) => {
        const up = (patch: Partial<Education>) => onChange(replace(items, i, { ...ed, ...patch }));
        return (
          <ItemShell key={ed.id ?? `new-${i}`} title={ed.institution} subtitle={ed.degree} index={i} count={items.length} onMove={(d) => onChange(move(items, i, d))} onRemove={() => onChange(remove(items, i))} defaultOpen={!ed.id}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Institution">{(id) => <TextInput id={id} value={ed.institution} onChange={(e) => up({ institution: e.target.value })} />}</Field>
              <Field label="Degree">{(id) => <TextInput id={id} value={ed.degree} onChange={(e) => up({ degree: e.target.value })} />}</Field>
              <Field label="Location">{(id) => <TextInput id={id} value={ed.location} onChange={(e) => up({ location: e.target.value })} />}</Field>
              <Field label="Period">{(id) => <TextInput id={id} value={ed.period} onChange={(e) => up({ period: e.target.value })} />}</Field>
              <Field label="GPA">{(id) => <TextInput id={id} value={ed.gpa} onChange={(e) => up({ gpa: e.target.value })} />}</Field>
              <Field label="Thesis link">{(id) => <TextInput id={id} type="url" value={ed.thesis_link} onChange={(e) => up({ thesis_link: e.target.value })} />}</Field>
            </div>
            <Field label="Thesis">{(id) => <TextArea id={id} rows={3} value={ed.thesis} onChange={(e) => up({ thesis: e.target.value })} />}</Field>
          </ItemShell>
        );
      })}
      <Button onClick={() => onChange([...items, { institution: '', location: '', degree: '', period: '', gpa: '', thesis: '', thesis_link: '' }])}>
        <Plus size={15} /> Add education
      </Button>
    </div>
  );
}

function SkillsEditor({ items, onChange }: { items: SkillCategory[]; onChange: (v: SkillCategory[]) => void }) {
  return (
    <div className="space-y-3">
      {items.map((cat, i) => {
        const up = (patch: Partial<SkillCategory>) => onChange(replace(items, i, { ...cat, ...patch }));
        const upItem = (j: number, patch: Partial<SkillItem>) => up({ items: replace(cat.items, j, { ...cat.items[j], ...patch }) });
        return (
          <ItemShell key={cat.id ?? `new-${i}`} title={cat.category} subtitle={`${cat.items.length} skills`} index={i} count={items.length} onMove={(d) => onChange(move(items, i, d))} onRemove={() => onChange(remove(items, i))} defaultOpen={!cat.id}>
            <Field label="Category">{(id) => <TextInput id={id} value={cat.category} onChange={(e) => up({ category: e.target.value })} />}</Field>
            <ul className="space-y-2">
              {cat.items.map((s, j) => (
                <li key={s.id ?? `new-${j}`} className="grid items-end gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
                  <Field label="Name">{(id) => <TextInput id={id} value={s.name} onChange={(e) => upItem(j, { name: e.target.value })} />}</Field>
                  <Field label={`Level · ${s.level}%`}>
                    {(id) => <input id={id} type="range" min={0} max={100} step={5} value={s.level} onChange={(e) => upItem(j, { level: Number(e.target.value) })} className="w-full accent-[#00d4ff]" />}
                  </Field>
                  <Field label="Note">{(id) => <TextInput id={id} value={s.note ?? ''} onChange={(e) => upItem(j, { note: e.target.value || undefined })} placeholder="optional" />}</Field>
                  <Field label="Link">{(id) => <TextInput id={id} type="url" value={s.link ?? ''} onChange={(e) => upItem(j, { link: e.target.value || undefined })} placeholder="https://…" />}</Field>
                  <div className="flex gap-1 pb-1">
                    <button type="button" onClick={() => up({ items: move(cat.items, j, -1) })} disabled={j === 0} className="rounded-lg p-1.5 text-gray-500 hover:text-white disabled:opacity-30" aria-label="Move skill up">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" onClick={() => up({ items: remove(cat.items, j) })} className="rounded-lg p-1.5 text-gray-500 hover:text-red-300" aria-label="Remove skill">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="ghost" onClick={() => up({ items: [...cat.items, { name: '', level: 70 }] })}>
              <Plus size={15} /> Add skill
            </Button>
          </ItemShell>
        );
      })}
      <Button onClick={() => onChange([...items, { category: '', items: [] }])}>
        <Plus size={15} /> Add category
      </Button>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function CvEditor() {
  const toast = useToast();
  const [cv, setCv] = useState<Cv | null>(null);
  const [saved, setSaved] = useState('');
  const [tab, setTab] = useState<Tab>('experiences');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .cv()
      .then((data) => {
        setCv(data);
        setSaved(JSON.stringify(data));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load CV'));
  }, []);

  const dirty = useMemo(() => cv !== null && JSON.stringify(cv) !== saved, [cv, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = useCallback(async () => {
    if (!cv) return;
    setSaving(true);
    try {
      const next = await adminApi.saveCv(cv);
      setCv(next);
      setSaved(JSON.stringify(next));
      toast.success('CV saved — live within a minute');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [cv, toast]);

  if (error) return <p className="text-red-300">{error}</p>;
  if (!cv) {
    return (
      <div className="grid place-items-center py-32">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );
  }

  const counts: Record<Tab, number> = {
    experiences: cv.experiences.length,
    projects: cv.projects.length,
    education: cv.education.length,
    skills: cv.skills.length,
  };

  return (
    <>
      <PageTitle
        title="CV"
        description="Saved as one document — the whole CV is replaced atomically."
        actions={
          <>
            {dirty && <span className="self-center text-xs text-amber">Unsaved changes</span>}
            <Button variant="ghost" disabled={!dirty || saving} onClick={() => setCv(JSON.parse(saved))}>
              Discard
            </Button>
            <Button variant="primary" loading={saving} disabled={!dirty} onClick={save}>
              Save CV
            </Button>
          </>
        }
      />

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
          >
            {t.label} <span className="ml-1 text-xs opacity-60">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {tab === 'experiences' && <ExperienceEditor items={cv.experiences} onChange={(experiences) => setCv({ ...cv, experiences })} />}
      {tab === 'projects' && <ProjectEditor items={cv.projects} onChange={(projects) => setCv({ ...cv, projects })} />}
      {tab === 'education' && <EducationEditor items={cv.education} onChange={(education) => setCv({ ...cv, education })} />}
      {tab === 'skills' && <SkillsEditor items={cv.skills} onChange={(skills) => setCv({ ...cv, skills })} />}
    </>
  );
}
