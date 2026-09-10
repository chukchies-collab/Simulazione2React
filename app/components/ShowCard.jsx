import { formatGenres, getStatusBadge } from '../scripts/showCodes.js';
import { stripHtml } from '../scripts/text.js';

/**
 * Produce una versione testuale ridotta della summary di una serie.
 * Rimuove HTML e limita la lunghezza a 280 caratteri aggiungendo "..." se necessario.
 * @param {Object} show - Oggetto show ricevuto dall'API
 * @returns {string} Testo plain della descrizione o una stringa di fallback
 */
function getSafeSummary(show) {
  const plain = stripHtml(show.summary || '').trim();
  if (!plain) {
    return 'Nessuna descrizione disponibile.';
  }
  return plain.length > 280 ? `${plain.slice(0, 280)}...` : plain;
}

/**
 * Scheda di una serie TV (poster, dettagli rapidi e azioni).
 * @param {Object} props
 * @param {Object} props.show - Oggetto show dall'API (campi: name, image, rating, genres, summary, ecc.)
 * @param {string} [props.titleOverride] - Titolo opzionale da visualizzare al posto del nome
 * @param {boolean} [props.compact] - Variante compatta della card
 * @param {React.ReactNode} [props.actions] - Pulsanti azione da montare nell'header della card
 * @returns {React.JSX.Element}
 */
function ShowCard({ show, titleOverride = '', compact = false, actions = null }) {
  const title = titleOverride || show.name || 'Titolo sconosciuto';
  const poster = show.image?.medium || show.image?.original || '';
  const rating = show.rating?.average ?? 'N/D';
  const genres = formatGenres(show.genres);
  const status = getStatusBadge(show.status);

  return (
    <article className={`series-card${compact ? ' compact' : ''}`}>
      <div className="series-title-block">
        <h2>{title}</h2>
        <p className="series-status"> {status}</p>
      </div>
      {/* TODO 1: Manca da vedere l'header e i meta della serie.
          Per farlo mettiamo un div con classe "series-title-block" che contiene:
          - h2 per il titolo (variabile `title`)
          - p per lo status (con classe "series-status", variabile `status`).
          Poi nella sezione "series-meta" (sotto, in show-current) aggiungiamo:
          - div con classe "temp-main" che mostra il rating (variabile `rating`)
          - div con classe "temp-desc" che mostra i generi formattati (variabile `genres`)
          - p con classe "show-summary" che mostra la summary ridotta (usa getSafeSummary(show)). */}
      <div className="series-card-header">
        {actions ? <div className="series-actions">{actions}</div> : null}
      </div>

      <div className="series-current show-current">
        <div className="show-poster-wrap">
          {poster ? (
            <img className="show-poster" src={poster} alt={`Poster ${show.name}`} />
          ) : (
            <div className="show-poster-placeholder">No image</div>
          )}
        </div>
        <div className="series-meta show-meta">
          <div className="temp-main">{rating}</div>
          <div className="temp-desc">{genres}</div>
          <p className="show-summary">{getSafeSummary(show)}</p>
        </div>
      </div>

      <div className="series-details-grid">
        <div className="detail-item">
          <span className="detail-label">Lingua</span>
          <span className="detail-value">{show.language || 'N/D'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Prima uscita</span>
          <span className="detail-value">{show.premiered || 'N/D'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Network</span>
          <span className="detail-value">
            {show.network?.name || show.webChannel?.name || 'N/D'}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Tipo</span>
          <span className="detail-value">{show.type || 'N/D'}</span>
        </div>
      </div>
    </article>
  );
}

export default ShowCard;
