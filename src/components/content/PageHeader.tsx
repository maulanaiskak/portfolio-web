import GradientOrbs from '@/components/effects/GradientOrbs';

export default function PageHeader({
  eyebrow,
  title,
  description,
  orb = 'cyan',
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  orb?: 'cyan' | 'purple' | 'amber';
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-12 pt-36 md:pt-44">
      <GradientOrbs variant={orb} />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl">{title}</h1>
        {description && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">{description}</p>}
        {children}
      </div>
    </section>
  );
}
