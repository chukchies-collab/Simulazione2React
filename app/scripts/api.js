// api.js - Funzioni per interrogare la TVmaze API

const API_BASE = 'https://api.tvmaze.com';

/**
 * Esegue una fetch e restituisce il JSON, sollevando un errore in caso di status non ok.
 * @param {string} url
 * @param {string} errorPrefix - Prefisso da usare nel messaggio d'errore
 * @returns {Promise<any>}
 */
async function requestJson(url, errorPrefix) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${errorPrefix} (errore ${response.status})`);
  }

  return response.json();
}

/**
 * Mappa un oggetto show dalla API in una forma semplificata usata dall'app.
 * @param {Object} show
 * @returns {Object}
 */
export function mapShowSummary(show) {
  return {
    id: show.id,
    name: show.name,
    language: show.language || 'N/D',
    genres: Array.isArray(show.genres) ? show.genres : [],
    status: show.status || 'N/D',
    premiered: show.premiered || 'N/D',
    rating: show.rating?.average ?? null,
    image: show.image?.medium || show.image?.original || '',
    network: show.network?.name || show.webChannel?.name || 'N/D',
    summary: show.summary || '',
  };
}

/**
 * Cerca show tramite TVmaze e restituisce l'array di oggetti show.
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchShows(query) {
  const url = `${API_BASE}/search/shows?q=${encodeURIComponent(query)}`;
  const data = await requestJson(url, 'Errore nella ricerca serie');

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => item.show).filter(Boolean);
}

/**
 * Restituisce un array di suggerimenti ridotti (id, name, year) per l'autocomplete.
 * @param {string} query
 * @returns {Promise<Array<{id:number,name:string,year:string}>>}
 */
export async function getShowSuggestions(query) {
  const shows = await searchShows(query);

  return shows.slice(0, 7).map((show) => {
    const year = show.premiered ? show.premiered.slice(0, 4) : 'N/D';

    return {
      id: show.id,
      name: show.name,
      year,
    };
  });
}

/**
 * Recupera i dettagli di una serie per ID, includendo cast ed episodi in _embedded.
 * @param {number|string} showId
 * @returns {Promise<Object>} Oggetto show esteso con _embedded
 */
export async function getShowById(showId) {
  if (!Number.isInteger(showId) || Number(showId) <= 0) {
    throw Error('Lid deve essere positivo e intero');
  }
  const show = await requestJson(`${API_BASE}/shows/${showId}`, 'error nella fetch dei dettagli');
  const cast = await requestJson(`${API_BASE}/shows/${showId}/cast`, 'error nella fetch del cast');
  const episodes = await requestJson(
    `${API_BASE}/shows/${showId}/episodes`,
    'error nella fetch degli episodes'
  );
  //   if (!Number.isInteger(showId) || showId <= 0) {
  //     throw new Error("L'ID deve essere un numero intero positivo.");
  //   }

  //   // 2. Esecuzione delle richieste in parallelo con Promise.all
  //   const [show, cast, episodes] = await Promise.all([
  //     requestJson(`${API_BASE}/shows/${showId}`, 'Error'),
  //     requestJson(`${API_BASE}/shows/${showId}/cast`, 'Error'),
  //     requestJson(`${API_BASE}/shows/${showId}/episodes`, 'Error'),
  //   ]);

  //   // 3. Restituzione dell'oggetto combinato con la proprietà _embedded
  return {
    ...show,
    _embedded: {
      cast,
      episodes,
    },
  };
}
// TODO 1: Usa l'id passato come argomento per recuperare i dettagli della serie, cast ed episodi.
// Prima controlla che l'id sia un numero intero positivo, altrimenti solleva un errore.
// Poi esegui tre fetch con la funzione requestJson:
// - una per i dettagli della serie (endpoint /shows/{id}) --> show
// - una per il cast (endpoint /shows/{id}/cast) --> cast
// - una per gli episodi (endpoint /shows/{id}/episodes) --> episodes
// Restituisci un oggetto che unisce i dettagli della serie con un campo _embedded che contiene cast ed episodi.
