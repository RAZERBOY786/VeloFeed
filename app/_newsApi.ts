// // app/_newsApi.ts
// import { Article, Category, Language } from './_types';

// // const API_KEY = 'a3ed188f67b34ca283677f09a51f118f';
// const API_KEY = 'pub_6b0e017762564587b60461a4ef55160a';
// const BASE_URL = 'https://newsapi.org/v2';

// export const fetchLiveNews = async (category: Category, language: Language = 'en'): Promise<Article[]> => {
//   try {
//     const queryCategory = category === 'politics' ? 'general' : category;
//     let url = '';

//     // If language is English, keep using the fast top-headlines endpoint for the US region
//     if (language === 'en') {
//       url = `${BASE_URL}/top-headlines?country=us&category=${queryCategory}&apiKey=${API_KEY}`;
//     } else {
//       // For localized languages (Hindi / Bengali), top-headlines can be empty.
//       // We safely pivot to the /everything endpoint with custom keyword queries to get rich local feeds!
//       let searchKeyword = queryCategory;
//       if (language === 'hi') {
//         // Broad Hindi context keywords based on selected category tags
//         searchKeyword = queryCategory === 'general' ? 'समाचार' : queryCategory;
//       } else if (language === 'bn') {
//         // Broad Bengali context keywords based on selected category tags
//         searchKeyword = queryCategory === 'general' ? 'খবর' : queryCategory;
//       }

//       // We query the everything endpoint filtered specifically by targeted languages
//       url = `${BASE_URL}/everything?q=${encodeURIComponent(searchKeyword)}&language=${language}&sortBy=publishedAt&pageSize=30&apiKey=${API_KEY}`;
//     }

//     const response = await fetch(url);
//     const data = await response.json();

//     if (data.status !== 'ok') {
//       throw new Error(data.message || 'Failed to pull updated network records');
//     }

//     // Process and filter out any deleted or placeholder articles from the payload stream
//     const validArticles = (data.articles || []).filter((art: any) => 
//       art.title && 
//       art.title !== '[Removed]' && 
//       art.description !== '[Removed]'
//     );

//     return validArticles.map((art: any, index: number) => ({
//       id: art.url + index,
//       title: art.title || 'Breaking Title Update',
//       description: art.description || 'Tap reading module details to load full dynamic content streaming structures.',
//       urlToImage: art.urlToImage || 'https://picsum.photos/600/400',
//       url: art.url,
//       source: { name: art.source?.name || 'Local Media Desk' },
//       publishedAt: art.publishedAt 
//         ? new Date(art.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
//         : 'Live 2026',
//       category: category,
//       language: language,
//       likes: Math.floor(Math.random() * 450) + 20
//     }));
//   } catch (error) {
//     console.error('News Engine Network Fault: ', error);
//     return [];
//   }
// };

// // ✅ REQUIRED by Expo Router
// export default fetchLiveNews;

// app/_newsApi.ts
// import { Category, Article } from './_types';

// const API_KEY = 'pub_6b0e017762564587b60461a4ef55160a';
// const BASE_URL = 'https://newsdata.io/api/1/latest';

// const BACKUP_DATABASE: Record<Category, Array<Partial<Article>>> = {
//   politics: [
//     { title: 'Global Trade Accord Re-negotiated by Transnational Alliance', description: 'Diplomats finalized a sweeping economic framework streamlining international customs lanes and automated digital commerce tax rules.' },
//     { title: 'New Regulatory Guidelines Formulated for Decentralized Financial Networks', description: 'Legislators proposed unified administrative tracking compliance structures targeting cross-border enterprise digital ledgers.' }
//   ],
//   sports: [
//     { title: 'Championship Finals Break All-Time Global Streaming Record', description: 'Over eighty-five million concurrent dynamic view streams were logged during last night’s tournament finish.' },
//     { title: 'International Athletic Board Announces Infrastructure Grant Inflows', description: 'Dozens of localized athletic training centers will receive complete technical revamps to support performance biometric arrays.' }
//   ],
//   technology: [
//     { title: 'Next-Generation Silicon Architecture Slashes Mobile Battery Consumption', description: 'Engineers unveiled an optimized processing grid capable of executing complex matrix transformations at half the watt usage.' },
//     { title: 'Open-Source AI Language Model Released with Native Compression Loops', description: 'A lightweight enterprise neural networking model has hit public repositories, enabling instant edge deployment across consumer devices.' }
//   ],
//   entertainment: [
//     { title: 'Virtual Reality Cinema Venture Secures Major Studio Syndication Deals', description: 'Production conglomerates partnered to distribute immersive spatial audio and interactive visual entertainment layers to subscribers.' },
//     { title: 'Independent Streaming Platform Valuation Triples Following Content Boom', description: 'A creator-focused decentralized media house reported record-breaking subscriber growth metrics outperforming traditional channels.' }
//   ],
//   business: [
//     { title: 'Venture Capital Inflows Accelerate Across Edge Computing Startups', description: 'Strategic growth funds allocated massive financing rounds toward full-stack localized container orchestration tools.' },
//     { title: 'Market Analysts Predict Resilient Economic Momentum Across Emerging Hubs', description: 'Macroeconomic indicators signal expansion as industrial supply loops adapt to real-time automated fulfillment channels.' }
//   ],
//   health: [
//     { title: 'Biomimetic Neural Implants Receive Preliminary Clinical Clearance', description: 'Bio-tech developers secured authorization to test high-density assistive micro-electrode interfaces designed to restore motor signals.' },
//     { title: 'Nutritional Optimization Engine Utilizes Automated Metabolic Analytics', description: 'Health platforms launched a cloud-synchronized dietary planning engine using automated blood-marker telemetry readings.' }
//   ]
// };

// export async function fetchLiveNews(category: Category, lang: string): Promise<Article[]> {
//   // Safe shell to catch any unexpected rejections and prevent app crash
//   try {
//     const categoryTag = category === 'politics' ? 'politics,top' : category;
//     const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&category=${categoryTag}&language=${lang}`).catch(() => null);

//     if (!response) {
//       return getLocalBackupArticles(category, lang);
//     }

//     const data = await response.json().catch(() => null);

//     if (data && data.status === 'success' && data.results && data.results.length > 0) {
//       return data.results.map((art: any, index: number) => ({
//         id: String(art.article_id || art.link || 'art_id_') + index,
//         title: art.title || 'VeloFeed News Update',
//         description: art.description || art.content || 'Select full coverage option configurations below to view comprehensive global data layers compiled directly by localized wire desks.',
//         url: art.link || 'https://www.bloomberg.com',
//         urlToImage: art.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop',
//         publishedAt: art.pubDate ? new Date(art.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
//         category: category,
//         source: {
//           id: art.source_id || 'velofeed_wire',
//           name: art.source_name || 'VeloFeed Bureau'
//         }
//       }));
//     }
    
//     return getLocalBackupArticles(category, lang);
//   } catch (error) {
//     // Intercepts structural failures silently and recovers using backup stream
//     return getLocalBackupArticles(category, lang);
//   }
// }

// function getLocalBackupArticles(category: Category, lang: string): Article[] {
//   const seeds = BACKUP_DATABASE[category] || BACKUP_DATABASE['technology'];
//   return seeds.map((item, index) => ({
//     id: `backup_${category}_${index}_${lang}`,
//     title: item.title || 'VeloFeed Wire Broadcast',
//     description: item.description || 'Full coverage assets compiled successfully.',
//     url: 'https://www.bloomberg.com',
//     urlToImage: index % 2 === 0 
//       ? 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop'
//       : 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
//     publishedAt: `${10 * (index + 1)}m ago`,
//     category: category,
//     source: { id: 'velofeed_wire', name: 'VeloFeed Bureau' }
//   }));
// }

// // ✅ Tricked Expo Router to silence the folder layout validation warnings
// export default function MutedRouteFallback() {
//   return null;
// }


// app/_newsApi.ts
import { Category, Article } from './_types';

const API_KEY = 'pub_5e77f2be0c024de0a3d9dcdbff3c6bd1'; 
const BASE_URL = 'https://newsdata.io/api/1/news'; 

export async function fetchLiveNews(category: Category, lang: string): Promise<Article[]> {
  try {
    let url = '';

    // Combines separate sector streams into a single multi-query fallback parameters string 
    if (category === 'all') {
      url = `${BASE_URL}?apikey=${API_KEY}&language=${lang}&category=politics,sports,technology,entertainment,business,health`;
    } else {
      const categoryTag = category === 'politics' ? 'politics,top' : category;
      url = `${BASE_URL}?apikey=${API_KEY}&category=${categoryTag}&language=${lang}`;
    }
    
    const response = await fetch(url).catch(() => null);

    if (!response) {
      console.log(`❌ [VeloFeed API Hub] Network layer disconnect.`);
      return [];
    }

    if (!response.ok) {
      console.log(`❌ [VeloFeed API Hub] HTTP Status Error: ${response.status} for category [${category}].`);
      return [];
    }

    const data = await response.json().catch(() => null);

    if (data && data.status === 'error') {
      console.log(`❌ [VeloFeed API Server Error] Code: ${data.results?.code}. Message: ${data.results?.message}`);
      return [];
    }

    if (data && data.status === 'success' && data.results && data.results.length > 0) {
      console.log(`✅ [VeloFeed Engine Sync Success] Loaded ${data.results.length} live records for category: ${category}`);
      
      return data.results.map((art: any, index: number) => ({
        id: String(art.article_id || art.link || 'art_id_') + index + "_" + Math.random().toString(36).substr(2, 4),
        title: art.title || 'VeloFeed News Update',
        description: art.description || art.content || 'Select full coverage option configurations below to view comprehensive global data layers.',
        url: art.link || 'https://www.bloomberg.com',
        urlToImage: art.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop',
        publishedAt: art.pubDate ? new Date(art.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
        category: category,
        source: {
          id: art.source_id || 'velofeed_wire',
          name: art.source_name || 'VeloFeed Bureau'
        }
      }));
    }
    
    return [];
  } catch (error) {
    console.log(`❌ [VeloFeed Fetch Exception] Core request failed:`, error);
    return [];
  }
}

export default function MutedRouteFallback() {
  return null;
}