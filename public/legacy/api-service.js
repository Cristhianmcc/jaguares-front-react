/**

 * Servicio de API para comunicacin con el backend de JAGUARES

 * Conecta con el backend Express que se comunica con Google Sheets via Apps Script

 */



// ============================================

// SISTEMA DE CACH?

// ============================================

class CacheManager {

    constructor() {

        this.prefix = 'jaguares_cache_';

    }



    /**

     * Guardar datos en cach con tiempo de vida

     * @param {string} key - Clave nica del cach

     * @param {any} data - Datos a guardar

     * @param {number} ttlMinutes - Tiempo de vida en minutos

     */

    set(key, data, ttlMinutes = 5) {

        try {

            const item = {

                data: data,

                timestamp: Date.now(),

                ttl: ttlMinutes * 60 * 1000 // Convertir a milisegundos

            };

            localStorage.setItem(this.prefix + key, JSON.stringify(item));


        } catch (error) {

            console.warn('s Error al guardar cach:', error);

        }

    }



    /**

     * Obtener datos del cach si son vlidos

     * @param {string} key - Clave del cach

     * @returns {any|null} - Datos o null si expir o no existe

     */

    get(key) {

        try {

            const itemStr = localStorage.getItem(this.prefix + key);

            if (!itemStr) {

                return null;

            }



            const item = JSON.parse(itemStr);

            const now = Date.now();

            const age = now - item.timestamp;



            // Verificar si expir

            if (age > item.ttl) {


                this.delete(key);

                return null;

            }




            return item.data;

        } catch (error) {

            console.warn('s Error al leer cach:', error);

            return null;

        }

    }



    /**

     * Eliminar un item del cach

     * @param {string} key - Clave del cach

     */

    delete(key) {

        localStorage.removeItem(this.prefix + key);

    }



    /**

     * Limpiar todo el cach de JAGUARES

     */

    clear() {

        const keys = Object.keys(localStorage);

        keys.forEach(key => {

            if (key.startsWith(this.prefix)) {

                localStorage.removeItem(key);

            }

        });


    }



    /**

     * Obtener info del cach (debug)

     */

    getInfo() {

        const keys = Object.keys(localStorage);

        const cacheKeys = keys.filter(k => k.startsWith(this.prefix));


        cacheKeys.forEach(key => {

            const item = JSON.parse(localStorage.getItem(key));

            const age = Math.round((Date.now() - item.timestamp) / 1000);


        });

    }

}



// Instancia global del cach

const cache = new CacheManager();



// ============================================

// CONFIGURACI"N DE LA API

// ============================================



// Configuración de la API

const API_CONFIG = {

    // Detectar automáticamente el entorno

    baseUrl: (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))

        ? window.API_BASE_OVERRIDE
        : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

            ? 'http://localhost:3002' // Desarrollo local
            : 'https://api.jaguarescar.com'), // Produccin en Dokploy

    endpoints: {

        horarios: '/api/horarios',

        inscribirMultiple: '/api/inscribir-multiple',

        misInscripciones: '/api/mis-inscripciones',

        registrarPago: '/api/registrar-pago',

        verificarPago: '/api/verificar-pago',

        validarDni: '/api/validar-dni'

    },

    // Configuración de cach (en minutos)

    cacheTTL: {

        horarios: 5,        // 5 minutos

        inscripciones: 2,   // 2 minutos

        consultas: 0        // 0 = NO cachear (siempre datos frescos)

    }

};



// Clase para manejar la API

class AcademiaAPI {

    constructor() {

        this.baseUrl = API_CONFIG.baseUrl;

    }



    /**

     * Realiza una peticin HTTP

     */

    async request(url, options = {}) {

        try {

            const response = await fetch(`${this.baseUrl}${url}`, {

                ...options,

                headers: {

                    'Content-Type': 'application/json',

                    ...options.headers

                }

            });



            const data = await response.json();



            if (!response.ok) {

                // Crear error con información completa

                const error = new Error(data.error || 'Error en la peticin');

                error.response = {

                    status: response.status,

                    data: data

                };

                throw error;

            }



            return data;

        } catch (error) {

            // Solo mostrar error en consola si NO es un 403 (usuario inactivo esperado)

            if (!error.response || error.response.status !== 403) {

                console.error('Error en peticin:', error);

            }

            throw error;

        }

    }



    /**

     * Obtiene todos los horarios disponibles

     * @param {number} anioNacimiento - Anio de nacimiento del alumno para filtrar por edad (opcional)

     * @param {string} sexo - Sexo del alumno ('Masculino' o 'Femenino') para filtrar deportes especficos

     * @param {boolean} forceRefresh - Forzar actualizacin ignorando cach

     */

    async getHorarios(anioNacimiento = null, sexo = null, forceRefresh = false) {

        try {

            // Generar clave de cach nica segn los parmetros (incluye gnero)

            const cacheKey = `horarios_${anioNacimiento || 'all'}_${sexo || 'all'}`;

            

            // Intentar obtener del cach si no se fuerza refresh

            if (!forceRefresh) {

                const cachedData = cache.get(cacheKey);

                if (cachedData) {


                    return cachedData;

                }

            }

            

            let url = API_CONFIG.endpoints.horarios;

            




            

            // Construir URL con parmetros

            const params = [];

            if (anioNacimiento) {
                // Backend espera 'año_nacimiento' o 'ano_nacimiento'
                params.push(`ano_nacimiento=${anioNacimiento}`);
            }

            if (sexo) {

                params.push(`sexo=${encodeURIComponent(sexo)}`);

            }

            

            if (params.length > 0) {

                const separator = url.includes('?') ? '&' : '?';

                url += `${separator}${params.join('&')}`;


            } else {


            }

            

            const fullUrl = `${this.baseUrl}${url}`;


            

            const data = await this.request(url);

            




            

            if (!data.success || !data.horarios) {

                throw new Error('Respuesta invlida del servidor');

            }



            // Guardar en cach

            cache.set(cacheKey, data.horarios, API_CONFIG.cacheTTL.horarios);



            return data.horarios;

        } catch (error) {

            console.error('O Error al obtener horarios:', error);

            throw error;

        }

    }



    /**

     * Inscribe a un alumno en mltiples horarios

     */

    async inscribirMultiple(alumno, horarios) {

        try {

            if (!alumno || !horarios || horarios.length === 0) {

                throw new Error('Datos de inscripción incompletos');

            }



            const data = await this.request(API_CONFIG.endpoints.inscribirMultiple, {

                method: 'POST',

                body: JSON.stringify({

                    alumno,

                    horarios

                })

            });



            // Invalidar cach de inscripciones de este DNI despus de inscribir

            if (alumno.dni) {

                cache.delete(`inscripciones_${alumno.dni}`);


            }



            return data;

        } catch (error) {

            console.error('Error al inscribir:', error);

            throw error;

        }

    }



    /**

     * Obtiene las inscripciones de un alumno por DNI

     * @param {string} dni - DNI del alumno

     * @param {boolean} forceRefresh - Forzar actualizacin ignorando cach

     */

    async getMisInscripciones(dni, forceRefresh = false) {

        try {

            if (!dni || dni.length < 8) {

                throw new Error('DNI invlido');

            }



            // Generar clave de cach nica por DNI

            const cacheKey = `inscripciones_${dni}`;

            

            // Intentar obtener del cach si no se fuerza refresh

            if (!forceRefresh) {

                const cachedData = cache.get(cacheKey);

                if (cachedData) {


                    return cachedData;

                }

            }



            const data = await this.request(`${API_CONFIG.endpoints.misInscripciones}/${dni}`);

            

            // Guardar en cach

            if (data.success && data.inscripciones) {

                cache.set(cacheKey, data, API_CONFIG.cacheTTL.inscripciones);

            }



            return data;

        } catch (error) {

            console.error('Error al obtener inscripciones:', error);

            throw error;

        }

    }



    /**

     * Consulta el estado de inscripción por DNI

     * @param {string} dni - DNI del alumno

     * @param {boolean} forceRefresh - Forzar actualizacin ignorando cach

     */

    async consultarInscripcion(dni, forceRefresh = false) {

        try {

            if (!dni || dni.length < 8) {

                throw new Error('DNI invlido');

            }



            // Generar clave de cach nica por DNI

            const cacheKey = `consulta_${dni}`;

            

            // NO usar cach para consultas (siempre datos frescos del servidor)

            // Intentar obtener del cach solo si no se fuerza refresh Y el TTL > 0

            if (!forceRefresh && API_CONFIG.cacheTTL.consultas > 0) {

                const cachedData = cache.get(cacheKey);

                if (cachedData) {


                    return cachedData;

                }

            }




            const data = await this.request(`/api/consultar/${dni}`);

            

            // Solo guardar en cach si el TTL > 0

            if (data.success && API_CONFIG.cacheTTL.consultas > 0) {

                cache.set(cacheKey, data, API_CONFIG.cacheTTL.consultas);

            }



            return data;

        } catch (error) {

            console.error('Error al consultar inscripción:', error);

            throw error;

        }

    }



    /**

     * Pausar o reactivar un deporte inscrito

     * @param {string} dni - DNI del alumno

     * @param {number} inscripcionId - ID de la inscripción

     * @param {string} accion - 'pausar' o 'reactivar'

     */

    async toggleDeporte(dni, inscripcionId, accion) {

        try {

            const data = await this.request('/api/alumno/toggle-deporte', {

                method: 'POST',

                body: JSON.stringify({

                    dni: dni,

                    inscripcion_id: inscripcionId,

                    accion: accion

                })

            });



            // Invalidar cach despus de cambiar estado

            if (dni) {

                cache.delete(`consulta_${dni}`);

                cache.delete(`inscripciones_${dni}`);


            }



            return data;

        } catch (error) {

            console.error('Error al toggle deporte:', error);

            throw error;

        }

    }



    /**

     * Registra un pago pendiente

     */

    async registrarPago(alumno, metodoPago, horariosSeleccionados = []) {

        try {

            const data = await this.request(API_CONFIG.endpoints.registrarPago, {

                method: 'POST',

                body: JSON.stringify({

                    alumno,

                    metodo_pago: metodoPago,

                    horarios_seleccionados: horariosSeleccionados

                })

            });



            // Invalidar cach de inscripciones y consulta despus de registrar pago

            if (alumno.dni) {

                cache.delete(`inscripciones_${alumno.dni}`);

                cache.delete(`consulta_${alumno.dni}`);


            }



            return data;

        } catch (error) {

            console.error('Error al registrar pago:', error);

            throw error;

        }

    }



    /**

     * Valida si un DNI est disponible (no duplicado) y tiene formato correcto

     */

    async validarDNI(dni) {

        try {

            if (!dni || dni.toString().length !== 8) {

                return {

                    success: false,

                    valido: false,

                    error: 'DNI debe tener 8 dígitos'

                };

            }



            const data = await this.request(`${API_CONFIG.endpoints.validarDni}/${dni}`);

            

            return data;

        } catch (error) {

            console.error('Error al validar DNI:', error);

            return {

                success: false,

                valido: false,

                error: error.message || 'Error de conexin al validar DNI'

            };

        }

    }



    /**

     * Verifica el estado de pago de un alumno

     */

    async verificarPago(dni) {

        try {

            if (!dni || dni.length < 8) {

                throw new Error('DNI invlido');

            }



            const data = await this.request(`${API_CONFIG.endpoints.verificarPago}/${dni}`);

            

            return data;

        } catch (error) {

            console.error('Error al verificar pago:', error);

            throw error;

        }

    }



    /**

     * Sube un comprobante de pago a Google Drive

     */

    async subirComprobante(datos) {

        try {

            if (!datos || !datos.codigo_operacion || !datos.imagen) {

                throw new Error('Datos incompletos para subir comprobante');

            }



            const data = await this.request('/api/subir-comprobante', {

                method: 'POST',

                body: JSON.stringify(datos)

            });



            return data;

        } catch (error) {

            console.error('Error al subir comprobante:', error);

            throw error;

        }

    }

}



// Exportar instancia nica

const academiaAPI = new AcademiaAPI();



// Sistema de almacenamiento local

class LocalStorage {

    static set(key, value) {

        const serialized = JSON.stringify(value);

        try {

            localStorage.setItem(key, serialized);

        } catch (error) {

            console.warn('Error al guardar en localStorage:', error);

        }

        // Guardar en sessionStorage como backup (más estable en móviles Android)

        try {

            sessionStorage.setItem(key, serialized);

        } catch (error) {

            console.warn('Error al guardar en sessionStorage:', error);

        }

    }



    static get(key) {

        try {

            const item = localStorage.getItem(key);

            if (item) return JSON.parse(item);

        } catch (error) {

            console.warn('Error al leer de localStorage:', error);

        }

        // Fallback a sessionStorage si localStorage fue evictado por el navegador móvil

        try {

            const item = sessionStorage.getItem(key);

            if (item) return JSON.parse(item);

        } catch (error) {

            console.warn('Error al leer de sessionStorage:', error);

        }

        return null;

    }



    static remove(key) {

        try {

            localStorage.removeItem(key);

        } catch (error) {

            console.error('Error al eliminar de localStorage:', error);

        }

    }



    static clear() {

        try {

            localStorage.clear();

        } catch (error) {

            console.error('Error al limpiar localStorage:', error);

        }

    }

}



// Utilidades

const Utils = {

    /**

     * Calcula la edad a partir de una fecha de nacimiento

     */

    calcularEdad(fechaNacimiento) {

        const hoy = new Date();

        // Extraer parte YYYY-MM-DD (funciona para "2016-06-19" y "2016-06-19T00:00:00.000Z")
        const datePart = typeof fechaNacimiento === 'string' ? fechaNacimiento.substring(0, 10) : null;
        const nacimiento = datePart ? new Date(datePart + 'T12:00:00') : new Date(fechaNacimiento);

        let edad = hoy.getFullYear() - nacimiento.getFullYear();

        const mes = hoy.getMonth() - nacimiento.getMonth();

        

        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {

            edad--;

        }

        

        return edad;

    },



    /**

     * Formatea un precio

     */

    formatearPrecio(precio) {

        return `S/ ${parseFloat(precio).toFixed(2)}`;

    },



    /**

     * Valida un DNI peruano

     */

    validarDNI(dni) {

        return /^\d{8}$/.test(dni);

    },



    /**

     * Valida un email

     */

    validarEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    },



    /**

     * Formatea una fecha

     */

    formatearFecha(fecha) {

        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };

        // Extraer parte YYYY-MM-DD (funciona para "2016-06-19" y "2016-06-19T00:00:00.000Z")
        const datePart = typeof fecha === 'string' ? fecha.substring(0, 10) : null;
        const d = datePart ? new Date(datePart + 'T12:00:00') : new Date(fecha);

        return d.toLocaleDateString('es-PE', opciones);

    },



    /**

     * Muestra una notificacin/toast estilizada

     */

    mostrarNotificacion(Mensaje, tipo = 'info') {

        // Crear contenedor de notificaciones si no existe

        let container = document.getElementById('notificaciones-container');

        if (!container) {

            container = document.createElement('div');

            container.id = 'notificaciones-container';

            container.style.cssText = `

                position: fixed;

                top: 20px;

                right: 20px;

                z-index: 99999;

                display: flex;

                flex-direction: column;

                gap: 12px;

                max-width: 400px;

                pointer-events: none;

            `;

            document.body.appendChild(container);

        }



        // Configuración por tipo

        const config = {

            'success': {

                icono: 'check_circle',

                color: '#10b981',

                bgColor: '#d1fae5',

                borderColor: '#34d399'

            },

            'error': {

                icono: 'cancel',

                color: '#ef4444',

                bgColor: '#fee2e2',

                borderColor: '#f87171'

            },

            'warning': {

                icono: 'warning',

                color: '#f59e0b',

                bgColor: '#fef3c7',

                borderColor: '#fbbf24'

            },

            'info': {

                icono: 'info',

                color: '#3b82f6',

                bgColor: '#dbeafe',

                borderColor: '#60a5fa'

            }

        };



        const settings = config[tipo] || config.info;



        // Crear notificacin

        const notificacion = document.createElement('div');

        notificacion.style.cssText = `

            display: flex;

            align-items: center;

            gap: 12px;

            padding: 16px 20px;

            background: ${settings.bgColor};

            border-left: 4px solid ${settings.borderColor};

            border-radius: 12px;

            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

            min-width: 300px;

            max-width: 400px;

            animation: slideIn 0.3s ease-out;

            pointer-events: auto;

            cursor: pointer;

        `;



        notificacion.innerHTML = `

            <span class="material-symbols-outlined" style="color: ${settings.color}; font-size: 24px; flex-shrink: 0;">

                ${settings.icono}

            </span>

            <span style="color: #1f2937; font-weight: 600; font-size: 14px; flex: 1; line-height: 1.4;">

                ${Mensaje}

            </span>

            <button style="

                background: none;

                border: none;

                color: ${settings.color};

                cursor: pointer;

                padding: 4px;

                display: flex;

                align-items: center;

                justify-content: center;

                border-radius: 6px;

                transition: background 0.2s;

            " onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='none'">

                <span class="material-symbols-outlined" style="font-size: 20px;">close</span>

            </button>

        `;



        // Agregar estilos de animacin si no existen

        if (!document.getElementById('toast-animations')) {

            const style = document.createElement('style');

            style.id = 'toast-animations';

            style.textContent = `

                @keyframes slideIn {

                    from {

                        transform: translateX(400px);

                        opacity: 0;

                    }

                    to {

                        transform: translateX(0);

                        opacity: 1;

                    }

                }

                @keyframes slideOut {

                    from {

                        transform: translateX(0);

                        opacity: 1;

                    }

                    to {

                        transform: translateX(400px);

                        opacity: 0;

                    }

                }

            `;

            document.head.appendChild(style);

        }



        // Funcin para cerrar notificacin

        const cerrar = () => {

            notificacion.style.animation = 'slideOut 0.3s ease-in';

            setTimeout(() => {

                if (notificacion.parentNode) {

                    container.removeChild(notificacion);

                }

                // Eliminar contenedor si est vaco

                if (container.children.length === 0) {

                    document.body.removeChild(container);

                }

            }, 300);

        };



        // Click en cerrar o en la notificacin para cerrar

        const closeBtn = notificacion.querySelector('button');

        closeBtn.addEventListener('click', (e) => {

            e.stopPropagation();

            cerrar();

        });

        notificacion.addEventListener('click', cerrar);



        // Agregar al contenedor

        container.appendChild(notificacion);



        // Auto-cerrar despus de 5 segundos

        setTimeout(cerrar, 5000);

    },



    /**

     * Genera un código de operacin nico

     */

    generarCodigoOperacion() {

        const timestamp = Date.now().toString(36);

        const random = Math.random().toString(36).substring(2, 7);

        return `JAG-${timestamp}-${random}`.toUpperCase();

    },



    /**

     * Debounce para optimizar bsquedas

     */

    debounce(func, wait) {

        let timeout;

        return function executedFunction(...args) {

            const later = () => {

                clearTimeout(timeout);

                func(...args);

            };

            clearTimeout(timeout);

            timeout = setTimeout(later, wait);

        };

    }

};



// Validaciones de formulario

const Validaciones = {

    /**

     * Valida los datos del alumno

     */

    validarAlumno(alumno) {

        const errores = [];



        if (!alumno.dni || !Utils.validarDNI(alumno.dni)) {

            errores.push('DNI invlido (debe tener 8 dígitos)');

        }



        if (!alumno.nombres || alumno.nombres.trim().length < 2) {

            errores.push('Nombres invlidos');

        }



        if (!alumno.apellido_paterno || alumno.apellido_paterno.trim().length < 2) {

            errores.push('Apellido paterno invlido');

        }



        if (!alumno.apellido_materno || alumno.apellido_materno.trim().length < 2) {

            errores.push('Apellido materno invlido');

        }



        if (!alumno.fecha_nacimiento) {

            errores.push('Fecha de nacimiento requerida');

        }



        if (!alumno.sexo) {

            errores.push('Sexo requerido');

        }



        if (!alumno.telefono || alumno.telefono.length < 9) {

            errores.push('teléfono invlido');

        }



        if (!alumno.direccion || alumno.direccion.trim().length < 5) {

            errores.push('Direccin invlida');

        }



        if (!alumno.seguro_tipo) {

            errores.push('Tipo de seguro requerido');

        }



        if (alumno.email && !Utils.validarEmail(alumno.email)) {

            errores.push('Email invlido');

        }



        // Validar apoderado si es Menor de edad

        if (alumno.fecha_nacimiento) {

            const edad = Utils.calcularEdad(alumno.fecha_nacimiento);

            if (edad < 18) {

                if (!alumno.apoderado || alumno.apoderado.trim().length < 3) {

                    errores.push('Nombre del apoderado requerido para Menores de edad');

                }

                if (!alumno.telefono_apoderado || alumno.telefono_apoderado.length < 9) {

                    errores.push('teléfono del apoderado requerido para Menores de edad');

                }

            }

        }



        return {

            valido: errores.length === 0,

            errores

        };

    },



    /**

     * Valida la selección de horarios

     */

    validarHorarios(horariosSeleccionados) {

        if (!horariosSeleccionados || horariosSeleccionados.length === 0) {

            return {

                valido: false,

                errores: ['Debe seleccionar al menos un horario']

            };

        }



        // Validar mximo 2 horarios por da

        const horariosPorDia = {};

        horariosSeleccionados.forEach(id => {

            const horario = window.horariosDisponibles?.find(h => h.id === id);

            if (horario) {

                horariosPorDia[horario.dia] = (horariosPorDia[horario.dia] || 0) + 1;

            }

        });



        const errores = [];

        Object.entries(horariosPorDia).forEach(([dia, cantidad]) => {

            if (cantidad > 2) {

                errores.push(`Mximo 2 horarios por da. Tienes ${cantidad} en ${dia}`);

            }

        });



        return {

            valido: errores.length === 0,

            errores

        };

    }

};



// Exportar para uso global

window.academiaAPI = academiaAPI;

window.LocalStorage = LocalStorage;

window.Utils = Utils;

window.Validaciones = Validaciones;














