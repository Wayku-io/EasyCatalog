// TMDB API Service

export function getEffectiveTmdbKey(apiKey) {
  return (apiKey && apiKey.trim()) || import.meta.env.VITE_TMDB_API_KEY || '';
}

export function hasGlobalTmdbKey() {
  return Boolean(import.meta.env.VITE_TMDB_API_KEY);
}

export async function searchTMDB(query, type = 'movie', apiKey, lang = 'fr') {
  const effectiveKey = getEffectiveTmdbKey(apiKey);
  if (!query || !query.trim() || !effectiveKey) return [];

  const tmdbLang = lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-BR' : 'en-US';
  const cleanQuery = encodeURIComponent(query.trim());

  // Determine endpoint(s): support 'movie', 'series', and 'tv'
  const isSeries = type === 'series' || type === 'tv';
  const typesToSearch = type === 'all' ? ['movie', 'tv'] : [isSeries ? 'tv' : 'movie'];
  
  let allResults = [];

  for (const t of typesToSearch) {
    const urlPage1 = `https://api.themoviedb.org/3/search/${t}?api_key=${effectiveKey}&query=${cleanQuery}&language=${tmdbLang}&page=1`;
    const urlPage2 = `https://api.themoviedb.org/3/search/${t}?api_key=${effectiveKey}&query=${cleanQuery}&language=${tmdbLang}&page=2`;

    try {
      const [res1, res2] = await Promise.all([
        fetch(urlPage1),
        fetch(urlPage2)
      ]);

      if (res1.ok) {
        const data1 = await res1.json();
        const items1 = (data1.results || []).map(item => formatTMDBItem(item, t));
        allResults = allResults.concat(items1);
      }
      if (res2.ok) {
        const data2 = await res2.json();
        const items2 = (data2.results || []).map(item => formatTMDBItem(item, t));
        allResults = allResults.concat(items2);
      }
    } catch (err) {
      console.error(`Error searching TMDB for type ${t}:`, err);
    }
  }

  // Filter out items without posters
  const validResults = allResults.filter(item => item.poster);

  // Sort by popularity to present most relevant items first
  validResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  // Deduplicate
  const seen = new Set();
  const uniqueResults = [];
  for (const item of validResults) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      uniqueResults.push(item);
    }
  }

  return uniqueResults;
}

function formatTMDBItem(item, rawType) {
  const isMovie = rawType === 'movie';
  const title = isMovie ? (item.title || item.original_title) : (item.name || item.original_name);
  const releaseDate = isMovie ? item.release_date : item.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : 'N/A';
  const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null;
  const stremioType = rawType === 'tv' ? 'series' : 'movie';

  return {
    id: `tmdb:${item.id}`,
    rawId: item.id,
    type: stremioType,
    title: title || 'Sans titre',
    year: year,
    poster: poster,
    overview: item.overview || '',
    voteAverage: item.vote_average ? item.vote_average.toFixed(1) : null,
    popularity: item.popularity || 0
  };
}
