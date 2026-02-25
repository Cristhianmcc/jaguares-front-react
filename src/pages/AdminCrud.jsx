import React, { useEffect } from 'react';
import '../styles/animations.css';

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
            <div class="mb-8">
                <h1 class="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-black dark:text-white">
                    Gestión de <span class="text-primary">Datos</span>
                </h1>
                <p class="text-text-muted dark:text-gray-400 mt-2">Administra deportes, horarios y categorías del sistema</p>
            </div>

            <!-- Tabs -->
            <div class="bg-white dark:bg-surface-dark rounded-xl shadow-xl mb-6 overflow-hidden">
                <div class="border-b border-gray-200 dark:border-gray-700">
                    <nav class="flex flex-wrap -mb-px">
                        <button onclick="cambiarTab('calendario')" id="tab-calendario" class="tab-button active px-6 py-4 text-sm font-semibold transition-colors border-b-2 border-primary text-primary">
                            <span class="flex items-center gap-2">
                                <span class="material-symbols-outlined">calendar_month</span>
                                Calendario
                            </span>
                        </button>
                        <button onclick="cambiarTab('deportes')" id="tab-deportes" class="tab-button px-6 py-4 text-sm font-semibold transition-colors border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300">
                            <span class="flex items-center gap-2">
                                <span class="material-symbols-outlined">sports_soccer</span>
                                Deportes
                            </span>
                        </button>
                        <button onclick="cambiarTab('categorias')" id="tab-categorias" class="tab-button px-6 py-4 text-sm font-semibold transition-colors border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300">
                            <span class="flex items-center gap-2">
                                <span class="material-symbols-outlined">label</span>
                                categorías
                            </span>
                        </button>
                        <button onclick="cambiarTab('horarios')" id="tab-horarios" class="tab-button px-6 py-4 text-sm font-semibold transition-colors border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300">
                            <span class="flex items-center gap-2">
                                <span class="material-symbols-outlined">view_list</span>
                                Vista Tabla
                            </span>
                        </button>
                        <button onclick="cambiarTab('inscripciones')" id="tab-inscripciones" class="tab-button px-6 py-4 text-sm font-semibold transition-colors border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300">
                            <span class="flex items-center gap-2">
                                <span class="material-symbols-outlined">payments</span>
                                Pagos
                            </span>
                        </button>
                        <button onclick="cambiarTab('reportes')" id="tab-reportes" class="tab-button px-6 py-4 text-sm font-semibold transition-colors border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300">
                            <span class="flex items-center gap-2">
                                <span class="material-symbols-outlined">summarize</span>
                                Reportes
                            </span>
                        </button>
                    </nav>
                </div>

                <!-- Contenido de Calendario (Vista Principal) -->
                <div id="content-calendario" class="tab-content p-6">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h2 class="text-2xl font-bold text-black dark:text-white">Calendario Semanal de Horarios</h2>
                        <div class="flex flex-wrap gap-3">
                            <div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                                <label class="text-xs font-medium text-gray-700 dark:text-gray-300">Desde:</label>
                                <input type="time" id="rangoInicio" value="06:00" class="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600">
                            </div>
                            <div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                                <label class="text-xs font-medium text-gray-700 dark:text-gray-300">Hasta:</label>
                                <input type="time" id="rangoFin" value="22:00" class="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600">
                            </div>
                            <button onclick="actualizarRangoHoras()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                                <span class="material-symbols-outlined">update</span>
                                Actualizar Rango
                            </button>
                            <button onclick="abrirModalHorarioRapido()" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                                <span class="material-symbols-outlined">add</span>
                                Nuevo Horario
                            </button>
                        </div>
                    </div>

                    <!-- Leyenda -->
                    <div class="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 bg-green-500 rounded"></div>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Cupos disponibles</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Casi lleno (&gt;70%)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 bg-red-500 rounded"></div>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Completo</span>
                        </div>
                    </div>

                    <div id="loadingCalendario" class="text-center py-10">
                        <span class="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
                        <p class="text-text-muted mt-4">Cargando calendario...</p>
                    </div>

                    <div id="calendarioContainer" class="hidden overflow-x-auto">
                        <div class="min-w-[800px]">
                            <div class="grid grid-cols-8 gap-2">
                                <!-- Encabezado -->
                                <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-bold text-center text-sm">
                                    Hora
                                </div>
                                <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-bold text-center text-sm">
                                    Lunes
                                </div>
                                <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-bold text-center text-sm">
                                    Martes
                                </div>
                                <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-bold text-center text-sm">
                                    Miércoles
                                </div>
                                <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-bold text-center text-sm">
                                    Jueves
                                </div>
                                <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-bold text-center text-sm">
                                    Viernes
                                </div>
                                <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-bold text-center text-sm">
                                    Sábado
                                </div>
                                <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-bold text-center text-sm">
                                    Domingo
                                </div>
                            </div>
                            <!-- Grid del calendario se genera dinámicamente -->
                            <div id="calendarioGrid"></div>
                        </div>
                    </div>
                </div>

                <!-- Contenido de Deportes -->
                <div id="content-deportes" class="tab-content hidden p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-black dark:text-white">Lista de Deportes</h2>
                        <button onclick="abrirModalDeporte()" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined">add</span>
                            Nuevo Deporte
                        </button>
                    </div>

                    <div id="loadingDeportes" class="text-center py-10">
                        <span class="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
                        <p class="text-text-muted mt-4">Cargando deportes...</p>
                    </div>

                    <div id="tablaDeportesContainer" class="hidden">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Matrícula</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tablaDeportes" class="bg-white dark:bg-surface-dark divide-y divide-gray-200 dark:divide-gray-700">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Contenido de categorías -->
                <div id="content-categorias" class="tab-content hidden p-6">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h2 class="text-2xl font-bold text-black dark:text-white">Gestión de categorías</h2>
                        <div class="flex gap-3">
                            <select id="filtroCategoriaDeporte" onchange="cargarCategorias()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white">
                                <option value="">Todos los deportes</option>
                            </select>
                            <button onclick="abrirModalCategoria()" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                                <span class="material-symbols-outlined">add</span>
                                Nueva Categoría
                            </button>
                        </div>
                    </div>

                    <div id="loadingCategorias" class="text-center py-10">
                        <span class="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
                        <p class="text-text-muted mt-4">Cargando categorías...</p>
                    </div>

                    <div id="tablaCategoriasContainer" class="hidden">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deporte</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rango Años</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orden</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tablaCategorias" class="bg-white dark:bg-surface-dark divide-y divide-gray-200 dark:divide-gray-700">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Contenido de Horarios (Vista Tabla) -->
                <div id="content-horarios" class="tab-content hidden p-6">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h2 class="text-2xl font-bold text-black dark:text-white">Lista de Horarios</h2>
                        <div class="flex flex-wrap gap-3">
                            <select id="filtroDeporte" onchange="cargarHorarios()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white">
                                <option value="">Todos los deportes</option>
                            </select>
                            <select id="filtroEstado" onchange="cargarHorarios()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white">
                                <option value="">Todos los estados</option>
                                <option value="activo">Activos</option>
                                <option value="inactivo">Inactivos</option>
                            </select>
                            <button onclick="abrirModalHorario()" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                                <span class="material-symbols-outlined">add</span>
                                Nuevo Horario
                            </button>
                        </div>
                    </div>

                    <div id="loadingHorarios" class="text-center py-10">
                        <span class="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
                        <p class="text-text-muted mt-4">Cargando horarios...</p>
                    </div>

                    <div id="tablaHorariosContainer" class="hidden">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deporte</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Día</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Horario</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rango Años</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cupos</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tablaHorarios" class="bg-white dark:bg-surface-dark divide-y divide-gray-200 dark:divide-gray-700">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Contenido de Inscripciones/Pagos -->
                <div id="content-inscripciones" class="tab-content hidden p-6">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h2 class="text-2xl font-bold text-black dark:text-white">Gestión de Pagos</h2>
                        <div class="flex flex-wrap gap-3">
                            <select id="filtroEstadoPago" onchange="cargarInscripciones()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white">
                                <option value="todos">Todos</option>
                                <option value="pendiente">Pendientes</option>
                                <option value="confirmado">Confirmados</option>
                            </select>
                            <input type="text" id="buscarInscripcion" placeholder="Buscar por DNI o nombre..." class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white" onkeyup="buscarInscripcion()">
                        </div>
                    </div>

                    <!-- Estad?sticas -->
                    <div id="estadisticasInscripciones" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <!-- Se cargan dinámicamente -->
                    </div>

                    <div id="loadingInscripciones" class="text-center py-10">
                        <span class="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
                        <p class="text-text-muted mt-4">Cargando inscripciones...</p>
                    </div>

                    <div id="tablaInscripcionesContainer" class="hidden">
                        <div class="grid gap-4">
                            <!-- Lista de inscripciones se carga aqu? -->
                        </div>
                    </div>
                </div>

                <!-- Contenido de Reportes -->
                <div id="content-reportes" class="tab-content hidden p-6">
                    <div class="mb-6">
                        <h2 class="text-2xl font-bold text-black dark:text-white mb-4">Reportes de Alumnos</h2>
                        <p class="text-text-muted dark:text-gray-400">Genera reportes por deporte, Día o Categoría para exportar a Excel o PDF</p>
                    </div>

                    <!-- Filtros de Reporte -->
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
                        <h3 class="font-semibold mb-4 text-black dark:text-white">Filtros</h3>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deporte</label>
                                <select id="reporteDeporte" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white">
                                    <option value="">Todos los deportes</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Día</label>
                                <select id="reporteDia" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white">
                                    <option value="">Todos los Días</option>
                                    <option value="LUNES">Lunes</option>
                                    <option value="MARTES">Martes</option>
                                    <option value="MIERCOLES">Miércoles</option>
                                    <option value="JUEVES">Jueves</option>
                                    <option value="VIERNES">Viernes</option>
                                    <option value="SABADO">Sábado</option>
                                    <option value="DOMINGO">Domingo</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
                                <select id="reporteCategoria" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white">
                                    <option value="">Todías las categorías</option>
                                </select>
                            </div>
                            <div class="flex items-end">
                                <button onclick="generarReporte()" class="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined">search</span>
                                    Generar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de Exportaci?n -->
                    <div id="botonesExportacion" class="hidden flex gap-3 mb-6">
                        <button onclick="exportarExcel()" class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined">table_view</span>
                            Exportar a Excel
                        </button>
                    </div>

                    <!-- Resultados del Reporte -->
                    <div id="resultadosReporte" class="hidden">
                        <!-- Se carga dinámicamente -->
                    </div>

                    <div id="sinResultados" class="hidden text-center py-10">
                        <span class="material-symbols-outlined text-6xl text-gray-400">search_off</span>
                        <p class="text-text-muted mt-4 text-lg">No se encontraron alumnos con los filtros seleccionados</p>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal Deporte -->
    <div id="modalDeporte" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-surface-dark rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                <h3 id="modalDeporteTitulo" class="text-xl font-bold text-black dark:text-white">Nuevo Deporte</h3>
                <button onclick="cerrarModalDeporte()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <form id="formDeporte" class="p-6 space-y-4">
                <input type="hidden" id="deporte_id" name="deporte_id">
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre del Deporte *</label>
                    <input type="text" id="deporte_nombre" name="nombre" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                    <textarea id="deporte_descripcion" name="descripcion" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary"></textarea>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ícono (emoji o nombre de material icon)</label>
                    <input type="text" id="deporte_icono" name="icono" placeholder="ej: sports_soccer" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Matrícula (S/) *</label>
                    <input type="number" id="deporte_matricula" name="matricula" step="0.01" value="20.00" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                    <select id="deporte_estado" name="estado" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="submit" class="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
                        Guardar
                    </button>
                    <button type="button" onclick="cerrarModalDeporte()" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-semibold transition-colors">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Categoría -->
    <div id="modalCategoria" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-surface-dark rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                <h3 id="modalCategoriaTitulo" class="text-xl font-bold text-black dark:text-white">Nueva Categoría</h3>
                <button onclick="cerrarModalCategoria()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <form id="formCategoria" class="p-6 space-y-4">
                <input type="hidden" id="categoria_id" name="categoria_id">
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deporte *</label>
                    <select id="categoria_deporte" name="deporte_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                        <option value="">Selecciona un deporte</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre de la Categoría *</label>
                    <input type="text" id="categoria_nombre" name="nombre" required placeholder="Ej: 2011-2012, Juvenil, Sub-15" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                    <textarea id="categoria_descripcion" name="descripcion" rows="2" placeholder="Descripción de la Categoría" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Año Mínimo</label>
                        <input type="number" id="categoria_ano_min" name="ano_min" placeholder="2011" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Año Máximo</label>
                        <input type="number" id="categoria_ano_max" name="ano_max" placeholder="2012" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ícono (emoji)</label>
                    <input type="text" id="categoria_icono" name="icono" placeholder="ej: sports_soccer, sports_basketball" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Orden de visualización</label>
                    <input type="number" id="categoria_orden" name="orden" value="0" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                    <p class="text-xs text-gray-500 mt-1">Número menor aparece primero (0, 1, 2...)</p>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                    <select id="categoria_estado" name="estado" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="submit" class="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
                        Guardar
                    </button>
                    <button type="button" onclick="cerrarModalCategoria()" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-semibold transition-colors">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Horario -->
    <div id="modalHorario" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div class="bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-shrink-0">
                <h3 id="modalHorarioTitulo" class="text-base sm:text-lg font-bold text-black">Edici?n Rápida</h3>
                <button onclick="cerrarModalHorario()" class="text-black hover:text-white transition-colors p-1">
                    <span class="material-symbols-outlined text-xl sm:text-2xl">close</span>
                </button>
            </div>
            <form id="formHorario" class="p-3 sm:p-5 overflow-y-auto flex-1">
                <input type="hidden" id="horario_id" name="horario_id">
                
                <!-- Información del horario (una sola l?nea compacta) -->
                <div class="bg-gray-50 dark:bg-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
                    <div id="info_horario_actual" class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium"></div>
                </div>

                <div class="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Deporte *</label>
                        <select id="horario_deporte" name="deporte_id" required class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                            <option value="">Selecciona un deporte</option>
                        </select>
                    </div>

                    <!-- Selector de día: checkboxes para crear, select para editar -->
                    <div id="horario_dias_crear" class="col-span-2 hidden">
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Días *</label>
                        <div id="horario_dias_checkboxes" class="flex flex-wrap gap-2">
                            <label class="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium hover:bg-primary/10 has-[:checked]:bg-primary has-[:checked]:text-black has-[:checked]:border-primary transition-colors">
                                <input type="checkbox" value="LUNES" class="sr-only"> Lunes
                            </label>
                            <label class="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium hover:bg-primary/10 has-[:checked]:bg-primary has-[:checked]:text-black has-[:checked]:border-primary transition-colors">
                                <input type="checkbox" value="MARTES" class="sr-only"> Martes
                            </label>
                            <label class="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium hover:bg-primary/10 has-[:checked]:bg-primary has-[:checked]:text-black has-[:checked]:border-primary transition-colors">
                                <input type="checkbox" value="MIERCOLES" class="sr-only"> Miércoles
                            </label>
                            <label class="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium hover:bg-primary/10 has-[:checked]:bg-primary has-[:checked]:text-black has-[:checked]:border-primary transition-colors">
                                <input type="checkbox" value="JUEVES" class="sr-only"> Jueves
                            </label>
                            <label class="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium hover:bg-primary/10 has-[:checked]:bg-primary has-[:checked]:text-black has-[:checked]:border-primary transition-colors">
                                <input type="checkbox" value="VIERNES" class="sr-only"> Viernes
                            </label>
                            <label class="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium hover:bg-primary/10 has-[:checked]:bg-primary has-[:checked]:text-black has-[:checked]:border-primary transition-colors">
                                <input type="checkbox" value="SABADO" class="sr-only"> Sábado
                            </label>
                            <label class="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium hover:bg-primary/10 has-[:checked]:bg-primary has-[:checked]:text-black has-[:checked]:border-primary transition-colors">
                                <input type="checkbox" value="DOMINGO" class="sr-only"> Domingo
                            </label>
                        </div>
                        <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Se creará un horario por cada día seleccionado</p>
                    </div>
                    <div id="horario_dias_editar" class="hidden">
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Día *</label>
                        <select id="horario_dia" name="dia" class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                            <option value="LUNES">Lunes</option>
                            <option value="MARTES">Martes</option>
                            <option value="MIERCOLES">Miércoles</option>
                            <option value="JUEVES">Jueves</option>
                            <option value="VIERNES">Viernes</option>
                            <option value="SABADO">Sábado</option>
                            <option value="DOMINGO">Domingo</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Hora Inicio *</label>
                        <input type="time" id="horario_inicio" name="hora_inicio" required class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                    </div>

                    <div>
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Hora Fin *</label>
                        <input type="time" id="horario_fin" name="hora_fin" required class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                    </div>

                    <div>
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Categoría</label>
                        <select id="horario_categoria" name="categoria" class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                            <option value="">Sin Categoría o personalizada</option>
                        </select>
                        <input type="text" id="horario_categoria_custom" name="categoria_custom" placeholder="O escribe una personalizada" class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary mt-2 hidden">
                    </div>

                    <div>
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nivel (opcional)</label>
                        <select id="horario_nivel" name="nivel" class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                          <option value="">Sin nivel específico</option>
                          <option value="Básico">Básico — Plan Estándar</option>
                          <option value="Competitivo">Competitivo — Plan Estándar (S/120)</option>
                          <option value="Premium Competitivo">Premium Competitivo — Plan Premium (S/150)</option>
                          <option value="Baby Fútbol">Baby Fútbol — Plan Baby Fútbol</option>
                        </select>
                    </div>

                    <div class="hidden">
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Año Mínimo</label>
                        <input type="number" id="horario_ano_min" name="ano_min" placeholder="Auto-completado" readonly class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
                    </div>

                    <div class="hidden">
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Año Máximo</label>
                        <input type="number" id="horario_ano_max" name="ano_max" placeholder="Auto-completado" readonly class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
                    </div>

                    <div>
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Género</label>
                        <select id="horario_genero" name="genero" class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                            <option value="Mixto">Mixto</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Cupo Máximo *</label>
                        <input type="number" id="horario_cupo" name="cupo_maximo" value="20" required class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                    </div>

                    <div>
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Plan de Pago</label>
                        <select id="horario_plan" name="plan" class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                            <option value="">Sin plan específico</option>
                            <option value="Económico">Económico (2 Días: S/ 60 | 3+ Días: S/ 80)</option>
                            <option value="Estándar">Estándar (1 Día: S/ 40 | 2 Días: S/ 80 | 3 Días: S/ 120)</option>
                            <option value="Premium">Premium (2 Días: S/ 100 | 3 Días: S/ 150)</option>
                            <option value="Baby Fútbol">Baby Fútbol (1 Día: S/ 50 | 2 Días: S/ 100 | 3 Días: S/ 150)</option>
                        </select>
                        <div class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                            El precio varía Según la cantidad de Días por semana
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Precio (S/) *</label>
                        <input type="number" id="horario_precio" name="precio" step="0.01" placeholder="Según el plan" required class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                        <div class="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                            Econ: 2d=S/60, 3+d=S/80 | Est: 1d=S/40, 2d=S/80, 3d=S/120 | Prem: 2d=S/100, 3d=S/150 | Baby: 1d=S/50, 2d=S/100, 3d=S/150
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Estado</label>
                        <select id="horario_estado" name="estado" class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-primary">
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                            <option value="suspendido">Suspendido</option>
                        </select>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <button type="submit" class="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-primary hover:bg-yellow-500 text-black rounded-lg font-semibold transition-colors text-sm sm:text-base">
                        Guardar
                    </button>
                    <button type="button" onclick="cerrarModalHorario()" class="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-semibold transition-colors text-sm sm:text-base">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal de Confirmación de eliminación -->
    <div id="modalEliminarHorario" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
        <div class="relative w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border-2 border-red-500/30 overflow-hidden animate-[slideUp_0.3s_ease-out] max-h-[95vh] sm:max-h-auto flex flex-col">
            <!-- Header -->
            <div class="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-500/10 to-transparent flex-shrink-0">
                <div class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                    <span class="material-symbols-outlined text-3xl sm:text-4xl text-red-600 dark:text-red-400">warning</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-base sm:text-xl font-black uppercase tracking-tight text-text-main dark:text-white">Confirmar eliminación</h3>
                    <p class="text-xs sm:text-sm text-text-muted dark:text-gray-400 mt-0.5">Esta acción no se puede deshacer</p>
                </div>
            </div>
            
            <!-- Contenido -->
            <div class="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
                <div class="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500 p-3 sm:p-4 rounded-lg">
                    <p class="text-sm sm:text-base text-yellow-800 dark:text-yellow-300 font-semibold leading-relaxed">
                        ⚠️ ¿Estás seguro de que deseas <strong>desactivar este horario</strong>?
                    </p>
                </div>
                
                <p class="text-xs sm:text-sm text-text-main dark:text-gray-300 leading-relaxed">
                    El horario se marcará como inactivo y ya no estará disponible para nuevas inscripciones.
                </p>
                
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                    <p class="text-xs font-bold text-text-muted dark:text-gray-400 uppercase mb-2">
                        <span class="material-symbols-outlined text-sm align-middle">info</span>
                        Nota importante
                    </p>
                    <p class="text-xs text-text-muted dark:text-gray-400">
                        Los alumnos que ya están inscritos en este horario mantendrán su inscripción, pero no se permitirán nuevas inscripciones.
                    </p>
                </div>
            </div>
            
            <!-- Footer con botones -->
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] flex-shrink-0">
                <button onclick="cerrarModalEliminarHorario()" class="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-text-main dark:text-white font-bold text-sm uppercase tracking-wide hover:bg-gray-300 dark:hover:bg-gray-700 transition-all order-2 sm:order-1">
                    Cancelar
                </button>
                <button onclick="ejecutarEliminarHorario()" class="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-red-600 text-white font-bold text-sm uppercase tracking-wide hover:bg-red-700 transition-all shadow-lg order-1 sm:order-2">
                    Eliminar
                </button>
            </div>
        </div>
    </div>

    <!-- Modal No Se Puede Eliminar (Tiene Inscripciones) -->
    <div id="modalNoSePuedeEliminar" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
        <div class="relative w-full max-w-lg bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border-2 border-orange-500/30 overflow-hidden animate-[slideUp_0.3s_ease-out] max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500/10 to-transparent flex-shrink-0">
                <div class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                    <span class="material-symbols-outlined text-3xl sm:text-4xl text-orange-600 dark:text-orange-400">block</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-base sm:text-xl font-black uppercase tracking-tight text-text-main dark:text-white">No se Puede Eliminar</h3>
                    <p class="text-xs sm:text-sm text-text-muted dark:text-gray-400 mt-0.5">Horario con inscripciones activas</p>
                </div>
            </div>
            
            <!-- Contenido con scroll -->
            <div class="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
                <div class="bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-500 p-3 sm:p-4 rounded-lg">
                    <p class="text-sm sm:text-base text-orange-800 dark:text-orange-300 font-semibold leading-relaxed" id="MensajeNoSePuedeEliminar">
                        ℹ️ Este horario tiene <strong id="cantidadInscripciones">1</strong> inscripción(es) activa(s)
                    </p>
                </div>
                
                <p class="text-xs sm:text-sm text-text-main dark:text-gray-300 leading-relaxed">
                    No puedes eliminar este horario porque hay alumnos inscritos actualmente.
                </p>
                
                <div class="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                    <p class="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase mb-2">
                        <span class="material-symbols-outlined text-sm align-middle">lightbulb</span>
                        Opciones disponibles
                    </p>
                    <ul class="space-y-2 text-xs text-blue-800 dark:text-blue-200">
                        <li class="flex items-start gap-2">
                            <span class="text-primary flex-shrink-0">•</span>
                            <span><strong>Suspender temporalmente:</strong> Cambia el estado a "suspendido" en lugar de eliminarlo</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-primary flex-shrink-0">•</span>
                            <span><strong>Ver inscripciones:</strong> Revisa qu? alumnos est?n inscritos en la pesta?a "Pagos"</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-primary flex-shrink-0">•</span>
                            <span><strong>Esperar:</strong> Una vez finalizadías todías las inscripciones, podrá?s eliminarlo</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <!-- Footer con botones -->
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] flex-shrink-0">
                <button onclick="cerrarModalNoSePuedeEliminar()" class="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-text-main dark:text-white font-bold text-sm uppercase tracking-wide hover:bg-gray-300 dark:hover:bg-gray-700 transition-all order-2 sm:order-1">
                    Entendido
                </button>
                <button onclick="irAPagos()" class="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-primary text-black font-bold text-sm uppercase tracking-wide hover:bg-primary-dark transition-all shadow-lg order-1 sm:order-2">
                    Ver Inscripciones
                </button>
            </div>
        </div>
    </div>

    <style>
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* FORZAR MODAL COMPACTO */
        #modalHorario > div {
            max-width: 42rem !important;
        }
        #modalHorario form > div {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
        }
        #modalHorario label {
            font-size: 0.75rem !important;
            margin-bottom: 0.25rem !important;
        }
        #modalHorario input, #modalHorario select {
            padding: 0.375rem 0.5rem !important;
            font-size: 0.875rem !important;
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

export default function AdminCrud() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');

    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main font-display min-h-screen flex flex-col';

    if ('$inlineStyle') {
      const styleEl = document.createElement('style');
      styleEl.textContent = `$inlineStyle`;
      styleEl.setAttribute('data-inline', 'admin-crud');
      document.head.appendChild(styleEl);
    }

    let cancelled = false;

    (async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        await loadScript('/legacy/admin-crud.js');
        await loadScript('/legacy/admin-inscripciones.js');
      } catch (err) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }
    })();

    return () => {
      cancelled = true;
      const inline = document.querySelector('style[data-inline="admin-crud"]');
      inline?.remove();
    };
  }, []);

  return <div className="page-root" dangerouslySetInnerHTML={{ __html: html }} />;
}








