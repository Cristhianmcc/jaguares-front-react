import React from 'react';

const deportes = [
  {
    id: 1,
    categoria: 'Academia',
    fecha: 'Inscripciones Abiertas',
    titulo: 'Fútbol - Forja tu camino hacia el éxito',
    descripcion: 'Entrenamiento profesional con metodología de alto rendimiento para todas las edades. Desarrolla técnica, táctica y valores deportivos.',
    imagen: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80',
    destacado: true
  },
  {
    id: 2,
    categoria: 'Programa',
    fecha: 'Lunes y Miércoles',
    titulo: 'Básquet - Alcanza nuevas alturas',
    descripcion: 'Mejora tu juego en equipo y habilidades técnicas con nuestros entrenadores certificados.',
    imagen: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    destacado: false
  },
  {
    id: 3,
    categoria: 'Formación',
    fecha: 'Martes y Jueves',
    titulo: 'Vóley - Potencia tu juego en red',
    descripcion: 'Perfecciona tu saque, remate y bloqueo con sesiones intensivas de entrenamiento.',
    imagen: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
    destacado: false
  },
  {
    id: 4,
    categoria: 'Bienestar',
    fecha: 'Horarios Flexibles',
    titulo: 'Funcional Mixto - Supera tus límites',
    descripcion: 'Sesiones que combinan fuerza, resistencia y agilidad para transformar tu condición física.',
    imagen: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    destacado: false
  }
];

export default function DeportesSection() {
  const destacado = deportes.find(d => d.destacado);
  const lista = deportes.filter(d => !d.destacado);

  return (
    <section className="deportes-section">
      <style>{`
        .deportes-section {
          background: #fff;
          padding: 80px 20px;
        }

        .deportes-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .deportes-header {
          margin-bottom: 40px;
        }

        .deportes-subtitle {
          font-family: 'Inter Tight', sans-serif;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #C59D5F;
          font-style: italic;
          margin-bottom: 10px;
        }

        .deportes-title {
          font-family: 'Inter Tight', sans-serif;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .deportes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        /* Artículo destacado */
        .deporte-destacado {
          display: flex;
          flex-direction: column;
        }

        .deporte-destacado-image {
          position: relative;
          width: 100%;
          height: 300px;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .deporte-destacado-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .deporte-destacado:hover .deporte-destacado-image img {
          transform: scale(1.05);
        }

        .deporte-destacado-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          background: #C59D5F;
          color: #fff;
          font-family: 'Inter Tight', sans-serif;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 8px 16px;
          border-radius: 4px;
        }

        .deporte-destacado-content {
          display: flex;
          gap: 20px;
        }

        .deporte-destacado-date {
          flex-shrink: 0;
          text-align: center;
          padding-right: 20px;
          border-right: 2px solid #eee;
        }

        .deporte-destacado-date-icon {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
        }

        .deporte-destacado-date-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .deporte-destacado-text h3 {
          font-family: 'Inter Tight', sans-serif;
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 15px 0;
          line-height: 1.3;
        }

        .deporte-destacado-text p {
          font-family: 'DM Sans', sans-serif;
          font-size: 17px;
          color: #666;
          line-height: 1.7;
          margin: 0 0 18px 0;
        }

        .deporte-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter Tight', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #C59D5F;
          text-decoration: none;
          transition: gap 0.3s ease;
        }

        .deporte-cta:hover {
          gap: 12px;
        }

        .deporte-cta svg {
          width: 16px;
          height: 16px;
        }

        /* Lista de deportes */
        .deportes-lista {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .deporte-item {
          display: flex;
          gap: 20px;
          padding-bottom: 25px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .deporte-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .deporte-item:hover {
          transform: translateX(5px);
        }

        .deporte-item-image {
          flex-shrink: 0;
          width: 140px;
          height: 105px;
          border-radius: 6px;
          overflow: hidden;
        }

        .deporte-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .deporte-item:hover .deporte-item-image img {
          transform: scale(1.1);
        }

        .deporte-item-content {
          flex: 1;
        }

        .deporte-item-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .deporte-item-categoria {
          font-family: 'Inter Tight', sans-serif;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #1a1a1a;
        }

        .deporte-item-fecha {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #999;
        }

        .deporte-item h4 {
          font-family: 'Inter Tight', sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.4;
          transition: color 0.3s ease;
        }

        .deporte-item:hover h4 {
          color: #C59D5F;
        }

        @media (max-width: 900px) {
          .deportes-grid {
            grid-template-columns: 1fr;
            gap: 50px;
          }
        }

        @media (max-width: 600px) {
          .deportes-section {
            padding: 60px 15px;
          }

          .deporte-destacado-content {
            flex-direction: column;
            gap: 15px;
          }

          .deporte-destacado-date {
            display: flex;
            align-items: center;
            gap: 10px;
            border-right: none;
            border-bottom: 2px solid #eee;
            padding-right: 0;
            padding-bottom: 15px;
          }

          .deporte-item {
            flex-direction: column;
            gap: 15px;
          }

          .deporte-item-image {
            width: 100%;
            height: 180px;
          }
        }
      `}</style>

      <div className="deportes-container">
        <div className="deportes-header">
          <div className="deportes-subtitle">Nuestras Disciplinas</div>
          <h2 className="deportes-title">Deportes Jaguares</h2>
        </div>

        <div className="deportes-grid">
          {/* Artículo destacado */}
          <div className="deporte-destacado">
            <div className="deporte-destacado-image">
              <img src={destacado.imagen} alt={destacado.titulo} />
              <span className="deporte-destacado-badge">{destacado.categoria}</span>
            </div>
            <div className="deporte-destacado-content">
              <div className="deporte-destacado-date">
                <div className="deporte-destacado-date-icon">⚽</div>
                <div className="deporte-destacado-date-label">2026</div>
              </div>
              <div className="deporte-destacado-text">
                <h3>{destacado.titulo}</h3>
                <p>{destacado.descripcion}</p>
                <a href="/inscripcion" className="deporte-cta">
                  Inscríbete ahora
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Lista de deportes */}
          <div className="deportes-lista">
            {lista.map((deporte) => (
              <a href="/inscripcion" key={deporte.id} className="deporte-item" style={{ textDecoration: 'none' }}>
                <div className="deporte-item-image">
                  <img src={deporte.imagen} alt={deporte.titulo} />
                </div>
                <div className="deporte-item-content">
                  <div className="deporte-item-meta">
                    <span className="deporte-item-categoria">{deporte.categoria}</span>
                    <span className="deporte-item-fecha">• {deporte.fecha}</span>
                  </div>
                  <h4>{deporte.titulo}</h4>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
