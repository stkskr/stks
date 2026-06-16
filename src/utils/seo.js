import portfolio from '../data/portfolio.json';
import team from '../data/team.json';
import testimonials from '../data/testimonials.json';
import services from '../data/services.json';

const SITE_URL = 'https://stks.kr';
const ORG_ID = `${SITE_URL}/#organization`;

const SERVICE_DESCRIPTIONS = {
  onlinevideo: {
    en: 'English scriptwriting and transcreation for brand films, TVC, product launch videos, and digital campaigns targeting global audiences.',
    ko: '브랜드 필름, TVC, 제품 런칭 영상 등을 위한 영어 스크립트 작성 및 트랜스크리에이션.',
  },
  brandstory: {
    en: 'English brand narrative writing — manifestos, brand books, vision statements, corporate introductions — for companies expanding internationally.',
    ko: '글로벌 시장을 위한 영어 브랜드 내러티브 — 매니페스토, 브랜드 북, 비전 스테이트먼트, 회사소개 등.',
  },
  naming: {
    en: 'English product, brand, and campaign naming with linguistic, cultural, and trademark vetting for global markets.',
    ko: '글로벌 시장을 위한 영어 제품명, 브랜드명, 캠페인명 개발 — 언어, 문화, 상표 검토 포함.',
  },
  slogan: {
    en: 'English taglines and slogans built for longevity, emotional impact, and cross-platform use across global markets.',
    ko: '글로벌 시장에서 지속적으로 사용할 수 있는 감성적이고 임팩트 있는 영어 슬로건 및 태그라인 개발.',
  },
  ceoscript: {
    en: 'Executive speeches, keynote addresses, award ceremony remarks, and diplomatic scripts in polished native English. Past clients include CEOs of Hyundai (CES 2022), LG, and Kia.',
    ko: '현대 CEO(CES 2022), LG, 기아 등의 경영진 연설문, 키노트 스크립트, 시상식 연설문을 포함한 고품격 영어 임원 스크립트 작성.',
  },
  website: {
    en: 'English UX copy, web content, and feature copywriting for Korean brands expanding to global audiences.',
    ko: '글로벌 시장을 겨냥한 한국 브랜드를 위한 영어 UX 카피, 웹 콘텐츠, 피처 카피라이팅.',
  },
};

const MEDIATYPE_GENRE = {
  video: 'Video Script / TVC',
  script: 'Executive Script / Keynote Speech',
  branding: 'Brand Writing / Identity',
  online: 'Digital & Website Copy',
  sns: 'Social Media Copy',
  ooh: 'Out-of-Home Advertising',
};

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
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        'url': SITE_URL,
        'name': 'Sticks & Stones Seoul',
        'alternateName': '스틱스앤스톤스',
        'description': lang === 'ko'
          ? '글로벌 브랜딩과 마케팅에 특화된 영어 전문 카피라이팅 회사, 스틱스앤스톤스 서울. CEO 스크립트, 브랜드 네이밍, 슬로건, TVC 카피, 웹사이트 카피 전문.'
          : 'Sticks & Stones Seoul — a specialized English copywriting and brand storytelling agency for Korean brands going global. CEO scripts, brand naming, slogans, TVC copy, website copy.',
        'inLanguage': ['ko', 'en'],
        'publisher': { '@id': ORG_ID },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${SITE_URL}/portfolio?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        'name': 'Sticks & Stones Seoul',
        'url': SITE_URL,
        'slogan': 'Words that stick, stories that sell.',
        'description': lang === 'ko'
          ? '글로벌 브랜딩과 마케팅에 특화된 영어 전문 카피라이팅 에이전시. LG, 삼성, 현대, 기아, 아모레퍼시픽, 이니스프리, 네이버, SK하이닉스, 세븐틴, 올리브영 등 국내 주요 브랜드와 협업.'
          : 'A specialized English copywriting and brand storytelling agency based in Seoul. Clients include LG Electronics, Samsung, Hyundai, Kia, AMOREPACIFIC, innisfree, Naver, SK hynix, SEVENTEEN, Olive Young, Kakao Pay, Genesis, Hankook Tire, Doosan, and Hanwha.',
        'telephone': '+82-2-793-7857',
        'email': 'talk@stks.kr',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '42, Noksapyeong-daero 26-gil',
          'addressLocality': 'Yongsan-gu',
          'addressRegion': 'Seoul',
          'addressCountry': 'KR',
        },
        'logo': `${SITE_URL}/assets/favicon/favicon.png`,
        'knowsAbout': [
          'English Copywriting', 'Brand Storytelling', 'CEO Speechwriting',
          'Keynote Script Writing', 'Brand Naming', 'Slogan Writing',
          'Transcreation', 'Copywashing', 'Website Copywriting', 'UX Copywriting',
          'Online Video Scriptwriting', 'TVC Scriptwriting', 'Brand Manifesto',
          'Brand Guidelines', 'Tone of Voice', 'Message Matrix',
          'Global Brand Communication', 'Korean-to-English Marketing Copy',
          'Out-of-Home Advertising Copy', 'Social Media Copywriting',
          'B2B Copywriting', 'Executive Communications',
        ],
      },
    ],
  };
}

function aboutSchema(lang) {
  const realTeam = team.filter(m => m.role.en !== 'Chief Happiness Officer');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}about#webpage`,
        'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}about`,
        'name': lang === 'ko' ? '스틱스앤스톤스 소개 | Sticks & Stones Seoul' : 'About Sticks & Stones Seoul',
        'description': lang === 'ko'
          ? '인상적인 메시지를 쓰는 건 어렵습니다. 영어로는 더더욱. 스틱스앤스톤스는 글로벌 브랜딩 전문 영어 카피라이팅 에이전시입니다. 에미상 수상 크리에이티브 디렉터 Richard Kim과 뉴욕타임즈 출신 카피 전략가 Brixton Sandhals가 이끄는 네이티브 영어 전문 팀.'
          : 'Landing your brand story globally takes a little more. Meet the native English-speaking team behind Sticks & Stones Seoul — led by Emmy Award winner Richard Kim and New York Times editor Brixton Sandhals.',
        'publisher': { '@id': ORG_ID },
        'about': { '@id': ORG_ID },
        'mainEntity': { '@id': ORG_ID },
      },
      ...realTeam.map(member => {
        const experienceList = member.experience.en;
        const educationList = member.education.en;
        return {
          '@type': 'Person',
          'name': member.name.en,
          'jobTitle': member.role.en,
          'image': `${SITE_URL}${member.image}`,
          'worksFor': { '@id': ORG_ID },
          'description': experienceList.join('. '),
          'alumniOf': educationList.map(e => ({
            '@type': 'CollegeOrUniversity',
            'name': e.school,
            'description': e.degree,
          })),
          'knowsAbout': buildKnowsAbout(member.role.en, experienceList),
        };
      }),
    ],
  };
}

function buildKnowsAbout(role, experienceList) {
  const shared = ['English Copywriting', 'Brand Communication', 'Global Marketing'];
  const roleMap = {
    'Creative Director': ['Scriptwriting', 'Brand Storytelling', 'Voice Acting', 'Film Production', 'Executive Communications', 'Marketing Strategy'],
    'Copy Strategist': ['Copywriting Strategy', 'Editorial Writing', 'Brand Narrative', 'English Literature'],
    'Account Manager': ['Account Management', 'Spanish', 'AI', 'Software', 'Client Relations'],
    'Account Executive': ['Korean-English Translation', 'Marketing Translation', 'Language Instruction', 'Japanese'],
    'Translation Specialist': ['Korean-English Translation', 'Broadcast Writing', 'Journalism', 'Editorial'],
  };
  return [...shared, ...(roleMap[role] || [])];
}

function servicesSchema(lang) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}services#webpage`,
        'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}services`,
        'name': lang === 'ko' ? '스틱스앤스톤스 서비스' : 'English Copywriting Services | Sticks & Stones Seoul',
        'description': lang === 'ko'
          ? '온라인 비디오, 브랜드 스토리, 네이밍, 슬로건, CEO 스크립트, 웹사이트 카피 — 영어 카피라이팅 전 분야.'
          : 'Online video scripts, brand storytelling, naming, slogans, CEO scripts, and website copy — full-service English copywriting for Korean brands going global.',
        'publisher': { '@id': ORG_ID },
      },
      ...services.map((s, i) => {
        const desc = SERVICE_DESCRIPTIONS[s.id] || {};
        return {
          '@type': 'Service',
          '@id': `${SITE_URL}/#service-${s.id}`,
          'name': s.label[lang],
          'description': desc[lang] || s.label.en,
          'provider': { '@id': ORG_ID },
          'areaServed': 'Worldwide',
          'availableLanguage': 'English',
          'position': i + 1,
        };
      }),
      {
        '@type': 'ItemList',
        'name': lang === 'ko' ? '스틱스앤스톤스 서비스 목록' : 'Sticks & Stones Service List',
        'itemListElement': services.map((s, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'item': { '@id': `${SITE_URL}/#service-${s.id}` },
        })),
      },
    ],
  };
}

function mediaTypeKeywords(mediaType) {
  const types = mediaType.split(',').map(t => t.trim());
  const map = {
    video: ['Video Script', 'TVC', 'Brand Film', 'English Video Copy'],
    script: ['Executive Script', 'Keynote Speech', 'CEO Script', 'Speechwriting'],
    branding: ['Brand Writing', 'Brand Identity', 'Brand Naming', 'Brand Story'],
    online: ['Digital Copy', 'Website Copy', 'UX Copy', 'Online Features'],
    sns: ['Social Media Copy', 'SNS Copy'],
    ooh: ['Out-of-Home Advertising', 'OOH Copy', 'Exhibition Copy', 'Convention Copy'],
  };
  return types.flatMap(t => map[t] || [t]);
}

function portfolioListSchema(lang) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio#webpage`,
        'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio`,
        'name': lang === 'ko' ? '포트폴리오 | 스틱스앤스톤스' : 'Portfolio | Sticks & Stones Seoul',
        'description': lang === 'ko'
          ? 'LG, 삼성, 현대, 기아, 아모레퍼시픽, 이니스프리, 네이버, SK하이닉스 등 국내 주요 브랜드의 영어 카피라이팅 포트폴리오.'
          : 'English copywriting portfolio — CEO speeches, brand naming, TVC scripts, website copy, slogans, and more. Clients include LG, Samsung, Hyundai, Kia, AMOREPACIFIC, Naver, SK hynix, innisfree, Olive Young, SEVENTEEN, and many more.',
        'publisher': { '@id': ORG_ID },
        'numberOfItems': portfolio.length,
      },
      {
        '@type': 'ItemList',
        'name': lang === 'ko' ? '포트폴리오 목록' : 'Portfolio Works',
        'numberOfItems': portfolio.length,
        'itemListElement': portfolio.map((item, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'item': {
            '@type': 'CreativeWork',
            '@id': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio/${item.id}#work`,
            'name': item.title[lang],
            'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio/${item.id}`,
            'creator': { '@id': ORG_ID },
            'description': item.mission[lang],
            'abstract': item.solution[lang],
            'genre': MEDIATYPE_GENRE[item.mediaType.split(',')[0].trim()] || item.mediaType,
            'keywords': mediaTypeKeywords(item.mediaType),
            'funder': { '@type': 'Organization', 'name': item.client },
            ...(item.videoUrl ? {
              'video': {
                '@type': 'VideoObject',
                'url': item.videoUrl,
                'name': item.title[lang],
              },
            } : {}),
          },
        })),
      },
    ],
  };
}

function portfolioItemSchema(lang, slug) {
  const item = portfolio.find(p => p.id === slug);
  if (!item) return homeSchema(lang);
  const keywords = mediaTypeKeywords(item.mediaType);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio/${item.id}#webpage`,
        'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio/${item.id}`,
        'name': `${item.title[lang]} | Sticks & Stones Seoul`,
        'description': item.mission[lang],
        'publisher': { '@id': ORG_ID },
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
            { '@type': 'ListItem', 'position': 2, 'name': lang === 'ko' ? '포트폴리오' : 'Portfolio', 'item': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio` },
            { '@type': 'ListItem', 'position': 3, 'name': item.title[lang], 'item': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio/${item.id}` },
          ],
        },
      },
      {
        '@type': 'CreativeWork',
        '@id': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio/${item.id}#work`,
        'name': item.title[lang],
        'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}portfolio/${item.id}`,
        'creator': { '@id': ORG_ID },
        'description': item.mission[lang],
        'abstract': item.solution[lang],
        'genre': MEDIATYPE_GENRE[item.mediaType.split(',')[0].trim()] || item.mediaType,
        'keywords': keywords,
        'inLanguage': 'en',
        'funder': {
          '@type': 'Organization',
          'name': item.client,
        },
        'about': {
          '@type': 'Thing',
          'name': item.title[lang],
          'description': item.mission[lang],
        },
        ...(item.videoUrl ? {
          'video': {
            '@type': 'VideoObject',
            'url': item.videoUrl,
            'name': item.title[lang],
            'description': item.solution[lang],
          },
        } : {}),
      },
    ],
  };
}

function clientsSchema(lang) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}clients#webpage`,
        'url': `${SITE_URL}/${lang === 'en' ? 'en/' : ''}clients`,
        'name': lang === 'ko' ? '클라이언트 후기 | 스틱스앤스톤스' : 'Client Testimonials | Sticks & Stones Seoul',
        'description': lang === 'ko'
          ? 'TBWA, Innocean, SK Planet, 삼성, LG 등 국내 주요 에이전시 및 브랜드 담당자들의 스틱스앤스톤스 협업 후기.'
          : 'What leading Korean agencies and brands say about working with Sticks & Stones Seoul — TBWA, Innocean, SK Planet, Sam Seoul, Dexter Krema, and more.',
        'publisher': { '@id': ORG_ID },
      },
      {
        '@type': 'ItemList',
        'name': lang === 'ko' ? '클라이언트 후기 목록' : 'Client Testimonial List',
        'numberOfItems': testimonials.length,
        'itemListElement': testimonials.map((t, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'item': {
            '@type': 'Review',
            'reviewBody': t.quote[lang],
            'author': {
              '@type': 'Person',
              'name': t.author[lang],
            },
            'reviewRating': {
              '@type': 'Rating',
              'ratingValue': '5',
              'bestRating': '5',
              'worstRating': '1',
            },
            'itemReviewed': {
              '@type': 'ProfessionalService',
              '@id': ORG_ID,
              'name': 'Sticks & Stones Seoul',
              'description': lang === 'ko'
                ? '글로벌 브랜딩과 마케팅에 특화된 영어 전문 카피라이팅 회사'
                : 'Specialized English copywriting and brand storytelling agency for global branding and marketing',
            },
          },
        })),
      },
    ],
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
