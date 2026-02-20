import React, { useEffect } from 'react';

const html = `
    <div class="relative flex h-auto min-h-screen w-full flex-col group/design-root">
        <header class="sticky top-0 z-50 border-b border-solid border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-black/90 backdrop-blur-md shadow-sm">
            <div class="px-4 lg:px-10 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 flex-1 justify-center lg:justify-start">
                        <img src="assets/logo.ico" alt="Logo Jaguares" class="h-10 w-auto object-contain">
                        <h2 class="text-xl lg:text-2xl font-black italic uppercase tracking-wider text-black dark:text-white">JAGUARES</h2>
                    </div>
                    
                    <button id="mobile-menu-btn" class="lg:hidden p-2 text-text-main dark:text-white hover:text-primary transition-colors" aria-label="MenúÃº">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                    
                    <div class="hidden lg:flex flex-1 justify-end gap-8 items-center">
                        <nav class="flex items-center gap-9">
                            <a class="text-text-main dark:text-gray-200 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors" href="/">Inicio</a>
                            <a class="text-text-main dark:text-gray-200 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors" href="#">Academia</a>
                            <a class="text-text-main dark:text-gray-200 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors" href="#">Ayuda</a>
                        </nav>
                    </div>
                </div>
                
                <div id="mobile-menu" class="hidden lg:hidden mt-4 pb-2 space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                    <a class="block text-text-main dark:text-white hover:text-primary text-base font-bold uppercase tracking-wide transition-colors py-2" href="/">Inicio</a>
                    <a class="block text-text-main dark:text-white hover:text-primary text-base font-bold uppercase tracking-wide transition-colors py-2" href="#">Academia</a>
                    <a class="block text-text-main dark:text-white hover:text-primary text-base font-bold uppercase tracking-wide transition-colors py-2" href="#">Ayuda</a>
                </div>
            </div>
        </header>

        <div class="layout-container flex h-full grow flex-col">
            <div class="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-8">
                <div class="layout-content-container flex flex-col max-w-[1024px] flex-1 pb-24">
                    <div class="flex flex-col gap-3 p-4 mb-4">
                        <div class="flex gap-6 justify-between items-end">
                            <p class="text-text-main dark:text-white text-sm font-bold uppercase tracking-wider text-opacity-80">Paso 2 de 3: SelecciÃ³n de Horarios</p>
                            <span class="text-xs font-bold text-primary dark:text-primary bg-primary/10 px-3 py-1 rounded-md border border-primary/20">2/3</span>
                        </div>
                        <div class="rounded-full bg-gray-200 dark:bg-gray-800 h-2 overflow-hidden">
                            <div class="h-full gold-gradient relative overflow-hidden shadow-[0_0_10px_rgba(197,157,95,0.5)]" style="width: 66%">
                                <div class="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                        <div class="flex justify-between text-sm pt-1">
                            <a class="text-text-muted hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer" onclick="volverPasoAnterior()">
                                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                                <span class="font-medium">Anterior: Datos</span>
                            </a>
                            <span class="text-primary font-bold tracking-wide">Siguiente: ConfirmaciÃ³n</span>
                        </div>
                    </div>

                    <div class="flex flex-col gap-4 p-4">
                        <div class="flex flex-col gap-3">
                            <h1 class="text-text-main dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase italic">
                                SELECCIONA TUS HORARIOS
                            </h1>
                            <p class="text-text-muted dark:text-gray-400 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                                Elige los horarios que mejor se adapten a tu disponibilidad. Selecciona los que desees, evitando que coincidan en el mismo dÃ­a y hora.
                               <br> Recordar que la matricula por deporte es de S/.20 soles
                            </p>
                        </div>
                    </div>

                    <div class="sticky top-[72px] z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm py-3 px-4 mb-6 -mx-4 md:mx-0 border-b-2 border-primary/20 transition-all" id="filter-bar">
                        <div class="grid grid-cols-4 gap-2 md:hidden mb-2" id="diasFilterMobile">
                            <button onclick="filtrarPorDia('Todos')" class="dia-filter-btn active flex flex-col items-center justify-center gap-1 rounded-lg bg-black dark:bg-primary text-white dark:text-black p-3 shadow-lg transition-all active:scale-95 border-2 border-black dark:border-primary" data-dia="Todos">
                                <span class="text-xs font-black uppercase">Todos</span>
                                <span class="bg-primary dark:bg-black text-black dark:text-primary rounded-md w-6 h-6 flex items-center justify-center text-[10px] font-black" id="count-Todos-mobile">0</span>
                            </button>
                            <button onclick="filtrarPorDia('Lunes')" class="dia-filter-btn flex flex-col items-center justify-center gap-1 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 p-3 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="Lunes">
                                <span class="text-xs font-black uppercase">Lun</span>
                            </button>
                            <button onclick="filtrarPorDia('Martes')" class="dia-filter-btn flex flex-col items-center justify-center gap-1 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 p-3 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="Martes">
                                <span class="text-xs font-black uppercase">Mar</span>
                            </button>
                            <button onclick="filtrarPorDia('MiÃ©rcoles')" class="dia-filter-btn flex flex-col items-center justify-center gap-1 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 p-3 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="MiÃ©rcoles">
                                <span class="text-xs font-black uppercase">MiÃ©</span>
                            </button>
                            <button onclick="filtrarPorDia('Jueves')" class="dia-filter-btn flex flex-col items-center justify-center gap-1 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 p-3 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="Jueves">
                                <span class="text-xs font-black uppercase">Jue</span>
                            </button>
                            <button onclick="filtrarPorDia('Viernes')" class="dia-filter-btn flex flex-col items-center justify-center gap-1 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 p-3 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="Viernes">
                                <span class="text-xs font-black uppercase">Vie</span>
                            </button>
                            <button onclick="filtrarPorDia('SÃ¡bado')" class="dia-filter-btn flex flex-col items-center justify-center gap-1 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 p-3 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="SÃ¡bado">
                                <span class="text-xs font-black uppercase">SÃ¡b</span>
                            </button>
                            <button onclick="filtrarPorDia('Domingo')" class="dia-filter-btn flex flex-col items-center justify-center gap-1 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 p-3 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="Domingo">
                                <span class="text-xs font-black uppercase">Dom</span>
                            </button>
                        </div>
                        
                        <div class="hidden md:flex gap-2 overflow-x-auto no-scrollbar py-2" id="diasFilterDesktop">
                            <button onclick="filtrarPorDia('Todos')" class="dia-filter-btn active flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-black dark:bg-primary text-white dark:text-black px-5 shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 border-2 border-black dark:border-primary" data-dia="Todos">
                                <span class="text-sm font-bold uppercase tracking-wide">Todos</span>
                                <span class="bg-primary dark:bg-black text-black dark:text-primary rounded-md w-5 h-5 flex items-center justify-center text-[11px] font-black" id="count-Todos-desktop">0</span>
                            </button>
                            <button onclick="filtrarPorDia('Lunes')" class="dia-filter-btn flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 px-5 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="Lunes">
                                <span class="text-sm font-bold uppercase tracking-wide">Lunes</span>
                            </button>
                            <button onclick="filtrarPorDia('Martes')" class="dia-filter-btn flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 px-5 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="Martes">
                                <span class="text-sm font-bold uppercase tracking-wide">Martes</span>
                            </button>
                            <button onclick="filtrarPorDia('MiÃ©rcoles')" class="dia-filter-btn flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 px-5 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="MiÃ©rcoles">
                                <span class="text-sm font-bold uppercase tracking-wide">MiÃ©rcoles</span>
                            </button>
                            <button onclick="filtrarPorDia('Jueves')" class="dia-filter-btn flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 px-5 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="Jueves">
                                <span class="text-sm font-bold uppercase tracking-wide">Jueves</span>
                            </button>
                            <button onclick="filtrarPorDia('Viernes')" class="dia-filter-btn flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 px-5 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="Viernes">
                                <span class="text-sm font-bold uppercase tracking-wide">Viernes</span>
                            </button>
                            <button onclick="filtrarPorDia('SÃ¡bado')" class="dia-filter-btn flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 px-5 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="SÃ¡bado">
                                <span class="text-sm font-bold uppercase tracking-wide">SÃ¡bado</span>
                            </button>
                            <button onclick="filtrarPorDia('Domingo')" class="dia-filter-btn flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 px-5 text-text-main dark:text-gray-300 transition-all active:scale-95" data-dia="Domingo">
                                <span class="text-sm font-bold uppercase tracking-wide">Domingo</span>
                            </button>
                        </div>
                    </div>

                    <div id="horariosContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 md:px-4 scroll-mt-4">
                        <div class="col-span-full flex justify-center py-12">
                            <div class="flex flex-col items-center gap-4">
                                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                                <p class="text-text-muted dark:text-gray-400 font-medium">Cargando horarios disponibles...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="sticky bottom-0 z-50 w-full px-4 md:px-10 lg:px-40 py-4 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark shadow-[0_-5px_30px_rgba(0,0,0,0.1)]">
            <div class="max-w-[1024px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-4 w-full sm:w-auto p-2 sm:p-0 rounded-lg bg-background-light dark:bg-background-dark sm:bg-transparent sm:dark:bg-transparent">
                    <div class="relative size-12 shrink-0">
                        <svg class="size-full -rotate-90" viewBox="0 0 36 36">
                            <path class="text-gray-200 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3"></path>
                            <path class="text-primary transition-all duration-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-díasharray="0, 100" stroke-width="3" id="progressCircle"></path>
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-sm font-black text-text-main dark:text-white" id="selectionCount">0/2</span>
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-text-muted dark:text-gray-500 uppercase tracking-wider">TU SELECCIÃ“N</span>
                        <span class="text-sm font-black text-text-main dark:text-white" id="selectionText">NingÃºn horario seleccionado</span>
                    </div>
                </div>
                <div class="flex gap-3 w-full sm:w-auto">
                    <button onclick="volverPasoAnterior()" class="flex-1 sm:flex-initial h-12 px-6 rounded-lg bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark text-text-main dark:text-white font-bold uppercase tracking-wide hover:border-primary transition-all">
                        AtrÃ¡s
                    </button>
                    <button onclick="continuarConfirmacion()" id="btnContinuar" disabled class="flex-1 sm:flex-initial h-12 px-8 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-black uppercase tracking-wide cursor-not-allowed transition-all shadow-lg disabled:shadow-none" data-enabled-class="bg-black dark:bg-primary text-white dark:text-black hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
                        Continuar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div id="modalNotificacion" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="relative w-full max-w-md mx-4 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border-2 border-primary/20 overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <div class="flex items-center gap-4 p-6 border-b border-border-light dark:border-border-dark bg-gradient-to-r from-primary/5 to-transparent">
                <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" id="modalIcon">
                    <span class="material-symbols-outlined text-3xl" id="modalIconSymbol">info</span>
                </div>
                <h3 class="text-xl font-black uppercase tracking-tight text-text-main dark:text-white" id="modalTitulo">NotificaciÃ³n</h3>
            </div>
            <div class="p-6">
                <p class="text-base text-text-main dark:text-gray-300 leading-relaxed" id="modalMensaje"></p>
            </div>
            <div class="flex justify-end gap-3 p-6 pt-0">
                <button onclick="cerrarModal()" class="px-6 py-3 rounded-lg bg-black dark:bg-primary text-white dark:text-black font-bold uppercase tracking-wide hover:brightness-110 transition-all shadow-lg active:scale-95">
                    Entendido
                </button>
            </div>
        </div>
    </div>

    <style>
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .gold-gradient { background: linear-gradient(90deg, #C59D5F 0%, #E3C58E 50%, #B08546 100%); }
        @keyframes shimmer { 0%, 100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }
        .shadow-card {
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        .shadow-card-hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .shadow-selected {
            box-shadow: 0 0 0 3px rgba(197, 157, 95, 0.1), 0 10px 20px -5px rgba(197, 157, 95, 0.3);
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
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

export default function SeleccionHorarios() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-x-hidden antialiased selection:bg-primary selection:text-white';

    let cancelled = false;

    (async () => {
      try {
        await loadScript('/legacy/api-service.js');
        await loadScript('/legacy/seleccion-horarios.js');
        await loadScript('/legacy/mobile-menu.js');
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





