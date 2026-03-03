import React from 'react';

// ─── Datos por defecto ────────────────────────────────────────────────────────
export const DEFAULT_PATROCINADORES = [
  { id: 1, nombre: 'NIKE',         imagen: '', enlace: '#' },
  { id: 2, nombre: 'ADIDAS',       imagen: '', enlace: '#' },
  { id: 3, nombre: 'PUMA',         imagen: '', enlace: '#' },
  { id: 4, nombre: 'REEBOK',       imagen: '', enlace: '#' },
  { id: 5, nombre: 'NEW BALANCE',  imagen: '', enlace: '#' },
  { id: 6, nombre: 'UMBRO',        imagen: '', enlace: '#' },
  { id: 7, nombre: 'UNDER ARMOUR', imagen: '', enlace: '#' },
  { id: 8, nombre: 'MIZUNO',       imagen: '', enlace: '#' },
];

// Logo: muestra imagen real si existe, sino SVG con texto
function SponsorLogo({ nombre, imagen, enlace }) {
  const inner = imagen ? (
    <img
      src={imagen}
      alt={nombre}
      style={{ maxWidth: '120px', maxHeight: '50px', objectFit: 'contain', opacity: 0.6 }}
    />
  ) : (
    <svg viewBox="0 0 180 40" style={{ width: '140px', height: '50px', opacity: 0.4 }}>
      <text
        x="90" y="28"
        textAnchor="middle"
        fontFamily="Arial Black, sans-serif"
        fontSize={nombre.length > 10 ? '13' : nombre.length > 6 ? '16' : '22'}
        fontWeight="bold"
        fill="#333"
      >
        {nombre}
      </text>
    </svg>
  );

  return (
    <div className="elementor-widget-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', border: '1px solid rgba(0,0,0,0.1)' }}>
      {enlace && enlace !== '#' ? (
        <a href={enlace} target="_blank" rel="noopener noreferrer">{inner}</a>
      ) : inner}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PatrocinadoresSection({ patrocinadoresData }) {
  const lista = Array.isArray(patrocinadoresData) && patrocinadoresData.length > 0
    ? patrocinadoresData
    : DEFAULT_PATROCINADORES;

  const fila1 = lista.slice(0, 4);
  const fila2 = lista.slice(4, 8);

  const renderFila = (sponsors, secId, colIds) => (
    <section
      className="elementor-section elementor-top-section elementor-element elementor-element-content-middle animation_type_sequental elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static elementor-invisible"
      data-animation-stagger
      data-animation-type="sequental"
      data-element_type="section"
      data-id={secId}
      data-settings="{&quot;animation&quot;:&quot;soccerclub-fadeinup&quot;,&quot;animation_delay&quot;:100}"
    >
      <div className="elementor-container elementor-column-gap-extended">
        {sponsors.map((sp, idx) => (
          <div
            key={sp.id ?? idx}
            className="elementor-column elementor-col-25 elementor-top-column elementor-element sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static"
            data-element_type="column"
            data-id={colIds[idx]}
          >
            <div className="elementor-widget-wrap elementor-element-populated">
              <div className="elementor-element sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-widget_type="image.default">
                <SponsorLogo nombre={sp.nombre} imagen={sp.imagen} enlace={sp.enlace} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <>
      {/* Fila 1: primeros 4 patrocinadores */}
      {renderFila(fila1, 'e8111c1', ['5743b5e', '327311a', '7b9c35c', 'd2b5fbf'])}

      {/* Spacer entre filas */}
      <section className="elementor-section elementor-top-section elementor-element elementor-element-3b3b627 elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="3b3b627">
        <div className="elementor-container elementor-column-gap-extended">
          <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-0714f4d sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="0714f4d">
            <div className="elementor-widget-wrap elementor-element-populated">
              <div className="elementor-element elementor-element-82a622d sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="82a622d" data-widget_type="spacer.default">
                <div className="elementor-widget-container"><div className="elementor-spacer"><div className="elementor-spacer-inner" /></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fila 2: siguientes 4 patrocinadores */}
      {renderFila(fila2, '0e337c2', ['2c99786', 'd17636d', 'b3e23e6', 'f0937cc'])}

      {/* Spacer final */}
      <section className="elementor-section elementor-top-section elementor-element elementor-element-4f32361 elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="4f32361">
        <div className="elementor-container elementor-column-gap-extended">
          <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-9b7f4f7 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="9b7f4f7">
            <div className="elementor-widget-wrap elementor-element-populated">
              <div className="elementor-element elementor-element-4379225 sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="4379225" data-widget_type="spacer.default">
                <div className="elementor-widget-container"><div className="elementor-spacer"><div className="elementor-spacer-inner" /></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
