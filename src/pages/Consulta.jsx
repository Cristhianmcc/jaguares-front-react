import React, { useEffect } from 'react';
import '../styles/consulta.css';
import '../styles/animations.css';

const html = `
    
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-solid border-border-color bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm shadow-sm">
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
                
                <!-- Usuario logueado (hidden inicialmente, móvil y desktop) -->
                <div id="userInfo" class="hidden lg:flex items-center gap-3 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2">
                    <div class="size-8 rounded-full bg-black text-primary flex items-center justify-center font-bold text-sm">
                        <span class="material-symbols-outlined text-lg">person</span>
                    </div>
                    <span id="userName" class="text-sm font-bold text-text-main dark:text-white uppercase"></span>
                </div>

                <!-- Navegación desktop -->
                <div class="hidden lg:flex flex-1 justify-end gap-8">
                    <nav class="flex items-center gap-9">
                        <a class="text-text-main dark:text-gray-200 text-sm font-semibold uppercase tracking-wide hover:text-primary transition-colors" href="/">Inicio</a>
                        <a class="text-text-main dark:text-gray-200 text-sm font-semibold uppercase tracking-wide hover:text-primary transition-colors" href="#">Academia</a>
                        <a class="text-text-main dark:text-gray-200 text-sm font-semibold uppercase tracking-wide hover:text-primary transition-colors" href="#">Ayuda</a>
                    </nav>
                </div>
            </div>
            
            <!-- Menú móvil -->
            <div id="mobile-menu" class="hidden lg:hidden mt-4 pb-2 space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                <a class="block text-text-main dark:text-white hover:text-primary text-base font-semibold uppercase tracking-wide transition-colors py-2" href="/">Inicio</a>
                <a class="block text-text-main dark:text-white hover:text-primary text-base font-semibold uppercase tracking-wide transition-colors py-2" href="#">Academia</a>
                <a class="block text-text-main dark:text-white hover:text-primary text-base font-semibold uppercase tracking-wide transition-colors py-2" href="#">Ayuda</a>
                
                <!-- Usuario info en móvil -->
                <div id="userInfoMobile" class="hidden flex items-center gap-3 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 mt-4">
                    <div class="size-8 rounded-full bg-black text-primary flex items-center justify-center">
                        <span class="material-symbols-outlined text-lg">person</span>
                    </div>
                    <span id="userNameMobile" class="text-sm font-bold text-text-main dark:text-white uppercase"></span>
                </div>
            </div>
        </div>
    </header>

    <main class="flex-grow flex flex-col items-center justify-start py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Vista de ingreso DNI -->
        <div id="vistaIngreso" class="w-full max-w-[600px] flex flex-col gap-8">
            <div class="flex flex-col gap-6 text-center">
                <div class="flex justify-center">
                    <div class="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/30">
                        <span class="material-symbols-outlined text-[48px]">badge</span>
                    </div>
                </div>
                <div>
                    <h1 class="text-black dark:text-white text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
                        Consulta tu <span class="text-primary">Estado</span>
                    </h1>
                    <p class="text-text-muted dark:text-gray-400 text-lg font-medium">
                        Ingresa tu DNI para verificar el estado de tu inscripción
                    </p>
                </div>
            </div>

            <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-8 shadow-xl border-t-4 border-primary">
                <form id="formConsulta" class="flex flex-col gap-6">
                    <div class="flex flex-col gap-3 group">
                        <label class="text-text-main dark:text-gray-300 text-sm font-bold uppercase tracking-wider">
                            DNI / documento <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">badge</span>
                            <input 
                                id="dniConsulta" 
                                name="dni" 
                                class="w-full h-14 pl-12 pr-4 rounded-lg border-2 border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-lg font-bold focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-gray-400 transition-all shadow-sm group-hover:border-primary/50" 
                                placeholder="Ingrese su número de DNI" 
                                type="text" 
                                maxlength="8"
                                pattern="[0-9]{8}"
                                required/>
                        </div>
                    </div>

                    <button type="submit" class="flex items-center justify-center gap-2 h-14 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-black font-bold text-base uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                        <span>Consultar Estado</span>
                        <span class="material-symbols-outlined">search</span>
                    </button>

                    <a href="/" class="text-text-main/60 dark:text-white/60 hover:text-primary dark:hover:text-primary text-sm font-bold flex items-center justify-center gap-2 transition-colors py-2 uppercase tracking-wide">
                        <span class="material-symbols-outlined text-lg">arrow_back</span>
                        Volver al Inicio
                    </a>
                </form>
            </div>
        </div>

        <!-- Vista de resultados (oculta inicialmente) -->
        <div id="vistaResultados" class="hidden w-full max-w-[1024px] flex flex-col gap-8">
            <div class="flex flex-col gap-6">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <div>
                        <h1 class="text-black dark:text-white text-4xl md:text-5xl font-black uppercase tracking-tight">
                            Tu <span class="text-primary">Inscripción</span>
                        </h1>
                        <p class="text-text-muted dark:text-gray-400 text-lg font-medium mt-2">Estado de tu cuenta y horarios registrados</p>
                    </div>
                    <button onclick="cerrarSesion()" class="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                        <span class="material-symbols-outlined">logout</span>
                        <span class="font-bold text-sm uppercase">Salir</span>
                    </button>
                </div>

                <!-- Tarjeta de estado -->
                <div id="estadoInscripcion" class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 shadow-xl border-l-4">
                    <!-- Se llenaráá dinámicamente -->
                </div>

                <!-- Datos del alumno -->
                <div id="datosAlumno" class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 shadow-md">
                    <!-- Se llenaráá dinámicamente -->
                </div>

                <!-- Horarios inscritos -->
                <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 shadow-md">
                    <h3 class="text-2xl font-bold text-black dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">schedule</span>
                        Horarios Inscritos
                    </h3>
                    <div id="horariosInscritos" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Se llenaráá dinámicamente -->
                    </div>
                </div>

                <!-- Sección Pago Mensual -->
                <section id="seccionPagoMensual" class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 shadow-xl">
                    <!-- Se llenaráá dinámicamente por consulta-v2.js -->
                </section>
            </div>
        </div>

    </main>

    <!-- Modal Usuario Inactivo -->
    <div id="modalInactivo" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
        <div class="relative w-full max-w-2xl bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border-2 border-yellow-500/30 overflow-hidden animate-[slideUp_0.3s_ease-out] max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <!-- Header con ícono -->
            <div class="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border-b border-border-light dark:border-gray-700 bg-gradient-to-r from-yellow-500/10 to-transparent flex-shrink-0">
                <div class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30">
                    <span class="material-symbols-outlined text-3xl sm:text-4xl text-yellow-600 dark:text-yellow-400">person_off</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg sm:text-xl font-black uppercase tracking-tight text-text-main dark:text-white truncate">Membresía Inactiva</h3>
                    <p class="text-xs sm:text-sm text-text-muted dark:text-gray-400 mt-0.5">DNI: <span id="modalInactivoDni" class="font-mono font-bold"></span></p>
                </div>
            </div>
            
            <!-- Contenido con scroll -->
            <div class="p-6 space-y-4 overflow-y-auto flex-1">
                <div class="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-lg">
                    <p class="text-base text-red-800 dark:text-red-300 font-semibold leading-relaxed">
                        ⚠️ Tu membresía fue suspendida por <strong>falta de pago</strong>
                    </p>
                </div>
                
                <p class="text-base text-text-main dark:text-gray-300 leading-relaxed">
                    Para reactivar tu cuenta y volver a entrenar con nosotros:
                </p>
                
                <!-- OPCIÓN 1: Subir Comprobante Directo -->
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-xl p-5 border-2 border-blue-500/30">
                    <p class="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-lg">cloud_upload</span>
                        OPCIÓN 1: Sube tu comprobante aquí
                    </p>
                    <p class="text-sm text-blue-700 dark:text-blue-400 mb-4">
                        Si ya realizaste el pago, sube tu voucher (Plin, Yape o transferencia) y lo verificaremos de inmediato.
                    </p>
                    
                    <!-- Zona de subida -->
                    <div id="zonaSubidaInactivo" class="mb-3 border-2 border-díashed border-blue-300 dark:border-blue-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-white dark:bg-gray-800"
                         onclick="document.getElementById('inputComprobanteInactivo').click()">
                        <input type="file" id="inputComprobanteInactivo" accept="image/*" class="hidden" onchange="previsualizarComprobanteInactivo(event)">
                        
                        <div id="iconoSubidaInactivo">
                            <span class="material-symbols-outlined text-4xl text-blue-500 mb-2">add_photo_alternate</span>
                            <p class="text-xs font-bold text-blue-700 dark:text-blue-300">Haz clic para seleccionar tu comprobante</p>
                            <p class="text-xs text-blue-500 dark:text-blue-400 mt-1">JPG, PNG (máx. 5MB)</p>
                        </div>
                        
                        <div id="previewComprobanteInactivo" class="hidden">
                            <img id="imgComprobanteInactivo" src="" alt="Vista previa" class="w-full h-32 object-contain rounded-lg mb-2">
                            <p id="nombreArchivoInactivo" class="text-xs text-blue-600 dark:text-blue-400 truncate font-medium"></p>
                        </div>
                    </div>
                    
                    <button onclick="subirComprobanteInactivo()" 
                            id="btnSubirComprobanteInactivo"
                            class="flex items-center justify-center gap-2 w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-blue-600 text-white font-bold text-sm uppercase tracking-wide hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled>
                        <span class="material-symbols-outlined text-lg sm:text-xl">send</span>
                        <span class="hidden sm:inline">Enviar Comprobante</span>
                        <span class="sm:hidden">Enviar</span>
                    </button>
                </div>
                
                <!-- OPCIÓN 2: Notificar por WhatsApp -->
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-xl p-4 sm:p-5 border-2 border-green-500/30">
                    <p class="text-xs sm:text-sm font-bold text-green-800 dark:text-green-300 mb-2 sm:mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-base sm:text-lg">notifications_active</span>
                        <span>OPCIÓN 2: Notificar por WhatsApp</span>
                    </p>
                    <p class="text-xs sm:text-sm text-green-700 dark:text-green-400 mb-2 sm:mb-3">
                        Una vez subido tu comprobante (OPCIÓN 1), escríbenos por WhatsApp para avisar que realizaste el pago y envíanos tu DNI.
                    </p>
                    <a id="btnWhatsAppInactivo" href="https://wa.me/51973324460?text=Hola,%20acabo%20de%20subir%20mi%20comprobante%20de%20pago%20para%20reactivar%20mi%20membresía.%20Mi%20DNI%20es:" target="_blank" class="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-lg bg-green-600 text-white font-bold text-sm uppercase tracking-wide hover:bg-green-700 transition-all shadow-lg">
                        <span class="material-symbols-outlined text-lg sm:text-xl">whatsapp</span>
                        <span class="hidden sm:inline">Notificar por WhatsApp</span>
                        <span class="sm:hidden">WhatsApp</span>
                    </a>
                </div>
                
                <!-- OPCIÓN 3: Otros contactos -->
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 border border-gray-200 dark:border-gray-700">
                    <p class="text-xs font-bold text-text-muted dark:text-gray-400 uppercase mb-2">
                        <span class="material-symbols-outlined text-sm align-middle">info</span>
                        OPCIÓN 3: Otros medios de contacto
                    </p>
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <span class="material-symbols-outlined text-primary text-xl flex-shrink-0">call</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs text-text-muted dark:text-gray-500 uppercase font-bold">Teléfono</p>
                            <a id="contactPhoneLink" href="tel:+51973324460" class="text-sm sm:text-base font-bold text-text-main dark:text-white hover:text-primary transition-colors break-all">+51 973 324 460</a>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <span class="material-symbols-outlined text-primary text-xl flex-shrink-0">email</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs text-text-muted dark:text-gray-500 uppercase font-bold">Email</p>
                            <a href="mailto:centroaltorendimientojaguares@gmail.com" class="text-xs sm:text-sm font-bold text-text-main dark:text-white hover:text-primary transition-colors break-all">centroaltorendimientojaguares@gmail.com</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer con botones -->
            <div class="flex gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] flex-shrink-0">
                <button onclick="cerrarModalInactivo()" class="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-text-main dark:text-white font-bold text-sm uppercase tracking-wide hover:bg-gray-300 dark:hover:bg-gray-700 transition-all">
                    Cerrar
                </button>
            </div>
        </div>
    </div>

    <style>
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fade-in {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        
        @keyframes scale-in {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .animate-fade-in {
            animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
            animation: scale-in 0.3s ease-out;
        }
    </style>

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

export default function Consulta() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');

    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main font-sans admin-readable min-h-screen flex flex-col overflow-x-hidden transition-colors duration-200';

    let cancelled = false;

    (async () => {
      try {
        // Cargar configuración de pagos desde API
        const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || '';
        const response = await fetch(`${API_BASE}/api/admin/landing-content`);
        const data = await response.json();
        if (data.success && data.data.pagos && data.data.pagos.plin) {
          const phoneLink = document.getElementById('contactPhoneLink');
          if (phoneLink) {
            const phoneNumber = data.data.pagos.plin.numero.replace(/\D/g, '');
            phoneLink.href = `tel:+${phoneNumber}`;
            phoneLink.textContent = data.data.pagos.plin.numero;
          }
        }

        await loadScript('/legacy/api-service-v2.js');
        await loadScript('/legacy/consulta-v2.js');
        await loadScript('/legacy/mobile-menu.js');
        if (typeof window.inicializarConsulta === 'function') {
          window.inicializarConsulta();
        }
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








