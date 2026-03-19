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
            <div class="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-black dark:text-white">
                        Dashboard <span class="text-primary">Financiero</span>
                    </h1>
                    <p class="text-text-muted dark:text-gray-400 mt-2">Análisis de ingresos y métricas económicas</p>
                </div>
                <button onclick="exportarDashboardExcel()" class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
                    <span class="material-symbols-outlined">download</span>
                    Exportar a Excel
                </button>
            </div>

            <div id="loadingContainer" class="text-center py-20">
                <span class="material-symbols-outlined animate-spin text-6xl text-primary">progress_activity</span>
                <p class="text-text-muted mt-4">Cargando estadf­sticas...</p>
            </div>

            <div id="dashboardContainer" class="hidden space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-primary">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Ingresos Totales</p>
                                <p id="totalIngresos" class="text-4xl font-black text-black dark:text-white mt-2">S/ 0</p>
                                <p class="text-xs text-text-muted mt-2">Matrf­culas + Mensualidades</p>
                            </div>
                            <span class="material-symbols-outlined text-5xl text-primary">account_balance_wallet</span>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-green-600">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Ingresos del Mes</p>
                                <p id="ingresosMes" class="text-4xl font-black text-black dark:text-white mt-2">S/ 0</p>
                                <p class="text-xs text-text-muted mt-2">Confirmados en periodo actual</p>
                            </div>
                            <span class="material-symbols-outlined text-5xl text-green-600">trending_up</span>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-blue-600">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Ingresos Hoy</p>
                                <p id="ingresosHoy" class="text-4xl font-black text-black dark:text-white mt-2">S/ 0</p>
                                <p class="text-xs text-text-muted mt-2">Pagos recibidos hoy</p>
                            </div>
                            <span class="material-symbols-outlined text-5xl text-blue-600">today</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-amber-600">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Total Matrf­culas</p>
                                <p id="totalMatriculas" class="text-4xl font-black text-black dark:text-white mt-2">S/ 0</p>
                                <p class="text-xs text-text-muted mt-2">Cobro único por deporte</p>
                            </div>
                            <span class="material-symbols-outlined text-5xl text-amber-600">badge</span>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-purple-600">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Total Mensualidades</p>
                                <p id="totalMensualidades" class="text-4xl font-black text-black dark:text-white mt-2">S/ 0</p>
                                <p class="text-xs text-text-muted mt-2">Pagos Mensuales confirmados</p>
                            </div>
                            <span class="material-symbols-outlined text-5xl text-purple-600">payments</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md">
                        <h3 class="text-xl font-bold text-black dark:text-white mb-6 uppercase tracking-tight">Ingresos por Deporte</h3>
                        <div class="h-96">
                            <canvas id="chartDeportes"></canvas>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md">
                        <h3 class="text-xl font-bold text-black dark:text-white mb-6 uppercase tracking-tight">Distribución de Ingresos</h3>
                        <div class="h-96 flex items-center justify-center">
                            <canvas id="chartDistribucion"></canvas>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-xl">
                    <h3 class="text-xl font-bold text-black dark:text-white mb-6 uppercase tracking-tight">Detalle por Deporte</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead>
                                <tr class="border-b-2 border-primary">
                                    <th class="px-4 py-3 text-left text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Deporte</th>
                                    <th class="px-4 py-3 text-right text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Matrf­culas</th>
                                    <th class="px-4 py-3 text-right text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Mensualidades</th>
                                    <th class="px-4 py-3 text-right text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody id="tablaDeportes">
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-xl">
                    <h3 class="text-xl font-bold text-black dark:text-white mb-6 uppercase tracking-tight">Top 10 Alumnos por Ingresos</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead>
                                <tr class="border-b-2 border-primary">
                                    <th class="px-4 py-3 text-left text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">DNI</th>
                                    <th class="px-4 py-3 text-left text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Nombres</th>
                                    <th class="px-4 py-3 text-left text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Deportes</th>
                                    <th class="px-4 py-3 text-right text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Matrf­culas</th>
                                    <th class="px-4 py-3 text-right text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Mensualidades</th>
                                    <th class="px-4 py-3 text-right text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody id="tablaAlumnos">
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </div>
    </main>

    <footer class="bg-surface-light dark:bg-surface-dark border-t border-border-color py-6 mt-12">
        <div class="text-center">
            <p class="text-sm text-text-muted dark:text-gray-400">
                JAGUARES - Dashboard Financiero
            </p>
            <p class="text-xs text-text-muted dark:text-gray-500 mt-1">
                Última actualización: <span id="timestampActualizacion">-</span>
            </p>
        </div>
    </footer>
`;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      resolve(false); // ya existía
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.defer = false;
    script.dataset.src = src;
    script.onload = () => resolve(true); // recién cargado
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export default function AdminDashboard() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');

    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main font-sans admin-readable min-h-screen flex flex-col';

    let cancelled = false;

    (async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js');
        const freshlyLoaded = await loadScript('/legacy/admin-dashboard.js');
        // Si el script ya estaba en el DOM (navegación de vuelta), llamar init manualmente
        if (!cancelled && !freshlyLoaded && typeof window.initAdminDashboard === 'function') {
          window.initAdminDashboard();
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




