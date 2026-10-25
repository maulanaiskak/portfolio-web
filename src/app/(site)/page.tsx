import Hero from '@/components/portfolio/Hero';
import About from '@/components/portfolio/About';
import Experience from '@/components/portfolio/Experience';
import Education from '@/components/portfolio/Education';
import Projects from '@/components/portfolio/Projects';
import Skills from '@/components/portfolio/Skills';
import BeyondCode from '@/components/portfolio/BeyondCode';
import Contact from '@/components/portfolio/Contact';
import { buildSafe, publicApi, publishedSections, safe } from '@/lib/api';
import { site } from '@/lib/site';
import { SITE_URL } from '@/lib/format';
import type { Cv } from '@/types';

export const revalidate = 60; // seconds; keep in sync with REVALIDATE_SECONDS

const emptyCv: Cv = { experiences: [], projects: [], education: [], skills: [] };
const emptyPage = { items: [], total: 0 };

export default async function HomePage() {
  const [cv, posts, trips, milestones, sections] = await Promise.all([
    // CV is the core of the page: at runtime a failure keeps the last good render.
    buildSafe(publicApi.cv, emptyCv),
    safe(() => publicApi.posts(1, 3), emptyPage),
    safe(() => publicApi.trips(1, 3), emptyPage),
    safe(() => publicApi.milestones(1, 3), emptyPage),
    publishedSections(),
  ]);

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: 'Backend Engineer',
    url: SITE_URL,
    email: `mailto:${site.email}`,
    sameAs: [site.github, site.linkedin],
    alumniOf: cv.education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
    knowsAbout: cv.skills.flatMap((s) => s.items.map((i) => i.name)).slice(0, 25),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c') }} />
      <Hero showJournal={sections.blog} />
      <About />
      <Experience experiences={cv.experiences} />
      <Education education={cv.education} />
      <Projects projects={cv.projects} />
      <Skills skills={cv.skills} />
      <BeyondCode posts={posts.items} trips={trips.items} milestones={milestones.items} />
      <Contact />
    </>
  );
}
