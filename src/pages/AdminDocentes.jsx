import React, { useEffect } from 'react';
import '../styles/animations.css';

const html = `
    
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-solid border-border-color bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm shadow-sm">
        <div class="px-4 py-4 lg:px-10">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 text-text-main dark:text-white flex-1 justify-center lg:justify-start">
                    <img src="assets/logo.ico" alt="Logo Jaguares" class="h-10 w-auto object-contain">
                    <h2 class="text-xl lg:text-2xl font-black italic uppercase tracking-wider text-black dark:text-white">JAGUARES</h2>
                </div>
                
                <button id="mobile-menu-btn" class="lg:hidden p-2 text-text-main dark:text-white hover:text-primary transition-colors" aria-label="Menú">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </button>
                
                <div class="hidden lg:flex items-center gap-4">
                    <a href="/admin-panel" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                        <span class="material-symbols-outlined text-lg">arrow_back</span>
                        Volver al Panel
                    </a>
                    <div class="text-right">
                        <p class="text-xs text-text-muted dark:text-gray-400 uppercase tracking-wide">Administrador</p>
                        <p id="adminEmail" class="text-sm font-semibold text-black dark:text-white"></p>
                    </div>
                    <button id="btnCerrarSesion" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                        <span class="material-symbols-outlined text-lg">logout</span>
                        Salir
                    </button>
                </div>
            </div>
            
            <!-- Menú móvil -->
            <div id="mobile-menu" class="hidden lg:hidden mt-4 pb-2 space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                <a href="/admin-panel" class="block w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-semibold text-base transition-colors text-center">
                    ← Volver al Panel
                </a>
                <button id="btnCerrarSesionMobile" class="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-semibold text-base transition-colors flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-lg">logout</span>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    </header>

    <main class="flex-grow px-4 sm:px-6 lg:px-10 py-8">
        <div class="max-w-screen-2xl mx-auto">
            
            <!-- Título -->
            <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 class="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-black dark:text-white">
                        Gestión de <span class="text-primary">Docentes</span>
                    </h1>
                    <p class="text-text-muted dark:text-gray-400 mt-2">Administra profesores y asigna deportes/categorías</p>
                </div>
                <button onclick="abrirModalNuevoDocente()" class="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm uppercase tracking-wide transition-all shadow-lg hover:shadow-xl">
                    <span class="material-symbols-outlined">person_add</span>
                    Nuevo Docente
                </button>
            </div>

            <!-- Tabs -->
            <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav class="flex flex-wrap gap-2 -mb-px overflow-x-auto">
                    <button onclick="cambiarTab('docentes')" id="tab-docentes" class="tab-btn px-4 py-3 whitespace-nowrap text-sm font-bold uppercase tracking-wide border-b-2 border-primary text-primary transition-colors">
                        <span class="material-symbols-outlined align-middle mr-1">school</span>
                        Docentes
                    </button>
                    <button onclick="cambiarTab('asignaciones')" id="tab-asignaciones" class="tab-btn px-4 py-3 whitespace-nowrap text-sm font-bold uppercase tracking-wide border-b-2 border-transparent text-gray-500 hover:text-primary transition-colors">
                        <span class="material-symbols-outlined align-middle mr-1">assignment</span>
                        Asignaciones
                    </button>
                    <button onclick="cambiarTab('asistencias')" id="tab-asistencias" class="tab-btn px-4 py-3 whitespace-nowrap text-sm font-bold uppercase tracking-wide border-b-2 border-transparent text-gray-500 hover:text-primary transition-colors">
                        <span class="material-symbols-outlined align-middle mr-1">fact_check</span>
                        Reportes Asistencia
                    </button>
                </nav>
            </div>

            <!-- Panel de Docentes -->
            <div id="panel-docentes" class="tab-panel">
                <!-- Stats rápidos -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-md border-l-4 border-blue-500">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-3xl text-blue-500">groups</span>
                            <div>
                                <p class="text-2xl font-black text-black dark:text-white" id="stat-total-docentes">0</p>
                                <p class="text-xs text-text-muted uppercase">Total Docentes</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-md border-l-4 border-green-500">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-3xl text-green-500">check_circle</span>
                            <div>
                                <p class="text-2xl font-black text-black dark:text-white" id="stat-docentes-activos">0</p>
                                <p class="text-xs text-text-muted uppercase">Activos</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-md border-l-4 border-primary">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-3xl text-primary">sports</span>
                            <div>
                                <p class="text-2xl font-black text-black dark:text-white" id="stat-asignaciones">0</p>
                                <p class="text-xs text-text-muted uppercase">Asignaciones</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabla de docentes -->
                <div class="bg-white dark:bg-surface-dark rounded-xl shadow-md overflow-hidden">
                    <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 class="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined">school</span>
                            Lista de Docentes
                        </h2>
                        <div class="relative">
                            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input type="text" id="buscarDocente" placeholder="Buscar docente..." class="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-sm w-full md:w-64 focus:ring-2 focus:ring-primary">
                        </div>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Docente</th>
                                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Usuario</th>
                                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Deportes Asignados</th>
                                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Estado</th>
                                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Último Acceso</th>
                                    <th class="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-docentes" class="divide-y divide-gray-200 dark:divide-gray-700">
                                <!-- Se llena dinámicamente -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div id="loading-docentes" class="p-8 text-center hidden">
                        <span class="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                        <p class="text-text-muted mt-2">Cargando docentes...</p>
                    </div>
                    
                    <div id="sin-docentes" class="p-8 text-center hidden">
                        <span class="material-symbols-outlined text-5xl text-gray-400 mb-2">person_off</span>
                        <p class="text-gray-500">No hay docentes registrados</p>
                        <button onclick="abrirModalNuevoDocente()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm">
                            Agregar primer docente
                        </button>
                    </div>
                </div>
            </div>

            <!-- Panel de Asignaciones -->
            <div id="panel-asignaciones" class="tab-panel hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Nueva asignación -->
                    <div class="bg-white dark:bg-surface-dark rounded-xl shadow-md p-6">
                        <h2 class="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">add_circle</span>
                            Nueva Asignación
                        </h2>
                        
                        <form id="form-asignacion" class="space-y-4">
                            <div>
                                <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">
                                    Docente
                                </label>
                                <select id="asig-docente" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary" required>
                                    <option value="">Seleccione un docente...</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">
                                    Deporte
                                </label>
                                <select id="asig-deporte" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary" required>
                                    <option value="">Seleccione un deporte...</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">
                                    Día
                                </label>
                                <select id="asig-dia" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary" required>
                                    <option value="">Seleccione un día...</option>
                                    <option value="LUNES">Lunes</option>
                                    <option value="MARTES">Martes</option>
                                    <option value="MIERCOLES">Miércoles</option>
                                    <option value="JUEVES">Jueves</option>
                                    <option value="VIERNES">Viernes</option>
                                    <option value="SABADO">Sábado</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">
                                    Horario Específico
                                </label>
                                <select id="asig-horario" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary" required>
                                    <option value="">Primero seleccione deporte y día...</option>
                                </select>
                                <p class="text-xs text-gray-500 mt-1">El horario incluye categoría, hora de inicio y fin</p>
                            </div>

                            <button type="submit" class="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-wide rounded-lg transition-all flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined">add</span>
                                Asignar Horario
                            </button>
                        </form>
                    </div>

                    <!-- Lista de asignaciones actuales -->
                    <div class="bg-white dark:bg-surface-dark rounded-xl shadow-md p-6">
                        <h2 class="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">list</span>
                            Asignaciones Actuales
                        </h2>
                        
                        <div id="lista-asignaciones" class="space-y-3 max-h-[500px] overflow-y-auto">
                            <!-- Se llena dinámicamente -->
                        </div>
                        
                        <div id="sin-asignaciones" class="text-center py-8 hidden">
                            <span class="material-symbols-outlined text-5xl text-gray-400 mb-2">assignment</span>
                            <p class="text-gray-500">No hay asignaciones registradías</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel de Reportes de Asistencia -->
            <div id="panel-asistencias" class="tab-panel hidden">
                <div class="bg-white dark:bg-surface-dark rounded-xl shadow-md p-6 mb-6">
                    <h2 class="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">filter_list</span>
                        Filtros de Reporte
                    </h2>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">Fecha Inicio</label>
                            <input type="date" id="reporte-fecha-inicio" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">Fecha Fin</label>
                            <input type="date" id="reporte-fecha-fin" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">Deporte</label>
                            <select id="reporte-deporte" onchange="cargarCategoriasReporte()" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary">
                                <option value="">Todos los deportes</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">Categoría</label>
                            <select id="reporte-categoria" onchange="cargarDiasReporte()" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary">
                                <option value="">Todas las categorías</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">Día</label>
                            <select id="reporte-dia" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary">
                                <option value="">Todos los días</option>
                            </select>
                        </div>
                        <div class="flex flex-col sm:flex-row sm:items-end gap-2">
                            <button onclick="cargarReporteAsistencias()" class="w-full sm:w-auto flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-wide rounded-lg transition-all flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined">search</span>
                                Generar Reporte
                            </button>
                            <button onclick="exportarExcel()" id="btn-exportar-excel" class="w-full sm:w-auto py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled title="Exportar a Excel">
                                <span class="material-symbols-outlined">download</span>
                                <span class="hidden sm:inline">Excel</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Estadísticas generales -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-md border-l-4 border-green-500">
                        <p class="text-3xl font-black text-green-500" id="reporte-presentes">0</p>
                        <p class="text-xs text-text-muted uppercase">Presentes</p>
                    </div>
                    <div class="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-md border-l-4 border-red-500">
                        <p class="text-3xl font-black text-red-500" id="reporte-ausentes">0</p>
                        <p class="text-xs text-text-muted uppercase">Ausentes</p>
                    </div>
                    <div class="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-md border-l-4 border-blue-500">
                        <p class="text-3xl font-black text-blue-500" id="reporte-total">0</p>
                        <p class="text-xs text-text-muted uppercase">Total Registros</p>
                    </div>
                    <div class="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-md border-l-4 border-primary">
                        <p class="text-3xl font-black text-primary" id="reporte-porcentaje">0%</p>
                        <p class="text-xs text-text-muted uppercase">% Asistencia</p>
                    </div>
                </div>

                <!-- Tabla de asistencias -->
                <div class="bg-white dark:bg-surface-dark rounded-xl shadow-md overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Fecha</th>
                                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Deporte</th>
                                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Categoría</th>
                                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Día</th>
                                    <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Horario</th>
                                    <th class="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Presentes</th>
                                    <th class="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Ausentes</th>
                                    <th class="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">% Asistencia</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-reporte-asistencias" class="divide-y divide-gray-200 dark:divide-gray-700">
                                <!-- Se llena dinámicamente -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div id="sin-reporte" class="p-8 text-center">
                        <span class="material-symbols-outlined text-5xl text-gray-400 mb-2">calendar_month</span>
                        <p class="text-gray-500">Seleccione un rango de fechas para ver el reporte</p>
                    </div>
                </div>
            </div>

        </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-border-color bg-surface-light dark:bg-surface-dark py-6 mt-8">
        <div class="px-4 sm:px-6 lg:px-10">
            <p class="text-center text-sm text-text-muted dark:text-gray-400">
                © 2026 JAGUARES - Sistema de Gestión Deportiva
            </p>
        </div>
    </footer>

    <!-- Modal: Nuevo/Editar Docente -->
    <div id="modal-docente" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-surface-dark rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-black text-black dark:text-white uppercase" id="modal-docente-titulo">Nuevo Docente</h3>
                <button onclick="cerrarModalDocente()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form id="form-docente" class="space-y-4">
                <input type="hidden" id="docente-id">
                
                <div>
                    <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">
                        Nombre Completo *
                    </label>
                    <input type="text" id="docente-nombre" required class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary" placeholder="Ej: Carlos Mendoza Ríos">
                </div>

                <div>
                    <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">
                        Usuario *
                    </label>
                    <input type="text" id="docente-usuario" required class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary" placeholder="Ej: carlos.Mendoza">
                </div>

                <div>
                    <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">
                        Email *
                    </label>
                    <input type="email" id="docente-email" required class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary" placeholder="Ej: carlos@jaguares.com">
                </div>

                <div id="campo-password">
                    <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">
                        Contraseña *
                    </label>
                    <div class="relative">
                        <input type="password" id="docente-password" class="w-full h-12 px-4 pr-12 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary" placeholder="Mínimo 8 caracteres">
                        <button type="button" onclick="togglePassword()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <span class="material-symbols-outlined" id="toggle-password-icon">visibility</span>
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Debe contener mayúsculas, minúsculas, números y símbolos</p>
                </div>

                <div class="pt-4 flex gap-3">
                    <button type="button" onclick="cerrarModalDocente()" class="flex-1 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white font-bold uppercase tracking-wide rounded-lg transition-all">
                        Cancelar
                    </button>
                    <button type="submit" class="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-wide rounded-lg transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">save</span>
                        <span id="btn-guardar-texto">Crear Docente</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal: Confirmar Toggle Estado Docente -->
    <div id="modalToggleDocente" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-surface-dark rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
            <div class="bg-yellow-500 p-6 text-center">
                <span class="material-symbols-outlined text-5xl text-white">person_off</span>
            </div>
            <div class="p-6 text-center">
                <h3 class="text-xl font-bold text-black dark:text-white mb-2" id="toggleDocente-titulo">¿Desactivar docente?</h3>
                <p class="text-text-muted dark:text-gray-400 mb-6" id="toggleDocente-subtitulo">El docente no podrá iniciar sesión mientras esté inactivo.</p>
                <div class="flex gap-3">
                    <button onclick="cerrarModalToggleDocente()" class="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancelar
                    </button>
                    <button onclick="confirmarToggleDocente()" id="btn-confirmar-toggle" class="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal: Eliminar Docente -->
    <div id="modalEliminarDocente" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-surface-dark rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
            <div class="bg-red-600 p-6 text-center">
                <span class="material-symbols-outlined text-5xl text-white">person_remove</span>
            </div>
            <div class="p-6 text-center">
                <h3 class="text-xl font-bold text-black dark:text-white mb-2">Eliminar Docente</h3>
                <p class="text-text-muted dark:text-gray-400 mb-1">Estás por eliminar a:</p>
                <p class="text-lg font-bold text-red-600 mb-2" id="eliminarDocente-nombre"></p>
                <p class="text-sm text-text-muted dark:text-gray-400 mb-6">Se eliminarán también todas sus asignaciones de horarios. Esta acción <strong>no se puede deshacer</strong>.</p>
                <div class="flex gap-3">
                    <button onclick="cerrarModalEliminarDocente()" class="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancelar
                    </button>
                    <button onclick="confirmarEliminarDocente()" class="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                        Sí, eliminar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal: Confirmación -->
    <div id="modal-confirmacion" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-surface-dark rounded-2xl p-6 max-w-md w-full shadow-2xl text-center animate-scale-in">
            <span class="material-symbols-outlined text-6xl text-green-500 mb-4">check_circle</span>
            <h3 class="text-xl font-bold text-black dark:text-white mb-2" id="confirmacion-titulo">¡Operación EÉxitosa!</h3>
            <p class="text-text-muted dark:text-gray-400 mb-6" id="confirmacion-Mensaje">La operación se ha realizado correctamente.</p>
            <button onclick="cerrarModalConfirmacion()" class="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors">
                Aceptar
            </button>
        </div>
    </div>

    <!-- Notificación Toast -->
    <div id="toast" class="hidden fixed bottom-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in-down">
        <span class="material-symbols-outlined text-2xl" id="toast-icon">info</span>
        <span id="toast-Mensaje" class="font-semibold"></span>
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

export default function AdminDocentes() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');

    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main font-sans admin-readable min-h-screen flex flex-col';

    let cancelled = false;

    (async () => {
      try {
        await loadScript('/legacy/api-service.js');
        await loadScript('https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js');
        await loadScript('/legacy/admin-docentes.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));
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









