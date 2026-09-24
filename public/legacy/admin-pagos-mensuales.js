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
        : ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || /^192\.168\./.test(window.location.hostname) || /^10\./.test(window.location.hostname) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(window.location.hostname))
            ? ''
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

function getDriveDownloadUrl(url) {
    if (!url) return '#';
    let fileId = null;
    const m1 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m1) fileId = m1[1];
    const m2 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m2) fileId = m2[1];
    if (fileId) return 'https://drive.google.com/uc?export=download&id=' + fileId;
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
    if (selectDeporte) selectDeporte.addEventListener('change', () => {
        // Al cambiar deporte: recargar categorías y luego pagos
        cargarCategoriasPorDeporte(selectDeporte.value);
        cargarPagosMensuales();
    });

    // Listener de categoría
    const selectCategoria = document.getElementById('filtroCategoria');
    if (selectCategoria) selectCategoria.addEventListener('change', () => cargarPagosMensuales());

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
    // Cargar todas las categorías al inicio (sin deporte seleccionado)
    cargarCategoriasPorDeporte('');
}

// Función global llamada desde el atributo onchange del select de deporte
window.onCambioDeporte = function(valor) {
    cargarCategoriasPorDeporte(valor);
    cargarPagosMensuales();
};

async function cargarCategoriasPorDeporte(deporte) {
    const API_BASE = getAPIBase();
    const token = getToken();
    const select = document.getElementById('filtroCategoria');
    if (!select) return;

    // Resetear a solo la opción por defecto
    select.innerHTML = '<option value="">Todas las categorías</option>';

    try {
        const response = await fetch(`${API_BASE}/api/horarios?refresh=false`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!data.horarios) return;

        // Si hay deporte seleccionado, filtrar solo sus categorías.
        // Si no, mostrar todas las categorías de todos los deportes.
        const horariosFiltrados = deporte
            ? data.horarios.filter(h => h.deporte && h.deporte.toLowerCase() === deporte.toLowerCase() && h.categoria)
            : data.horarios.filter(h => h.categoria);

        const categorias = [...new Set(horariosFiltrados.map(h => h.categoria))].sort();

        categorias.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
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
    const categoria = document.getElementById('filtroCategoria')?.value || '';

    const params = new URLSearchParams();
    if (estado !== 'todos') params.set('estado', estado);
    if (mes) params.set('mes', mes);
    if (deporte) params.set('deporte', deporte);
    if (categoria) params.set('grupo', categoria);
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

        const tieneFechaPago = p.fecha_pago && p.fecha_pago !== '-' && p.fecha_pago !== 'null';
        const tieneComprobante = p.comprobante_url && typeof p.comprobante_url === 'string' && p.comprobante_url.trim() !== '' && p.comprobante_url !== '-' && p.comprobante_url !== 'null' && p.comprobante_url !== 'undefined' && (p.estado !== 'pendiente' || tieneFechaPago);
        const comprobanteBtn = tieneComprobante ? `
            <div class="flex items-center gap-1.5 flex-wrap">
                <a href="${getDriveViewUrl(p.comprobante_url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold transition-colors" title="Ver en Google Drive">
                    <span class="material-symbols-outlined text-sm">open_in_new</span> Ver
                </a>
                <a href="${getDriveDownloadUrl(p.comprobante_url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold transition-colors" title="Descargar comprobante">
                    <span class="material-symbols-outlined text-sm">download</span> Descargar
                </a>
            </div>
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

        let montoMostrar = parseFloat(p.monto || 0);
        if ((!montoMostrar || montoMostrar <= 0) && p.deportes_inscritos && p.deportes_inscritos.length > 0) {
            montoMostrar = p.deportes_inscritos.reduce((sum, d) => sum + parseFloat(d.precio || 0), 0);
        }

        return `
            <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-4 py-3">
                    <p class="font-bold text-black dark:text-white text-sm">${p.nombres} ${p.apellidos}</p>
                    <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                        <span>DNI: ${p.dni}</span>
                        ${p.numero_operacion ? `<span class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded font-semibold text-[11px]">Op: ${p.numero_operacion}</span>` : ''}
                    </div>
                    ${deportesHTML}
                    ${observacionBadge}
                </td>
                <td class="px-4 py-3 text-sm text-black dark:text-white capitalize font-semibold">${p.mes || ''}</td>
                <td class="px-4 py-3 text-sm text-black dark:text-white">${p['año'] || p.anio || ''}</td>
                <td class="px-4 py-3 text-sm font-bold text-black dark:text-white">S/ ${montoMostrar.toFixed(2)}</td>
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
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 md:p-4 overflow-y-auto';
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col" style="max-height: 90vh; min-height: 400px;">
            <!-- Header Modal -->
            <div class="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-zinc-900/50 flex-shrink-0">
                <div class="min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500">
                            <span class="material-symbols-outlined text-lg">fact_check</span>
                        </span>
                        <h3 class="text-lg md:text-xl font-black text-black dark:text-white truncate">Asistencias de ${nombreCompleto}</h3>
                    </div>
                    <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 ml-10">
                        DNI: <span class="font-mono font-bold text-gray-700 dark:text-gray-200">${dni}</span> &bull; Control Dual: Asistencia Docente y Puerta
                    </p>
                </div>
                <button id="modalAsistenciasCerrar" class="text-gray-400 hover:text-black dark:hover:text-white text-2xl flex-shrink-0 ml-4 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">&times;</button>
            </div>

            <!-- Barra de Filtros y Acciones -->
            <div class="p-3 md:px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-zinc-900/30 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <div class="flex flex-wrap items-center gap-2 text-xs">
                    <span class="font-bold text-gray-600 dark:text-gray-300">Rango de fechas:</span>
                    <div class="flex items-center gap-1">
                        <span class="text-gray-400 text-[11px]">Desde:</span>
                        <input type="date" id="filtroAsistDesde" class="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-black dark:text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none" />
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="text-gray-400 text-[11px]">Hasta:</span>
                        <input type="date" id="filtroAsistHasta" class="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-black dark:text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none" />
                    </div>
                    <button id="btnFiltrarAsistencias" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">filter_alt</span> Filtrar
                    </button>
                    <button id="btnLimpiarFiltroAsist" class="px-2.5 py-1.5 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 text-gray-700 dark:text-gray-200 font-semibold rounded-lg text-xs transition-colors">
                        Todas
                    </button>
                </div>

                <div class="flex items-center gap-2">
                    <button id="btnDescargarPdfAsist" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">picture_as_pdf</span> Descargar PDF
                    </button>
                </div>
            </div>

            <!-- Resumen Estadístico Rápido -->
            <div id="modalAsistenciasResumen" class="px-4 md:px-6 pt-3 pb-1 flex flex-wrap gap-2 text-xs flex-shrink-0">
                <!-- Se llena dinámicamente -->
            </div>

            <!-- Cuerpo / Tabla de Asistencias -->
            <div id="modalAsistenciasBody" class="p-3 md:p-6 text-xs md:text-sm text-black dark:text-white overflow-y-auto flex-1">
                <div class="text-center py-10 text-gray-500 dark:text-gray-400">Cargando asistencias...</div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.getElementById('modalAsistenciasCerrar').addEventListener('click', () => modal.remove());

    let _asistenciasAlumnoData = null;

    async function cargarAsistencias(desde = '', hasta = '') {
        const body = document.getElementById('modalAsistenciasBody');
        const resumenDiv = document.getElementById('modalAsistenciasResumen');
        body.innerHTML = '<div class="text-center py-10 text-gray-500 dark:text-gray-400">Cargando asistencias...</div>';

        try {
            const API_BASE = getAPIBase();
            const token = getToken();
            let url = `${API_BASE}/api/admin/alumnos/${encodeURIComponent(dni)}/asistencias`;
            const q = [];
            if (desde) q.push(`fecha_inicio=${encodeURIComponent(desde)}`);
            if (hasta) q.push(`fecha_fin=${encodeURIComponent(hasta)}`);
            if (q.length > 0) url += '?' + q.join('&');

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (!data.success || !Array.isArray(data.asistencias)) {
                body.innerHTML = `<div class="text-center py-10 text-red-500">No se pudieron cargar las asistencias.</div>`;
                return;
            }

            _asistenciasAlumnoData = data;

            if (data.asistencias.length === 0) {
                if (resumenDiv) resumenDiv.innerHTML = '';
                body.innerHTML = `<div class="text-center py-10 text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-4xl text-gray-400 mb-2">event_busy</span>
                    <p>No se encontraron registros de asistencia en el rango seleccionado.</p>
                </div>`;
                return;
            }

            const total = data.asistencias.length;
            const presentesDocente = data.asistencias.filter(a => a.presente).length;
            const ausentesDocente = total - presentesDocente;
            const puertaOk = data.asistencias.filter(a => a.asistencia_puerta === 1 || a.asistencia_puerta === true || a.asistencia_puerta === '1').length;
            const pctDocente = Math.round((presentesDocente / total) * 100);
            const pctPuerta = Math.round((puertaOk / total) * 100);

            // Render Resumen
            if (resumenDiv) {
                resumenDiv.innerHTML = `
                    <div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold">
                        <span class="material-symbols-outlined text-sm text-gray-500">calendar_month</span>
                        Total Clases: <span class="font-extrabold text-black dark:text-white">${total}</span>
                    </div>
                    <div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold">
                        <span class="material-symbols-outlined text-sm text-emerald-500">sports</span>
                        Docente: <span class="font-extrabold">${presentesDocente} presentes</span> (${pctDocente}%)
                    </div>
                    <div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                        <span class="material-symbols-outlined text-sm text-emerald-500">sensor_door</span>
                        Puerta (Lector): <span class="font-extrabold">${puertaOk} ingresos</span> (${pctPuerta}%)
                    </div>
                `;
            }

            const rows = data.asistencias.map(asist => {
                // Parseo directo del string para evitar desplazamiento de zona horaria (UTC midnight → Lima = día anterior)
                const _fd = asist.fecha ? String(asist.fecha).split('T')[0].split('-') : null;
                const fechaFormato = _fd && _fd.length === 3 ? `${_fd[2]}/${_fd[1]}/${_fd[0]}` : '-';
                const tienePuerta = asist.asistencia_puerta === 1 || asist.asistencia_puerta === true || asist.asistencia_puerta === '1';

                return `
                <tr class="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors">
                    <td class="px-3 md:px-4 py-2.5 font-mono font-medium">${fechaFormato}</td>
                    <td class="px-3 md:px-4 py-2.5 font-bold text-gray-900 dark:text-white">${String(asist.deporte || '').replace(/FÃºtbol|FÃ°tbol|F\uFFFDtbol/gi, 'Fútbol').replace(/BÃ¡squet/gi, 'Básquet').replace(/VÃ³ley/gi, 'Vóley')}</td>
                    <td class="px-3 md:px-4 py-2.5 text-gray-600 dark:text-gray-300">${asist.categoria || '-'}</td>
                    <td class="px-3 md:px-4 py-2.5 text-gray-600 dark:text-gray-300">${asist.dia || '-'}</td>
                    <td class="px-3 md:px-4 py-2.5 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono text-xs">${asist.hora_inicio || '-'} - ${asist.hora_fin || '-'}</td>
                    <!-- Asistencia Docente -->
                    <td class="px-3 md:px-4 py-2.5 whitespace-nowrap">
                        ${asist.presente 
                            ? '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/30"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>✓ Presente</span>' 
                            : '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-500/30"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>✗ Ausente</span>'}
                    </td>
                    <!-- Asistencia Puerta (Lector QR) -->
                    <td class="px-3 md:px-4 py-2.5 whitespace-nowrap">
                        ${tienePuerta 
                            ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-500/40 shadow-xs">
                                 <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                                 Puerta OK${asist.hora_puerta ? ' (' + asist.hora_puerta + ')' : ''}
                               </span>`
                            : `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400 border border-gray-200 dark:border-zinc-700">
                                 <span class="inline-block w-2 h-2 rounded-full bg-gray-400 flex-shrink-0"></span>
                                 Sin Puerta
                               </span>`}
                    </td>
                    <td class="px-3 md:px-4 py-2.5 text-gray-500 dark:text-gray-400 max-w-xs truncate">${asist.observaciones || '-'}</td>
                </tr>
            `;
            }).join('');

            body.innerHTML = `
                <div class="overflow-x-auto -mx-3 md:-mx-6">
                    <div class="inline-block min-w-full px-3 md:px-6">
                        <table class="w-full text-left border-collapse text-xs md:text-sm">
                            <thead class="bg-gray-100 dark:bg-zinc-800 text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300 sticky top-0 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th class="px-3 md:px-4 py-3">Fecha</th>
                                    <th class="px-3 md:px-4 py-3">Deporte</th>
                                    <th class="px-3 md:px-4 py-3">Cat.</th>
                                    <th class="px-3 md:px-4 py-3">Día</th>
                                    <th class="px-3 md:px-4 py-3">Horario</th>
                                    <th class="px-3 md:px-4 py-3 text-center">Asistencia (Docente)</th>
                                    <th class="px-3 md:px-4 py-3 text-center">Asistencia Puerta</th>
                                    <th class="px-3 md:px-4 py-3">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            body.innerHTML = `<div class="text-center py-10 text-red-500">Error al cargar asistencias.</div>`;
            console.error('Error al obtener asistencias del alumno:', error);
        }
    }

    // Eventos de Filtrado
    const btnFiltrar = document.getElementById('btnFiltrarAsistencias');
    const btnLimpiar = document.getElementById('btnLimpiarFiltroAsist');
    const inputDesde = document.getElementById('filtroAsistDesde');
    const inputHasta = document.getElementById('filtroAsistHasta');
    const btnPdf = document.getElementById('btnDescargarPdfAsist');

    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', () => {
            cargarAsistencias(inputDesde.value, inputHasta.value);
        });
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            if (inputDesde) inputDesde.value = '';
            if (inputHasta) inputHasta.value = '';
            cargarAsistencias('', '');
        });
    }

    if (btnPdf) {
        btnPdf.addEventListener('click', () => {
            if (!_asistenciasAlumnoData || !_asistenciasAlumnoData.asistencias || _asistenciasAlumnoData.asistencias.length === 0) {
                mostrarToast('No hay asistencias para exportar a PDF', 'error');
                return;
            }
            generarPdfAsistenciasAlumno(dni, nombreCompleto, _asistenciasAlumnoData.asistencias, inputDesde.value, inputHasta.value);
        });
    }

    // Carga inicial
    cargarAsistencias('', '');
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
        const pagoData = window._pagosData?.[pagoId] || {};
        const body = {};
        if (monto !== null && monto !== undefined) body.monto = monto;
        if (observaciones) body.observaciones = observaciones;
        if (deportesPendientes && deportesPendientes.length > 0) body.deportes_pendientes = deportesPendientes;
        body.dni = pagoData.dni;
        body.mes = pagoData.mes;
        body.anio = pagoData.anio;
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
                        <p class="text-xs text-gray-500 dark:text-gray-400">${pagoId > 0 ? `Pago #${pagoId}` : 'Pendiente de pago'}</p>
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

    const pagoData = window._pagosData?.[pagoId] || {};
    let montoToSend = parseFloat(pagoData.monto || 0);
    if ((!montoToSend || montoToSend <= 0) && pagoData.deportes && pagoData.deportes.length > 0) {
        montoToSend = pagoData.deportes.reduce((s, d) => s + parseFloat(d.precio || 0), 0);
    }

    const API_BASE = getAPIBase();
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/api/admin/pagos-mensuales/${pagoId}/observaciones`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                observaciones: obs,
                dni: pagoData.dni,
                mes: pagoData.mes,
                anio: pagoData.anio,
                monto: montoToSend
            })
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

    const pagoData = window._pagosData?.[pagoId] || {};
    let valMonto = typeof montoActual === 'number' ? montoActual : parseFloat(montoActual || 0);
    if ((!valMonto || valMonto <= 0) && pagoData.deportes && pagoData.deportes.length > 0) {
        valMonto = pagoData.deportes.reduce((s, d) => s + parseFloat(d.precio || 0), 0);
    }

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
                        <p class="text-xs text-gray-500 dark:text-gray-400">${pagoId > 0 ? `Pago #${pagoId}` : 'Pendiente de pago'}</p>
                    </div>
                </div>
            </div>
            <div class="p-6">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nuevo monto (S/)</label>
                <input type="number" id="inputEditarMonto" step="0.01" min="0" value="${valMonto.toFixed(2)}"
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

    const pagoData = window._pagosData?.[pagoId] || {};
    const API_BASE = getAPIBase();
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/api/admin/pagos-mensuales/${pagoId}/monto`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                monto,
                dni: pagoData.dni,
                mes: pagoData.mes,
                anio: pagoData.anio
            })
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
// Función generadora de reporte imprimible / PDF con Doble Asistencia
function generarPdfAsistenciasAlumno(dni, nombreCompleto, asistencias, desde, hasta) {
    const total = asistencias.length;
    const presentes = asistencias.filter(a => a.presente).length;
    const faltas = total - presentes;
    const puertaOk = asistencias.filter(a => a.asistencia_puerta === 1 || a.asistencia_puerta === true || a.asistencia_puerta === '1').length;
    const pctDocente = total > 0 ? Math.round((presentes / total) * 100) : 0;
    const pctPuerta = total > 0 ? Math.round((puertaOk / total) * 100) : 0;

    const fechaHoy = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
    const rangoTexto = (desde || hasta) 
        ? `Del ${desde || 'Inicio'} al ${hasta || 'Presente'}`
        : 'Historial Completo Registrado';

    const limpiarDeporte = (d) => String(d || '').replace(/FÃºtbol|FÃ°tbol|F\uFFFDtbol/gi, 'Fútbol').replace(/BÃ¡squet/gi, 'Básquet').replace(/VÃ³ley/gi, 'Vóley');
    const limpiarHora = (h) => String(h || '').replace(/:00$/, '');

    const filasHtml = asistencias.map((a, idx) => {
        // Parseo directo para evitar UTC midnight → día anterior en Lima
        const _fa = a.fecha ? String(a.fecha).split('T')[0].split('-') : null;
        const fStr = _fa && _fa.length === 3 ? `${_fa[2]}/${_fa[1]}/${_fa[0]}` : '-';
        const puertaOkBool = a.asistencia_puerta === 1 || a.asistencia_puerta === true || a.asistencia_puerta === '1';
        const horaInicio = limpiarHora(a.hora_inicio);
        const horaFin = limpiarHora(a.hora_fin);
        const horarioStr = horaInicio && horaFin ? `${a.dia || ''} (${horaInicio} - ${horaFin})` : (a.dia || '-');

        return `
            <tr>
                <td style="text-align: center; color: #64748b; font-weight: 700;">${idx + 1}</td>
                <td><strong style="color: #0f172a;">${fStr}</strong></td>
                <td><span style="font-weight: 800; color: #1e293b;">${limpiarDeporte(a.deporte)}</span></td>
                <td style="color: #475569;">${a.categoria || '-'}</td>
                <td style="color: #334155; font-size: 8.5pt;">${horarioStr}</td>
                <td style="text-align: center;">
                    <span class="${a.presente ? 'badge-docente-ok' : 'badge-docente-fail'}">${a.presente ? '✓ Presente' : '✗ Ausente'}</span>
                </td>
                <td style="text-align: center;">
                    <span class="${puertaOkBool ? 'badge-puerta-ok' : 'badge-puerta-sin'}">${puertaOkBool ? '● Puerta OK' + (a.hora_puerta ? ' (' + a.hora_puerta + ')' : '') : '○ Sin Registro'}</span>
                </td>
                <td style="color: #64748b; font-size: 8pt;">${a.observaciones || '-'}</td>
            </tr>
        `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Por favor habilita las ventanas emergentes (popups) para descargar el reporte en PDF.');
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="utf-8">
            <title>Reporte de Asistencia - ${nombreCompleto} - JAGUARES</title>
            <style>
                @page { size: A4 portrait; margin: 10mm 12mm; }
                * { box-sizing: border-box; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                    color: #0f172a; 
                    margin: 0; 
                    padding: 0; 
                    font-size: 9.5pt; 
                    background: #ffffff;
                    -webkit-font-smoothing: antialiased;
                }
                
                /* Barra flotante no imprimible */
                .no-print-bar {
                    background: #0f172a;
                    color: #ffffff;
                    padding: 14px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 3px solid #f59e0b;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .btn-imprimir {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: #ffffff;
                    border: none;
                    padding: 10px 22px;
                    font-size: 11pt;
                    font-weight: 800;
                    border-radius: 8px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 2px 6px rgba(16,185,129,0.3);
                    transition: transform 0.1s;
                }
                .btn-imprimir:hover { transform: scale(1.02); }

                .doc-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 5px;
                }

                /* Header Institucional */
                .header-table {
                    width: 100%;
                    border-bottom: 2.5px solid #0f172a;
                    padding-bottom: 12px;
                    margin-bottom: 16px;
                }
                .brand-title {
                    font-size: 22pt;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: 2px;
                    line-height: 1;
                    margin: 0;
                }
                .brand-badge {
                    display: inline-block;
                    height: 4px;
                    width: 50px;
                    background: #f59e0b;
                    border-radius: 2px;
                    margin-top: 4px;
                    margin-bottom: 6px;
                }
                .brand-sub {
                    font-size: 8.5pt;
                    font-weight: 700;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .doc-type-badge {
                    background: #0f172a;
                    color: #ffffff;
                    padding: 5px 12px;
                    border-radius: 6px;
                    font-size: 8.5pt;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    display: inline-block;
                }
                .doc-meta {
                    font-size: 8pt;
                    color: #64748b;
                    margin-top: 5px;
                    font-weight: 600;
                }

                /* Ficha del Alumno */
                .card-alumno {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 12px 16px;
                    margin-bottom: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .meta-label {
                    font-size: 7.5pt;
                    text-transform: uppercase;
                    color: #64748b;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    margin-bottom: 2px;
                }
                .meta-value {
                    font-size: 11.5pt;
                    font-weight: 900;
                    color: #0f172a;
                }

                /* KPIs Resumen */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                    margin-bottom: 16px;
                }
                .stat-card {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 10px 12px;
                    text-align: center;
                    background: #f8fafc;
                }
                .stat-card.green {
                    background: #ecfdf5;
                    border-color: #a7f3d0;
                }
                .stat-card.amber {
                    background: #fffbeb;
                    border-color: #fde68a;
                }
                .stat-card.emerald {
                    background: #d1fae5;
                    border-color: #6ee7b7;
                }
                .stat-num {
                    font-size: 14pt;
                    font-weight: 900;
                    color: #0f172a;
                    line-height: 1.1;
                }
                .stat-lbl {
                    font-size: 7pt;
                    text-transform: uppercase;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    color: #475569;
                    margin-top: 3px;
                }

                /* Tabla de Asistencias */
                table.asist-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    font-size: 8.5pt;
                }
                table.asist-table th {
                    background: #0f172a;
                    color: #f8fafc;
                    padding: 7px 9px;
                    text-align: left;
                    font-size: 7.5pt;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                }
                table.asist-table td {
                    padding: 7px 9px;
                    border-bottom: 1px solid #e2e8f0;
                    vertical-align: middle;
                }
                table.asist-table tr:nth-child(even) {
                    background-color: #f8fafc;
                }

                /* Pills de estado */
                .badge-docente-ok {
                    background: #ecfdf5;
                    color: #065f46;
                    border: 1px solid #a7f3d0;
                    padding: 2.5px 8px;
                    border-radius: 9999px;
                    font-weight: 800;
                    font-size: 7.5pt;
                    display: inline-block;
                    white-space: nowrap;
                }
                .badge-docente-fail {
                    background: #fef2f2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                    padding: 2.5px 8px;
                    border-radius: 9999px;
                    font-weight: 800;
                    font-size: 7.5pt;
                    display: inline-block;
                    white-space: nowrap;
                }
                .badge-puerta-ok {
                    background: #d1fae5;
                    color: #064e3b;
                    border: 1.5px solid #34d399;
                    padding: 2.5px 9px;
                    border-radius: 9999px;
                    font-weight: 900;
                    font-size: 7.5pt;
                    display: inline-block;
                    white-space: nowrap;
                }
                .badge-puerta-sin {
                    background: #f1f5f9;
                    color: #64748b;
                    border: 1px solid #cbd5e1;
                    padding: 2.5px 8px;
                    border-radius: 9999px;
                    font-weight: 700;
                    font-size: 7.5pt;
                    display: inline-block;
                    white-space: nowrap;
                }

                /* Firmas */
                .signatures-area {
                    display: flex;
                    justify-content: space-around;
                    margin-top: 45px;
                    margin-bottom: 25px;
                }
                .sig-box {
                    width: 190px;
                    border-top: 1.5px dashed #64748b;
                    text-align: center;
                    padding-top: 6px;
                }
                .sig-title {
                    font-size: 8pt;
                    font-weight: 800;
                    color: #0f172a;
                    text-transform: uppercase;
                }
                .sig-sub {
                    font-size: 7pt;
                    color: #64748b;
                    margin-top: 1px;
                }

                /* Footer */
                .doc-footer {
                    border-top: 1px solid #cbd5e1;
                    padding-top: 8px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 7.5pt;
                    color: #64748b;
                    font-weight: 500;
                }

                @media print {
                    .no-print-bar { display: none !important; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="no-print-bar">
                <div>
                    <strong style="font-size: 11pt;">Vista de Impresión / Exportación a PDF</strong>
                    <div style="font-size: 8.5pt; color: #94a3b8; margin-top: 2px;">
                        Para enviar a los padres por WhatsApp: en la ventana que se abre selecciona destino "Guardar como PDF".
                    </div>
                </div>
                <button onclick="window.print()" class="btn-imprimir">
                    🖨️ Imprimir / Guardar como PDF
                </button>
            </div>

            <div class="doc-container">
                <table class="header-table">
                    <tr>
                        <td style="vertical-align: top;">
                            <div class="brand-title">JAGUARES</div>
                            <div class="brand-badge"></div>
                            <div class="brand-sub">Academia de Formación Deportiva &bull; jaguarescar.com</div>
                        </td>
                        <td style="text-align: right; vertical-align: top;">
                            <span class="doc-type-badge">REPORTE OFICIAL</span>
                            <div class="doc-meta">Control Dual: Docente & Puerta</div>
                            <div class="doc-meta">Emisión: ${fechaHoy}</div>
                        </td>
                    </tr>
                </table>

                <div class="card-alumno">
                    <div>
                        <div class="meta-label">Deportista / Alumno</div>
                        <div class="meta-value">${nombreCompleto}</div>
                    </div>
                    <div>
                        <div class="meta-label">Documento de Identidad</div>
                        <div class="meta-value" style="font-family: monospace; letter-spacing: 1px;">DNI ${dni}</div>
                    </div>
                    <div>
                        <div class="meta-label">Período de Asistencia</div>
                        <div class="meta-value" style="font-size: 9.5pt; color: #475569;">${rangoTexto}</div>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-num">${total}</div>
                        <div class="stat-lbl">Clases Totales</div>
                    </div>
                    <div class="stat-card green">
                        <div class="stat-num" style="color: #065f46;">${presentes} <span style="font-size: 8.5pt;">(${pctDocente}%)</span></div>
                        <div class="stat-lbl">Asistencia Docente</div>
                    </div>
                    <div class="stat-card amber">
                        <div class="stat-num" style="color: #991b1b;">${faltas}</div>
                        <div class="stat-lbl">Faltas Registradas</div>
                    </div>
                    <div class="stat-card emerald">
                        <div class="stat-num" style="color: #064e3b;">${puertaOk} <span style="font-size: 8.5pt;">(${pctPuerta}%)</span></div>
                        <div class="stat-lbl">Puerta (Lector QR)</div>
                    </div>
                </div>

                <table class="asist-table">
                    <thead>
                        <tr>
                            <th style="width: 25px; text-align: center;">#</th>
                            <th style="width: 85px;">Fecha</th>
                            <th>Deporte</th>
                            <th>Categoría</th>
                            <th>Día y Horario</th>
                            <th style="text-align: center; width: 120px;">Docente en Cancha</th>
                            <th style="text-align: center; width: 130px;">Puerta (Lector QR)</th>
                            <th>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasHtml}
                    </tbody>
                </table>

                <div class="signatures-area">
                    <div class="sig-box">
                        <div class="sig-title">Profesor / Entrenador</div>
                        <div class="sig-sub">Comando Técnico Jaguares</div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-title">Control de Puerta</div>
                        <div class="sig-sub">Recepción / Portería Oficial</div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-title">Firma Padre o Tutor</div>
                        <div class="sig-sub">Conformidad de Asistencia</div>
                    </div>
                </div>

                <div class="doc-footer">
                    <div>Jaguares &bull; Sistema Oficial de Control y Asistencias 2026 &bull; jaguarescar.com</div>
                    <div>Página 1 de 1</div>
                </div>
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); }, 450);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
// Exponer funciones globales en window para compatibilidad total con inline handlers
window.confirmarPagoMensual = confirmarPagoMensual;
window.rechazarPagoMensual = rechazarPagoMensual;
window.abrirModalObservacionPago = abrirModalObservacionPago;
window.abrirModalEditarMonto = abrirModalEditarMonto;
window.abrirModalAsistenciasAlumno = abrirModalAsistenciasAlumno;
window.cerrarModalAccion = cerrarModalAccion;
window.mostrarModalAccion = mostrarModalAccion;
window.mostrarModalConfirmarConDeportes = mostrarModalConfirmarConDeportes;
window.ejecutarConfirmarPago = ejecutarConfirmarPago;
window.cargarPagosMensuales = cargarPagosMensuales;
