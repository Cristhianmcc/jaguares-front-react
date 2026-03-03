import React from 'react';

// ─────────────────────────────────────────────────────────────
// Datos por defecto — exactamente los que estaban hardcodeados
// ─────────────────────────────────────────────────────────────
export const DEFAULT_PARTIDOS = [
  {
    id: 1,
    equipoLocal:  { nombre: 'Club de fútbol', logo: '/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/team1-copyright.png' },
    equipoVisita: { nombre: 'Real Madrid',    logo: '/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team2-copyright.png' },
    fecha:     '25 de agosto de 2024',
    resultado: '8:00 pm',
    liga:      'primera división',
    season:    '2023',
    sede:      'bentleigh',
  },
  {
    id: 2,
    equipoLocal:  { nombre: 'Liverpool',    logo: '/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team3-copyright.png' },
    equipoVisita: { nombre: 'FC Barcelona', logo: '/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team4-copyright.png' },
    fecha:     '28 de septiembre de 2024',
    resultado: '1 - 0',
    liga:      'primera división',
    season:    '2023',
    sede:      'Kensington',
  },
  {
    id: 3,
    equipoLocal:  { nombre: 'Chelsea',    logo: '/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team5-copyright.png' },
    equipoVisita: { nombre: 'Manchester', logo: '/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team6-copyright.png' },
    fecha:     '18 de julio de 2024',
    resultado: '2 - 3',
    liga:      'primera división',
    season:    '2023',
    sede:      'Nueva York',
  },
  {
    id: 4,
    equipoLocal:  { nombre: 'Club de fútbol', logo: '/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/team1-copyright.png' },
    equipoVisita: { nombre: 'FC Bayern',      logo: '/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team7-copyright.png' },
    fecha:     '26 de octubre de 2024',
    resultado: '11:40 am',
    liga:      'primera división',
    season:    '2023',
    sede:      'bentleigh',
  },
];

// IDs originales del template para preservar estilos CSS
const COL_IDS    = ['2ceb2c7', '0a3d8d1', '457500e', '72ffcb2'];
const WIDGET_IDS = ['31b710a', 'f5d2451', '3dfab06', '046b2f3'];

// ─────────────────────────────────────────────────────────────
// Sub-componente: logo de equipo (solo visual — edición desde barra lateral)
// ─────────────────────────────────────────────────────────────
function TeamLogo({ equipo, side }) {
  return (
    <span
      className={`team-logo ${side === 'local' ? 'logo-odd' : 'logo-even'}`}
      title={equipo.nombre}
    >
      <img
        alt={equipo.nombre}
        className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image"
        decoding="async"
        height={312}
        loading="lazy"
        src={equipo.logo}
        width={316}
      />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
export default function PartidosSection({ partidosData, onUpdatePartido }) {
  const matches = Array.isArray(partidosData) && partidosData.length > 0
    ? partidosData
    : DEFAULT_PARTIDOS;

  return (
    <>
      {/* Sección principal: 4 columnas de partidos */}
      <section
        className="elementor-section elementor-top-section elementor-element elementor-element-2263166 elementor-section-full_width scheme_default animation_type_sequental elementor-section-height-default elementor-section-height-default sc_fly_static elementor-invisible"
        data-animation-stagger=""
        data-animation-type="sequental"
        data-element_type="section"
        data-id="2263166"
        data-settings={`{"background_background":"classic","animation":"soccerclub-fadein","animation_delay":100}`}
      >
        <div className="elementor-container elementor-column-gap-extended">
          {matches.map((partido, idx) => (
              <div
                key={partido.id ?? idx}
                className="elementor-column elementor-col-25 elementor-top-column elementor-element sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static"
                data-element_type="column"
                data-id={COL_IDS[idx] ?? `col-${idx}`}
              >
                <div className="elementor-widget-wrap elementor-element-populated">
                  <div
                    className="elementor-element sc_fly_static elementor-widget elementor-widget-shortcode"
                    data-element_type="widget"
                    data-id={WIDGET_IDS[idx] ?? `wid-${idx}`}
                    data-widget_type="shortcode.default"
                  >
                    <div className="elementor-widget-container">
                      <div className="elementor-shortcode">
                        <div className="sportspress">
                          <div className="sp-template sp-template-event-blocks">
                            <div className="sp-table-wrapper">
                              <table className="sp-event-blocks sp-data-table sp-paginated-table" data-sp-rows={5}>
                                <thead><tr><th /></tr></thead>
                                <tbody>
                                  <tr className="sp-row sp-post alternate" itemScope itemType="http://schema.org/SportsEvent">
                                    <td>
                                      {/* Logos */}
                                      <TeamLogo equipo={partido.equipoLocal}  side="local" />
                                      <TeamLogo equipo={partido.equipoVisita} side="visita" />

                                      {/* Fecha */}
                                      <time className="sp-event-date" itemProp="startDate">
                                        {partido.fecha}
                                      </time>

                                      {/* Resultado / Hora */}
                                      <h5 className="sp-event-results">
                                        <span className="sp-result ok">{partido.resultado}</span>
                                      </h5>

                                      {/* Liga y temporada */}
                                      <div className="sp-event-league">{partido.liga}</div>
                                      <div className="sp-event-season">{partido.season}</div>

                                      {/* Sede */}
                                      <div className="sp-event-venue" itemProp="location" itemScope itemType="http://schema.org/Place">
                                        <div itemProp="address" itemScope itemType="http://schema.org/PostalAddress">
                                          {partido.sede}
                                        </div>
                                      </div>

                                      {/* Título del partido */}
                                      <h4 className="sp-event-title" itemProp="name">
                                        {partido.equipoLocal.nombre} vs {partido.equipoVisita.nombre}
                                      </h4>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </section>

      {/* Espaciador original */}
      <section
        className="elementor-section elementor-top-section elementor-element elementor-element-9185306 scheme_default elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static"
        data-element_type="section"
        data-id="9185306"
        data-settings={`{"background_background":"classic"}`}
      >
        <div className="elementor-container elementor-column-gap-extended">
          <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-66707f2 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="66707f2">
            <div className="elementor-widget-wrap elementor-element-populated">
              <div className="elementor-element elementor-element-0047494 sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="0047494" data-widget_type="spacer.default">
                <div className="elementor-widget-container">
                  <div className="elementor-spacer">
                    <div className="elementor-spacer-inner" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
