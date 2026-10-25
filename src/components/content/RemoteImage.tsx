import Image, { type ImageProps } from 'next/image';

// Origins configured for the Next image optimizer (see next.config.ts).
const OPTIMIZED_ORIGINS = new Set(
  (process.env.NEXT_PUBLIC_IMAGE_ORIGINS ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      try {
        return new URL(s).origin;
      } catch {
        return '';
      }
    }),
);

// Optimize only images from configured hosts that aren't loopback (Next
// refuses to fetch private IPs). Anything else — the local dev API, or an
// external URL pasted into a post — is rendered as-is instead of crashing
// the page on an unconfigured host.
function shouldOptimize(src: string) {
  try {
    const url = new URL(src);
    if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return false;
    return OPTIMIZED_ORIGINS.has(url.origin);
  } catch {
    return src.startsWith('/'); // local /public assets
  }
}

export default function RemoteImage(props: ImageProps & { src: string }) {
  const { alt, ...rest } = props;
  return <Image alt={alt} unoptimized={!shouldOptimize(props.src)} {...rest} />;
}
