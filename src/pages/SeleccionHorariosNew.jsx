import React, { useEffect } from 'react';
import '../styles/seleccion-horarios-new.css';
import '../styles/animations.css';

const html = `
    <div class="relative flex h-auto min-h-screen w-full flex-col group/design-root">
        <header class="sticky top-0 z-50 border-b border-solid border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-black/90 backdrop-blur-md shadow-sm">
            <div class="px-4 lg:px-10 py-4">
                <div class="flex items-center justify-between">
                    <!-- Logo centrado en móvil -->
                    <div class="flex items-center gap-3 flex-1 justify-center lg:justify-start">
                        <img src="assets/logo.ico" alt="Logo Jaguares" class="h-10 w-auto object-contain">
                        <h2 class="text-xl lg:text-2xl font-black italic uppercase tracking-wider text-black dark:text-white">JAGUARES</h2>
                    </div>
                    
                    <!-- Botón hamburguesa -->
                    <button id="mobile-menu-btn" class="lg:hidden p-2 text-text-main dark:text-white hover:text-primary transition-colors" aria-label="Menú">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                    
                    <!-- Navegación desktop -->
                    <div class="hidden lg:flex flex-1 justify-end gap-8 items-center">
                        <nav class="flex items-center gap-9">
                            <a class="text-text-main dark:text-gray-200 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors" href="/">Inicio</a>
                            <a class="text-text-main dark:text-gray-200 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors" href="#">Academia</a>
                            <a class="text-text-main dark:text-gray-200 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors" href="#">Ayuda</a>
                        </nav>
                    </div>
                </div>
                
                <!-- Menú móvil -->
                <div id="mobile-menu" class="hidden lg:hidden mt-4 pb-2 space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                    <a class="block text-text-main dark:text-white hover:text-primary text-base font-bold uppercase tracking-wide transition-colors py-2" href="/">Inicio</a>
                    <a class="block text-text-main dark:text-white hover:text-primary text-base font-bold uppercase tracking-wide transition-colors py-2" href="#">Academia</a>
                    <a class="block text-text-main dark:text-white hover:text-primary text-base font-bold uppercase tracking-wide transition-colors py-2" href="#">Ayuda</a>
                </div>
            </div>
        </header>

        <div class="layout-container flex h-full grow flex-col">
            <div class="px-4 md:px-10 lg:px-20 flex flex-1 justify-center py-8">
                <div class="layout-content-container flex flex-col w-full max-w-[1400px] flex-1 pb-24">
                    <!-- Progress Bar -->
                    <div class="flex flex-col gap-3 p-4 mb-4">
                        <div class="flex gap-6 justify-between items-end">
                            <p class="text-text-main dark:text-white text-sm font-bold uppercase tracking-wider text-opacity-80">Paso 2 de 3: Selección de Horarios</p>
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
                            <span class="text-primary font-bold tracking-wide">Siguiente: Confirmación</span>
                        </div>
                    </div>

                    <!-- Header -->
                    <div class="flex flex-col gap-4 p-4">
                        <div class="flex flex-col gap-3">
                            <h1 class="text-text-main dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase italic">
                                SELECCIONA TU <span class="text-primary">DEPORTE</span>
                            </h1>
                            <p class="text-text-muted dark:text-gray-400 text-base md:text-lg font-medium leading-relaxed max-w-3xl">
                                Escoge tu deporte y luego selecciona los horarios de la semana a la misma hora.
                                <span class="text-primary font-bold">Solo puedes elegir turnos a la misma hora.</span>
                            </p>
                            <div class="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg p-3 mt-2">
                                <span class="material-symbols-outlined text-primary text-xl">info</span>
                                <p class="text-sm text-text-main dark:text-gray-300">
                                    <span class="font-bold">Matrícula por deporte: S/.20</span> | <span class="font-semibold">Planes desde S/.60/mes</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Cards de Deportes -->
                    <div class="px-4 mb-8">
                        <h2 class="text-xl font-black uppercase tracking-wide text-text-main dark:text-white mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">sports_soccer</span>
                            Deportes Disponibles
                        </h2>
                        <div id="deportesContainer" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            <!-- Se cargarán dinámicamente -->
                            <div class="col-span-full flex justify-center py-8">
                                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Cronograma Semanal (oculto inicialmente) -->
                    <div id="cronogramaSection" class="hidden px-4 animate-[slideUp_0.5s_ease-out]">
                        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                            <div class="flex items-center gap-3">
                                <button onclick="cerrarCronograma()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <span class="material-symbols-outlined">arrow_back</span>
                                </button>
                                <div>
                                    <h2 class="text-2xl font-black uppercase tracking-wide text-text-main dark:text-white flex items-center gap-2">
                                        <span id="deporteNombre"></span>
                                    </h2>
                                    <p class="text-sm text-text-muted dark:text-gray-400">Selecciona los turnos a la misma hora</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-text-muted dark:text-gray-400">Turno Actual</p>
                                <p id="horarioActual" class="text-lg font-black text-primary">No seleccionado</p>
                            </div>
                        </div>
                        
                        <!-- Leyenda de Planes -->
                        <div class="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg border border-border-light dark:border-border-dark">
                            <span class="text-sm font-bold text-text-main dark:text-white">Planes:</span>
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-xl">workspace_premium</span>
                                <span class="text-sm font-semibold text-text-main dark:text-white">Premium</span>
                                <span class="text-xs text-text-muted dark:text-gray-400">(2x/sem=S/.100 | 3x/sem=S/.150 | Completo=S/.200+F11)</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">star</span>
                                <span class="text-sm font-semibold text-text-main dark:text-white">Estándar</span>
                                <span class="text-xs text-text-muted dark:text-gray-400">(1x/sem=S/.40 | 2x/sem=S/.80 | 3x/sem=S/.120)</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">local_offer</span>
                                <span class="text-sm font-semibold text-text-main dark:text-white">Económico</span>
                                <span class="text-xs text-text-muted dark:text-gray-400">(2x/sem=S/.60 | 3x/sem=S/.80)</span>
                            </div>
                            <div class="flex items-center gap-2 ml-auto">
                                <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-xl">fitness_center</span>
                                <span class="text-sm font-semibold text-text-main dark:text-white">MAMAS FIT</span>
                                <span class="text-xs text-text-muted dark:text-gray-400">(Mín. 2/sem, Rec. 3/sem=S/.60)</span>
                            </div>
                        </div>

                        <!-- Tabla de Cronograma -->
                        <div class="overflow-x-auto rounded-xl border-2 border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-lg">
                            <table class="w-full">
                                <thead>
                                    <tr class="bg-black dark:bg-primary">
                                        <th class="px-4 py-3 text-left text-sm font-black uppercase tracking-wide text-white dark:text-black sticky left-0 bg-black dark:bg-primary z-10">Horario</th>
                                        <th class="px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white dark:text-black">Lunes</th>
                                        <th class="px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white dark:text-black">Martes</th>
                                        <th class="px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white dark:text-black">Miércoles</th>
                                        <th class="px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white dark:text-black">Jueves</th>
                                        <th class="px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white dark:text-black">Viernes</th>
                                        <th class="px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white dark:text-black">Sábado</th>
                                        <th class="px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white dark:text-black">Domingo</th>
                                    </tr>
                                </thead>
                                <tbody id="cronogramaBody">
                                    <!-- Se cargará dinámicamente -->
                                </tbody>
                            </table>
                        </div>

                        <!-- Leyenda -->
                        <div class="mt-4 flex flex-wrap gap-4 text-sm">
                            <div class="flex items-center gap-2">
                                <div class="w-4 h-4 rounded border-2 border-green-500 bg-green-50 dark:bg-green-900/20"></div>
                                <span class="text-text-muted dark:text-gray-400">Disponible</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-4 h-4 rounded border-3 border-primary bg-primary/20"></div>
                                <span class="text-text-muted dark:text-gray-400">Seleccionado</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-4 h-4 rounded border border-red-300 bg-red-50 dark:bg-red-900/20 opacity-50"></div>
                                <span class="text-text-muted dark:text-gray-400">No disponible</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer con resumen -->
        <div class="sticky bottom-0 z-50 w-full px-4 md:px-10 lg:px-20 py-4 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark shadow-[0_-5px_30px_rgba(0,0,0,0.1)]">
            <div class="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-4 w-full sm:w-auto">
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-text-muted dark:text-gray-500 uppercase tracking-wider">SELECCIÓN</span>
                        <span class="text-lg font-black text-text-main dark:text-white" id="resumenSeleccion">0 horarios seleccionados</span>
                        <span class="text-xs text-text-muted dark:text-gray-400" id="precioEstimado"></span>
                    </div>
                </div>
                <div class="flex gap-3 w-full sm:w-auto">
                    <button onclick="volverPasoAnterior()" class="flex-1 sm:flex-initial h-12 px-6 rounded-lg bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark text-text-main dark:text-white font-bold uppercase tracking-wide hover:border-primary transition-all">
                        Atrás
                    </button>
                    <button onclick="continuarConfirmacion()" id="btnContinuar" disabled class="flex-1 sm:flex-initial h-12 px-8 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-black uppercase tracking-wide cursor-not-allowed transition-all shadow-lg disabled:shadow-none">
                        Continuar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Notificaciones -->
    <div id="modalNotificacion" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="relative w-full max-w-md mx-4 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border-2 border-primary/20 overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <div class="flex items-center gap-4 p-6 border-b border-border-light dark:border-border-dark bg-gradient-to-r from-primary/5 to-transparent">
                <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" id="modalIcon">
                    <span class="material-symbols-outlined text-3xl" id="modalIconSymbol">info</span>
                </div>
                <h3 class="text-xl font-black uppercase tracking-tight text-text-main dark:text-white" id="modalTitulo">Notificación</h3>
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

export default function SeleccionHorariosNew() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');

    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-x-hidden antialiased selection:bg-primary selection:text-white';

    let cancelled = false;

    (async () => {
      try {
        await loadScript('/legacy/api-service.js');
        await loadScript('/legacy/seleccion-horarios-new.js');
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







