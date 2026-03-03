import React from 'react';
import EditableText from './EditableText.jsx';

// ─── Datos por defecto (fallback si la BD no tiene novedades) ───────────────
export const DEFAULT_NOVEDADES = {
  subtitulo: 'Academia Jaguares',
  titulo: 'Últimas Novedades',
  items: [
    {
      id: 1,
      imagen: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=890&h=664&q=80',
      alt: 'Inscripciones Abiertas 2026',
      categoria: 'Inscripciones',
      categoria_href: '/inscripcion',
      titulo: '¡Inscripciones abiertas para el período 2026!',
      titulo_href: '/inscripcion',
      fecha: '15 de febrero de 2026',
      comentarios: '24',
      enlace: '/inscripcion',
    },
    {
      id: 2,
      imagen: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=890&h=664&q=80',
      alt: 'Campeonato Regional',
      categoria: 'Torneos',
      categoria_href: '#',
      titulo: 'Categoría Sub-12 clasifica al Campeonato Regional',
      titulo_href: '#',
      fecha: '10 de febrero de 2026',
      comentarios: '18',
      enlace: '#',
    },
    {
      id: 3,
      imagen: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=890&h=664&q=80',
      alt: 'Nuevos Entrenadores',
      categoria: 'Staff',
      categoria_href: '#',
      titulo: 'Bienvenida a nuestros nuevos entrenadores certificados',
      titulo_href: '#',
      fecha: '5 de febrero de 2026',
      comentarios: '12',
      enlace: '#',
    },
    {
      id: 4,
      imagen: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=890&h=664&q=80',
      alt: 'Clases de Funcional',
      categoria: 'Programas',
      categoria_href: '#',
      titulo: 'Nuevos horarios de Entrenamiento Funcional Mixto',
      titulo_href: '#',
      fecha: '1 de febrero de 2026',
      comentarios: '8',
      enlace: '#',
    },
  ],
};

// ─── Componente ─────────────────────────────────────────────────────────────
export default function NovedadesSection({ novedadesData, onUpdateNovedades }) {
  const data = novedadesData || DEFAULT_NOVEDADES;
  const subtitulo = data.subtitulo || DEFAULT_NOVEDADES.subtitulo;
  const titulo    = data.titulo    || DEFAULT_NOVEDADES.titulo;
  const items     = Array.isArray(data.items) && data.items.length > 0
    ? data.items
    : DEFAULT_NOVEDADES.items;

  const oddEven = (idx) => (idx % 2 === 0 ? 'sc_blogger_item_odd' : 'sc_blogger_item_even');

  return (
    <>
      <section
        className="elementor-section elementor-top-section elementor-element elementor-element-486ae5f scheme_light elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static"
        data-element_type="section"
        data-id="486ae5f"
        data-settings="{&quot;background_background&quot;:&quot;classic&quot;}"
      >
        <div className="elementor-container elementor-column-gap-extended">
          <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-c5120bb sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="c5120bb">
            <div className="elementor-widget-wrap elementor-element-populated">

              {/* Spacer */}
              <div className="elementor-element elementor-element-03c8652 sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="03c8652" data-widget_type="spacer.default">
                <div className="elementor-widget-container"><div className="elementor-spacer"><div className="elementor-spacer-inner" /></div></div>
              </div>

              {/* Título de sección */}
              <div className="elementor-element elementor-element-68bcfd2 animation_type_block sc_fly_static elementor-invisible elementor-widget elementor-widget-trx_sc_title" data-animation-type="block" data-element_type="widget" data-id="68bcfd2" data-settings="{&quot;_animation&quot;:&quot;soccerclub-fadein&quot;}" data-widget_type="trx_sc_title.default">
                <div className="elementor-widget-container">
                  <div className="sc_title sc_title_default">
                    <EditableText tag="span" className="sc_item_subtitle sc_title_subtitle sc_align_center sc_item_subtitle_above sc_item_title_style_default"
                      value={subtitulo}
                      onChange={onUpdateNovedades ? v => onUpdateNovedades({...(novedadesData||{}), subtitulo: v}) : undefined}
                      textStyle={(novedadesData||{}).subtituloStyle || {}}
                      onStyleChange={onUpdateNovedades ? s => onUpdateNovedades({...(novedadesData||{}), subtituloStyle: s}) : undefined} />
                    <h1 className="sc_item_title sc_title_title sc_align_center sc_item_title_style_default sc_item_title_tag">
                      <EditableText tag="span" className="sc_item_title_text"
                        value={titulo}
                        onChange={onUpdateNovedades ? v => onUpdateNovedades({...(novedadesData||{}), titulo: v}) : undefined}
                        textStyle={(novedadesData||{}).tituloStyle || {}}
                        onStyleChange={onUpdateNovedades ? s => onUpdateNovedades({...(novedadesData||{}), tituloStyle: s}) : undefined} />
                    </h1>
                  </div>
                </div>
              </div>

              {/* Small spacer */}
              <div className="elementor-element elementor-element-f99c89f sc_height_small sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="f99c89f" data-widget_type="spacer.default">
                <div className="elementor-widget-container"><div className="elementor-spacer"><div className="elementor-spacer-inner" /></div></div>
              </div>

              {/* Slider de novedades */}
              <div className="elementor-element elementor-element-02a0cf6 animation_type_sequental sc_style_default sc_fly_static elementor-invisible elementor-widget elementor-widget-trx_sc_blogger" data-animation-stagger data-animation-type="sequental" data-element_type="widget" data-id="02a0cf6" data-settings="{&quot;_animation&quot;:&quot;soccerclub-fadeinup&quot;,&quot;_animation_delay&quot;:100}" data-widget_type="trx_sc_blogger.default">
                <div className="elementor-widget-container">
                  <div className="sc_blogger sc_blogger_default sc_blogger_default_classic sc_item_filters_tabs_none alignnone">
                    <div className="sc_blogger_slider sc_item_slider slider_swiper_outer slider_outer slider_outer_nocontrols slider_outer_pagination slider_outer_pagination_bullets slider_outer_pagination_pos_bottom_outside slider_outer_nocentered slider_outer_overflow_hidden slider_outer_multi">
                      <div
                        className="slider_container swiper-slider-container slider_swiper slider_noresize slider_nocontrols slider_pagination slider_pagination_bullets slider_pagination_pos_bottom_outside slider_nocentered slider_overflow_hidden slider_multi"
                        data-autoplay={1}
                        data-direction="horizontal"
                        data-effect="slide"
                        data-free-mode={0}
                        data-loop={1}
                        data-mouse-wheel={0}
                        data-pagination="bullets"
                        data-slides-centered={0}
                        data-slides-min-width={220}
                        data-slides-overflow={0}
                        data-slides-per-view={3}
                        data-slides-per-view-breakpoints="{&quot;999999&quot;:3}"
                        data-slides-space={30}
                        data-slides-space-breakpoints="{&quot;999999&quot;:30}"
                      >
                        <div className="slides slider-wrapper swiper-wrapper sc_item_columns_3">
                          {items.map((novedad, idx) => (
                            <div key={novedad.id ?? idx} className="slider-slide swiper-slide">
                              <div className={`sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic ${oddEven(idx)} sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_no_excerpt sc_blogger_item_image_position_top`} data-item-number={idx + 1}>
                                <div className="sc_blogger_item_body">
                                  {/* Imagen */}
                                  <div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured">
                                    <img
                                      alt={novedad.alt || novedad.titulo}
                                      className="attachment-soccerclub-thumb-square size-soccerclub-thumb-square wp-post-image"
                                      decoding="async"
                                      height={664}
                                      loading="lazy"
                                      src={novedad.imagen}
                                      width={890}
                                    />
                                    <div className="mask" />
                                    <a aria-hidden="true" className="link" href={novedad.enlace || '#'} />
                                  </div>
                                  {/* Contenido */}
                                  <div className="sc_blogger_item_content entry-content">
                                    <div className="post_meta sc_blogger_item_meta post_meta_categories">
                                      <span className="post_meta_item post_categories cat_sep">
                                        <a href={novedad.categoria_href || '#'} rel="category tag">{novedad.categoria}</a>
                                      </span>
                                    </div>
                                    <h5 className="sc_blogger_item_title entry-title" data-item-number={idx + 1}>
                                      <a href={novedad.titulo_href || '#'} rel="bookmark">
                                        <EditableText tag="span" value={novedad.titulo}
                                          onChange={onUpdateNovedades ? v => { const newItems = items.map((it,i) => i===idx?{...it,titulo:v}:it); onUpdateNovedades({...(novedadesData||{}), items: newItems}); } : undefined}
                                          textStyle={(novedad.tituloStyle)||{}}
                                          onStyleChange={onUpdateNovedades ? s => { const newItems = items.map((it,i) => i===idx?{...it,tituloStyle:s}:it); onUpdateNovedades({...(novedadesData||{}), items: newItems}); } : undefined} />
                                      </a>
                                    </h5>
                                    <div className="post_meta sc_blogger_item_meta post_meta">
                                      <span className="post_meta_item post_date">
                                        <a href={novedad.enlace || '#'}>{novedad.fecha}</a>
                                      </span>
                                      <a className="post_meta_item post_meta_comments icon-comment-light" href={novedad.enlace || '#'}>
                                        <span className="post_meta_number">{novedad.comentarios}</span>
                                        <span className="post_meta_label">Comentarios</span>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="slider_pagination_wrap swiper-pagination" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom spacer */}
              <div className="elementor-element elementor-element-0eece5b sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="0eece5b" data-widget_type="spacer.default">
                <div className="elementor-widget-container"><div className="elementor-spacer"><div className="elementor-spacer-inner" /></div></div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Separador inferior (sección be0de5f original) */}
      <section className="elementor-section elementor-top-section elementor-element elementor-element-be0de5f elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="be0de5f">
        <div className="elementor-container elementor-column-gap-extended">
          <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-8848f29 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="8848f29">
            <div className="elementor-widget-wrap elementor-element-populated">
              <div className="elementor-element elementor-element-bf871ff sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="bf871ff" data-widget_type="spacer.default">
                <div className="elementor-widget-container"><div className="elementor-spacer"><div className="elementor-spacer-inner" /></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
