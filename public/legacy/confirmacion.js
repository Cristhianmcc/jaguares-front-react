/**
 * Script para la pgina de confirmación
 */

// Variable global para almacenar los deportes con Matrícula
let deportesConMatriculaGlobal = [];
let matriculaActivaGlobal = true; // Por defecto activa

// Variables para comprobantes seleccionados en la página de confirmación
let capturaConfirmacion = null;
let comprobanteBBVAConf = null;
let comprobanteBCPConf = null;
let comprobanteEfectivoConf = null;
let numeroOperacionConf = ''; // Número de operación del pago (obligatorio al subir comprobante)

// API_BASE dinmico
const API_BASE_CONFIRM = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3002'
    : 'https://api.jaguarescar.com';

/**
 * Verifica si la Matrícula est activa globalmente
 */
async function verificarMatriculaActiva() {
    try {
        const response = await fetch(`${API_BASE_CONFIRM}/api/configuracion/matricula_activa`);
        const data = await response.json();
        return data.success && data.valor === true;
    } catch (error) {
        console.error('Error al verificar Matrícula:', error);
        return true; // Por defecto activa si hay error
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosConfirmacion();
});

async function cargarDatosConfirmacion() {
    const datosInscripcion = LocalStorage.get('datosInscripcion');
    
    if (!datosInscripcion || !datosInscripcion.alumno || !datosInscripcion.horariosCompletos) {
        Utils.mostrarNotificacion('No hay datos de inscripción', 'error');
        window.location.href = '/inscripcion';
        return;
    }
    
    const { alumno, horariosCompletos } = datosInscripcion;
    
    if (horariosCompletos.length === 0) {
        Utils.mostrarNotificacion('No hay horarios seleccionados', 'error');
        window.location.href = '/seleccion-horarios-new';
        return;
    }
    
    // Verificar si la Matrícula est activa globalmente
    const matriculaActiva = await verificarMatriculaActiva();
    matriculaActivaGlobal = matriculaActiva;
    
    // Solo verificar deportes nuevos si la Matrícula est activa
    let deportesConMatricula = [];
    if (matriculaActiva) {
        deportesConMatricula = await verificarDeportesNuevos(alumno.dni, horariosCompletos);
    }
    
    // Guardar en variable global para usar en confirmarInscripcion
    deportesConMatriculaGlobal = deportesConMatricula;
    
    // Renderizar
    renderizarConfirmacion(alumno, horariosCompletos, deportesConMatricula);
}

/**
 * Verifica qu deportes del alumno son nuevos en el ao actual
 * Retorna array de deportes que requieren pago de Matrícula
 */
async function verificarDeportesNuevos(dni, horariosSeleccionados) {
    try {
        const api = new AcademiaAPI();
        const resultado = await api.getMisInscripciones(dni);
        
        if (!resultado.success || !resultado.inscripciones) {
            // No hay inscripciones previas, todos los deportes son nuevos
            const deportesUnicos = [...new Set(horariosSeleccionados.map(h => h.deporte))];
            return deportesUnicos;
        }
        
        const aoActual = new Date().getFullYear(); // 2026
        
        // Obtener deportes en los que ya se inscribi este ao
        const deportesYaInscritos = new Set();
        resultado.inscripciones.forEach(inscripcion => {
            // Validar que exista fecha_inscripcion
            if (!inscripcion.fecha_inscripcion) {
                return; // Skip this inscription
            }
            
            // La fecha viene en formato DD/MM/YYYY
            const fechaPartes = inscripcion.fecha_inscripcion.split('/');
            if (fechaPartes.length !== 3) {
                return; // Skip if format is invalid
            }
            
            const aoInscripcion = parseInt(fechaPartes[2]);
            
            if (aoInscripcion === aoActual) {
                deportesYaInscritos.add(inscripcion.deporte);
            }
        });
        
        // Deportes seleccionados nicos
        const deportesSeleccionados = [...new Set(horariosSeleccionados.map(h => h.deporte))];
        
        // Filtrar solo los deportes nuevos (que no estn en deportesYaInscritos)
        const deportesNuevos = deportesSeleccionados.filter(deporte => !deportesYaInscritos.has(deporte));
        
        return deportesNuevos;
    } catch (error) {
        console.error('Error al verificar deportes:', error);
        // En caso de error, asumir que todos son nuevos por seguridad
        const deportesUnicos = [...new Set(horariosSeleccionados.map(h => h.deporte))];
        return deportesUnicos;
    }
}

/**
 * Agrupa los horarios por deporte y calcula das y precio total
 */
function agruparHorariosPorDeporte(horarios) {
    const agrupados = {};
    
    // Mapeo de das a abreviaciones
    const abrevDias = {
        'LUNES': 'L',
        'MARTES': 'M',
        'MIERCOLES': 'X',
        'MIRCOLES': 'X',
        'JUEVES': 'J',
        'VIERNES': 'V',
        'SABADO': 'S',
        'SBADO': 'S',
        'DOMINGO': 'D'
    };
    
    // Orden de das para ordenar correctamente
    const ordenDias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    
    horarios.forEach(h => {
        const key = h.deporte;
        if (!agrupados[key]) {
            agrupados[key] = {
                deporte: h.deporte,
                plan: h.plan,
                dias: [],
                horarios: [],
                precioTotal: 0
            };
        }
        
        const diaAbrev = abrevDias[h.dia?.toUpperCase()] || h.dia;
        if (!agrupados[key].dias.includes(diaAbrev)) {
            agrupados[key].dias.push(diaAbrev);
        }
        agrupados[key].horarios.push({
            dia: h.dia,
            diaAbrev: diaAbrev,
            hora_inicio: h.hora_inicio,
            hora_fin: h.hora_fin
        });
        agrupados[key].precioTotal += parseFloat(h.precio || 0);
    });
    
    // Ordenar das y formatear hora
    Object.values(agrupados).forEach(d => {
        d.dias.sort((a, b) => ordenDias.indexOf(a) - ordenDias.indexOf(b));
        d.diasFormateados = d.dias.join('-');
        // Tomar la primera hora como referencia
        if (d.horarios.length > 0) {
            d.horaInicio = formatearHora12(d.horarios[0].hora_inicio);
        }
    });
    
    return Object.values(agrupados);
}

/**
 * Formatea hora de 24h a 12h (ej: "15:30" -> "3:30 pm")
 */
function formatearHora12(hora) {
    if (!hora) return '';
    const [h, m] = hora.split(':').map(Number);
    const periodo = h >= 12 ? 'pm' : 'am';
    const hora12 = h % 12 || 12;
    return `${hora12}:${m.toString().padStart(2, '0')} ${periodo}`;
}

function renderizarConfirmacion(alumno, horarios, deportesConMatricula = []) {
    const container = document.getElementById('contenidoConfirmacion');
    
    // Calcular precio de deportes
    const precioDeportes = horarios.reduce((sum, h) => sum + parseFloat(h.precio || 0), 0);
    
    // Matrícula: S/ 20 por cada deporte nuevo
    const MATRICULA_POR_DEPORTE = 20;
    const cantidadDeportesNuevos = deportesConMatricula.length;
    const montoMatricula = cantidadDeportesNuevos * MATRICULA_POR_DEPORTE;
    const cobraMatricula = cantidadDeportesNuevos > 0;
    
    // Precio total = deportes + Matrícula (por deportes nuevos)
    const precioTotal = precioDeportes + montoMatricula;
    
    const edad = Utils.calcularEdad(alumno.fecha_nacimiento);
    
    // Agrupar horarios por deporte
    const deportesAgrupados = agruparHorariosPorDeporte(horarios);
    
    container.innerHTML = `
        <div class="lg:col-span-2 flex flex-col gap-6">
            <!-- Datos del Alumno -->
            <div class="bg-white dark:bg-[#222] rounded-lg p-8 shadow-md border-l-4 border-primary shadow-zinc-200/50 dark:shadow-none">
                <div class="flex items-center gap-4 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div class="bg-secondary p-2.5 rounded text-primary shadow-lg">
                        <span class="material-symbols-outlined text-2xl">person</span>
                    </div>
                    <h2 class="text-secondary dark:text-white text-xl font-bold uppercase tracking-wide">Datos del Alumno</h2>
                    <button onclick="window.location.href='/inscripcion'" class="ml-auto text-xs text-primary hover:text-primary-dark font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-primary/30 px-3 py-1.5 rounded hover:bg-primary/5">
                        <span class="material-symbols-outlined text-sm">edit</span> Editar
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-8">
                    <div class="flex flex-col gap-1.5">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest">Nombre Completo</p>
                        <p class="text-secondary dark:text-gray-100 text-lg font-bold">${alumno.nombres} ${alumno.apellidos}</p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest">DNI / documento</p>
                        <p class="text-secondary dark:text-gray-100 text-lg font-bold">${alumno.dni}</p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest">Fecha de Nacimiento</p>
                        <p class="text-secondary dark:text-gray-100 text-lg font-bold">${Utils.formatearFecha(alumno.fecha_nacimiento)}</p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest">Edad</p>
                        <div class="flex items-center gap-2">
                            <span class="bg-secondary text-primary px-3 py-1 rounded text-xs font-black uppercase tracking-wider shadow-sm">${edad} a&ntilde;os</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest">teléfono</p>
                        <p class="text-secondary dark:text-gray-100 text-base font-bold">${alumno.telefono}</p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest">Seguro</p>
                        <p class="text-secondary dark:text-gray-100 text-base font-bold">${alumno.seguro_tipo}</p>
                    </div>
                    ${edad < 18 && alumno.apoderado ? `
                    <div class="flex flex-col gap-2 md:col-span-2 bg-zinc-50 dark:bg-[#2a2a2a] p-4 rounded border border-zinc-100 dark:border-zinc-700 mt-2">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">emergency</span> Contacto de Apoderado
                        </p>
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-1 gap-2">
                            <p class="text-secondary dark:text-gray-100 text-base font-bold">${alumno.apoderado}</p>
                            <p class="text-secondary dark:text-gray-100 text-base font-bold font-mono bg-white dark:bg-black px-2 py-1 rounded border border-zinc-200 dark:border-zinc-600">${alumno.telefono_apoderado}</p>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- resumen de Horarios -->
        <div class="flex flex-col gap-6">
            <div class="bg-secondary dark:bg-[#111] rounded-lg overflow-hidden shadow-xl shadow-zinc-300/50 dark:shadow-none flex flex-col max-h-[550px] text-white relative group">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                <div class="p-6 flex flex-col gap-4 flex-1 min-h-0 relative z-10">
                    <div class="flex flex-col gap-1 pb-3 border-b border-white/10">
                        <div class="flex items-center gap-2 text-primary mb-1">
                            <span class="material-symbols-outlined text-lg">schedule</span>
                            <span class="text-[9px] font-black uppercase tracking-[0.2em]">Horarios Seleccionados</span>
                        </div>
                        <p class="text-xl font-black italic uppercase tracking-tight">resumen de inscripción</p>
                    </div>

                    <div class="space-y-2.5 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-white/5">
                        ${deportesAgrupados.map(d => {
                            return `
                            <div class="bg-white/10 rounded-lg p-3.5 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors">
                                <div class="flex justify-between items-start">
                                    <div class="flex items-center gap-2.5">
                                        <span class="material-symbols-outlined text-primary text-2xl">${obtenerIconoDeporte(d.deporte)}</span>
                                        <div>
                                            <p class="font-bold text-base leading-tight">${d.deporte}</p>
                                            <div class="flex items-center gap-2 text-xs text-zinc-300 mt-1">
                                                <span class="bg-primary/30 px-1.5 py-0.5 rounded font-bold text-primary">${d.diasFormateados}</span>
                                                <span class="material-symbols-outlined text-sm">schedule</span>
                                                <span>${d.horaInicio}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-primary font-black text-lg text-right">S/. ${d.precioTotal.toFixed(2)}</div>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="border-t border-white/20 pt-3 mt-auto flex-shrink-0">
                        <!-- resumen de precios -->
                        <div class="space-y-2 mb-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-zinc-300">Deportes:</span>
                                <span class="font-bold text-base text-white">${Utils.formatearPrecio(precioDeportes)}</span>
                            </div>
                            
                            ${cobraMatricula ? `
                                <div class="flex justify-between items-center">
                                    <span class="flex items-center gap-1.5 text-sm">
                                        <span class="material-symbols-outlined text-base text-amber-400">card_membership</span>
                                        <span class="text-amber-300 font-medium">Matrícula (${cantidadDeportesNuevos} ${cantidadDeportesNuevos === 1 ? 'deporte' : 'deportes'}):</span>
                                    </span>
                                    <span class="font-bold text-base text-amber-400">${Utils.formatearPrecio(montoMatricula)}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Mensaje informativo sobre Matrícula (compacto) -->
                        ${cobraMatricula ? `
                            <div class="bg-amber-500/10 border border-amber-500/30 rounded-md p-2 mb-3">
                                <div class="flex items-start gap-1.5">
                                    <span class="material-symbols-outlined text-amber-400 text-sm mt-0.5 flex-shrink-0">info</span>
                                    <div class="text-[10px] text-amber-200 leading-snug">
                                        <p class="font-semibold">Deportes con Matrícula: <span class="font-normal">${deportesConMatricula.join(', ')}</span></p>
                                        <p class="text-amber-100/80 mt-0.5">S/ 20 por deporte nuevo. Si regresas al mismo deporte en el ao, no pagas nuevamente.</p>
                                    </div>
                                </div>
                            </div>
                        ` : ``}
                        
                        
                        <div class="flex justify-between items-center border-t border-white/10 pt-2.5">
                            <span class="text-zinc-400 text-sm uppercase font-bold tracking-wide">Total</span>
                            <span class="text-3xl font-black text-primary">${Utils.formatearPrecio(precioTotal)}</span>
                        </div>
                        <p class="text-[10px] text-zinc-500 text-right mt-1">${cobraMatricula ? 'Mensualidad + Matrícula de deportes nuevos' : 'Pago Mensual'}</p>
                    </div>
                </div>
            </div>
        </div>


        <!-- ===== SECCIÓN DE PAGO (PASO 2) ===== -->
        <div class="lg:col-span-3 flex flex-col gap-6 mt-4">

            <!-- Header separador -->
            <div class="flex items-center gap-4">
                <div class="w-6 h-0.5 bg-primary flex-shrink-0"></div>
                <h2 class="text-secondary dark:text-white text-xl font-black uppercase tracking-wide flex-shrink-0">
                    <span class="text-primary">Paso 2 —</span> Realiza tu Pago
                </h2>
                <div class="flex-1 h-0.5 bg-primary/20"></div>
            </div>

            <!-- MONTO A PAGAR (adaptado para variables locales de confirmación) -->
            <div class="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-black/5">
                <div class="h-1.5 w-full bg-gradient-to-r from-primary to-amber-500"></div>
                <div class="p-6 md:p-8">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <p class="text-xs font-bold text-primary uppercase tracking-widest mb-1.5"><span class="material-symbols-outlined text-xs align-middle">payments</span> resumen DE PAGO</p>
                            <h3 class="text-xl font-black text-text-main dark:text-white tracking-tight">Total a pagar</h3>
                        </div>
                        <div class="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span class="material-symbols-outlined text-primary text-2xl">receipt_long</span>
                        </div>
                    </div>
                    
                    <div class="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/20">
                        <div class="space-y-3">
                            ${cobraMatricula ? `
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <span class="material-symbols-outlined text-base">card_membership</span>
                                        Matrícula (${cantidadDeportesNuevos} ${cantidadDeportesNuevos === 1 ? 'deporte' : 'deportes'}):
                                    </span>
                                    <span class="font-bold text-amber-600 dark:text-amber-400">S/. ${montoMatricula.toFixed(2)}</span>
                                </div>
                                <div class="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                                    Deportes nuevos: ${deportesConMatricula.join(', ')}
                                </div>
                            ` : ''}
                            <div class="flex items-center justify-between pt-3 border-t-2 border-primary/30">
                                <p class="text-base text-text-main/70 dark:text-white/70 font-bold uppercase tracking-wide">Total</p>
                                <p class="text-4xl font-black text-primary">S/. ${precioTotal.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Aviso: sube tu comprobante -->
            <div class="bg-amber-50 dark:bg-amber-900/10 border border-amber-300 dark:border-amber-700 rounded-xl p-4">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl mt-0.5 flex-shrink-0">info</span>
                    <div>
                        <p class="text-sm font-bold text-amber-900 dark:text-amber-200">Sube tu comprobante antes de confirmar</p>
                        <p class="text-xs text-amber-800 dark:text-amber-300 mt-0.5">Elige tu método de pago, realiza la transferencia y sube la captura aquí. Luego pulsa <strong>Confirmar y Finalizar</strong>.</p>
                    </div>
                </div>
            </div>

        <!-- SECCIÓN DE PAGO CON ACORDEÓN -->
        <div class="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-black/5">
            <div class="h-1.5 w-full bg-gradient-to-r from-green-600 via-blue-600 to-red-600"></div>
            <div class="p-6 md:p-8 flex flex-col gap-4">
                <!-- TÍTULO -->
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <p class="text-xs font-bold text-primary uppercase tracking-widest mb-1.5"><span class="material-symbols-outlined text-xs align-middle">credit_card</span> MÉTODOS DE PAGO</p>
                        <h3 class="text-xl font-black text-text-main dark:text-white tracking-tight">Selecciona y expande tu método</h3>
                    </div>
                    <div class="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary text-2xl">payments</span>
                    </div>
                </div>

                <!-- ACORDEÓN: PLIN CON QR -->
                <div class="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                    <!-- HEADER PLIN -->
                    <button onclick="toggleMetodoPagoConf('plin')" class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all">
                        <div class="flex items-center gap-3">
                            <img src="assets/plinlogo.png" alt="Plin" class="h-8 object-contain bg-white rounded-lg px-2 py-1">
                            <div class="text-left">
                                <p class="text-white font-black text-lg">PLIN</p>
                                <p class="text-green-100 text-xs">Pago con QR Inmediato</p>
                            </div>
                        </div>
                        <span id="iconPlinConf" class="material-symbols-outlined text-white text-2xl transition-transform">expand_more</span>
                    </button>
                    
                    <!-- CONTENIDO PLIN (OCULTO POR DEFECTO) -->
                    <div id="contentPlinConf" class="hidden bg-gray-50 dark:bg-white/5 p-4 border-t border-green-200 dark:border-green-800 overflow-hidden transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0;">
                        <div class="flex flex-col gap-3">
                            <!-- BOTÓN QR -->
                            <button onclick="abrirModalQRConf('assets/plinqr.jpeg', 'Plin')" class="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group w-full">
                                <div class="size-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span class="material-symbols-outlined text-green-600 text-4xl font-bold">qr_code_scanner</span>
                                </div>
                                <div class="text-center">
                                    <p class="text-lg font-black text-white mb-1">VER QR</p>
                                    <p class="text-xs text-green-100 font-medium">Toca para abrir</p>
                                </div>
                            </button>
                            
                            <!-- DESTINATARIO -->
                            <div class="bg-white dark:bg-white/10 rounded-xl p-3 border border-green-200 dark:border-green-800">
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-green-600 text-xl">person</span>
                                    <div>
                                        <p class="text-[10px] text-text-main/50 dark:text-white/50 font-medium uppercase">Destinatario</p>
                                        <p class="text-sm font-black text-text-main dark:text-white">Oscar Orosco - 973 324 460</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- SUBIR COMPROBANTE PLIN -->
                            <div class="bg-white dark:bg-white/10 rounded-xl p-3 border border-green-200 dark:border-green-800">
                                <p class="text-xs text-text-main/70 dark:text-white/70 mb-2 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-sm">upload_file</span>
                                    ¿Ya pagaste con Plin?
                                </p>
                                <input type="file" id="inputCapturaPlinConf" accept="image/*" class="hidden" onchange="handleCapturaPagoConf(event)">
                                <button onclick="document.getElementById('inputCapturaPlinConf').click()" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs transition-all">
                                    <span class="material-symbols-outlined text-base">add_photo_alternate</span>
                                    <span>Subir Comprobante</span>
                                </button>

                                <!-- PREVIEW PLIN (agregado para confirmación) -->
                                <div id="previewPlinConf" class="hidden mt-2 bg-white/90 dark:bg-white/10 rounded-lg p-2">
                                    <div class="flex items-center justify-between mb-1">
                                        <p class="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                            <span class="material-symbols-outlined text-xs">check_circle</span>
                                            Captura adjunta
                                        </p>
                                        <button onclick="eliminarComprobanteConf('plin')" class="text-red-600 hover:text-red-700">
                                            <span class="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                    <img id="imagenPreviewPlinConf" src="" alt="Preview" class="w-full max-h-20 object-contain rounded">
                                    <!-- Nro Operación dentro de Plin -->
                                    <div class="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                                        <label class="text-[10px] font-bold text-green-700 dark:text-green-400 flex items-center gap-1 mb-1">
                                            <span class="material-symbols-outlined text-xs">pin</span>
                                            Nro. de Operación (obligatorio)
                                        </label>
                                        <input type="text" data-numop="true" placeholder="Ej: 00012345678" maxlength="50" oninput="syncNumeroOperacionConf(this)" class="w-full px-3 py-2 bg-white dark:bg-black/20 border border-green-300 dark:border-green-700 rounded-lg text-sm font-mono font-bold text-text-main dark:text-white placeholder:text-text-main/30 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition-all">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ACORDEÓN: BBVA -->
                <div class="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                    <!-- HEADER BBVA -->
                    <button onclick="toggleMetodoPagoConf('bbva')" class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all">
                        <div class="flex items-center gap-3">
                            <img src="assets/logo-bbva.jpg" alt="BBVA" class="h-8 object-contain bg-white rounded-lg px-2 py-1">
                            <div class="text-left">
                                <p class="text-white font-black text-lg">BBVA</p>
                                <p class="text-blue-100 text-xs">Transferencia Bancaria</p>
                            </div>
                        </div>
                        <span id="iconBbvaConf" class="material-symbols-outlined text-white text-2xl transition-transform">expand_more</span>
                    </button>
                    
                    <!-- CONTENIDO BBVA (OCULTO POR DEFECTO) -->
                    <div id="contentBbvaConf" class="hidden bg-gray-50 dark:bg-white/5 p-4 border-t border-blue-200 dark:border-blue-800 overflow-hidden transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0;">
                        <div class="space-y-3">
                        <div class="space-y-3">
                            <!-- Cuenta BBVA -->
                            <div class="bg-white dark:bg-white/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                <p class="text-[10px] text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase">Cuenta Ahorros</p>
                                <div class="flex items-center justify-between gap-2">
                                    <p class="text-base font-black text-gray-900 dark:text-white font-mono">001108140277791167</p>
                                    <button onclick="copiarCuentaConf('001108140277791167', event)" class="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-all flex-shrink-0">
                                        <span class="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- CCI BBVA -->
                            <div class="bg-white dark:bg-white/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                <p class="text-[10px] text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase">CCI</p>
                                <div class="flex items-center justify-between gap-2">
                                    <p class="text-base font-black text-gray-900 dark:text-white font-mono">01181400027779116714</p>
                                    <button onclick="copiarCuentaConf('01181400027779116714', event)" class="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-all flex-shrink-0">
                                        <span class="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Titular BBVA -->
                            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 border border-blue-200 dark:border-blue-800">
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-blue-600 text-base">person</span>
                                    <div>
                                        <p class="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Titular</p>
                                        <p class="text-xs font-bold text-blue-900 dark:text-blue-100">Oscar Orosco</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Subir Comprobante BBVA -->
                            <div class="bg-white dark:bg-white/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                <div class="flex flex-col gap-2">
                                    <p class="text-xs text-text-main/70 dark:text-white/70 font-medium flex items-center gap-1">
                                        <span class="material-symbols-outlined text-sm">upload_file</span>
                                        ¿Ya transferiste?
                                    </p>
                                    <input type="file" id="inputComprobanteBBVAConf" accept="image/*" class="hidden" onchange="handleComprobanteConf(event, 'BBVA')">
                                    <button onclick="document.getElementById('inputComprobanteBBVAConf').click()" class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-all">
                                        <span class="material-symbols-outlined text-base">add_photo_alternate</span>
                                        <span>Subir Comprobante</span>
                                    </button>
                                    <div id="previewBBVAConf" class="hidden mt-2 bg-white/90 dark:bg-white/10 rounded-lg p-2">
                                        <div class="flex items-center justify-between mb-1">
                                            <p class="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                                                <span class="material-symbols-outlined text-xs">check_circle</span>
                                                Adjunto
                                            </p>
                                            <button onclick="eliminarComprobanteConf('BBVA')" class="text-red-600 hover:text-red-700">
                                                <span class="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                        <img id="imagenPreviewBBVAConf" src="" alt="Preview" class="w-full max-h-20 object-contain rounded">
                                        <!-- Nro Operación dentro de BBVA -->
                                        <div class="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                                            <label class="text-[10px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1 mb-1">
                                                <span class="material-symbols-outlined text-xs">pin</span>
                                                Nro. de Operación (obligatorio)
                                            </label>
                                            <input type="text" data-numop="true" placeholder="Ej: 00012345678" maxlength="50" oninput="syncNumeroOperacionConf(this)" class="w-full px-3 py-2 bg-white dark:bg-black/20 border border-blue-300 dark:border-blue-700 rounded-lg text-sm font-mono font-bold text-text-main dark:text-white placeholder:text-text-main/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ACORDEÓN: BCP -->
                <div class="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                    <!-- HEADER BCP -->
                    <button onclick="toggleMetodoPagoConf('bcp')" class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 transition-all">
                        <div class="flex items-center gap-3">
                            <img src="assets/logo-bcp.jpg" alt="BCP" class="h-8 object-contain bg-white rounded-lg px-2 py-1">
                            <div class="text-left">
                                <p class="text-white font-black text-lg">BCP</p>
                                <p class="text-orange-100 text-xs">Transferencia Bancaria</p>
                            </div>
                        </div>
                        <span id="iconBcpConf" class="material-symbols-outlined text-white text-2xl transition-transform">expand_more</span>
                    </button>
                    
                    <!-- CONTENIDO BCP (OCULTO POR DEFECTO) -->
                    <div id="contentBcpConf" class="hidden bg-gray-50 dark:bg-white/5 p-4 border-t border-red-200 dark:border-red-800 overflow-hidden transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0;">
                        <div class="space-y-3">
                            <!-- Cuenta BCP -->
                            <div class="bg-white dark:bg-white/10 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                <p class="text-[10px] text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase">Cuenta Ahorros</p>
                                <div class="flex items-center justify-between gap-2">
                                    <p class="text-base font-black text-gray-900 dark:text-white font-mono">19407824258089</p>
                                    <button onclick="copiarCuentaConf('19407824258089', event)" class="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-all flex-shrink-0">
                                        <span class="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- CCI BCP -->
                            <div class="bg-white dark:bg-white/10 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                <p class="text-[10px] text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase">CCI</p>
                                <div class="flex items-center justify-between gap-2">
                                    <p class="text-base font-black text-gray-900 dark:text-white font-mono">00219410782425808997</p>
                                    <button onclick="copiarCuentaConf('00219410782425808997', event)" class="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-all flex-shrink-0">
                                        <span class="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Titular BCP -->
                            <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 border border-red-200 dark:border-red-800">
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-red-600 text-base">person</span>
                                    <div>
                                        <p class="text-[10px] text-red-600 dark:text-red-400 font-medium">Titular</p>
                                        <p class="text-xs font-bold text-red-900 dark:text-red-100">Oscar Orosco Aldonate</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Subir Comprobante BCP -->
                            <div class="bg-white dark:bg-white/10 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                <div class="flex flex-col gap-2">
                                    <p class="text-xs text-text-main/70 dark:text-white/70 font-medium flex items-center gap-1">
                                        <span class="material-symbols-outlined text-sm">upload_file</span>
                                        ¿Ya transferiste?
                                    </p>
                                    <input type="file" id="inputComprobanteBCPConf" accept="image/*" class="hidden" onchange="handleComprobanteConf(event, 'BCP')">
                                    <button onclick="document.getElementById('inputComprobanteBCPConf').click()" class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-all">
                                        <span class="material-symbols-outlined text-base">add_photo_alternate</span>
                                        <span>Subir Comprobante</span>
                                    </button>
                                    <div id="previewBCPConf" class="hidden mt-2 bg-white/90 dark:bg-white/10 rounded-lg p-2">
                                        <div class="flex items-center justify-between mb-1">
                                            <p class="text-[10px] font-bold text-red-600 flex items-center gap-1">
                                                <span class="material-symbols-outlined text-xs">check_circle</span>
                                                Adjunto
                                            </p>
                                            <button onclick="eliminarComprobanteConf('BCP')" class="text-red-600 hover:text-red-700">
                                                <span class="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                        <img id="imagenPreviewBCPConf" src="" alt="Preview" class="w-full max-h-20 object-contain rounded">
                                        <!-- Nro Operación dentro de BCP -->
                                        <div class="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                                            <label class="text-[10px] font-bold text-red-700 dark:text-red-400 flex items-center gap-1 mb-1">
                                                <span class="material-symbols-outlined text-xs">pin</span>
                                                Nro. de Operación (obligatorio)
                                            </label>
                                            <input type="text" data-numop="true" placeholder="Ej: 00012345678" maxlength="50" oninput="syncNumeroOperacionConf(this)" class="w-full px-3 py-2 bg-white dark:bg-black/20 border border-red-300 dark:border-red-700 rounded-lg text-sm font-mono font-bold text-text-main dark:text-white placeholder:text-text-main/30 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 outline-none transition-all">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


                <!-- AVISOS IMPORTANTES -->
                <!-- Aviso Pago Electrónico -->
                <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-3">
                    <div class="flex items-start gap-2">
                        <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg mt-0.5">info</span>
                        <div class="flex-1">
                            <p class="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1"><span class="material-symbols-outlined text-xs align-middle">credit_card</span> Pago con Plin o Transferencia:</p>
                            <ol class="text-xs text-blue-800 dark:text-blue-300 space-y-0.5 list-decimal list-inside">
                                <li>Expande tu método preferido (Plin, BBVA o BCP)</li>
                                <li>Realiza el pago y sube tu comprobante</li>
                                <li>Si no subes ahora, hazlo desde "Consultar Inscripción"</li>
                            </ol>
                        </div>
                    </div>
                </div>
                
                <!-- ACORDEÓN: PAGO EN EFECTIVO / RECIBO -->
                <div class="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                    <!-- HEADER EFECTIVO -->
                    <button onclick="toggleMetodoPagoConf('efectivo')" class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 transition-all">
                        <div class="flex items-center gap-3">
                            <div class="size-9 bg-white rounded-lg flex items-center justify-center px-1">
                                <span class="material-symbols-outlined text-amber-600 text-3xl">payments</span>
                            </div>
                            <div class="text-left">
                                <p class="text-white font-black text-lg">EFECTIVO EN OFICINA</p>
                                <p class="text-yellow-100 text-xs">Sube tu recibo de pago</p>
                            </div>
                        </div>
                        <span id="iconEfectivoConf" class="material-symbols-outlined text-white text-2xl transition-transform">expand_more</span>
                    </button>
                    <div id="contentEfectivoConf" class="hidden bg-gray-50 dark:bg-white/5 p-4 border-t border-amber-200 dark:border-amber-800 overflow-hidden transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0;">
                        <div class="space-y-3">
                            <div class="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                                <div class="flex items-start gap-2">
                                    <span class="material-symbols-outlined text-amber-600 text-lg mt-0.5">info</span>
                                    <div>
                                        <p class="text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">¿Pagaste en oficina?</p>
                                        <p class="text-xs text-amber-800 dark:text-amber-300">Toma una foto al <strong>recibo físico</strong> que te entregamos y súbelo aquí. Tu inscripción se activará una vez confirmemos el pago.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white dark:bg-white/10 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                                <div class="flex flex-col gap-2">
                                    <p class="text-xs text-text-main/70 dark:text-white/70 font-medium flex items-center gap-1">
                                        <span class="material-symbols-outlined text-sm">upload_file</span>
                                        Foto del recibo de pago
                                    </p>
                                    <input type="file" id="inputComprobanteEfectivoConf" accept="image/*" class="hidden" onchange="handleComprobanteConf(event, 'Efectivo')">
                                    <button onclick="document.getElementById('inputComprobanteEfectivoConf').click()" class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs transition-all">
                                        <span class="material-symbols-outlined text-base">add_photo_alternate</span>
                                        <span>Subir Foto del Recibo</span>
                                    </button>
                                    <div id="previewEfectivoConf" class="hidden mt-2 bg-white/90 dark:bg-white/10 rounded-lg p-2">
                                        <div class="flex items-center justify-between mb-1">
                                            <p class="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                                <span class="material-symbols-outlined text-xs">check_circle</span>
                                                Recibo adjunto
                                            </p>
                                            <button onclick="eliminarComprobanteConf('Efectivo')" class="text-red-600 hover:text-red-700">
                                                <span class="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                        <img id="imagenPreviewEfectivoConf" src="" alt="Preview recibo" class="w-full max-h-20 object-contain rounded">
                                        <!-- Nro Operación dentro de Efectivo -->
                                        <div class="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                                            <label class="text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-1">
                                                <span class="material-symbols-outlined text-xs">pin</span>
                                                Nro. de Operación / Recibo (obligatorio)
                                            </label>
                                            <input type="text" data-numop="true" placeholder="Ej: 00012345, S/N" maxlength="50" oninput="syncNumeroOperacionConf(this)" class="w-full px-3 py-2 bg-white dark:bg-black/20 border border-amber-300 dark:border-amber-700 rounded-lg text-sm font-mono font-bold text-text-main dark:text-white placeholder:text-text-main/30 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


            <!-- INDICADOR DE COMPROBANTE LISTO -->
            <div id="bannerComprobanteConf" class="hidden bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl p-4">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">check_circle</span>
                    <div>
                        <p class="text-sm font-bold text-green-900 dark:text-green-200">Comprobante listo</p>
                        <p id="textoComprobanteConf" class="text-xs text-green-700 dark:text-green-300">Tu comprobante se enviará automáticamente al confirmar.</p>
                    </div>
                </div>
            </div>

        </div>

        <!-- MODAL PARA VER QR GRANDE -->
        <div id="modalQRConf" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onclick="cerrarModalQRConf()">
            <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl max-h-[95vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="flex items-center justify-between mb-4 sm:mb-6">
                    <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div id="modalIconoConf" class="size-10 sm:size-12 rounded-xl flex items-center justify-center flex-shrink-0"></div>
                        <div class="min-w-0 flex-1">
                            <h3 id="modalTituloConf" class="text-lg sm:text-2xl font-black text-text-main dark:text-white truncate">QR de Pago</h3>
                            <p class="text-xs text-text-main/60 dark:text-white/60 font-medium">Escanea para pagar</p>
                        </div>
                    </div>
                    <button onclick="cerrarModalQRConf()" class="size-9 sm:size-10 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0 ml-2">
                        <span class="material-symbols-outlined text-gray-600 dark:text-white text-xl">close</span>
                    </button>
                </div>
                
                <div class="flex flex-col items-center gap-3 sm:gap-4">
                    <!-- QR CODE -->
                    <div class="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg w-full flex items-center justify-center border-2" id="modalBorderConf">
                        <img id="modalImagenConf" src="" alt="QR" class="w-full max-w-[280px] sm:max-w-sm object-contain rounded-lg">
                    </div>
                    
                    <!-- INFORMACIÓN DESTINATARIO EN MODAL -->
                    <div class="bg-gray-50 dark:bg-white/5 rounded-xl p-3 sm:p-4 w-full">
                        <div class="flex items-center gap-2 sm:gap-3">
                            <span class="material-symbols-outlined text-primary text-lg sm:text-xl flex-shrink-0">account_balance</span>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-text-main/50 dark:text-white/50 font-medium">Destinatario</p>
                                <p class="text-xs sm:text-sm font-bold text-text-main dark:text-white truncate">Oscar Orosco</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- SECCIÓN PARA SUBIR COMPROBANTE -->
                    <div class="w-full border-t border-gray-200 dark:border-white/10 pt-4 mt-2">
                        <div class="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 mb-3">
                            <div class="flex items-start gap-2">
                                <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg flex-shrink-0 mt-0.5">upload_file</span>
                                <div>
                                    <p class="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">¿Ya realizaste el pago?</p>
                                    <p class="text-[10px] text-blue-700 dark:text-blue-300">Sube tu captura de pantalla aquí para acelerar la validación</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Input de archivo (oculto) -->
                        <input type="file" id="inputCapturaPagoConf" accept="image/*" class="hidden" onchange="handleCapturaPagoConf(event)">
                        
                        <!-- Botón para subir captura -->
                        <button id="btnSubirCapturaConf" onclick="document.getElementById('inputCapturaPagoConf').click()" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:scale-[1.02]">
                            <span class="material-symbols-outlined text-xl">add_photo_alternate</span>
                            <span>Subir Captura de Pago</span>
                        </button>
                        
                        <!-- Preview de la imagen subida -->
                        <div id="previewCapturaConf" class="hidden mt-3 bg-white dark:bg-white/5 rounded-xl p-3 border border-gray-200 dark:border-white/10">
                            <div class="flex items-center justify-between mb-2">
                                <p class="text-xs font-bold text-text-main dark:text-white flex items-center gap-1">
                                    <span class="material-symbols-outlined text-green-600 text-base">check_circle</span>
                                    Captura cargada
                                </p>
                                <button onclick="eliminarComprobanteConf('plin')" class="text-red-600 hover:text-red-700 text-xs font-bold">
                                    <span class="material-symbols-outlined text-base">delete</span>
                                </button>
                            </div>
                            <img id="imagenPreviewConf" src="" alt="Preview" class="w-full max-h-40 object-contain rounded-lg">
                            <p class="text-[10px] text-text-main/50 dark:text-white/50 mt-2 text-center" id="nombreArchivoConf"></p>
                        </div>
                    </div>

                    <!-- BOTONES -->
                    <div class="grid grid-cols-2 gap-2 sm:gap-3 w-full">
                        <button id="modalDescargarConf" onclick="" class="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary-dark text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg hover:scale-[1.02]">
                            <span class="material-symbols-outlined text-lg sm:text-xl">download</span>
                            <span class="hidden xs:inline">Descargar</span>
                            <span class="xs:hidden">QR</span>
                        </button>
                        <button onclick="cerrarModalQRConf()" class="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.02]">
                            <span class="material-symbols-outlined text-lg sm:text-xl">close</span>
                            Cerrar
                        </button>
                    </div>
                    
                    <p class="text-[10px] sm:text-xs text-text-main/50 dark:text-white/50 text-center px-2">
                        💡 Descarga el QR si estás en el mismo dispositivo
                    </p>
                </div>
            </div>
        </div>
    `;
}

function obtenerIconoDeporte(deporte) {
    const iconos = {
        'Fútbol': 'sports_soccer',
        'Fútbol Femenino': 'sports_soccer',
        'Vóley': 'sports_volleyball',
        'Básquet': 'sports_basketball',
        'Entrenamiento Funcional Adultos': 'fitness_center',
        'Entrenamiento Funcional Menores': 'fitness_center',
        'Entrenamiento de Fuerza y Tonificacin Muscular': 'exercise'
    };
    return iconos[deporte] || 'sports';
}

async function confirmarInscripcion() {
    // Mostrar loader profesional
    mostrarLoaderInscripcion();
    
    const btn = document.getElementById('btnConfirmarInscripcion');
    btn.disabled = true;
    btn.innerHTML = `
        <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
        <span>Procesando...</span>
    `;
    
    try {
        const datosInscripcion = LocalStorage.get('datosInscripcion');
        const { alumno, horariosCompletos } = datosInscripcion;
        
        console.log(' Enviando inscripción con horarios completos:', horariosCompletos);
        
        // Recopilar comprobante si el usuario lo subió
        const comprobanteASubir = capturaConfirmacion || comprobanteBBVAConf || comprobanteBCPConf || comprobanteEfectivoConf;
        
        // Validar número de operación si hay comprobante
        if (comprobanteASubir) {
            const numOp = numeroOperacionConf.trim();
            if (!numOp) {
                cerrarLoaderInscripcion();
                btn.disabled = false;
                btn.innerHTML = `<span>Confirmar y Finalizar</span><span class="material-symbols-outlined">check_circle</span>`;
                // Buscar el input visible de nro operación y hacer scroll
                var inputsNumOp = document.querySelectorAll('input[data-numop="true"]');
                var inputVisible = null;
                inputsNumOp.forEach(function(inp) {
                    if (inp.offsetParent !== null) inputVisible = inp;
                });
                if (inputVisible) {
                    inputVisible.style.borderColor = '#dc2626';
                    inputVisible.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(function() { inputVisible.style.borderColor = ''; }, 3000);
                }
                Utils.mostrarNotificacion('Debes ingresar el número de operación de tu pago', 'error');
                return;
            }
            comprobanteASubir.numero_operacion = numOp;
        }
        
        // Enviar inscripción al backend con los horarios completos + comprobante en un solo request
        const resultado = await academiaAPI.inscribirMultiple(alumno, horariosCompletos, comprobanteASubir);
        
        if (resultado.success) {
            // Guardar código de operacin con todos los datos necesarios
            LocalStorage.set('ultimaInscripcion', {
                codigo: resultado.codigo_operacion,
                fecha: new Date().toISOString(),
                alumno: `${alumno.nombres} ${alumno.apellidos}`,
                dni: alumno.dni,
                horarios: horariosCompletos, // Guardar horarios completos para el WhatsApp
                matricula: {
                    deportesNuevos: deportesConMatriculaGlobal,
                    cantidad: deportesConMatriculaGlobal.length,
                    monto: deportesConMatriculaGlobal.length * 20
                }
            });
            
            // Limpiar datos temporales para evitar reintentos
            LocalStorage.remove('datosInscripcion');
            LocalStorage.remove('horariosSeleccionados');
            
            // El comprobante ya se envió junto con la inscripción para evitar
            // race conditions en Drive (doble carpeta). El servidor lo sube
            // automáticamente DESPUÉS de que Apps Script sincronice la inscripción.

            // Redirigir a pgina de xito
            cerrarLoaderInscripcion();
            window.location.href = `/exito?codigo=${resultado.codigo_operacion}`;
        } else {
            throw new Error(resultado.error || 'Error al procesar inscripción');
        }
        
    } catch (error) {
        // Cerrar loader antes de mostrar error
        cerrarLoaderInscripcion();
        
        console.error('Error al confirmar inscripción:', error);
        
        // Restaurar botn
        btn.disabled = false;
        btn.innerHTML = `
            <span>Confirmar y Finalizar</span>
            <span class="material-symbols-outlined">check_circle</span>
        `;
        
        // Mostrar modal informativo segn el tipo de error
        let titulo = ' Error en la inscripción';
        let Mensaje = error.message;
        let detalles = '';
        
        // Error 409: inscripción duplicada
        if (error.status === 409 && error.data) {
            titulo = ' inscripción Duplicada';
            Mensaje = error.data.message || 'Ya existe una inscripción activa para este deporte';
            if (error.data.deporte) {
                detalles = `<div class="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p class="font-semibold text-yellow-800 dark:text-yellow-400">Deporte: ${error.data.deporte}</p>
                    ${error.data.inscripcion_existente ? `
                        <p class="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                            Estado: ${error.data.inscripcion_existente.estado === 'activa' ? 'Activa' : 'Pendiente'}<br>
                            Plan: ${error.data.inscripcion_existente.plan}<br>
                            Precio: S/ ${error.data.inscripcion_existente.precio}
                        </p>
                    ` : ''}
                </div>`;
            }
        }
        // Error 400: Horarios sin ID o validacin
        else if (error.status === 400 && error.data) {
            titulo = ' Datos Invlidos';
            Mensaje = error.data.message || 'Los datos enviados no son vlidos';
            if (error.data.horarios_invalidos) {
                detalles = `<div class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p class="text-sm text-red-700 dark:text-red-400">
                        Se encontraron ${error.data.horarios_invalidos} horarios sin identificador vlido.
                        <br><br>
                        <strong>Solucin:</strong> Por favor, vuelve al paso anterior y selecciona los horarios de la lista disponible.
                    </p>
                </div>`;
            }
        }
        // Error 500: Error del servidor
        else if (error.status === 500 && error.data) {
            titulo = 'Error al Procesar';
            Mensaje = error.data.message || 'No se pudo completar la inscripción';

            // Detectar duplicado por código MySQL o flag legacy
            const esDuplicado = error.data.codigo === 'ER_DUP_ENTRY'
                || error.data.detalles === 'DUPLICADO'
                || (error.data.message && error.data.message.includes('Ya est'));
            // Horario ya no disponible
            const esHorarioInvalido = error.data.codigo === 'ER_NO_REFERENCED_ROW_2';
            // Problema de conexión
            const esConexion = ['ECONNRESET','PROTOCOL_CONNECTION_LOST','ECONNREFUSED'].includes(error.data.codigo);

            if (esDuplicado) {
                titulo = 'Inscripción Duplicada';
                Mensaje = 'Ya existe una inscripción activa para uno o más de estos horarios.';
                detalles = `<div class="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p class="text-sm text-yellow-700 dark:text-yellow-400">${error.data.message}</p>
                    <p class="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                        <strong>Sugerencia:</strong> Si deseas cambiar de horario, primero debes dar de baja tu inscripción actual.
                    </p>
                </div>`;
            } else if (esHorarioInvalido) {
                titulo = 'Horario No Disponible';
                Mensaje = error.data.message;
                detalles = `<div class="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p class="text-sm text-orange-700 dark:text-orange-400">El horario seleccionado ya no está disponible. Vuelve al paso anterior y elige otro.</p>
                </div>`;
            } else if (esConexion) {
                titulo = 'Error de Conexión';
                Mensaje = error.data.message;
                detalles = `<div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p class="text-sm text-blue-700 dark:text-blue-400">Espera unos segundos y pulsa <strong>Reintentar</strong>.</p>
                </div>`;
            } else if (error.data.detalles) {
                // Mostrar el error técnico para diagnóstico
                detalles = `<div class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p class="text-xs text-red-600 dark:text-red-400 font-mono break-all">${error.data.detalles}</p>
                </div>`;
            }
        }
        else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            titulo = ' Error de Conexin';
            Mensaje = 'No se pudo conectar con el servidor';
            detalles = `<div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p class="text-sm text-blue-700 dark:text-blue-400">
                     Verifica tu conexin a internet<br>
                     El servidor puede estar temporalmente no disponible<br>
                     Intenta nuevamente en unos Momentos
                </p>
            </div>`;
        }
        
        // Crear y mostrar modal personalizado
        const modalHTML = `
            <div id="modalErrorInscripcion" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                    <div class="flex items-start gap-4 mb-4">
                        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <span class="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">error</span>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-bold text-black dark:text-white mb-2">${titulo}</h3>
                            <p class="text-text-muted dark:text-gray-300">${Mensaje}</p>
                            ${detalles}
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        ${error.status === 409 ? `
                            <button onclick="window.location.href='admin-panel.html?dni=${alumno.dni}'" 
                                    class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                                Ver Mis Inscripciones
                            </button>
                        ` : (error.status === 400 || (error.status === 500 && (error.data?.codigo === 'ER_DUP_ENTRY' || error.data?.detalles === 'DUPLICADO' || error.data?.codigo === 'ER_NO_REFERENCED_ROW_2'))) ? `
                            <button onclick="localStorage.clear(); window.location.href='/seleccion-horarios-new'" 
                                    class="flex-1 px-4 py-2.5 bg-primary hover:brightness-110 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined">refresh</span>
                                Seleccionar Otros Horarios
                            </button>
                        ` : (error.status === 500) ? `
                            <button onclick="document.getElementById('modalErrorInscripcion').remove(); confirmarInscripcion();" 
                                    class="flex-1 px-4 py-2.5 bg-primary hover:brightness-110 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined">refresh</span>
                                Reintentar
                            </button>
                        ` : ''}
                        <button onclick="document.getElementById('modalErrorInscripcion').remove()" 
                                class="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-semibold transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar modal en el DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        btn.disabled = false;
        btn.innerHTML = `
            <span>Confirmar y Finalizar</span>
            <span class="material-symbols-outlined">check_circle</span>
        `;
    }
}

function volverHorarios() {
    // Crear modal personalizado en lugar del confirm nativo
    const modalHTML = `
        <div id="modalVolverHorarios" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in">
                <div class="flex items-start gap-4 mb-4">
                    <div class="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl text-yellow-600 dark:text-yellow-400">warning</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-black dark:text-white mb-2">¿Volver a seleccionar horarios?</h3>
                        <p class="text-text-muted dark:text-gray-300">Si vuelves, perderás la selección actual y tendrás que elegir tus horarios nuevamente.</p>
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button onclick="document.getElementById('modalVolverHorarios').remove()" 
                            class="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-semibold transition-colors">
                        Cancelar
                    </button>
                    <button onclick="window.location.href='/seleccion-horarios-new'" 
                            class="flex-1 px-4 py-2.5 bg-primary hover:brightness-110 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">arrow_back</span>
                        Sí, volver
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Mostrar loader profesional durante la inscripción
 */
function mostrarLoaderInscripcion() {
    const loader = document.createElement('div');
    loader.id = 'loaderInscripcion';
    loader.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm';
    loader.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 border border-primary/20">
            <div class="flex flex-col items-center gap-6">
                <!-- Spinner animado -->
                <div class="relative">
                    <div class="size-24 rounded-full border-4 border-primary/20"></div>
                    <div class="absolute inset-0 size-24 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary text-4xl animate-pulse">rocket_launch</span>
                    </div>
                </div>
                
                <!-- Texto animado -->
                <div class="text-center">
                    <h3 class="text-2xl font-black text-text-main dark:text-white mb-2">Procesando inscripción</h3>
                    <p class="text-sm text-text-main/70 dark:text-white/70 mb-3">Por favor espera mientras procesamos tu inscripción...</p>
                    
                    <!-- Pasos -->
                    <div class="space-y-2 text-left bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                        <div class="flex items-center gap-2 text-xs">
                            <div class="size-2 rounded-full bg-primary animate-pulse"></div>
                            <span class="text-text-main/60 dark:text-white/60">Guardando datos del alumno</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs">
                            <div class="size-2 rounded-full bg-primary/50 animate-pulse" style="animation-delay: 0.2s"></div>
                            <span class="text-text-main/60 dark:text-white/60">Registrando horarios seleccionados</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs">
                            <div class="size-2 rounded-full bg-primary/50 animate-pulse" style="animation-delay: 0.4s"></div>
                            <span class="text-text-main/60 dark:text-white/60">Procesando inscripción</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(loader);
    document.body.style.overflow = 'hidden';
}

/**
 * Cerrar loader de inscripción
 */
function cerrarLoaderInscripcion() {
    const loader = document.getElementById('loaderInscripcion');
    if (loader) {
        loader.remove();
        document.body.style.overflow = '';
    }
}

// =====================================================================
//  FUNCIONES DE PAGO EN CONFIRMACIÓN
// =====================================================================

function toggleMetodoPagoConf(metodo) {
    const id = metodo.charAt(0).toUpperCase() + metodo.slice(1);
    const content = document.getElementById('content' + id + 'Conf');
    const icon = document.getElementById('icon' + id + 'Conf');
    if (!content) return;
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        content.offsetHeight;
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        content.style.maxHeight = '0';
        content.style.opacity = '0';
        if (icon) icon.style.transform = 'rotate(0deg)';
        setTimeout(function() { content.classList.add('hidden'); }, 300);
    }
}

function copiarCuentaConf(numeroCuenta, event) {
    navigator.clipboard.writeText(numeroCuenta).then(function() {
        Utils.mostrarNotificacion('Cuenta copiada: ' + numeroCuenta, 'success');
        if (event) {
            var btn = event.target.closest('button');
            if (btn) {
                var orig = btn.innerHTML;
                var origC = btn.className;
                btn.innerHTML = '<span class="material-symbols-outlined text-base">check</span>';
                btn.classList.remove('bg-blue-600','hover:bg-blue-700','bg-red-600','hover:bg-red-700');
                btn.classList.add('bg-green-600');
                setTimeout(function() { btn.innerHTML = orig; btn.className = origC; }, 2000);
            }
        }
    }).catch(function() { Utils.mostrarNotificacion('No se pudo copiar. Intenta manualmente', 'warning'); });
}

function procesarImagenConf(file, onSuccess) {
    if (!file || !file.type.startsWith('image/')) {
        Utils.mostrarNotificacion('Por favor selecciona una imagen válida', 'error');
        return;
    }
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function() {
        URL.revokeObjectURL(url);
        var maxW = 1024, w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        onSuccess(canvas.toDataURL('image/jpeg', 0.75), file.name);
    };
    img.onerror = function() { URL.revokeObjectURL(url); Utils.mostrarNotificacion('Error al leer la imagen', 'error'); };
    img.src = url;
}

function handleCapturaPagoConf(event) {
    var file = event.target.files[0];
    procesarImagenConf(file, function(base64, nombre) {
        capturaConfirmacion = { nombre: nombre, tipo: 'image/jpeg', base64: base64, banco: 'Plin' };
        // Actualizar preview en el acordeón de Plin
        var preview = document.getElementById('previewPlinConf');
        var imagen = document.getElementById('imagenPreviewPlinConf');
        if (preview && imagen) { imagen.src = base64; preview.classList.remove('hidden'); }
        // Actualizar preview dentro del modal QR también
        var previewModal = document.getElementById('previewCapturaConf');
        var imagenModal = document.getElementById('imagenPreviewConf');
        var nombreModal = document.getElementById('nombreArchivoConf');
        if (previewModal && imagenModal) { imagenModal.src = base64; previewModal.classList.remove('hidden'); }
        if (nombreModal) nombreModal.textContent = nombre;
        recalcularAcordeonConf('Plin');
        mostrarBannerComprobanteConf('Plin - ' + nombre);
    });
}

function handleComprobanteConf(event, banco) {
    var file = event.target.files[0];
    procesarImagenConf(file, function(base64, nombre) {
        var comp = { nombre: nombre, tipo: 'image/jpeg', base64: base64, banco: banco };
        if (banco === 'BBVA') comprobanteBBVAConf = comp;
        else if (banco === 'BCP') comprobanteBCPConf = comp;
        else comprobanteEfectivoConf = comp;
        if (!capturaConfirmacion) capturaConfirmacion = comp;
        var preview = document.getElementById('preview' + banco + 'Conf');
        var imagen = document.getElementById('imagenPreview' + banco + 'Conf');
        if (preview && imagen) { imagen.src = base64; preview.classList.remove('hidden'); }
        recalcularAcordeonConf(banco === 'Efectivo' ? 'Efectivo' : banco === 'BBVA' ? 'Bbva' : banco === 'BCP' ? 'Bcp' : 'Plin');
        mostrarBannerComprobanteConf(banco + ' - ' + nombre);
    });
}

function recalcularAcordeonConf(idParte) {
    var content = document.getElementById('content' + idParte + 'Conf');
    if (content && !content.classList.contains('hidden')) {
        setTimeout(function() { content.style.maxHeight = content.scrollHeight + 'px'; }, 50);
    }
}

function eliminarComprobanteConf(tipo) {
    // Para Plin: usar ID con P mayúscula (previewPlinConf) y también limpiar preview del modal QR
    var previewId = tipo === 'plin' ? 'previewPlinConf' : 'preview' + tipo + 'Conf';
    var preview = document.getElementById(previewId);
    var input = document.getElementById('inputComprobante' + tipo + 'Conf');
    if (preview) preview.classList.add('hidden');
    if (input) input.value = '';
    // También ocultar preview del modal QR si existe
    var previewModal = document.getElementById('previewCapturaConf');
    if (previewModal) previewModal.classList.add('hidden');
    if (tipo === 'BBVA') { comprobanteBBVAConf = null; if (capturaConfirmacion && capturaConfirmacion.banco === 'BBVA') capturaConfirmacion = null; }
    else if (tipo === 'BCP') { comprobanteBCPConf = null; if (capturaConfirmacion && capturaConfirmacion.banco === 'BCP') capturaConfirmacion = null; }
    else if (tipo === 'plin') {
        capturaConfirmacion = null;
        var inputPlin = document.getElementById('inputCapturaPlinConf');
        if (inputPlin) inputPlin.value = '';
    } else { comprobanteEfectivoConf = null; if (capturaConfirmacion && capturaConfirmacion.banco === 'Efectivo') capturaConfirmacion = null; }
    if (!capturaConfirmacion) capturaConfirmacion = comprobanteBBVAConf || comprobanteBCPConf || comprobanteEfectivoConf || null;
    if (!capturaConfirmacion) {
        var banner = document.getElementById('bannerComprobanteConf');
        if (banner) banner.classList.add('hidden');
        // Limpiar todos los inputs de nro operación
        document.querySelectorAll('input[data-numop="true"]').forEach(function(inp) { inp.value = ''; });
        numeroOperacionConf = '';
    } else {
        mostrarBannerComprobanteConf(capturaConfirmacion.banco + ' - ' + capturaConfirmacion.nombre);
    }
    var idParte = tipo === 'BBVA' ? 'Bbva' : tipo === 'BCP' ? 'Bcp' : tipo === 'Efectivo' ? 'Efectivo' : 'Plin';
    recalcularAcordeonConf(idParte);
    Utils.mostrarNotificacion('Comprobante ' + tipo + ' eliminado', 'info');
}

function mostrarBannerComprobanteConf(detalle) {
    var banner = document.getElementById('bannerComprobanteConf');
    var texto = document.getElementById('textoComprobanteConf');
    if (banner) banner.classList.remove('hidden');
    if (texto) texto.textContent = 'Listo: ' + detalle + '. Se enviará automáticamente al confirmar.';
    Utils.mostrarNotificacion('Comprobante agregado correctamente', 'success');
}

function abrirModalQRConf(urlImagen, tipo) {
    var modal = document.getElementById('modalQRConf');
    var imagen = document.getElementById('modalImagenConf');
    var titulo = document.getElementById('modalTituloConf');
    var icono = document.getElementById('modalIconoConf');
    var border = document.getElementById('modalBorderConf');
    var btnDesc = document.getElementById('modalDescargarConf');
    if (!modal) return;
    imagen.src = urlImagen;
    titulo.textContent = 'Pagar con ' + tipo;
    btnDesc.onclick = function() { descargarQRConf(urlImagen, 'QR-' + tipo + '.jpg'); };
    icono.innerHTML = '<span class="material-symbols-outlined text-green-600 text-3xl sm:text-4xl">account_balance_wallet</span>';
    icono.style.backgroundColor = '#dcfce7';
    border.style.borderColor = '#22c55e';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cerrarModalQRConf() {
    var modal = document.getElementById('modalQRConf');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function descargarQRConf(urlImagen, nombreArchivo) {
    fetch(urlImagen).then(function(r) { return r.blob(); }).then(function(blob) {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = nombreArchivo;
        document.body.appendChild(a); a.click();
        window.URL.revokeObjectURL(url); document.body.removeChild(a);
        Utils.mostrarNotificacion('QR descargado: ' + nombreArchivo, 'success');
    }).catch(function() { Utils.mostrarNotificacion('Error al descargar el QR', 'error'); });
}

document.addEventListener('keydown', function(e) { if (e.key === 'Escape') cerrarModalQRConf(); });

// Sincroniza todos los inputs de número de operación (uno por acordeón)
function syncNumeroOperacionConf(inputEl) {
    var v = inputEl.value.trim();
    numeroOperacionConf = v;
    // Sincronizar el valor en todos los inputs data-numop para que no se pierda si cambia de acordeón
    document.querySelectorAll('input[data-numop="true"]').forEach(function(inp) {
        if (inp !== inputEl) inp.value = inputEl.value;
    });
}







