// ==================== GESTI�"N DE INSCRIPCIONES Y PAGOS ====================

// Helper para obtener headers con autenticación
function getAuthHeadersInscripciones() {
    // Usar helper global si existe, si no crear uno local
    if (typeof getAuthHeaders === 'function') {
        return getAuthHeaders();
    }
    const session = localStorage.getItem('adminSession');
    const token = session ? JSON.parse(session).token : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

let inscripcionesData = [];
let reporteData = [];

/**
 * Cargar inscripciones según filtro de estado de pago
 */
async function cargarInscripciones() {
  const estadoPago = document.getElementById('filtroEstadoPago').value;
  const buscar = document.getElementById('buscarInscripcion')?.value || '';
  
  mostrarelemento('loadingInscripciones');
  ocultarelemento('tablaInscripcionesContainer');
  
  try {
    const url = `${API_BASE}/api/admin/inscripciones?estado_pago=${estadoPago}&buscar=${encodeURIComponent(buscar)}`;
    const response = await fetch(url, {
      headers: getAuthHeadersInscripciones()
    });
    const data = await response.json();
    
    if (data.success) {
      inscripcionesData = data.inscripciones;
      renderizarInscripciones(data.inscripciones);
      await cargarEstadisticasInscripciones();
    } else {
      mostrarNotificacion('Error al cargar inscripciones: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error de conexión al cargar inscripciones', 'error');
  } finally {
    ocultarelemento('loadingInscripciones');
    mostrarelemento('tablaInscripcionesContainer');
  }
}

/**
 * Renderizar lista de inscripciones
 */
function renderizarInscripciones(inscripciones) {
  const container = document.querySelector('#tablaInscripcionesContainer .grid');
  
  if (!inscripciones || inscripciones.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10">
        <span class="material-symbols-outlined text-6xl text-gray-400">inbox</span>
        <p class="text-text-muted mt-4 text-lg">No se encontraron inscripciones</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = inscripciones.map(ins => `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div class="flex flex-col md:flex-row justify-between gap-4">
        <!-- Información del Usuario -->
        <div class="flex-1">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-bold text-lg text-black dark:text-white">
                ${ins.nombres} ${ins.apellidos}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">DNI: ${ins.dni}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${
              ins.estado_pago === 'confirmado' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }">
              ${ins.estado_pago === 'confirmado' ? 'Confirmado' : 'Pendiente'}
            </span>
          </div>
          
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Edad:</span>
              <span class="ml-2 text-black dark:text-white font-medium">${ins.edad} años</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Sexo:</span>
              <span class="ml-2 text-black dark:text-white font-medium">${ins.sexo}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Teléfono:</span>
              <span class="ml-2 text-black dark:text-white font-medium">${ins.telefono || 'N/A'}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Email:</span>
              <span class="ml-2 text-black dark:text-white font-medium text-xs">${ins.email || 'N/A'}</span>
            </div>
          </div>
          
          <div class="mt-3">
            <span class="text-gray-500 dark:text-gray-400 text-sm">Inscrito en:</span>
            <div class="flex flex-wrap gap-2 mt-2">
              ${ins.deportes_inscritos ? ins.deportes_inscritos.split(', ').map(deporte => 
                `<span class="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">${deporte}</span>`
              ).join('') : ''}
              ${ins.deportes_pausados ? ins.deportes_pausados.split(', ').map(deporte => 
                `<span class="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs font-medium line-through opacity-70" title="Pausado por alumno">${deporte} (pausado)</span>`
              ).join('') : ''}
              ${!ins.deportes_inscritos && !ins.deportes_pausados ? '<span class="text-gray-400 text-xs">Sin inscripciones</span>' : ''}
            </div>
          </div>
          
          ${ins.total_inscripciones > 0 ? `
            <div class="mt-3 text-sm">
              <span class="text-gray-500 dark:text-gray-400">Total de horarios:</span>
              <span class="ml-2 text-black dark:text-white font-bold">${ins.total_inscripciones}</span>
            </div>
          ` : ''}
        </div>
        
        <!-- Acciones -->
        <div class="flex flex-col gap-2 md:w-48">
          <button onclick="verDetalleInscripcion('${ins.dni}')" 
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-sm">visibility</span>
            Ver Detalle
          </button>
          
          <button onclick="eliminarInscripcionesUsuario('${ins.dni}', '${ins.nombres} ${ins.apellidos}')" 
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-sm">delete</span>
            Eliminar Inscripciones
          </button>
          
          ${ins.estado_pago === 'pendiente' ? `
            <button onclick="confirmarPago('${ins.dni}')" 
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-sm">check_circle</span>
              Confirmar Pago
            </button>
          ` : `
            <button onclick="rechazarPago('${ins.dni}')" 
                    class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-sm">cancel</span>
              Marcar Pendiente
            </button>
          `}
          
          ${ins.url_comprobante ? `
            <a href="${ins.url_comprobante}" target="_blank"
               class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-sm">receipt</span>
              Ver Comprobante
            </a>
          ` : ''}
        </div>
      </div>
      
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        Registrado: ${formatearFecha(ins.created_at)}
      </div>
    </div>
  `).join('');
}

/**
 * Buscar inscripción en tiempo real
 */
function buscarInscripcion() {
  clearTimeout(window.busquedaTimeout);
  window.busquedaTimeout = setTimeout(() => {
    cargarInscripciones();
  }, 500);
}

/**
 * Ver detalle completo de inscripción
 */
async function verDetalleInscripcion(dni) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscripciones/${dni}`, {
      headers: getAuthHeadersInscripciones()
    });
    const data = await response.json();
    
    if (data.success) {
      mostrarModalDetalleInscripcion(data);
    } else {
      mostrarNotificacion('Error al cargar detalle: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error de conexión', 'error');
  }
}

/**
 * Modal de detalle de inscripción
 */
function mostrarModalDetalleInscripcion(data) {
  console.log('=== DEBUGGING MODAL ===');
  console.log('Data completa:', data);
  console.log('Inscripciones con estados:', data.inscripciones?.map(i => ({ deporte: i.deporte, estado: i.estado_inscripcion })));
  
  const usuario = data.alumno; // Cambiar de data.usuario a data.alumno para consistencia con Google Sheets
  const inscripciones = data.inscripciones;
  const resumen = data.resumen;
  
  const modal = document.createElement('div');
  modal.id = 'modalDetalleInscripcion';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white dark:bg-surface-dark rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
        <h3 class="text-xl font-bold text-black dark:text-white">Detalle de Inscripción</h3>
        <button onclick="cerrarModalDetalle()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="p-6 space-y-6">
        <!-- Información Personal -->
        <div>
          <h4 class="font-bold text-lg mb-3 text-black dark:text-white">Información Personal</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">DNI</p>
              <p class="font-semibold text-black dark:text-white">${usuario.dni}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Nombres</p>
              <p class="font-semibold text-black dark:text-white">${usuario.nombres}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Apellidos</p>
              <p class="font-semibold text-black dark:text-white">${usuario.apellidos}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Fecha de Nacimiento</p>
              <p class="font-semibold text-black dark:text-white">${formatearFecha(usuario.fecha_nacimiento)}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Edad</p>
              <p class="font-semibold text-black dark:text-white">${usuario.edad} años</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Sexo</p>
              <p class="font-semibold text-black dark:text-white">${usuario.sexo}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
              <p class="font-semibold text-black dark:text-white">${usuario.telefono || 'N/A'}</p>
            </div>
            <div class="col-span-2">
              <p class="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p class="font-semibold text-black dark:text-white">${usuario.email || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <!-- documentos -->
        <div>
          <h4 class="font-bold text-lg mb-3 text-black dark:text-white">documentos</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${usuario.dni_frontal_url ? `
              <a href="${usuario.dni_frontal_url}" target="_blank" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
                <span class="material-symbols-outlined text-4xl text-primary">badge</span>
                <p class="mt-2 text-sm font-semibold text-black dark:text-white">DNI Frontal</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Click para ver</p>
              </a>
            ` : '<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center"><p class="text-sm text-gray-400">DNI Frontal no disponible</p></div>'}
            
            ${usuario.dni_reverso_url ? `
              <a href="${usuario.dni_reverso_url}" target="_blank" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
                <span class="material-symbols-outlined text-4xl text-primary">badge</span>
                <p class="mt-2 text-sm font-semibold text-black dark:text-white">DNI Reverso</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Click para ver</p>
              </a>
            ` : '<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center"><p class="text-sm text-gray-400">DNI Reverso no disponible</p></div>'}
            
            ${usuario.foto_carnet_url ? `
              <a href="${usuario.foto_carnet_url}" target="_blank" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
                <span class="material-symbols-outlined text-4xl text-primary">photo_camera</span>
                <p class="mt-2 text-sm font-semibold text-black dark:text-white">Foto Carnet</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Click para ver</p>
              </a>
            ` : '<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center"><p class="text-sm text-gray-400">Foto Carnet no disponible</p></div>'}
          </div>
        </div>
        
        <!-- resumen -->
        <div>
          <h4 class="font-bold text-lg mb-3 text-black dark:text-white">resumen</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p class="text-xs text-blue-600 dark:text-blue-400">Total Inscripciones</p>
              <p class="text-2xl font-bold text-blue-700 dark:text-blue-300">${resumen.total_inscripciones}</p>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p class="text-xs text-green-600 dark:text-green-400">Deportes</p>
              <p class="text-2xl font-bold text-green-700 dark:text-green-300">${resumen.deportes_distintos}</p>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p class="text-xs text-purple-600 dark:text-purple-400">Días Activos</p>
              <p class="text-2xl font-bold text-purple-700 dark:text-purple-300">${resumen.dias_activos}</p>
            </div>
            <div class="bg-primary/10 rounded-lg p-4">
              <p class="text-xs text-primary">Monto Total</p>
              <p class="text-2xl font-bold text-primary">S/ ${resumen.monto_total.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <!-- Horarios Inscritos -->
        <div>
          <h4 class="font-bold text-lg mb-3 text-black dark:text-white">Horarios Inscritos</h4>
          <div class="space-y-3">
            ${inscripciones.length > 0 ? inscripciones.map(ins => {
              const esSuspendido = ins.estado_inscripcion === 'suspendida';
              const cardClasses = esSuspendido 
                ? 'bg-gray-100 dark:bg-gray-900 opacity-60 border border-gray-300 dark:border-gray-700' 
                : 'bg-gray-50 dark:bg-gray-800';
              const textClasses = esSuspendido ? 'line-through text-gray-400' : 'text-black dark:text-white';
              const iconClasses = esSuspendido ? 'text-gray-400' : 'text-primary';
              
              return `
              <div class="${cardClasses} rounded-lg p-4 flex items-center gap-4">
                <span class="material-symbols-outlined text-3xl ${iconClasses}">${ins.icono || 'sports'}</span>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <p class="font-bold ${textClasses}">${ins.deporte} - ${ins.categoria || 'Sin categoría'}</p>
                    ${esSuspendido ? '<span class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold uppercase">Pausado</span>' : ''}
                  </div>
                  <p class="text-sm ${esSuspendido ? 'text-gray-400 line-through' : 'text-gray-600 dark:text-gray-400'}">${ins.dia || 'Por definir'} ${ins.hora_inicio || ''} ${ins.hora_fin ? '- ' + ins.hora_fin : ''}</p>
                  <p class="text-xs text-gray-500">${ins.nivel || ''} ${ins.nivel ? '|' : ''} ${ins.plan || 'Económico'} | S/ ${ins.precio}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Estado</p>
                  ${esSuspendido 
                    ? '<span class="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Pausado por alumno</span>'
                    : `<span class="px-2 py-1 rounded-full text-xs font-semibold ${usuario.estado_pago === 'confirmado' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}">
                    ${usuario.estado_pago === 'confirmado' ? 'Pago Confirmado' : 'Pendiente de Pago'}
                  </span>`}
                </div>
              </div>
            `}).join('') : '<p class="text-center text-gray-500 py-4">Sin inscripciones activas</p>'}
          </div>
        </div>
      </div>
      
      <div class="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
        <button onclick="cerrarModalDetalle()" class="px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-semibold transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function cerrarModalDetalle() {
  const modal = document.getElementById('modalDetalleInscripcion');
  if (modal) modal.remove();
}

// ==================== MODALES DE CONFIRMACI�"N ====================

/**
 * Mostrar modal de confirmación personalizado
 */
function mostrarModalConfirmacion(config) {
  // Remover modal anterior si existe
  const existente = document.getElementById('modalConfirmacionPago');
  if (existente) existente.remove();

  const modal = document.createElement('div');
  modal.id = 'modalConfirmacionPago';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-fadeIn">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl ${config.iconColor}">${config.icon}</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">${config.titulo}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">${config.subtitulo}</p>
          </div>
        </div>
      </div>
      
      <!-- Contenido -->
      <div class="p-6">
        <p class="text-gray-700 dark:text-gray-300 mb-4">${config.Mensaje}</p>
        
        ${config.campos ? config.campos : ''}
      </div>
      
      <!-- Acciones -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
        <button onclick="cerrarModalConfirmacion()" 
                class="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium">
          Cancelar
        </button>
        <button onclick="${config.onConfirm}" 
                class="px-5 py-2.5 rounded-lg ${config.btnClass} text-white font-medium transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined text-lg">${config.btnIcon}</span>
          ${config.btnTexto}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  // Cerrar con Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') cerrarModalConfirmacion();
  };
  document.addEventListener('keydown', handleEscape);
  modal.dataset.escapeHandler = 'true';
  
  // Cerrar click fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModalConfirmacion();
  });
}

function cerrarModalConfirmacion() {
  const modal = document.getElementById('modalConfirmacionPago');
  if (modal) {
    modal.classList.add('animate-fadeOut');
    setTimeout(() => modal.remove(), 200);
  }
}

/**
 * Confirmar pago de un usuario
 */
function confirmarPago(dni) {
  mostrarModalConfirmacion({
    titulo: 'Confirmar Pago',
    subtitulo: `DNI: ${dni}`,
    icon: 'payments',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    Mensaje: 'Esto activará todas las inscripciones del usuario.',
    campos: `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto pagado (opcional)</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">S/</span>
            <input type="number" id="montoPago" placeholder="0.00" step="0.01" min="0"
                   class="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de operación (opcional)</label>
          <input type="text" id="numeroOperacion" placeholder="Ej: 00012345678"
                 class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white">
        </div>
      </div>
    `,
    btnTexto: 'Confirmar Pago',
    btnIcon: 'check_circle',
    btnClass: 'bg-green-600 hover:bg-green-700',
    onConfirm: `ejecutarConfirmacionPago('${dni}')`
  });
}

async function ejecutarConfirmacionPago(dni) {
  const monto = document.getElementById('montoPago')?.value;
  const numeroOp = document.getElementById('numeroOperacion')?.value;
  
  // Deshabilitar botón mientras procesa
  const btn = document.querySelector('#modalConfirmacionPago button[onclick*="ejecutar"]');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Procesando...';
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscripciones/${dni}/confirmar-pago`, {
      method: 'PUT',
      headers: getAuthHeadersInscripciones(),
      body: JSON.stringify({
        monto_pago: monto ? parseFloat(monto) : null,
        numero_operacion: numeroOp || null
      })
    });
    
    const data = await response.json();
    
    cerrarModalConfirmacion();
    
    if (data.success) {
      mostrarNotificacion(`�o. Pago confirmado. ${data.inscripciones_activadas} inscripciones activadas`, 'success');
      cargarInscripciones();
    } else {
      mostrarNotificacion('Error: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    cerrarModalConfirmacion();
    mostrarNotificacion('Error de conexión', 'error');
  }
}

/**
 * Rechazar pago
 */
function rechazarPago(dni) {
  mostrarModalConfirmacion({
    titulo: 'Rechazar Pago',
    subtitulo: `DNI: ${dni}`,
    icon: 'cancel',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    Mensaje: 'Indica el motivo del rechazo para notificar al usuario.',
    campos: `
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo del rechazo *</label>
        <textarea id="motivoRechazo" rows="3" placeholder="Ej: Comprobante ilegible, monto incorrecto..."
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white resize-none"></textarea>
      </div>
    `,
    btnTexto: 'Rechazar Pago',
    btnIcon: 'do_not_disturb',
    btnClass: 'bg-red-600 hover:bg-red-700',
    onConfirm: `ejecutarRechazo('${dni}')`
  });
}

async function ejecutarRechazo(dni) {
  const motivo = document.getElementById('motivoRechazo')?.value?.trim();
  
  if (!motivo) {
    document.getElementById('motivoRechazo').classList.add('border-red-500', 'ring-2', 'ring-red-200');
    document.getElementById('motivoRechazo').focus();
    return;
  }
  
  // Deshabilitar botón mientras procesa
  const btn = document.querySelector('#modalConfirmacionPago button[onclick*="ejecutar"]');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Procesando...';
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscripciones/${dni}/rechazar-pago`, {
      method: 'PUT',
      headers: getAuthHeadersInscripciones(),
      body: JSON.stringify({ motivo })
    });
    
    const data = await response.json();
    
    cerrarModalConfirmacion();
    
    if (data.success) {
      mostrarNotificacion('�o. Pago rechazado correctamente', 'success');
      cargarInscripciones();
    } else {
      mostrarNotificacion('Error: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    cerrarModalConfirmacion();
    mostrarNotificacion('Error de conexión', 'error');
  }
}

/**
 * Cargar estadísticas de inscripciones
 */
async function cargarEstadisticasInscripciones() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/estadisticas/inscripciones`, {
      headers: getAuthHeadersInscripciones()
    });
    const data = await response.json();
    
    if (data.success) {
      const stats = data.estadisticas;
      const container = document.getElementById('estadisticasInscripciones');
      
      const pendientes = stats.estados_pago.find(e => e.estado_pago === 'pendiente')?.cantidad || 0;
      const confirmados = stats.estados_pago.find(e => e.estado_pago === 'confirmado')?.cantidad || 0;
      
      container.innerHTML = `
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p class="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Usuarios</p>
          <p class="text-2xl font-bold text-blue-700 dark:text-blue-300">${stats.total_usuarios}</p>
        </div>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <p class="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Pagos Pendientes</p>
          <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-300">${pendientes}</p>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p class="text-xs text-green-600 dark:text-green-400 mb-1">Pagos Confirmados</p>
          <p class="text-2xl font-bold text-green-700 dark:text-green-300">${confirmados}</p>
        </div>
        <div class="bg-primary/10 rounded-lg p-4">
          <p class="text-xs text-primary mb-1">Ingresos Totales</p>
          <p class="text-2xl font-bold text-primary">S/ ${stats.ingresos_confirmados.toFixed(2)}</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
}

// ==================== REPORTES ====================

/**
 * Generar reporte de alumnos
 */
async function generarReporte() {
  const deporteId = document.getElementById('reporteDeporte').value;
  const dia = document.getElementById('reporteDia')?.value;
  const categoria = document.getElementById('reporteCategoria')?.value;
  
  try {
    const params = new URLSearchParams();
    if (deporteId) params.append('deporte_id', deporteId);
    if (dia) params.append('dia', dia);
    if (categoria) params.append('categoria', categoria);
    // Solo muestra inscripciones activas (alumnos con pago confirmado)
    params.append('estado', 'activa');
    
    const response = await fetch(`${API_BASE}/api/admin/reportes/alumnos?${params}`, {
      headers: getAuthHeadersInscripciones()
    });
    const data = await response.json();
    
    if (data.success) {
      reporteData = data.agrupado;
      renderizarReporte(data.agrupado, data.total_alumnos);
    } else {
      mostrarNotificacion('Error: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error de conexión', 'error');
  }
}

/**
 * Renderizar reporte
 */
function renderizarReporte(agrupado, totalAlumnos) {
  const container = document.getElementById('resultadosReporte');
  const sinResultados = document.getElementById('sinResultados');
  const botonesExportacion = document.getElementById('botonesExportacion');
  
  if (!agrupado || agrupado.length === 0) {
    ocultarelemento('resultadosReporte');
    ocultarelemento('botonesExportacion');
    mostrarelemento('sinResultados');
    return;
  }
  
  mostrarelemento('resultadosReporte');
  mostrarelemento('botonesExportacion');
  ocultarelemento('sinResultados');
  
  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-black dark:text-white">Resultados</h3>
        <span class="px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold">
          ${totalAlumnos} alumnos encontrados
        </span>
      </div>
      
      <div class="space-y-6">
        ${agrupado.map(grupo => `
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h4 class="font-bold text-black dark:text-white">${grupo.deporte} - ${grupo.dia} ${grupo.hora_inicio}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                ${grupo.categoria ? `Categoría: ${grupo.categoria}` : ''} 
                ${grupo.nivel ? `| Nivel: ${grupo.nivel}` : ''}
                | ${grupo.alumnos.length} alumnos
              </p>
            </div>
            <div class="p-4">
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-700">
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">#</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">DNI</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Nombres</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Apellidos</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Edad</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Sexo</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Teléfono</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Apoderado</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${grupo.alumnos.map((alumno, idx) => `
                      <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td class="py-2 px-3 text-sm">${idx + 1}</td>
                        <td class="py-2 px-3 text-sm font-medium">${alumno.dni}</td>
                        <td class="py-2 px-3 text-sm">${alumno.nombres}</td>
                        <td class="py-2 px-3 text-sm">${alumno.apellidos}</td>
                        <td class="py-2 px-3 text-sm">${alumno.edad}</td>
                        <td class="py-2 px-3 text-sm">${alumno.sexo}</td>
                        <td class="py-2 px-3 text-sm">${alumno.telefono || 'N/A'}</td>
                        <td class="py-2 px-3 text-sm">${alumno.apoderado || 'N/A'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Exportar a Excel
 */
function exportarExcel() {
  if (!reporteData || reporteData.length === 0) {
    mostrarNotificacion('No hay datos para exportar', 'error');
    return;
  }
  
  // Convertir datos a CSV con separador de punto y coma para mejor compatibilidad con Excel
  let csv = 'Deporte;Dia;Hora;Categoria;DNI;Nombres;Apellidos;Edad;Sexo;Telefono;Apoderado\n';
  
  reporteData.forEach(grupo => {
    grupo.alumnos.forEach(alumno => {
      const deporte = (grupo.deporte || '').replace(/;/g, ',');
      const dia = (grupo.dia || '').replace(/;/g, ',');
      const hora = (grupo.hora_inicio || '').replace(/;/g, ',');
      const categoria = (grupo.categoria || '').replace(/;/g, ',');
      const dni = (alumno.dni || '').toString().replace(/;/g, ',');
      const nombres = (alumno.nombres || '').replace(/;/g, ',');
      const apellidos = (alumno.apellidos || '').replace(/;/g, ',');
      const edad = (alumno.edad || '').toString().replace(/;/g, ',');
      const sexo = (alumno.sexo || '').replace(/;/g, ',');
      const telefono = (alumno.telefono || '').replace(/;/g, ',');
      const apoderado = (alumno.apoderado || '').replace(/;/g, ',');
      
      csv += `${deporte};${dia};${hora};${categoria};${dni};${nombres};${apellidos};${edad};${sexo};${telefono};${apoderado}\n`;
    });
  });
  
  // Descargar con BOM para UTF-8
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `reporte-alumnos-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  mostrarNotificacion('�o. Excel generado exitosamente', 'success');
}

/**
 * Exportar a PDF (usando window.print)
 */
function exportarPDF() {
  window.print();
}

/**
 * Imprimir reporte
 */
function imprimirReporte() {
  window.print();
}

/**
 * Formatear fecha
 */
function formatearFecha(fecha) {
  if (!fecha) return 'N/A';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// ==================== INICIALIZACI�"N ====================

// Cargar filtros de reportes
async function cargarFiltrosReportes() {
  try {
    // Cargar deportes
    const response = await fetch(`${API_BASE}/api/admin/deportes`, {
      headers: getAuthHeadersInscripciones()
    });
    const data = await response.json();
    
    if (data.success) {
      const select = document.getElementById('reporteDeporte');
      select.innerHTML = '<option value="">Todos los deportes</option>' +
        data.deportes.map(d => `<option value="${d.deporte_id}">${d.nombre}</option>`).join('');
    }
    
    // Cargar categorías
    const responseCat = await fetch(`${API_BASE}/api/admin/categorias`, {
      headers: getAuthHeadersInscripciones()
    });
    const dataCat = await responseCat.json();
    
    if (dataCat.success) {
      const select = document.getElementById('reporteCategoria');
      const categorias = [...new Set(dataCat.categorias.map(c => c.nombre))];
      select.innerHTML = '<option value="">Todas las categorías</option>' +
        categorias.map(c => `<option value="${c}">${c}</option>`).join('');
    }
  } catch (error) {
    console.error('Error al cargar filtros:', error);
  }
}

// ==================== FUNCIONES AUXILIARES ====================

function mostrarelemento(id) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.classList.remove('hidden');
}

function ocultarelemento(id) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.classList.add('hidden');
}

// ==================== ELIMINAR INSCRIPCIONES ====================

async function eliminarInscripcionesUsuario(dni, nombre) {
  if (!confirm(`¿Estás seguro de eliminar TODAS las inscripciones de ${nombre}?\n\nEsto liberará los cupos en todos los horarios donde esté inscrito.`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscripciones/${dni}`, {
      method: 'DELETE',
      headers: getAuthHeadersInscripciones()
    });
    
    const data = await response.json();
    
    if (data.success) {
      mostrarNotificacion(`�o" Inscripciones eliminadas: ${data.eliminadas} horarios liberados`, 'success');
      await cargarInscripciones();
      // Recargar horarios si estamos en la vista de calendario
      if (typeof cargarHorarios === 'function') {
        await cargarHorarios();
      }
    } else {
      mostrarNotificacion('Error: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error de conexión al eliminar inscripciones', 'error');
  }
}

function mostrarNotificacion(Mensaje, tipo = 'info') {
  const colores = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600'
  };
  
  const notif = document.createElement('div');
  notif.className = `fixed top-4 right-4 ${colores[tipo]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all`;
  notif.textContent = Mensaje;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}





