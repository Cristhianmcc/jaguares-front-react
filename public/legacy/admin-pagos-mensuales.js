/**
 * JavaScript para Gestión de Pagos Mensuales (Admin)
 */

function initAdminPagosMensuales() {
    verificarSesionPagos();
    cargarPagosMensuales();
    configurarFiltros();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPagosMensuales);
} else {
    initAdminPagosMensuales();
}

function getAPIBase() {
    return (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
        ? window.API_BASE_OVERRIDE
        : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3002'
            : 'https://api.jaguarescar.com');
}

function getToken() {
    const sessionData = JSON.parse(localStorage.getItem('adminSession') || '{}');
    return sessionData?.token;
}

function getDriveViewUrl(url) {
    if (!url) return '#';
    let fileId = null;
    const m1 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m1) fileId = m1[1];
    const m2 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m2) fileId = m2[1];
    if (fileId) return 'https://drive.google.com/file/d/' + fileId + '/view';
    return url;
}

function verificarSesionPagos() {
    const session = localStorage.getItem('adminSession');
    if (!session) {
        window.location.href = '/admin-login';
        return;
    }
    const data = JSON.parse(session);
    const sessionTime = new Date(data.timestamp).getTime();
    const now = Date.now();
    const hoursElapsed = (now - sessionTime) / (1000 * 60 * 60);
    if (hoursElapsed >= 8) {
        localStorage.removeItem('adminSession');
        window.location.href = '/admin-login';
        return;
    }
    const elEmail = document.getElementById('adminEmail');
    if (elEmail) elEmail.textContent = data.admin.email;
}

function configurarFiltros() {
    const inputBuscar = document.getElementById('buscarDNI');
    if (inputBuscar) {
        let timeout;
        inputBuscar.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => cargarPagosMensuales(), 400);
        });
    }
    const selectEstado = document.getElementById('filtroEstado');
    if (selectEstado) selectEstado.addEventListener('change', () => cargarPagosMensuales());

    const selectMes = document.getElementById('filtroMes');
    if (selectMes) selectMes.addEventListener('change', () => cargarPagosMensuales());

    const selectDeporte = document.getElementById('filtroDeporte');
    if (selectDeporte) selectDeporte.addEventListener('change', () => cargarPagosMensuales());

    // Cargar deportes dinámicamente
    cargarDeportesDropdownPagos();
}

async function cargarDeportesDropdownPagos() {
    try {
        const API_BASE = getAPIBase();
        const token = getToken();
        if (!token) return;
        const response = await fetch(`${API_BASE}/api/admin/deportes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.deportes) {
            const select = document.getElementById('filtroDeporte');
            if (!select) return;
            data.deportes.forEach(dep => {
                const option = document.createElement('option');
                option.value = dep.nombre;
                option.textContent = dep.nombre.toUpperCase();
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar deportes:', error);
    }
}

async function cargarPagosMensuales() {
    const API_BASE = getAPIBase();
    const token = getToken();
    if (!token) return;

    const buscar = (document.getElementById('buscarDNI')?.value || '').trim();
    const estado = document.getElementById('filtroEstado')?.value || 'todos';
    const mes = document.getElementById('filtroMes')?.value || '';
    const deporte = document.getElementById('filtroDeporte')?.value || '';

    const params = new URLSearchParams();
    if (estado !== 'todos') params.set('estado', estado);
    if (mes) params.set('mes', mes);
    if (deporte) params.set('deporte', deporte);
    if (buscar) params.set('buscar', buscar);

    const loading = document.getElementById('loadingPagos');
    const tabla = document.getElementById('tablaPagos');
    const sinResultados = document.getElementById('sinResultados');

    if (loading) loading.classList.remove('hidden');
    if (tabla) tabla.classList.add('hidden');
    if (sinResultados) sinResultados.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE}/api/admin/pagos-mensuales?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            }
        });

        const data = await response.json();

        if (loading) loading.classList.add('hidden');

        if (data.success && data.pagos.length > 0) {
            renderizarPagos(data.pagos);
            if (tabla) tabla.classList.remove('hidden');
        } else {
            if (sinResultados) sinResultados.classList.remove('hidden');
        }

        // Actualizar contadores
        actualizarContadores(data.pagos || []);
    } catch (error) {
        console.error('❌ Error al cargar pagos mensuales:', error);
        if (loading) loading.classList.add('hidden');
        if (sinResultados) sinResultados.classList.remove('hidden');
    }
}

function actualizarContadores(pagos) {
    const total = pagos.length;
    const pendientes = pagos.filter(p => p.estado === 'pendiente').length;
    const confirmados = pagos.filter(p => p.estado === 'confirmado').length;
    const rechazados = pagos.filter(p => p.estado === 'rechazado').length;

    const elTotal = document.getElementById('contTotal');
    const elPendientes = document.getElementById('contPendientes');
    const elConfirmados = document.getElementById('contConfirmados');
    const elRechazados = document.getElementById('contRechazados');

    if (elTotal) elTotal.textContent = total;
    if (elPendientes) elPendientes.textContent = pendientes;
    if (elConfirmados) elConfirmados.textContent = confirmados;
    if (elRechazados) elRechazados.textContent = rechazados;
}

function renderizarPagos(pagos) {
    const tbody = document.getElementById('bodyPagos');
    if (!tbody) return;

    tbody.innerHTML = pagos.map(p => {
        // Guardar datos en variable global para usar en acciones rápidas
        window._pagosData = window._pagosData || {};
        window._pagosData[p.pago_id] = {
            deportes: p.deportes_inscritos || [],
            monto: parseFloat(p.monto || 0),
            dni: p.dni,
            mes: p.mes,
            anio: p['año'] || p.anio || '',
            estado: p.estado,
            inscripcionIds: (p.deportes_inscritos || []).map(d => d.inscripcion_id).filter(Boolean),
            telefono: p.telefono,
            telefonoApoderado: p.telefono_apoderado
        };

        const estadoClase = {
            'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            'confirmado': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'rechazado': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        }[p.estado] || 'bg-gray-100 text-gray-800';

        const estadoIcono = {
            'pendiente': 'schedule',
            'confirmado': 'check_circle',
            'rechazado': 'cancel'
        }[p.estado] || 'help';

        const fecha = p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

        const acciones = p.estado === 'pendiente' ? `
            <div class="flex gap-2 flex-wrap">
                <button onclick="confirmarPagoMensual(${p.pago_id})" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1" title="Confirmar">
                    <span class="material-symbols-outlined text-sm">check</span> Confirmar
                </button>
                <button onclick="rechazarPagoMensual(${p.pago_id})" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1" title="Rechazar">
                    <span class="material-symbols-outlined text-sm">close</span> Rechazar
                </button>
                <button onclick="abrirModalObservacionPago(${p.pago_id}, \`${(p.observaciones || '').replace(/`/g, "'").replace(/\\/g, '\\\\')}\`)" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1" title="Observación">
                    <span class="material-symbols-outlined text-sm">edit_note</span> ${p.observaciones ? 'Editar Obs.' : 'Obs.'}
                </button>
                <button onclick="abrirModalEditarMonto(${p.pago_id}, ${parseFloat(p.monto || 0)})" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1" title="Editar Monto">
                    <span class="material-symbols-outlined text-sm">edit</span> Monto
                </button>
            </div>
        ` : `
            <div class="flex gap-2 flex-wrap">
                <button onclick="abrirModalObservacionPago(${p.pago_id}, \`${(p.observaciones || '').replace(/`/g, "'").replace(/\\/g, '\\\\')}\`)" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1" title="Observación">
                    <span class="material-symbols-outlined text-sm">edit_note</span> ${p.observaciones ? 'Editar Obs.' : 'Obs.'}
                </button>
                <button onclick="abrirModalEditarMonto(${p.pago_id}, ${parseFloat(p.monto || 0)})" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1" title="Editar Monto">
                    <span class="material-symbols-outlined text-sm">edit</span> Monto
                </button>
            </div>
        `;

        const observacionBadge = p.observaciones ? `
            <div class="mt-1 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg px-2 py-1">
                <p class="text-xs text-amber-800 dark:text-amber-300 leading-relaxed"><strong>Obs:</strong> ${p.observaciones}</p>
            </div>
        ` : '';

        const comprobanteBtn = p.comprobante_url ? `
            <a href="${getDriveViewUrl(p.comprobante_url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold transition-colors">
                <span class="material-symbols-outlined text-sm">open_in_new</span> Ver
            </a>
        ` : '<span class="text-xs text-gray-400">-</span>';

        // Desglose de deportes inscritos
        const deportesHTML = (p.deportes_inscritos && p.deportes_inscritos.length > 0) ? `
            <div class="mt-1.5 flex flex-wrap gap-1">
                ${p.deportes_inscritos.map(d => {
                    const isCancelada = String(d.estado || '').toLowerCase() === 'cancelada';
                    return `
                        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${isCancelada ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'} text-[10px] font-semibold">
                            ${d.deporte} <span class="${isCancelada ? 'text-red-600' : 'text-blue-500'}">S/${parseFloat(d.precio || 0).toFixed(2)}</span>${isCancelada ? ' (Cancelada)' : ''}
                        </span>
                    `;
                }).join('')}
            </div>
        ` : '';

        return `
            <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-4 py-3">
                    <p class="font-bold text-black dark:text-white text-sm">${p.nombres} ${p.apellidos}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 font-mono">${p.dni}</p>
                    ${deportesHTML}
                    ${observacionBadge}
                </td>
                <td class="px-4 py-3 text-sm text-black dark:text-white capitalize font-semibold">${p.mes || ''}</td>
                <td class="px-4 py-3 text-sm text-black dark:text-white">${p['año'] || p.anio || ''}</td>
                <td class="px-4 py-3 text-sm font-bold text-black dark:text-white">S/ ${parseFloat(p.monto || 0).toFixed(2)}</td>
                <td class="px-4 py-3 text-sm text-black dark:text-white">
                    <div class="flex items-center gap-2">
                        <span>${p.telefono || p.telefono_apoderado || '-'}</span>
                        ${(p.telefono || p.telefono_apoderado) ? `<button onclick="abrirModalWhatsApp(${p.pago_id})" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" title="WhatsApp">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.671.149-.198.297-.767.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.173.198-.297.298-.497.099-.198.05-.372-.025-.521-.074-.149-.671-1.611-.92-2.207-.242-.579-.487-.5-.671-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.273-.198-.57-.347z"/></svg>
                        </button>` : ''}
                    </div>
                    ${p.telefono ? '<span class="block text-xs text-gray-500 dark:text-gray-400">Alumno</span>' : p.telefono_apoderado ? '<span class="block text-xs text-gray-500 dark:text-gray-400">Apoderado</span>' : ''}
                </td>
                <td class="px-4 py-3 text-sm text-black dark:text-white">
                    ${p.asistencia_resumen && p.asistencia_resumen.total_registros > 0 ? `
                        <div class="font-semibold">${p.asistencia_resumen.ultimo_presente ? 'Presente' : 'Ausente'}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">${p.asistencia_resumen.total_presentes}P / ${p.asistencia_resumen.total_ausentes}A</div>
                        <button onclick="abrirModalAsistenciasAlumno('${p.dni}', '${(p.nombres + ' ' + p.apellidos).replace(/'/g, "\\'") }')" class="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg">
                            <span class="material-symbols-outlined text-sm">visibility</span> Ver asistencias
                        </button>
                    ` : '<span class="text-xs text-gray-500 dark:text-gray-400">Sin registros</span>'}
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${estadoClase}">
                        <span class="material-symbols-outlined text-sm">${estadoIcono}</span>
                        ${p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                    </span>
                </td>
                <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">${fecha}</td>
                <td class="px-4 py-3">${comprobanteBtn}</td>
                <td class="px-4 py-3">
                    ${acciones}
                    ${(p.deportes_inscritos && p.deportes_inscritos.length > 0) ? `
                        <button onclick="desactivarNoShow(${p.pago_id})" class="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors" title="Cancelar inscripciones si el alumno no asistió">
                            <span class="material-symbols-outlined text-sm">person_remove</span> No vino
                        </button>
                    ` : ''}
                    ${(p.deportes_inscritos && p.deportes_inscritos.some(d => String(d.estado || '').toLowerCase() === 'cancelada')) ? `
                        <button onclick="reactivarInscripcionesPago(${p.pago_id})" class="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors" title="Reactivar deportes cancelados">
                            <span class="material-symbols-outlined text-sm">refresh</span> Reactivar
                        </button>
                    ` : (p.deportes_inscritos && p.deportes_inscritos.length > 0 ? '<!-- NO CANCELADOS -->' : '<!-- SIN DEPORTES -->')}
                </td>
            </tr>
        `;
    }).join('');
}

function normalizarNumeroParaWhatsApp(numero) {
    if (!numero) return null;
    const digits = String(numero).replace(/\D/g, '');
    if (digits.length === 9) return `51${digits}`;
    if (digits.length === 10 && digits.startsWith('0')) return `51${digits.slice(1)}`;
    if (digits.length === 11 && digits.startsWith('51')) return digits;
    return digits;
}

function abrirModalWhatsApp(pagoId) {
    const pagoData = window._pagosData?.[pagoId];
    if (!pagoData) return;
    const numeroRaw = pagoData.telefono || pagoData.telefonoApoderado;
    const numero = normalizarNumeroParaWhatsApp(numeroRaw);
    if (!numero) {
        mostrarToast('No hay número válido para WhatsApp', 'error');
        return;
    }

    const mensajeDefault = pagoData.estado === 'pendiente'
        ? `Hola, soy del club Jaguares. Te escribo porque tu pago mensual de ${pagoData.mes || ''} ${pagoData.anio || ''} aún no aparece como confirmado. Por favor revisa o contáctanos.`
        : `Hola, soy del club Jaguares. Gracias por tu pago. Te cuento que tenemos promociones y novedades para ti.`;

    const existente = document.getElementById('modalWhatsApp');
    if (existente) existente.remove();

    const modal = document.createElement('div');
    modal.id = 'modalWhatsApp';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div class="flex items-center gap-3 mb-4">
                <div class="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center w-12 h-12">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.671.149-.198.297-.767.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.173.198-.297.298-.497.099-.198.05-.372-.025-.521-.074-.149-.671-1.611-.92-2.207-.242-.579-.487-.5-.671-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.273-.198-.57-.347z"/></svg>
                </div>
                <div>
                    <h3 class="text-xl font-black text-black dark:text-white">Enviar WhatsApp</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Edita el mensaje antes de enviar al contacto.</p>
                </div>
            </div>
            <div class="mb-4">
                <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Número destino</p>
                <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-black dark:text-white">${numero}</div>
            </div>
            <textarea id="modalWhatsAppMensaje" rows="6" class="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-900 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Escribe el mensaje...">${mensajeDefault}</textarea>
            <div class="mt-5 flex gap-3 justify-end">
                <button id="modalWhatsAppCancelar" class="px-5 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-xl font-bold text-sm">Cancelar</button>
                <button id="modalWhatsAppEnviar" class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm">Abrir WhatsApp</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById('modalWhatsAppCancelar').addEventListener('click', () => modal.remove());
    document.getElementById('modalWhatsAppEnviar').addEventListener('click', () => {
        const texto = document.getElementById('modalWhatsAppMensaje')?.value || '';
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
        window.open(url, '_blank');
        modal.remove();
    });
}

async function abrirModalAsistenciasAlumno(dni, nombreCompleto) {
    const existente = document.getElementById('modalAsistenciasAlumno');
    if (existente) existente.remove();

    const modal = document.createElement('div');
    modal.id = 'modalAsistenciasAlumno';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 overflow-y-auto';
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col" style="max-height: 80vh; min-height: 300px;">
            <div class="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div class="min-w-0">
                    <h3 class="text-lg md:text-xl font-black text-black dark:text-white truncate">Asistencias de ${nombreCompleto}</h3>
                    <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400">Historial de asistencia completa</p>
                </div>
                <button id="modalAsistenciasCerrar" class="text-gray-500 hover:text-black dark:hover:text-white text-2xl flex-shrink-0 ml-4">&times;</button>
            </div>
            <div id="modalAsistenciasBody" class="p-3 md:p-6 text-xs md:text-sm text-black dark:text-white overflow-y-auto flex-1">
                <div class="text-center py-10 text-gray-500 dark:text-gray-400">Cargando asistencias...</div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById('modalAsistenciasCerrar').addEventListener('click', () => modal.remove());

    try {
        const API_BASE = getAPIBase();
        const token = getToken();
        const response = await fetch(`${API_BASE}/api/admin/alumnos/${encodeURIComponent(dni)}/asistencias`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const body = document.getElementById('modalAsistenciasBody');
        if (!data.success || !Array.isArray(data.asistencias)) {
            body.innerHTML = `<div class="text-center py-10 text-red-500">No se pudieron cargar las asistencias.</div>`;
            return;
        }

        if (data.asistencias.length === 0) {
            body.innerHTML = `<div class="text-center py-10 text-gray-500 dark:text-gray-400">No hay registros de asistencia para este alumno.</div>`;
            return;
        }

        const rows = data.asistencias.map(asist => {
            const fechaFormato = asist.fecha ? new Date(asist.fecha).toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';
            return `
            <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-2 md:px-4 py-2">${fechaFormato}</td>
                <td class="px-2 md:px-4 py-2">${asist.deporte}</td>
                <td class="px-2 md:px-4 py-2">${asist.categoria}</td>
                <td class="px-2 md:px-4 py-2">${asist.dia || '-'}</td>
                <td class="px-2 md:px-4 py-2 whitespace-nowrap">${asist.hora_inicio || '-'} - ${asist.hora_fin || '-'}</td>
                <td class="px-2 md:px-4 py-2">${asist.presente ? '<span class="text-green-600 font-bold">✓ Presente</span>' : '<span class="text-red-600 font-bold">✗ Ausente</span>'}</td>
                <td class="px-2 md:px-4 py-2 text-gray-600 dark:text-gray-400">${asist.observaciones || '-'}</td>
            </tr>
        `;
        }).join('');

        body.innerHTML = `
            <div class="overflow-x-auto -mx-3 md:-mx-6">
                <div class="inline-block min-w-full px-3 md:px-6">
                    <table class="w-full text-left border-collapse text-xs md:text-sm">
                        <thead class="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 sticky top-0">
                            <tr>
                                <th class="px-2 md:px-4 py-3">Fecha</th>
                                <th class="px-2 md:px-4 py-3">Deporte</th>
                                <th class="px-2 md:px-4 py-3">Cat.</th>
                                <th class="px-2 md:px-4 py-3">Día</th>
                                <th class="px-2 md:px-4 py-3">Hora</th>
                                <th class="px-2 md:px-4 py-3">Asistencia</th>
                                <th class="px-2 md:px-4 py-3">Obs.</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        const body = document.getElementById('modalAsistenciasBody');
        if (body) {
            body.innerHTML = `<div class="text-center py-10 text-red-500">Error al cargar asistencias.</div>`;
        }
        console.error('Error al obtener asistencias del alumno:', error);
    }
}

async function desactivarNoShow(pagoId) {
    const pagoData = window._pagosData?.[pagoId];
    if (!pagoData || !pagoData.deportes?.length) {
        mostrarToast('No hay inscripciones activas para desactivar', 'error');
        return;
    }

    const deportesActivos = pagoData.deportes.filter(d => String(d.estado || '').toLowerCase() !== 'cancelada');
    if (deportesActivos.length === 0) {
        mostrarToast('No hay deportes activos disponibles para desactivar', 'error');
        return;
    }

    mostrarModalSeleccionDeportes({
        title: 'No vino',
        description: 'Selecciona los deportes que el alumno no asistió y deseas cancelar.',
        confirmText: 'Desactivar seleccionados',
        deportes: deportesActivos,
        onConfirm: async (inscripcionIds) => {
            const API_BASE = getAPIBase();
            const token = getToken();
            try {
                const response = await fetch(`${API_BASE}/api/admin/desactivar-inscripciones`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dni: pagoData.dni, inscripcion_ids: inscripcionIds })
                });
                const data = await response.json();
                if (data.success) {
                    mostrarToast('Inscripciones desactivadas correctamente', 'success');
                    cargarPagosMensuales();
                } else {
                    mostrarToast(data.error || 'No se pudo desactivar', 'error');
                }
            } catch (error) {
                console.error('❌ Error al desactivar inscripciones:', error);
                mostrarToast('Error de conexión', 'error');
            }
        }
    });
}

function reactivarInscripcionesPago(pagoId) {
    const pagoData = window._pagosData?.[pagoId];
    if (!pagoData || !pagoData.deportes?.length) {
        mostrarToast('No hay inscripciones canceladas para reactivar', 'error');
        return;
    }

    const deportesCancelados = pagoData.deportes.filter(d => String(d.estado || '').toLowerCase() === 'cancelada');
    if (deportesCancelados.length === 0) {
        mostrarToast('No hay inscripciones canceladas para reactivar', 'error');
        return;
    }

    mostrarModalSeleccionDeportes({
        title: 'Reactivar deporte',
        description: 'Selecciona los deportes cancelados que deseas reactivar.',
        confirmText: 'Reactivar seleccionados',
        deportes: deportesCancelados,
        onConfirm: async (inscripcionIds) => {
            const API_BASE = getAPIBase();
            const token = getToken();
            try {
                const response = await fetch(`${API_BASE}/api/admin/reactivar-inscripciones`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dni: pagoData.dni, inscripcion_ids: inscripcionIds })
                });
                const data = await response.json();
                if (data.success) {
                    mostrarToast('Inscripciones reactivadas correctamente', 'success');
                    cargarPagosMensuales();
                } else {
                    mostrarToast(data.error || 'No se pudo reactivar', 'error');
                }
            } catch (error) {
                console.error('❌ Error al reactivar inscripciones:', error);
                mostrarToast('Error de conexión', 'error');
            }
        }
    });
}

function mostrarModalSeleccionDeportes({ title, description, confirmText, deportes, onConfirm }) {
    const existente = document.getElementById('modalSeleccionDeportes');
    if (existente) existente.remove();

    const opcionesHTML = deportes.map((d, index) => `
        <label class="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <div>
                <div class="text-sm font-semibold text-black dark:text-white">${d.deporte}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">S/ ${parseFloat(d.precio || 0).toFixed(2)}</div>
            </div>
            <input type="checkbox" class="checkbox-inscripcion-no-vino" value="${d.inscripcion_id || ''}" checked>
        </label>
    `).join('');

    const modal = document.createElement('div');
    modal.id = 'modalSeleccionDeportes';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div class="flex justify-between items-start gap-4 mb-4">
                <div>
                    <h3 class="text-xl font-black text-black dark:text-white">${title}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${description}</p>
                </div>
                <button id="modalSeleccionDeportesCerrar" class="text-gray-500 hover:text-black dark:hover:text-white text-2xl">&times;</button>
            </div>
            <div class="space-y-3 mb-4">
                ${opcionesHTML}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-4">Si dejas todo desmarcado no se hará ninguna acción.</div>
            <div class="flex gap-3 justify-end">
                <button id="modalSeleccionDeportesCancelar" class="px-5 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-xl font-bold text-sm">Cancelar</button>
                <button id="modalSeleccionDeportesConfirmar" class="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm">${confirmText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById('modalSeleccionDeportesCerrar').addEventListener('click', () => modal.remove());
    document.getElementById('modalSeleccionDeportesCancelar').addEventListener('click', () => modal.remove());
    document.getElementById('modalSeleccionDeportesConfirmar').addEventListener('click', () => {
        const checkboxes = Array.from(document.querySelectorAll('.checkbox-inscripcion-no-vino'));
        const seleccionados = checkboxes.filter(cb => cb.checked).map(cb => cb.value).filter(Boolean);
        if (seleccionados.length === 0) {
            mostrarToast('Selecciona al menos un deporte', 'error');
            return;
        }
        modal.remove();
        onConfirm(seleccionados);
    });
}

// ==================== MODAL PERSONALIZADO ====================

function mostrarModalAccion({ titulo, mensaje, icono, iconoColor, inputPlaceholder, btnTexto, btnColor, onConfirm }) {
    const existente = document.getElementById('modalAccionPago');
    if (existente) existente.remove();

    const inputHTML = inputPlaceholder ? `
        <input type="text" id="modalAccionInput" placeholder="${inputPlaceholder}"
               class="w-full mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
    ` : '';

    const modal = document.createElement('div');
    modal.id = 'modalAccionPago';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4';
    modal.style.animation = 'fadeIn .2s ease';
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 max-w-sm w-full shadow-2xl" style="animation: scaleIn .2s ease">
            <div class="flex justify-center mb-4">
                <div class="size-16 rounded-full ${iconoColor} flex items-center justify-center">
                    <span class="material-symbols-outlined" style="font-size:40px">${icono}</span>
                </div>
            </div>
            <h3 class="text-xl font-black text-center text-black dark:text-white mb-2">${titulo}</h3>
            <p class="text-sm text-center text-gray-500 dark:text-gray-400">${mensaje}</p>
            ${inputHTML}
            <div class="flex gap-3 mt-6">
                <button id="modalAccionCancelar" class="flex-1 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-xl font-bold text-sm transition-colors">
                    Cancelar
                </button>
                <button id="modalAccionConfirmar" class="flex-1 py-3 ${btnColor} text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-lg">${icono}</span>
                    ${btnTexto}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModalAccion(); });
    document.getElementById('modalAccionCancelar').addEventListener('click', cerrarModalAccion);
    document.getElementById('modalAccionConfirmar').addEventListener('click', () => {
        const input = document.getElementById('modalAccionInput');
        onConfirm(input ? input.value : null);
        cerrarModalAccion();
    });
}

function cerrarModalAccion() {
    const modal = document.getElementById('modalAccionPago');
    if (modal) modal.remove();
}

function mostrarToast(mensaje, tipo) {
    const existente = document.getElementById('toastPago');
    if (existente) existente.remove();

    const colores = {
        success: 'bg-green-600',
        error: 'bg-red-600'
    };
    const iconos = {
        success: 'check_circle',
        error: 'error'
    };

    const toast = document.createElement('div');
    toast.id = 'toastPago';
    toast.className = `fixed top-6 right-6 z-[99999] ${colores[tipo] || 'bg-gray-800'} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold`;
    toast.style.animation = 'fadeIn .3s ease';
    toast.innerHTML = `<span class="material-symbols-outlined">${iconos[tipo] || 'info'}</span> ${mensaje}`;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}

// ==================== CONFIRMAR / RECHAZAR ====================

async function confirmarPagoMensual(pagoId) {
    const pagoData = (window._pagosData && window._pagosData[pagoId]) || {};
    const deportes = pagoData.deportes || [];
    const montoOriginal = pagoData.monto || 0;

    // Si tiene más de 1 deporte, mostrar modal con checkboxes
    if (deportes.length > 1) {
        mostrarModalConfirmarConDeportes(pagoId, deportes, montoOriginal);
    } else {
        // Solo 1 deporte: confirmar directo
        mostrarModalAccion({
            titulo: 'Confirmar Pago',
            mensaje: `¿Confirmar pago de S/ ${montoOriginal.toFixed(2)}?`,
            icono: 'check_circle',
            iconoColor: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
            btnTexto: 'Confirmar',
            btnColor: 'bg-green-600 hover:bg-green-700',
            onConfirm: async () => {
                await ejecutarConfirmarPago(pagoId, null, null);
            }
        });
    }
}

function mostrarModalConfirmarConDeportes(pagoId, deportes, montoOriginal) {
    const existente = document.getElementById('modalAccionPago');
    if (existente) existente.remove();

    const checkboxesHTML = deportes.map((d, i) => `
        <label class="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <div class="flex items-center gap-3">
                <input type="checkbox" checked class="checkbox-deporte-confirmar w-4 h-4 accent-green-600" value="${i}" data-precio="${d.precio}" data-deporte="${d.deporte}">
                <span class="text-sm font-semibold text-black dark:text-white">${d.deporte}</span>
            </div>
            <span class="text-sm font-bold text-green-600">S/ ${d.precio.toFixed(2)}</span>
        </label>
    `).join('');

    const sumaDeportes = deportes.reduce((s, d) => s + d.precio, 0);

    const modal = document.createElement('div');
    modal.id = 'modalAccionPago';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4';
    modal.style.animation = 'fadeIn .2s ease';
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full shadow-2xl" style="animation: scaleIn .2s ease">
            <div class="flex justify-center mb-4">
                <div class="size-16 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center">
                    <span class="material-symbols-outlined" style="font-size:40px">check_circle</span>
                </div>
            </div>
            <h3 class="text-xl font-black text-center text-black dark:text-white mb-2">Confirmar Pago</h3>
            <p class="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">Selecciona los deportes a confirmar en este pago</p>
            
            <div class="space-y-2 mb-4">
                ${checkboxesHTML}
            </div>

            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Monto original del comprobante:</span>
                    <span class="font-bold">S/ ${montoOriginal.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-sm font-bold text-black dark:text-white">
                    <span>Monto a confirmar:</span>
                    <span id="montoConfirmarCalc" class="text-green-600">S/ ${sumaDeportes.toFixed(2)}</span>
                </div>
            </div>

            <div id="avisoMontoConfirmar" class="hidden bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 mb-4">
                <p class="text-xs text-amber-700 dark:text-amber-400">
                    <span class="material-symbols-outlined text-xs align-middle">info</span>
                    El monto se ajustará automáticamente. Recuerda luego ir a <strong>Lista de Inscritos</strong> para desactivar el deporte no confirmado.
                </p>
            </div>

            <div class="flex gap-3">
                <button id="modalAccionCancelar" class="flex-1 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-xl font-bold text-sm transition-colors">
                    Cancelar
                </button>
                <button id="modalAccionConfirmar" class="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-lg">check_circle</span>
                    Confirmar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners para checkboxes
    const checkboxes = modal.querySelectorAll('.checkbox-deporte-confirmar');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            let total = 0;
            checkboxes.forEach(c => {
                if (c.checked) total += parseFloat(c.dataset.precio);
            });
            document.getElementById('montoConfirmarCalc').textContent = `S/ ${total.toFixed(2)}`;
            const aviso = document.getElementById('avisoMontoConfirmar');
            const algunoDesmarcado = Array.from(checkboxes).some(c => !c.checked);
            if (algunoDesmarcado && Array.from(checkboxes).some(c => c.checked)) {
                aviso.classList.remove('hidden');
            } else {
                aviso.classList.add('hidden');
            }
        });
    });

    modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModalAccion(); });
    document.getElementById('modalAccionCancelar').addEventListener('click', cerrarModalAccion);
    document.getElementById('modalAccionConfirmar').addEventListener('click', async () => {
        const seleccionados = Array.from(checkboxes).filter(c => c.checked);
        const noSeleccionados = Array.from(checkboxes).filter(c => !c.checked);
        if (seleccionados.length === 0) {
            mostrarToast('Selecciona al menos un deporte', 'error');
            return;
        }
        let nuevoMonto = 0;
        seleccionados.forEach(c => nuevoMonto += parseFloat(c.dataset.precio));

        const todosSeleccionados = seleccionados.length === checkboxes.length;
        const deportesConfirmados = seleccionados.map(c => c.dataset.deporte).join(', ');
        const obs = todosSeleccionados ? null : `Confirmado solo: ${deportesConfirmados}`;
        const montoFinal = todosSeleccionados ? null : nuevoMonto;

        // Deportes no confirmados → crear pago pendiente separado
        const deportesPendientes = todosSeleccionados ? [] : noSeleccionados.map(c => ({
            deporte: c.dataset.deporte,
            precio: parseFloat(c.dataset.precio)
        }));

        cerrarModalAccion();
        await ejecutarConfirmarPago(pagoId, montoFinal, obs, deportesPendientes);
    });
}

async function ejecutarConfirmarPago(pagoId, monto, observaciones, deportesPendientes) {
    const API_BASE = getAPIBase();
    const token = getToken();
    try {
        const body = {};
        if (monto !== null && monto !== undefined) body.monto = monto;
        if (observaciones) body.observaciones = observaciones;
        if (deportesPendientes && deportesPendientes.length > 0) body.deportes_pendientes = deportesPendientes;
        const response = await fetch(`${API_BASE}/api/admin/pagos-mensuales/${pagoId}/confirmar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (data.success) {
            mostrarToast('Pago confirmado exitosamente', 'success');
            cargarPagosMensuales();
        } else {
            mostrarToast(data.error || 'No se pudo confirmar', 'error');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarToast('Error al confirmar pago', 'error');
    }
}

async function rechazarPagoMensual(pagoId) {
    mostrarModalAccion({
        titulo: 'Rechazar Pago',
        mensaje: '¿Estás seguro de rechazar este pago mensual?',
        icono: 'cancel',
        iconoColor: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        inputPlaceholder: 'Motivo del rechazo (opcional)...',
        btnTexto: 'Rechazar',
        btnColor: 'bg-red-600 hover:bg-red-700',
        onConfirm: async (motivo) => {
            const API_BASE = getAPIBase();
            const token = getToken();
            try {
                const response = await fetch(`${API_BASE}/api/admin/pagos-mensuales/${pagoId}/rechazar`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ observaciones: motivo })
                });
                const data = await response.json();
                if (data.success) {
                    mostrarToast('Pago rechazado', 'success');
                    cargarPagosMensuales();
                } else {
                    mostrarToast(data.error || 'No se pudo rechazar', 'error');
                }
            } catch (error) {
                console.error('❌ Error:', error);
                mostrarToast('Error al rechazar pago', 'error');
            }
        }
    });
}

// ==================== OBSERVACIONES ====================

function abrirModalObservacionPago(pagoId, notaActual) {
    const existente = document.getElementById('modalObservacionPago');
    if (existente) existente.remove();

    const modal = document.createElement('div');
    modal.id = 'modalObservacionPago';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-4">
                    <div class="size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400">edit_note</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-black text-black dark:text-white uppercase">Observación</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Pago #${pagoId}</p>
                    </div>
                </div>
            </div>
            <div class="p-6">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nota u observación del pago</label>
                <textarea id="inputObservacionPago" rows="4"
                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    placeholder="Ej: Paga S/.60 hasta el 15/04 y el resto en quincena...">${notaActual}</textarea>
            </div>
            <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                <button onclick="document.getElementById('modalObservacionPago').remove()"
                    class="px-5 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold uppercase text-sm">
                    Cancelar
                </button>
                <button onclick="guardarObservacionPago(${pagoId})"
                    class="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase text-sm transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">save</span>
                    Guardar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    setTimeout(() => document.getElementById('inputObservacionPago')?.focus(), 100);
}

async function guardarObservacionPago(pagoId) {
    const obs = document.getElementById('inputObservacionPago')?.value?.trim() || '';
    const btn = document.querySelector('#modalObservacionPago button:last-child');
    if (btn) { btn.disabled = true; btn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div><span>Guardando...</span>'; }

    const API_BASE = getAPIBase();
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/api/admin/pagos-mensuales/${pagoId}/observaciones`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ observaciones: obs })
        });
        const data = await response.json();
        document.getElementById('modalObservacionPago')?.remove();
        if (data.success) {
            mostrarToast('Observación guardada correctamente', 'success');
            cargarPagosMensuales();
        } else {
            mostrarToast(data.error || 'Error al guardar', 'error');
        }
    } catch (e) {
        mostrarToast('Error de conexión', 'error');
        document.getElementById('modalObservacionPago')?.remove();
    }
}

// ==================== EDITAR MONTO ====================

function abrirModalEditarMonto(pagoId, montoActual) {
    const existente = document.getElementById('modalEditarMonto');
    if (existente) existente.remove();

    const modal = document.createElement('div');
    modal.id = 'modalEditarMonto';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-4">
                    <div class="size-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-2xl text-indigo-600 dark:text-indigo-400">payments</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-black text-black dark:text-white uppercase">Editar Monto</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Pago #${pagoId}</p>
                    </div>
                </div>
            </div>
            <div class="p-6">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nuevo monto (S/)</label>
                <input type="number" id="inputEditarMonto" step="0.01" min="0" value="${montoActual.toFixed(2)}"
                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-lg font-bold text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="80.00">
                <p class="text-xs text-gray-400 mt-2">Solo modifica el monto de este registro. No afecta el plan ni los precios futuros.</p>
            </div>
            <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                <button onclick="document.getElementById('modalEditarMonto').remove()"
                    class="px-5 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold uppercase text-sm">
                    Cancelar
                </button>
                <button onclick="guardarMontoPago(${pagoId})"
                    class="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase text-sm transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">save</span>
                    Guardar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    setTimeout(() => { const inp = document.getElementById('inputEditarMonto'); inp?.focus(); inp?.select(); }, 100);
}

async function guardarMontoPago(pagoId) {
    const monto = parseFloat(document.getElementById('inputEditarMonto')?.value);
    if (isNaN(monto) || monto < 0) { mostrarToast('Ingresa un monto válido', 'error'); return; }

    const btn = document.querySelector('#modalEditarMonto button:last-child');
    if (btn) { btn.disabled = true; btn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div><span>Guardando...</span>'; }

    const API_BASE = getAPIBase();
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/api/admin/pagos-mensuales/${pagoId}/monto`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ monto })
        });
        const data = await response.json();
        document.getElementById('modalEditarMonto')?.remove();
        if (data.success) {
            mostrarToast('Monto actualizado correctamente', 'success');
            cargarPagosMensuales();
        } else {
            mostrarToast(data.error || 'Error al actualizar', 'error');
        }
    } catch (e) {
        mostrarToast('Error de conexión', 'error');
        document.getElementById('modalEditarMonto')?.remove();
    }
}