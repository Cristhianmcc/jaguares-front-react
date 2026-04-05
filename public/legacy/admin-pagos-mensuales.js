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
}

async function cargarPagosMensuales() {
    const API_BASE = getAPIBase();
    const token = getToken();
    if (!token) return;

    const buscar = (document.getElementById('buscarDNI')?.value || '').trim();
    const estado = document.getElementById('filtroEstado')?.value || 'todos';
    const mes = document.getElementById('filtroMes')?.value || '';

    const params = new URLSearchParams();
    if (estado !== 'todos') params.set('estado', estado);
    if (mes) params.set('mes', mes);
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

        return `
            <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-4 py-3">
                    <p class="font-bold text-black dark:text-white text-sm">${p.nombres} ${p.apellidos}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 font-mono">${p.dni}</p>
                    ${observacionBadge}
                </td>
                <td class="px-4 py-3 text-sm capitalize font-semibold text-black dark:text-white">${p.mes}</td>
                <td class="px-4 py-3 text-sm text-black dark:text-white">${p['año'] || p.anio || ''}</td>
                <td class="px-4 py-3 text-sm font-bold text-black dark:text-white">S/ ${parseFloat(p.monto || 0).toFixed(2)}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${estadoClase}">
                        <span class="material-symbols-outlined text-sm">${estadoIcono}</span>
                        ${p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                    </span>
                </td>
                <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">${fecha}</td>
                <td class="px-4 py-3">${comprobanteBtn}</td>
                <td class="px-4 py-3">${acciones}</td>
            </tr>
        `;
    }).join('');
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
    mostrarModalAccion({
        titulo: 'Confirmar Pago',
        mensaje: '¿Estás seguro de confirmar este pago mensual?',
        icono: 'check_circle',
        iconoColor: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        btnTexto: 'Confirmar',
        btnColor: 'bg-green-600 hover:bg-green-700',
        onConfirm: async () => {
            const API_BASE = getAPIBase();
            const token = getToken();
            try {
                const response = await fetch(`${API_BASE}/api/admin/pagos-mensuales/${pagoId}/confirmar`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
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
    });
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
