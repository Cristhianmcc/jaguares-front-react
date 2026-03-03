/**
 * Script para la página de consulta de estado
 */

let datosUsuario = null;

document.addEventListener('DOMContentLoaded', () => {
    inicializarConsulta();
});

function inicializarConsulta() {
    const formConsulta = document.getElementById('formConsulta');
    
    // Verificar si viene desde URL con DNI
    const params = new URLSearchParams(window.location.search);
    const dniUrl = params.get('dni');
    
    if (dniUrl) {
        document.getElementById('dniConsulta').value = dniUrl;
        consultarPorDNI(dniUrl);
    }
    
    // Manejar submit del formulario
    formConsulta.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dni = document.getElementById('dniConsulta').value.trim();
        
        if (dni.length !== 8 || !/^\d+$/.test(dni)) {
            mostrarNotificacion('Por favor ingrese un DNI válido de 8 dígitos', 'error');
            return;
        }
        
        await consultarPorDNI(dni);
    });
}

async function consultarPorDNI(dni) {
    const btnSubmit = document.querySelector('#formConsulta button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `
        <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
        <span>Consultando...</span>
    `;
    
    try {
        // Buscar inscripción por DNI
        const resultado = await academiaAPI.consultarInscripcion(dni);
        
        if (resultado.success) {
            // ✅ VALIDACIÓN: Verificar que el pago esté confirmado
            const estadoPago = resultado.pago.estado ? resultado.pago.estado.toLowerCase().trim() : '';
            
            if (estadoPago !== 'confirmado' && estadoPago !== 'activo') {
                // Pago no confirmado - mostrar Mensaje y no permitir acceso
                console.log('📋 Resultado completo:', resultado);
                console.log('🔍 Comprobante URL:', resultado.pago.comprobante_url);
                mostrarPagoNoConfirmado(resultado);
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = `
                    <span>Consultar Estado</span>
                    <span class="material-symbols-outlined">search</span>
                `;
                return;
            }
            
            // Pago confirmado - permitir acceso
            datosUsuario = resultado; // El resultado ya contiene alumno, pago, horarios
            mostrarResultados();
        } else {
            // Verificar si el usuario está inactivo
            if (resultado.inactivo) {
                mostrarModalInactivo(dni);
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = `
                    <span>Consultar Estado</span>
                    <span class="material-symbols-outlined">search</span>
                `;
                return;
            }
            
            mostrarNotificacion(resultado.error || 'No se encontró ninguna inscripción con ese DNI', 'error');
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `
                <span>Consultar Estado</span>
                <span class="material-symbols-outlined">search</span>
            `;
        }
    } catch (error) {
        // Si es un error 403, es un usuario inactivo (esperado, no es error real)
        if (error.response && error.response.status === 403) {
            mostrarModalInactivo(dni);
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `
                <span>Consultar Estado</span>
                <span class="material-symbols-outlined">search</span>
            `;
            return;
        }
        
        // Solo mostrar error en consola si NO es 403
        console.error('Error al consultar:', error);
        mostrarNotificacion('Error al consultar. Intente nuevamente.', 'error');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `
            <span>Consultar Estado</span>
            <span class="material-symbols-outlined">search</span>
        `;
    }
}

function mostrarResultados() {
    // Ocultar vista de ingreso
    document.getElementById('vistaIngreso').classList.add('hidden');
    
    // Mostrar vista de resultados
    document.getElementById('vistaResultados').classList.remove('hidden');
    
    // Mostrar info de usuario en header (desktop y móvil)
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const userInfoMobile = document.getElementById('userInfoMobile');
    const userNameMobile = document.getElementById('userNameMobile');
    
    const nombreCompleto = `${datosUsuario.alumno.nombres} ${datosUsuario.alumno.apellidos}`;
    
    userInfo.classList.remove('hidden');
    userInfo.classList.add('flex');
    userName.textContent = nombreCompleto;
    
    // Actualizar móvil también
    if (userInfoMobile && userNameMobile) {
        userInfoMobile.classList.remove('hidden');
        userInfoMobile.classList.add('flex');
        userNameMobile.textContent = nombreCompleto;
    }
    userName.textContent = datosUsuario.alumno.nombres || 'Usuario';
    userInfo.classList.remove('hidden');
    userInfo.classList.add('flex');
    
    // Renderizar estado de inscripción
    renderizarEstado();
    
    // Renderizar datos del alumno
    renderizarDatosAlumno();
    
    // Renderizar horarios
    renderizarHorarios();
    
    // Renderizar sección de pago Mensual
    renderizarSeccionPagoMensual();
}

/**
 * Mostrar Mensaje cuando el pago no está confirmado
 */
function mostrarPagoNoConfirmado(resultado) {
    const vistaIngreso = document.getElementById('vistaIngreso');
    const datosPago = resultado.pago;
    const dni = resultado.alumno.dni;
    
    // Guardar DNI globalmente para el modal de subida tardía
    window.dniUsuarioActual = dni;
    
    // Crear HTML del Mensaje (sin ocultarlo del DOM, solo reemplazamos el contenido)
    vistaIngreso.innerHTML = `
        <div class="w-full max-w-[600px] flex flex-col gap-8">
            <!-- Icono y título -->
            <div class="flex flex-col gap-6 text-center">
                <div class="flex justify-center">
                    <div class="size-20 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 border-2 border-yellow-500/30">
                        <span class="material-symbols-outlined text-[48px]">pending</span>
                    </div>
                </div>
                <div>
                    <h1 class="text-black dark:text-white text-4xl md:text-5xl font-black italic uppercase tracking-tight mb-3">
                        Pago <span class="text-yellow-600">Pendiente</span>
                    </h1>
                    <p class="text-text-muted dark:text-gray-400 text-lg font-medium">
                        Tu inscripción aún no ha sido confirmada
                    </p>
                </div>
            </div>

            <!-- Tarjeta de información -->
            <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-8 shadow-xl border-l-4 border-yellow-500">
                <div class="flex items-start gap-4 mb-6">
                    <div class="size-12 rounded-full bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-3xl">info</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-black text-black dark:text-white uppercase mb-2">Estado Actual</h3>
                        <span class="inline-block px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 text-xs font-black uppercase tracking-wider mb-3">
                            ${datosPago.estado || 'PENDIENTE'}
                        </span>
                        <p class="text-text-muted dark:text-gray-400 text-sm leading-relaxed">
                            Tu inscripción ha sido registrada correctamente, pero el pago aún no ha sido confirmado por nuestro equipo administrativo.
                        </p>
                    </div>
                </div>

                <!-- Información del pago -->
                ${datosPago.codigo_operacion ? `
                <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="material-symbols-outlined text-primary">confirmation_number</span>
                        <p class="text-xs text-text-muted dark:text-gray-400 font-bold uppercase">Código de Operación</p>
                    </div>
                    <p class="text-lg font-black text-black dark:text-white font-mono">${datosPago.codigo_operacion}</p>
                </div>
                ` : ''}

                <!-- Qué hacer -->
                <div class="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-blue-600 flex-shrink-0">lightbulb</span>
                        <div>
                            <h4 class="text-blue-900 dark:text-blue-300 font-bold text-sm uppercase mb-2">¿Qué puedo hacer?</h4>
                            <ul class="space-y-2 text-text-muted dark:text-gray-400 text-sm">
                                <li class="flex items-start gap-2">
                                    <span class="text-primary">•</span>
                                    <span>Si aún no subiste tu comprobante de pago, hazlo desde el enlace que recibiste al inscribirte.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <span class="text-primary">•</span>
                                    <span>Si ya subiste el comprobante, espera a que el administrador verifique tu pago (puede tomar hasta 24 horas).</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <span class="text-primary">•</span>
                                    <span>Una vez confirmado, podrás ver toda tu información de inscripción aquí.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div class="flex flex-col gap-3 mt-6">
                    ${!datosPago.comprobante_url ? `
                    <button onclick="abrirModalSubirComprobante()" 
                       class="flex items-center justify-center gap-2 h-12 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-black font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                        <span class="material-symbols-outlined">upload</span>
                        <span>Subir Comprobante de Pago</span>
                    </button>
                    ` : datosPago.codigo_operacion ? `
                    <a href="confirmacion.html?codigo=${datosPago.codigo_operacion}" 
                       class="flex items-center justify-center gap-2 h-12 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-black font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                        <span class="material-symbols-outlined">upload</span>
                        <span>Subir Comprobante</span>
                    </a>
                    ` : ''}
                    
                    <button onclick="location.reload()" 
                            class="flex items-center justify-center gap-2 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-text-main dark:text-white font-bold text-sm uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                        <span class="material-symbols-outlined">refresh</span>
                        <span>Volver a Consultar</span>
                    </button>
                    
                    <a href="index.html" 
                       class="text-text-main/60 dark:text-white/60 hover:text-primary dark:hover:text-primary text-sm font-bold flex items-center justify-center gap-2 transition-colors py-2 uppercase tracking-wide">
                        <span class="material-symbols-outlined text-lg">arrow_back</span>
                        Volver al Inicio
                    </a>
                </div>
            </div>
        </div>
    `;
}

function renderizarEstado() {
    const container = document.getElementById('estadoInscripcion');
    const estado = datosUsuario.pago.estado || 'pendiente';
    
    let colorBorde = 'border-yellow-500';
    let colorFondo = 'bg-yellow-50 dark:bg-yellow-900/10';
    let colorTexto = 'text-yellow-800 dark:text-yellow-200';
    let icono = 'pending';
    let Mensaje = 'Tu inscripción está pendiente de confirmación. Recuerda enviar tu comprobante de pago.';
    
    if (estado.toLowerCase() === 'confirmado' || estado.toLowerCase() === 'activo') {
        colorBorde = 'border-green-500';
        colorFondo = 'bg-green-50 dark:bg-green-900/10';
        colorTexto = 'text-green-800 dark:text-green-200';
        icono = 'check_circle';
        Mensaje = '¡Tu inscripción ha sido confirmada! Ya puedes asistir a tus clases.';
    } else if (estado.toLowerCase() === 'rechazado' || estado.toLowerCase() === 'cancelado') {
        colorBorde = 'border-red-500';
        colorFondo = 'bg-red-50 dark:bg-red-900/10';
        colorTexto = 'text-red-800 dark:text-red-200';
        icono = 'cancel';
        Mensaje = 'Tu inscripción no pudo ser procesada. Contacta con administración.';
    }
    
    container.className = `bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 shadow-xl border-l-4 ${colorBorde}`;
    container.innerHTML = `
        <div class="flex items-start gap-4">
            <div class="size-12 rounded-full ${colorFondo} ${colorTexto} flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-3xl">${icono}</span>
            </div>
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-black text-black dark:text-white uppercase">Estado de Inscripción</h3>
                    <span class="px-3 py-1 rounded-full ${colorFondo} ${colorTexto} text-xs font-black uppercase tracking-wider">${estado}</span>
                </div>
                <p class="text-text-muted dark:text-gray-400 text-sm mb-3">${Mensaje}</p>
                ${datosUsuario.pago.codigo ? `
                <div class="flex items-center gap-2 mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <span class="material-symbols-outlined text-primary">confirmation_number</span>
                    <div>
                        <p class="text-xs text-text-muted dark:text-gray-400 font-bold uppercase">Código de Operación</p>
                        <p class="text-sm font-black text-black dark:text-white font-mono">${datosUsuario.pago.codigo}</p>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderizarDatosAlumno() {
    const container = document.getElementById('datosAlumno');
    
    container.innerHTML = `
        <div class="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div class="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">person</span>
            </div>
            <h3 class="text-2xl font-bold text-black dark:text-white uppercase tracking-tight">Datos Personales</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <p class="text-primary text-xs font-black uppercase tracking-widest mb-1">Nombre Completo</p>
                <p class="text-text-main dark:text-white text-lg font-bold">${datosUsuario.alumno.nombres} ${datosUsuario.alumno.apellidos}</p>
            </div>
            
            <div>
                <p class="text-primary text-xs font-black uppercase tracking-widest mb-1">DNI</p>
                <p class="text-text-main dark:text-white text-lg font-bold font-mono">${datosUsuario.alumno.dni}</p>
            </div>
            
            <div>
                <p class="text-primary text-xs font-black uppercase tracking-widest mb-1">Teléfono</p>
                <p class="text-text-main dark:text-white text-base font-bold">${datosUsuario.alumno.telefono}</p>
            </div>
            
            <div>
                <p class="text-primary text-xs font-black uppercase tracking-widest mb-1">Monto Total</p>
                <p class="text-text-main dark:text-white text-base font-bold">S/ ${datosUsuario.pago.monto.toFixed(2)}</p>
            </div>
            
            <div>
                <p class="text-primary text-xs font-black uppercase tracking-widest mb-1">Método de Pago</p>
                <p class="text-text-main dark:text-white text-base font-bold">${datosUsuario.pago.metodo_pago}</p>
            </div>
            
            <div>
                <p class="text-primary text-xs font-black uppercase tracking-widest mb-1">Fecha de Registro</p>
                <p class="text-text-main dark:text-white text-base font-bold">${Utils.formatearFecha(datosUsuario.pago.fecha_registro)}</p>
            </div>
        </div>
    `;
}

function renderizarHorarios() {
    const container = document.getElementById('horariosInscritos');
    
    if (!datosUsuario.horarios || datosUsuario.horarios.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-3">event_busy</span>
                <p class="text-text-muted dark:text-gray-400">No hay horarios registrados</p>
            </div>
        `;
        return;
    }
    
    // Agrupar horarios por deporte (inscripcion_id)
    const deportesAgrupados = {};
    datosUsuario.horarios.forEach(horario => {
        const key = horario.inscripcion_id;
        if (!deportesAgrupados[key]) {
            deportesAgrupados[key] = {
                inscripcion_id: horario.inscripcion_id,
                deporte: horario.deporte,
                sede: horario.sede || 'Sede Principal',
                precio: horario.precio,
                categoria: horario.categoria || '',
                estado: horario.estado_inscripcion || 'activa',
                horarios: []
            };
        }
        deportesAgrupados[key].horarios.push({
            horario_id: horario.horario_id,
            dia: horario.dia,
            hora_inicio: horario.hora_inicio,
            hora_fin: horario.hora_fin
        });
    });

    // Sin restricción de días - se puede pausar cualquier día del mes
    const puedePausar = true;
    
    container.innerHTML = Object.values(deportesAgrupados).map(deporte => {
        const icono = obtenerIconoDeporte(deporte.deporte);
        const esSuspendido = deporte.estado === 'suspendida';
        
        // Clases condicionales según estado
        const cardClasses = esSuspendido 
            ? 'bg-gray-100 dark:bg-gray-800/50 opacity-70 border-gray-300 dark:border-gray-700' 
            : 'bg-white dark:bg-[#222] border-gray-100 dark:border-gray-800 hover:border-primary dark:hover:border-primary';
        
        const iconBgClasses = esSuspendido
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            : 'bg-primary/10 text-primary';
        
        // Botón de acción
        let botonAccion = '';
        if (esSuspendido) {
            // Siempre puede reactivar
            botonAccion = `
                <button onclick="toggleDeporte(${deporte.inscripcion_id}, 'reactivar')" 
                        class="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold uppercase transition-all">
                    <span class="material-symbols-outlined text-sm">play_arrow</span>
                    Reactivar Deporte
                </button>
            `;
        } else if (puedePausar) {
            // Puede pausar
            botonAccion = `
                <button onclick="toggleDeporte(${deporte.inscripcion_id}, 'pausar')" 
                        class="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase transition-all">
                    <span class="material-symbols-outlined text-sm">pause</span>
                    Pausar Deporte
                </button>
            `;
        } else {
            // No puede pausar (después del día 5)
            botonAccion = `
                <div class="mt-3 text-center">
                    <p class="text-xs text-gray-500 dark:text-gray-400 italic">
                        <span class="material-symbols-outlined text-sm align-middle">info</span>
                        Podrás pausar este deporte a partir del día 1 del próximo mes
                    </p>
                </div>
            `;
        }
        
        // Lista de horarios (con botón eliminar si hay más de 1 y la inscripción está activa)
        const totalDiasDeporte = deporte.horarios.length;
        const horariosHtml = deporte.horarios.map(h => `
            <div class="flex items-center gap-2 text-text-muted dark:text-gray-400 text-sm">
                <span class="material-symbols-outlined text-lg ${esSuspendido ? 'text-gray-400' : 'text-primary'}">calendar_today</span>
                <span class="font-medium flex-1">${h.dia} ${formatearHora(h.hora_inicio)} - ${formatearHora(h.hora_fin)}</span>
                ${!esSuspendido && totalDiasDeporte > 1 && h.horario_id ? `
                <button onclick="confirmarEliminarHorario(${deporte.inscripcion_id}, ${h.horario_id}, '${h.dia}')"
                        class="ml-1 p-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Eliminar este día">
                    <span class="material-symbols-outlined text-base">delete</span>
                </button>` : ''}
            </div>
        `).join('');

        // Botón agregar día (solo para inscripciones activas)
        const botonAgregarDia = !esSuspendido ? `
            <button onclick="abrirModalAgregarHorario(${deporte.inscripcion_id})"
                    class="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold uppercase transition-all">
                <span class="material-symbols-outlined text-sm">add_circle</span>
                Agregar día
            </button>
        ` : '';
        
        return `
            <div class="rounded-lg p-5 shadow-md border transition-all ${cardClasses}">
                <div class="flex items-start gap-4 mb-3">
                    <div class="size-12 rounded-lg ${iconBgClasses} flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-2xl">${icono}</span>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h4 class="text-lg font-black ${esSuspendido ? 'text-gray-500 dark:text-gray-400' : 'text-black dark:text-white'} uppercase tracking-tight">${deporte.deporte}</h4>
                            ${esSuspendido ? `
                                <span class="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase">
                                    Pausado
                                </span>
                            ` : `
                                <span class="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase">
                                    Activo
                                </span>
                            `}
                        </div>
                        <p class="text-xs ${esSuspendido ? 'text-gray-400' : 'text-primary'} font-bold uppercase">${deporte.sede}</p>
                        ${deporte.categoria ? `<p class="text-xs text-gray-500 mt-0.5"><span class="font-semibold">Categoría:</span> ${deporte.categoria}</p>` : ''}
                        <p class="text-xs text-gray-500 mt-1">S/ ${parseFloat(deporte.precio).toFixed(2)}/mes</p>
                    </div>
                </div>
                
                <div class="space-y-2">
                    ${horariosHtml}
                </div>
                
                ${botonAccion}
                ${botonAgregarDia}
            </div>
        `;
    }).join('') + `
        <div class="col-span-full mt-2">
            <a href="/inscripcion?dni=${datosUsuario.alumno.dni}&nuevo_deporte=1"
               class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-primary/10 dark:hover:bg-primary/20 text-gray-600 dark:text-gray-300 hover:text-primary border border-gray-200 dark:border-gray-700 hover:border-primary/50 font-bold text-sm uppercase transition-all">
                <span class="material-symbols-outlined text-sm">sports</span>
                Inscribirse en otro deporte
            </a>
        </div>`;
}

/**
 * Mostrar modal de confirmación para pausar/reactivar deporte
 */
function mostrarModalToggleDeporte(inscripcionId, accion) {
    const nombreDeporte = Object.values(datosUsuario.horarios).find(h => h.inscripcion_id === inscripcionId)?.deporte || 'el deporte';
    
    const esPausar = accion === 'pausar';
    
    const config = esPausar ? {
        titulo: 'Pausar Deporte',
        icono: 'pause_circle',
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
        Mensaje: `¿Estás seguro de pausar <strong>"${nombreDeporte}"</strong>?`,
        detalle: 'No se incluirá en tu próximo pago Mensual y no podrás asistir a las clases hasta que lo reactives.',
        btnTexto: 'Sí, pausar deporte',
        btnClass: 'bg-orange-500 hover:bg-orange-600',
        btnIcon: 'pause'
    } : {
        titulo: 'Reactivar Deporte',
        icono: 'play_circle',
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
        Mensaje: `¿Quieres reactivar <strong>"${nombreDeporte}"</strong>?`,
        detalle: 'Se incluirá en tu próximo pago Mensual y podrás volver a asistir a las clases.',
        btnTexto: 'Sí, reactivar',
        btnClass: 'bg-green-500 hover:bg-green-600',
        btnIcon: 'play_arrow'
    };
    
    // Remover modal anterior si existe
    const existente = document.getElementById('modalToggleDeporte');
    if (existente) existente.remove();
    
    const modal = document.createElement('div');
    modal.id = 'modalToggleDeporte';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-[slideUp_0.3s_ease-out]">
            <!-- Header -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-4">
                    <div class="size-14 rounded-full ${config.iconBg} flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl ${config.iconColor}">${config.icono}</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-black dark:text-white uppercase">${config.titulo}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${nombreDeporte}</p>
                    </div>
                </div>
            </div>
            
            <!-- Contenido -->
            <div class="p-6">
                <p class="text-gray-700 dark:text-gray-300 mb-3">${config.Mensaje}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <span class="material-symbols-outlined text-sm align-middle mr-1">info</span>
                    ${config.detalle}
                </p>
            </div>
            
            <!-- Acciones -->
            <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                <button onclick="cerrarModalToggleDeporte()" 
                        class="px-5 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold uppercase text-sm">
                    Cancelar
                </button>
                <button onclick="ejecutarToggleDeporte(${inscripcionId}, '${accion}')" 
                        class="px-5 py-2.5 rounded-lg ${config.btnClass} text-white font-bold uppercase text-sm transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">${config.btnIcon}</span>
                    ${config.btnTexto}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Cerrar con click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModalToggleDeporte();
    });
    
    // Cerrar con Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            cerrarModalToggleDeporte();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function cerrarModalToggleDeporte() {
    const modal = document.getElementById('modalToggleDeporte');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

/**
 * Ejecutar la acción de pausar/reactivar después de confirmar en modal
 */
async function ejecutarToggleDeporte(inscripcionId, accion) {
    const dni = datosUsuario.alumno.dni;
    
    // Cambiar botón a loading
    const btnConfirmar = document.querySelector('#modalToggleDeporte button:last-child');
    if (btnConfirmar) {
        btnConfirmar.disabled = true;
        btnConfirmar.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div><span class="ml-2">Procesando...</span>';
    }
    
    try {
        const resultado = await academiaAPI.toggleDeporte(dni, inscripcionId, accion);
        
        cerrarModalToggleDeporte();
        
        if (resultado.success) {
            mostrarNotificacion(resultado.message, 'success');
            
            // Actualizar datos y re-renderizar
            const nuevosDatos = await academiaAPI.consultarInscripcion(dni, true);
            if (nuevosDatos.success) {
                datosUsuario = nuevosDatos;
                renderizarHorarios();
                renderizarSeccionPagoMensual();
            }
        } else {
            mostrarNotificacion(resultado.error || resultado.Mensaje || 'Error al procesar', 'error');
        }
    } catch (error) {
        cerrarModalToggleDeporte();
        console.error('Error toggle deporte:', error);
        mostrarNotificacion(error.message || 'Error de conexión', 'error');
    }
}

/**
 * Función llamada desde los botones (ahora muestra modal)
 */
function toggleDeporte(inscripcionId, accion) {
    mostrarModalToggleDeporte(inscripcionId, accion);
}

function obtenerIconoDeporte(deporte) {
    const iconos = {
        'Fútbol': 'sports_soccer',
        'Fútbol Femenino': 'sports_soccer',
        'Vóley': 'sports_volleyball',
        'Básquet': 'sports_basketball',
        'Tenis': 'sports_tennis',
        'Natación': 'pool',
        'Atletismo': 'sprint',
        'Entrenamiento Funcional Adultos': 'fitness_center',
        'Entrenamiento Funcional Menores': 'fitness_center',
        'Entrenamiento Funcional Mixto': 'fitness_center',
        'MAMAS FIT': 'fitness_center',
        'Entrenamiento de Fuerza y Tonificación Muscular': 'exercise'
    };
    return iconos[deporte] || 'sports';
}

function formatearHora(horaString) {
    // Si ya es un formato de hora simple (HH:MM), devolverlo tal cual
    if (horaString && /^\d{1,2}:\d{2}$/.test(horaString)) {
        return horaString;
    }
    
    // Si es un timestamp ISO, convertirlo a hora de Lima
    try {
        const fecha = new Date(horaString);
        if (!isNaN(fecha.getTime())) {
            return fecha.toLocaleTimeString('es-PE', {
                timeZone: 'America/Lima',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
    } catch (e) {
        console.error('Error al formatear hora:', e);
    }
    
    // Si no se puede parsear, devolver el string original
    return horaString || '';
}

function cerrarSesion() {
    datosUsuario = null;
    
    // Ocultar vista de resultados
    document.getElementById('vistaResultados').classList.add('hidden');
    
    // Mostrar vista de ingreso
    document.getElementById('vistaIngreso').classList.remove('hidden');
    
    // Ocultar info de usuario
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('flex');
    
    // Limpiar formulario
    document.getElementById('dniConsulta').value = '';
    
    // Restaurar botón
    const btnSubmit = document.querySelector('#formConsulta button[type="submit"]');
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `
        <span>Consultar Estado</span>
        <span class="material-symbols-outlined">search</span>
    `;
}

/**
 * Mostrar modal para usuario inactivo
 */
function mostrarModalInactivo(dni) {
    const modal = document.getElementById('modalInactivo');
    const modalDni = document.getElementById('modalInactivoDni');
    
    modalDni.textContent = dni;
    
    // Guardar DNI globalmente para usar en la subida de comprobante
    window.dniUsuarioInactivo = dni;
    
    // Actualizar link de WhatsApp con DNI
    const whatsappBtn = document.getElementById('btnWhatsAppInactivo');
    const MensajeWhatsApp = `Hola, acabo de subir mi comprobante de pago para reactivar mi membresía. Mi DNI es: ${dni}`;
    whatsappBtn.href = `https://wa.me/51973324460?text=${encodeURIComponent(MensajeWhatsApp)}`;
    
    // Resetear el formulario de subida si existe
    const inputComprobante = document.getElementById('inputComprobanteInactivo');
    if (inputComprobante) {
        inputComprobante.value = '';
        document.getElementById('iconoSubidaInactivo').classList.remove('hidden');
        document.getElementById('previewComprobanteInactivo').classList.add('hidden');
        document.getElementById('btnSubirComprobanteInactivo').disabled = true;
    }
    
    // Mostrar modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

/**
 * Previsualizar comprobante en modal de usuario inactivo
 */
function previsualizarComprobanteInactivo(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        mostrarNotificacion('Por favor selecciona una imagen válida', 'error');
        return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = function() {
        URL.revokeObjectURL(url);
        const maxW = 1024;
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        window._base64Inactivo = canvas.toDataURL('image/jpeg', 0.75);
        document.getElementById('imgComprobanteInactivo').src = window._base64Inactivo;
        document.getElementById('nombreArchivoInactivo').textContent = file.name;
        document.getElementById('iconoSubidaInactivo').classList.add('hidden');
        document.getElementById('previewComprobanteInactivo').classList.remove('hidden');
        document.getElementById('btnSubirComprobanteInactivo').disabled = false;
    };
    img.onerror = function() { URL.revokeObjectURL(url); mostrarNotificacion('Error al leer la imagen', 'error'); };
    img.src = url;
}

/**
 * Subir comprobante desde modal de usuario inactivo
 */
async function subirComprobanteInactivo() {
    const input = document.getElementById('inputComprobanteInactivo');
    const file = input.files[0];
    
    if (!file) {
        mostrarNotificacion('Por favor selecciona un comprobante', 'error');
        return;
    }
    
    const dni = window.dniUsuarioInactivo;
    if (!dni) {
        mostrarNotificacion('Error: No se pudo identificar el DNI', 'error');
        return;
    }
    
    const btn = document.getElementById('btnSubirComprobanteInactivo');
    btn.disabled = true;
    btn.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div><span>Subiendo...</span>';
    
    try {
        // Usar base64 comprimido generado al previsualizar
        const base64 = window._base64Inactivo;
        if (!base64) { throw new Error('No se encontró la imagen. Selecciónala nuevamente.'); }

        // Usar el endpoint de pago Mensual (que es el que usa el modal de inactivo para regularizar)
        const resultado = await academiaAPI.subirPagoMensual({
            dni: dni,
            alumno: `Usuario DNI ${dni}`, // No tenemos el nombre completo aquí
            imagen: base64,
            nombre_archivo: `REGULARIZACION_${dni}_${file.name}`,
            mes: 'Regularización',
            monto: 0, // El admin verificará el monto correcto
            esRegularizacion: true
        });
        
        if (resultado.success) {
            mostrarModalExitoComprobanteInactivo();
        } else {
            throw new Error(resultado.error || 'Error al subir comprobante');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarNotificacion(error.message || 'Error al subir comprobante. Intenta nuevamente.', 'error');
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined">send</span><span>Enviar Comprobante</span>';
    }
}

/**
 * Modal de éxito después de subir comprobante desde inactivo
 */
function mostrarModalExitoComprobanteInactivo() {
    // Cerrar modal de inactivo primero
    cerrarModalInactivo();
    
    const modal = document.createElement('div');
    modal.id = 'modalExitoComprobanteInactivo';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <!-- Icono de éxito -->
            <div class="flex justify-center mb-6">
                <div class="size-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-green-600 dark:text-green-400" style="font-size: 64px;">check_circle</span>
                </div>
            </div>
            
            <!-- Título -->
            <h2 class="text-3xl font-black text-center text-text-main dark:text-white mb-4">
                ¡Comprobante Recibido!
            </h2>
            
            <!-- Mensaje -->
            <div class="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                <p class="text-sm text-green-900 dark:text-green-100 text-center leading-relaxed">
                    Tu comprobante ha sido enviado correctamente. 
                    <strong class="block mt-2">El administrador verificará tu pago y reactivará tu cuenta en breve.</strong>
                </p>
            </div>
            
            <!-- Info adicional -->
            <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 flex-shrink-0">schedule</span>
                    <div>
                        <p class="text-xs font-bold text-blue-900 dark:text-blue-100 mb-1">Tiempo de verificación</p>
                        <p class="text-xs text-blue-800 dark:text-blue-200">
                            La verificación suele tomar entre 2 a 24 horas. Te notificaremos una vez que tu cuenta esté activa.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Botón Cerrar -->
            <button onclick="cerrarModalExitoComprobanteInactivo()" class="w-full py-4 bg-primary hover:bg-primary-dark text-black rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl">
                Entendido
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function cerrarModalExitoComprobanteInactivo() {
    const modal = document.getElementById('modalExitoComprobanteInactivo');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
        
        // Redirigir al inicio después de cerrar
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

/**
 * Cerrar modal de usuario inactivo
 */
function cerrarModalInactivo() {
    const modal = document.getElementById('modalInactivo');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
}

// Cerrar modal al hacer clic fuera de él
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalInactivo');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModalInactivo();
            }
        });
    }
});

function mostrarNotificacion(Mensaje, tipo = 'info') {
    // Usar siempre el sistema de notificaciones de Utils
    Utils.mostrarNotificacion(Mensaje, tipo);
}

/**
 * Modal para subir comprobante de forma tardía
 */
function abrirModalSubirComprobante() {
    const dni = window.dniUsuarioActual;
    if (!dni) {
        mostrarNotificacion('Error: No se pudo identificar el DNI', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'modalSubirComprobante';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onclick="cerrarModalSubirComprobante()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <span class="material-symbols-outlined">close</span>
            </button>
            
            <h3 class="text-2xl font-black text-black dark:text-white mb-4">
                Subir Comprobante
            </h3>
            
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Sube tu comprobante de pago (Plin o transferencia bancaria) si cambiaste de opinión sobre el pago en efectivo.
            </p>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Selecciona tu comprobante (imagen)
                    </label>
                    <input type="file" 
                           id="inputComprobanteTardio" 
                           accept="image/*"
                           onchange="previsualizarComprobante(event)"
                           class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary file:text-black hover:file:brightness-110 cursor-pointer">
                </div>
                
                <div id="previsualizacionComprobante" class="hidden">
                    <img id="imgPreview" src="" alt="Vista previa" class="w-full h-48 object-contain rounded-lg border-2 border-gray-200 dark:border-gray-700">
                </div>
                
                <button onclick="subirComprobanteTardio()" 
                        id="btnSubirComprobante"
                        class="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-black font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-lg">
                    <span class="material-symbols-outlined">cloud_upload</span>
                    <span>Enviar Comprobante</span>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function cerrarModalSubirComprobante() {
    const modal = document.getElementById('modalSubirComprobante');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function previsualizarComprobante(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        mostrarNotificacion('Por favor selecciona una imagen válida', 'error');
        return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = function() {
        URL.revokeObjectURL(url);
        const maxW = 1024;
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        window._base64Tardio = canvas.toDataURL('image/jpeg', 0.75);
        document.getElementById('imgPreview').src = window._base64Tardio;
        document.getElementById('previsualizacionComprobante').classList.remove('hidden');
    };
    img.onerror = function() { URL.revokeObjectURL(url); mostrarNotificacion('Error al leer la imagen', 'error'); };
    img.src = url;
}

async function subirComprobanteTardio() {
    const input = document.getElementById('inputComprobanteTardio');
    const file = input.files[0];
    
    if (!file) {
        mostrarNotificacion('Por favor selecciona un comprobante', 'error');
        return;
    }
    
    const dni = window.dniUsuarioActual;
    const btn = document.getElementById('btnSubirComprobante');
    btn.disabled = true;
    btn.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div><span>Subiendo...</span>';
    
    try {
        // Usar base64 comprimido generado al previsualizar
        const base64 = window._base64Tardio;
        if (!base64) { throw new Error('No se encontró la imagen. Selecciónala nuevamente.'); }

        // Usar la API igual que en exito.js
        const resultado = await academiaAPI.subirComprobanteTardio(dni, {
            imagen: base64,
            nombre_archivo: file.name,
            metodo_pago: 'Transferencia/Plin'
        });
        
        if (resultado.success) {
            mostrarNotificacion('Comprobante subido exitosamente. El administrador lo revisará pronto.', 'success');
            cerrarModalSubirComprobante();
            
            // Recargar después de 2 segundos
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            throw new Error(resultado.error || 'Error al subir comprobante');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarNotificacion(error.message || 'Error al subir comprobante', 'error');
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined">cloud_upload</span><span>Enviar Comprobante</span>';
    }
}

// ==================== PAGO Mensual ====================

/**
 * Renderizar sección de pago Mensual
 */
function renderizarSeccionPagoMensual() {
    // Obtener el contenedor
    const container = document.getElementById('seccionPagoMensual');
    
    if (!container) {
        console.error('❌ No se encontró el contenedor seccionPagoMensual');
        return;
    }
    
    // Calcular próximo mes de pago
    const hoy = new Date();
    const mesActual = hoy.toLocaleString('es-PE', { month: 'long' });
    const proximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    const nombreProximoMes = proximoMes.toLocaleString('es-PE', { month: 'long', year: 'numeric' });
    
    // Verificar si hay deportes pausados
    const deportesPausados = datosUsuario.horarios?.filter(h => h.estado_inscripcion === 'suspendida') || [];
    const deportesPausadosUnicos = [...new Set(deportesPausados.map(h => h.deporte))];
    const hayDeportesPausados = deportesPausadosUnicos.length > 0;
    
    // Nota de deportes pausados
    const notaDeportesPausados = hayDeportesPausados ? `
        <div class="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-3 border border-orange-200 dark:border-orange-800 mt-2">
            <div class="flex items-start gap-2">
                <span class="material-symbols-outlined text-orange-600 text-sm flex-shrink-0">pause_circle</span>
                <p class="text-xs text-orange-800 dark:text-orange-200">
                    <strong>Deportes pausados:</strong> ${deportesPausadosUnicos.join(', ')}. 
                    No se incluyen en el monto.
                </p>
            </div>
        </div>
    ` : '';
    
    container.innerHTML = `
        <!-- Aviso importante -->
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-5 mb-6">
            <div class="flex items-start gap-4">
                <div class="size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">warning</span>
                </div>
                <div class="flex-1">
                    <h4 class="text-amber-900 dark:text-amber-200 font-black text-lg uppercase mb-2">RECORDATORIO DE PAGO</h4>
                    <p class="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">
                        El pago de tu Mensualidad debe realizarse <strong>antes del día 5</strong> de cada mes. 
                        Si no se registra el pago correspondiente, <strong class="text-red-600 dark:text-red-400">tu acceso a las clases será suspendido</strong> 
                        hasta que regularices tu situación.
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Sección subir comprobante Mensual -->
        <div class="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div class="size-12 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div>
                <h3 class="text-2xl font-bold text-black dark:text-white uppercase tracking-tight">Pago Mensual</h3>
                <p class="text-sm text-text-muted dark:text-gray-400">Sube tu comprobante de pago del mes</p>
            </div>
        </div>
        
        <div class="grid md:grid-cols-2 gap-6">
            <!-- Info del pago -->
            <div class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p class="text-xs text-text-muted dark:text-gray-400 font-bold uppercase mb-1">Mes a pagar</p>
                    <p class="text-lg font-black text-black dark:text-white capitalize">${nombreProximoMes}</p>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p class="text-xs text-text-muted dark:text-gray-400 font-bold uppercase mb-1">Monto según tu plan</p>
                    <p class="text-lg font-black text-primary">S/ ${datosUsuario.pago.monto?.toFixed(2) || '---'}</p>
                    <p class="text-xs text-text-muted dark:text-gray-400 mt-1">Basado en tu inscripción actual</p>
                    ${notaDeportesPausados}
                </div>
                
                <div class="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div class="flex items-start gap-2">
                        <span class="material-symbols-outlined text-blue-600 text-lg flex-shrink-0">info</span>
                        <p class="text-xs text-blue-800 dark:text-blue-200">
                            Puedes pagar por <strong>Plin, Yape, transferencia BCP o BBVA</strong>. 
                            Sube la captura de tu pago aquí.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Zona de subida -->
            <div class="flex flex-col">
                <div id="zonaPagoMensual" class="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
                     onclick="document.getElementById('inputPagoMensual').click()">
                    <input type="file" id="inputPagoMensual" accept="image/*" class="hidden" onchange="previsualizarPagoMensual(event)">
                    
                    <div id="iconoSubidaMensual">
                        <span class="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500 mb-3">cloud_upload</span>
                        <p class="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Haz clic para seleccionar</p>
                        <p class="text-xs text-gray-400 dark:text-gray-500">o arrastra tu comprobante aquí</p>
                    </div>
                    
                    <div id="previewPagoMensual" class="hidden w-full">
                        <img id="imgPagoMensual" src="" alt="Vista previa" class="w-full h-40 object-contain rounded-lg mb-3">
                        <p id="nombreArchivoPago" class="text-xs text-gray-500 truncate"></p>
                    </div>
                </div>
                
                <button onclick="subirPagoMensual()" 
                        id="btnSubirPagoMensual"
                        class="mt-4 w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled>
                    <span class="material-symbols-outlined">send</span>
                    <span>Enviar Comprobante del Mes</span>
                </button>
            </div>
        </div>
    `;
}

/**
 * Previsualizar comprobante de pago Mensual
 */
function previsualizarPagoMensual(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        mostrarNotificacion('Por favor selecciona una imagen válida', 'error');
        return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = function() {
        URL.revokeObjectURL(url);
        const maxW = 1024;
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        window._base64Mensual = canvas.toDataURL('image/jpeg', 0.75);
        document.getElementById('imgPagoMensual').src = window._base64Mensual;
        document.getElementById('nombreArchivoPago').textContent = file.name;
        document.getElementById('iconoSubidaMensual').classList.add('hidden');
        document.getElementById('previewPagoMensual').classList.remove('hidden');
        document.getElementById('btnSubirPagoMensual').disabled = false;
    };
    img.onerror = function() { URL.revokeObjectURL(url); mostrarNotificacion('Error al leer la imagen', 'error'); };
    img.src = url;
}

/**
 * Subir comprobante de pago Mensual al servidor (Drive)
 */
async function subirPagoMensual() {
    const input = document.getElementById('inputPagoMensual');
    const file = input.files[0];
    
    if (!file) {
        mostrarNotificacion('Por favor selecciona un comprobante', 'error');
        return;
    }
    
    const btn = document.getElementById('btnSubirPagoMensual');
    btn.disabled = true;
    btn.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div><span>Subiendo a Drive...</span>';
    
    try {
        // Usar base64 comprimido generado al previsualizar
        const base64 = window._base64Mensual;
        if (!base64) { throw new Error('No se encontró la imagen. Selecciónala nuevamente.'); }

        // Obtener mes actual para el nombre
        const hoy = new Date();
        const mesAnio = hoy.toLocaleString('es-PE', { month: 'long', year: 'numeric' }).replace(' ', '-');
        
        // Subir usando el endpoint de pago Mensual
        const resultado = await academiaAPI.subirPagoMensual({
            dni: datosUsuario.alumno.dni,
            alumno: `${datosUsuario.alumno.nombres} ${datosUsuario.alumno.apellidos}`,
            imagen: base64,
            nombre_archivo: `PAGO_${mesAnio}_${file.name}`,
            mes: mesAnio,
            monto: datosUsuario.pago.monto
        });
        
        if (resultado.success) {
            mostrarModalExitoPagoMensual(resultado.driveUrl);
        } else {
            throw new Error(resultado.error || 'Error al subir comprobante');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarNotificacion(error.message || 'Error al subir comprobante', 'error');
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined">send</span><span>Enviar Comprobante del Mes</span>';
    }
}

/**
 * Modal de éxito después de subir pago Mensual
 */
function mostrarModalExitoPagoMensual(driveUrl) {
    const modal = document.createElement('div');
    modal.id = 'modalExitoPagoMensual';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <!-- Icono de éxito -->
            <div class="flex justify-center mb-6">
                <div class="size-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-green-600 dark:text-green-400" style="font-size: 64px;">check_circle</span>
                </div>
            </div>
            
            <!-- Título -->
            <h2 class="text-3xl font-black text-center text-text-main dark:text-white mb-4">
                ¡Pago Registrado!
            </h2>
            
            <!-- Mensaje -->
            <div class="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                <p class="text-sm text-green-900 dark:text-green-100 text-center leading-relaxed">
                    Tu comprobante de pago Mensual ha sido enviado correctamente. 
                    <strong class="block mt-2">El administrador verificará tu pago en las próximas horas.</strong>
                </p>
            </div>
            
            <!-- Info adicional -->
            <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 flex-shrink-0">cloud_done</span>
                    <div>
                        <p class="text-xs font-bold text-blue-900 dark:text-blue-100 mb-1">Guardado en la nube</p>
                        <p class="text-xs text-blue-800 dark:text-blue-200">
                            Tu comprobante ha sido guardado de forma segura en Google Drive.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Botón Cerrar -->
            <button onclick="cerrarModalExitoPagoMensual()" class="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl">
                Entendido
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function cerrarModalExitoPagoMensual() {
    const modal = document.getElementById('modalExitoPagoMensual');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
        
        // Resetear el formulario
        document.getElementById('inputPagoMensual').value = '';
        document.getElementById('iconoSubidaMensual').classList.remove('hidden');
        document.getElementById('previewPagoMensual').classList.add('hidden');
        document.getElementById('btnSubirPagoMensual').disabled = true;
        document.getElementById('btnSubirPagoMensual').innerHTML = '<span class="material-symbols-outlined">send</span><span>Enviar Comprobante del Mes</span>';
    }
}

// ============================================================
// ELIMINAR DÍA DE INSCRIPCIÓN EXISTENTE
// ============================================================

function confirmarEliminarHorario(inscripcionId, horarioId, dia) {
    const existente = document.getElementById('modalEliminarHorario');
    if (existente) existente.remove();

    const modal = document.createElement('div');
    modal.id = 'modalEliminarHorario';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-sm w-full">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-4">
                    <div class="size-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">delete</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-black dark:text-white uppercase">Eliminar día</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${dia}</p>
                    </div>
                </div>
            </div>
            <div class="p-6">
                <p class="text-gray-700 dark:text-gray-300 mb-3">¿Estás seguro de eliminar el día <strong>${dia}</strong> de tu inscripción?</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <span class="material-symbols-outlined text-sm align-middle mr-1">info</span>
                    La mensualidad se ajustará al nuevo número de días.
                </p>
            </div>
            <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                <button onclick="document.getElementById('modalEliminarHorario').remove(); document.body.style.overflow='';"
                        class="px-5 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold uppercase text-sm">
                    Cancelar
                </button>
                <button id="btnConfirmarEliminar" onclick="ejecutarEliminarHorario(${inscripcionId}, ${horarioId})"
                        class="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold uppercase text-sm transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">delete</span>
                    Eliminar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; }
    });
}

async function ejecutarEliminarHorario(inscripcionId, horarioId) {
    const dni = datosUsuario.alumno.dni;
    const btn = document.getElementById('btnConfirmarEliminar');
    if (btn) { btn.disabled = true; btn.innerHTML = `<div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div><span>Eliminando...</span>`; }

    try {
        const res = await fetch('/api/eliminar-horario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni, inscripcion_id: inscripcionId, horario_id: horarioId })
        });
        const data = await res.json();

        const modal = document.getElementById('modalEliminarHorario');
        if (modal) { modal.remove(); document.body.style.overflow = ''; }

        if (data.success) {
            const msgPrecio = data.nuevo_precio ? ` Mensualidad actualizada a S/.${data.nuevo_precio}.` : '';
            mostrarNotificacion('Día eliminado correctamente.' + msgPrecio, 'success');
            setTimeout(() => consultarPorDNI(dni), 800);
        } else {
            mostrarNotificacion(data.error || 'Error al eliminar el día', 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error de conexión. Intente nuevamente.', 'error');
        const modal = document.getElementById('modalEliminarHorario');
        if (modal) { modal.remove(); document.body.style.overflow = ''; }
    }
}

// ============================================================
// AGREGAR DÍA A INSCRIPCIÓN EXISTENTE
// ============================================================

async function abrirModalAgregarHorario(inscripcionId) {
    // Obtener nombre del deporte, categoría y plan desde los datos ya cargados
    const horarioRef = datosUsuario?.horarios?.find(h => h.inscripcion_id === inscripcionId);
    const deporteNombre = horarioRef?.deporte || 'el deporte';
    const categoria = horarioRef?.categoria || null;
    const plan = horarioRef?.plan || null;

    const existente = document.getElementById('modalAgregarHorario');
    if (existente) existente.remove();

    const modal = document.createElement('div');
    modal.id = 'modalAgregarHorario';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div class="flex items-center gap-4">
                    <div class="size-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">add_circle</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-black dark:text-white uppercase">Agregar día</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${deporteNombre}</p>
                    </div>
                </div>
            </div>
            <!-- Contenido -->
            <div class="p-6 overflow-y-auto flex-1" id="contenidoModalAgregarHorario">
                <div class="flex items-center justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span class="ml-3 text-gray-500">Cargando horarios disponibles...</span>
                </div>
            </div>
            <!-- Acciones -->
            <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end flex-shrink-0">
                <button onclick="cerrarModalAgregarHorario()"
                        class="px-5 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold uppercase text-sm">
                    Cancelar
                </button>
                <button id="btnConfirmarAgregarHorario" onclick="confirmarAgregarHorario(${inscripcionId})" disabled
                        class="px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase text-sm transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">add_circle</span>
                    Agregar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModalAgregarHorario();
    });

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            cerrarModalAgregarHorario();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Cargar horarios disponibles
    await cargarHorariosDisponibles(inscripcionId, deporteNombre, categoria, plan);
}

async function cargarHorariosDisponibles(inscripcionId, deporteNombre, categoria, plan) {
    const contenido = document.getElementById('contenidoModalAgregarHorario');

    try {
        // Filtrar por año de nacimiento si está disponible
        const fechaNac = datosUsuario?.alumno?.fecha_nacimiento;
        const anioNac = fechaNac ? new Date(fechaNac).getFullYear() : null;
        const url = anioNac ? `/api/horarios?anio_nacimiento=${anioNac}` : '/api/horarios';

        const res = await fetch(url);
        const data = await res.json();

        if (!data.success || !data.horarios?.length) {
            contenido.innerHTML = `<p class="text-center text-gray-500 py-8">No hay horarios disponibles.</p>`;
            return;
        }

        // Filtrar por deporte + categoría + plan (misma lógica de la inscripción original)
        const horariosDeporte = data.horarios.filter(h => {
            if (h.deporte.toLowerCase() !== deporteNombre.toLowerCase()) return false;
            if (categoria && h.categoria && h.categoria !== categoria) return false;
            if (plan && h.plan && h.plan !== plan) return false;
            return true;
        });

        if (horariosDeporte.length === 0) {
            contenido.innerHTML = `<p class="text-center text-gray-500 py-8">No hay horarios disponibles para ${deporteNombre}${categoria ? ` (${categoria})` : ''}.</p>`;
            return;
        }

        // Obtener los horarios ya inscritos en esta inscripción para excluirlos
        const horariosInscritos = datosUsuario.horarios.filter(h => h.inscripcion_id === inscripcionId);
        const clavesInscritas = new Set(horariosInscritos.map(h => `${h.dia}-${h.hora_inicio}`));

        const horariosDisponibles = horariosDeporte.filter(h =>
            !clavesInscritas.has(`${h.dia}-${h.hora_inicio}`)
        );

        if (horariosDisponibles.length === 0) {
            contenido.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3 block">event_busy</span>
                    <p class="text-gray-500">Ya estás inscrito en todos los horarios disponibles para ${deporteNombre}.</p>
                </div>
            `;
            return;
        }

        contenido.innerHTML = `
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Selecciona el día que deseas agregar a tu inscripción de <strong>${deporteNombre}</strong>${categoria ? ` <span class="text-primary font-semibold">(${categoria})</span>` : ''}:
            </p>
            <div class="space-y-2">
                ${horariosDisponibles.map(h => `
                    <label class="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                        <input type="radio" name="horarioAgregar" value="${h.horario_id}"
                               class="accent-blue-500 w-4 h-4 flex-shrink-0"
                               onchange="document.getElementById('btnConfirmarAgregarHorario').disabled = false">
                        <div class="flex-1">
                            <span class="font-bold text-sm text-black dark:text-white">${h.dia}</span>
                            <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">${h.hora_inicio} - ${h.hora_fin}</span>
                            ${h.categoria ? `<span class="ml-2 text-xs text-primary font-semibold">(${h.categoria})</span>` : ''}
                        </div>
                        ${h.cupo_maximo > 0 ? `<span class="text-xs text-gray-400 flex-shrink-0">${h.cupo_maximo - (h.cupos_ocupados || 0)} cupos</span>` : ''}
                    </label>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        contenido.innerHTML = `<p class="text-center text-red-500 py-8">Error al cargar horarios. Intente nuevamente.</p>`;
    }
}

function cerrarModalAgregarHorario() {
    const modal = document.getElementById('modalAgregarHorario');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

async function confirmarAgregarHorario(inscripcionId) {
    const horarioSeleccionado = document.querySelector('input[name="horarioAgregar"]:checked');
    if (!horarioSeleccionado) return;

    const horarioId = parseInt(horarioSeleccionado.value);
    const dni = datosUsuario.alumno.dni;

    const btnConfirmar = document.getElementById('btnConfirmarAgregarHorario');
    if (btnConfirmar) {
        btnConfirmar.disabled = true;
        btnConfirmar.innerHTML = `<div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div><span>Guardando...</span>`;
    }

    try {
        const res = await fetch('/api/agregar-horario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni, inscripcion_id: inscripcionId, horario_id: horarioId })
        });

        const data = await res.json();

        if (data.success) {
            cerrarModalAgregarHorario();
            const msgPrecio = data.nuevo_precio ? ` Mensualidad actualizada a S/.${data.nuevo_precio}.` : '';
            mostrarNotificacion((data.message || 'Día agregado correctamente') + msgPrecio, 'success');
            // Recargar datos del alumno
            setTimeout(() => consultarPorDNI(dni), 800);
        } else {
            mostrarNotificacion(data.error || 'Error al agregar el día', 'error');
            if (btnConfirmar) {
                btnConfirmar.disabled = false;
                btnConfirmar.innerHTML = `<span class="material-symbols-outlined text-lg">add_circle</span>Agregar`;
            }
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión. Intente nuevamente.', 'error');
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            btnConfirmar.innerHTML = `<span class="material-symbols-outlined text-lg">add_circle</span>Agregar`;
        }
    }
}






