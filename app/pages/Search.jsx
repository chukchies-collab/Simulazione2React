import { useCallback, useState } from 'react';
import ActionButtons from '../components/ActionButtons.jsx';
import ShowCard from '../components/ShowCard.jsx';
import ShowDetails from '../components/ShowDetails.jsx';
import ShowSuggestions from '../components/ShowSuggestions.jsx';
import { getShowById, getShowSuggestions, mapShowSummary, searchShows } from '../scripts/api.js';
import {
  addFavorite,
  addToHistory,
  addToWatch,
  addWatched,
  isFavorite,
  isInToWatch,
  isWatched,
  removeToWatch,
} from '../scripts/storage.js';

/**
 * Pagina Ricerca: cerca serie su TVmaze, mostra la scheda dello show corrente
 * e i pulsanti rapidi per salvarlo in preferiti / visti / da vedere.
 * @returns {React.JSX.Element}
 */
function Search() {
  const [query, setQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState('idle'); // idle | loading | done | empty | error
  const [searchError, setSearchError] = useState('');
  const [matches, setMatches] = useState([]);

  const [currentShow, setCurrentShow] = useState(null);
  const [detailsStatus, setDetailsStatus] = useState('idle'); // idle | loading | done | error
  const [detailsError, setDetailsError] = useState('');

  const [, forceRefresh] = useState(0);
  const refresh = () => forceRefresh((n) => n + 1);

  const toRecord = (show) => mapShowSummary(show);

  const loadShow = useCallback(async (showId, fallbackName = '') => {
    setDetailsStatus('loading');

    try {
      const show = await getShowById(showId);
      setCurrentShow(show);
      addToHistory(toRecord(show));
      setDetailsStatus('done');
    } catch (error) {
      setDetailsStatus('error');
      setDetailsError(error.message);
    }
  }, []);

  const searchByTitle = useCallback(
    async (rawQuery) => {
      const value = (rawQuery ?? query).trim();

      if (!value) {
        alert('Inserisci il titolo di una serie');
        return;
      }

      setSearchStatus('loading');
      setCurrentShow(null);
      setDetailsStatus('idle');

      try {
        const results = await searchShows(value);

        if (!results.length) {
          setSearchStatus('empty');
          setMatches([]);
          return;
        }

        setMatches(results.slice(0, 18));
        setSearchStatus('done');
        loadShow(results[0].id, results[0].name);
      } catch (error) {
        setSearchStatus('error');
        setSearchError(error.message);
      }
    },
    [query, loadShow]
  );

  function addCurrentToFavorites() {
    if (!currentShow) return;
    addFavorite(toRecord(currentShow));
    refresh();
  }

  function addCurrentToWatched() {
    if (!currentShow) return;
    const saved = addWatched(toRecord(currentShow));
    if (saved) {
      removeToWatch(currentShow.id);
      refresh();
    }
  }

  function toggleCurrentToWatch() {
    if (!currentShow) return;
    if (isInToWatch(currentShow.id)) {
      removeToWatch(currentShow.id);
    } else {
      addToWatch(toRecord(currentShow));
    }
    refresh();
  }

  return (
    <main className="main-content">
      <section className="page-section">
        <div className="search-form">
          <h2>Ricerca Serie TV</h2>
          <div className="form-group">
            <label htmlFor="show-input">Titolo serie:</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="show-input"
                placeholder="Es: Dark, Breaking Bad, Friends..."
                autoComplete="off"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    searchByTitle();
                  }
                }}
              />
              {/* TODO 2: Aggiungi le classi CSS mancanti per mostrare correttamente il pulsante di ricerca */}
              <button
                id="btn-search-show"
                className="btn btn-primary"
                onClick={() => searchByTitle()}
              >
                Cerca
              </button>
            </div>
            <ShowSuggestions
              query={query}
              fetchSuggestions={getShowSuggestions}
              onSelect={(item) => {
                setQuery(item.name);
                loadShow(item.id, item.name);
              }}
            />
          </div>
        </div>
      </section>

      <section className="page-section result-section-with-favorite">
        <div className="result-container">
          {detailsStatus === 'loading' && <div className="loading">Caricamento...</div>}
          {detailsStatus === 'error' && (
            <div className="error">
              <strong>Errore caricamento serie</strong>
              <p>{detailsError}</p>
            </div>
          )}
          {detailsStatus === 'done' && currentShow && (
            <ShowCard
              show={currentShow}
              compact
              actions={
                <ActionButtons
                  isFavorite={isFavorite(currentShow.id)}
                  isWatched={isWatched(currentShow.id)}
                  isToWatch={isInToWatch(currentShow.id)}
                  onAddFavorite={addCurrentToFavorites}
                  onAddWatched={addCurrentToWatched}
                  onToggleToWatch={toggleCurrentToWatch}
                />
              }
            />
          )}
        </div>
      </section>

      <section className="page-section details-section">
        <div className="details-container">
          {detailsStatus === 'done' && currentShow && (
            <ShowDetails show={currentShow} compact title="Approfondimento" />
          )}
        </div>
      </section>

      <section className="page-section">
        <div className="search-form">
          <h3>Risultati rapidi</h3>
          <div className="result-container">
            {searchStatus === 'empty' && <div className="empty">Nessun risultato.</div>}
            {searchStatus === 'error' && (
              <div className="error">
                <strong>Errore nella ricerca</strong>
                <p>{searchError}</p>
              </div>
            )}
            {searchStatus === 'done' && matches.length > 0 && (
              <div className="actions-grid">
                {matches.map((show) => {
                  const year = show.premiered ? show.premiered.slice(0, 4) : 'N/D';
                  return (
                    <button
                      key={show.id}
                      type="button"
                      className="btn btn-primary"
                      onClick={() => loadShow(show.id, show.name)}
                    >
                      {show.name} ({year})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Search;
