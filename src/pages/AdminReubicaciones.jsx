import React, { useEffect } from 'react';
import '../styles/animations.css';

const html = `
    <!-- Header -->
    <header class="bg-black text-white py-4 px-6 shadow-lg sticky top-0 z-40">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <div class="flex items-center gap-4">
                <a href="/admin-panel" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src="assets/logo.png" alt="Jaguares" class="h-10">
                    <span class="text-2xl font-black tracking-tight">JAGUARES</span>
                </a>
                <span class="text-primary font-bold">/ Reubicaciones</span>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-400">ADMINISTRADOR</span>
                <a href="/admin-panel" class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <span class="material-symbols-outlined text-sm">arrow_back</span>
                    Volver al Panel
                </a>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto p-6">
        <!-- Título y descripción -->
        <div class="mb-6">
            <h1 class="text-3xl font-black text-black dark:text-white uppercase tracking-tight">
                Gestión de <span class="text-primary">Reubicaciones</span>
            </h1>
            <p class="text-text-muted mt-1">Arrastra y suelta alumnos entre categorías para reubicarlos</p>
        </div>

        <!-- Selector de deporte -->
        <div class="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6 mb-6">
            <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-3xl text-primary">sports</span>
                    <div>
                        <label class="text-sm text-text-muted">Selecciona un deporte</label>
                        <select id="selectorDeporte" class="block w-64 mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg font-bold text-black dark:text-white focus:border-primary focus:outline-none transition-colors">
                            <option value="">-- Seleccionar --</option>
                        </select>
                    </div>
                </div>
                <div id="infoDeporte" class="hidden md:ml-auto">
                    <div class="flex items-center gap-4 text-sm">
                        <div class="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <span class="material-symbols-outlined text-blue-600 text-sm">groups</span>
                            <span class="text-blue-700 dark:text-blue-300 font-semibold" id="totalAlumnos">0 alumnos</span>
                        </div>
                        <div class="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <span class="material-symbols-outlined text-green-600 text-sm">category</span>
                            <span class="text-green-700 dark:text-green-300 font-semibold" id="totalCategorias">0 categorías</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Instrucciones -->
        <div id="instrucciones" class="bg-gradient-to-r from-primary/10 to-yellow-100/50 dark:from-primary/20 dark:to-yellow-900/20 border-l-4 border-primary rounded-r-xl p-4 mb-6">
            <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-primary text-2xl">touch_app</span>
                <div>
                    <h3 class="font-bold text-black dark:text-white">¿Cómo usar?</h3>
                    <ul class="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                        <li>1. Selecciona un deporte del Menú desplegable</li>
                        <li>2. Verás las categorías como columnas con los alumnos inscritos</li>
                        <li>3. <strong>Arrastra</strong> un alumno de una columna a otra para reubicarlo</li>
                        <li>4. Los horarios se actualizarán automáticamente manteniendo los mismos días</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Estado de carga -->
        <div id="loading" class="hidden text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p class="mt-4 text-text-muted">Cargando alumnos...</p>
        </div>

        <!-- Mensaje sin selección -->
        <div id="sinSeleccion" class="text-center py-16">
            <span class="material-symbols-outlined text-7xl text-gray-300 dark:text-gray-700">sports_soccer</span>
            <p class="text-text-muted mt-4 text-lg">Selecciona un deporte para ver sus categorías</p>
        </div>

        <!-- Board de categorías (Kanban) -->
        <div id="boardCategorias" class="hidden">
            <div id="columnasContainer" class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                <!-- Las columnas se generan dinámicamente -->
            </div>
        </div>

        <!-- Sin datos -->
        <div id="sinDatos" class="hidden text-center py-16">
            <span class="material-symbols-outlined text-7xl text-gray-300 dark:text-gray-700">person_off</span>
            <p class="text-text-muted mt-4 text-lg">No hay alumnos inscritos en este deporte</p>
        </div>
    </main>

    <!-- Modal de confirmación -->
    <div id="modalConfirmacion" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-surface-dark rounded-xl shadow-2xl max-w-md w-full animate-[slideUp_0.3s_ease-out]">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl text-primary">swap_horiz</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-black dark:text-white uppercase">Confirmar Reubicación</h3>
                        <p class="text-sm text-text-muted" id="modalSubtitulo">Mover alumno</p>
                    </div>
                </div>
            </div>
            <div class="p-6 max-h-[60vh] overflow-y-auto">
                <!-- Categorías -->
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between">
                        <div class="text-center flex-1">
                            <p class="text-xs text-text-muted">Desde categoría</p>
                            <p class="font-bold text-red-600 dark:text-red-400" id="modalOrigen">-</p>
                        </div>
                        <span class="material-symbols-outlined text-primary text-2xl mx-4">arrow_forward</span>
                        <div class="text-center flex-1">
                            <p class="text-xs text-text-muted">Hacia categoría</p>
                            <p class="font-bold text-green-600 dark:text-green-400" id="modalDestino">-</p>
                        </div>
                    </div>
                </div>
                
                <!-- Precios y Plan -->
                <div id="seccionPrecios" class="hidden bg-primary/10 dark:bg-primary/20 rounded-lg p-4 mb-4 border border-primary/30">
                    <p class="text-xs font-semibold text-primary mb-3 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">payments</span>
                        Cambio en Mensualidad
                    </p>
                    <!-- Se llena dinámicamente -->
                </div>
                
                <!-- Días de asistencia -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                        <p class="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">event_busy</span>
                            Días actuales
                        </p>
                        <div id="diasActualesLista" class="min-h-[40px]">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>
                    <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <p class="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">event_available</span>
                            Días nuevos
                        </p>
                        <div id="diasNuevosLista" class="min-h-[40px]">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>
                </div>
                
                <!-- Advertencia si los días cambian -->
                <div id="warningDiasDiferentes" class="hidden bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
                    <p class="text-sm text-orange-700 dark:text-orange-300 flex items-start gap-2">
                        <span class="material-symbols-outlined text-lg">warning</span>
                        <span><strong>Atención:</strong> Los días de entrenamiento cambiarán. Asegúrate de notificar al alumno/apoderado.</span>
                    </p>
                </div>
                
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-sm align-middle mr-1">info</span>
                    Se asignarán automáticamente todos los horarios de la nueva categoría.
                </p>
            </div>
            <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                <button id="btnCancelarReubicacion" class="px-5 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold uppercase text-sm">
                    Cancelar
                </button>
                <button id="btnConfirmarReubicacion" class="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-black font-bold uppercase text-sm transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">check</span>
                    Confirmar
                </button>
            </div>
        </div>
    </div>

    <!-- Notificación toast -->
    <div id="toast" class="fixed bottom-6 right-6 z-50 hidden">
        <div class="bg-white dark:bg-surface-dark rounded-xl shadow-2xl p-4 flex items-center gap-3 min-w-[300px] border-l-4" id="toastContent">
            <span class="material-symbols-outlined text-2xl" id="toastIcon">check_circle</span>
            <div>
                <p class="font-bold text-black dark:text-white" id="toastTitulo">¡Éxito</p>
                <p class="text-sm text-text-muted" id="toastMensaje">Operación completada</p>
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

export default function AdminReubicaciones() {
  useEffect(() => {
    document.body.className = 'bg-gray-100 dark:bg-gray-950 font-sans admin-readable min-h-screen';

    if ('$inlineStyle') {
      const styleEl = document.createElement('style');
      styleEl.textContent = `$inlineStyle`;
      styleEl.setAttribute('data-inline', 'admin-reubicaciones');
      document.head.appendChild(styleEl);
    }

    let cancelled = false;

    (async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js');
        await loadScript('/legacy/admin-reubicaciones.js');
      } catch (err) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }
    })();

    return () => {
      cancelled = true;
      const inline = document.querySelector('style[data-inline="admin-reubicaciones"]');
      inline?.remove();
    };
  }, []);

  return <div className="page-root" dangerouslySetInnerHTML={{ __html: html }} />;
}





