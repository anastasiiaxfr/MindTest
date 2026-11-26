export const siteOrigin = new URL('https://mind-test-sigma.vercel.app');

export const homeSeo = {
  title: 'MindTest | IQ, Memory & Mental Age Quizzes',
  description: 'Try three MindTest quizzes for entertainment. Solve visual logic puzzles, challenge your recall, and explore your habits with a playful mental age quiz.',
  path: '/',
};

export const quizSeo = {
  iq: {
    title: 'IQ Test: Visual Logic Puzzles | MindTest',
    description: 'Try 25 visual reasoning puzzles covering patterns, spatial reasoning, and deduction. Your score measures quiz accuracy. This IQ quiz is for entertainment.',
    path: '/?test=iq',
  },
  memory: {
    title: 'Memory Test: Shapes, Words & Numbers | MindTest',
    description: 'See what you remember after short sequences of shapes, words, and numbers disappear. Play eight quick recall challenges for entertainment.',
    path: '/?test=memory',
  },
  'mental-age': {
    title: 'Mental Age Quiz | MindTest',
    description: 'Answer six questions about everyday habits, choices, and routines to get a playful mental age profile. This quiz is for entertainment.',
    path: '/?test=mental-age',
  },
};

export const legalSeo = {
  terms: {
    title: 'Terms & Conditions | MindTest',
    description: 'Read how MindTest quizzes, one-time result payments, reports, and downloadable certificates work.',
    path: '/legal/terms',
  },
  privacy: {
    title: 'Privacy Policy | MindTest',
    description: 'Learn what MindTest stores about quiz attempts, how WayForPay handles payments, and how private result links work.',
    path: '/legal/privacy',
  },
  cookies: {
    title: 'Cookie Policy | MindTest',
    description: 'Learn how hosting, checkout, and social sharing services may use cookies when you use MindTest.',
    path: '/legal/cookies',
  },
};

export function absoluteUrl(path) {
  return path === '/' ? siteOrigin.origin : new URL(path, siteOrigin).href;
}

const socialImage = {
  url: absoluteUrl('/og-image.png'),
  width: 1200,
  height: 630,
  alt: 'MindTest quizzes with Momo, the lavender brain mascot',
};

export function publicMetadata({title, description, path}) {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: {canonical: url},
    robots: {index: true, follow: true},
    openGraph: {
      type: 'website',
      siteName: 'MindTest',
      locale: 'en_US',
      title,
      description,
      url,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{url: socialImage.url, alt: socialImage.alt}],
    },
  };
}

export const privateRobots = {index: false, follow: false, noarchive: true};

export const siteStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': absoluteUrl('/#website'),
      name: 'MindTest',
      url: absoluteUrl('/'),
      inLanguage: 'en',
      description: homeSeo.description,
    },
    {
      '@type': 'WebApplication',
      '@id': absoluteUrl('/#application'),
      name: 'MindTest',
      url: absoluteUrl('/'),
      inLanguage: 'en',
      description: 'Entertainment quizzes covering visual logic, memory, and mental age.',
      applicationCategory: 'EntertainmentApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      image: socialImage.url,
      isPartOf: {'@id': absoluteUrl('/#website')},
    },
  ],
};
