import React, { useEffect } from 'react';

const html = `
    <header class="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-border-color bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm px-6 py-4 lg:px-10 shadow-sm">
        <div class="flex items-center gap-3 text-text-main dark:text-white">
            <img src="assets/logo.ico" alt="Logo Jaguares" class="h-10 w-auto object-contain">
            <h2 class="text-2xl font-black italic uppercase tracking-wider text-black dark:text-white">JAGUARES</h2>
        </div>
        <div class="flex items-center gap-4">
            <span class="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-bold uppercase">Admin</span>
        </div>
    </header>

    <main class="flex-grow flex flex-col items-center justify-start py-10 px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-[600px] flex flex-col gap-8">
            <div class="flex flex-col gap-4">
                <h1 class="text-black dark:text-white text-4xl font-black italic uppercase tracking-tight">Panel de <span class="text-primary">AdministraciÃ³n</span></h1>
                <p class="text-text-muted dark:text-gray-400 text-base">Gestiona los usuarios registrados en el sistema.</p>
            </div>

            <div class="bg-white dark:bg-surface-dark rounded-xl p-8 shadow-xl border-l-4 border-red-500">
                <div class="mb-6">
                    <h3 class="text-2xl font-bold text-black dark:text-white uppercase flex items-center gap-3">
                        <span class="material-symbols-outlined text-red-500 text-3xl">delete_forever</span>
                        Eliminar Usuario
                    </h3>
                    <p class="text-sm text-text-muted dark:text-gray-400 mt-2">
                        âš ï¸ Esta acciÃ³n eliminarÃ¡ TODOS los registros del usuario en:
                    </p>
                    <ul class="list-disc list-inside text-sm text-text-muted dark:text-gray-400 mt-2 ml-4">
                        <li>Hoja INSCRIPCIONES</li>
                        <li>Hoja PAGOS</li>
                        <li>Todías las hojas de dÃ­as (LUNES, MARTES, etc.)</li>
                        <li>Todías las hojas de deportes (FÃšTBOL, VÃ“LEY, etc.)</li>
                    </ul>
                </div>

                <form id="formEliminar" class="flex flex-col gap-6">
                    <div class="flex flex-col gap-2">
                        <label class="text-text-main dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                            DNI del Usuario a Eliminar <span class="text-red-500">*</span>
                        </label>
                        <input 
                            id="dniEliminar" 
                            type="text" 
                            maxlength="8" 
                            pattern="[0-9]{8}"
                            inputmode="numeric"
                            class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-base focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder:text-gray-400 transition-all" 
                            placeholder="Ingrese DNI (8 dÃ­gitos)" 
                            required
                        />
                        <span class="text-xs text-gray-500 dark:text-gray-400">Solo nÃºmeros, exactamente 8 dÃ­gitos</span>
                    </div>

                    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div class="flex items-start gap-3">
                            <span class="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">warning</span>
                            <p class="text-sm text-red-800 dark:text-red-300 font-medium">
                                <strong>ADVERTENCIA:</strong> Esta acciÃ³n NO se puede deshacer. Se eliminarÃ¡n permanentemente todos los registros asociados a este DNI.
                            </p>
                        </div>
                    </div>

                    <div class="flex gap-4 mt-4">
                        <button 
                            type="submit" 
                            class="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <span class="material-symbols-outlined">delete_forever</span>
                            Eliminar Usuario
                        </button>
                        <button 
                            type="button" 
                            onclick="document.getElementById('dniEliminar').value = ''"
                            class="px-6 h-12 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold uppercase tracking-wide rounded-lg transition-all"
                        >
                            Limpiar
                        </button>
                    </div>
                </form>

                <div id="resultado" class="mt-6 hidden"></div>
            </div>

            <div class="text-center">
                <a href="/" class="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors">
                    <span class="material-symbols-outlined">arrow_back</span>
                    Volver al Inicio
                </a>
            </div>
        </div>
    </main>
`;

function initAdminLegacy() {
  const form = document.getElementById('formEliminar');
  const dniInput = document.getElementById('dniEliminar');
  const resultado = document.getElementById('resultado');

  if (!form || !dniInput || !resultado) {
    return;
  }

  const mostrarResultado = (tipo, Mensaje) => {
    resultado.classList.remove('hidden');

    const colores = {
      success: 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300',
      error: 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-300',
      loading: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-300'
    };

    const iconos = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      loading: 'progress_activity'
    };

    resultado.className = `p-4 rounded-lg border-l-4 ${colores[tipo] || colores.error}`;
    resultado.innerHTML = `
        <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-2xl">${iconos[tipo] || iconos.error}</span>
            <pre class="text-sm font-medium whitespace-pre-wrap">${Mensaje}</pre>
        </div>
    `;

    resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const dni = dniInput.value.trim();

    if (dni.length !== 8 || Number.isNaN(Number(dni))) {
      mostrarResultado('error', 'El DNI debe tener exactamente 8 dÃ­gitos numÃ©ricos');
      return;
    }

    const confirmar = confirm(
      `Â¿EstÃ¡s seguro de eliminar TODOS los registros del usuario con DNI ${dni}?\n\n` +
      'Esta acciÃ³n NO se puede deshacer y eliminarÃ¡:\n' +
      'â€¢ Datos personales en INSCRIPCIONES\n' +
      'â€¢ Registros de pago en PAGOS\n' +
      'â€¢ Todías las inscripciones en hojas de dÃ­as\n' +
      'â€¢ Todías las inscripciones en hojas de deportes\n\n' +
      'Escribe "ELIMINAR" en mayÃºsculas para confirmar:'
    );

    if (!confirmar) {
      return;
    }

    const confirmacionTexto = prompt('Escribe "ELIMINAR" para confirmar:');

    if (confirmacionTexto !== 'ELIMINAR') {
      mostrarResultado('warning', 'OperaciÃ³n cancelada. Debes escribir "ELIMINAR" para confirmar.');
      return;
    }

    mostrarResultado('loading', 'Eliminando usuario... Por favor espera.');

    try {
      const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002'
        : 'https://api.jaguarescar.com';

      const response = await fetch(`${API_BASE}/api/eliminar-usuario/${dni}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        mostrarResultado(
          'success',
          `âœ… Usuario eliminado eÉxitosamente\n\n` +
          `DNI: ${dni}\n` +
          `Registros eliminados: ${data.registros_eliminados}\n\n` +
          data.message
        );
        dniInput.value = '';
      } else {
        mostrarResultado('error', `âŒ Error: ${data.error || 'No se pudo eliminar el usuario'}`);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al eliminar usuario:', error);
      mostrarResultado('error', `âŒ Error de conexiÃ³n: ${error.message}`);
    }
  };

  const onInput = (e) => {
    // eslint-disable-next-line no-param-reassign
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  };

  form.addEventListener('submit', onSubmit);
  dniInput.addEventListener('input', onInput);

  return () => {
    form.removeEventListener('submit', onSubmit);
    dniInput.removeEventListener('input', onInput);
  };
}

export default function AdminLegacy() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');

    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main font-display min-h-screen flex flex-col';

    let cleanup = null;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        cleanup = initAdminLegacy();
      }, { once: true });
    } else {
      cleanup = initAdminLegacy();
    }

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  return <div className="page-root" dangerouslySetInnerHTML={{ __html: html }} />;
}




