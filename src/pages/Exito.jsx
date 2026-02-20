import React, { useEffect } from 'react';
import '../styles/animations.css';

const html = `
    <div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <header class="sticky top-0 z-50 border-b border-solid border-b-[#e5e5e5] dark:border-b-white/10 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
            <div class="px-4 py-3 lg:px-10">
                <div class="flex items-center justify-between">
                    <!-- Logo centrado en móvil -->
                    <div class="flex items-center gap-4 flex-1 justify-center lg:justify-start">
                        <img src="assets/logo.ico" alt="Logo Jaguares" class="h-12 w-auto object-contain">
                        <h2 class="text-xl lg:text-2xl font-black italic uppercase tracking-wider text-black dark:text-white">JAGUARES</h2>
                    </div>
                    
                    <!-- Botón hamburguesa -->
                    <button id="mobile-menu-btn" class="lg:hidden p-2 text-text-main dark:text-white hover:text-primary transition-colors" aria-label="Menú">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                    
                    <!-- Navegación desktop -->
                    <div class="hidden lg:flex flex-1 justify-end gap-8">
                        <nav class="flex items-center gap-9">
                            <a class="text-text-main dark:text-white hover:text-primary dark:hover:text-primary text-sm font-bold uppercase tracking-wide leading-normal transition-colors" href="/">Inicio</a>
                            <a class="text-text-main dark:text-white hover:text-primary dark:hover:text-primary text-sm font-bold uppercase tracking-wide leading-normal transition-colors" href="#">Nosotros</a>
                            <a class="text-text-main dark:text-white hover:text-primary dark:hover:text-primary text-sm font-bold uppercase tracking-wide leading-normal transition-colors" href="#">Programas</a>
                        </nav>
                    </div>
                </div>
                
                <!-- Menú móvil -->
                <div id="mobile-menu" class="hidden lg:hidden mt-4 pb-2 space-y-3 border-t border-[#e5e5e5] dark:border-white/10 pt-4">
                    <a class="block text-text-main dark:text-white hover:text-primary text-base font-bold uppercase tracking-wide transition-colors py-2" href="/">Inicio</a>
                    <a class="block text-text-main dark:text-white hover:text-primary text-base font-bold uppercase tracking-wide transition-colors py-2" href="#">Nosotros</a>
                    <a class="block text-text-main dark:text-white hover:text-primary text-base font-bold uppercase tracking-wide transition-colors py-2" href="#">Programas</a>
                </div>
            </div>
        </header>

        <main class="flex-1 flex flex-col items-center justify-center py-12 px-4 md:px-10 lg:px-40 bg-background-light dark:bg-background-dark relative">
            <div class="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
                <div class="absolute -top-20 -right-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
                <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-primary rounded-full blur-3xl"></div>
            </div>

            <div class="max-w-[600px] w-full flex flex-col gap-10 items-center relative z-10" id="contenidoExito">
                <!-- Se llenará dinámicamente -->
            </div>
        </main>

        <footer class="bg-black text-white py-8 border-t border-white/10 mt-auto">
            <div class="max-w-[960px] mx-auto px-4">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div class="flex items-center gap-3">
                        <img src="assets/logo.ico" alt="Logo Jaguares" class="size-6 object-contain">
                        <span class="text-white text-sm font-black uppercase italic">JAGUARES</span>
                    </div>
                    <p class="text-gray-400 text-sm">© 2025 JAGUARES. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    </div>

    <!-- jsPDF para generar PDFs -->
    
    
    
    
    
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

export default function EÉxito() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');

    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main dark:text-white transition-colors duration-200';

    let cancelled = false;

    (async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        await loadScript('/legacy/api-service.js');
        await loadScript('/legacy/exito.js');
        await loadScript('/legacy/mobile-menu.js');
        if (typeof window.cargarDatosExito === 'function') {
          window.cargarDatosExito();
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






