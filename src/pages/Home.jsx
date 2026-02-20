import React, { useEffect } from 'react';
import '../styles/index-new.css';
import '../styles/animations.css';

const html = `
  <!-- NAVBAR -->
  <nav class="navbar dark-nav" id="navbar">
    <div class="navbar-container">
      <div class="navbar-content">
        <!-- Logo -->
        <div class="logo">
          <div class="logo-icon">
            <span>J</span>
          </div>
          <div class="logo-text">
            <span class="logo-title">JAGUARES</span>
            <span class="logo-subtitle">Alto Rendimiento</span>
          </div>
        </div>

        <!-- Desktop Menu -->
        <div class="nav-links">
          <a href="#" class="nav-link">Inicio</a>
          <a href="#servicios" class="nav-link">Deportes</a>
          <a href="#ranking" class="nav-link">Ranking</a>
          <a href="#docentes" class="nav-link">Docentes</a>
          <a href="#galeria" class="nav-link">Galería</a>
          <a href="/consulta" class="nav-link">Consultar Inscripción</a>
          
          <button class="dark-toggle" id="darkToggle" title="Cambiar tema">
            <svg id="sunIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="m4.93 4.93 1.41 1.41"></path>
              <path d="m17.66 17.66 1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="m6.34 17.66-1.41 1.41"></path>
              <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
            <svg id="moonIcon" style="display: none;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          </button>

          <a href="/admin-login" class="btn-intranet">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Intranet</span>
          </a>
        </div>

        <!-- Mobile Button -->
        <div class="mobile-buttons">
          <button class="dark-toggle" id="darkToggleMobile" title="Cambiar tema">
            <svg class="sun-icon-mobile" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="m4.93 4.93 1.41 1.41"></path>
              <path d="m17.66 17.66 1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="m6.34 17.66-1.41 1.41"></path>
              <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
            <svg class="moon-icon-mobile" style="display: none;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          </button>
          <button id="mobileMenuBtn" style="color: white;">
            <svg id="MenuIcon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
            <svg id="closeIcon" style="display: none;" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
      <div class="mobile-menu-content">
        <a href="#" class="mobile-link">Inicio</a>
        <a href="#servicios" class="mobile-link">Deportes</a>
        <a href="#ranking" class="mobile-link">Ranking</a>
        <a href="#docentes" class="mobile-link">Docentes</a>
        <a href="#galeria" class="mobile-link">Galería</a>
        <a href="/consulta" class="mobile-link">Consultar Inscripción</a>
        <a href="/admin-login" class="mobile-cta">Acceso Intranet</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-slider" id="heroSlider">
      <!-- Slide 1 -->
      <div class="hero-slide active" data-index="0">
        <div class="hero-bg" style="background-image: url('https://images.unsplash.com/photo-1730652128205-f5e98e542786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzb2NjZXIlMjBwbGF5ZXIlMjBraWNraW5nJTIwYmFsbCUyMHN0YWRpdW0lMjBuaWdodHxlbnwxfHx8fDE3NzA5NTM1NDJ8MA&ixlib=rb-4.1.0&q=80&w=1920');">
          <div class="hero-overlay-top"></div>
          <div class="hero-overlay-left"></div>
        </div>
        <div class="hero-content">
          <div class="hero-text">
            <div class="hero-category">
              <span>DEPORTE REY</span>
            </div>
            <h1 class="hero-title">FÚTBOL PRO</h1>
            <p class="hero-subtitle">Domina el campo con técnica y pasión</p>
            <div class="hero-buttons">
              <a href="/inscripcion" class="btn-primary">
                Inscríbete Ahora
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
              <a href="#servicios" class="btn-secondary">Ver Programas</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide 2 -->
      <div class="hero-slide" data-index="1">
        <div class="hero-bg" style="background-image: url('https://images.unsplash.com/photo-1758549782328-962b2459c9e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwcGxheWVyJTIwYWN0aW9uJTIwZHJhbWF0aWMlMjBsaWdodGluZ3xlbnwxfHx8fDE3NzA5NTM1NDJ8MA&ixlib=rb-4.1.0&q=80&w=1920');">
          <div class="hero-overlay-top"></div>
          <div class="hero-overlay-left"></div>
        </div>
        <div class="hero-content">
          <div class="hero-text">
            <div class="hero-category">
              <span>ALTO RENDIMIENTO</span>
            </div>
            <h1 class="hero-title">BASKETBALL</h1>
            <p class="hero-subtitle">Alcanza nuevas alturas en cada salto</p>
            <div class="hero-buttons">
              <a href="/inscripcion" class="btn-primary">
                Inscríbete Ahora
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
              <a href="#servicios" class="btn-secondary">Ver Programas</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide 3 -->
      <div class="hero-slide" data-index="2">
        <div class="hero-bg" style="background-image: url('https://images.unsplash.com/photo-1765109393692-39ae599577fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2xsZXliYWxsJTIwbWF0Y2glMjBwcm9mZXNzaW9uYWwlMjBjb3VydCUyMGFjdGlvbnxlbnwxfHx8fDE3NzA5NTM1NDJ8MA&ixlib=rb-4.1.0&q=80&w=1920');">
          <div class="hero-overlay-top"></div>
          <div class="hero-overlay-left"></div>
        </div>
        <div class="hero-content">
          <div class="hero-text">
            <div class="hero-category">
              <span>COMPETICIÓN</span>
            </div>
            <h1 class="hero-title">VOLEY DE ÉLITE</h1>
            <p class="hero-subtitle">Potencia, estrategia y trabajo en equipo</p>
            <div class="hero-buttons">
              <a href="/inscripcion" class="btn-primary">
                Inscríbete Ahora
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
              <a href="#servicios" class="btn-secondary">Ver Programas</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide 4 -->
      <div class="hero-slide" data-index="3">
        <div class="hero-bg" style="background-image: url('https://images.unsplash.com/photo-1662549905044-e3f71c293989?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGZpdG5lc3MlMjBncm91cCUyMGV4ZXJjaXNlJTIwaGFwcHl8ZW58MXx8fHwxNzcwOTUzNTQyfDA&ixlib=rb-4.1.0&q=80&w=1920');">
          <div class="hero-overlay-top"></div>
          <div class="hero-overlay-left"></div>
        </div>
        <div class="hero-content">
          <div class="hero-text">
            <div class="hero-category">
              <span>BIENESTAR</span>
            </div>
            <h1 class="hero-title">MAMAS FIT</h1>
            <p class="hero-subtitle">Tu mejor versión empieza aquí</p>
            <div class="hero-buttons">
              <a href="/inscripcion" class="btn-primary">
                Inscríbete Ahora
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
              <a href="#servicios" class="btn-secondary">Ver Programas</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide 5 -->
      <div class="hero-slide" data-index="4">
        <div class="hero-bg" style="background-image: url('https://images.unsplash.com/photo-1758875569440-4abefff43277?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9zc2ZpdCUyMGZ1bmN0aW9uYWwlMjB0cmFpbmluZyUyMHJvcGVzJTIwaW50ZW5zZXxlbnwxfHx8fDE3NzA5NTM1NDJ8MA&ixlib=rb-4.1.0&q=80&w=1920');">
          <div class="hero-overlay-top"></div>
          <div class="hero-overlay-left"></div>
        </div>
        <div class="hero-content">
          <div class="hero-text">
            <div class="hero-category">
              <span>FUERZA Y RESISTENCIA</span>
            </div>
            <h1 class="hero-title">CROSS TRAINING</h1>
            <p class="hero-subtitle">Supera tus límites cada día</p>
            <div class="hero-buttons">
              <a href="/inscripcion" class="btn-primary">
                Inscríbete Ahora
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
              <a href="#servicios" class="btn-secondary">Ver Programas</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide 6 -->
      <div class="hero-slide" data-index="5">
        <div class="hero-bg" style="background-image: url('https://images.unsplash.com/photo-1693214674451-2111f7690877?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBneW0lMjB3ZWlnaHQlMjByb29tJTIwZGFya3xlbnwxfHx8fDE3NzA5NTM1NDl8MA&ixlib=rb-4.1.0&q=80&w=1920');">
          <div class="hero-overlay-top"></div>
          <div class="hero-overlay-left"></div>
        </div>
        <div class="hero-content">
          <div class="hero-text">
            <div class="hero-category">
              <span>INFRAESTRUCTURA</span>
            </div>
            <h1 class="hero-title">GIMNASIO FUNCIONAL</h1>
            <p class="hero-subtitle">Equipamiento de primera para resultados reales</p>
            <div class="hero-buttons">
              <a href="/inscripcion" class="btn-primary">
                Inscríbete Ahora
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
              <a href="#servicios" class="btn-secondary">Ver Programas</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dots -->
    <div class="hero-dots" id="heroDots">
      <div class="hero-dot active" data-slide="0"></div>
      <div class="hero-dot" data-slide="1"></div>
      <div class="hero-dot" data-slide="2"></div>
      <div class="hero-dot" data-slide="3"></div>
      <div class="hero-dot" data-slide="4"></div>
      <div class="hero-dot" data-slide="5"></div>
    </div>

    <!-- Decoration -->
    <div class="hero-decoration">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </section>

  <!-- RANKING -->
  <section id="ranking" class="ranking">
    <div class="ranking-bg-decoration"></div>
    <div class="ranking-container">
      <div class="ranking-header">
        <div class="ranking-badge fade-in">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C59D5F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
          <span>Excelencia Deportiva</span>
        </div>
        <h2 class="ranking-title fade-in">RANKING JAGUARES</h2>
        <p class="ranking-description fade-in">
          Reconocemos el esfuerzo, disciplina y rendimiento de nuestros mejores alumnos. 
          El puntaje es otorgado semanalmente por nuestro cuerpo técnico.
        </p>
      </div>

      <!-- Podium -->
      <div class="podium" id="podium-container">
        <!-- Silver - 2nd Place -->
        <div class="podium-silver-wrapper fade-in" style="transition-delay: 0.2s;" id="podium-silver">
          <div class="podium-card silver">
            <div class="podium-position silver">2</div>
            <div class="podium-avatar silver">
              <img id="podium-silver-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23374151'/%3E%3Ccircle cx='50' cy='35' r='18' fill='%236B7280'/%3E%3Cellipse cx='50' cy='80' rx='30' ry='22' fill='%236B7280'/%3E%3C/svg%3E" alt="2do lugar" referrerpolicy="no-referrer">
            </div>
            <h3 class="podium-name silver" id="podium-silver-name">Cargando...</h3>
            <p class="podium-sport" id="podium-silver-sport">-</p>
            <div class="podium-score">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#C0C0C0" stroke="#C0C0C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span id="podium-silver-score">-</span>
            </div>
          </div>
        </div>

        <!-- Gold - 1st Place -->
        <div class="podium-gold-wrapper fade-in" id="podium-gold">
          <div class="podium-card gold">
            <div class="podium-inner">
              <div class="podium-position gold">1</div>
              <div class="podium-avatar gold">
                <img id="podium-gold-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23374151'/%3E%3Ccircle cx='50' cy='35' r='18' fill='%236B7280'/%3E%3Cellipse cx='50' cy='80' rx='30' ry='22' fill='%236B7280'/%3E%3C/svg%3E" alt="1er lugar" referrerpolicy="no-referrer">
              </div>
              <h3 class="podium-name gold" id="podium-gold-name">Cargando...</h3>
              <p class="podium-sport gold" id="podium-gold-sport">-</p>
              <div class="podium-score gold">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                </svg>
                <span id="podium-gold-score">-</span>
              </div>
              <p class="podium-score-label">Puntaje Global</p>
            </div>
          </div>
        </div>

        <!-- Bronze - 3rd Place -->
        <div class="podium-bronze-wrapper fade-in" style="transition-delay: 0.3s;" id="podium-bronze">
          <div class="podium-card bronze">
            <div class="podium-position bronze">3</div>
            <div class="podium-avatar bronze">
              <img id="podium-bronze-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23374151'/%3E%3Ccircle cx='50' cy='35' r='18' fill='%236B7280'/%3E%3Cellipse cx='50' cy='80' rx='30' ry='22' fill='%236B7280'/%3E%3C/svg%3E" alt="3er lugar" referrerpolicy="no-referrer">
            </div>
            <h3 class="podium-name bronze" id="podium-bronze-name">Cargando...</h3>
            <p class="podium-sport" id="podium-bronze-sport">-</p>
            <div class="podium-score">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#CD7F32" stroke="#CD7F32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span id="podium-bronze-score">-</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ranking List -->
      <div class="ranking-list fade-in">
        <div class="ranking-list-header">
          <div style="text-align: center;">Pos</div>
          <div>Alumno</div>
          <div>Disciplina</div>
          <div class="hide-mobile" style="text-align: right;">Puntos</div>
          <div class="hide-mobile" style="text-align: center;">Score</div>
        </div>
        
        <!-- Dynamic ranking rows loaded from API -->
        <div id="ranking-list-body">
          <div class="ranking-row" style="text-align: center; padding: 2rem;">
            <span>Cargando ranking...</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SERVICES -->
  <section id="servicios" class="services">
    <div class="services-container">
      <div class="services-header">
        <div class="services-header-left">
          <span class="services-label">Nuestras Disciplinas</span>
          <h2 class="services-title fade-in">
            FORMAMOS <span class="highlight">CAMPEONES</span>
          </h2>
        </div>
        <a href="#" class="services-view-all">
          Ver todías las disciplinas
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </a>
      </div>

      <div class="services-grid">
        <div class="service-card fade-in" style="transition-delay: 0s;">
          <div class="service-card-bg">
            <img src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Fútbol Formativo">
          </div>
          <div class="service-card-overlay"></div>
          <div class="service-card-content">
            <div class="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <h3 class="service-card-title">Fútbol Formativo</h3>
            <p class="service-card-description">Desarrollo técnico y táctico para futuras estrellas.</p>
            <div class="service-card-line"></div>
          </div>
        </div>

        <div class="service-card fade-in" style="transition-delay: 0.1s;">
          <div class="service-card-bg">
            <img src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Voley Competitivo">
          </div>
          <div class="service-card-overlay"></div>
          <div class="service-card-content">
            <div class="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 class="service-card-title">Voley Competitivo</h3>
            <p class="service-card-description">Entrenamiento de alto nivel para ligas regionales y nacionales.</p>
            <div class="service-card-line"></div>
          </div>
        </div>

        <div class="service-card fade-in" style="transition-delay: 0.2s;">
          <div class="service-card-bg">
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gym & Funcional">
          </div>
          <div class="service-card-overlay"></div>
          <div class="service-card-content">
            <div class="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m6.5 6.5 11 11"></path>
                <path d="m21 21-1-1"></path>
                <path d="m3 3 1 1"></path>
                <path d="m18 22 4-4"></path>
                <path d="m2 6 4-4"></path>
                <path d="m3 10 7-7"></path>
                <path d="m14 21 7-7"></path>
              </svg>
            </div>
            <h3 class="service-card-title">Gym & Funcional</h3>
            <p class="service-card-description">Instalaciones modernas y equipamiento profesional.</p>
            <div class="service-card-line"></div>
          </div>
        </div>

        <div class="service-card fade-in" style="transition-delay: 0.3s;">
          <div class="service-card-bg">
            <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Mamas Fit">
          </div>
          <div class="service-card-overlay"></div>
          <div class="service-card-content">
            <div class="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
            </div>
            <h3 class="service-card-title">Mamas Fit</h3>
            <p class="service-card-description">Programa especializado para recuperar fuerza y energía.</p>
            <div class="service-card-line"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TEACHERS -->
  <section id="docentes" class="teachers">
    <div class="teachers-container">
      <div class="teachers-header">
        <span class="teachers-label">Nuestro Equipo</span>
        <h2 class="teachers-title fade-in">PROFESIONALES DE ÉLITE</h2>
        <div class="teachers-divider"></div>
      </div>

      <div class="teachers-grid">
        <div class="teacher-card scale-in" style="transition-delay: 0s;">
          <div class="teacher-image-container">
            <img src="https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Carlos Méndez">
            <div class="teacher-image-overlay"></div>
            <div class="teacher-socials">
              <button class="teacher-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </button>
              <button class="teacher-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </button>
              <button class="teacher-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </button>
            </div>
          </div>
          <div class="teacher-info">
            <div class="teacher-badge">Staff</div>
            <h3 class="teacher-name">Carlos Méndez</h3>
            <p class="teacher-role">Director Técnico Fútbol</p>
            <p class="teacher-bio">Ex-jugador profesional con 15 años de experiencia formando talentos.</p>
          </div>
        </div>

        <div class="teacher-card scale-in" style="transition-delay: 0.1s;">
          <div class="teacher-image-container">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Laura Gutiérrez">
            <div class="teacher-image-overlay"></div>
            <div class="teacher-socials">
              <button class="teacher-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </button>
              <button class="teacher-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </button>
              <button class="teacher-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </button>
            </div>
          </div>
          <div class="teacher-info">
            <div class="teacher-badge">Staff</div>
            <h3 class="teacher-name">Laura Gutiérrez</h3>
            <p class="teacher-role">Head Coach Voley</p>
            <p class="teacher-bio">Entrenadora de selección nacional, especialista en táctica defensiva.</p>
          </div>
        </div>

        <div class="teacher-card scale-in" style="transition-delay: 0.2s;">
          <div class="teacher-image-container">
            <img src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Marcos Silva">
            <div class="teacher-image-overlay"></div>
            <div class="teacher-socials">
              <button class="teacher-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </button>
              <button class="teacher-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </button>
              <button class="teacher-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </button>
            </div>
          </div>
          <div class="teacher-info">
            <div class="teacher-badge">Staff</div>
            <h3 class="teacher-name">Marcos Silva</h3>
            <p class="teacher-role">Entrenador Físico</p>
            <p class="teacher-bio">Especialista en alto rendimiento y recuperación muscular.</p>
          </div>
        </div>

        <div class="teacher-card scale-in" style="transition-delay: 0.3s;">
          <div class="teacher-image-container">
            <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Ana Beltrán">
            <div class="teacher-image-overlay"></div>
            <div class="teacher-socials">
              <button class="teacher-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </button>
              <button class="teacher-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </button>
              <button class="teacher-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </button>
            </div>
          </div>
          <div class="teacher-info">
            <div class="teacher-badge">Staff</div>
            <h3 class="teacher-name">Ana Beltrán</h3>
            <p class="teacher-role">Coach Mamas Fit</p>
            <p class="teacher-bio">Certificada en fitness postnatal y nutrición deportiva.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- GALLERY -->
  <section id="galeria" class="gallery">
    <div class="gallery-container">
      <div class="gallery-header">
        <div class="gallery-header-left">
          <span class="gallery-label">Galería</span>
          <h2 class="gallery-title fade-in">JAGUARES EN ACCIÓN</h2>
        </div>
        <p class="gallery-header-right">
          Momentos que definen nuestra pasión. Entrenamiento, competición y camaradería.
        </p>
      </div>

      <div class="gallery-grid">
        <div class="gallery-item fade-in" style="transition-delay: 0s;">
          <img src="https://images.unsplash.com/photo-1526676037777-05a232554f77?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gallery 1">
          <div class="gallery-item-overlay">
            <span class="gallery-item-btn">Ver Zoom</span>
          </div>
        </div>
        
        <div class="gallery-item fade-in" style="transition-delay: 0.1s;">
          <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gallery 2">
          <div class="gallery-item-overlay">
            <span class="gallery-item-btn">Ver Zoom</span>
          </div>
        </div>
        
        <div class="gallery-item fade-in" style="transition-delay: 0.2s;">
          <img src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gallery 3">
          <div class="gallery-item-overlay">
            <span class="gallery-item-btn">Ver Zoom</span>
          </div>
        </div>
        
        <div class="gallery-item fade-in" style="transition-delay: 0.3s;">
          <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gallery 4">
          <div class="gallery-item-overlay">
            <span class="gallery-item-btn">Ver Zoom</span>
          </div>
        </div>
        
        <div class="gallery-item fade-in" style="transition-delay: 0.4s;">
          <img src="https://images.unsplash.com/photo-1606335543042-57c525922933?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gallery 5">
          <div class="gallery-item-overlay">
            <span class="gallery-item-btn">Ver Zoom</span>
          </div>
        </div>
        
        <div class="gallery-item fade-in" style="transition-delay: 0.5s;">
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gallery 6">
          <div class="gallery-item-overlay">
            <span class="gallery-item-btn">Ver Zoom</span>
          </div>
        </div>
        
        <div class="gallery-item fade-in" style="transition-delay: 0.6s;">
          <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gallery 7">
          <div class="gallery-item-overlay">
            <span class="gallery-item-btn">Ver Zoom</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-grid">
        <!-- Brand Info -->
        <div class="footer-brand">
          <div class="logo">
            <div class="logo-icon">
              <span>J</span>
            </div>
            <span class="footer-brand-name">JAGUARES</span>
          </div>
          <p class="footer-description">
            Centro de Alto Rendimiento deportivo comprometido con la formación integral de atletas. 
            Disciplina, pasión y excelencia son nuestros pilares.
          </p>
          <div class="footer-socials">
            <a href="#" class="footer-social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" class="footer-social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" class="footer-social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="footer-section-title">Enlaces</h3>
          <div class="footer-links">
            <a href="#" class="footer-link">Inicio</a>
            <a href="#servicios" class="footer-link">Disciplinas</a>
            <a href="#ranking" class="footer-link">Ranking</a>
            <a href="#docentes" class="footer-link">Staff Técnico</a>
            <a href="/consulta" class="footer-link">Consultar Inscripción</a>
          </div>
        </div>

        <!-- Disciplines -->
        <div>
          <h3 class="footer-section-title">Deportes</h3>
          <div class="footer-links">
            <a href="#" class="footer-link">Fútbol</a>
            <a href="#" class="footer-link">Basketball</a>
            <a href="#" class="footer-link">Voleibol</a>
            <a href="#" class="footer-link">Mamas Fit</a>
            <a href="#" class="footer-link">Cross Training</a>
          </div>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="footer-section-title">Contacto</h3>
          <div class="footer-contact-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>Av. del Deporte 123, Ciudad Deportiva, CP 12345</span>
          </div>
          <div class="footer-contact-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>+51 999 888 777</span>
          </div>
          <div class="footer-contact-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <span>contacto@jaguares.edu</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-copyright">
          © 2024 JAGUARES Centro de Alto Rendimiento. Todos los derechos reservados.
        </p>
        <div class="footer-legal">
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </div>
  </footer>

  
`;

export default function Home() {
  useEffect(() => {
    document.body.classList.add('dark');
    document.body.classList.remove('light');

    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const MenuIcon = document.getElementById('MenuIcon');
    const closeIcon = document.getElementById('closeIcon');

    const onScroll = () => {
      if (!navbar) return;
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll);

    const onMobileToggle = () => {
      if (!mobileMenu || !MenuIcon || !closeIcon) return;
      mobileMenu.classList.toggle('open');
      MenuIcon.style.display = mobileMenu.classList.contains('open') ? 'none' : 'block';
      closeIcon.style.display = mobileMenu.classList.contains('open') ? 'block' : 'none';
    };
    mobileMenuBtn?.addEventListener('click', onMobileToggle);

    const onMobileLinkClick = () => {
      if (!mobileMenu || !MenuIcon || !closeIcon) return;
      mobileMenu.classList.remove('open');
      MenuIcon.style.display = 'block';
      closeIcon.style.display = 'none';
    };
    const mobileLinks = document.querySelectorAll('.mobile-link');
    mobileLinks.forEach((link) => link.addEventListener('click', onMobileLinkClick));

    const darkToggle = document.getElementById('darkToggle');
    const darkToggleMobile = document.getElementById('darkToggleMobile');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    const sunIconMobile = document.querySelector('.sun-icon-mobile');
    const moonIconMobile = document.querySelector('.moon-icon-mobile');
    let isDarkMode = true;

    const toggleDarkMode = () => {
      isDarkMode = !isDarkMode;
      document.body.classList.toggle('dark', isDarkMode);
      document.body.classList.toggle('light', !isDarkMode);
      navbar?.classList.toggle('dark-nav', isDarkMode);
      navbar?.classList.toggle('light-nav', !isDarkMode);

      if (sunIcon) sunIcon.style.display = isDarkMode ? 'block' : 'none';
      if (moonIcon) moonIcon.style.display = isDarkMode ? 'none' : 'block';
      if (sunIconMobile) sunIconMobile.style.display = isDarkMode ? 'block' : 'none';
      if (moonIconMobile) moonIconMobile.style.display = isDarkMode ? 'none' : 'block';

      if (mobileMenuBtn) mobileMenuBtn.style.color = isDarkMode ? 'white' : 'black';
      document.documentElement.style.setProperty('--scrollbar-track', isDarkMode ? '#1a1a1a' : '#f1f1f1');
    };

    darkToggle?.addEventListener('click', toggleDarkMode);
    darkToggleMobile?.addEventListener('click', toggleDarkMode);

    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    let currentSlide = 0;
    let autoplayInterval;

    const goToSlide = (index) => {
      slides.forEach((slide) => slide.classList.remove('active'));
      dots.forEach((dot) => dot.classList.remove('active'));
      if (slides[index]) slides[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
      currentSlide = index;
    };

    const nextSlide = () => {
      if (!slides.length) return;
      const next = (currentSlide + 1) % slides.length;
      goToSlide(next);
    };

    const startAutoplay = () => {
      if (!slides.length) return;
      autoplayInterval = setInterval(nextSlide, 5000);
    };

    const resetAutoplay = () => {
      if (!autoplayInterval) return;
      clearInterval(autoplayInterval);
      startAutoplay();
    };

    const dotHandlers = [];
    dots.forEach((dot, index) => {
      const handler = () => {
        goToSlide(index);
        resetAutoplay();
      };
      dotHandlers.push({ dot, handler });
      dot.addEventListener('click', handler);
    });

    if (slides.length) {
      goToSlide(0);
      startAutoplay();
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .fade-in-left, .scale-in').forEach((el) => {
      observer.observe(el);
    });

    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3002'
      : '';

    async function cargarRanking() {
      try {
        const response = await fetch(`${API_BASE}/api/public/ranking`);
        const data = await response.json();

        if (!data.success || !data.ranking || data.ranking.length === 0) {
          mostrarMensajeVacio();
          return;
        }

        const ranking = data.ranking;

        if (ranking[0]) actualizarPodio('gold', ranking[0], 1);
        if (ranking[1]) actualizarPodio('silver', ranking[1], 2);
        if (ranking[2]) actualizarPodio('bronze', ranking[2], 3);

        const restantes = ranking.slice(3);
        actualizarListaRanking(restantes);
      } catch (error) {
        console.error('Error cargando ranking:', error);
        mostrarMensajeVacio();
      }
    }

    function actualizarPodio(tipo, alumno, posicion) {
      const img = document.getElementById(`podium-${tipo}-img`);
      const name = document.getElementById(`podium-${tipo}-name`);
      const sport = document.getElementById(`podium-${tipo}-sport`);
      const score = document.getElementById(`podium-${tipo}-score`);

      const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23374151'/%3E%3Ccircle cx='50' cy='35' r='18' fill='%236B7280'/%3E%3Cellipse cx='50' cy='80' rx='30' ry='22' fill='%236B7280'/%3E%3C/svg%3E";
      if (img) {
        img.referrerPolicy = 'no-referrer';
        img.src = alumno.foto_url || defaultAvatar;
      }
      if (name) name.textContent = alumno.nombre_completo || alumno.nombre_corto || 'Sin nombre';
      if (sport) sport.textContent = alumno.deporte || '-';
      if (score) score.textContent = alumno.puntaje_global || alumno.puntos || '-';
    }

    function actualizarListaRanking(ranking) {
      const container = document.getElementById('ranking-list-body');
      if (!container) return;

      if (ranking.length === 0) {
        container.innerHTML = '<div class="ranking-row" style="text-align: center; padding: 2rem;"><span>No hay más participantes</span></div>';
        return;
      }

      container.innerHTML = ranking.map((alumno, index) => {
        const posicion = index + 4;
        const delay = (index * 0.05).toFixed(2);
        const nombre = alumno.nombre_completo || alumno.nombre_corto || 'Sin nombre';
        const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23374151'/%3E%3Ccircle cx='50' cy='35' r='18' fill='%236B7280'/%3E%3Cellipse cx='50' cy='80' rx='30' ry='22' fill='%236B7280'/%3E%3C/svg%3E";
        const imgUrl = alumno.foto_url || defaultAvatar;
        return `
          <div class="ranking-row fade-in-left visible" style="transition-delay: ${delay}s;">
            <div class="ranking-pos"><span>${posicion}</span></div>
            <div class="ranking-student">
              <img src="${imgUrl}" alt="${nombre}" referrerpolicy="no-referrer">
              <span>${nombre}</span>
            </div>
            <div class="ranking-discipline"><span>${alumno.deporte || '-'}</span></div>
            <div class="ranking-points">${alumno.puntos_asistencia || alumno.puntos || 0} pts</div>
            <div class="ranking-score">${alumno.puntaje_global || alumno.puntos || '-'}</div>
          </div>
        `;
      }).join('');
    }

    function mostrarMensajeVacio() {
      const podioContainer = document.getElementById('podium-container');
      if (podioContainer) podioContainer.style.display = 'none';

      const container = document.getElementById('ranking-list-body');
      if (container) {
        container.innerHTML = '<div class="ranking-row" style="text-align: center; padding: 2rem;"><span>No hay datos de ranking disponibles</span></div>';
      }
    }

    cargarRanking();

    return () => {
      window.removeEventListener('scroll', onScroll);
      mobileMenuBtn?.removeEventListener('click', onMobileToggle);
      mobileLinks.forEach((link) => link.removeEventListener('click', onMobileLinkClick));
      darkToggle?.removeEventListener('click', toggleDarkMode);
      darkToggleMobile?.removeEventListener('click', toggleDarkMode);
      dotHandlers.forEach(({ dot, handler }) => dot.removeEventListener('click', handler));
      if (autoplayInterval) clearInterval(autoplayInterval);
      observer.disconnect();
    };
  }, []);

  return <div className="page-root" dangerouslySetInnerHTML={{ __html: html }} />;
}







