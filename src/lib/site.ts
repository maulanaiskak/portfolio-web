// Static site identity. CV content comes from the API; this is the bit that
// frames it (hero, about, contact) and rarely changes.

export const site = {
  name: 'Maulana Iskak',
  title: 'Maulana Iskak | Backend Engineer',
  description:
    'Backend Engineer with 4+ years in fintech & crypto — Java, Spring Boot and Go on Google Cloud. Distributed systems, event-driven architecture and money-movement correctness. Also: trips, career stories and notes.',
  email: 'maulanaiskak9@gmail.com',
  github: 'https://github.com/maulanaiskak',
  linkedin: 'https://linkedin.com/in/maulanaiskak',
  location: 'Magetan, East Java, Indonesia',
  roles: ['Backend Engineer', 'Java Spring Boot Engineer', 'Golang Engineer', 'Google Cloud Architect'],
};

export const NAV = [
  { label: 'About', href: '/#about' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Career', href: '/career' },
  { label: 'Trips', href: '/trips' },
  { label: 'Blog', href: '/blog' },
] as const;
