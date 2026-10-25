import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

// Shared by public pages and the admin editor preview so what you see while
// writing is what gets published.
//
// Safety: react-markdown never renders raw HTML (no rehype-raw) and its
// default urlTransform drops javascript:/data: URLs, so stored markdown
// can't inject scripts.

const components: Components = {
  a({ href = '', children, ...props }) {
    const external = /^https?:\/\//.test(href);
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})} {...props}>
        {children}
      </a>
    );
  },
  img({ src, alt }) {
    if (typeof src !== 'string' || !src) return null;
    return (
      <span className="not-prose my-8 block">
        {/* Plain img: markdown images have unknown dimensions. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ''}
          loading="lazy"
          decoding="async"
          className="mx-auto max-h-[80vh] w-auto rounded-2xl border border-white/10"
        />
        {alt && <span className="mt-2 block text-center text-sm text-gray-500">{alt}</span>}
      </span>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto">
        <table>{children}</table>
      </div>
    );
  },
};

export default function MarkdownRenderer({ source, className = '' }: { source: string; className?: string }) {
  return (
    <div className={`prose prose-invert prose-site max-w-none prose-headings:tracking-tight prose-p:leading-8 md:prose-lg ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
