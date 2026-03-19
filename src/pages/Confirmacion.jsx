import React, { useEffect } from 'react';
import '../styles/confirmacion.css';
import '../styles/animations.css';

const html = `
    <div class="relative flex min-h-screen w-full flex-col group/design-root">
        <header class="sticky top-0 z-50 border-b border-solid border-b-[#e5e0d6] dark:border-b-[#333] bg-white/95 dark:bg-[#111]/95 backdrop-blur-sm shadow-sm">
            <div class="px-4 md:px-10 py-3">
                <div class="flex items-center justify-between">
                    <!-- Logo centrado en móvil -->
                    <div class="flex items-center gap-3 flex-1 justify-center lg:justify-start">
                        <img src="assets/logo.ico" alt="Logo Jaguares" class="h-10 w-auto object-contain">
                        <h2 class="text-xl lg:text-2xl font-black uppercase tracking-wider text-black dark:text-white">JAGUARES</h2>
                    </div>
                    
                    <!-- Botón hamburguesa -->
                    <button id="mobile-menu-btn" class="lg:hidden p-2 text-secondary dark:text-white hover:text-primary transition-colors" aria-label="Menú">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                    
                    <!-- Navegación desktop -->
                    <div class="hidden lg:flex flex-1 justify-end gap-8">
                        <div class="flex items-center gap-9">
                            <a class="text-secondary dark:text-gray-300 text-sm font-semibold leading-normal hover:text-primary transition-colors uppercase tracking-wide" href="/">Inicio</a>
                            <a class="text-secondary dark:text-gray-300 text-sm font-semibold leading-normal hover:text-primary transition-colors uppercase tracking-wide" href="#">Nosotros</a>
                            <a class="text-secondary dark:text-gray-300 text-sm font-semibold leading-normal hover:text-primary transition-colors uppercase tracking-wide" href="#">Inscripciones</a>
                        </div>
                    </div>
                </div>
                
                <!-- Menú móvil -->
                <div id="mobile-menu" class="hidden lg:hidden mt-4 pb-2 space-y-3 border-t border-[#e5e0d6] dark:border-[#333] pt-4">
                    <a class="block text-secondary dark:text-white hover:text-primary text-base font-semibold uppercase tracking-wide transition-colors py-2" href="/">Inicio</a>
                    <a class="block text-secondary dark:text-white hover:text-primary text-base font-semibold uppercase tracking-wide transition-colors py-2" href="#">Nosotros</a>
                    <a class="block text-secondary dark:text-white hover:text-primary text-base font-semibold uppercase tracking-wide transition-colors py-2" href="#">Inscripciones</a>
                </div>
            </div>
        </header>

        <main class="layout-container flex h-full grow flex-col">
            <div class="px-4 md:px-8 lg:px-12 xl:px-20 flex flex-1 justify-center py-8">
                <div class="layout-content-container flex flex-col max-w-[1280px] flex-1">
                    <div class="flex flex-col gap-3 p-4 mb-8">
                        <div class="flex gap-6 justify-between items-center">
                            <p class="text-secondary dark:text-gray-300 text-sm font-bold uppercase tracking-widest">Paso 3 de 3</p>
                            <span class="text-xs font-black text-primary tracking-widest uppercase bg-secondary px-3 py-1 rounded">Confirmación Final</span>
                        </div>
                        <div class="rounded-full bg-[#e5e0d6] dark:bg-[#333] overflow-hidden h-1.5">
                            <div class="h-full rounded-full bg-primary shadow-[0_0_12px_rgba(234,88,12,0.25)]" style="width: 100%;"></div>
                        </div>
                    </div>

                    <div class="flex flex-wrap justify-between gap-3 px-4 mb-4">
                        <div class="flex min-w-72 flex-col gap-2">
                            <h1 class="text-secondary dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] uppercase">
                                Confirma tu <span class="gold-text-gradient">Inscripción</span>
                            </h1>
                            <p class="text-zinc-600 dark:text-gray-400 text-lg font-medium leading-normal max-w-2xl">
                                Estás a un paso de formar parte de la élite. Revisa tus datos antes de finalizar.
                            </p>
                        </div>
                    </div>

                    <div id="contenidoConfirmacion" class="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
                        <!-- Se llenaráá dinámicamente -->
                    </div>

                    <div class="flex justify-between items-center px-4 py-6 border-t border-gray-200 dark:border-gray-800 mt-8">
                        <button onclick="volverHorarios()" class="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                            <span class="material-symbols-outlined">arrow_back</span>
                            <span class="font-bold text-sm uppercase">Volver</span>
                        </button>

                        <button id="btnConfirmarInscripcion" onclick="confirmarInscripcion()" class="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all shadow-lg shadow-primary/25">
                            <span>Confirmar y Finalizar</span>
                            <span class="material-symbols-outlined">check_circle</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>

    
    
    
`;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.defer = false;
    script.dataset.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export default function Confirmacion() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');

    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 font-sans confirmacion-readable overflow-x-hidden transition-colors duration-200';

    let cancelled = false;

    (async () => {
      try {
        await loadScript('/legacy/api-service.js?v=3');
        await loadScript('/legacy/confirmacion.js?v=3');
        await loadScript('/legacy/mobile-menu.js?v=3');
        if (typeof window.cargarDatosConfirmacion === 'function') {
          window.cargarDatosConfirmacion();
        }
      } catch (err) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <div className="page-root" dangerouslySetInnerHTML={{ __html: html }} />;
}






