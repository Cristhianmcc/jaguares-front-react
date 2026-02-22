import React, { useEffect, useState } from 'react';
import { HOME_INLINE_STYLES } from './homeInlineStyles.js';
import HeroCarousel from '../components/HeroCarousel.jsx';
import RankingSection from '../components/RankingSection.jsx';
import DeportesSection from '../components/DeportesSection.jsx';

export default function Home() {
  const [showVideoModal, setShowVideoModal] = useState(false);

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
                  <span className="menu_mobile_close menu_button_close" tabIndex={0}><span className="menu_button_close_text">Cerrar</span><span className="menu_button_close_icon" /></span>
                </div>
                <div className="menu_mobile_content_wrap content_wrap">
                  <div className="menu_mobile_content_wrap_inner"><nav className="menu_mobile_nav_area"><ul className="menu_mobile_nav" id="mobile-menu_mobile"><li className="menu-item current-menu-item"><a href="/"><span>Inicio</span></a></li><li className="menu-item"><a href="/inscripcion"><span>Inscripción</span></a></li><li className="menu-item"><a href="/consulta"><span>Consultar Estado</span></a></li><li className="menu-item menu-item-has-children"><a href="#"><span>Intranet</span></a><ul className="sub-menu"><li className="menu-item"><a href="/admin-login"><span>Administración</span></a></li><li className="menu-item"><a href="/profesor-dashboard"><span>Docentes</span></a></li></ul></li></ul></nav><div className="socials_mobile"><a className="social_item social_item_style_icons sc_icon_type_icons social_item_type_icons" href="https://www.facebook.com/Jaguarezdegalvez" rel="nofollow" target="_blank"><span className="social_icon social_icon_facebook-1" style={{}}><span className="screen-reader-text">facebook-1</span><span className="icon-facebook-1" /></span></a><a className="social_item social_item_style_icons sc_icon_type_icons social_item_type_icons" href="https://wa.me/51973324460" rel="nofollow" target="_blank"><span className="social_icon social_icon_whatsapp" style={{}}><span className="screen-reader-text">WhatsApp</span><span className="icon-whatsapp" /></span></a></div> </div>
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
                        {/* Sección de Deportes de Jaguares */}
                        <DeportesSection />

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

                        {/* Ranking Section */}
                        <RankingSection />

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
                                      <a className="elementor-button elementor-button-link elementor-size-sm" href="#" onClick={(e) => { e.preventDefault(); setShowVideoModal(true); }}>
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
                                    <div className="sc_title sc_title_default"><span className="sc_item_subtitle sc_title_subtitle sc_align_center sc_item_subtitle_above sc_item_title_style_default">DOCENTES JAGUARES</span><h1 className="sc_item_title sc_title_title sc_align_center sc_item_title_style_default sc_item_title_tag"><span className="sc_item_title_text">Nuestro Staff Técnico</span></h1></div> </div>
                                </div>
                                <div className="elementor-element elementor-element-1a8f16e sc_height_small sc_fly_static elementor-widget elementor-widget-spacer" data-element_type="widget" data-id="1a8f16e" data-widget_type="spacer.default">
                                  <div className="elementor-widget-container">
                                    <div className="elementor-spacer">
                                      <div className="elementor-spacer-inner" />
                                    </div>
                                  </div>
                                </div>
                                <div className="elementor-element elementor-element-6859e74 animation_type_block sc_fly_static elementor-widget elementor-widget-trx_sc_team" data-animation-type="block" data-element_type="widget" data-id="6859e74" data-widget_type="trx_sc_team.default">
                                  <div className="elementor-widget-container">
                                    <div className="docentes-grid-container">
                                      <div className="docentes-grid">
                                        {/* Leonardo - Fútbol */}
                                        <div className="docente-card">
                                          <div className="docente-image">
                                            <img alt="Leonardo" src="/assets/Leonardo - Profesores Jaguares 2026-2.jpg.jpeg" />
                                          </div>
                                          <div className="docente-info">
                                            <h4 className="docente-name">Leonardo</h4>
                                            <span className="docente-specialty">Fútbol</span>
                                          </div>
                                        </div>
                                        {/* Oscar - Básquet */}
                                        <div className="docente-card">
                                          <div className="docente-image">
                                            <img alt="Oscar" src="/assets/Oscar - Profesores Jaguares 2026-3.jpg.jpeg" />
                                          </div>
                                          <div className="docente-info">
                                            <h4 className="docente-name">Oscar</h4>
                                            <span className="docente-specialty">Fútbol</span>
                                          </div>
                                        </div>
                                        {/* Phaterson - Funcional */}
                                        <div className="docente-card">
                                          <div className="docente-image">
                                            <img alt="Phaterson" src="/assets/Phaterson - Profesores Jaguares 2026-4.jpg.jpeg" />
                                          </div>
                                          <div className="docente-info">
                                            <h4 className="docente-name">Phaterson</h4>
                                            <span className="docente-specialty">Fútbol</span>
                                          </div>
                                        </div>
                                        {/* Rafael - Vóley */}
                                        <div className="docente-card">
                                          <div className="docente-image">
                                            <img alt="Rafael" src="/assets/Rafael - Profesores Jaguares 2026.jpg.jpeg" />
                                          </div>
                                          <div className="docente-info">
                                            <h4 className="docente-name">Rafael</h4>
                                            <span className="docente-specialty">Fútbol</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
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
                                    <div className="sc_title sc_title_default"><span className="sc_item_subtitle sc_title_subtitle sc_align_center sc_item_subtitle_above sc_item_title_style_default">Academia Jaguares</span><h1 className="sc_item_title sc_title_title sc_align_center sc_item_title_style_default sc_item_title_tag"><span className="sc_item_title_text">Últimas Novedades</span></h1></div> </div>
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
                                          <div className="slides slider-wrapper swiper-wrapper sc_item_columns_3"><div className="slider-slide swiper-slide"><div className="sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic sc_blogger_item_odd sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_no_excerpt sc_blogger_item_image_position_top post-19532 post type-post status-publish format-standard has-post-thumbnail hentry category-clubs tag-news tag-player tag-soccer tag-sports" data-item-number={1} data-post-id={19532}><div className="sc_blogger_item_body"><div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured"><img alt="Inscripciones Abiertas 2026" className="attachment-soccerclub-thumb-square size-soccerclub-thumb-square wp-post-image" decoding="async" height={664} loading="lazy" src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=890&h=664&q=80" width={890} /> <div className="mask" />
                                                    <a aria-hidden="true" className="link" href="/inscripcion" />
                                                  </div><div className="sc_blogger_item_content entry-content"><div className="post_meta sc_blogger_item_meta post_meta_categories"><span className="post_meta_item post_categories cat_sep"><a href="/inscripcion" rel="category tag">Inscripciones</a></span></div><h5 className="sc_blogger_item_title entry-title" data-item-number={1}><a href="/inscripcion" rel="bookmark">¡Inscripciones abiertas para el período 2026!</a></h5><div className="post_meta sc_blogger_item_meta post_meta"><span className="post_meta_item post_date"><a href="/inscripcion">15 de febrero de 2026</a></span><a className="post_meta_item post_meta_comments icon-comment-light" href="/inscripcion"><span className="post_meta_number">24</span><span className="post_meta_label">Comentarios</span></a></div></div></div></div></div><div className="slider-slide swiper-slide"><div className="sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic sc_blogger_item_even sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_no_excerpt sc_blogger_item_image_position_top post-19530 post type-post status-publish format-standard has-post-thumbnail hentry category-clubs tag-news tag-player tag-soccer tag-sports" data-item-number={2} data-post-id={19530}><div className="sc_blogger_item_body"><div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured"><img alt="Campeonato Regional" className="attachment-soccerclub-thumb-square size-soccerclub-thumb-square wp-post-image" decoding="async" height={664} loading="lazy" src="https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=890&h=664&q=80" width={890} /> <div className="mask" />
                                                    <a aria-hidden="true" className="link" href="#" />
                                                  </div><div className="sc_blogger_item_content entry-content"><div className="post_meta sc_blogger_item_meta post_meta_categories"><span className="post_meta_item post_categories cat_sep"><a href="#" rel="category tag">Torneos</a></span></div><h5 className="sc_blogger_item_title entry-title" data-item-number={2}><a href="#" rel="bookmark">Categoría Sub-12 clasifica al Campeonato Regional</a></h5><div className="post_meta sc_blogger_item_meta post_meta"><span className="post_meta_item post_date"><a href="#">10 de febrero de 2026</a></span><a className="post_meta_item post_meta_comments icon-comment-light" href="#"><span className="post_meta_number">18</span><span className="post_meta_label">Comentarios</span></a></div></div></div></div></div><div className="slider-slide swiper-slide"><div className="sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic sc_blogger_item_odd sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_no_excerpt sc_blogger_item_image_position_top post-19528 post type-post status-publish format-standard has-post-thumbnail hentry category-clubs tag-news tag-player tag-soccer tag-sports" data-item-number={3} data-post-id={19528}><div className="sc_blogger_item_body"><div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured"><img alt="Nuevos Entrenadores" className="attachment-soccerclub-thumb-square size-soccerclub-thumb-square wp-post-image" decoding="async" height={664} loading="lazy" src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=890&h=664&q=80" width={890} /> <div className="mask" />
                                                    <a aria-hidden="true" className="link" href="#" />
                                                  </div><div className="sc_blogger_item_content entry-content"><div className="post_meta sc_blogger_item_meta post_meta_categories"><span className="post_meta_item post_categories cat_sep"><a href="#" rel="category tag">Staff</a></span></div><h5 className="sc_blogger_item_title entry-title" data-item-number={3}><a href="#" rel="bookmark">Bienvenida a nuestros nuevos entrenadores certificados</a></h5><div className="post_meta sc_blogger_item_meta post_meta"><span className="post_meta_item post_date"><a href="#">5 de febrero de 2026</a></span><a className="post_meta_item post_meta_comments icon-comment-light" href="#"><span className="post_meta_number">12</span><span className="post_meta_label">Comentarios</span></a></div></div></div></div></div><div className="slider-slide swiper-slide"><div className="sc_blogger_item sc_item_container post_container sc_blogger_item_default sc_blogger_item_default_classic sc_blogger_item_even sc_blogger_item_align_none post_format_standard sc_blogger_item_with_image sc_blogger_item_no_excerpt sc_blogger_item_image_position_top post-19525 post type-post status-publish format-standard has-post-thumbnail hentry category-clubs tag-news tag-player tag-soccer tag-sports" data-item-number={4} data-post-id={19525}><div className="sc_blogger_item_body"><div className="post_featured with_thumb hover_link sc_item_featured sc_blogger_item_featured"><img alt="Clases de Funcional" className="attachment-soccerclub-thumb-square size-soccerclub-thumb-square wp-post-image" decoding="async" height={664} loading="lazy" src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=890&h=664&q=80" width={890} /> <div className="mask" />
                                                    <a aria-hidden="true" className="link" href="#" />
                                                  </div><div className="sc_blogger_item_content entry-content"><div className="post_meta sc_blogger_item_meta post_meta_categories"><span className="post_meta_item post_categories cat_sep"><a href="#" rel="category tag">Programas</a></span></div><h5 className="sc_blogger_item_title entry-title" data-item-number={4}><a href="#" rel="bookmark">Nuevos horarios de Entrenamiento Funcional Mixto</a></h5><div className="post_meta sc_blogger_item_meta post_meta"><span className="post_meta_item post_date"><a href="#">1 de febrero de 2026</a></span><a className="post_meta_item post_meta_comments icon-comment-light" href="#"><span className="post_meta_number">8</span><span className="post_meta_label">Comentarios</span></a></div></div></div></div></div></div></div><div className="slider_pagination_wrap swiper-pagination" /></div></div> </div>
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
                                  <div className="elementor-widget-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
                                    <svg viewBox="0 0 100 35" style={{ width: '120px', height: '50px', opacity: 0.4 }}>
                                      <text x="50" y="25" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="24" fontWeight="bold" fill="#333">NIKE</text>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-327311a sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="327311a">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-b231dba sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="b231dba" data-widget_type="image.default">
                                  <div className="elementor-widget-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
                                    <svg viewBox="0 0 120 35" style={{ width: '120px', height: '50px', opacity: 0.4 }}>
                                      <text x="60" y="25" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="20" fontWeight="bold" fill="#333">ADIDAS</text>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-7b9c35c sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="7b9c35c">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-d39c438 sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="d39c438" data-widget_type="image.default">
                                  <div className="elementor-widget-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
                                    <svg viewBox="0 0 100 35" style={{ width: '120px', height: '50px', opacity: 0.4 }}>
                                      <text x="50" y="25" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="22" fontWeight="bold" fill="#333">PUMA</text>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-d2b5fbf sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="d2b5fbf">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-113cf48 sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="113cf48" data-widget_type="image.default">
                                  <div className="elementor-widget-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
                                    <svg viewBox="0 0 120 35" style={{ width: '120px', height: '50px', opacity: 0.4 }}>
                                      <text x="60" y="25" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="20" fontWeight="bold" fill="#333">REEBOK</text>
                                    </svg>
                                  </div>
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
                                  <div className="elementor-widget-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
                                    <svg viewBox="0 0 160 35" style={{ width: '140px', height: '50px', opacity: 0.4 }}>
                                      <text x="80" y="25" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="16" fontWeight="bold" fill="#333">NEW BALANCE</text>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-d17636d sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="d17636d">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-6f0c780 sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="6f0c780" data-widget_type="image.default">
                                  <div className="elementor-widget-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
                                    <svg viewBox="0 0 120 35" style={{ width: '120px', height: '50px', opacity: 0.4 }}>
                                      <text x="60" y="25" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="20" fontWeight="bold" fill="#333">UMBRO</text>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-b3e23e6 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="b3e23e6">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-38039e4 sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="38039e4" data-widget_type="image.default">
                                  <div className="elementor-widget-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
                                    <svg viewBox="0 0 180 35" style={{ width: '160px', height: '50px', opacity: 0.4 }}>
                                      <text x="90" y="25" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="14" fontWeight="bold" fill="#333">UNDER ARMOUR</text>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-f0937cc sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="f0937cc">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-c84d798 sc_fly_static elementor-widget elementor-widget-image" data-element_type="widget" data-id="c84d798" data-widget_type="image.default">
                                  <div className="elementor-widget-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
                                    <svg viewBox="0 0 120 35" style={{ width: '120px', height: '50px', opacity: 0.4 }}>
                                      <text x="60" y="25" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="20" fontWeight="bold" fill="#333">MIZUNO</text>
                                    </svg>
                                  </div>
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
                                    <div className="sc_title sc_title_default"><span className="sc_item_subtitle sc_title_subtitle sc_item_subtitle_above sc_item_title_style_default">bienvenido</span><h1 className="sc_item_title sc_title_title sc_item_title_style_default sc_item_title_tag"><span className="sc_item_title_text">¡Experimente la verdadera alegría de los juegos de fútbol profesional!</span></h1><div className="sc_item_button sc_button_wrap sc_item_button sc_item_button_default sc_item_button_size_normal sc_title_button"><a className="sc_button sc_button_default sc_button_size_normal sc_button_icon_left" href="/inscripcion" style={{ backgroundColor: '#C59D5F', borderColor: '#C59D5F', color: '#fff' }}><span className="sc_button_text"><span className="sc_button_title">Inscríbete</span></span></a></div></div> </div>
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
                        {/* Spacer between sections */}
                        <div style={{ height: '80px' }}></div>
                        <section className="elementor-section elementor-top-section elementor-element elementor-element-a605069 elementor-section-boxed elementor-section-height-default elementor-section-height-default sc_fly_static" data-element_type="section" data-id="a605069">
                          <div className="elementor-container elementor-column-gap-extended">
                            <div className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-6b1d3b9 sc_content_align_inherit sc_layouts_column_icons_position_left sc_fly_static" data-element_type="column" data-id="6b1d3b9">
                              <div className="elementor-widget-wrap elementor-element-populated">
                                <div className="elementor-element elementor-element-2d2a0f7 sc_fly_static elementor-widget elementor-widget-trx_widget_instagram" data-element_type="widget" data-id="2d2a0f7" data-widget_type="trx_widget_instagram.default">
                                  <div className="elementor-widget-container">
                                    <div className="widget_area sc_widget_instagram"><aside className="widget widget_instagram"><div className="widget_instagram_wrap widget_instagram_type_alter">
                                          <div className="widget_instagram_images widget_instagram_images_columns_6">
                                            <div className="widget_instagram_images_item_wrap trx_addons_inline_1074383333">
                                              <a className="widget_instagram_images_item widget_instagram_images_item_type_image" href="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800" rel="magnific" title="Entrenamiento de fútbol">
                                                <img alt="Entrenamiento de fútbol" decoding="async" height={370} loading="lazy" src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=370&h=370&fit=crop" width={370} style={{objectFit: 'cover'}} />
                                              </a>
                                            </div>
                                            <div className="widget_instagram_images_item_wrap trx_addons_inline_2108297493">
                                              <a className="widget_instagram_images_item widget_instagram_images_item_type_image" href="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800" rel="magnific" title="Niños jugando fútbol">
                                                <img alt="Niños jugando fútbol" decoding="async" height={370} loading="lazy" src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=370&h=370&fit=crop" width={370} style={{objectFit: 'cover'}} />
                                              </a>
                                            </div>
                                            <div className="widget_instagram_images_item_wrap trx_addons_inline_1353036442">
                                              <a className="widget_instagram_images_item widget_instagram_images_item_type_image" href="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800" rel="magnific" title="Equipo de fútbol">
                                                <img alt="Equipo de fútbol" decoding="async" height={370} loading="lazy" src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=370&h=370&fit=crop" width={370} style={{objectFit: 'cover'}} />
                                              </a>
                                            </div>
                                            <div className="widget_instagram_images_item_wrap trx_addons_inline_1824083338">
                                              <a className="widget_instagram_images_item widget_instagram_images_item_type_image" href="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800" rel="magnific" title="Copa de campeones">
                                                <img alt="Copa de campeones" decoding="async" height={370} loading="lazy" src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=370&h=370&fit=crop" width={370} style={{objectFit: 'cover'}} />
                                              </a>
                                            </div>
                                            <div className="widget_instagram_images_item_wrap trx_addons_inline_752427438">
                                              <a className="widget_instagram_images_item widget_instagram_images_item_type_image" href="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800" rel="magnific" title="Partido de fútbol">
                                                <img alt="Partido de fútbol" decoding="async" height={370} loading="lazy" src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=370&h=370&fit=crop" width={370} style={{objectFit: 'cover'}} />
                                              </a>
                                            </div>
                                            <div className="widget_instagram_images_item_wrap trx_addons_inline_357026543">
                                              <a className="widget_instagram_images_item widget_instagram_images_item_type_image" href="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800" rel="magnific" title="Niños celebrando">
                                                <img alt="Niños celebrando" decoding="async" height={370} loading="lazy" src="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=370&h=370&fit=crop" width={370} style={{objectFit: 'cover'}} />
                                              </a>
                                            </div>
                                          </div>
                                          <div className="widget_instagram_follow_link_wrap">
                                            <a className="widget_instagram_follow_link sc_button" href="https://www.facebook.com/Jaguarezdegalvez" rel="noopener noreferrer" target="_blank" style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
                                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                              Síguenos en Facebook
                                            </a>
                                          </div>
                                        </div></aside></div> </div>
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

        {/* Modal de Video de Inscripción */}
        {showVideoModal && (
          <div 
            className="video-modal-overlay"
            onClick={() => setShowVideoModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '20px'
            }}
          >
            <div 
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '900px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideoModal(false)}
                style={{
                  position: 'absolute',
                  top: '-45px',
                  right: '0',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '32px',
                  cursor: 'pointer',
                  padding: '5px 10px',
                  zIndex: 10
                }}
              >
                ×
              </button>
              <video
                src="/assets/video.mp4"
                controls
                autoPlay
                playsInline
                controlsList="nodownload"
                style={{
                  width: '100%',
                  maxHeight: '80vh',
                  borderRadius: '8px',
                  background: '#000'
                }}
              />
            </div>
          </div>
        )}

    </>
  );
}

