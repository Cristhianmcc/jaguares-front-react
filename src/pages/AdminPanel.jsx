import React, { useEffect } from 'react';

const html = `
    <header class="sticky top-0 z-50 border-b border-solid border-border-color bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm shadow-sm">
        <div class="px-4 py-4 lg:px-10">
            <div class="flex items-center justify-between">
                <!-- Logo centrado en móvil -->
                <div class="flex items-center gap-3 text-text-main dark:text-white flex-1 justify-center lg:justify-start">
                    <img src="assets/logo.ico" alt="Logo Jaguares" class="h-10 w-auto object-contain">
                    <h2 class="text-xl lg:text-2xl font-black italic uppercase tracking-wider text-black dark:text-white">JAGUARES</h2>
                </div>
                
                <!-- Botón hamburguesa -->
                <button id="mobile-menu-btn" class="lg:hidden p-2 text-text-main dark:text-white hover:text-primary transition-colors" aria-label="Menú">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </button>
                
                <!-- Admin info y cerrar sesión (desktop) -->
                <div class="hidden lg:flex items-center gap-4">
                    <div class="text-right">
                        <p class="text-xs text-text-muted dark:text-gray-400 uppercase tracking-wide">Administrador</p>
                        <p id="adminEmail" class="text-sm font-semibold text-black dark:text-white"></p>
                    </div>
                    <button id="btnCerrarSesion" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                        <span class="material-symbols-outlined text-lg">logout</span>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
            
            <!-- Menú móvil con admin info -->
            <div id="mobile-menu" class="hidden lg:hidden mt-4 pb-2 space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                <div class="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p class="text-xs text-text-muted dark:text-gray-400 uppercase tracking-wide mb-1">Administrador</p>
                    <p id="adminEmailMobile" class="text-sm font-semibold text-black dark:text-white"></p>
                </div>
                <button id="btnCerrarSesionMobile" class="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-semibold text-base transition-colors flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-lg">logout</span>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    </header>

    <main class="flex-grow px-4 sm:px-6 lg:px-10 py-8">
        <div class="max-w-screen-2xl mx-auto">
            <div class="mb-8">
                <h1 class="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-black dark:text-white">
                    Panel de <span class="text-primary">Control</span>
                </h1>
                <p class="text-text-muted dark:text-gray-400 mt-2">Gestión de inscripciones y usuarios</p>
                <div class="mt-4">
                    <a href="/admin-dashboard" class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm transition-colors">
                        <span class="material-symbols-outlined">analytics</span>
                        Ver Dashboard Financiero
                    </a>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Total Inscritos</p>
                            <p id="totalInscritos" class="text-3xl font-black text-black dark:text-white mt-1">0</p>
                        </div>
                        <span class="material-symbols-outlined text-5xl text-blue-500">group</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-green-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Activos</p>
                            <p id="totalActivos" class="text-3xl font-black text-black dark:text-white mt-1">0</p>
                        </div>
                        <span class="material-symbols-outlined text-5xl text-green-500">check_circle</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Pendientes</p>
                            <p id="totalPendientes" class="text-3xl font-black text-black dark:text-white mt-1">0</p>
                        </div>
                        <span class="material-symbols-outlined text-5xl text-yellow-500">pending</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-gray-400">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Inactivos</p>
                            <p id="totalInactivos" class="text-3xl font-black text-black dark:text-white mt-1">0</p>
                        </div>
                        <span class="material-symbols-outlined text-5xl text-gray-400">person_off</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-primary">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Estadísticas</p>
                            <p class="text-lg font-black text-black dark:text-white mt-1">Dashboard Financiero</p>
                        </div>
                        <a href="/admin-dashboard" class="material-symbols-outlined text-5xl text-primary hover:text-primary-dark transition-colors cursor-pointer">analytics</a>
                    </div>
                </div>

                <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-green-600">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Gestión de Datos</p>
                            <p class="text-lg font-black text-black dark:text-white mt-1">Deportes y Horarios</p>
                        </div>
                        <a href="/admin-crud" class="material-symbols-outlined text-5xl text-green-600 hover:text-green-700 transition-colors cursor-pointer">database</a>
                    </div>
                </div>

                <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-purple-600">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Administración</p>
                            <p class="text-lg font-black text-black dark:text-white mt-1">Gestión de Usuarios</p>
                        </div>
                        <a href="/admin-usuarios" class="material-symbols-outlined text-5xl text-purple-600 hover:text-purple-700 transition-colors cursor-pointer">group</a>
                    </div>
                </div>

                <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-cyan-600">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Reubicaciones</p>
                            <p class="text-lg font-black text-black dark:text-white mt-1">Mover Alumnos</p>
                        </div>
                        <a href="/admin-reubicaciones" class="material-symbols-outlined text-5xl text-cyan-600 hover:text-cyan-700 transition-colors cursor-pointer">swap_horiz</a>
                    </div>
                </div>

                <div class="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-orange-600">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-text-muted dark:text-gray-400 uppercase">Docentes</p>
                            <p class="text-lg font-black text-black dark:text-white mt-1">Gestión y Asistencias</p>
                        </div>
                        <a href="/admin-docentes" class="material-symbols-outlined text-5xl text-orange-600 hover:text-orange-700 transition-colors cursor-pointer">school</a>
                    </div>
                </div>
            </div>

            <!-- Sección de Configuración del Sistema -->
            <div class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-xl mb-6">
                <div class="flex items-center gap-3 mb-4">
                    <span class="material-symbols-outlined text-2xl text-primary">settings</span>
                    <h2 class="text-xl font-bold text-black dark:text-white uppercase tracking-tight">
                        Configuración del Sistema
                    </h2>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Toggle Matrícula -->
                    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <span class="material-symbols-outlined text-amber-600 dark:text-amber-400">payments</span>
                                </div>
                                <div>
                                    <p class="font-bold text-black dark:text-white text-sm">Cobrar Matrícula</p>
                                    <p class="text-xs text-text-muted dark:text-gray-400">En nuevas inscripciones</p>
                                </div>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="toggleMatricula" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        <p id="matriculaEstado" class="text-xs mt-3 text-green-600 dark:text-green-400 font-semibold">
                             Matrícula ACTIVA - Se cobra en inscripciones
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-xl mb-6">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 class="text-xl font-bold text-black dark:text-white uppercase tracking-tight">
                        Lista de Inscritos
                    </h2>
                    <div class="flex flex-wrap gap-3">
                        <div class="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 w-full sm:w-auto">
                            <span class="material-symbols-outlined text-text-muted">badge</span>
                            <input type="text" id="filtroDNI" placeholder="Buscar por DNI (8 dígitos)" 
                                   maxlength="8" pattern="[0-9]{8}" 
                                   class="bg-transparent border-none focus:outline-none text-sm font-semibold w-48 text-black dark:text-white" />
                        </div>
                        
                        <select id="filtroDia" class="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary">
                            <option value="">Todos los días</option>
                            <option value="LUNES">Lunes</option>
                            <option value="MARTES">Martes</option>
                            <option value="MIERCOLES">Miércoles</option>
                            <option value="JUEVES">Jueves</option>
                            <option value="VIERNES">Viernes</option>
                            <option value="SÁBADO">Sábado</option>
                            <option value="DOMINGO">Domingo</option>
                        </select>

                        <select id="filtroDeporte" class="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary">
                            <option value="">Todos los deportes</option>
                            <option value="FÚTBOL">Fútbol</option>
                            <option value="VÓLEY">Vóley</option>
                            <option value="BÁSQUET">Básquet</option>
                            <option value="FÚTBOL Femenino">Fútbol Femenino</option>
                            <option value="ENTRENAMIENTO FUNCIONAL ADULTOS">Func. Adultos</option>
                            <option value="ENTRENAMIENTO FUNCIONAL MenorES">Func. Menores</option>
                        </select>

                        <button id="btnFiltrar" class="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined">filter_list</span>
                            Filtrar
                        </button>

                        <button id="btnLimpiarFiltros" class="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-semibold text-sm transition-colors">
                            Limpiar
                        </button>
                    </div>
                </div>

                <div id="loadingContainer" class="text-center py-12">
                    <span class="material-symbols-outlined animate-spin text-6xl text-primary">progress_activity</span>
                    <p class="text-text-muted mt-4">Cargando datos...</p>
                </div>

                <div id="detalleUsuario" class="hidden bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">person</span>
                            Información del Usuario
                        </h3>
                        <button onclick="cerrarDetalleUsuario()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Columna 1: Datos Personales -->
                        <div class="space-y-2">
                            <h4 class="font-semibold text-xs text-primary mb-2 uppercase">Datos Personales</h4>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">badge</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">DNI</p>
                                    <p class="font-bold text-sm truncate" id="detalleDNI">-</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">person</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Nombre Completo</p>
                                    <p class="font-bold text-xs truncate" id="detalleNombre">-</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">cake</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Fecha Nac.</p>
                                    <p class="font-bold text-xs truncate" id="detalleFechaNacimiento">-</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">calendar_month</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Edad / Sexo</p>
                                    <p class="font-bold text-sm truncate" id="detalleEdadSexo">-</p>
                                </div>
                            </div>
                        </div>

                        <!-- Columna 2: Contacto y Apoderado -->
                        <div class="space-y-2">
                            <h4 class="font-semibold text-xs text-primary mb-2 uppercase">Contacto</h4>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">phone</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Teléfono</p>
                                    <p class="font-bold text-sm truncate" id="detalleTelefono">-</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">email</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Email</p>
                                    <p class="font-bold text-xs truncate" id="detalleEmail">-</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">home</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Dirección</p>
                                    <p class="font-bold text-xs truncate" id="detalleDireccion">-</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">family_restroom</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Apoderado</p>
                                    <p class="font-bold text-xs truncate" id="detalleApoderado">-</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">contact_phone</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Tel. Apoderado</p>
                                    <p class="font-bold text-sm truncate" id="detalleTelefonoApoderado">-</p>
                                </div>
                            </div>
                        </div>

                        <!-- Columna 3: Salud y Pago -->
                        <div class="space-y-2">
                            <h4 class="font-semibold text-xs text-primary mb-2 uppercase">Salud</h4>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">medical_services</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Seguro</p>
                                    <p class="font-bold text-xs truncate" id="detalleSeguroTipo">-</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">health_and_safety</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Condición Médica</p>
                                    <p class="font-bold text-xs truncate" id="detalleCondicionMedica">-</p>
                                </div>
                            </div>
                            
                            <h4 class="font-semibold text-xs text-primary mb-2 mt-3 uppercase">Pago</h4>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">payments</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Monto</p>
                                    <p class="font-bold text-green-600 text-sm truncate" id="detalleMonto">-</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">credit_card</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Método</p>
                                    <p class="font-bold text-sm truncate" id="detalleMetodoPago">-</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <span class="material-symbols-outlined text-primary text-sm">verified</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-text-muted">Estado</p>
                                    <p class="font-bold text-sm truncate" id="detalleEstadoPago">-</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sección de Comprobante y documentos -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6" id="seccionImagenes">
                        <!-- Se llenará dinámicamente con JavaScript con las 4 imágenes -->
                    </div>

                    <div class="mt-6">
                        <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">event</span>
                            Horarios Inscritos
                        </h4>
                        <div id="detalleHorarios" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        </div>
                    </div>
                </div>

                <div id="tablaContainer" class="hidden overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b-2 border-gray-200 dark:border-gray-800">
                                <th class="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-text-muted">DNI</th>
                                <th class="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-text-muted">Nombres</th>
                                <th class="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-text-muted">Apellidos</th>
                                <th class="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-text-muted">Teléfono</th>
                                <th class="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-text-muted">Deporte</th>
                                <th class="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-text-muted">Horario</th>
                                <th class="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-text-muted">Estado</th>
                                <th class="px-4 py-3 text-center font-bold text-xs uppercase tracking-wider text-text-muted">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaBody">
                        </tbody>
                    </table>
                </div>

                <div id="sinResultados" class="hidden text-center py-12">
                    <span class="material-symbols-outlined text-6xl text-text-muted">search_off</span>
                    <p class="text-text-muted mt-4 font-semibold">No se encontraron resultados</p>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal Desactivar Usuario -->
    <div id="modalDesactivar" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-surface-dark rounded-xl p-8 max-w-md w-full shadow-2xl border-2 border-red-500/30">
            <div class="text-center mb-6">
                <div class="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span class="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">person_off</span>
                </div>
                <h3 class="text-2xl font-bold text-black dark:text-white mt-4 uppercase tracking-tight">Desactivar Usuario</h3>
            </div>
            <p class="text-text-muted dark:text-gray-400 text-center mb-2">
                ¿Estás seguro de desactivar al usuario con DNI <span id="dniDesactivar" class="font-bold text-black dark:text-white font-mono"></span>?
            </p>
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-3">
                <p class="text-sm text-red-800 dark:text-red-300 font-bold mb-2">
                    <span class="material-symbols-outlined text-base align-middle mr-1">warning</span>
                    Se desactivarán TODAS las inscripciones de este DNI
                </p>
                <p class="text-xs text-red-700 dark:text-red-400">
                    El usuario no podrá consultar sus datos ni asistir a ninguno de sus deportes/horarios registrados.
                </p>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
                <p class="text-xs text-blue-800 dark:text-blue-300">
                    <strong>?Y'? Control granular:</strong> Para desactivar solo una inscripción específica (1 deporte/horario), hazlo manualmente desde la hoja <span class="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">INSCRIPCIONES</span> en Google Sheets cambiando el campo <span class="font-mono">estado_usuario</span> a <span class="font-mono">inactivo</span>.
                </p>
            </div>
            <div class="flex gap-3">
                <button id="btnCancelarDesactivar" class="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-bold uppercase tracking-wide transition-colors">
                    Cancelar
                </button>
                <button id="btnConfirmarDesactivar" class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold uppercase tracking-wide transition-colors shadow-lg">
                    Desactivar
                </button>
            </div>
        </div>
    </div>

    <!-- Modal Reactivar Usuario -->
    <div id="modalReactivar" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-surface-dark rounded-xl p-8 max-w-md w-full shadow-2xl border-2 border-green-500/30">
            <div class="text-center mb-6">
                <div class="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span class="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">check_circle</span>
                </div>
                <h3 class="text-2xl font-bold text-black dark:text-white mt-4 uppercase tracking-tight">Reactivar Usuario</h3>
            </div>
            <p class="text-text-muted dark:text-gray-400 text-center mb-2">
                ¿Confirmas reactivar al usuario con DNI <span id="dniReactivar" class="font-bold text-black dark:text-white font-mono"></span>?
            </p>
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-3">
                <p class="text-sm text-green-800 dark:text-green-300 font-bold mb-2">
                    <span class="material-symbols-outlined text-base align-middle mr-1">check_circle</span>
                    Se reactivarán TODAS las inscripciones de este DNI
                </p>
                <p class="text-xs text-green-700 dark:text-green-400">
                    El usuario podrá volver a consultar sus datos y asistir a todos sus deportes/horarios registrados.
                </p>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
                <p class="text-xs text-blue-800 dark:text-blue-300">
                    <strong>?Y'? Control granular:</strong> Para reactivar solo una inscripción específica, hazlo manualmente desde la hoja <span class="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">INSCRIPCIONES</span> en Google Sheets.
                </p>
            </div>
            <div class="flex gap-3">
                <button id="btnCancelarReactivar" class="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-bold uppercase tracking-wide transition-colors">
                    Cancelar
                </button>
                <button id="btnConfirmarReactivar" class="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold uppercase tracking-wide transition-colors shadow-lg">
                    Reactivar
                </button>
            </div>
        </div>
    </div>

    <!-- Modal Confirmar Eliminación de Alumno -->
    <div id="modalEliminarAlumno" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-red-200 dark:border-red-900">
            <div class="bg-red-600 px-6 py-5 flex items-center gap-3">
                <span class="material-symbols-outlined text-white text-3xl">person_remove</span>
                <div>
                    <h3 class="text-xl font-black italic uppercase text-white tracking-tight">Eliminar Alumno</h3>
                    <p class="text-red-100 text-sm">Esta acción no se puede deshacer</p>
                </div>
            </div>
            <div class="px-6 py-5">
                <p class="text-text-main dark:text-gray-200 text-base">
                    ¿Estás seguro de eliminar al alumno
                    <span id="modalEliminarAlumnoNombre" class="font-black text-red-600"></span>?
                </p>
                <div class="mt-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded p-3 text-sm text-red-800 dark:text-red-300">
                    Se eliminarán <strong>todas sus inscripciones, asistencias y puntos de ranking</strong> junto con su registro.
                </div>
            </div>
            <div class="px-6 pb-6 flex gap-3 justify-end">
                <button onclick="cerrarModalEliminarAlumno()" class="px-5 py-2 rounded-lg font-bold text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white transition-colors">
                    Cancelar
                </button>
                <button id="btnConfirmarEliminarAlumno" class="px-5 py-2 rounded-lg font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-base">delete_forever</span>
                    Eliminar todo
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

export default function AdminPanel() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');

    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main font-display min-h-screen flex flex-col';

    let cancelled = false;

    (async () => {
      try {
        const session = localStorage.getItem('adminSession');
        if (session) {
          const data = JSON.parse(session);
          if (data?.admin?.rol === 'profesor') {
            window.location.href = '/profesor';
            return;
          }
        }

        await loadScript('/legacy/api-service.js');
        await loadScript('/legacy/admin-panel.js');
        await loadScript('/legacy/admin-inscripciones.js');
        await loadScript('/legacy/mobile-menu.js');
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











