/**
 * Script para la página de éxito
 */

// Función auxiliar para esperar a que un elemento exista en el DOM
function waitForElementExito(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.getElementById(selector);
        if (element) {
            return resolve(element);
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const el = document.getElementById(selector);
            if (el) {
                obs.disconnect();
                resolve(el);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout esperando elemento: ${selector}`));
        }, timeout);
    });
}

// Ejecutar cuando el script se carga (React lo carga después del DOM)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cargarDatosExito();
    });
} else {
    // DOM ya está listo (caso de React)
    cargarDatosExito();
}

async function cargarDatosExito() {
    // Obtener código de operación de la URL
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get('codigo');
    
    if (!codigo) {
        // Intentar desde localStorage
        const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
        
        if (ultimaInscripcion && ultimaInscripcion.codigo) {
            renderizarExito(ultimaInscripcion.codigo, ultimaInscripcion);
        } else {
            Utils.mostrarNotificacion('No se encontró información de inscripción', 'error');
            window.location.href = 'index.html';
        }
    } else {
        // Código viene en URL
        const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
        
        // Verificar si los datos en localStorage coinciden con el código de la URL
        if (!ultimaInscripcion || ultimaInscripcion.codigo !== codigo) {
            // Si no hay datos o no coinciden, consultar al servidor
            console.log('🔍 Consultando datos de inscripción al servidor...');
            
            try {
                const datos = await academiaAPI.obtenerInscripcionPorCodigo(codigo);
                
                if (datos.success) {
                    console.log('✅ Datos obtenidos del servidor:', datos);
                    
                    // Guardar en localStorage para futuras recargas
                    LocalStorage.set('ultimaInscripcion', datos);
                    
                    renderizarExito(codigo, datos);
                } else {
                    throw new Error(datos.error || 'No se encontraron datos');
                }
            } catch (error) {
                console.error('❌ Error al consultar inscripción:', error);
                
                // Intentar crear datos mínimos con el código
                const datosMinimos = {
                    codigo: codigo,
                    fecha: new Date().toISOString(),
                    alumno: 'Información no disponible',
                    dni: 'N/A',
                    horarios: [],
                    matricula: { deportesNuevos: [], cantidad: 0, monto: 0 }
                };
                
                // Guardar datos mínimos en localStorage
                LocalStorage.set('ultimaInscripcion', datosMinimos);
                
                Utils.mostrarNotificacion('⚠️ No se pudieron cargar todos los datos. La subida de comprobante puede fallar.', 'warning');
                renderizarExito(codigo, datosMinimos);
            }
        } else {
            // Los datos coinciden, todo bien
            renderizarExito(codigo, ultimaInscripcion);
        }
    }
}

async function renderizarExito(codigo, datosInscripcion) {
    let container;
    try {
        container = await waitForElementExito('contenidoExito');
    } catch (err) {
        console.error('❌ No se encontró contenidoExito:', err);
        return;
    }
    
    container.innerHTML = `
        <div class="flex flex-col items-center text-center gap-6">
            <div class="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-primary shadow-sm border border-primary/20">
                <span class="material-symbols-outlined text-[56px]" style="font-variation-settings: 'wght' 600;">check</span>
            </div>
            <div class="space-y-2">
                <h1 class="text-text-main dark:text-white text-3xl md:text-5xl font-black leading-tight tracking-[-0.02em] uppercase">
                    ¡Inscripción Exitosa!
                </h1>
                <p class="text-text-main/70 dark:text-white/70 text-lg font-medium leading-normal max-w-md mx-auto">
                    Tu inscripción ha sido registrada correctamente. Revisa los detalles a continuación.
                </p>
            </div>
        </div>

        <div class="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-black/5">
            <div class="h-1.5 w-full bg-primary"></div>
            <div class="p-6 md:p-8 flex flex-col gap-6">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-xs font-bold text-primary uppercase tracking-widest mb-1.5">Código de Registro</p>
                        <h3 class="text-2xl font-black text-text-main dark:text-white tracking-tight uppercase font-mono">${codigo}</h3>
                    </div>
                    <div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined text-3xl">sports_soccer</span>
                    </div>
                </div>

                <div class="w-full h-px border-t border-dashed border-gray-300 dark:border-white/10"></div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                    ${datosInscripcion ? `
                    <div>
                        <p class="text-xs text-text-main/50 dark:text-white/50 mb-1 font-medium uppercase tracking-wider">Alumno</p>
                        <p class="text-base font-bold text-text-main dark:text-white">${datosInscripcion.alumno}</p>
                    </div>
                    <div class="md:text-right">
                        <p class="text-xs text-text-main/50 dark:text-white/50 mb-1 font-medium uppercase tracking-wider">DNI</p>
                        <p class="text-base font-bold text-text-main dark:text-white">${datosInscripcion.dni}</p>
                    </div>
                    ` : ''}
                    <div class="col-span-1 md:col-span-2">
                        <p class="text-xs text-text-main/50 dark:text-white/50 mb-1 font-medium uppercase tracking-wider">Fecha de Inscripción</p>
                        <p class="text-base font-bold text-text-main dark:text-white">${Utils.formatearFecha(new Date().toISOString().split('T')[0])}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- MONTO A PAGAR -->
        ${datosInscripcion && datosInscripcion.horarios ? `
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
                        <!-- Subtotal deportes ocultado: ya se muestra en el TOTAL A PAGAR
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-text-main/70 dark:text-white/70">Deportes (${datosInscripcion.horarios.length} ${datosInscripcion.horarios.length === 1 ? 'clase' : 'clases'}):</span>
                            <span class="font-bold text-text-main dark:text-white">S/. ${datosInscripcion.horarios.reduce((sum, h) => sum + parseFloat(h.precio || 0), 0).toFixed(2)}</span>
                        </div>
                        -->
                        ${datosInscripcion.matricula && datosInscripcion.matricula.monto > 0 ? `
                            <div class="flex items-center justify-between text-sm">
                                <span class="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-base">card_membership</span>
                                    Matrícula (${datosInscripcion.matricula.cantidad} ${datosInscripcion.matricula.cantidad === 1 ? 'deporte' : 'deportes'}):
                                </span>
                                <span class="font-bold text-amber-600 dark:text-amber-400">S/. ${datosInscripcion.matricula.monto.toFixed(2)}</span>
                            </div>
                            <div class="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                                Deportes nuevos: ${datosInscripcion.matricula.deportesNuevos.join(', ')}
                            </div>
                        ` : ''}
                        <div class="flex items-center justify-between pt-3 border-t-2 border-primary/30">
                            <p class="text-base text-text-main/70 dark:text-white/70 font-bold uppercase tracking-wide">Total</p>
                            <p class="text-4xl font-black text-primary">S/. ${(datosInscripcion.horarios.reduce((sum, h) => sum + parseFloat(h.precio || 0), 0) + (datosInscripcion.matricula ? datosInscripcion.matricula.monto : 0)).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}

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
                    <button onclick="toggleMetodoPago('plin')" class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all">
                        <div class="flex items-center gap-3">
                            <img src="assets/plinlogo.png" alt="Plin" class="h-8 object-contain bg-white rounded-lg px-2 py-1">
                            <div class="text-left">
                                <p class="text-white font-black text-lg">PLIN</p>
                                <p class="text-green-100 text-xs">Pago con QR Inmediato</p>
                            </div>
                        </div>
                        <span id="iconPlin" class="material-symbols-outlined text-white text-2xl transition-transform">expand_more</span>
                    </button>
                    
                    <!-- CONTENIDO PLIN (OCULTO POR DEFECTO) -->
                    <div id="contentPlin" class="hidden bg-gray-50 dark:bg-white/5 p-4 border-t border-green-200 dark:border-green-800 overflow-hidden transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0;">
                        <div class="flex flex-col gap-3">
                            <!-- BOTÓN QR -->
                            <button onclick="abrirModalQR('assets/plinqr.jpeg', 'Plin')" class="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group w-full">
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
                                <input type="file" id="inputCapturaPlin" accept="image/*" class="hidden" onchange="handleCapturaPago(event)">
                                <button onclick="document.getElementById('inputCapturaPlin').click()" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs transition-all">
                                    <span class="material-symbols-outlined text-base">add_photo_alternate</span>
                                    <span>Subir Comprobante</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ACORDEÓN: BBVA -->
                <div class="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                    <!-- HEADER BBVA -->
                    <button onclick="toggleMetodoPago('bbva')" class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all">
                        <div class="flex items-center gap-3">
                            <img src="assets/logo-bbva.jpg" alt="BBVA" class="h-8 object-contain bg-white rounded-lg px-2 py-1">
                            <div class="text-left">
                                <p class="text-white font-black text-lg">BBVA</p>
                                <p class="text-blue-100 text-xs">Transferencia Bancaria</p>
                            </div>
                        </div>
                        <span id="iconBbva" class="material-symbols-outlined text-white text-2xl transition-transform">expand_more</span>
                    </button>
                    
                    <!-- CONTENIDO BBVA (OCULTO POR DEFECTO) -->
                    <div id="contentBbva" class="hidden bg-gray-50 dark:bg-white/5 p-4 border-t border-blue-200 dark:border-blue-800 overflow-hidden transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0;">
                        <div class="space-y-3">
                        <div class="space-y-3">
                            <!-- Cuenta BBVA -->
                            <div class="bg-white dark:bg-white/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                <p class="text-[10px] text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase">Cuenta Ahorros</p>
                                <div class="flex items-center justify-between gap-2">
                                    <p class="text-base font-black text-gray-900 dark:text-white font-mono">001108140277791167</p>
                                    <button onclick="copiarCuenta('001108140277791167', event)" class="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-all flex-shrink-0">
                                        <span class="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- CCI BBVA -->
                            <div class="bg-white dark:bg-white/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                <p class="text-[10px] text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase">CCI</p>
                                <div class="flex items-center justify-between gap-2">
                                    <p class="text-base font-black text-gray-900 dark:text-white font-mono">01181400027779116714</p>
                                    <button onclick="copiarCuenta('01181400027779116714', event)" class="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-all flex-shrink-0">
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
                                    <input type="file" id="inputComprobanteBBVA" accept="image/*" class="hidden" onchange="handleComprobanteBanco(event, 'BBVA')">
                                    <button onclick="document.getElementById('inputComprobanteBBVA').click()" class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-all">
                                        <span class="material-symbols-outlined text-base">add_photo_alternate</span>
                                        <span>Subir Comprobante</span>
                                    </button>
                                    <div id="previewBBVA" class="hidden mt-2 bg-white/90 dark:bg-white/10 rounded-lg p-2">
                                        <div class="flex items-center justify-between mb-1">
                                            <p class="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                                                <span class="material-symbols-outlined text-xs">check_circle</span>
                                                Adjunto
                                            </p>
                                            <button onclick="eliminarComprobanteBanco('BBVA')" class="text-red-600 hover:text-red-700">
                                                <span class="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                        <img id="imagenPreviewBBVA" src="" alt="Preview" class="w-full max-h-20 object-contain rounded">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ACORDEÓN: BCP -->
                <div class="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                    <!-- HEADER BCP -->
                    <button onclick="toggleMetodoPago('bcp')" class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 transition-all">
                        <div class="flex items-center gap-3">
                            <img src="assets/logo-bcp.jpg" alt="BCP" class="h-8 object-contain bg-white rounded-lg px-2 py-1">
                            <div class="text-left">
                                <p class="text-white font-black text-lg">BCP</p>
                                <p class="text-orange-100 text-xs">Transferencia Bancaria</p>
                            </div>
                        </div>
                        <span id="iconBcp" class="material-symbols-outlined text-white text-2xl transition-transform">expand_more</span>
                    </button>
                    
                    <!-- CONTENIDO BCP (OCULTO POR DEFECTO) -->
                    <div id="contentBcp" class="hidden bg-gray-50 dark:bg-white/5 p-4 border-t border-red-200 dark:border-red-800 overflow-hidden transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0;">
                        <div class="space-y-3">
                            <!-- Cuenta BCP -->
                            <div class="bg-white dark:bg-white/10 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                <p class="text-[10px] text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase">Cuenta Ahorros</p>
                                <div class="flex items-center justify-between gap-2">
                                    <p class="text-base font-black text-gray-900 dark:text-white font-mono">19407824258089</p>
                                    <button onclick="copiarCuenta('19407824258089', event)" class="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-all flex-shrink-0">
                                        <span class="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- CCI BCP -->
                            <div class="bg-white dark:bg-white/10 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                <p class="text-[10px] text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase">CCI</p>
                                <div class="flex items-center justify-between gap-2">
                                    <p class="text-base font-black text-gray-900 dark:text-white font-mono">00219410782425808997</p>
                                    <button onclick="copiarCuenta('00219410782425808997', event)" class="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-all flex-shrink-0">
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
                                    <input type="file" id="inputComprobanteBCP" accept="image/*" class="hidden" onchange="handleComprobanteBanco(event, 'BCP')">
                                    <button onclick="document.getElementById('inputComprobanteBCP').click()" class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-all">
                                        <span class="material-symbols-outlined text-base">add_photo_alternate</span>
                                        <span>Subir Comprobante</span>
                                    </button>
                                    <div id="previewBCP" class="hidden mt-2 bg-white/90 dark:bg-white/10 rounded-lg p-2">
                                        <div class="flex items-center justify-between mb-1">
                                            <p class="text-[10px] font-bold text-red-600 flex items-center gap-1">
                                                <span class="material-symbols-outlined text-xs">check_circle</span>
                                                Adjunto
                                            </p>
                                            <button onclick="eliminarComprobanteBanco('BCP')" class="text-red-600 hover:text-red-700">
                                                <span class="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                        <img id="imagenPreviewBCP" src="" alt="Preview" class="w-full max-h-20 object-contain rounded">
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
                
                <!-- Aviso Pago en Efectivo -->
                <div class="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3">
                    <div class="flex items-start gap-2">
                        <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg mt-0.5">payments</span>
                        <div class="flex-1">
                            <p class="text-xs font-bold text-amber-900 dark:text-amber-200 mb-1"><span class="material-symbols-outlined text-xs align-middle">payments</span> Pago en Efectivo:</p>
                            <p class="text-xs text-amber-800 dark:text-amber-300">
                                Deberás acercarte a <strong>Jaguares</strong> para realizar el pago presencial. 
                                Las clases NO se activarán hasta confirmar el pago.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- BOTONES DE ACCIÓN CENTRADOS -->
        <div class="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
            <button onclick="descargarComprobante()" class="w-full flex items-center justify-center rounded-xl h-14 px-6 bg-black hover:bg-gray-900 text-primary text-base font-bold uppercase tracking-wide transition-all shadow-lg shadow-black/20 hover:shadow-black/40 hover:-translate-y-0.5 group border border-primary/30">
                <span class="material-symbols-outlined mr-2 group-hover:animate-bounce">download</span>
                Descargar Comprobante
            </button>

            <button onclick="consultarEstado()" class="w-full flex items-center justify-center rounded-xl h-14 px-6 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 text-text-main dark:text-white text-base font-bold uppercase tracking-wide transition-all hover:-translate-y-0.5">
                <span class="material-symbols-outlined mr-2">badge</span>
                Consultar Estado de Inscripción
            </button>

            <button onclick="volverAlInicio()" class="w-full flex items-center justify-center rounded-xl h-14 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-text-main dark:text-white text-base font-bold uppercase tracking-wide transition-all hover:-translate-y-0.5">
                <span class="material-symbols-outlined mr-2">home</span>
                Volver al Inicio
            </button>
        </div>

        <!-- MODAL PARA VER QR GRANDE -->
        <div id="modalQR" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onclick="cerrarModalQR()">
            <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl max-h-[95vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="flex items-center justify-between mb-4 sm:mb-6">
                    <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div id="modalIcono" class="size-10 sm:size-12 rounded-xl flex items-center justify-center flex-shrink-0"></div>
                        <div class="min-w-0 flex-1">
                            <h3 id="modalTitulo" class="text-lg sm:text-2xl font-black text-text-main dark:text-white truncate">QR de Pago</h3>
                            <p class="text-xs text-text-main/60 dark:text-white/60 font-medium">Escanea para pagar</p>
                        </div>
                    </div>
                    <button onclick="cerrarModalQR()" class="size-9 sm:size-10 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0 ml-2">
                        <span class="material-symbols-outlined text-gray-600 dark:text-white text-xl">close</span>
                    </button>
                </div>
                
                <div class="flex flex-col items-center gap-3 sm:gap-4">
                    <!-- QR CODE -->
                    <div class="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg w-full flex items-center justify-center border-2" id="modalBorder">
                        <img id="modalImagen" src="" alt="QR" class="w-full max-w-[280px] sm:max-w-sm object-contain rounded-lg">
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
                        <input type="file" id="inputCapturaPago" accept="image/*" class="hidden" onchange="handleCapturaPago(event)">
                        
                        <!-- Botón para subir captura -->
                        <button id="btnSubirCaptura" onclick="document.getElementById('inputCapturaPago').click()" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:scale-[1.02]">
                            <span class="material-symbols-outlined text-xl">add_photo_alternate</span>
                            <span>Subir Captura de Pago</span>
                        </button>
                        
                        <!-- Preview de la imagen subida -->
                        <div id="previewCaptura" class="hidden mt-3 bg-white dark:bg-white/5 rounded-xl p-3 border border-gray-200 dark:border-white/10">
                            <div class="flex items-center justify-between mb-2">
                                <p class="text-xs font-bold text-text-main dark:text-white flex items-center gap-1">
                                    <span class="material-symbols-outlined text-green-600 text-base">check_circle</span>
                                    Captura cargada
                                </p>
                                <button onclick="eliminarCaptura()" class="text-red-600 hover:text-red-700 text-xs font-bold">
                                    <span class="material-symbols-outlined text-base">delete</span>
                                </button>
                            </div>
                            <img id="imagenPreview" src="" alt="Preview" class="w-full max-h-40 object-contain rounded-lg">
                            <p class="text-[10px] text-text-main/50 dark:text-white/50 mt-2 text-center" id="nombreArchivo"></p>
                        </div>
                    </div>

                    <!-- BOTONES -->
                    <div class="grid grid-cols-2 gap-2 sm:gap-3 w-full">
                        <button id="modalDescargar" onclick="" class="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary-dark text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg hover:scale-[1.02]">
                            <span class="material-symbols-outlined text-lg sm:text-xl">download</span>
                            <span class="hidden xs:inline">Descargar</span>
                            <span class="xs:hidden">QR</span>
                        </button>
                        <button onclick="cerrarModalQR()" class="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.02]">
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

async function descargarComprobante() {
    const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
    
    if (!ultimaInscripcion) {
        Utils.mostrarNotificacion('No se encontró información de inscripción', 'error');
        return;
    }
    
    try {
        // Importar jsPDF dinámicamente
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Calcular totales
        let totalDeportes = 0;
        if (ultimaInscripcion.horarios && ultimaInscripcion.horarios.length > 0) {
            totalDeportes = ultimaInscripcion.horarios.reduce((sum, h) => sum + parseFloat(h.precio || 0), 0);
        }
        
        let montoMatricula = 0;
        if (ultimaInscripcion.matricula && ultimaInscripcion.matricula.monto > 0) {
            montoMatricula = ultimaInscripcion.matricula.monto;
        }
        
        const total = totalDeportes + montoMatricula;
        
        // Configuración de colores
        const colorPrimary = [255, 193, 7]; // Dorado
        const colorNegro = [0, 0, 0];
        const colorGris = [100, 100, 100];
        
        // ENCABEZADO
        doc.setFillColor(...colorPrimary);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(...colorNegro);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('JAGUARES', 105, 15, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Centro de Alto Rendimiento Deportivo', 105, 22, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('COMPROBANTE DE INSCRIPCIÓN', 105, 32, { align: 'center' });
        
        // DATOS PRINCIPALES
        let y = 50;
        doc.setTextColor(...colorNegro);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Código:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(ultimaInscripcion.codigo, 60, y);
        
        y += 7;
        doc.setFont(undefined, 'bold');
        doc.text('Fecha:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(Utils.formatearFecha(new Date().toISOString().split('T')[0]), 60, y);
        
        y += 7;
        doc.setFont(undefined, 'bold');
        doc.text('Alumno:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(ultimaInscripcion.alumno, 60, y);
        
        y += 7;
        doc.setFont(undefined, 'bold');
        doc.text('DNI:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(ultimaInscripcion.dni, 60, y);
        
        // LÍNEA SEPARADORA
        y += 10;
        doc.setDrawColor(...colorGris);
        doc.line(20, y, 190, y);
        
        // HORARIOS SELECCIONADOS - Agrupados por deporte
        y += 10;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('HORARIOS SELECCIONADOS', 20, y);
        
        y += 7;
        doc.setFontSize(9);
        if (ultimaInscripcion.horarios && ultimaInscripcion.horarios.length > 0) {
            // Agrupar horarios por deporte
            const deportesAgrupados = {};
            ultimaInscripcion.horarios.forEach(horario => {
                const key = horario.deporte;
                if (!deportesAgrupados[key]) {
                    deportesAgrupados[key] = {
                        deporte: horario.deporte,
                        plan: horario.plan,
                        horarios: [],
                        precioTotal: 0
                    };
                }
                deportesAgrupados[key].horarios.push({
                    dia: horario.dia,
                    hora_inicio: horario.hora_inicio,
                    precio: parseFloat(horario.precio || 0)
                });
                deportesAgrupados[key].precioTotal += parseFloat(horario.precio || 0);
            });
            
            // Mostrar cada deporte con sus días y precio total
            let deporteIndex = 1;
            Object.values(deportesAgrupados).forEach(grupo => {
                // Ordenar días de la semana
                const ordenDias = ['LUNES', 'MARTES', 'MIÉRCOLES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'SABADO', 'DOMINGO'];
                grupo.horarios.sort((a, b) => ordenDias.indexOf(a.dia.toUpperCase()) - ordenDias.indexOf(b.dia.toUpperCase()));
                
                // Crear texto de días con horarios
                const diasTexto = grupo.horarios.map(h => `${h.dia} ${h.hora_inicio}`).join(', ');
                
                doc.setFont(undefined, 'bold');
                doc.text(`${deporteIndex}. ${grupo.deporte}`, 25, y);
                doc.text(`S/. ${grupo.precioTotal.toFixed(2)}`, 160, y, { align: 'right' });
                y += 5;
                
                // Mostrar días en línea siguiente con formato más compacto
                doc.setFont(undefined, 'normal');
                doc.setTextColor(100, 100, 100);
                doc.setFontSize(8);
                doc.text(`   ${diasTexto}`, 25, y);
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(9);
                y += 7;
                
                deporteIndex++;
            });
        }
        
        // MATRÍCULA (si existe)
        if (montoMatricula > 0) {
            y += 3;
            doc.setFont(undefined, 'bold');
            doc.text(`Matrícula (${ultimaInscripcion.matricula.cantidad} ${ultimaInscripcion.matricula.cantidad === 1 ? 'deporte' : 'deportes'}):`, 25, y);
            doc.text(`S/. ${montoMatricula.toFixed(2)}`, 160, y, { align: 'right' });
            y += 5;
            doc.setFontSize(8);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(...colorGris);
            doc.text(`Deportes nuevos: ${ultimaInscripcion.matricula.deportesNuevos.join(', ')}`, 25, y);
            doc.setTextColor(...colorNegro);
            doc.setFontSize(9);
        }
        
        // LÍNEA SEPARADORA
        y += 8;
        doc.line(20, y, 190, y);
        
        // TOTALES
        y += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        // Subtotal deportes ocultado: ya se muestra en el TOTAL A PAGAR
        // doc.text('Deportes:', 25, y);
        // doc.text(`S/. ${totalDeportes.toFixed(2)}`, 160, y, { align: 'right' });
        
        if (montoMatricula > 0) {
            y += 6;
            doc.text('Matrícula:', 25, y);
            doc.text(`S/. ${montoMatricula.toFixed(2)}`, 160, y, { align: 'right' });
        }
        
        // TOTAL DESTACADO
        y += 10;
        doc.setFillColor(240, 240, 240);
        doc.rect(20, y - 5, 170, 10, 'F');
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('TOTAL A PAGAR:', 25, y);
        doc.setTextColor(...colorPrimary);
        doc.text(`S/. ${total.toFixed(2)}`, 160, y, { align: 'right' });
        doc.setTextColor(...colorNegro);
        
        // ESTADO
        y += 15;
        doc.setFillColor(255, 243, 205);
        doc.rect(20, y - 5, 170, 12, 'F');
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Estado:', 25, y);
        doc.setTextColor(200, 100, 0);
        doc.text('PENDIENTE DE PAGO', 70, y);
        doc.setTextColor(...colorNegro);
        
        // IMPORTANTE
        y += 15;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('IMPORTANTE:', 20, y);
        
        y += 7;
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text('Para activar tu inscripción, debes:', 20, y);
        
        y += 6;
        doc.text('1. Realizar el pago correspondiente', 25, y);
        
        y += 6;
        doc.text('2. El estado aparecerá como PENDIENTE hasta que el administrador confirme el pago', 25, y);
        
        // CONTACTO
        y += 12;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Contacto: +51 973 324 460', 105, y, { align: 'center' });
        
        // PIE DE PÁGINA
        doc.setFillColor(...colorPrimary);
        doc.rect(0, 277, 210, 20, 'F');
        doc.setTextColor(...colorNegro);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('¡Gracias por confiar en JAGUARES!', 105, 287, { align: 'center' });
        
        // Descargar PDF
        doc.save(`JAGUARES-${ultimaInscripcion.codigo}.pdf`);
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        Utils.mostrarNotificacion('Error al generar el PDF. Por favor, intenta nuevamente.', 'error');
    }
}

// FUNCIÓN COMENTADA - Cliente no requiere WhatsApp automático (comprobante se guarda en Drive)
// Se mantiene el código por si se necesita reactivar en el futuro
/*
function enviarWhatsApp() {
    const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
    
    if (!ultimaInscripcion) {
        Utils.mostrarNotificacion('No se encontró información de inscripción', 'error');
        return;
    }
    
    // Construir lista de horarios
    let horariosTexto = '';
    let totalDeportes = 0;
    if (ultimaInscripcion.horarios && ultimaInscripcion.horarios.length > 0) {
        horariosTexto = '\n⚽ *Clases Seleccionadas:*\n';
        ultimaInscripcion.horarios.forEach((horario, index) => {
            horariosTexto += `${index + 1}. ${horario.deporte} - ${horario.dia} ${horario.hora_inicio}hs\n`;
            totalDeportes += parseFloat(horario.precio || 0);
        });
    }
    
    // Agregar matrícula si existe
    let matriculaTexto = '';
    let montoMatricula = 0;
    if (ultimaInscripcion.matricula && ultimaInscripcion.matricula.monto > 0) {
        montoMatricula = ultimaInscripcion.matricula.monto;
        matriculaTexto = `\n🎓 *Matrícula:* S/. ${montoMatricula.toFixed(2)}\n(${ultimaInscripcion.matricula.deportesNuevos.join(', ')})\n`;
    }
    
    const total = totalDeportes + montoMatricula;
        horariosTexto +
        matriculaTexto +
        `\n💰 *Total a Pagar:* S/. ${total.toFixed(2)}\n` +
        `${montoMatricula > 0 ? `(Deportes: S/. ${totalDeportes.toFixed(2)} + Matrícula: S/. ${montoMatricula.toFixed(2)})\n` : ''}\n` +
        `Hola, he completado mi inscripción y estoy listo para enviar mi comprobante de pago.`;
    
    const url = `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(Mensaje)}`;
    window.open(url, '_blank');
}
*/

function consultarEstado() {
    const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
    
    if (ultimaInscripcion && ultimaInscripcion.dni) {
        window.location.href = `consulta.html?dni=${ultimaInscripcion.dni}`;
    } else {
        const dni = prompt('Ingrese su DNI para consultar:');
        if (dni && Utils.validarDNI(dni)) {
            window.location.href = `consulta.html?dni=${dni}`;
        }
    }
}

function copiarNumero(event) {
    const numero = '973324460'; // Sin espacios para copiar
    
    navigator.clipboard.writeText(numero).then(() => {
        Utils.mostrarNotificacion('Número copiado: 973 324 460', 'success');
        
        // Cambiar temporalmente el texto del botón si existe el evento
        if (event) {
            const btn = event.target.closest('button');
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<span class="material-symbols-outlined text-xl">check</span> Copiado';
                btn.classList.add('bg-green-600');
                btn.classList.remove('bg-primary');
                
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.classList.remove('bg-green-600');
                    btn.classList.add('bg-primary');
                }, 2000);
            }
        }
    }).catch(err => {
        console.error('Error al copiar:', err);
        Utils.mostrarNotificacion('No se pudo copiar. Usa: 973 324 460', 'warning');
    });
}

/**
 * Copiar número de cuenta bancaria
 */
function copiarCuenta(numeroCuenta, event) {
    navigator.clipboard.writeText(numeroCuenta).then(() => {
        Utils.mostrarNotificacion(`Cuenta copiada: ${numeroCuenta}`, 'success');
        
        // Cambiar temporalmente el texto del botón
        if (event) {
            const btn = event.target.closest('button');
            if (btn) {
                const originalHTML = btn.innerHTML;
                const colorOriginal = btn.className;
                
                btn.innerHTML = '<span class="material-symbols-outlined text-base">check</span> <span>Copiado</span>';
                btn.classList.remove('bg-blue-600', 'hover:bg-blue-700', 'bg-red-600', 'hover:bg-red-700');
                btn.classList.add('bg-green-600', 'hover:bg-green-700');
                
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.className = colorOriginal;
                }, 2000);
            }
        }
    }).catch(err => {
        console.error('Error al copiar cuenta:', err);
        Utils.mostrarNotificacion('No se pudo copiar. Intenta manualmente', 'warning');
    });
}

// FUNCIÓN COMENTADA - Cliente no requiere WhatsApp automático para efectivo
// Se mantiene el código por si se necesita reactivar en el futuro
/*
function contactarWhatsAppEfectivo() {
    const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
    
    if (!ultimaInscripcion) {
        Utils.mostrarNotificacion('No se encontró información de inscripción', 'error');
        return;
    }
    
    // Construir lista de horarios
    let horariosTexto = '';
    let totalDeportes = 0;
    if (ultimaInscripcion.horarios && ultimaInscripcion.horarios.length > 0) {
        horariosTexto = '\n⚽ *Clases Seleccionadas:*\n';
        ultimaInscripcion.horarios.forEach((horario, index) => {
            horariosTexto += `${index + 1}. ${horario.deporte} - ${horario.dia} ${horario.hora_inicio}hs\n`;
            totalDeportes += parseFloat(horario.precio || 0);
        });
    }
    
    // Agregar matrícula si existe
    let matriculaTexto = '';
    let montoMatricula = 0;
    if (ultimaInscripcion.matricula && ultimaInscripcion.matricula.monto > 0) {
        montoMatricula = ultimaInscripcion.matricula.monto;
        matriculaTexto = `\n🎓 *Matrícula:* S/. ${montoMatricula.toFixed(2)}\n(${ultimaInscripcion.matricula.deportesNuevos.join(', ')})\n`;
    }
    
    const total = totalDeportes + montoMatricula;
    
    const whatsappNumero = '51997621348';
    const Mensaje = `🐆 *JAGUARES - Pago en Efectivo*\n\n` +
        `📋 *Código:* ${ultimaInscripcion.codigo}\n\n` +
        `👤 *Alumno:* ${ultimaInscripcion.alumno}\n` +
        `DNI: ${ultimaInscripcion.dni}` +
        horariosTexto +
        matriculaTexto +
        `\n💵 *Total a Pagar en Efectivo:* S/. ${total.toFixed(2)}\n` +
        `${montoMatricula > 0 ? `(Deportes: S/. ${totalDeportes.toFixed(2)} + Matrícula: S/. ${montoMatricula.toFixed(2)})\n` : ''}\n` +
        `Hola, quiero coordinar un pago en efectivo para mi inscripción. ¿Cuándo puedo acercarme a realizar el pago?`;
    
    const url = `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(Mensaje)}`;
    window.open(url, '_blank');
}
*/

function abrirModalQR(urlImagen, tipo) {
    const modal = document.getElementById('modalQR');
    const imagen = document.getElementById('modalImagen');
    const titulo = document.getElementById('modalTitulo');
    const icono = document.getElementById('modalIcono');
    const border = document.getElementById('modalBorder');
    const btnDescargar = document.getElementById('modalDescargar');
    
    // Configurar contenido
    imagen.src = urlImagen;
    titulo.textContent = `Pagar con ${tipo}`;
    btnDescargar.onclick = () => descargarQR(urlImagen, `QR-${tipo}.jpg`);
    
    // Configurar colores según el tipo
    if (tipo === 'Yape') {
        icono.innerHTML = '<span class="material-symbols-outlined text-purple-600 text-3xl sm:text-4xl">account_balance_wallet</span>';
        icono.style.backgroundColor = '#f3e8ff';
        border.style.borderColor = '#a855f7';
    } else if (tipo === 'Plin') {
        icono.innerHTML = '<span class="material-symbols-outlined text-green-600 text-3xl sm:text-4xl">account_balance_wallet</span>';
        icono.style.backgroundColor = '#dcfce7';
        border.style.borderColor = '#22c55e';
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cerrarModalQR() {
    const modal = document.getElementById('modalQR');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function descargarQR(urlImagen, nombreArchivo) {
    fetch(urlImagen)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nombreArchivo;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            Utils.mostrarNotificacion(`QR descargado: ${nombreArchivo}`, 'success');
        })
        .catch(err => {
            console.error('Error al descargar QR:', err);
            Utils.mostrarNotificacion('Error al descargar el QR', 'error');
        });
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cerrarModalQR();
    }
});

// Variable global para almacenar la captura
let capturaSeleccionada = null;

/**
 * Manejar la selección de archivo de captura
 */
function handleCapturaPago(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
        Utils.mostrarNotificacion('Por favor selecciona una imagen válida', 'error');
        return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        Utils.mostrarNotificacion('La imagen no debe superar 5MB', 'error');
        return;
    }
    
    // Leer archivo y convertir a Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        capturaSeleccionada = {
            nombre: file.name,
            tipo: file.type,
            base64: e.target.result
        };
        
        mostrarPreviewCaptura(e.target.result, file.name);
        
        // Intentar subir automáticamente
        subirCapturaAlServidor();
    };
    
    reader.onerror = function() {
        Utils.mostrarNotificacion('Error al leer la imagen', 'error');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Mostrar preview de la captura seleccionada
 */
function mostrarPreviewCaptura(base64, nombreArchivo) {
    const preview = document.getElementById('previewCaptura');
    const imagen = document.getElementById('imagenPreview');
    const nombre = document.getElementById('nombreArchivo');
    const btnSubir = document.getElementById('btnSubirCaptura');
    
    if (preview && imagen && nombre) {
        imagen.src = base64;
        nombre.textContent = nombreArchivo;
        preview.classList.remove('hidden');
        
        // Cambiar texto del botón
        btnSubir.innerHTML = `
            <span class="material-symbols-outlined text-xl">check_circle</span>
            <span>Captura Agregada</span>
        `;
        btnSubir.classList.remove('from-blue-600', 'to-blue-700');
        btnSubir.classList.add('from-green-600', 'to-green-700');
    }
}

/**
 * Eliminar captura seleccionada
 */
function eliminarCaptura() {
    capturaSeleccionada = null;
    
    const preview = document.getElementById('previewCaptura');
    const input = document.getElementById('inputCapturaPago');
    const btnSubir = document.getElementById('btnSubirCaptura');
    
    if (preview) preview.classList.add('hidden');
    if (input) input.value = '';
    
    // Restaurar botón original
    if (btnSubir) {
        btnSubir.innerHTML = `
            <span class="material-symbols-outlined text-xl">add_photo_alternate</span>
            <span>Subir Captura de Pago</span>
        `;
        btnSubir.classList.remove('from-green-600', 'to-green-700');
        btnSubir.classList.add('from-blue-600', 'to-blue-700');
    }
}

/**
 * Subir captura al servidor (Google Drive vía Apps Script)
 */
async function subirCapturaAlServidor() {
    if (!capturaSeleccionada) return;
    
    const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
    
    // Validación completa de datos
    if (!ultimaInscripcion || !ultimaInscripcion.codigo) {
        Utils.mostrarNotificacion('No se encontró información de inscripción', 'error');
        return;
    }
    
    // Validar que el código no sea undefined o inválido
    if (ultimaInscripcion.codigo === 'N/A' || !ultimaInscripcion.codigo || ultimaInscripcion.codigo === 'undefined') {
        Utils.mostrarNotificacion('⚠️ Código de operación inválido. Por favor, regresa a la página de confirmación.', 'error');
        console.error('Código inválido:', ultimaInscripcion.codigo);
        return;
    }
    
    // Validar que el DNI no sea N/A
    if (ultimaInscripcion.dni === 'N/A' || !ultimaInscripcion.dni || ultimaInscripcion.dni === 'undefined') {
        Utils.mostrarNotificacion('⚠️ DNI no disponible. Por favor, regresa a la página de confirmación.', 'error');
        console.error('DNI inválido:', ultimaInscripcion.dni);
        return;
    }
    
    console.log('📋 Datos de inscripción para subir captura:', {
        codigo: ultimaInscripcion.codigo,
        dni: ultimaInscripcion.dni,
        alumno: ultimaInscripcion.alumno
    });
    
    try {
        // Mostrar loader modal
        mostrarLoaderSubida();
        
        // También actualizar botón
        const btnSubir = document.getElementById('btnSubirCaptura');
        if (btnSubir) {
            const textoOriginal = btnSubir.innerHTML;
            btnSubir.disabled = true;
            btnSubir.innerHTML = `
                <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Subiendo...</span>
            `;
        }
        
        // Enviar al servidor
        const resultado = await academiaAPI.subirComprobante({
            codigo_operacion: ultimaInscripcion.codigo,
            dni: ultimaInscripcion.dni,
            alumno: ultimaInscripcion.alumno,
            imagen: capturaSeleccionada.base64,
            nombre_archivo: capturaSeleccionada.nombre
        });
        
        if (resultado.success) {
            // Mostrar modal de éxito grande
            mostrarModalExitoComprobante();
            
            // Actualizar botón con éxito
            btnSubir.innerHTML = `
                <span class="material-symbols-outlined text-xl">cloud_done</span>
                <span>Comprobante Guardado</span>
            `;
            btnSubir.classList.remove('from-blue-600', 'to-blue-700', 'from-green-600', 'to-green-700');
            btnSubir.classList.add('from-emerald-600', 'to-emerald-700');
        } else {
            throw new Error(resultado.error || 'Error al subir comprobante');
        }
        
    } catch (error) {
        cerrarLoaderSubida();
        console.error('Error al subir captura:', error);
        Utils.mostrarNotificacion(`Error: ${error.message}`, 'error');
        
        // Restaurar botón
        const btnSubir = document.getElementById('btnSubirCaptura');
        btnSubir.disabled = false;
        btnSubir.innerHTML = `
            <span class="material-symbols-outlined text-xl">check_circle</span>
            <span>Captura Agregada</span>
        `;
    }
}

// Variables globales para almacenar comprobantes de bancos
let comprobanteBBVA = null;
let comprobanteBCP = null;

/**
 * Manejar la selección de comprobante bancario
 */
function handleComprobanteBanco(event, banco) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
        Utils.mostrarNotificacion('Por favor selecciona una imagen válida', 'error');
        return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        Utils.mostrarNotificacion('La imagen no debe superar 5MB', 'error');
        return;
    }
    
    // Leer archivo y convertir a Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const comprobante = {
            nombre: file.name,
            tipo: file.type,
            base64: e.target.result,
            banco: banco
        };
        
        // Guardar según el banco
        if (banco === 'BBVA') {
            comprobanteBBVA = comprobante;
        } else if (banco === 'BCP') {
            comprobanteBCP = comprobante;
        }
        
        mostrarPreviewComprobanteBanco(e.target.result, banco);
        
        // Intentar subir automáticamente
        subirComprobanteBancoAlServidor(comprobante);
    };
    
    reader.onerror = function() {
        Utils.mostrarNotificacion('Error al leer la imagen', 'error');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Mostrar preview del comprobante bancario
 */
function mostrarPreviewComprobanteBanco(base64, banco) {
    const previewId = `preview${banco}`;
    const imagenId = `imagenPreview${banco}`;
    
    const preview = document.getElementById(previewId);
    const imagen = document.getElementById(imagenId);
    
    if (preview && imagen) {
        imagen.src = base64;
        preview.classList.remove('hidden');
        
        Utils.mostrarNotificacion(`Comprobante ${banco} agregado`, 'success');
    }
}

/**
 * Eliminar comprobante bancario
 */
function eliminarComprobanteBanco(banco) {
    const previewId = `preview${banco}`;
    const inputId = `inputComprobante${banco}`;
    
    const preview = document.getElementById(previewId);
    const input = document.getElementById(inputId);
    
    if (preview) preview.classList.add('hidden');
    if (input) input.value = '';
    
    // Limpiar variable global
    if (banco === 'BBVA') {
        comprobanteBBVA = null;
    } else if (banco === 'BCP') {
        comprobanteBCP = null;
    }
    
    Utils.mostrarNotificacion(`Comprobante ${banco} eliminado`, 'info');
}

/**
 * Subir comprobante bancario al servidor
 */
async function subirComprobanteBancoAlServidor(comprobante) {
    const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
    
    // Validación completa de datos
    if (!ultimaInscripcion || !ultimaInscripcion.codigo) {
        Utils.mostrarNotificacion('No se encontró información de inscripción', 'error');
        return;
    }
    
    // Validar que el código no sea undefined o inválido
    if (ultimaInscripcion.codigo === 'N/A' || !ultimaInscripcion.codigo || ultimaInscripcion.codigo === 'undefined') {
        Utils.mostrarNotificacion('⚠️ Código de operación inválido. Por favor, regresa a la página de confirmación.', 'error');
        console.error('Código inválido:', ultimaInscripcion.codigo);
        return;
    }
    
    // Validar que el DNI no sea N/A
    if (ultimaInscripcion.dni === 'N/A' || !ultimaInscripcion.dni || ultimaInscripcion.dni === 'undefined') {
        Utils.mostrarNotificacion('⚠️ DNI no disponible. Por favor, regresa a la página de confirmación.', 'error');
        console.error('DNI inválido:', ultimaInscripcion.dni);
        return;
    }
    
    console.log('📋 Datos de inscripción para subir comprobante:', {
        codigo: ultimaInscripcion.codigo,
        dni: ultimaInscripcion.dni,
        alumno: ultimaInscripcion.alumno
    });
    
    try {
        // Mostrar loading
        Utils.mostrarNotificacion(`Subiendo comprobante ${comprobante.banco}...`, 'info');
        
        // Enviar al servidor
        const resultado = await academiaAPI.subirComprobante({
            codigo_operacion: ultimaInscripcion.codigo,
            dni: ultimaInscripcion.dni,
            alumno: ultimaInscripcion.alumno || 'Sin nombre',
            imagen: comprobante.base64,
            nombre_archivo: `${comprobante.banco}_${comprobante.nombre}`,
            metodo_pago: `Transferencia ${comprobante.banco}`
        });
        
        if (resultado.success) {
            // Mostrar modal de éxito grande
            mostrarModalExitoComprobante();
        } else {
            throw new Error(resultado.error || 'Error al subir comprobante');
        }
        
    } catch (error) {
        console.error('Error al subir comprobante bancario:', error);
        Utils.mostrarNotificacion(`Error al subir comprobante ${comprobante.banco}: ${error.message}`, 'error');
    }
}

/**
 * Mostrar modal de éxito después de subir comprobante
 */
function mostrarModalExitoComprobante() {
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <!-- Icono de éxito -->
            <div class="flex justify-center mb-6">
                <div class="size-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-green-600 dark:text-green-400" style="font-size: 64px; font-variation-settings: 'wght' 600;">check_circle</span>
                </div>
            </div>
            
            <!-- Título -->
            <h2 class="text-3xl font-black text-center text-text-main dark:text-white mb-4">
                ¡Comprobante Registrado!
            </h2>
            
            <!-- Mensaje -->
            <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <p class="text-sm text-blue-900 dark:text-blue-100 text-center leading-relaxed">
                    Tu comprobante de pago ha sido recibido exitosamente. 
                    <strong class="block mt-2">Esperarás la aprobación del administrador</strong> para que tus clases sean activadas.
                </p>
            </div>
            
            <!-- Información adicional -->
            <div class="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 flex-shrink-0">schedule</span>
                    <div>
                        <p class="text-xs font-bold text-amber-900 dark:text-amber-100 mb-1">Tiempo de aprobación</p>
                        <p class="text-xs text-amber-800 dark:text-amber-200">
                            La verificación se realiza en un máximo de 24 horas. Te notificaremos cuando tus clases estén activadas.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Botón Descargar Comprobante -->
            <button onclick="descargarComprobante()" class="w-full py-4 mb-3 bg-black hover:bg-gray-900 text-primary rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl border border-primary/30 flex items-center justify-center gap-2">
                <span class="material-symbols-outlined">download</span>
                Descargar Comprobante PDF
            </button>
            
            <!-- Botón Ir al Inicio -->
            <button onclick="cerrarModalYRedirigir()" class="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl">
                Ir al Inicio
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

/**
 * Cerrar modal y redirigir al inicio
 */
function cerrarModalYRedirigir() {
    // Restaurar scroll
    document.body.style.overflow = '';
    
    // Limpiar localStorage
    LocalStorage.remove('ultimaInscripcion');
    LocalStorage.remove('datosInscripcion');
    
    // Redirigir
    window.location.href = 'index.html';
}

/**
 * Expandir/colapsar métodos de pago (acordeón)
 */
function toggleMetodoPago(metodo) {
    const content = document.getElementById(`content${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`);
    const icon = document.getElementById(`icon${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`);
    
    if (content.classList.contains('hidden')) {
        // Mostrar con animación smooth
        content.classList.remove('hidden');
        // Forzar reflow para que la animación funcione
        content.offsetHeight;
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
        icon.style.transform = 'rotate(180deg)';
    } else {
        // Ocultar con animación smooth
        content.style.maxHeight = '0';
        content.style.opacity = '0';
        icon.style.transform = 'rotate(0deg)';
        
        // Esperar a que termine la animación antes de ocultar
        setTimeout(() => {
            content.classList.add('hidden');
        }, 300);
    }
}

/**
 * Mostrar loader mientras se sube el comprobante
 */
function mostrarLoaderSubida() {
    const loader = document.createElement('div');
    loader.id = 'loaderSubida';
    loader.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm';
    loader.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div class="flex flex-col items-center gap-6">
                <!-- Spinner -->
                <div class="relative">
                    <div class="size-20 rounded-full border-4 border-primary/20"></div>
                    <div class="absolute inset-0 size-20 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                
                <!-- Texto -->
                <div class="text-center">
                    <h3 class="text-2xl font-black text-text-main dark:text-white mb-2">Subiendo Comprobante</h3>
                    <p class="text-sm text-text-main/70 dark:text-white/70">Por favor espera...</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(loader);
    document.body.style.overflow = 'hidden';
}

/**
 * Cerrar loader de subida
 */
function cerrarLoaderSubida() {
    const loader = document.getElementById('loaderSubida');
    if (loader) {
        loader.remove();
        document.body.style.overflow = '';
    }
}

/**
 * Volver a la página de inicio
 */
function volverAlInicio() {
    // Limpiar localStorage de inscripción
    LocalStorage.remove('ultimaInscripcion');
    LocalStorage.remove('datosInscripcion');
    LocalStorage.remove('horariosSeleccionados');
    
    // Redirigir al inicio
    window.location.href = 'index.html';
}
