import React, { useState, useEffect } from 'react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3002' 
  : 'https://api.jaguarescar.com';

export default function RankingSection() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/public/ranking`);
        const data = await response.json();
        
        if (data.success && data.ranking) {
          setRanking(data.ranking);
        } else {
          setRanking([]);
        }
      } catch (err) {
        console.error('Error fetching ranking:', err);
        setError('No se pudo cargar el ranking');
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const gold = ranking[0] || null;
  const silver = ranking[1] || null;
  const bronze = ranking[2] || null;
  const restOfRanking = ranking.slice(3, 10);

  const getInitials = (name) => {
    if (!name) return 'J';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const defaultAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(getInitials(name))}&background=1a4a6e&color=fff&size=150`;

  // Rutas de imágenes de medallas
  const medalImages = {
    gold: '/assets/primer.png',
    silver: '/assets/segundo%20puesto.png',
    bronze: '/assets/tercer%20lugar.png'
  };

  return (
    <section className="ranking-section">
      <style>{`
        .ranking-section {
          position: relative;
          padding: 80px 20px 100px;
          background: #0a0a0a;
          overflow: hidden;
          min-height: auto;
          margin-bottom: 0;
        }

        /* Círculos decorativos */
        .ranking-circle {
          position: absolute;
          border: 2px solid rgba(197, 157, 95, 0.12);
          border-radius: 50%;
          pointer-events: none;
        }
        .ranking-circle-1 {
          width: 300px;
          height: 300px;
          top: -100px;
          left: -100px;
        }
        .ranking-circle-2 {
          width: 200px;
          height: 200px;
          top: 20%;
          right: 5%;
        }
        .ranking-circle-3 {
          width: 150px;
          height: 150px;
          bottom: 10%;
          left: 10%;
        }
        .ranking-circle-4 {
          width: 100px;
          height: 100px;
          top: 60%;
          right: 15%;
          background: rgba(197, 157, 95, 0.05);
        }
        .ranking-circle-5 {
          width: 80px;
          height: 80px;
          top: 15%;
          left: 20%;
          background: rgba(197, 157, 95, 0.03);
        }

        .ranking-container {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* Header */
        .ranking-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .ranking-title {
          font-family: 'Inter Tight', sans-serif;
          font-size: clamp(48px, 8vw, 72px);
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 4px;
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .ranking-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          color: #C59D5F;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: 600;
        }

        /* Podium */
        .podium-container {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 50px;
          padding: 0 20px;
        }

        @media (max-width: 640px) {
          .podium-container {
            flex-direction: column;
            align-items: center;
            gap: 30px;
          }
        }

        .podium-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .podium-item.gold {
          order: 2;
        }
        .podium-item.silver {
          order: 1;
        }
        .podium-item.bronze {
          order: 3;
        }

        @media (max-width: 640px) {
          .podium-item.gold { order: 1; }
          .podium-item.silver { order: 2; }
          .podium-item.bronze { order: 3; }
        }

        /* Medallas con imágenes */
        .medal-image {
          width: 120px;
          height: auto;
          object-fit: contain;
          margin-bottom: 15px;
          filter: drop-shadow(0 8px 20px rgba(0,0,0,0.5));
        }

        .medal-image.gold {
          width: 150px;
        }

        .medal-image.silver {
          width: 110px;
        }

        .medal-image.bronze {
          width: 110px;
        }

        /* Avatar con foto */
        .podium-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid;
          margin-bottom: 12px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.5);
          background: #1a1a1a;
        }

        .podium-avatar.gold {
          width: 130px;
          height: 130px;
          border-color: #FFD700;
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
        }

        .podium-avatar.silver {
          border-color: #C0C0C0;
          box-shadow: 0 0 20px rgba(192, 192, 192, 0.2);
        }

        .podium-avatar.bronze {
          border-color: #CD7F32;
          box-shadow: 0 0 20px rgba(205, 127, 50, 0.2);
        }

        .podium-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Info del jugador */
        .podium-position-tag {
          font-family: 'Inter Tight', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #C59D5F;
          margin-bottom: 4px;
        }

        .podium-name {
          font-family: 'Inter Tight', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          text-align: center;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .podium-name.gold {
          font-size: 20px;
        }

        .podium-sport {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          text-align: center;
          margin-bottom: 8px;
        }

        .podium-points {
          font-family: 'Inter Tight', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #C59D5F;
        }

        .podium-points.gold {
          font-size: 24px;
        }

        /* Lista de ranking */
        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 700px;
          margin: 0 auto;
        }

        .ranking-row {
          display: grid;
          grid-template-columns: 50px 1fr 80px;
          align-items: center;
          gap: 15px;
          padding: 8px 20px 8px 8px;
          background: linear-gradient(90deg, #C59D5F 0%, #d4ac6e 100%);
          border-radius: 50px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .ranking-row:hover {
          transform: translateX(5px);
          box-shadow: 0 5px 20px rgba(197, 157, 95, 0.3);
        }

        .ranking-row-pos {
          width: 44px;
          height: 44px;
          background: #1a3a5c;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter Tight', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #fff;
        }

        .ranking-row-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ranking-row-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #1a3a5c;
          flex-shrink: 0;
        }

        .ranking-row-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ranking-row-name {
          font-family: 'Inter Tight', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .ranking-row-points {
          font-family: 'Inter Tight', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #1a1a1a;
          text-align: right;
        }

        /* Estados */
        .ranking-loading,
        .ranking-empty {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255,255,255,0.7);
        }

        .ranking-loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(197, 157, 95, 0.2);
          border-top-color: #C59D5F;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .ranking-empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .ranking-empty-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 18px;
          color: rgba(255,255,255,0.7);
        }

        .ranking-empty-subtext {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          margin-top: 8px;
        }
      `}</style>

      {/* Círculos decorativos */}
      <div className="ranking-circle ranking-circle-1" />
      <div className="ranking-circle ranking-circle-2" />
      <div className="ranking-circle ranking-circle-3" />
      <div className="ranking-circle ranking-circle-4" />
      <div className="ranking-circle ranking-circle-5" />

      <div className="ranking-container">
        {/* Header */}
        <div className="ranking-header">
          <h2 className="ranking-title">RANKING</h2>
          <p className="ranking-subtitle">Mejores Puntuaciones del Mes</p>
        </div>

        {loading ? (
          <div className="ranking-loading">
            <div className="ranking-loading-spinner" />
            <p>Cargando ranking...</p>
          </div>
        ) : error ? (
          <div className="ranking-empty">
            <div className="ranking-empty-icon">⚠️</div>
            <p className="ranking-empty-text">{error}</p>
          </div>
        ) : ranking.length === 0 ? (
          <div className="ranking-empty">
            <div className="ranking-empty-icon">🏆</div>
            <p className="ranking-empty-text">No hay datos de ranking este mes</p>
            <p className="ranking-empty-subtext">¡Participa en clases para acumular puntos!</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="podium-container">
              {/* Silver - 2do lugar */}
              {silver && (
                <div className="podium-item silver">
                  <img src={medalImages.silver} alt="2do lugar" className="medal-image silver" />
                  <div className="podium-avatar silver">
                    <img 
                      src={silver.foto_url || defaultAvatar(silver.nombre_corto)} 
                      alt={silver.nombre_corto}
                      onError={(e) => { e.target.src = defaultAvatar(silver.nombre_corto); }}
                    />
                  </div>
                  <span className="podium-position-tag">#2</span>
                  <h3 className="podium-name">{silver.nombre_corto}</h3>
                  <p className="podium-sport">{silver.deporte}</p>
                  <span className="podium-points">{silver.puntos} pts</span>
                </div>
              )}

              {/* Gold - 1er lugar */}
              {gold && (
                <div className="podium-item gold">
                  <img src={medalImages.gold} alt="1er lugar" className="medal-image gold" />
                  <div className="podium-avatar gold">
                    <img 
                      src={gold.foto_url || defaultAvatar(gold.nombre_corto)} 
                      alt={gold.nombre_corto}
                      onError={(e) => { e.target.src = defaultAvatar(gold.nombre_corto); }}
                    />
                  </div>
                  <span className="podium-position-tag">#1</span>
                  <h3 className="podium-name gold">{gold.nombre_corto}</h3>
                  <p className="podium-sport">{gold.deporte}</p>
                  <span className="podium-points gold">{gold.puntos} pts</span>
                </div>
              )}

              {/* Bronze - 3er lugar */}
              {bronze && (
                <div className="podium-item bronze">
                  <img src={medalImages.bronze} alt="3er lugar" className="medal-image bronze" />
                  <div className="podium-avatar bronze">
                    <img 
                      src={bronze.foto_url || defaultAvatar(bronze.nombre_corto)} 
                      alt={bronze.nombre_corto}
                      onError={(e) => { e.target.src = defaultAvatar(bronze.nombre_corto); }}
                    />
                  </div>
                  <span className="podium-position-tag">#3</span>
                  <h3 className="podium-name">{bronze.nombre_corto}</h3>
                  <p className="podium-sport">{bronze.deporte}</p>
                  <span className="podium-points">{bronze.puntos} pts</span>
                </div>
              )}
            </div>

            {/* Lista del 4 al 10 */}
            {restOfRanking.length > 0 && (
              <div className="ranking-list">
                {restOfRanking.map((player, index) => (
                  <div className="ranking-row" key={player.alumno_id}>
                    <div className="ranking-row-pos">#{index + 4}</div>
                    <div className="ranking-row-info">
                      <div className="ranking-row-avatar">
                        <img 
                          src={player.foto_url || defaultAvatar(player.nombre_corto)} 
                          alt={player.nombre_corto}
                          onError={(e) => { e.target.src = defaultAvatar(player.nombre_corto); }}
                        />
                      </div>
                      <span className="ranking-row-name">{player.nombre_corto}</span>
                    </div>
                    <span className="ranking-row-points">{player.puntos}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
