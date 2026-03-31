import React, { useEffect } from 'react';

const html = `
    <header class="sticky top-0 z-50 border-b border-solid border-border-color bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm shadow-sm">
        <div class="px-4 py-4 lg:px-10">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 text-text-main dark:text-white">
                    <img src="assets/logo.ico" alt="Logo Jaguares" class="h-10 w-auto object-contain">
                    <h2 class="text-xl lg:text-2xl font-black italic uppercase tracking-wider text-black dark:text-white">JAGUARES</h2>
                </div>
                
                <div class="flex items-center gap-4">
                    <a href="/admin-panel" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                        <span class="material-symbols-outlined text-lg">arrow_back</span>
                        <span class="hidden sm:inline">Volver al Panel</span>
                    </a>
                    <div class="text-right hidden lg:block">
                        <p class="text-xs text-text-muted dark:text-gray-400 uppercase tracking-wide">Administrador</p>
                        <p id="adminEmail" class="text-sm font-semibold text-black dark:text-white"></p>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="flex-grow px-4 sm:px-6 lg:px-10 py-8">
        <div class="max-w-screen-2xl mx-auto">
            <!-- Título -->
            <div class="mb-8">
                <h1 class="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-black dark:text-white">
                    Pagos <span class="text-primary">Mensuales</span>
                </h1>
                <p class="text-text-muted dark:text-gray-400 mt-2">Gestión y verificación de comprobantes mensuales</p>
            </div>

            <!-- Contadores -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-md border-l-4 border-blue-500">
                    <p class="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase">Total</p>
                    <p id="contTotal" class="text-2xl font-black text-black dark:text-white mt-1">0</p>
                </div>
                <div class="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-md border-l-4 border-yellow-500">
                    <p class="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase">Pendientes</p>
                    <p id="contPendientes" class="text-2xl font-black text-yellow-600 mt-1">0</p>
                </div>
                <div class="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-md border-l-4 border-green-500">
                    <p class="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase">Confirmados</p>
                    <p id="contConfirmados" class="text-2xl font-black text-green-600 mt-1">0</p>
                </div>
                <div class="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-md border-l-4 border-red-500">
                    <p class="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase">Rechazados</p>
                    <p id="contRechazados" class="text-2xl font-black text-red-600 mt-1">0</p>
                </div>
            </div>

            <!-- Filtros -->
            <div class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-md mb-6">
                <div class="flex flex-col sm:flex-row gap-4">
                    <!-- Buscar por DNI o nombre -->
                    <div class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 flex-1">
                        <span class="material-symbols-outlined text-primary">search</span>
                        <input type="text" id="buscarDNI" placeholder="Buscar por DNI o nombre..." 
                               maxlength="50"
                               class="bg-transparent border-none focus:outline-none text-sm font-semibold w-full text-black dark:text-white placeholder:text-gray-400">
                    </div>
                    <!-- Filtro estado -->
                    <select id="filtroEstado" class="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-semibold text-black dark:text-white min-w-[160px]">
                        <option value="todos">Todos los estados</option>
                        <option value="pendiente" selected>Pendientes</option>
                        <option value="confirmado">Confirmados</option>
                        <option value="rechazado">Rechazados</option>
                    </select>
                    <!-- Filtro mes -->
                    <select id="filtroMes" class="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-semibold text-black dark:text-white min-w-[150px]">
                        <option value="">Todos los meses</option>
                        <option value="enero">Enero</option>
                        <option value="febrero">Febrero</option>
                        <option value="marzo">Marzo</option>
                        <option value="abril">Abril</option>
                        <option value="mayo">Mayo</option>
                        <option value="junio">Junio</option>
                        <option value="julio">Julio</option>
                        <option value="agosto">Agosto</option>
                        <option value="septiembre">Septiembre</option>
                        <option value="octubre">Octubre</option>
                        <option value="noviembre">Noviembre</option>
                        <option value="diciembre">Diciembre</option>
                    </select>
                </div>
            </div>

            <!-- Loading -->
            <div id="loadingPagos" class="text-center py-20">
                <span class="material-symbols-outlined animate-spin text-6xl text-primary">progress_activity</span>
                <p class="text-text-muted mt-4">Cargando pagos mensuales...</p>
            </div>

            <!-- Sin resultados -->
            <div id="sinResultados" class="hidden text-center py-20">
                <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">payments</span>
                <p class="text-text-muted dark:text-gray-400 mt-4 text-lg font-semibold">No se encontraron pagos mensuales</p>
                <p class="text-text-muted dark:text-gray-500 text-sm mt-1">Intenta con otros filtros</p>
            </div>

            <!-- Tabla de pagos -->
            <div id="tablaPagos" class="hidden bg-white dark:bg-surface-dark rounded-xl shadow-md overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th class="px-4 py-3 text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Alumno</th>
                                <th class="px-4 py-3 text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Mes</th>
                                <th class="px-4 py-3 text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Año</th>
                                <th class="px-4 py-3 text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Monto</th>
                                <th class="px-4 py-3 text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                <th class="px-4 py-3 text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                                <th class="px-4 py-3 text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Comprobante</th>
                                <th class="px-4 py-3 text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="bodyPagos"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
`;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(false); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function AdminPagosMensuales() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main font-sans admin-readable min-h-screen flex flex-col';

    let cancelled = false;
    (async () => {
      try {
        const freshlyLoaded = await loadScript('/legacy/admin-pagos-mensuales.js');
        if (!cancelled && !freshlyLoaded && typeof window.initAdminPagosMensuales === 'function') {
          window.initAdminPagosMensuales();
        }
      } catch (err) {
        if (!cancelled) console.error(err);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return <div className="page-root" dangerouslySetInnerHTML={{ __html: html }} />;
}
