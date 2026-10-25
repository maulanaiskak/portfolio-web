import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

// Called by portfolio-api after content changes so published edits show up
// immediately instead of after the ISR window. Server-to-server only:
// authenticated by a shared secret, never exposed to the browser.

const SECRET = process.env.REVALIDATE_SECRET ?? '';
const TAG_PATTERN = /^(cv|trips|posts|milestones|(trip|post|milestone):[a-z0-9]+(-[a-z0-9]+)*)$/;
const MAX_TAGS = 20;

function authorized(header: string | null): boolean {
  if (SECRET.length < 32 || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(SECRET);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!authorized(req.headers.get('x-revalidate-secret'))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let tags: unknown;
  try {
    tags = ((await req.json()) as { tags?: unknown }).tags;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 });
  }
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > MAX_TAGS || !tags.every((t) => typeof t === 'string' && TAG_PATTERN.test(t))) {
    return NextResponse.json({ ok: false, error: 'invalid tags' }, { status: 400 });
  }

  for (const tag of new Set(tags as string[])) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ ok: true, revalidated: tags });
}
