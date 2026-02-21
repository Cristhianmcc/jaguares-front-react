import React, { useEffect } from 'react';
import { HOME_INLINE_STYLES } from './homeInlineStyles.js';
import HeroCarousel from '../components/HeroCarousel.jsx';

export default function Home() {
  // Inject SoccerClub CSS & classes only while Home is mounted
  useEffect(() => {
    const SC_ATTR = 'data-sc-home';
    const cssLinks = [
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/css/font-icons/css/trx_addons_icons.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_demo/css/font-icons/css/trx_demo_icons.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_demo/css/font-icons/css/animation.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/addons/qw-extension/css/font-icons/css/qw_extension_icons.css' },
      { href: '/assets/fonts.googleapis.com/css2__q_family_DM_Sans_ital_wght_0_100_0_200_0_300_0_400_0_500_0_600_0_700_0_800_0_900_1_100_1_200.html' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/themes/soccerclub/skins/default/css/font-icons/css/fontello.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/instagram-feed/css/sbi-styles.min__q_ver_6.9.1.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/advanced-popups/public/css/advanced-popups-public__q_ver_1.2.2.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-includes/css/dashicons.min__q_ver_6.9.1.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/sportspress/assets/css/sportspress__q_ver_2.7.24.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/sportspress/assets/css/icons__q_ver_2.7.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/js/magnific/magnific-popup.min.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_demo/css/trx_demo_panels.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/woocommerce/assets/css/woocommerce-layout__q_ver_9.9.6.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/woocommerce/assets/css/woocommerce-smallscreen__q_ver_9.9.6.css', media: 'only screen and (max-width: 768px)' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/woocommerce/assets/css/woocommerce__q_ver_9.9.6.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/the-events-calendar/build/css/tribe-events-single-skeleton__q_ver_6.13.2.1.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/the-events-calendar/build/css/tribe-events-single-full__q_ver_6.13.2.1.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/woo-smart-quick-view/assets/libs/slick/slick__q_ver_6.9.1.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/woo-smart-quick-view/assets/libs/perfect-scrollbar/css/perfect-scrollbar.min__q_ver_6.9.1.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/woo-smart-quick-view/assets/libs/perfect-scrollbar/css/custom-theme__q_ver_6.9.1.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/woo-smart-quick-view/assets/libs/feather/feather__q_ver_6.9.1.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/woo-smart-quick-view/assets/css/frontend__q_ver_4.2.0.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/woocommerce/assets/css/brands__q_ver_9.9.6.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/ti-woocommerce-wishlist/assets/css/webfont.min__q_ver_2.10.0.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/ti-woocommerce-wishlist/assets/css/public.min__q_ver_2.10.0.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/elementor/assets/lib/eicons/css/elementor-icons.min__q_ver_5.43.0.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/uploads/elementor/css/custom-frontend.min__q_ver_1751453524.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/elementor/assets/css/widget-spacer.min__q_ver_3.30.0.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/elementor/assets/lib/animations/styles/fadeIn.min__q_ver_3.30.0.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/elementor/assets/css/widget-image.min__q_ver_3.30.0.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/elementor/assets/css/widget-heading.min__q_ver_3.30.0.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/woocommerce/assets/client/blocks/wc-blocks__q_ver_wc-9.9.6.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/widgets/video/video.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/revslider/sr6/assets/css/rs6__q_ver_6.7.34.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/api/woocommerce/woocommerce.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/api/woocommerce/woocommerce.responsive.css', media: '(max-width:1279px)' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/themes/soccerclub/skins/default/plugins/woocommerce/woocommerce.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/themes/soccerclub/skins/default/plugins/woocommerce/woocommerce-responsive.css', media: '(max-width:1679px)' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/shortcodes/content/content.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/shortcodes/content/content.responsive.css', media: '(max-width:1439px)' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/shortcodes/icons/icons.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/addons/qw-extension/css/qw_extension_icons.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/addons/qw-extension/css/qw_extension_icons.responsive.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/shortcodes/icons/icons.responsive.css', media: '(max-width:1279px)' },
      { href: '//fonts.googleapis.com/css?family=Roboto:400%7CInter+Tight:600%2C700%7CDM+Sans:400&display=swap' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-includes/js/mediaelement/mediaelementplayer-legacy.min__q_ver_4.2.17.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-includes/js/mediaelement/wp-mediaelement.min__q_ver_6.9.1.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/themes/soccerclub/style.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/themes/soccerclub/skins/default/css/style.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/themes/soccerclub/skins/default/css/__plugins.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/themes/soccerclub/skins/default/plugins/mailchimp-for-wp/mailchimp-for-wp.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/themes/soccerclub/skins/default/css/__custom.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/css/__responsive.css', media: '(max-width:1439px)' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/addons/mouse-helper/mouse-helper.responsive.css', media: '(max-width:1279px)' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/cpt/team/team.responsive.css', media: '(max-width:1439px)' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/shortcodes/blogger/blogger.responsive.css', media: '(max-width:1279px)' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/shortcodes/skills/skills.responsive.css', media: '(max-width:1023px)' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/themes/soccerclub/skins/default/css/__responsive.css', media: '(max-width:1679px)' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/uploads/elementor/google-fonts/css/roboto__q_ver_1751453430.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/uploads/elementor/google-fonts/css/robotoslab__q_ver_1751453432.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/css/__styles.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/css/trx_addons.animations.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/addons/mouse-helper/mouse-helper.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/cpt/team/team.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/shortcodes/blogger/blogger.css' },
      { href: '/assets/soccerclub.axiomthemes.com/wp-content/plugins/trx_addons/components/shortcodes/skills/skills.css' },
    ];
    const injected = [];
    cssLinks.forEach(({ href, media }) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = media || 'all';
      link.setAttribute(SC_ATTR, 'true');
      document.head.appendChild(link);
      injected.push(link);
    });
    // Inject SoccerClub inline <style> blocks
    HOME_INLINE_STYLES.forEach(({ id, css }) => {
      const style = document.createElement('style');
      if (id) style.id = id;
      style.setAttribute(SC_ATTR, 'true');
      style.textContent = css;
      document.head.appendChild(style);
      injected.push(style);
    });
    // Set SoccerClub html/body classes
    document.documentElement.classList.add('no-js', 'scheme_default');
    const bodyClasses = 'home wp-singular page-template-default page page-id-5002 wp-custom-logo wp-embed-responsive wp-theme-soccerclub theme-soccerclub hide_fixed_rows_enabled frontpage woocommerce-no-js tribe-no-js tinvwl-theme-style skin_default woo_extensions_present scheme_default blog_mode_front body_style_fullscreen is_stream blog_style_excerpt sidebar_hide expand_content remove_margins trx_addons_present header_type_custom header_style_header-custom-28016 header_position_over menu_side_none no_layout fixed_blocks_sticky elementor-default elementor-kit-15 elementor-page elementor-page-5002'.split(' ');
    document.body.classList.add(...bodyClasses);
    return () => {
      injected.forEach(el => el.remove());
      document.documentElement.classList.remove('no-js', 'scheme_default');
      document.body.classList.remove(...bodyClasses);
    };
  }, []);

  useEffect(() => {
    const lazyImages = document.querySelectorAll('img[data-lazyload]')
    lazyImages.forEach((img) => {
      const lazy = img.getAttribute('data-lazyload')
      const src = img.getAttribute('src') || ''
      if (lazy && (!src || src.includes('dummy.png'))) {
        img.setAttribute('src', lazy)
      }
    })

    const lazyBg = document.querySelectorAll('[data-bg]')
    lazyBg.forEach((el) => {
      const bg = el.getAttribute('data-bg')
      if (bg) {
        el.style.backgroundImage = `url(${bg})`
      }
    })

    // Fallback for counters if odometer script didn't run
    const counters = document.querySelectorAll('.sc_skills_total')
    counters.forEach((counter) => {
      const stop = counter.getAttribute('data-stop')
      if (!stop) return
      const unit = counter.getAttribute('data-ed') || ''
      const digits = String(stop).replace(/\D/g, '')
      const digitEls = counter.querySelectorAll('.sc_skills_digit_value')
      if (digitEls.length > 0) {
        const padded = digits.padStart(digitEls.length, '0')
        digitEls.forEach((el, idx) => {
          el.textContent = padded[idx] || '0'
        })
      } else {
        counter.textContent = `${digits}${unit}`
      }
      const unitEl = counter.querySelector('.sc_skills_unit')
      if (unitEl) unitEl.textContent = unit
    })

    // If legacy sliders fail, render cards directly from index markup
    const ensureFallbackStyles = () => {
      if (document.getElementById('react-fallback-styles')) return
      const style = document.createElement('style')
      style.id = 'react-fallback-styles'
      style.textContent = `
        .react-fallback-grid{display:grid;gap:30px}
        .react-fallback-grid.react-team{grid-template-columns:repeat(5,minmax(0,1fr))}
        .react-fallback-grid.react-blog{grid-template-columns:repeat(3,minmax(0,1fr))}
        @media (max-width:1024px){
          .react-fallback-grid.react-team{grid-template-columns:repeat(2,minmax(0,1fr))}
          .react-fallback-grid.react-blog{grid-template-columns:1fr}
        }
      `
      document.head.appendChild(style)
    }

    const buildSliderFallback = (sliderSelector, itemSelector, fallbackClass, maxItems) => {
      const slider = document.querySelector(sliderSelector)
      if (!slider) return

      const slides = Array.from(slider.querySelectorAll(itemSelector)).slice(0, maxItems)
      if (!slides.length) return

      // Only skip if Swiper has actually initialized (adds swiper-initialized class)
      const swiperContainer = slider.querySelector('.slider_container')
      if (swiperContainer && swiperContainer.classList.contains('swiper-initialized')) return

      ensureFallbackStyles()
      let fallback = slider.parentElement.querySelector(`.${fallbackClass}`)
      if (!fallback) {
        fallback = document.createElement('div')
        fallback.className = `react-fallback-grid ${fallbackClass}`
        slider.parentElement.appendChild(fallback)
      }

      fallback.innerHTML = ''
      slides.forEach((item) => {
        const card = document.createElement('div')
        card.appendChild(item.cloneNode(true))
        fallback.appendChild(card)
      })
      slider.style.display = 'none'
    }

    buildSliderFallback('.sc_team_slider', '.swiper-slide .sc_team_item', 'react-team', 5)
    buildSliderFallback('.sc_blogger_slider', '.swiper-slide .sc_blogger_item', 'react-blog', 3)
  }, [])

  return (
    <>
        <div className="body_wrap">
          <div className="page_wrap">
            <a className="soccerclub_skip_link skip_to_content_link" href="#content_skip_link_anchor" tabIndex={0}>Saltar al contenido</a>
            <a className="soccerclub_skip_link skip_to_footer_link" href="#footer_skip_link_anchor" tabIndex={0}>Saltar al pie de página</a>
            <header className="top_panel top_panel_custom top_panel_custom_28016 top_panel_custom_header-professional-club without_bg_image scheme_dark">
              <div className="elementor elementor-28016" data-elementor-id={28016} data-elementor-type="cpt_layouts">
                <section className="elementor-section elementor-top-section elementor-element elementor-element-78e7be0 elementor-section-full_width elementor-section-content-middle sc_layouts_row sc_layouts_row_type_compact sc_layouts_hide_on_tablet sc_layouts_hide_on_mobile elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="78e7be0">
                  <div className="elementor-container elementor-column-gap-extended">
                    <div className="elementor-column elementor-col-66 elementor-top-column elementor-element elementor-element-8d82240 sc_layouts_column_align_left sc_layouts_column sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="8d82240">
                      <div className="elementor-widget-wrap elementor-element-populated">
                        <div className="sc_layouts_item elementor-element elementor-element-1120d10 sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_logo" data-element_type="widget" data-id="1120d10" data-widget_type="trx_sc_layouts_logo.default">
                          <div className="elementor-widget-container">
                            <a className="sc_layouts_logo sc_layouts_logo_default trx_addons_inline_402654925" href="#"><img alt="Club de fútbol" className="logo_image" height={83} loading="lazy" src="/assets/logo.ico" width={64} style={{objectFit:"contain"}} /></a> </div>
                        </div>
                        <div className="sc_layouts_item elementor-element elementor-element-7c3df2e sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_menu" data-element_type="widget" data-id="7c3df2e" data-widget_type="trx_sc_layouts_menu.default">
                          <div className="elementor-widget-container">
                            <nav className="sc_layouts_menu sc_layouts_menu_default sc_layouts_menu_dir_horizontal menu_hover_zoom_line" data-animation-in="none" data-animation-out="none"><ul className="sc_layouts_menu_nav" id="sc_layouts_menu_1740587893"><li className="menu-item current-menu-item"><a href="/"><span>Inicio</span></a></li><li className="menu-item"><a href="/inscripcion"><span>Inscripción</span></a></li><li className="menu-item"><a href="/consulta"><span>Consultar Estado</span></a></li><li className="menu-item menu-item-has-children"><a href="#"><span>Intranet</span></a><ul className="sub-menu"><li className="menu-item"><a href="/admin-login"><span>Administración</span></a></li><li className="menu-item"><a href="/profesor-dashboard"><span>Docentes</span></a></li></ul></li></ul></nav> </div>
                        </div>
                      </div>
                    </div>
                    <div className="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-ee3d24e sc_layouts_column_align_right sc_layouts_column sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="ee3d24e">
                      <div className="elementor-widget-wrap elementor-element-populated">
                        <div className="sc_layouts_item elementor-element elementor-element-826c298 sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_cart" data-element_type="widget" data-id="826c298" data-widget_type="trx_sc_layouts_cart.default">
                          <div className="elementor-widget-container">
                            <div className="sc_layouts_cart sc_layouts_cart_market_woocommerce">
                              <span className="sc_layouts_item_icon sc_layouts_cart_icon sc_icon_type_icons trx_addons_icon-basket" />
                              <span className="sc_layouts_item_details sc_layouts_cart_details">
                                <span className="sc_layouts_item_details_line2 sc_layouts_cart_totals">
                                  <span className="sc_layouts_cart_items" data-item="item" data-items="items">0 artículos</span>
                                  <span className="sc_layouts_cart_summa_delimiter">-</span>
                                  <span className="sc_layouts_cart_summa">$0.00</span>
                                </span>
                              </span>
                              <span className="sc_layouts_cart_items_short">0</span>
                              <div className="sc_layouts_cart_widget widget_area">
                                <span className="sc_layouts_cart_widget_close trx_addons_button_close">
                                  <span className="sc_layouts_cart_widget_close_icon trx_addons_button_close_icon" />
                                </span>
                                <div className="widget woocommerce widget_shopping_cart"><div className="widget_shopping_cart_content" /></div> </div>
                            </div> </div>
                        </div>
                        <div className="sc_layouts_item elementor-element elementor-element-9d5771d sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_search" data-element_type="widget" data-id="9d5771d" data-widget_type="trx_sc_layouts_search.default">
                          <div className="elementor-widget-container">
                            <div className="sc_layouts_search">
                              <div className="search_modern">
                                <span className="search_submit" />
                                <div className="search_wrap">
                                  <div className="search_header_wrap"><img alt="Club de fútbol" className="logo_image" height={83} loading="lazy" src="/assets/logo.ico" width={64} style={{objectFit:"contain"}} /> <a className="search_close" />
                                  </div>
                                  <div className="search_form_wrap">
                                    <form action="https://soccerclub.axiomthemes.com/" className="search_form" method="get" role="search">
                                      <input name="post_types" type="hidden" defaultValue />
                                      <input className="search_field" name="s" placeholder="Escribe palabras y presiona enter." type="text" defaultValue />
                                      <button className="search_submit" type="submit" />
                                    </form>
                                  </div>
                                </div>
                                <div className="search_overlay" />
                              </div>
                            </div> </div>
                        </div>
                        <div className="sc_layouts_item elementor-element elementor-element-d7fdc4b elementor-view-default sc_fly_static elementor-widget elementor-widget-icon" data-element_type="widget" data-id="d7fdc4b" data-widget_type="icon.default">
                          <div className="elementor-widget-container">
                            <div className="elementor-icon-wrapper">
                              <a className="elementor-icon" href="#popup-1">
                                <svg height={21} viewBox="0 0 21 21" width={21} xmlns="http://www.w3.org/2000/svg"><g className="right_bar" transform="translate(-2124 -2665)"><g fill="none" strokeWidth="1.5" transform="translate(2124 2665)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2132 2665)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2140 2665)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2124 2673)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2132 2673)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2140 2673)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2124 2681)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2132 2681)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2140 2681)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g></g></svg> </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="elementor-section elementor-top-section elementor-element elementor-element-5d1720a elementor-section-full_width elementor-section-content-middle sc_layouts_row sc_layouts_row_type_compact sc_layouts_hide_on_tablet sc_layouts_hide_on_mobile sc_layouts_row_fixed sc_layouts_row_fixed_always sc_layouts_row_delay_fixed sc_layouts_row_hide_unfixed scheme_light elementor-section-height-default elementor-section-height-default sc_fly_static sc_layouts_row_fixed_ater_scroll" data-element_type="section" data-fixed-row-delay="0.75" data-id="5d1720a" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                  <div className="elementor-container elementor-column-gap-extended">
                    <div className="elementor-column elementor-col-66 elementor-top-column elementor-element elementor-element-aabc833 sc_layouts_column_align_left sc_layouts_column sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="aabc833">
                      <div className="elementor-widget-wrap elementor-element-populated">
                        <div className="sc_layouts_item elementor-element elementor-element-1dfad3c sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_logo" data-element_type="widget" data-id="1dfad3c" data-widget_type="trx_sc_layouts_logo.default">
                          <div className="elementor-widget-container">
                            <a className="sc_layouts_logo sc_layouts_logo_default trx_addons_inline_1486469297" href="#"><img alt="Club de fútbol" className="logo_image" height={83} loading="lazy" src="/assets/logo.ico" width={64} style={{objectFit:"contain"}} /></a> </div>
                        </div>
                        <div className="sc_layouts_item elementor-element elementor-element-1124ce9 sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_menu" data-element_type="widget" data-id="1124ce9" data-widget_type="trx_sc_layouts_menu.default">
                          <div className="elementor-widget-container">
                            <nav className="sc_layouts_menu sc_layouts_menu_default sc_layouts_menu_dir_horizontal menu_hover_zoom_line" data-animation-in="none" data-animation-out="none"><ul className="sc_layouts_menu_nav menu_main_nav" id="menu_main"><li className="menu-item current-menu-item"><a href="/"><span>Inicio</span></a></li><li className="menu-item"><a href="/inscripcion"><span>Inscripción</span></a></li><li className="menu-item"><a href="/consulta"><span>Consultar Estado</span></a></li><li className="menu-item menu-item-has-children"><a href="#"><span>Intranet</span></a><ul className="sub-menu"><li className="menu-item"><a href="/admin-login"><span>Administración</span></a></li><li className="menu-item"><a href="/profesor-dashboard"><span>Docentes</span></a></li></ul></li></ul></nav> </div>
                        </div>
                      </div>
                    </div>
                    <div className="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-4b171d2 sc_layouts_column_align_right sc_layouts_column sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="4b171d2">
                      <div className="elementor-widget-wrap elementor-element-populated">
                        <div className="sc_layouts_item elementor-element elementor-element-a96af53 sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_cart" data-element_type="widget" data-id="a96af53" data-widget_type="trx_sc_layouts_cart.default">
                          <div className="elementor-widget-container">
                            <div className="sc_layouts_cart sc_layouts_cart_market_woocommerce">
                              <span className="sc_layouts_item_icon sc_layouts_cart_icon sc_icon_type_icons trx_addons_icon-basket" />
                              <span className="sc_layouts_item_details sc_layouts_cart_details">
                                <span className="sc_layouts_item_details_line2 sc_layouts_cart_totals">
                                  <span className="sc_layouts_cart_items" data-item="item" data-items="items">0 artículos</span>
                                  <span className="sc_layouts_cart_summa_delimiter">-</span>
                                  <span className="sc_layouts_cart_summa">$0.00</span>
                                </span>
                              </span>
                              <span className="sc_layouts_cart_items_short">0</span>
                              <div className="sc_layouts_cart_widget widget_area">
                                <span className="sc_layouts_cart_widget_close trx_addons_button_close">
                                  <span className="sc_layouts_cart_widget_close_icon trx_addons_button_close_icon" />
                                </span>
                                <div className="widget woocommerce widget_shopping_cart"><div className="widget_shopping_cart_content" /></div> </div>
                            </div> </div>
                        </div>
                        <div className="sc_layouts_item elementor-element elementor-element-b9d44de sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_search" data-element_type="widget" data-id="b9d44de" data-widget_type="trx_sc_layouts_search.default">
                          <div className="elementor-widget-container">
                            <div className="sc_layouts_search">
                              <div className="search_modern">
                                <span className="search_submit" />
                                <div className="search_wrap">
                                  <div className="search_header_wrap"><img alt="Club de fútbol" className="logo_image" height={83} loading="lazy" src="/assets/logo.ico" width={64} style={{objectFit:"contain"}} /> <a className="search_close" />
                                  </div>
                                  <div className="search_form_wrap">
                                    <form action="https://soccerclub.axiomthemes.com/" className="search_form" method="get" role="search">
                                      <input name="post_types" type="hidden" defaultValue />
                                      <input className="search_field" name="s" placeholder="Escribe palabras y presiona enter." type="text" defaultValue />
                                      <button className="search_submit" type="submit" />
                                    </form>
                                  </div>
                                </div>
                                <div className="search_overlay" />
                              </div>
                            </div> </div>
                        </div>
                        <div className="sc_layouts_item elementor-element elementor-element-7f57735 elementor-view-default sc_fly_static elementor-widget elementor-widget-icon" data-element_type="widget" data-id="7f57735" data-widget_type="icon.default">
                          <div className="elementor-widget-container">
                            <div className="elementor-icon-wrapper">
                              <a className="elementor-icon" href="#popup-1">
                                <svg height={21} viewBox="0 0 21 21" width={21} xmlns="http://www.w3.org/2000/svg"><g className="right_bar" transform="translate(-2124 -2665)"><g fill="none" strokeWidth="1.5" transform="translate(2124 2665)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2132 2665)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2140 2665)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2124 2673)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2132 2673)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2140 2673)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2124 2681)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2132 2681)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g><g fill="none" strokeWidth="1.5" transform="translate(2140 2681)"><circle cx="2.5" cy="2.5" r="2.5" stroke="none" /><circle cx="2.5" cy="2.5" fill="none" r="1.75" /></g></g></svg> </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="elementor-section elementor-top-section elementor-element elementor-element-c79d134 elementor-section-content-middle sc_layouts_row sc_layouts_row_type_compact sc_layouts_hide_on_wide sc_layouts_hide_on_desktop sc_layouts_hide_on_notebook elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="c79d134">
                  <div className="elementor-container elementor-column-gap-extended">
                    <div className="elementor-column elementor-col-50 elementor-top-column elementor-element elementor-element-b40d63d sc_layouts_column_align_left sc_layouts_column sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="b40d63d">
                      <div className="elementor-widget-wrap elementor-element-populated">
                        <div className="sc_layouts_item elementor-element elementor-element-8ec53d7 sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_logo" data-element_type="widget" data-id="8ec53d7" data-widget_type="trx_sc_layouts_logo.default">
                          <div className="elementor-widget-container">
                            <a className="sc_layouts_logo sc_layouts_logo_default trx_addons_inline_1733126094" href="#"><img alt="Club de fútbol" className="logo_image" height={83} loading="lazy" src="/assets/logo.ico" width={64} style={{objectFit:"contain"}} /></a> </div>
                        </div>
                      </div>
                    </div>
                    <div className="elementor-column elementor-col-50 elementor-top-column elementor-element elementor-element-09b5220 sc_layouts_column_align_right sc_layouts_column sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="09b5220">
                      <div className="elementor-widget-wrap elementor-element-populated">
                        <div className="sc_layouts_item elementor-element elementor-element-b6aebf9 sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_cart" data-element_type="widget" data-id="b6aebf9" data-widget_type="trx_sc_layouts_cart.default">
                          <div className="elementor-widget-container">
                            <div className="sc_layouts_cart sc_layouts_cart_market_woocommerce">
                              <span className="sc_layouts_item_icon sc_layouts_cart_icon sc_icon_type_icons trx_addons_icon-basket" />
                              <span className="sc_layouts_item_details sc_layouts_cart_details">
                                <span className="sc_layouts_item_details_line2 sc_layouts_cart_totals">
                                  <span className="sc_layouts_cart_items" data-item="item" data-items="items">0 artículos</span>
                                  <span className="sc_layouts_cart_summa_delimiter">-</span>
                                  <span className="sc_layouts_cart_summa">$0.00</span>
                                </span>
                              </span>
                              <span className="sc_layouts_cart_items_short">0</span>
                              <div className="sc_layouts_cart_widget widget_area">
                                <span className="sc_layouts_cart_widget_close trx_addons_button_close">
                                  <span className="sc_layouts_cart_widget_close_icon trx_addons_button_close_icon" />
                                </span>
                                <div className="widget woocommerce widget_shopping_cart"><div className="widget_shopping_cart_content" /></div> </div>
                            </div> </div>
                        </div>
                        <div className="sc_layouts_item elementor-element elementor-element-17475f0 sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_search" data-element_type="widget" data-id="17475f0" data-widget_type="trx_sc_layouts_search.default">
                          <div className="elementor-widget-container">
                            <div className="sc_layouts_search">
                              <div className="search_modern">
                                <span className="search_submit" />
                                <div className="search_wrap">
                                  <div className="search_header_wrap"><img alt="Club de fútbol" className="logo_image" height={83} loading="lazy" src="/assets/logo.ico" width={64} style={{objectFit:"contain"}} /> <a className="search_close" />
                                  </div>
                                  <div className="search_form_wrap">
                                    <form action="https://soccerclub.axiomthemes.com/" className="search_form" method="get" role="search">
                                      <input name="post_types" type="hidden" defaultValue />
                                      <input className="search_field" name="s" placeholder="Escribe palabras y presiona enter." type="text" defaultValue />
                                      <button className="search_submit" type="submit" />
                                    </form>
                                  </div>
                                </div>
                                <div className="search_overlay" />
                              </div>
                            </div> </div>
                        </div>
                        <div className="sc_layouts_item elementor-element elementor-element-55617e4 sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_menu" data-element_type="widget" data-id="55617e4" data-widget_type="trx_sc_layouts_menu.default">
                          <div className="elementor-widget-container">
                            <div className="sc_layouts_iconed_text sc_layouts_menu_mobile_button_burger sc_layouts_menu_mobile_button without_menu">
                              <a className="sc_layouts_item_link sc_layouts_iconed_text_link" href="#" role="button">
                                <span className="sc_layouts_item_icon sc_layouts_iconed_text_icon trx_addons_icon-menu" />
                              </a>
                            </div> </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </header>
            <div className="menu_mobile_overlay scheme_dark" />
            <div className="menu_mobile menu_mobile_fullscreen scheme_dark">
              <div className="menu_mobile_inner">
                <div className="menu_mobile_header_wrap">
                  <a className="sc_layouts_logo" href="/"><img alt="Jaguares" height={64} loading="lazy" src="/assets/logo.ico" width={64} style={{objectFit:"contain"}} /> </a>
                  <span className="menu_mobile_close menu_button_close" tabIndex={0}><span className="menu_button_close_text">Cerca</span><span className="menu_button_close_icon" /></span>
                </div>
                <div className="menu_mobile_content_wrap content_wrap">
                  <div className="menu_mobile_content_wrap_inner"><nav className="menu_mobile_nav_area"><ul className="menu_mobile_nav" id="mobile-menu_mobile"><li className="menu-item current-menu-item"><a href="/"><span>Inicio</span></a></li><li className="menu-item"><a href="/inscripcion"><span>Inscripci\u00f3n</span></a></li><li className="menu-item"><a href="/consulta"><span>Consultar Estado</span></a></li><li className="menu-item menu-item-has-children"><a href="#"><span>Administraci\u00f3n</span></a><ul className="sub-menu"><li className="menu-item"><a href="/admin-login"><span>Acceso Admin</span></a></li><li className="menu-item"><a href="/admin-panel"><span>Panel Admin</span></a></li><li className="menu-item"><a href="/admin-usuarios"><span>Usuarios</span></a></li><li className="menu-item"><a href="/admin-docentes"><span>Docentes</span></a></li><li className="menu-item"><a href="/admin-reubicaciones"><span>Reubicaciones</span></a></li><li className="menu-item"><a href="/admin-dashboard"><span>Dashboard</span></a></li></ul></li><li className="menu-item menu-item-has-children"><a href="#"><span>Docentes</span></a><ul className="sub-menu"><li className="menu-item"><a href="/profesor-dashboard"><span>Portal Docente</span></a></li><li className="menu-item"><a href="/profesor-asistencias"><span>Asistencias</span></a></li><li className="menu-item"><a href="/profesor-ranking"><span>Ranking</span></a></li><li className="menu-item"><a href="/profesor-reportes"><span>Reportes</span></a></li></ul></li></ul></nav><div className="socials_mobile"><a className="social_item social_item_style_icons sc_icon_type_icons social_item_type_icons" href="https://www.facebook.com/Jaguarezdegalvez" rel="nofollow" target="_blank"><span className="social_icon social_icon_facebook-1" style={{}}><span className="screen-reader-text">facebook-1</span><span className="icon-facebook-1" /></span></a><a className="social_item social_item_style_icons sc_icon_type_icons social_item_type_icons" href="https://wa.me/51973324460" rel="nofollow" target="_blank"><span className="social_icon social_icon_whatsapp" style={{}}><span className="screen-reader-text">WhatsApp</span><span className="icon-whatsapp" /></span></a></div> </div>
                </div>
              </div>
            </div>
            <div className="page_content_wrap">
              <div className="content_wrap_fullscreen">
                <div className="content">
                  <span className="soccerclub_skip_link_anchor" id="content_skip_link_anchor" />
                  <article className="post_item_single post_type_page post-5002 page type-page status-publish hentry" id="post-5002">
                    <div className="post_content entry-content">
                      <div className="elementor elementor-5002" data-elementor-id={5002} data-elementor-type="wp-page">
                        {/* Hero Carousel Section */}
                        <HeroCarousel />
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-eff7a27 scheme_default elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="eff7a27" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-ac53fea sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="ac53fea">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-50b2dda sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="50b2dda" data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-2263166 elementor-section-full_width scheme_default animation_type_sequental elementor-section-height-default elementor-section-height-default sc_fly_static elementor-invisible" data-animation-stagger data-animation-type="sequental" data-element_type="section" data-id={2263166} data-settings="{&quot;background_background&quot;:&quot;classic&quot;,&quot;animation&quot;:&quot;soccerclub-fadein&quot;,&quot;animation_delay&quot;:100}">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-2ceb2c7 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="2ceb2c7">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-31b710a sc_fly_static elementor-widget elementor-widget-shortcode" data-element_type="widget" data-id="31b710a" data-widget_type="shortcode.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-shortcode"><div className="sportspress"><div className="sp-template sp-template-event-blocks">
                                          <div className="sp-table-wrapper">
                                            <table className="sp-event-blocks sp-data-table sp-paginated-table" data-sp-rows={5}><thead><tr><th /></tr></thead><tbody><tr className="sp-row sp-post alternate" itemScope itemType="http://schema.org/SportsEvent"><td><span className="team-logo logo-odd" title="Club de fútbol"><a href="/assets/soccerclub.axiomthemes.com/sport-team/soccerclub/index.html"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/team1-copyright.png" width={316} /></a></span><span className="team-logo logo-even" title="real madrid"><a href="/assets/soccerclub.axiomthemes.com/sport-team/real-madrid/index.html"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team2-copyright.png" width={316} /></a></span><time className="sp-event-date" content="2024-08-25T20:00:00+00:00" dateTime="2024-08-25 20:00:00" itemProp="startDate"><a href="/assets/soccerclub.axiomthemes.com/sport-event/soccerclub-vs-real-madrid/index.html">25 de agosto de 2024</a></time><h5 className="sp-event-results"><a href="/assets/soccerclub.axiomthemes.com/sport-event/soccerclub-vs-real-madrid/index.html"><span className="sp-result ok">8:00 pm</span></a></h5><div className="sp-event-league">primera división</div><div className="sp-event-season">2023</div><div className="sp-event-venue" itemProp="location" itemScope itemType="http://schema.org/Place"><div itemProp="address" itemScope itemType="http://schema.org/PostalAddress">bentleigh</div></div><div className="sp-event-venue" itemProp="location" itemScope itemType="http://schema.org/Place" style={{display: 'none'}}><div itemProp="address" itemScope itemType="http://schema.org/PostalAddress">N / A</div></div><h4 className="sp-event-title" itemProp="name"><a href="/assets/soccerclub.axiomthemes.com/sport-event/soccerclub-vs-real-madrid/index.html">FútbolClub vs Real Madrid</a></h4></td></tr></tbody></table>
                                          </div>
                                        </div>
                                      </div></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-0a3d8d1 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="0a3d8d1">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-f5d2451 sc_fly_static elementor-widget elementor-widget-shortcode" data-element_type="widget" data-id="f5d2451" data-widget_type="shortcode.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-shortcode"><div className="sportspress"><div className="sp-template sp-template-event-blocks">
                                          <div className="sp-table-wrapper">
                                            <table className="sp-event-blocks sp-data-table sp-paginated-table" data-sp-rows={5}><thead><tr><th /></tr></thead><tbody><tr className="sp-row sp-post alternate" itemScope itemType="http://schema.org/SportsEvent"><td><span className="team-logo logo-odd" title="Liverpool"><a href="/assets/soccerclub.axiomthemes.com/sport-team/liverpool/index.html"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team3-copyright.png" width={316} /></a></span><span className="team-logo logo-even" title="FC Barcelona"><a href="/assets/soccerclub.axiomthemes.com/sport-team/fc-barcelona/index.html"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team4-copyright.png" width={316} /></a></span><time className="sp-event-date" content="2024-09-28T11:33:47+00:00" dateTime="2024-09-28 11:33:47" itemProp="startDate"><a href="/assets/soccerclub.axiomthemes.com/sport-event/liverpool-vs-fc-barcelona/index.html">28 de septiembre de 2024</a></time><h5 className="sp-event-results"><a href="/assets/soccerclub.axiomthemes.com/sport-event/liverpool-vs-fc-barcelona/index.html"><span className="sp-result ok">1</span> - <span className="sp-result">0</span></a></h5><div className="sp-event-league">primera división</div><div className="sp-event-season">2023</div><div className="sp-event-venue" itemProp="location" itemScope itemType="http://schema.org/Place"><div itemProp="address" itemScope itemType="http://schema.org/PostalAddress">Kensington</div></div><div className="sp-event-venue" itemProp="location" itemScope itemType="http://schema.org/Place" style={{display: 'none'}}><div itemProp="address" itemScope itemType="http://schema.org/PostalAddress">N / A</div></div><h4 className="sp-event-title" itemProp="name"><a href="/assets/soccerclub.axiomthemes.com/sport-event/liverpool-vs-fc-barcelona/index.html">Liverpool-FC Barcelona</a></h4></td></tr></tbody></table>
                                          </div>
                                        </div>
                                      </div></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-457500e sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="457500e">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-3dfab06 sc_fly_static elementor-widget elementor-widget-shortcode" data-element_type="widget" data-id="3dfab06" data-widget_type="shortcode.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-shortcode"><div className="sportspress"><div className="sp-template sp-template-event-blocks">
                                          <div className="sp-table-wrapper">
                                            <table className="sp-event-blocks sp-data-table sp-paginated-table" data-sp-rows={5}><thead><tr><th /></tr></thead><tbody><tr className="sp-row sp-post alternate" itemScope itemType="http://schema.org/SportsEvent"><td><span className="team-logo logo-odd" title="Chelsea"><a href="/assets/soccerclub.axiomthemes.com/sport-team/chelsea/index.html"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team5-copyright.png" width={316} /></a></span><span className="team-logo logo-even" title="Manchester"><a href="/assets/soccerclub.axiomthemes.com/sport-team/manchester/index.html"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team6-copyright.png" width={316} /></a></span><time className="sp-event-date" content="2024-07-18T06:08:20+00:00" dateTime="2024-07-18 06:08:20" itemProp="startDate"><a href="/assets/soccerclub.axiomthemes.com/sport-event/chelsea-vs-manchester/index.html">18 de julio de 2024</a></time><h5 className="sp-event-results"><a href="/assets/soccerclub.axiomthemes.com/sport-event/chelsea-vs-manchester/index.html"><span className="sp-result ok">2</span> - <span className="sp-result">3</span></a></h5><div className="sp-event-league">primera división</div><div className="sp-event-season">2023</div><div className="sp-event-venue" itemProp="location" itemScope itemType="http://schema.org/Place"><div itemProp="address" itemScope itemType="http://schema.org/PostalAddress">Nueva York</div></div><div className="sp-event-venue" itemProp="location" itemScope itemType="http://schema.org/Place" style={{display: 'none'}}><div itemProp="address" itemScope itemType="http://schema.org/PostalAddress">N / A</div></div><h4 className="sp-event-title" itemProp="name"><a href="/assets/soccerclub.axiomthemes.com/sport-event/chelsea-vs-manchester/index.html">Chelsea-Mánchester</a></h4></td></tr></tbody></table>
                                          </div>
                                        </div>
                                      </div></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-72ffcb2 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="72ffcb2">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-046b2f3 sc_fly_static elementor-widget elementor-widget-shortcode" data-element_type="widget" data-id="046b2f3" data-widget_type="shortcode.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-shortcode"><div className="sportspress"><div className="sp-template sp-template-event-blocks">
                                          <div className="sp-table-wrapper">
                                            <table className="sp-event-blocks sp-data-table sp-paginated-table" data-sp-rows={5}><thead><tr><th /></tr></thead><tbody><tr className="sp-row sp-post alternate" itemScope itemType="http://schema.org/SportsEvent"><td><span className="team-logo logo-odd" title="Club de fútbol"><a href="/assets/soccerclub.axiomthemes.com/sport-team/soccerclub/index.html"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/team1-copyright.png" width={316} /></a></span><span className="team-logo logo-even" title="FC Bayern"><a href="/assets/soccerclub.axiomthemes.com/sport-team/fc-bayern/index.html"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team7-copyright.png" width={316} /></a></span><time className="sp-event-date" content="2024-10-26T11:40:27+00:00" dateTime="2024-10-26 11:40:27" itemProp="startDate"><a href="/assets/soccerclub.axiomthemes.com/sport-event/soccerclub-vs-fc-bayern/index.html">26 de octubre de 2024</a></time><h5 className="sp-event-results"><a href="/assets/soccerclub.axiomthemes.com/sport-event/soccerclub-vs-fc-bayern/index.html"><span className="sp-result ok">11:40 am</span></a></h5><div className="sp-event-league">primera división</div><div className="sp-event-season">2023</div><div className="sp-event-venue" itemProp="location" itemScope itemType="http://schema.org/Place"><div itemProp="address" itemScope itemType="http://schema.org/PostalAddress">bentleigh</div></div><div className="sp-event-venue" itemProp="location" itemScope itemType="http://schema.org/Place" style={{display: 'none'}}><div itemProp="address" itemScope itemType="http://schema.org/PostalAddress">N / A</div></div><h4 className="sp-event-title" itemProp="name"><a href="/assets/soccerclub.axiomthemes.com/sport-event/soccerclub-vs-fc-bayern/index.html">FútbolClub vs Bayern de Múnich</a></h4></td></tr></tbody></table>
                                          </div>
                                        </div>
                                      </div></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-9185306 scheme_default elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id={9185306} data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-ae3e7da scheme_light elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="ae3e7da" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-187872a sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="187872a">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-48ce607 sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="48ce607" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-89479ef animation_type_block sc_fly_static elementor-invisible elementor-widget elementor-widget-trx_sc_title" data-animation-type="block" data-element_type="widget" data-id="89479ef" data-settings="{&quot;_animation&quot;:&quot;soccerclub-fadein&quot;}" data-widget_type="trx_sc_title.default">
                                  <div className="elementor-widget-container">
                                    <div className="sc_title sc_title_default"><span className="sc_item_subtitle sc_title_subtitle sc_item_subtitle_above sc_item_title_style_default">nuestros articulos</span><h1 className="sc_item_title sc_title_title sc_item_title_style_default sc_item_title_tag"><span className="sc_item_title_text">Tendencia ahora</span></h1></div> </div>
                                </div>
                                <div className="elementor-element elementor-element-734080e sc_height_small sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="734080e" data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-250e9cb scheme_light elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="250e9cb" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-50 elementor-top-column elementor-element elementor-element-714aa95 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="714aa95">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-ab1c95c sc_style_default animation_type_block sc_fly_static elementor-invisible elementor-widget elementor-widget-trx_sc_blogger" data-animation-type="block" data-element_type="widget" data-id="ab1c95c" data-settings="{&quot;_animation&quot;:&quot;soccerclub-fadeinup&quot;}" data-widget_type="trx_sc_blogger.default">
                                  <div className="elementor-widget-container">
                                    <div className="sc_blogger sc_blogger_default sc_blogger_default_classic_time_2 sc_item_filters_tabs_none alignnone"><div className="sc_blogger_content sc_item_content sc_item_posts_container"><div className="sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic_time_2 sc_blogger_item_odd sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_with_excerpt sc_blogger_item_image_position_top post-41817 post type-post status-publish format-standard has-post-thumbnail hentry category-champions tag-news tag-player tag-soccer tag-sports" data-item-number={1} data-post-id={41817}><div className="sc_blogger_item_body"><div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured post_featured_bg" data-ratio="4:3"><span className="post_thumb post_thumb_bg bg_in soccerclub_inline_1676096322" /> <div className="mask" />
                                              <div className="post_info_tl"><div className="post_meta sc_blogger_item_meta post_meta_categories"><span className="post_meta_item post_categories cat_sep"><a href="/assets/soccerclub.axiomthemes.com/category/champions/index.html" rel="category tag">Campeones</a></span></div></div><a className="post_link sc_blogger_item_link" href="/assets/soccerclub.axiomthemes.com/why-soccer-clubs-dominate-global-sports-culture/index.html" /> <a aria-hidden="true" className="link" href="/assets/soccerclub.axiomthemes.com/why-soccer-clubs-dominate-global-sports-culture/index.html" />
                                            </div><div className="sc_blogger_item_content entry-content"><div className="post_meta sc_blogger_item_meta post_meta_date"><span className="post_meta_item post_date"><a href="/assets/soccerclub.axiomthemes.com/why-soccer-clubs-dominate-global-sports-culture/index.html"><b>15</b>Oct</a></span></div><h5 className="sc_blogger_item_title entry-title" data-item-number={1}><a href="/assets/soccerclub.axiomthemes.com/why-soccer-clubs-dominate-global-sports-culture/index.html" rel="bookmark">Por qué los clubes de fútbol dominan la cultura deportiva mundial</a></h5><div className="sc_blogger_item_excerpt">Proin faucibus nec mauris a sodales, sed elementum mi tincidunt. Sed eget viverra egetas nisi en…</div><div className="post_meta sc_blogger_item_meta post_meta"><a className="post_meta_item post_meta_likes trx_addons_icon-heart-empty enabled" data-likes={2} data-postid={41817} data-title-dislike="Dislike" data-title-like="Like" href="#" role="button" title="Como"><span className="post_meta_number">2</span><span className="post_meta_label">Gustos</span></a><a className="post_meta_item post_meta_comments icon-comment-light" href="/assets/soccerclub.axiomthemes.com/why-soccer-clubs-dominate-global-sports-culture/index.html"><span className="post_meta_number">0</span><span className="post_meta_label">Comentarios</span></a></div></div></div></div></div></div> </div>
                                </div>
                                <div className="elementor-element elementor-element-d564f3e sc_layouts_hide_on_wide sc_layouts_hide_on_desktop sc_layouts_hide_on_notebook sc_layouts_hide_on_tablet sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="d564f3e" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-50 elementor-top-column elementor-element elementor-element-076cb04 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="076cb04">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-1f66b63 animation_type_sequental sc_style_default sc_fly_static elementor-invisible elementor-widget elementor-widget-trx_sc_blogger" data-animation-stagger data-animation-type="sequental" data-element_type="widget" data-id="1f66b63" data-settings="{&quot;_animation&quot;:&quot;soccerclub-fadeinup&quot;,&quot;_animation_delay&quot;:100}" data-widget_type="trx_sc_blogger.default">
                                  <div className="elementor-widget-container">
                                    <div className="sc_blogger sc_blogger_default sc_blogger_default_classic_simple sc_item_filters_tabs_none alignnone"><div className="sc_blogger_content sc_item_content sc_item_posts_container"><div className="sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic_simple sc_blogger_item_odd sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_no_excerpt sc_blogger_item_image_position_left post-41804 post type-post status-publish format-standard has-post-thumbnail hentry category-champions tag-news tag-player tag-soccer tag-sports" data-item-number={1} data-post-id={41804}><div className="sc_blogger_item_body"><div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured trx_addons_inline_1688788328 post_featured_bg" data-ratio="1:1"><span className="post_thumb post_thumb_bg bg_in soccerclub_inline_1398672713" /> <div className="mask" />
                                              <a aria-hidden="true" className="link" href="/assets/soccerclub.axiomthemes.com/the-untold-stories-of-legendary-soccer-clubs/index.html" />
                                            </div><div className="sc_blogger_item_content entry-content trx_addons_inline_1341659278"><div className="post_meta sc_blogger_item_meta post_meta"><span className="post_meta_item post_categories cat_sep"><a href="/assets/soccerclub.axiomthemes.com/category/champions/index.html" rel="category tag">Campeones</a></span><span className="post_meta_item post_date"><a href="/assets/soccerclub.axiomthemes.com/the-untold-stories-of-legendary-soccer-clubs/index.html">18 de octubre de 2024</a></span></div><h5 className="sc_blogger_item_title entry-title" data-item-number={1}><a href="/assets/soccerclub.axiomthemes.com/the-untold-stories-of-legendary-soccer-clubs/index.html" rel="bookmark">Las historias no contadas de clubes de fútbol legendarios</a></h5></div></div></div><div className="sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic_simple sc_blogger_item_even sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_no_excerpt sc_blogger_item_image_position_left post-41810 post type-post status-publish format-standard has-post-thumbnail hentry category-champions tag-news tag-player tag-soccer tag-sports" data-item-number={2} data-post-id={41810}><div className="sc_blogger_item_body"><div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured trx_addons_inline_1215617507 post_featured_bg" data-ratio="1:1"><span className="post_thumb post_thumb_bg bg_in soccerclub_inline_1217251384" /> <div className="mask" />
                                              <a aria-hidden="true" className="link" href="/assets/soccerclub.axiomthemes.com/exploring-fan-culture-in-famous-soccer-clubs/index.html" />
                                            </div><div className="sc_blogger_item_content entry-content trx_addons_inline_560897573"><div className="post_meta sc_blogger_item_meta post_meta"><span className="post_meta_item post_categories cat_sep"><a href="/assets/soccerclub.axiomthemes.com/category/champions/index.html" rel="category tag">Campeones</a></span><span className="post_meta_item post_date"><a href="/assets/soccerclub.axiomthemes.com/exploring-fan-culture-in-famous-soccer-clubs/index.html">17 de octubre de 2024</a></span></div><h5 className="sc_blogger_item_title entry-title" data-item-number={2}><a href="/assets/soccerclub.axiomthemes.com/exploring-fan-culture-in-famous-soccer-clubs/index.html" rel="bookmark">Explorando la cultura de los fanáticos en clubes de fútbol famosos.</a></h5></div></div></div><div className="sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic_simple sc_blogger_item_odd sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_no_excerpt sc_blogger_item_image_position_left post-41815 post type-post status-publish format-standard has-post-thumbnail hentry category-champions tag-news tag-player tag-soccer tag-sports" data-item-number={3} data-post-id={41815}><div className="sc_blogger_item_body"><div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured trx_addons_inline_1845670928 post_featured_bg" data-ratio="1:1"><span className="post_thumb post_thumb_bg bg_in soccerclub_inline_586772242" /> <div className="mask" />
                                              <a aria-hidden="true" className="link" href="/assets/soccerclub.axiomthemes.com/inside-the-worlds-richest-soccer-clubs/index.html" />
                                            </div><div className="sc_blogger_item_content entry-content trx_addons_inline_524019508"><div className="post_meta sc_blogger_item_meta post_meta"><span className="post_meta_item post_categories cat_sep"><a href="/assets/soccerclub.axiomthemes.com/category/champions/index.html" rel="category tag">Campeones</a></span><span className="post_meta_item post_date"><a href="/assets/soccerclub.axiomthemes.com/inside-the-worlds-richest-soccer-clubs/index.html">16 de octubre de 2024</a></span></div><h5 className="sc_blogger_item_title entry-title" data-item-number={3}><a href="/assets/soccerclub.axiomthemes.com/inside-the-worlds-richest-soccer-clubs/index.html" rel="bookmark">Dentro de los clubes de fútbol más ricos del mundo</a></h5></div></div></div></div></div> </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-9a37f77 elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="9a37f77" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-bf59789 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="bf59789">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-eeb8cea sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="eeb8cea" data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-a64e0c3 elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="a64e0c3">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-7aae2ac sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="7aae2ac">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-b4274ad sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="b4274ad" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>

                                <div className="elementor-element elementor-element-817c1e8 sc_height_small sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="817c1e8" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-19d8ef5" style={{display:'none'}}>
                                  <div className="elementor-widget-container">
                                    <div className="elementor-shortcode"><div className="sportspress sp-widget-align-none"><div className="sp-template sp-template-league-table">
                                          <h4 className="sp-table-caption">equipo de pie</h4><div className="sp-table-wrapper"><table className="sp-league-table sp-league-table-28097 sp-data-table sp-sortable-table sp-scrollable-table sp-paginated-table" data-sp-rows={10}><thead><tr><th className="data-rank">Pos.</th><th className="data-name">Equipo</th><th className="data-e">mi</th><th className="data-w">W.</th><th className="data-l">l</th><th className="data-p">PAG</th></tr></thead><tbody><tr className="odd highlighted sp-row-no-0"><td className="data-rank sp-highlight" data-label="Pos">1</td><td className="data-name has-logo sp-highlight" data-label="Team"><a href="/assets/soccerclub.axiomthemes.com/sport-team/soccerclub/index.html"><span className="team-logo"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/team1-copyright.png" width={316} /></span>Club de fútbol</a></td><td className="data-e sp-highlight" data-label="E">4</td><td className="data-w sp-highlight" data-label="W">2</td><td className="data-l sp-highlight" data-label="L">2</td><td className="data-p sp-highlight" data-label="P">4</td></tr><tr className="even sp-row-no-1"><td className="data-rank" data-label="Pos">2</td><td className="data-name has-logo" data-label="Team"><a href="/assets/soccerclub.axiomthemes.com/sport-team/manchester/index.html"><span className="team-logo"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team6-copyright.png" width={316} /></span>Manchester</a></td><td className="data-e" data-label="E">3</td><td className="data-w" data-label="W">2</td><td className="data-l" data-label="L">1</td><td className="data-p" data-label="P">4</td></tr><tr className="odd sp-row-no-2"><td className="data-rank" data-label="Pos">3</td><td className="data-name has-logo" data-label="Team"><a href="/assets/soccerclub.axiomthemes.com/sport-team/chelsea/index.html"><span className="team-logo"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team5-copyright.png" width={316} /></span>Chelsea</a></td><td className="data-e" data-label="E">3</td><td className="data-w" data-label="W">2</td><td className="data-l" data-label="L">1</td><td className="data-p" data-label="P">4</td></tr><tr className="even sp-row-no-3"><td className="data-rank" data-label="Pos">4</td><td className="data-name has-logo" data-label="Team"><a href="/assets/soccerclub.axiomthemes.com/sport-team/fc-barcelona/index.html"><span className="team-logo"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team4-copyright.png" width={316} /></span>FC Barcelona</a></td><td className="data-e" data-label="E">2</td><td className="data-w" data-label="W">1</td><td className="data-l" data-label="L">1</td><td className="data-p" data-label="P">2</td></tr><tr className="odd sp-row-no-4"><td className="data-rank" data-label="Pos">4</td><td className="data-name has-logo" data-label="Team"><a href="/assets/soccerclub.axiomthemes.com/sport-team/fc-bayern/index.html"><span className="team-logo"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team7-copyright.png" width={316} /></span>FC Bayern</a></td><td className="data-e" data-label="E">3</td><td className="data-w" data-label="W">1</td><td className="data-l" data-label="L">2</td><td className="data-p" data-label="P">2</td></tr><tr className="even sp-row-no-5"><td className="data-rank" data-label="Pos">6</td><td className="data-name has-logo" data-label="Team"><a href="/assets/soccerclub.axiomthemes.com/sport-team/liverpool/index.html"><span className="team-logo"><img alt="" className="attachment-sportspress-fit-icon size-sportspress-fit-icon wp-post-image" decoding="async" height={312} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/team3-copyright.png" width={316} /></span>Liverpool</a></td><td className="data-e" data-label="E">3</td><td className="data-w" data-label="W">1</td><td className="data-l" data-label="L">2</td><td className="data-p" data-label="P">2</td></tr></tbody></table></div><div className="sp-league-table-link sp-view-all-link"><a href="/assets/soccerclub.axiomthemes.com/table/premier-league-2024/index.html">Ver tabla completa</a></div></div>
                                      </div></div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-e43cf50 sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="e43cf50" data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-b95cf93 scheme_light elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="b95cf93" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-3372429 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id={3372429}>
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-14a1dba sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="14a1dba" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-6d783b9 sc_fly_static elementor-widget elementor-widget-trx_sc_skills" data-element_type="widget" data-id="6d783b9" data-widget_type="trx_sc_skills.default">
                                  <div className="elementor-widget-container">
                                    <div className="sc_skills sc_skills_counter_extra sc_skills_counter_style_odometer sc_align_center" data-type="counter"><div className="sc_skills_columns sc_item_columns trx_addons_columns_wrap columns_padding_bottom columns_in_single_row"><div className="sc_skills_column trx_addons_column-1_4 trx_addons_column-1_2-mobile"><div className="sc_skills_item_wrap sc_skills_item_icon_position_top"><div className="sc_skills_item_title">Gente</div><div className="sc_skills_item"><div className="sc_skills_total" data-duration={1500} data-ed="+" data-max={2548} data-speed={15} data-start={0} data-step="0.9" data-stop={90} data-style="odometer"><span className="sc_skills_digits"><span className="sc_skills_digit"><span className="sc_skills_digit_placeholder">8</span><span className="sc_skills_digit_wrap"><span className="sc_skills_digit_ribbon"><span className="sc_skills_digit_value">0</span></span></span></span><span className="sc_skills_digit"><span className="sc_skills_digit_placeholder">8</span><span className="sc_skills_digit_wrap"><span className="sc_skills_digit_ribbon"><span className="sc_skills_digit_value">0</span></span></span></span><span className="sc_skills_unit">+</span></span></div></div></div></div><div className="sc_skills_column trx_addons_column-1_4 trx_addons_column-1_2-mobile"><div className="sc_skills_item_wrap sc_skills_item_icon_position_top"><div className="sc_skills_item_title">Partidos</div><div className="sc_skills_item"><div className="sc_skills_total" data-duration={1500} data-ed data-max={2548} data-speed={15} data-start={0} data-step="25.48" data-stop={2548} data-style="odometer"><span className="sc_skills_digits"><span className="sc_skills_digit"><span className="sc_skills_digit_placeholder">8</span><span className="sc_skills_digit_wrap"><span className="sc_skills_digit_ribbon"><span className="sc_skills_digit_value">0</span></span></span></span><span className="sc_skills_digit"><span className="sc_skills_digit_placeholder">8</span><span className="sc_skills_digit_wrap"><span className="sc_skills_digit_ribbon"><span className="sc_skills_digit_value">0</span></span></span></span><span className="sc_skills_digit"><span className="sc_skills_digit_placeholder">8</span><span className="sc_skills_digit_wrap"><span className="sc_skills_digit_ribbon"><span className="sc_skills_digit_value">0</span></span></span></span><span className="sc_skills_digit"><span className="sc_skills_digit_placeholder">8</span><span className="sc_skills_digit_wrap"><span className="sc_skills_digit_ribbon"><span className="sc_skills_digit_value">0</span></span></span></span></span></div></div></div></div><div className="sc_skills_column trx_addons_column-1_4 trx_addons_column-1_2-mobile"><div className="sc_skills_item_wrap sc_skills_item_icon_position_top"><div className="sc_skills_item_title">Años</div><div className="sc_skills_item"><div className="sc_skills_total" data-duration={1500} data-ed="+" data-max={2548} data-speed={15} data-start={0} data-step="0.25" data-stop={25} data-style="odometer"><span className="sc_skills_digits"><span className="sc_skills_digit"><span className="sc_skills_digit_placeholder">8</span><span className="sc_skills_digit_wrap"><span className="sc_skills_digit_ribbon"><span className="sc_skills_digit_value">0</span></span></span></span><span className="sc_skills_digit"><span className="sc_skills_digit_placeholder">8</span><span className="sc_skills_digit_wrap"><span className="sc_skills_digit_ribbon"><span className="sc_skills_digit_value">0</span></span></span></span><span className="sc_skills_unit">+</span></span></div></div></div></div><div className="sc_skills_column trx_addons_column-1_4 trx_addons_column-1_2-mobile"><div className="sc_skills_item_wrap sc_skills_item_icon_position_top"><div className="sc_skills_item_title">Trofeos</div><div className="sc_skills_item"><div className="sc_skills_total" data-duration={1500} data-ed data-max={2548} data-speed={15} data-start={0} data-step="2.56" data-stop={256} data-style="odometer"><span className="sc_skills_digits"><span className="sc_skills_digit"><span className="sc_skills_digit_placeholder">8</span><span className="sc_skills_digit_wrap"><span className="sc_skills_digit_ribbon"><span className="sc_skills_digit_value">0</span></span></span></span><span className="sc_skills_digit"><span className="sc_skills_digit_placeholder">8</span><span className="sc_skills_digit_wrap"><span className="sc_skills_digit_ribbon"><span className="sc_skills_digit_value">0</span></span></span></span><span className="sc_skills_digit"><span className="sc_skills_digit_placeholder">8</span><span className="sc_skills_digit_wrap"><span className="sc_skills_digit_ribbon"><span className="sc_skills_digit_value">0</span></span></span></span></span></div></div></div></div></div></div> </div>
                                </div>
                                <div className="elementor-element elementor-element-7e88433 sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="7e88433" data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-db214c6 scheme_dark elementor-section-boxed elementor-section-height-default elementor-section-height-default animation_type_block sc_fly_static elementor-invisible" data-animation-type="block" data-element_type="section" data-id="db214c6" data-mouse-helper="hover" data-mouse-helper-axis="xy" data-mouse-helper-bd-color data-mouse-helper-bd-width={-1} data-mouse-helper-bg-color="#FF5B4A" data-mouse-helper-callback data-mouse-helper-centered={1} data-mouse-helper-class data-mouse-helper-color data-mouse-helper-delay={0} data-mouse-helper-hide-cursor={0} data-mouse-helper-hide-helper={1} data-mouse-helper-icon data-mouse-helper-icon-color data-mouse-helper-icon-size data-mouse-helper-image data-mouse-helper-layout data-mouse-helper-magnet={0} data-mouse-helper-mode="multiply" data-mouse-helper-text data-mouse-helper-text-round={0} data-mouse-helper-text-size data-settings="{&quot;background_background&quot;:&quot;classic&quot;,&quot;animation&quot;:&quot;soccerclub-fadein&quot;}">
                          <div className="elementor-background-overlay" />
                          <div className="elementor-container elementor-column-gap-default">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-3f86b24 sc_layouts_column_align_center sc_layouts_column sc-mobile_layouts_column_align_center sc_layouts_column sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="3f86b24">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-cb1efc2 sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="cb1efc2" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-e208761 elementor-align-center round-square elementor-widget__width-auto sc_fly_static elementor-widget elementor-widget-button" data-element_type="widget" data-id="e208761" data-mouse-helper="hover" data-mouse-helper-axis="xy" data-mouse-helper-bd-color data-mouse-helper-bd-width={-1} data-mouse-helper-bg-color="#FB2610" data-mouse-helper-callback data-mouse-helper-centered={1} data-mouse-helper-class data-mouse-helper-color data-mouse-helper-delay={0} data-mouse-helper-hide-cursor={0} data-mouse-helper-hide-helper={1} data-mouse-helper-icon data-mouse-helper-icon-color data-mouse-helper-icon-size data-mouse-helper-image data-mouse-helper-layout data-mouse-helper-magnet={99} data-mouse-helper-mode="multiply" data-mouse-helper-text data-mouse-helper-text-round={0} data-mouse-helper-text-size data-widget_type="button.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-button-wrapper">
                                      <a className="elementor-button elementor-button-link elementor-size-sm" href="#go-video">
                                        <span className="elementor-button-content-wrapper">
                                          <span className="elementor-button-text">JUGAR</span>
                                        </span>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-cf27cfa sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="cf27cfa" data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-6b8f2b1 scheme_dark elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="6b8f2b1" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-b8b65b6 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="b8b65b6">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-d619e94 sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="d619e94" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-8a980fb animation_type_block sc_fly_static elementor-invisible elementor-widget elementor-widget-trx_sc_title" data-animation-type="block" data-element_type="widget" data-id="8a980fb" data-settings="{&quot;_animation&quot;:&quot;soccerclub-fadein&quot;}" data-widget_type="trx_sc_title.default">
                                  <div className="elementor-widget-container">
                                    <div className="sc_title sc_title_default"><span className="sc_item_subtitle sc_title_subtitle sc_align_center sc_item_subtitle_above sc_item_title_style_default">JUGADORES</span><h1 className="sc_item_title sc_title_title sc_align_center sc_item_title_style_default sc_item_title_tag"><span className="sc_item_title_text">Nuestro equipo principal</span></h1></div> </div>
                                </div>
                                <div className="elementor-element elementor-element-1a8f16e sc_height_small sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="1a8f16e" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-6859e74 animation_type_block sc_fly_static elementor-invisible elementor-widget elementor-widget-trx_sc_team" data-animation-type="block" data-element_type="widget" data-id="6859e74" data-settings="{&quot;_animation&quot;:&quot;fadeIn&quot;}" data-widget_type="trx_sc_team.default">
                                  <div className="elementor-widget-container">
                                    <div className="sc_team sc_team_short"><div className="sc_team_slider sc_item_slider slider_swiper_outer slider_outer slider_outer_nocontrols slider_outer_pagination slider_outer_pagination_progressbar slider_outer_pagination_pos_bottom slider_outer_nocentered slider_outer_overflow_hidden slider_outer_multi">
                                        <div className="slider_container swiper-slider-container slider_swiper slider_noresize slider_nocontrols slider_pagination slider_pagination_progressbar slider_pagination_pos_bottom slider_nocentered slider_overflow_hidden slider_multi" data-autoplay={1} data-direction="horizontal" data-effect="slide" data-free-mode={0} data-loop={1} data-mouse-wheel={0} data-pagination="progressbar" data-slides-centered={0} data-slides-min-width={220} data-slides-overflow={0} data-slides-per-view={5} data-slides-per-view-breakpoints="{&quot;999999&quot;:5}" data-slides-space={30} data-slides-space-breakpoints="{&quot;999999&quot;:30}">
                                          <div className="slides slider-wrapper swiper-wrapper sc_item_columns_5"><div className="slider-slide swiper-slide"><div className="sc_team_item sc_item_container post_container no_links post-28183 sp_player type-sp_player status-publish has-post-thumbnail hentry sp_league-premier-league sp_league-secondary-league sp_season-278 sp_season-266 sp_season-267 sp_season-268 sp_position-midfield" data-post-id={28183}>
                                                <div className="post_featured sc_team_item_thumb trx_addons_hover trx_addons_hover_style_info_anim"><img alt="" className="attachment-soccerclub-thumb-rectangle size-soccerclub-thumb-rectangle wp-post-image" decoding="async" height={696} loading="lazy" sizes="(max-width: 600px) 100vw, 570px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright-570x696.jpg" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright-570x696.jpg 570w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright-246x300.jpg 246w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright-838x1024.jpg 838w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright-768x938.jpg 768w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright-370x452.jpg 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright-840x1026.jpg 840w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright-410x501.jpg 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright-409x500.jpg 409w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright-327x400.jpg 327w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright-26x32.jpg 26w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright-780x953.jpg 780w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player1-copyright.jpg 1200w" width={570} /><span className="sp-player-number">1</span><a className="post_link sc_team_item_link" href="/assets/soccerclub.axiomthemes.com/player/liam-harrison/index.html" /><div className="trx_addons_hover_mask" /></div> <div className="sc_team_item_info">
                                                  <div className="sc_team_item_header">
                                                    <h4 className="sc_team_item_title entry-title"><a href="/assets/soccerclub.axiomthemes.com/player/liam-harrison/index.html">Liam Harrison</a></h4>
                                                    <div className="sc_team_item_subtitle">Centro del campo</div> </div>
                                                </div>
                                              </div>
                                            </div><div className="slider-slide swiper-slide"><div className="sc_team_item sc_item_container post_container no_links post-28201 sp_player type-sp_player status-publish has-post-thumbnail hentry sp_league-premier-league sp_league-secondary-league sp_season-278 sp_season-266 sp_season-267 sp_season-268 sp_position-defence" data-post-id={28201}>
                                                <div className="post_featured sc_team_item_thumb trx_addons_hover trx_addons_hover_style_info_anim"><img alt="" className="attachment-soccerclub-thumb-rectangle size-soccerclub-thumb-rectangle wp-post-image" decoding="async" height={696} loading="lazy" sizes="(max-width: 600px) 100vw, 570px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright-570x696.jpg" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright-570x696.jpg 570w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright-246x300.jpg 246w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright-838x1024.jpg 838w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright-768x938.jpg 768w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright-370x452.jpg 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright-840x1026.jpg 840w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright-410x501.jpg 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright-409x500.jpg 409w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright-327x400.jpg 327w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright-26x32.jpg 26w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright-780x953.jpg 780w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player5-copyright.jpg 1200w" width={570} /><span className="sp-player-number">12</span><a className="post_link sc_team_item_link" href="/assets/soccerclub.axiomthemes.com/player/samuel-whitman/index.html" /><div className="trx_addons_hover_mask" /></div> <div className="sc_team_item_info">
                                                  <div className="sc_team_item_header">
                                                    <h4 className="sc_team_item_title entry-title"><a href="/assets/soccerclub.axiomthemes.com/player/samuel-whitman/index.html">Samuel Whitman</a></h4>
                                                    <div className="sc_team_item_subtitle">Defensa</div> </div>
                                                </div>
                                              </div>
                                            </div><div className="slider-slide swiper-slide"><div className="sc_team_item sc_item_container post_container no_links post-28190 sp_player type-sp_player status-publish has-post-thumbnail hentry sp_league-premier-league sp_league-secondary-league sp_season-278 sp_season-266 sp_season-267 sp_season-268 sp_position-midfield" data-post-id={28190}>
                                                <div className="post_featured sc_team_item_thumb trx_addons_hover trx_addons_hover_style_info_anim"><img alt="" className="attachment-soccerclub-thumb-rectangle size-soccerclub-thumb-rectangle wp-post-image" decoding="async" height={696} loading="lazy" sizes="(max-width: 600px) 100vw, 570px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright-570x696.jpg" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright-570x696.jpg 570w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright-246x300.jpg 246w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright-838x1024.jpg 838w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright-768x938.jpg 768w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright-370x452.jpg 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright-840x1026.jpg 840w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright-410x501.jpg 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright-409x500.jpg 409w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright-327x400.jpg 327w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright-26x32.jpg 26w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright-780x953.jpg 780w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player4-copyright.jpg 1200w" width={570} /><span className="sp-player-number">21</span><a className="post_link sc_team_item_link" href="/assets/soccerclub.axiomthemes.com/player/daniel-mitchell/index.html" /><div className="trx_addons_hover_mask" /></div> <div className="sc_team_item_info">
                                                  <div className="sc_team_item_header">
                                                    <h4 className="sc_team_item_title entry-title"><a href="/assets/soccerclub.axiomthemes.com/player/daniel-mitchell/index.html">Daniel Mitchell</a></h4>
                                                    <div className="sc_team_item_subtitle">Centro del campo</div> </div>
                                                </div>
                                              </div>
                                            </div><div className="slider-slide swiper-slide"><div className="sc_team_item sc_item_container post_container no_links post-28203 sp_player type-sp_player status-publish has-post-thumbnail hentry sp_league-premier-league sp_league-secondary-league sp_season-278 sp_season-266 sp_season-267 sp_season-268 sp_position-attack" data-post-id={28203}>
                                                <div className="post_featured sc_team_item_thumb trx_addons_hover trx_addons_hover_style_info_anim"><img alt="" className="attachment-soccerclub-thumb-rectangle size-soccerclub-thumb-rectangle wp-post-image" decoding="async" height={696} loading="lazy" sizes="(max-width: 600px) 100vw, 570px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright-570x696.jpg" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright-570x696.jpg 570w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright-246x300.jpg 246w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright-838x1024.jpg 838w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright-768x938.jpg 768w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright-370x452.jpg 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright-840x1026.jpg 840w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright-410x501.jpg 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright-409x500.jpg 409w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright-327x400.jpg 327w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright-26x32.jpg 26w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright-780x953.jpg 780w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player2-copyright.jpg 1200w" width={570} /><span className="sp-player-number">10</span><a className="post_link sc_team_item_link" href="/assets/soccerclub.axiomthemes.com/player/gabriel-thornton/index.html" /><div className="trx_addons_hover_mask" /></div> <div className="sc_team_item_info">
                                                  <div className="sc_team_item_header">
                                                    <h4 className="sc_team_item_title entry-title"><a href="/assets/soccerclub.axiomthemes.com/player/gabriel-thornton/index.html">Gabriel Thorton</a></h4>
                                                    <div className="sc_team_item_subtitle">Ataque</div> </div>
                                                </div>
                                              </div>
                                            </div><div className="slider-slide swiper-slide"><div className="sc_team_item sc_item_container post_container no_links post-28164 sp_player type-sp_player status-publish has-post-thumbnail hentry sp_league-premier-league sp_league-secondary-league sp_season-278 sp_season-266 sp_season-267 sp_position-attack" data-post-id={28164}>
                                                <div className="post_featured sc_team_item_thumb trx_addons_hover trx_addons_hover_style_info_anim"><img alt="" className="attachment-soccerclub-thumb-rectangle size-soccerclub-thumb-rectangle wp-post-image" decoding="async" height={696} loading="lazy" sizes="(max-width: 600px) 100vw, 570px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player7-copyright-570x696.jpg" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player7-copyright-570x696.jpg 570w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player7-copyright-246x300.jpg 246w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player7-copyright-839x1024.jpg 839w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player7-copyright-768x937.jpg 768w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player7-copyright-370x451.jpg 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player7-copyright-840x1025.jpg 840w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player7-copyright-410x500.jpg 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player7-copyright-328x400.jpg 328w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player7-copyright-26x32.jpg 26w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player7-copyright-780x952.jpg 780w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player7-copyright.jpg 1200w" width={570} /><span className="sp-player-number">10</span><a className="post_link sc_team_item_link" href="/assets/soccerclub.axiomthemes.com/player/elijah-harrison/index.html" /><div className="trx_addons_hover_mask" /></div> <div className="sc_team_item_info">
                                                  <div className="sc_team_item_header">
                                                    <h4 className="sc_team_item_title entry-title"><a href="/assets/soccerclub.axiomthemes.com/player/elijah-harrison/index.html">Elías Harrison</a></h4>
                                                    <div className="sc_team_item_subtitle">Ataque</div> </div>
                                                </div>
                                              </div>
                                            </div><div className="slider-slide swiper-slide"><div className="sc_team_item sc_item_container post_container no_links post-28178 sp_player type-sp_player status-publish has-post-thumbnail hentry sp_league-premier-league sp_league-secondary-league sp_season-278 sp_season-266 sp_season-267 sp_position-attack sp_position-defence" data-post-id={28178}>
                                                <div className="post_featured sc_team_item_thumb trx_addons_hover trx_addons_hover_style_info_anim"><img alt="" className="attachment-soccerclub-thumb-rectangle size-soccerclub-thumb-rectangle wp-post-image" decoding="async" height={696} loading="lazy" sizes="(max-width: 600px) 100vw, 570px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player6-copyright-570x696.jpg" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player6-copyright-570x696.jpg 570w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player6-copyright-246x300.jpg 246w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player6-copyright-839x1024.jpg 839w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player6-copyright-768x938.jpg 768w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player6-copyright-370x452.jpg 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player6-copyright-840x1026.jpg 840w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player6-copyright-410x500.jpg 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player6-copyright-328x400.jpg 328w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player6-copyright-26x32.jpg 26w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player6-copyright-780x952.jpg 780w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player6-copyright.jpg 1200w" width={570} /><span className="sp-player-number">8</span><a className="post_link sc_team_item_link" href="/assets/soccerclub.axiomthemes.com/player/caleb-thornton/index.html" /><div className="trx_addons_hover_mask" /></div> <div className="sc_team_item_info">
                                                  <div className="sc_team_item_header">
                                                    <h4 className="sc_team_item_title entry-title"><a href="/assets/soccerclub.axiomthemes.com/player/caleb-thornton/index.html">Caleb Thornton</a></h4>
                                                    <div className="sc_team_item_subtitle">Ataque, Defensa</div> </div>
                                                </div>
                                              </div>
                                            </div><div className="slider-slide swiper-slide"><div className="sc_team_item sc_item_container post_container no_links post-28195 sp_player type-sp_player status-publish has-post-thumbnail hentry sp_league-premier-league sp_league-secondary-league sp_season-278 sp_season-266 sp_season-267 sp_position-attack" data-post-id={28195}>
                                                <div className="post_featured sc_team_item_thumb trx_addons_hover trx_addons_hover_style_info_anim"><img alt="" className="attachment-soccerclub-thumb-rectangle size-soccerclub-thumb-rectangle wp-post-image" decoding="async" height={696} loading="lazy" sizes="(max-width: 600px) 100vw, 570px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright-570x696.jpg" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright-570x696.jpg 570w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright-246x300.jpg 246w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright-838x1024.jpg 838w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright-768x938.jpg 768w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright-370x452.jpg 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright-840x1026.jpg 840w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright-410x501.jpg 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright-409x500.jpg 409w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright-327x400.jpg 327w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright-26x32.jpg 26w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright-780x953.jpg 780w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/1999/05/player3-copyright.jpg 1200w" width={570} /><span className="sp-player-number">10</span><a className="post_link sc_team_item_link" href="/assets/soccerclub.axiomthemes.com/player/caleb-donovan/index.html" /><div className="trx_addons_hover_mask" /></div> <div className="sc_team_item_info">
                                                  <div className="sc_team_item_header">
                                                    <h4 className="sc_team_item_title entry-title"><a href="/assets/soccerclub.axiomthemes.com/player/caleb-donovan/index.html">Caleb Donovan</a></h4>
                                                    <div className="sc_team_item_subtitle">Ataque</div> </div>
                                                </div>
                                              </div>
                                            </div></div></div><div className="slider_pagination_wrap swiper-pagination" /></div></div> </div>
                                </div>
                                <div className="elementor-element elementor-element-fe10094 sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="fe10094" data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-486ae5f scheme_light elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="486ae5f" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-c5120bb sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="c5120bb">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-03c8652 sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="03c8652" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-68bcfd2 animation_type_block sc_fly_static elementor-invisible elementor-widget elementor-widget-trx_sc_title" data-animation-type="block" data-element_type="widget" data-id="68bcfd2" data-settings="{&quot;_animation&quot;:&quot;soccerclub-fadein&quot;}" data-widget_type="trx_sc_title.default">
                                  <div className="elementor-widget-container">
                                    <div className="sc_title sc_title_default"><span className="sc_item_subtitle sc_title_subtitle sc_align_center sc_item_subtitle_above sc_item_title_style_default">blog</span><h1 className="sc_item_title sc_title_title sc_align_center sc_item_title_style_default sc_item_title_tag"><span className="sc_item_title_text">Últimas noticias</span></h1></div> </div>
                                </div>
                                <div className="elementor-element elementor-element-f99c89f sc_height_small sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="f99c89f" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-02a0cf6 animation_type_sequental sc_style_default sc_fly_static elementor-invisible elementor-widget elementor-widget-trx_sc_blogger" data-animation-stagger data-animation-type="sequental" data-element_type="widget" data-id="02a0cf6" data-settings="{&quot;_animation&quot;:&quot;soccerclub-fadeinup&quot;,&quot;_animation_delay&quot;:100}" data-widget_type="trx_sc_blogger.default">
                                  <div className="elementor-widget-container">
                                    <div className="sc_blogger sc_blogger_default sc_blogger_default_classic sc_item_filters_tabs_none alignnone"><div className="sc_blogger_slider sc_item_slider slider_swiper_outer slider_outer slider_outer_nocontrols slider_outer_pagination slider_outer_pagination_bullets slider_outer_pagination_pos_bottom_outside slider_outer_nocentered slider_outer_overflow_hidden slider_outer_multi">
                                        <div className="slider_container swiper-slider-container slider_swiper slider_noresize slider_nocontrols slider_pagination slider_pagination_bullets slider_pagination_pos_bottom_outside slider_nocentered slider_overflow_hidden slider_multi" data-autoplay={1} data-direction="horizontal" data-effect="slide" data-free-mode={0} data-loop={1} data-mouse-wheel={0} data-pagination="bullets" data-slides-centered={0} data-slides-min-width={220} data-slides-overflow={0} data-slides-per-view={3} data-slides-per-view-breakpoints="{&quot;999999&quot;:3}" data-slides-space={30} data-slides-space-breakpoints="{&quot;999999&quot;:30}">
                                          <div className="slides slider-wrapper swiper-wrapper sc_item_columns_3"><div className="slider-slide swiper-slide"><div className="sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic sc_blogger_item_odd sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_no_excerpt sc_blogger_item_image_position_top post-19532 post type-post status-publish format-standard has-post-thumbnail hentry category-clubs tag-news tag-player tag-soccer tag-sports" data-item-number={1} data-post-id={19532}><div className="sc_blogger_item_body"><div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured"><img alt="" className="attachment-soccerclub-thumb-square size-soccerclub-thumb-square wp-post-image" decoding="async" height={664} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/post6-copyright-890x664.jpg" width={890} /> <div className="mask" />
                                                    <a aria-hidden="true" className="link" href="/assets/soccerclub.axiomthemes.com/what-makes-a-professional-soccer-club-truly-great/index.html" />
                                                  </div><div className="sc_blogger_item_content entry-content"><div className="post_meta sc_blogger_item_meta post_meta_categories"><span className="post_meta_item post_categories cat_sep"><a href="/assets/soccerclub.axiomthemes.com/category/clubs/index.html" rel="category tag">Clubs</a></span></div><h5 className="sc_blogger_item_title entry-title" data-item-number={1}><a href="/assets/soccerclub.axiomthemes.com/what-makes-a-professional-soccer-club-truly-great/index.html" rel="bookmark">¿Qué hace que un club de fútbol profesional sea realmente grandioso?</a></h5><div className="post_meta sc_blogger_item_meta post_meta"><span className="post_meta_item post_date"><a href="/assets/soccerclub.axiomthemes.com/what-makes-a-professional-soccer-club-truly-great/index.html">10 de noviembre de 2024</a></span><a className="post_meta_item post_meta_comments icon-comment-light" href="/assets/soccerclub.axiomthemes.com/what-makes-a-professional-soccer-club-truly-great/index.html"><span className="post_meta_number">0</span><span className="post_meta_label">Comentarios</span></a></div></div></div></div></div><div className="slider-slide swiper-slide"><div className="sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic sc_blogger_item_even sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_no_excerpt sc_blogger_item_image_position_top post-19530 post type-post status-publish format-standard has-post-thumbnail hentry category-clubs tag-news tag-player tag-soccer tag-sports" data-item-number={2} data-post-id={19530}><div className="sc_blogger_item_body"><div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured"><img alt="" className="attachment-soccerclub-thumb-square size-soccerclub-thumb-square wp-post-image" decoding="async" height={664} loading="lazy" sizes="(max-width: 890px) 100vw, 890px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/post59-copyright-890x664.jpg" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/post59-copyright-890x664.jpg 890w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/post59-copyright-32x23.jpg 32w" width={890} /> <div className="mask" />
                                                    <a aria-hidden="true" className="link" href="/assets/soccerclub.axiomthemes.com/the-power-of-loyalty-fans-and-their-soccer-clubs/index.html" />
                                                  </div><div className="sc_blogger_item_content entry-content"><div className="post_meta sc_blogger_item_meta post_meta_categories"><span className="post_meta_item post_categories cat_sep"><a href="/assets/soccerclub.axiomthemes.com/category/clubs/index.html" rel="category tag">Clubs</a></span></div><h5 className="sc_blogger_item_title entry-title" data-item-number={2}><a href="/assets/soccerclub.axiomthemes.com/the-power-of-loyalty-fans-and-their-soccer-clubs/index.html" rel="bookmark">El poder de la lealtad: los aficionados y sus clubes de fútbol</a></h5><div className="post_meta sc_blogger_item_meta post_meta"><span className="post_meta_item post_date"><a href="/assets/soccerclub.axiomthemes.com/the-power-of-loyalty-fans-and-their-soccer-clubs/index.html">9 de noviembre de 2024</a></span><a className="post_meta_item post_meta_comments icon-comment-light" href="/assets/soccerclub.axiomthemes.com/the-power-of-loyalty-fans-and-their-soccer-clubs/index.html"><span className="post_meta_number">0</span><span className="post_meta_label">Comentarios</span></a></div></div></div></div></div><div className="slider-slide swiper-slide"><div className="sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic sc_blogger_item_odd sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_no_excerpt sc_blogger_item_image_position_top post-19528 post type-post status-publish format-standard has-post-thumbnail hentry category-clubs tag-news tag-player tag-soccer tag-sports" data-item-number={3} data-post-id={19528}><div className="sc_blogger_item_body"><div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured"><img alt="" className="attachment-soccerclub-thumb-square size-soccerclub-thumb-square wp-post-image" decoding="async" height={664} loading="lazy" sizes="(max-width: 890px) 100vw, 890px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/post60-copyright-890x664.jpg" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/post60-copyright-890x664.jpg 890w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/post60-copyright-32x23.jpg 32w" width={890} /> <div className="mask" />
                                                    <a aria-hidden="true" className="link" href="/assets/soccerclub.axiomthemes.com/5-moments-that-will-take-your-breath-away/index.html" />
                                                  </div><div className="sc_blogger_item_content entry-content"><div className="post_meta sc_blogger_item_meta post_meta_categories"><span className="post_meta_item post_categories cat_sep"><a href="/assets/soccerclub.axiomthemes.com/category/clubs/index.html" rel="category tag">Clubs</a></span></div><h5 className="sc_blogger_item_title entry-title" data-item-number={3}><a href="/assets/soccerclub.axiomthemes.com/5-moments-that-will-take-your-breath-away/index.html" rel="bookmark">Revelando las estrategias de los mejores clubes de fútbol europeos</a></h5><div className="post_meta sc_blogger_item_meta post_meta"><span className="post_meta_item post_date"><a href="/assets/soccerclub.axiomthemes.com/5-moments-that-will-take-your-breath-away/index.html">8 de noviembre de 2024</a></span><a className="post_meta_item post_meta_comments icon-comment-light" href="/assets/soccerclub.axiomthemes.com/5-moments-that-will-take-your-breath-away/index.html"><span className="post_meta_number">0</span><span className="post_meta_label">Comentarios</span></a></div></div></div></div></div><div className="slider-slide swiper-slide"><div className="sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic sc_blogger_item_even sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_no_excerpt sc_blogger_item_image_position_top post-19525 post type-post status-publish format-standard has-post-thumbnail hentry category-clubs tag-news tag-player tag-soccer tag-sports" data-item-number={4} data-post-id={19525}><div className="sc_blogger_item_body"><div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured"><img alt="" className="attachment-soccerclub-thumb-square size-soccerclub-thumb-square wp-post-image" decoding="async" height={664} loading="lazy" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2024/12/post5-copyright-890x664.jpg" width={890} /> <div className="mask" />
                                                    <a aria-hidden="true" className="link" href="/assets/soccerclub.axiomthemes.com/all-time-favorite-soccer-players-and-games/index.html" />
                                                  </div><div className="sc_blogger_item_content entry-content"><div className="post_meta sc_blogger_item_meta post_meta_categories"><span className="post_meta_item post_categories cat_sep"><a href="/assets/soccerclub.axiomthemes.com/category/clubs/index.html" rel="category tag">Clubs</a></span></div><h5 className="sc_blogger_item_title entry-title" data-item-number={4}><a href="/assets/soccerclub.axiomthemes.com/all-time-favorite-soccer-players-and-games/index.html" rel="bookmark">Jugadores y juegos de fútbol favoritos de todos los tiempos.</a></h5><div className="post_meta sc_blogger_item_meta post_meta"><span className="post_meta_item post_date"><a href="/assets/soccerclub.axiomthemes.com/all-time-favorite-soccer-players-and-games/index.html">7 de noviembre de 2024</a></span><a className="post_meta_item post_meta_comments icon-comment-light" href="/assets/soccerclub.axiomthemes.com/all-time-favorite-soccer-players-and-games/index.html"><span className="post_meta_number">0</span><span className="post_meta_label">Comentarios</span></a></div></div></div></div></div></div></div><div className="slider_pagination_wrap swiper-pagination" /></div></div> </div>
                                </div>
                                <div className="elementor-element elementor-element-0eece5b sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="0eece5b" data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-be0de5f elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="be0de5f">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-8848f29 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="8848f29">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-bf871ff sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="bf871ff" data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-e8111c1 elementor-section-content-middle animation_type_sequental elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static elementor-invisible" data-animation-stagger data-animation-type="sequental" data-element_type="section" data-id="e8111c1" data-settings="{&quot;animation&quot;:&quot;soccerclub-fadeinup&quot;,&quot;animation_delay&quot;:100}">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-5743b5e sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="5743b5e">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-8086fbc sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="8086fbc" data-widget_type="image.default">
                                  <div className="elementor-widget-container">
                                    <img alt="" className="attachment-full size-full wp-image-27861" decoding="async" height={234} loading="lazy" sizes="(max-width: 600px) 100vw, 600px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-1-copyright.png" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-1-copyright.png 600w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-1-copyright-300x117.png 300w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-1-copyright-370x144.png 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-1-copyright-410x160.png 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-1-copyright-500x195.png 500w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-1-copyright-400x156.png 400w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-1-copyright-32x12.png 32w" width={600} /> </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-327311a sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="327311a">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-b231dba sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="b231dba" data-widget_type="image.default">
                                  <div className="elementor-widget-container">
                                    <img alt="" className="attachment-full size-full wp-image-27862" decoding="async" height={234} loading="lazy" sizes="(max-width: 600px) 100vw, 600px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-2-copyright.png" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-2-copyright.png 600w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-2-copyright-300x117.png 300w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-2-copyright-370x144.png 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-2-copyright-410x160.png 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-2-copyright-500x195.png 500w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-2-copyright-400x156.png 400w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-2-copyright-32x12.png 32w" width={600} /> </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-7b9c35c sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="7b9c35c">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-d39c438 sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="d39c438" data-widget_type="image.default">
                                  <div className="elementor-widget-container">
                                    <img alt="" className="attachment-full size-full wp-image-27863" decoding="async" height={234} loading="lazy" sizes="(max-width: 600px) 100vw, 600px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-3-copyright.png" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-3-copyright.png 600w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-3-copyright-300x117.png 300w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-3-copyright-370x144.png 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-3-copyright-410x160.png 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-3-copyright-500x195.png 500w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-3-copyright-400x156.png 400w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-3-copyright-32x12.png 32w" width={600} /> </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-d2b5fbf sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="d2b5fbf">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-113cf48 sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="113cf48" data-widget_type="image.default">
                                  <div className="elementor-widget-container">
                                    <img alt="" className="attachment-full size-full wp-image-27864" decoding="async" height={234} loading="lazy" sizes="(max-width: 600px) 100vw, 600px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-4-copyright.png" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-4-copyright.png 600w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-4-copyright-300x117.png 300w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-4-copyright-370x144.png 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-4-copyright-410x160.png 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-4-copyright-500x195.png 500w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-4-copyright-400x156.png 400w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-4-copyright-32x12.png 32w" width={600} /> </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-3b3b627 elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="3b3b627">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-0714f4d sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="0714f4d">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-82a622d sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="82a622d" data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-0e337c2 elementor-section-content-middle animation_type_sequental elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static elementor-invisible" data-animation-stagger data-animation-type="sequental" data-element_type="section" data-id="0e337c2" data-settings="{&quot;animation&quot;:&quot;soccerclub-fadeinup&quot;,&quot;animation_delay&quot;:100}">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-2c99786 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="2c99786">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-ece757e sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="ece757e" data-widget_type="image.default">
                                  <div className="elementor-widget-container">
                                    <img alt="" className="attachment-full size-full wp-image-27865" decoding="async" height={234} loading="lazy" sizes="(max-width: 600px) 100vw, 600px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-5-copyright.png" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-5-copyright.png 600w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-5-copyright-300x117.png 300w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-5-copyright-370x144.png 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-5-copyright-410x160.png 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-5-copyright-500x195.png 500w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-5-copyright-400x156.png 400w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-5-copyright-32x12.png 32w" width={600} /> </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-d17636d sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="d17636d">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-6f0c780 sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="6f0c780" data-widget_type="image.default">
                                  <div className="elementor-widget-container">
                                    <img alt="" className="attachment-full size-full wp-image-27866" decoding="async" height={234} loading="lazy" sizes="(max-width: 600px) 100vw, 600px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-6-copyright.png" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-6-copyright.png 600w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-6-copyright-300x117.png 300w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-6-copyright-370x144.png 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-6-copyright-410x160.png 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-6-copyright-500x195.png 500w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-6-copyright-400x156.png 400w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-6-copyright-32x12.png 32w" width={600} /> </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-b3e23e6 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="b3e23e6">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-38039e4 sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="38039e4" data-widget_type="image.default">
                                  <div className="elementor-widget-container">
                                    <img alt="" className="attachment-full size-full wp-image-27867" decoding="async" height={234} loading="lazy" sizes="(max-width: 600px) 100vw, 600px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-7-copyright.png" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-7-copyright.png 600w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-7-copyright-300x117.png 300w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-7-copyright-370x144.png 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-7-copyright-410x160.png 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-7-copyright-500x195.png 500w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-7-copyright-400x156.png 400w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-7-copyright-32x12.png 32w" width={600} /> </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-f0937cc sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="f0937cc">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-c84d798 sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="c84d798" data-widget_type="image.default">
                                  <div className="elementor-widget-container">
                                    <img alt="" className="attachment-full size-full wp-image-27868" decoding="async" height={234} loading="lazy" sizes="(max-width: 600px) 100vw, 600px" src="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-8-copyright.png" srcSet="/assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-8-copyright.png 600w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-8-copyright-300x117.png 300w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-8-copyright-370x144.png 370w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-8-copyright-410x160.png 410w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-8-copyright-500x195.png 500w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-8-copyright-400x156.png 400w, /assets/soccerclub.axiomthemes.com/wp-content/uploads/2023/09/plate-partners-8-copyright-32x12.png 32w" width={600} /> </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-4f32361 elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="4f32361">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-9b7f4f7 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="9b7f4f7">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-4379225 sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id={4379225} data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-9250ba8 scheme_dark elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="9250ba8" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                          <div className="elementor-background-overlay" />
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-02aa043 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="02aa043">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-2e27243 sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="2e27243" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-057fb97 elementor-widget__width-initial elementor-widget-mobile__width-inherit animation_type_block sc_fly_static elementor-invisible elementor-widget elementor-widget-trx_sc_title" data-animation-type="block" data-element_type="widget" data-id="057fb97" data-settings="{&quot;_animation&quot;:&quot;soccerclub-fadeinright&quot;}" data-widget_type="trx_sc_title.default">
                                  <div className="elementor-widget-container">
                                    <div className="sc_title sc_title_default"><span className="sc_item_subtitle sc_title_subtitle sc_item_subtitle_above sc_item_title_style_default">bienvenido</span><h1 className="sc_item_title sc_title_title sc_item_title_style_default sc_item_title_tag"><span className="sc_item_title_text">¡Experimente la verdadera alegría de los juegos de fútbol profesional!</span></h1><div className="sc_item_button sc_button_wrap sc_item_button sc_item_button_default sc_item_button_size_normal sc_title_button"><a className="sc_button sc_button_default sc_button_size_normal sc_button_icon_left" href="/inscripcion"><span className="sc_button_text"><span className="sc_button_title">Inscríbete</span></span></a></div></div> </div>
                                </div>
                                <div className="elementor-element elementor-element-b39ddd2 sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="b39ddd2" data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-740fc33 elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="740fc33">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-4716ac6 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="4716ac6">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-a0e9643 sc_height_huge sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="a0e9643" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-0d9e15c elementor-view-stacked elementor-shape-circle sc_fly_static elementor-widget elementor-widget-icon" data-element_type="widget" data-id="0d9e15c" data-widget_type="icon.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-icon-wrapper">
                                      <div className="elementor-icon">
                                        <svg fill="none" height={22} viewBox="0 0 24 22" width={24} xmlns="http://www.w3.org/2000/svg"><path d="M15.8621 15.6886L23.4621 9.27158L0.662109 0.80957L9.20011 21.3096L14.3711 16.9386L17.5571 19.4976L15.8621 15.6886Z" fill="white" /><path d="M0.662109 0.80957L15.8621 15.6886L17.5621 19.5006L19.2621 12.8196L0.662109 0.80957Z" fill="#EDF2F2" /></svg> </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-29fd289 sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="29fd289" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-ff166c9 sc_fly_static elementor-widget elementor-widget-trx_sc_title" data-element_type="widget" data-id="ff166c9" data-widget_type="trx_sc_title.default">
                                  <div className="elementor-widget-container">
                                    <div className="sc_title sc_title_default"><h3 className="sc_item_title sc_title_title sc_align_center sc_item_title_style_default sc_item_title_tag"><span className="sc_item_title_text">Obtén las mejores historias de blogs <br />en tu bandeja de entrada!</span></h3></div> </div>
                                </div>
                                <div className="elementor-element elementor-element-a3a96f2 sc_fly_mc sc_layouts_hide_on_mobile elementor-widget elementor-widget-heading" data-element_type="widget" data-id="a3a96f2" data-widget_type="heading.default">
                                  <div className="elementor-widget-container">
                                    <h2 className="elementor-heading-title elementor-size-default">hoja informativa</h2> </div>
                                </div>
                                <div className="elementor-element elementor-element-868e8e2 sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="868e8e2" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-4c57363 elementor-widget__width-initial sc_fly_static elementor-widget elementor-widget-shortcode" data-element_type="widget" data-id="4c57363" data-widget_type="shortcode.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-shortcode"><form className="mc4wp-form mc4wp-form-461" data-id={461} data-name="Subscribe" id="style-7" method="post"><div className="mc4wp-form-fields"><input name="EMAIL" placeholder="Ingrese su dirección de correo electrónico" type="email" />
                                          <button>Suscribirse</button>
                                          <input name="i_agree_privacy_policy" required type="checkbox" defaultValue={1} /><label>Estoy de acuerdo con el <a href="/assets/soccerclub.axiomthemes.com/privacy-policy/index.html" target="_blank">política de privacidad</a>.</label></div><label style={{display: 'none'}}><input autoComplete="off" name="_mc4wp_honeypot" tabIndex={-1} type="text" defaultValue="" /></label><input name="_mc4wp_timestamp" type="hidden" defaultValue={1771296974} /><input name="_mc4wp_form_id" type="hidden" defaultValue={461} /><input name="_mc4wp_form_element_id" type="hidden" defaultValue="style-7" /><div className="mc4wp-response" /></form></div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-cd0ff29 sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="cd0ff29" data-widget_type="spacer.default">
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
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-a605069 elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="a605069">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-6b1d3b9 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="6b1d3b9">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-2d2a0f7 sc_fly_static elementor-widget elementor-widget-trx_widget_instagram" data-element_type="widget" data-id="2d2a0f7" data-widget_type="trx_widget_instagram.default">
                                  <div className="elementor-widget-container">
                                    <div className="widget_area sc_widget_instagram"><aside className="widget widget_instagram"><div className="widget_instagram_wrap widget_instagram_type_alter">
                                          <div className="widget_instagram_images widget_instagram_images_columns_6"><div className="widget_instagram_images_item_wrap trx_addons_inline_1074383333"><a className="widget_instagram_images_item widget_instagram_images_item_type_image" href="//soccerclub.axiomthemes.com/wp-content/uploads/2024/12/insta1-copyright-370x370.jpg" rel="magnific" title=""><img alt="" decoding="async" height={370} loading="lazy" src="//soccerclub.axiomthemes.com/wp-content/uploads/2024/12/insta1-copyright-370x370.jpg" width={370} /><span className="widget_instagram_images_item_counters"><span className="widget_instagram_images_item_counter_likes trx_addons_icon-heart">90</span><span className="widget_instagram_images_item_counter_comments trx_addons_icon-comment">57</span></span></a></div><div className="widget_instagram_images_item_wrap trx_addons_inline_2108297493"><a className="widget_instagram_images_item widget_instagram_images_item_type_image" href="//soccerclub.axiomthemes.com/wp-content/uploads/2024/12/insta2-copyright-370x370.jpg" rel="magnific" title=""><img alt="" decoding="async" height={370} loading="lazy" src="//soccerclub.axiomthemes.com/wp-content/uploads/2024/12/insta2-copyright-370x370.jpg" width={370} /><span className="widget_instagram_images_item_counters"><span className="widget_instagram_images_item_counter_likes trx_addons_icon-heart">5</span><span className="widget_instagram_images_item_counter_comments trx_addons_icon-comment">64</span></span></a></div><div className="widget_instagram_images_item_wrap trx_addons_inline_1353036442"><a className="widget_instagram_images_item widget_instagram_images_item_type_image" href="//soccerclub.axiomthemes.com/wp-content/uploads/2024/12/insta3-copyright-370x370.jpg" rel="magnific" title=""><img alt="" decoding="async" height={370} loading="lazy" src="//soccerclub.axiomthemes.com/wp-content/uploads/2024/12/insta3-copyright-370x370.jpg" width={370} /><span className="widget_instagram_images_item_counters"><span className="widget_instagram_images_item_counter_likes trx_addons_icon-heart">58</span><span className="widget_instagram_images_item_counter_comments trx_addons_icon-comment">16</span></span></a></div><div className="widget_instagram_images_item_wrap trx_addons_inline_1824083338"><a className="widget_instagram_images_item widget_instagram_images_item_type_image" href="//soccerclub.axiomthemes.com/wp-content/uploads/2024/12/insta4-copyright-370x370.jpg" rel="magnific" title=""><img alt="" decoding="async" height={370} loading="lazy" src="//soccerclub.axiomthemes.com/wp-content/uploads/2024/12/insta4-copyright-370x370.jpg" width={370} /><span className="widget_instagram_images_item_counters"><span className="widget_instagram_images_item_counter_likes trx_addons_icon-heart">25</span><span className="widget_instagram_images_item_counter_comments trx_addons_icon-comment">98</span></span></a></div><div className="widget_instagram_images_item_wrap trx_addons_inline_752427438"><a className="widget_instagram_images_item widget_instagram_images_item_type_image" href="//soccerclub.axiomthemes.com/wp-content/uploads/2024/12/insta5-copyright-370x370.jpg" rel="magnific" title=""><img alt="" decoding="async" height={370} loading="lazy" src="//soccerclub.axiomthemes.com/wp-content/uploads/2024/12/insta5-copyright-370x370.jpg" width={370} /><span className="widget_instagram_images_item_counters"><span className="widget_instagram_images_item_counter_likes trx_addons_icon-heart">50</span><span className="widget_instagram_images_item_counter_comments trx_addons_icon-comment">64</span></span></a></div><div className="widget_instagram_images_item_wrap trx_addons_inline_357026543"><a className="widget_instagram_images_item widget_instagram_images_item_type_image" href="//soccerclub.axiomthemes.com/wp-content/uploads/2024/12/insta6-copyright-370x370.jpg" rel="magnific" title=""><img alt="" decoding="async" height={370} loading="lazy" src="//soccerclub.axiomthemes.com/wp-content/uploads/2024/12/insta6-copyright-370x370.jpg" width={370} /><span className="widget_instagram_images_item_counters"><span className="widget_instagram_images_item_counter_likes trx_addons_icon-heart">43</span><span className="widget_instagram_images_item_counter_comments trx_addons_icon-comment">63</span></span></a></div></div><div className="widget_instagram_follow_link_wrap"><a className="widget_instagram_follow_link sc_button" href="#" rel="nofollow" target="_blank">Sígueme</a></div></div></aside></div> </div>
                                </div>
                                <div className="elementor-element elementor-element-99e5b73 sc_layouts_hide_on_wide sc_layouts_hide_on_desktop sc_layouts_hide_on_notebook sc_layouts_hide_on_tablet sc_layouts_hide_on_mobile sc_fly_static elementor-widget elementor-widget-shortcode" data-element_type="widget" data-id="99e5b73" data-widget_type="shortcode.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-shortcode">
                                      <div className="sbi sbi_mob_col_2 sbi_tab_col_6 sbi_col_6 sbi_width_resp feedOne" data-cols={6} data-colsmobile={2} data-colstablet={6} data-feedid="*1" data-imageaspectratio="1:1" data-item-padding={0} data-locatornonce="bba4de4df8" data-num={6} data-nummobile={6} data-postid={5002} data-res="auto" data-sbi-flags="favorLocal" data-shortcode-atts="{&quot;class&quot;:&quot;feedOne&quot;}" id="sb_instagram">
                                        <div id="sbi_images">
                                        </div>
                                        <div id="sbi_load">
                                          <span className="sbi_follow_btn sbi_custom">
                                            <a href="https://www.instagram.com/5553048828053195/" rel="nofollow noopener" style={{background: 'rgb(64,139,209)'}} target="_blank">
                                              <svg aria-hidden="true" aria-label="Instagram" className="svg-inline--fa fa-instagram fa-w-14" data-fa-processed data-icon="instagram" data-prefix="fab" role="img" viewBox="0 0 448 512">
                                                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" fill="currentColor" />
                                              </svg> <span>Instagram</span>
                                            </a>
                                          </span>
                                        </div>
                                        <span className="sbi_resized_image_data" data-feed-id="*1" data-resized="[]">
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
            <span className="soccerclub_skip_link_anchor" id="footer_skip_link_anchor" />
            <footer className="footer_wrap footer_custom footer_custom_8832 footer_custom_footer-professional-club scheme_light">
              <div className="elementor elementor-8832" data-elementor-id={8832} data-elementor-type="cpt_layouts">
                <section className="elementor-section elementor-top-section elementor-element elementor-element-ce69137 elementor-section-content-middle sc_layouts_row sc_layouts_row_type_compact elementor-reverse-mobile elementor-reverse-tablet elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="ce69137">
                  <div className="elementor-container elementor-column-gap-extended">
                    <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-5f21df9 sc-tablet_layouts_column_align_center sc_layouts_column sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="5f21df9">
                      <div className="elementor-widget-wrap elementor-element-populated">
                        <div className="sc_layouts_item elementor-element elementor-element-547b918 sc_fly_static elementor-widget elementor-widget-text-editor" data-element_type="widget" data-id="547b918" data-widget_type="text-editor.default">
                          <div className="elementor-widget-container">
                            © 2026 Jaguares F.C.								</div>
                        </div>
                      </div>
                    </div>
                    <div className="elementor-column elementor-col-50 elementor-top-column elementor-element elementor-element-bb1498b sc_layouts_column_align_center sc_layouts_column sc-mobile_layouts_column_align_center sc_layouts_column sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="bb1498b">
                      <div className="elementor-widget-wrap elementor-element-populated">
                        <div className="sc_layouts_item elementor-element elementor-element-2713c52 sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_menu" data-element_type="widget" data-id="2713c52" data-widget_type="trx_sc_layouts_menu.default">
                          <div className="elementor-widget-container">
                            <nav className="sc_layouts_menu sc_layouts_menu_default sc_layouts_menu_dir_horizontal menu_hover_zoom_line" data-animation-in="fadeIn" data-animation-out="fadeOut"><ul className="sc_layouts_menu_nav" id="sc_layouts_menu_394846634"><li className="menu-item current-menu-item"><a aria-current="page" href="/"><span>Inicio</span></a></li><li className="menu-item"><a href="/inscripcion"><span>Inscripción</span></a></li><li className="menu-item"><a href="/consulta"><span>Consultar Estado</span></a></li><li className="menu-item menu-item-has-children"><a href="#"><span>Intranet</span></a><ul className="sub-menu"><li className="menu-item"><a href="/admin-login"><span>Administración</span></a></li><li className="menu-item"><a href="/profesor-dashboard"><span>Docentes</span></a></li></ul></li></ul></nav> </div>
                        </div>
                      </div>
                    </div>
                    <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-c17642e sc_layouts_column_align_right sc_layouts_column sc-tablet_layouts_column_align_center sc_layouts_column sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="c17642e">
                      <div className="elementor-widget-wrap elementor-element-populated">
                        <div className="sc_layouts_item elementor-element elementor-element-099e0d5 sc_fly_static elementor-widget elementor-widget-trx_sc_socials" data-element_type="widget" data-id="099e0d5" data-widget_type="trx_sc_socials.default">
                          <div className="elementor-widget-container">
                            <div className="sc_socials modern_2 sc_socials_default sc_align_none"><div className="socials_wrap"><a className="social_item social_item_style_icons sc_icon_type_icons social_item_type_icons" href="https://www.facebook.com/Jaguarezdegalvez" rel="nofollow" target="_blank"><span className="social_icon social_icon_facebook-1" style={{}}><span className="screen-reader-text">facebook-1</span><span className="icon-facebook-1" /></span></a><a className="social_item social_item_style_icons sc_icon_type_icons social_item_type_icons" href="https://wa.me/51973324460" rel="nofollow" target="_blank"><span className="social_icon social_icon_whatsapp" style={{}}><span className="screen-reader-text">WhatsApp</span><span className="icon-whatsapp" /></span></a></div></div> </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </footer>
          </div>
        </div>
        <div className="sc_layouts_panel_hide_content" /><div className="sc_layouts scheme_dark sc_layouts_panel sc_layouts_4509 sc_layouts_panel_right sc_layouts_effect_slide trx_addons_inline_859887934" data-delay={0} data-panel-class="trx_addons_inline_859887934" data-panel-effect="slide" data-panel-position="right" id="popup-1"><div className="sc_layouts_panel_inner"> <div className="elementor elementor-4509" data-elementor-id={4509} data-elementor-type="cpt_layouts">
              <section className="elementor-section elementor-top-section elementor-element elementor-element-67b4187 elementor-section-height-full elementor-section-items-stretch elementor-section-content-space-between elementor-section-boxed elementor-section-height-default sc_fly_static" data-element_type="section" data-id="67b4187">
                <div className="elementor-container elementor-column-gap-extended">
                  <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-56dc68b6 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="56dc68b6">
                    <div className="elementor-widget-wrap elementor-element-populated">
                      <div className="elementor-element elementor-element-1c135e79 sc_fly_static elementor-widget elementor-widget-trx_sc_layouts_logo" data-element_type="widget" data-id="1c135e79" data-widget_type="trx_sc_layouts_logo.default">
                        <div className="elementor-widget-container">
                          <a className="sc_layouts_logo sc_layouts_logo_default trx_addons_inline_444433139" href="#"><img alt="Club de fútbol" className="logo_image" height={83} loading="lazy" src="/assets/logo.ico" width={64} style={{objectFit:"contain"}} /></a> </div>
                      </div>
                      <section className="elementor-section elementor-inner-section elementor-element elementor-element-9641a64 elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="9641a64">
                        <div className="elementor-container elementor-column-gap-extended">
                          <div className="elementor-column elementor-col-100 elementor-inner-column elementor-element elementor-element-7f1146e sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="7f1146e">
                            <div className="elementor-widget-wrap elementor-element-populated">
                              <div className="elementor-element elementor-element-38be0cc sc_fly_static elementor-widget elementor-widget-heading" data-element_type="widget" data-id="38be0cc" data-widget_type="heading.default">
                                <div className="elementor-widget-container">
                                  <h6 className="elementor-heading-title elementor-size-default">¿Tienes un proyecto?</h6> </div>
                              </div>
                              <div className="elementor-element elementor-element-03d84fa sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="03d84fa" data-widget_type="spacer.default">
                                <div className="elementor-widget-container">
                                  <div className="elementor-spacer">
                                    <div className="elementor-spacer-inner" />
                                  </div>
                                </div>
                              </div>
                              <div className="elementor-element elementor-element-433eecc elementor-widget__width-auto has-text-dark-color sc_fly_static elementor-widget elementor-widget-heading" data-element_type="widget" data-id="433eecc" data-widget_type="heading.default">
                                <div className="elementor-widget-container">
                                  <h5 className="elementor-heading-title elementor-size-default"><a href="/cdn-cgi/l/email-protection#640d0a020b240109050d084a070b09"><span className="__cf_email__" data-cfemail="5930373f36193c34383035773a3634">[correo electrónico protegido]</span></a></h5> </div>
                              </div>
                              <div className="elementor-element elementor-element-5b745d2 sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="5b745d2" data-widget_type="spacer.default">
                                <div className="elementor-widget-container">
                                  <div className="elementor-spacer">
                                    <div className="elementor-spacer-inner" />
                                  </div>
                                </div>
                              </div>
                              <div className="elementor-element elementor-element-0e42aa4 sc_fly_static elementor-widget elementor-widget-heading" data-element_type="widget" data-id="0e42aa4" data-widget_type="heading.default">
                                <div className="elementor-widget-container">
                                  <h6 className="elementor-heading-title elementor-size-default">¿Quieres unirte a nuestro equipo?</h6> </div>
                              </div>
                              <div className="elementor-element elementor-element-81494a2 sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="81494a2" data-widget_type="spacer.default">
                                <div className="elementor-widget-container">
                                  <div className="elementor-spacer">
                                    <div className="elementor-spacer-inner" />
                                  </div>
                                </div>
                              </div>
                              <div className="elementor-element elementor-element-03505c2 elementor-widget__width-auto has-text-dark-color sc_fly_static elementor-widget elementor-widget-heading" data-element_type="widget" data-id="03505c2" data-widget_type="heading.default">
                                <div className="elementor-widget-container">
                                  <h5 className="elementor-heading-title elementor-size-default"><a href="/consulta">Contáctenos <span className="icon-path-6190 has-text-link-color" style={{verticalAlign: 'middle', fontSize: 9, fontWeight: 400, marginLeft: 22}} /></a></h5> </div>
                              </div>
                              <div className="elementor-element elementor-element-31ff93d sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="31ff93d" data-widget_type="spacer.default">
                                <div className="elementor-widget-container">
                                  <div className="elementor-spacer">
                                    <div className="elementor-spacer-inner" />
                                  </div>
                                </div>
                              </div>
                              <div className="elementor-element elementor-element-8145589 sc_fly_static elementor-widget elementor-widget-heading" data-element_type="widget" data-id={8145589} data-widget_type="heading.default">
                                <div className="elementor-widget-container">
                                  <h6 className="elementor-heading-title elementor-size-default">¿Quieres comprar cosas?</h6> </div>
                              </div>
                              <div className="elementor-element elementor-element-6eb97a9 sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="6eb97a9" data-widget_type="spacer.default">
                                <div className="elementor-widget-container">
                                  <div className="elementor-spacer">
                                    <div className="elementor-spacer-inner" />
                                  </div>
                                </div>
                              </div>
                              <div className="elementor-element elementor-element-8d7dacf elementor-widget__width-auto has-text-dark-color sc_fly_static elementor-widget elementor-widget-heading" data-element_type="widget" data-id="8d7dacf" data-widget_type="heading.default">
                                <div className="elementor-widget-container">
                                  <h5 className="elementor-heading-title elementor-size-default"><a href="/inscripcion">Inscribirse ahora <span className="icon-path-6190 has-text-link-color" style={{verticalAlign: 'middle', fontSize: 9, fontWeight: 400, marginLeft: 22}} /></a></h5> </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                      <div className="elementor-element elementor-element-d4736d3 sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="d4736d3" data-widget_type="spacer.default">
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
            </div>
            <span className="sc_layouts_panel_close trx_addons_button_close" tabIndex={0}><span className="sc_layouts_panel_close_icon trx_addons_button_close_icon" /></span></div></div><div className="sc_layouts sc_layouts_popup sc_layouts_12962" data-delay={0} id="go-video"> <div className="elementor elementor-12962" data-elementor-id={12962} data-elementor-type="cpt_layouts">
            <section className="elementor-section elementor-top-section elementor-element elementor-element-cf4e536 elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="cf4e536">
              <div className="elementor-container elementor-column-gap-no">
                <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-e45dd90 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="e45dd90">
                  <div className="elementor-widget-wrap elementor-element-populated">
                    <div className="elementor-element elementor-element-eddc457 sc_fly_static elementor-widget elementor-widget-trx_widget_video" data-element_type="widget" data-id="eddc457" data-widget_type="trx_widget_video.default">
                      <div className="elementor-widget-container">
                        <div className="widget_area sc_widget_video"><aside className="widget widget_video"><div className="trx_addons_video_player without_cover" id="sc_video_226509540"><div className="video_embed video_frame"><iframe allow="autoplay" data-src="https://player.vimeo.com/video/175198021?h=&autoplay=1" height={726} width={1290} /></div></div></aside></div> </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div><a className="trx_addons_scroll_to_top trx_addons_icon-up scroll_to_top_style_default" href="#" title="Desplazarse hacia arriba" />
        <div className="adp-popup adp-popup-type-content adp-popup-location-center adp-preview-image-left adp-preview-image-no" data-body-scroll-disable="false" data-close-delay-number={30} data-close-scroll-position={10} data-close-scroll-type="%" data-close-trigger="none" data-esc-close="true" data-exit-animation="popupExitFade" data-f4-close="false" data-id={9110} data-light-close="false" data-limit-display={1} data-limit-lifetime={1} data-mobile-disable="false" data-open-animation="popupOpenFade" data-open-delay-number={25} data-open-manual-selector data-open-scroll-position={10} data-open-scroll-type="%" data-open-trigger="delay" data-overlay="true" data-overlay-close="false" style={{width: 1050}}>
          <div className="adp-popup-wrap">
            <div className="adp-popup-container">
              <div className="adp-popup-outer" style={{maxWidth: '100%'}}>
                <div className="adp-popup-content">
                  <div className="adp-popup-inner">
                    <div className="sc_layouts sc_layouts_default sc_layouts_7074" data-delay={0}> <div className="elementor elementor-7074" data-elementor-id={7074} data-elementor-type="cpt_layouts">
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-d394f72 elementor-section-full_width scheme_light elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="d394f72">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-50 elementor-top-column elementor-element elementor-element-91a3141 sc_layouts_hide_on_mobile sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="91a3141" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-637990e sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="637990e" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-50 elementor-top-column elementor-element elementor-element-48d3da0 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="48d3da0">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-9efa3b4 sc_fly_static elementor-widget elementor-widget-trx_sc_title" data-element_type="widget" data-id="9efa3b4" data-widget_type="trx_sc_title.default">
                                  <div className="elementor-widget-container">
                                    <div className="sc_title sc_title_default"><h2 className="sc_item_title sc_title_title sc_item_title_style_default"><span className="sc_item_title_text">¡Suscríbete para recibir las actualizaciones!</span></h2></div> </div>
                                </div>
                                <div className="elementor-element elementor-element-0f09534 sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="0f09534" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-5c0af5f sc_fly_static elementor-widget elementor-widget-shortcode" data-element_type="widget" data-id="5c0af5f" data-widget_type="shortcode.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-shortcode"><form className="mc4wp-form mc4wp-form-461" data-id={461} data-name="Subscribe" id="style-11" method="post"><div className="mc4wp-form-fields"><input name="EMAIL" placeholder="Ingrese su dirección de correo electrónico" type="email" />
                                          <button>Suscribirse</button>
                                          <input name="i_agree_privacy_policy" required type="checkbox" defaultValue={1} /><label>Estoy de acuerdo con el <a href="/assets/soccerclub.axiomthemes.com/privacy-policy/index.html" target="_blank">política de privacidad</a>.</label></div><label style={{display: 'none'}}><input autoComplete="off" name="_mc4wp_honeypot" tabIndex={-1} type="text" defaultValue="" /></label><input name="_mc4wp_timestamp" type="hidden" defaultValue={1771296974} /><input name="_mc4wp_form_id" type="hidden" defaultValue={461} /><input name="_mc4wp_form_element_id" type="hidden" defaultValue="style-11" /><div className="mc4wp-response" /></form></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div> </div>
                  <button className="adp-popup-close" type="button" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="adp-popup-overlay" />
        <div className="trx_addons_mouse_helper trx_addons_mouse_helper_base trx_addons_mouse_helper_style_default trx_addons_mouse_helper_smooth trx_addons_mouse_helper_centered" />

    </>
  );
}

