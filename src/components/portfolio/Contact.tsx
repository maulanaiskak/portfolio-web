'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, CheckCircle, Copy, Mail } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/layout/icons';
import { site } from '@/lib/site';

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the mailto link still works
    }
  }, []);

  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-accent"
    >
      {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
      <span aria-live="polite">{copied ? 'Copied!' : 'Copy address'}</span>
    </button>
  );
}

function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: new FormData(e.currentTarget),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error();
      formRef.current?.reset();
      setState('sent');
    } catch {
      setState('error');
    }
  }, []);

  if (state === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-accent/20 bg-accent/5 p-12 text-center"
        role="status"
      >
        <CheckCircle size={44} className="text-accent" />
        <h3 className="text-lg font-semibold text-white">Message sent!</h3>
        <p className="text-sm text-gray-500">I&apos;ll get back to you as soon as I can.</p>
      </motion.div>
    );
  }

  const field =
    'peer w-full rounded-xl border border-white/10 bg-white/5 px-4 pb-2 pt-6 text-sm text-white transition-colors placeholder-transparent focus:border-accent/50';
  const label =
    'pointer-events-none absolute left-4 top-2 text-xs font-medium tracking-wide text-gray-500 transition-colors peer-focus:text-accent';

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      {/* Honeypot: bots fill it, Formspree drops the submission. */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="relative">
        <input id="name" name="name" required maxLength={100} placeholder="Name" autoComplete="name" className={field} />
        <label htmlFor="name" className={label}>
          Name
        </label>
      </div>
      <div className="relative">
        <input id="email" name="email" type="email" required maxLength={200} placeholder="Email" autoComplete="email" className={field} />
        <label htmlFor="email" className={label}>
          Email
        </label>
      </div>
      <div className="relative">
        <textarea id="message" name="message" required rows={4} maxLength={5000} placeholder="Message" className={`${field} resize-none`} />
        <label htmlFor="message" className={label}>
          Message
        </label>
      </div>
      {state === 'error' && (
        <p role="alert" className="text-sm text-red-400">
          Something went wrong. Please email me directly instead.
        </p>
      )}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-bold text-background transition-colors hover:bg-white disabled:opacity-50"
      >
        {state === 'sending' ? 'Sending…' : (
          <>
            Send message <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const socials = [
    { icon: GithubIcon, label: 'GitHub', sub: 'maulanaiskak', href: site.github },
    { icon: LinkedinIcon, label: 'LinkedIn', sub: 'in/maulanaiskak', href: site.linkedin },
  ];

  return (
    <section id="contact" className="relative overflow-hidden py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="eyebrow mb-4">Available for opportunities</p>
          <h2 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
            Let&apos;s build
            <br />
            <span className="text-accent">something great.</span>
          </h2>
          <p className="mx-auto max-w-lg leading-relaxed text-gray-400">
            Open to backend roles abroad (visa sponsorship required, 1-month notice), hard distributed-systems problems,
            or just a good tech conversation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-16 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href={`mailto:${site.email}`}
            className="group flex max-w-full items-center gap-3 rounded-full bg-accent px-6 py-4 text-base font-bold text-background transition-colors hover:bg-white sm:px-8 sm:text-lg"
          >
            <Mail size={20} className="shrink-0" />
            <span className="truncate">{site.email}</span>
            <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-1" />
          </a>
          <CopyEmail />
        </motion.div>

        <div className={`grid gap-12 ${FORMSPREE_ID ? 'lg:grid-cols-2' : 'mx-auto max-w-md'}`}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="eyebrow mb-6 !text-gray-500">Find me on</p>
            <div className="space-y-3">
              {socials.map(({ icon: Icon, label, sub, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-accent/30 hover:bg-white/[0.07]"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white/10 p-2.5 text-white">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{label}</div>
                      <div className="text-xs text-gray-500">{sub}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-600 transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent" />
                </a>
              ))}
            </div>
          </motion.div>

          {FORMSPREE_ID && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <p className="eyebrow mb-6 !text-gray-500">Or send a message</p>
              <ContactForm />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
