import React, { useState, useEffect, useCallback } from 'react';
import EditableText from './EditableText.jsx';

const slides = [
  {
    id: 1,
    sport: 'Fútbol',
    title: 'Forjando\ncampeones',
    subtitle: 'Academia de Fútbol',
    description: 'Entrenamiento profesional para todas las edades con metodología de alto rendimiento.',
    image: 'https://soccerclub.axiomthemes.com/wp-content/uploads/2024/10/slider_1-1-copyright.jpg',
    accent: '#E03821'
  },
  {
    id: 2,
    sport: 'Básquet',
    title: 'Alcanza nuevas\nalturas',
    subtitle: 'Programa Competitivo',
    description: 'Desarrolla técnica, estrategia y trabajo en equipo con nuestros entrenadores certificados.',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1920&q=80',
    accent: '#FF6B35'
  },
  {
    id: 3,
    sport: 'Vóley',
    title: 'Potencia tu\njuego en red',
    subtitle: 'Formación Integral',
    description: 'Perfecciona tu saque, remate y bloqueo con metodología de alto rendimiento.',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1920&q=80',
    accent: '#4ECDC4'
  },
  {
    id: 4,
    sport: 'Fútbol Femenino',
    title: 'El talento no\ntiene género',
    subtitle: 'Empoderamiento Deportivo',
    description: 'Programa exclusivo para desarrollar futbolistas de élite con pasión y determinación.',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80',
    accent: '#E91E8C'
  },
  {
    id: 5,
    sport: 'Funcional Mixto',
    title: 'Supera tus\nlímites',
    subtitle: 'Entrenamiento de Alto Impacto',
    description: 'Sesiones intensivas que combinan fuerza, resistencia y agilidad para todos los niveles.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80',
    accent: '#9B59B6'
  },
  {
    id: 6,
    sport: 'Mamas Fit',
    title: 'Bienestar y\nenergía',
    subtitle: 'Programa Especial Mamás',
    description: 'Rutinas diseñadas para mamás activas que buscan mantenerse en forma y saludables.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1920&q=80',
    accent: '#FF69B4'
  }
];

export default function HeroCarousel({ slidesData, onUpdateSlide }) {
  const activeSlides = slidesData ?? slides;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating, currentSlide]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % activeSlides.length);
  }, [currentSlide, goToSlide, activeSlides.length]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + activeSlides.length) % activeSlides.length);
  }, [currentSlide, goToSlide, activeSlides.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  const slide = activeSlides[currentSlide];

  return (
    <section 
      className="hero-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <style>{`
        .hero-carousel {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 600px;
          max-height: 980px;
          overflow: hidden;
          background: #0a0a0a;
        }

        .hero-carousel-slides {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .hero-carousel-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.7s ease-in-out;
        }

        .hero-carousel-slide.active {
          opacity: 1;
          z-index: 1;
        }

        .hero-carousel-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transform: scale(1);
          transition: transform 8s ease-out;
        }

        .hero-carousel-slide.active .hero-carousel-bg {
          transform: scale(1.08);
        }

        .hero-carousel-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(0,0,0,0.75) 0%,
            rgba(0,0,0,0.5) 40%,
            rgba(0,0,0,0.3) 100%
          );
        }

        .hero-carousel-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 70px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .hero-carousel-text {
          max-width: 650px;
          color: #fff;
        }

        .hero-carousel-subtitle {
          font-family: 'Inter Tight', sans-serif;
          font-size: 15px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 20px;
          color: #C59D5F;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          opacity: 0;
          transform: translateY(30px);
          animation: slideUp 0.8s ease forwards;
          animation-delay: 0.2s;
        }

        .hero-carousel-title {
          font-family: 'Inter Tight', sans-serif;
          font-size: clamp(42px, 6vw, 72px);
          font-weight: 600;
          line-height: 1.1;
          margin-bottom: 25px;
          white-space: pre-line;
          color: #fff;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
          opacity: 0;
          transform: translateY(40px);
          animation: slideUp 0.8s ease forwards;
          animation-delay: 0.35s;
        }

        .hero-carousel-description {
          font-family: 'DM Sans', sans-serif;
          font-size: 18px;
          line-height: 1.7;
          max-width: 420px;
          margin-bottom: 35px;
          color: rgba(255,255,255,0.9);
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          opacity: 0;
          transform: translateY(30px);
          animation: slideUp 0.8s ease forwards;
          animation-delay: 0.5s;
        }

        .hero-carousel-cta {
          display: inline-block;
          padding: 18px 50px;
          font-family: 'Inter Tight', sans-serif;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #1a1a1a;
          background: #C59D5F;
          border: none;
          border-radius: 100px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(30px);
          animation: slideUp 0.8s ease forwards;
          animation-delay: 0.65s;
        }

        .hero-carousel-cta:hover {
          background: #d4ac6e;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(197, 157, 95, 0.4);
        }

        .hero-carousel-buttons {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
          opacity: 0;
          transform: translateY(30px);
          animation: slideUp 0.8s ease forwards;
          animation-delay: 0.65s;
        }

        .hero-carousel-buttons .hero-carousel-cta {
          opacity: 1;
          transform: none;
          animation: none;
        }

        .hero-video-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 8px 20px 8px 8px;
          font-family: 'Inter Tight', sans-serif;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #fff;
          background: rgba(0,0,0,0.4);
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }

        .hero-video-btn:hover {
          border-color: #C59D5F;
          background: rgba(197, 157, 95, 0.2);
        }

        .hero-video-btn:hover .video-thumb-play {
          background: #C59D5F;
          transform: scale(1.1);
        }

        .video-thumb-container {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .video-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-thumb-play {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 28px;
          height: 28px;
          background: rgba(197, 157, 95, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .video-thumb-play svg {
          width: 12px;
          height: 12px;
          margin-left: 2px;
          color: #000;
        }

        .hero-video-btn-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.2;
        }

        .hero-video-btn-label {
          font-size: 10px;
          color: rgba(255,255,255,0.6);
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .hero-video-btn-title {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
        }

        /* Video Modal */
        .video-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.9);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        .video-modal-content {
          position: relative;
          width: 100%;
          max-width: 900px;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(0,0,0,0.5);
        }

        .video-modal-close {
          position: absolute;
          top: -50px;
          right: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .video-modal-close:hover {
          background: #C59D5F;
          color: #000;
        }

        .video-modal-close svg {
          width: 20px;
          height: 20px;
        }

        .video-modal-video {
          width: 100%;
          max-height: 80vh;
          display: block;
          background: #000;
        }

        /* Asegurar controles visibles */
        .video-modal-video::-webkit-media-controls {
          display: flex !important;
        }

        .video-modal-video::-webkit-media-controls-panel {
          display: flex !important;
        }

        @media (max-width: 768px) {
          .hero-carousel-buttons {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .hero-video-btn {
            padding: 6px 16px 6px 6px;
          }

          .video-thumb-container {
            width: 40px;
            height: 40px;
          }

          .video-thumb-play {
            width: 22px;
            height: 22px;
          }

          .video-thumb-play svg {
            width: 10px;
            height: 10px;
          }

          .hero-video-btn-label {
            font-size: 9px;
          }

          .hero-video-btn-title {
            font-size: 11px;
          }

          /* Modal video mobile */
          .video-modal-overlay {
            padding: 10px;
            align-items: flex-start;
            padding-top: 60px;
          }

          .video-modal-content {
            border-radius: 8px;
          }

          .video-modal-close {
            top: -45px;
            right: 5px;
            width: 36px;
            height: 36px;
          }

          .video-modal-video {
            max-height: 70vh;
          }
        }

        @media (max-width: 480px) {
          .video-modal-overlay {
            padding: 5px;
            padding-top: 50px;
          }

          .video-modal-close {
            top: -42px;
          }
        }

        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-carousel-sport-badge {
          position: absolute;
          top: 50%;
          right: 80px;
          transform: translateY(-50%);
          text-align: right;
          z-index: 3;
        }

        .hero-carousel-sport-name {
          font-family: 'Inter Tight', sans-serif;
          font-size: clamp(80px, 15vw, 180px);
          font-weight: 600;
          color: rgba(255,255,255,0.08);
          text-transform: uppercase;
          line-height: 0.9;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          opacity: 0;
          animation: fadeIn 1s ease forwards;
          animation-delay: 0.4s;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        .hero-carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          border: 2px solid rgba(197,157,95,0.5);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }

        .hero-carousel-nav:hover {
          background: #C59D5F;
          border-color: #C59D5F;
          color: #000;
        }

        .hero-carousel-nav.prev { left: 24px; }
        .hero-carousel-nav.next { right: 24px; }

        .hero-carousel-nav svg {
          width: 24px;
          height: 24px;
        }

        .hero-carousel-indicators {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 10;
        }

        .hero-carousel-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .hero-carousel-indicator:hover {
          background: rgba(255,255,255,0.6);
        }

        .hero-carousel-indicator.active {
          background: #C59D5F;
          border-color: #C59D5F;
          transform: scale(1.3);
        }

        .hero-carousel-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, #C59D5F, #E03821);
          z-index: 10;
          animation: progress 6s linear;
        }

        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        .hero-carousel-social {
          position: absolute;
          bottom: 35px;
          right: 70px;
          display: flex;
          gap: 8px;
          z-index: 10;
        }

        .hero-carousel-social a {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 18px;
          transition: all 0.3s ease;
          border-radius: 50%;
        }

        .hero-carousel-social a:hover {
          color: #C59D5F;
          transform: translateY(-3px);
        }

        .hero-carousel-scroll {
          position: absolute;
          bottom: 35px;
          left: 70px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          font-family: 'Inter Tight', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          z-index: 10;
          transition: color 0.3s ease;
        }

        .hero-carousel-scroll:hover {
          color: #C59D5F;
        }

        .hero-carousel-scroll-icon {
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-carousel-content {
            padding: 0 40px;
          }
          .hero-carousel-sport-badge {
            display: none;
          }
          .hero-carousel-nav {
            width: 48px;
            height: 48px;
          }
          .hero-carousel-nav.prev { left: 16px; }
          .hero-carousel-nav.next { right: 16px; }
        }

        @media (max-width: 768px) {
          .hero-carousel {
            min-height: 500px;
          }
          .hero-carousel-content {
            padding: 0 24px;
            padding-top: 80px;
          }
          .hero-carousel-text {
            max-width: 100%;
          }
          .hero-carousel-description {
            display: none;
          }
          .hero-carousel-nav {
            display: none;
          }
          .hero-carousel-social,
          .hero-carousel-scroll {
            display: none;
          }
          .hero-carousel-indicators {
            bottom: 24px;
          }
        }
      `}</style>

      {/* Preload de la primera imagen del hero para optimizar el LCP.
          El fondo se aplica como CSS background-image, así que el browser
          no lo prioriza por defecto — este <img> oculto lo fuerza. */}
      {activeSlides[0]?.image && (
        <img
          src={activeSlides[0].image}
          fetchpriority="high"
          loading="eager"
          decoding="sync"
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
        />
      )}

      <div className="hero-carousel-slides">
        {activeSlides.map((s, index) => (
          <div 
            key={s.id} 
            className={`hero-carousel-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <div
              className="hero-carousel-bg"
              style={{ backgroundImage: `url(${s.image})` }}
            />
            <div className="hero-carousel-overlay" />
          </div>
        ))}

        <div className="hero-carousel-content">
          <div className="hero-carousel-text" key={currentSlide}>
            <EditableText tag="div" className="hero-carousel-subtitle" value={slide.subtitle}
              onChange={onUpdateSlide ? v => onUpdateSlide(currentSlide, 'subtitle', v) : undefined}
              textStyle={slide.subtitleStyle || {}}
              onStyleChange={onUpdateSlide ? s => onUpdateSlide(currentSlide, 'subtitleStyle', s) : undefined} />
            <EditableText tag="h1" className="hero-carousel-title" value={slide.title} multiline
              onChange={onUpdateSlide ? v => onUpdateSlide(currentSlide, 'title', v) : undefined}
              textStyle={slide.titleStyle || {}}
              onStyleChange={onUpdateSlide ? s => onUpdateSlide(currentSlide, 'titleStyle', s) : undefined} />
            <EditableText tag="p" className="hero-carousel-description" value={slide.description} multiline
              onChange={onUpdateSlide ? v => onUpdateSlide(currentSlide, 'description', v) : undefined}
              textStyle={slide.descriptionStyle || {}}
              onStyleChange={onUpdateSlide ? s => onUpdateSlide(currentSlide, 'descriptionStyle', s) : undefined} />
            <div className="hero-carousel-buttons">
              <a href="/inscripcion" className="hero-carousel-cta">
                ¡Inscríbete Ahora!
              </a>
              <button className="hero-video-btn" onClick={() => setShowVideoModal(true)}>
                <div className="video-thumb-container">
                  <video className="video-thumb-img" src="/assets/video.mp4#t=1" muted preload="metadata" />
                  <div className="video-thumb-play">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="hero-video-btn-text">
                  <span className="hero-video-btn-label">Video</span>
                  <span className="hero-video-btn-title">Guía de Inscripción</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="hero-carousel-sport-badge" key={`badge-${currentSlide}`}>
          <EditableText tag="div" className="hero-carousel-sport-name" value={slide.sport}
            onChange={onUpdateSlide ? v => onUpdateSlide(currentSlide, 'sport', v) : undefined}
            textStyle={slide.sportStyle || {}}
            onStyleChange={onUpdateSlide ? s => onUpdateSlide(currentSlide, 'sportStyle', s) : undefined} />
        </div>
      </div>

      {/* Navigation Arrows */}
      <button className="hero-carousel-nav prev" onClick={prevSlide} aria-label="Anterior">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button className="hero-carousel-nav next" onClick={nextSlide} aria-label="Siguiente">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="hero-carousel-indicators">
        {activeSlides.map((s, index) => (
          <button
            key={s.id}
            className={`hero-carousel-indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Ir a ${s.sport}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div 
        className="hero-carousel-progress" 
        key={`progress-${currentSlide}`}
        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
      />

      {/* Social Links */}
      <div className="hero-carousel-social">
        <a href="https://www.facebook.com/Jaguarezdegalvez" target="_blank" rel="noopener noreferrer">
          <span className="icon-facebook-1" />
        </a>
        <a href="https://wa.me/51973324460" target="_blank" rel="noopener noreferrer">
          <span className="icon-whatsapp" />
        </a>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-carousel-scroll" onClick={() => window.scrollBy({ top: window.innerHeight - 100, behavior: 'smooth' })}>
        <span className="hero-carousel-scroll-icon">
          <svg width="13" height="18" viewBox="0 0 13 18" fill="currentColor">
            <path d="M6.5 0L0 6.5h4.5V18h4V6.5H13L6.5 0z" transform="rotate(180 6.5 9)" />
          </svg>
        </span>
        Desplácese hacia abajo
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="video-modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setShowVideoModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <video 
              className="video-modal-video" 
              controls
              controlsList="nodownload"
              autoPlay
              playsInline
              preload="auto"
              src="/assets/video.mp4"
            >
              Tu navegador no soporta video HTML5.
            </video>
          </div>
        </div>
      )}
    </section>
  );
}
