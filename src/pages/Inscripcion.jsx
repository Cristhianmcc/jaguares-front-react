import React, { useEffect } from 'react';
import '../styles/inscripcion.css';
import '../styles/animations.css';
import '../legacy/api-service.js';
import { initInscripcion } from '../legacy/inscripcion.js';
import { initMobileMenu } from '../legacy/mobile-menu.js';

const html = `
    <header class="sticky top-0 z-50 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-solid border-border-color shadow-sm">
        <div class="px-4 py-4 lg:px-10">
            <div class="flex items-center justify-between">
                <!-- Logo centrado en móvil -->
                <div class="flex items-center gap-3 text-text-main dark:text-white flex-1 justify-center lg:justify-start">
                    <img src="assets/logo.ico" alt="Logo Jaguares" class="h-10 w-auto object-contain">
                    <h2 class="text-xl lg:text-2xl font-black uppercase tracking-wider text-black dark:text-white">JAGUARES</h2>
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
                        <a class="text-text-main dark:text-gray-200 text-sm font-semibold uppercase tracking-wide hover:text-primary transition-colors" href="/">Inicio</a>
                        <a class="text-text-main dark:text-gray-200 text-sm font-semibold uppercase tracking-wide hover:text-primary transition-colors" href="#">Nosotros</a>
                        <a class="text-text-main dark:text-gray-200 text-sm font-semibold uppercase tracking-wide hover:text-primary transition-colors" href="#">Sedes</a>
                        <a class="text-text-main dark:text-gray-200 text-sm font-semibold uppercase tracking-wide hover:text-primary transition-colors" href="#">Contacto</a>
                        <a class="text-text-main dark:text-gray-200 text-sm font-semibold uppercase tracking-wide hover:text-primary transition-colors" href="/admin-login" title="Acceso Administrador">Admin</a>
                    </nav>
                </div>
            </div>
            
            <!-- Menú móvil -->
            <div id="mobile-menu" class="hidden lg:hidden mt-4 pb-2 space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                <a class="block text-text-main dark:text-white hover:text-primary text-base font-semibold uppercase tracking-wide transition-colors py-2" href="/">Inicio</a>
                <a class="block text-text-main dark:text-white hover:text-primary text-base font-semibold uppercase tracking-wide transition-colors py-2" href="#">Nosotros</a>
                <a class="block text-text-main dark:text-white hover:text-primary text-base font-semibold uppercase tracking-wide transition-colors py-2" href="#">Sedes</a>
                <a class="block text-text-main dark:text-white hover:text-primary text-base font-semibold uppercase tracking-wide transition-colors py-2" href="#">Contacto</a>
                <a class="block text-text-main dark:text-white hover:text-primary text-base font-semibold uppercase tracking-wide transition-colors py-2" href="/admin-login">Admin</a>
            </div>
        </div>
    </header>

    <main class="flex-grow flex flex-col items-center justify-start py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="w-full max-w-[960px] flex flex-col gap-8">
            <div class="flex flex-col gap-6">
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <div>
                        <h1 class="text-black dark:text-white text-4xl md:text-5xl font-black uppercase tracking-tight">Inscripción <span class="text-primary">2026</span></h1>
                        <p class="text-text-muted dark:text-gray-400 text-lg font-medium mt-2">Comienza tu camino al alto rendimiento.</p>
                    </div>
                    <div class="hidden md:block">
                        <span class="ins-season-badge px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-md text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">Temporada Anual</span>
                    </div>
                </div>

                <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <div class="flex justify-between mb-3">
                        <span class="text-black dark:text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                            <span class="w-6 h-6 rounded-full bg-black text-primary flex items-center justify-center text-xs">1</span>
                            Datos del Alumno
                        </span>
                        <span class="text-text-muted dark:text-gray-500 text-xs font-bold uppercase">Paso 1 de 3</span>
                    </div>
                    <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-2 overflow-hidden">
                        <div class="ins-step-progress-fill bg-gradient-to-r from-primary to-primary-dark h-1.5 rounded-full" style="width: 33%"></div>
                    </div>
                    <div class="flex justify-between text-[10px] uppercase font-bold tracking-wider text-text-muted/60 dark:text-gray-600 mt-2">
                        <span class="text-primary">Datos Personales</span>
                        <span>Horarios</span>
                        <span>Confirmación</span>
                    </div>
                </div>
            </div>

            <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-10 shadow-xl border-t-4 border-primary">
                <div class="mb-10">
                    <h3 class="text-2xl font-bold text-black dark:text-white uppercase tracking-tight">Información del Postulante</h3>
                    <p class="text-sm text-text-muted dark:text-gray-400 mt-2">Ingresa el DNI para autocompletar o llena los campos manualmente.</p>
                </div>

                <form id="formInscripcion" class="flex flex-col gap-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="flex flex-col gap-2 group">
                            <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                DNI / documento <span class="text-red-500">*</span>
                            </label>
                            <div class="relative flex items-center">
                                <input id="dni" name="dni" maxlength="8" pattern="[0-9]{8}" class="w-full h-12 pl-4 pr-14 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all shadow-sm group-hover:border-primary/50" placeholder="Ingrese número de documento (8 dígitos)" type="text" inputmode="numeric" required/>
                                <button id="btnBuscarDni" class="absolute right-1 top-1 bottom-1 w-12 flex items-center justify-center rounded-md bg-black text-primary hover:bg-gray-900 transition-colors shadow-sm" title="Buscar DNI" type="button">
                                    <span class="material-symbols-outlined text-xl">search</span>
                                </button>
                            </div>
                            <span class="text-xs text-primary hidden" id="dni-helper">Buscando datos...</span>
                        </div>

                        <div class="flex flex-col gap-2 group">
                            <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                Fecha de Nacimiento <span class="text-red-500">*</span>
                            </label>
                            <input type="hidden" id="fecha_nacimiento" name="fecha_nacimiento"/>
                            <div class="grid grid-cols-3 gap-2">
                                <select id="dia_nac" class="w-full h-12 px-2 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm text-gray-500 dark:text-gray-300">
                                    <option value="">Día</option>
                                </select>
                                <select id="mes_nac" class="w-full h-12 px-2 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm text-gray-500 dark:text-gray-300">
                                    <option value="">Mes</option>
                                    <option value="01">Enero</option>
                                    <option value="02">Febrero</option>
                                    <option value="03">Marzo</option>
                                    <option value="04">Abril</option>
                                    <option value="05">Mayo</option>
                                    <option value="06">Junio</option>
                                    <option value="07">Julio</option>
                                    <option value="08">Agosto</option>
                                    <option value="09">Septiembre</option>
                                    <option value="10">Octubre</option>
                                    <option value="11">Noviembre</option>
                                    <option value="12">Diciembre</option>
                                </select>
                                <select id="anio_nac" class="w-full h-12 px-2 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm text-gray-500 dark:text-gray-300">
                                    <option value="">Año</option>
                                </select>
                            </div>
                            <span class="text-xs text-red-500 hidden" id="fecha-helper">Selecciona día, mes y año</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="flex flex-col gap-2 md:col-span-2 group">
                            <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                Nombres Completos <span class="text-red-500">*</span>
                            </label>
                            <input id="nombres" name="nombres" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all shadow-sm group-hover:border-primary/50" placeholder="Ej. Juan Carlos" type="text" required/>
                        </div>

                        <div class="flex flex-col gap-2 group">
                            <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                Apellido Paterno <span class="text-red-500">*</span>
                            </label>
                            <input id="apellido_paterno" name="apellido_paterno" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all shadow-sm group-hover:border-primary/50" placeholder="Ej. Pérez" type="text" required/>
                        </div>

                        <div class="flex flex-col gap-2 group">
                            <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                Apellido Materno <span class="text-red-500">*</span>
                            </label>
                            <input id="apellido_materno" name="apellido_materno" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all shadow-sm group-hover:border-primary/50" placeholder="Ej. Gómez" type="text" required/>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="flex flex-col gap-2">
                            <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                Sexo <span class="text-red-500">*</span>
                            </label>
                            <div class="flex gap-6 h-12 items-center">
                                <label class="flex items-center gap-3 cursor-pointer group p-2 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                                    <div class="relative flex items-center justify-center">
                                        <input class="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full checked:border-primary checked:bg-primary transition-colors" name="sexo" type="radio" value="Masculino" required/>
                                        <div class="absolute w-2.5 h-2.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                    </div>
                                    <span class="text-sm font-medium text-text-main dark:text-gray-300 group-hover:text-primary transition-colors">Masculino</span>
                                </label>
                                <label class="flex items-center gap-3 cursor-pointer group p-2 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                                    <div class="relative flex items-center justify-center">
                                        <input class="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full checked:border-primary checked:bg-primary transition-colors" name="sexo" type="radio" value="Femenino" required/>
                                        <div class="absolute w-2.5 h-2.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                    </div>
                                    <span class="text-sm font-medium text-text-main dark:text-gray-300 group-hover:text-primary transition-colors">Femenino</span>
                                </label>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2 group">
                            <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                Teléfono <span class="text-red-500">*</span>
                            </label>
                            <input id="telefono" name="telefono" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all shadow-sm group-hover:border-primary/50" placeholder="Ej. 987654321" type="tel" required/>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 group">
                        <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                            Dirección <span class="text-red-500">*</span>
                        </label>
                        <input id="direccion" name="direccion" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all shadow-sm group-hover:border-primary/50" placeholder="Ej. Av. Principal 123, Lima" type="text" required/>
                    </div>

                    <div class="flex flex-col gap-2 group">
                        <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                            Correo Electrónico
                        </label>
                        <input id="email" name="email" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all shadow-sm group-hover:border-primary/50" placeholder="ejemplo@correo.com" type="email"/>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="flex flex-col gap-2 group">
                            <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                Tipo de Seguro <span class="text-red-500">*</span>
                            </label>
                            <select id="seguro_tipo" name="seguro_tipo" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm group-hover:border-primary/50" required>
                                <option value="">Seleccionar...</option>
                                <option value="SIS">SIS</option>
                                <option value="EsSalud">EsSalud</option>
                                <option value="Seguro Particular">Seguro Particular</option>
                                <option value="Ninguno">Ninguno</option>
                            </select>
                        </div>

                        <div class="flex flex-col gap-2 group">
                            <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                Condición Médica <span class="text-red-500">*</span>
                            </label>
                            <input id="condicion_medica" name="condicion_medica" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all shadow-sm group-hover:border-primary/50" placeholder="Escriba 'Ninguna' si no tiene condiciones médicas" type="text" required/>
                        </div>
                    </div>

                    <div id="apoderadoSection" class="hidden flex flex-col gap-8 p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
                        <div class="flex items-center gap-2 text-yellow-800 dark:text-yellow-500">
                            <span class="material-symbols-outlined">info</span>
                            <p class="text-sm font-bold uppercase">Datos del Apoderado (Menor de edad)</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="flex flex-col gap-2 group md:col-span-2">
                                <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                    Nombre del Apoderado <span class="text-red-500">*</span>
                                </label>
                                <input id="apoderado" name="apoderado" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all shadow-sm group-hover:border-primary/50" placeholder="Nombre completo del padre/madre/tutor" type="text"/>
                            </div>

                            <div class="flex flex-col gap-2 group">
                                <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                    Teléfono del Apoderado <span class="text-red-500">*</span>
                                </label>
                                <input id="telefono_apoderado" name="telefono_apoderado" class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all shadow-sm group-hover:border-primary/50" placeholder="Número de contacto" type="tel"/>
                            </div>
                        </div>
                    </div>

                    <!-- SECCIÓN DE documentOS -->
                    <div class="flex flex-col gap-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-900/30">
                        <div class="flex items-center gap-2 text-blue-800 dark:text-blue-500">
                            <span class="material-symbols-outlined">upload_file</span>
                            <p class="text-sm font-bold uppercase">documentos Requeridos</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <!-- DNI Frontal -->
                            <div class="flex flex-col gap-3">
                                <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                    DNI Frontal <span class="text-red-500">*</span>
                                </label>
                                <input type="file" id="dni_frontal" name="dni_frontal" accept="image/*" class="hidden" required/>
                                
                                <!-- Botón de subir (se oculta cuando hay imagen) -->
                                <div id="upload_btn_dni_frontal">
                                    <button type="button" onclick="document.getElementById('dni_frontal').click()" class="w-full h-32 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-díashed border-gray-300 dark:border-gray-700 hover:border-primary transition-all bg-white dark:bg-[#252525] cursor-pointer group">
                                        <span class="material-symbols-outlined text-4xl text-gray-400 group-hover:text-primary transition-colors">add_photo_alternate</span>
                                        <span class="text-xs text-gray-500 dark:text-gray-400 font-semibold">Subir imagen</span>
                                    </button>
                                </div>
                                
                                <!-- Vista previa con imagen cargada -->
                                <div id="preview_dni_frontal" class="hidden">
                                    <!-- Banner de confirmación -->
                                    <div class="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg p-3 mb-3 flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">check_circle</span>
                                            <span class="text-sm font-semibold text-green-700 dark:text-green-300">Imagen seleccionada</span>
                                        </div>
                                        <button type="button" onclick="eliminarImagen('dni_frontal')" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                                            <span class="material-symbols-outlined text-2xl">close</span>
                                        </button>
                                    </div>
                                    
                                    <!-- Vista previa de la imagen -->
                                    <div class="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                        <img class="w-full h-48 object-contain"/>
                                    </div>
                                </div>
                            </div>

                            <!-- DNI Reverso -->
                            <div class="flex flex-col gap-3">
                                <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                    DNI Reverso <span class="text-red-500">*</span>
                                </label>
                                <input type="file" id="dni_reverso" name="dni_reverso" accept="image/*" class="hidden" required/>
                                
                                <!-- Botón de subir (se oculta cuando hay imagen) -->
                                <div id="upload_btn_dni_reverso">
                                    <button type="button" onclick="document.getElementById('dni_reverso').click()" class="w-full h-32 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-díashed border-gray-300 dark:border-gray-700 hover:border-primary transition-all bg-white dark:bg-[#252525] cursor-pointer group">
                                        <span class="material-symbols-outlined text-4xl text-gray-400 group-hover:text-primary transition-colors">add_photo_alternate</span>
                                        <span class="text-xs text-gray-500 dark:text-gray-400 font-semibold">Subir imagen</span>
                                    </button>
                                </div>
                                
                                <!-- Vista previa con imagen cargada -->
                                <div id="preview_dni_reverso" class="hidden">
                                    <!-- Banner de confirmación -->
                                    <div class="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg p-3 mb-3 flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">check_circle</span>
                                            <span class="text-sm font-semibold text-green-700 dark:text-green-300">Imagen seleccionada</span>
                                        </div>
                                        <button type="button" onclick="eliminarImagen('dni_reverso')" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                                            <span class="material-symbols-outlined text-2xl">close</span>
                                        </button>
                                    </div>
                                    
                                    <!-- Vista previa de la imagen -->
                                    <div class="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                        <img class="w-full h-48 object-contain"/>
                                    </div>
                                </div>
                            </div>

                            <!-- Foto Carnet -->
                            <div class="flex flex-col gap-3">
                                <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                                    Foto Carnet <span class="text-red-500">*</span>
                                </label>
                                <input type="file" id="foto_carnet" name="foto_carnet" accept="image/*" class="hidden" required/>
                                
                                <!-- Botón de subir (se oculta cuando hay imagen) -->
                                <div id="upload_btn_foto_carnet">
                                    <button type="button" onclick="document.getElementById('foto_carnet').click()" class="w-full h-32 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-díashed border-gray-300 dark:border-gray-700 hover:border-primary transition-all bg-white dark:bg-[#252525] cursor-pointer group">
                                        <span class="material-symbols-outlined text-4xl text-gray-400 group-hover:text-primary transition-colors">add_photo_alternate</span>
                                        <span class="text-xs text-gray-500 dark:text-gray-400 font-semibold">Subir imagen</span>
                                    </button>
                                </div>
                                
                                <!-- Vista previa con imagen cargada -->
                                <div id="preview_foto_carnet" class="hidden">
                                    <!-- Banner de confirmación -->
                                    <div class="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg p-3 mb-3 flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">check_circle</span>
                                            <span class="text-sm font-semibold text-green-700 dark:text-green-300">Imagen seleccionada</span>
                                        </div>
                                        <button type="button" onclick="eliminarImagen('foto_carnet')" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                                            <span class="material-symbols-outlined text-2xl">close</span>
                                        </button>
                                    </div>
                                    
                                    <!-- Vista previa de la imagen -->
                                    <div class="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                        <img class="w-full h-48 object-contain"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p class="text-xs text-text-muted dark:text-gray-400">
                            <span class="material-symbols-outlined text-sm align-middle">info</span>
                            Las imágenes deben ser claras y legibles. Formatos aceptados: JPG, PNG. Se comprimen automáticamente al subirlas.
                        </p>
                    </div>

                    <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-800">
                        <button type="button" onclick="window.location.href='/'" class="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                            <span class="material-symbols-outlined">arrow_back</span>
                            <span class="font-bold text-sm uppercase">Volver</span>
                        </button>

                        <button type="submit" class="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-black font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                            <span>Continuar</span>
                            <span class="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </main>

    <footer class="bg-black text-white py-8 border-t border-white/10 mt-auto">
        <div class="max-w-[960px] mx-auto px-4">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-3">
                    <img src="assets/logo.ico" alt="Logo Jaguares" class="size-6 object-contain">
                    <span class="text-white text-sm font-black uppercase">JAGUARES</span>
                </div>
                <p class="text-gray-400 text-sm">© 2025 JAGUARES. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>

    
    
    
`;

export default function Inscripcion() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');

    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main font-sans inscripcion-readable min-h-screen flex flex-col overflow-x-hidden transition-colors duration-200';

    const cleanupIns = initInscripcion();
    const cleanupMenu = initMobileMenu();

    return () => {
      cleanupIns?.();
      cleanupMenu?.();
    };
  }, []);

  return <div className="page-root" dangerouslySetInnerHTML={{ __html: html }} />;
}






