import portfolio from '../data/portfolio.json';
import team from '../data/team.json';
import testimonials from '../data/testimonials.json';
import services from '../data/services.json';

const SITE_URL = 'https://stks.kr';
const ORG_ID = `${SITE_URL}/#organization`;

function setPageSchema(schema) {
  let el = document.getElementById('page-jsonld');
  if (!el) {
    el = document.createElement('script');
    el.id = 'page-jsonld';
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema);
}

function homeSchema(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    'url': SITE_URL,
    'name': 'Sticks & Stones Seoul',
    'description': lang === 'ko'
      ? '글로벌 브랜딩과 마케팅에 특화된 영어 전문 카피라이팅 회사, 스틱스앤스톤스 서울.'
      : 'A specialized English copywriting and brand storytelling agency for global branding and marketing, based in Seoul.',
    'inLanguage': ['ko', 'en'],
    'publisher': { '@id': ORG_ID },
  };
}

function aboutSchema(lang) {
  const realTeam = team.filter(m => m.role[lang] !== 'Chief Happiness Officer');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}about#webpage`,
        'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}about`,
        'name': lang === 'ko' ? '스틱스앤스톤스 소개' : 'About Sticks & Stones Seoul',
        'description': lang === 'ko'
          ? '인상적인 메시지를 쓰는 건 어렵습니다. 영어로는 더더욱. 스틱스앤스톤스는 글로벌 브랜딩 전문 영어 카피라이팅 에이전시입니다.'
          : 'Landing your brand story globally takes a little more. Meet the team behind Sticks & Stones Seoul.',
        'publisher': { '@id': ORG_ID },
      },
      ...realTeam.map(member => ({
        '@type': 'Person',
        'name': member.name[lang],
        'jobTitle': member.role[lang],
        'image': `${SITE_URL}${member.image}`,
        'worksFor': { '@id': ORG_ID },
      })),
    ],
  };
}

function servicesSchema(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': lang === 'ko' ? '스틱스앤스톤스 서비스' : 'Sticks & Stones Services',
    'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}services`,
    'itemListElement': services.map((s, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'item': {
        '@type': 'Service',
        'name': s.label[lang],
        'provider': { '@id': ORG_ID },
      },
    })),
  };
}

function portfolioListSchema(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': lang === 'ko' ? '포트폴리오' : 'Portfolio',
    'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio`,
    'publisher': { '@id': ORG_ID },
    'hasPart': portfolio.map(item => ({
      '@type': 'CreativeWork',
      'name': item.title[lang],
      'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio/${item.id}`,
      'creator': { '@id': ORG_ID },
      'abstract': item.solution[lang],
    })),
  };
}

function portfolioItemSchema(lang, slug) {
  const item = portfolio.find(p => p.id === slug);
  if (!item) return homeSchema(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'name': item.title[lang],
    'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio/${item.id}`,
    'creator': { '@id': ORG_ID },
    'description': item.mission[lang],
    'abstract': item.solution[lang],
    ...(item.videoUrl ? { 'video': { '@type': 'VideoObject', 'url': item.videoUrl, 'name': item.title[lang] } } : {}),
  };
}

function clientsSchema(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': lang === 'ko' ? '클라이언트 후기' : 'Client Testimonials',
    'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}clients`,
    'itemListElement': testimonials.map((t, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'item': {
        '@type': 'Review',
        'reviewBody': t.quote[lang],
        'author': { '@type': 'Person', 'name': t.author[lang] },
        'itemReviewed': { '@id': ORG_ID },
      },
    })),
  };
}

export function injectPageSchema(section, lang, portfolioSlug) {
  let schema;
  if (!section) {
    schema = homeSchema(lang);
  } else if (section === 'about') {
    schema = aboutSchema(lang);
  } else if (section === 'services') {
    schema = servicesSchema(lang);
  } else if (section === 'portfolio' && portfolioSlug) {
    schema = portfolioItemSchema(lang, portfolioSlug);
  } else if (section === 'portfolio') {
    schema = portfolioListSchema(lang);
  } else if (section === 'clients') {
    schema = clientsSchema(lang);
  } else {
    schema = homeSchema(lang);
  }
  setPageSchema(schema);
}
