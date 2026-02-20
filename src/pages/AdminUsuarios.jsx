import React, { useEffect } from 'react';

const html = `
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-solid border-border-color bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm shadow-sm">
        <div class="px-4 py-4 lg:px-10">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 text-text-main dark:text-white">
                    <img src="assets/logo.ico" alt="Logo Jaguares" class="h-10 w-auto object-contain">
                    <h2 class="text-xl lg:text-2xl font-black italic uppercase tracking-wider text-black dark:text-white">JAGUARES</h2>
                </div>
                <a href="/admin-panel" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">arrow_back</span>
                    Volver al Panel
                </a>
            </div>
        </div>
    </header>

    <main class="px-4 sm:px-6 lg:px-10 py-8">
        <div class="max-w-screen-2xl mx-auto">
            <!-- Título -->
            <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 class="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-black dark:text-white">
                        Gestión de <span class="text-primary">Usuarios</span>
                    </h1>
                    <p class="text-text-muted dark:text-gray-400 mt-2">Administrar usuarios con acceso al panel</p>
                </div>
                <button onclick="toggleForm('crear')" class="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2 justify-center">
                    <span class="material-symbols-outlined">person_add</span>
                    Crear Usuario
                </button>
            </div>

            <!-- Alertas -->
            <div id="alertContainer"></div>

            <!-- Formulario Crear Usuario -->
            <div id="formCrear" class="hidden mb-6">
                <div class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-xl border-l-4 border-primary">
                    <h3 class="text-xl font-bold text-black dark:text-white mb-6 uppercase tracking-tight">
                        <span class="material-symbols-outlined align-middle mr-2">person_add</span>
                        Crear Nuevo Usuario
                    </h3>
                    <form id="formCrearUsuario" onsubmit="crearUsuario(event)" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 mb-2">Usuario *</label>
                            <input type="text" id="nuevo_usuario" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary text-black dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 mb-2">Nombre Completo *</label>
                            <input type="text" id="nuevo_nombre" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary text-black dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 mb-2">Email *</label>
                            <input type="email" id="nuevo_email" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary text-black dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 mb-2">Contraseña *</label>
                            <input type="password" id="nuevo_password" required minlength="6" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary text-black dark:text-white">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 mb-2">Rol *</label>
                            <select id="nuevo_rol" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary text-black dark:text-white">
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                        <div class="md:col-span-2 flex gap-3">
                            <button type="submit" class="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-colors">
                                Crear Usuario
                            </button>
                            <button type="button" onclick="toggleForm('crear')" class="px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-bold transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Formulario Cambiar Contraseña -->
            <div id="formPassword" class="hidden mb-6">
                <div class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-xl border-l-4 border-blue-600">
                    <h3 class="text-xl font-bold text-black dark:text-white mb-6 uppercase tracking-tight">
                        <span class="material-symbols-outlined align-middle mr-2">lock_reset</span>
                        Cambiar Mi Contraseña
                    </h3>
                    <form id="formCambiarPassword" onsubmit="cambiarPassword(event)" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 mb-2">Contraseña Actual *</label>
                            <input type="password" id="password_actual" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary text-black dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 mb-2">Nueva Contraseña *</label>
                            <input type="password" id="password_nueva" required minlength="6" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary text-black dark:text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-text-main dark:text-gray-300 mb-2">Confirmar Contraseña *</label>
                            <input type="password" id="password_confirmar" required minlength="6" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary text-black dark:text-white">
                        </div>
                        <div class="md:col-span-3 flex gap-3">
                            <button type="submit" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors">
                                Cambiar Contraseña
                            </button>
                            <button type="button" onclick="toggleForm('password')" class="px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-bold transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Tabla de Usuarios -->
            <div class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-xl">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 class="text-xl font-bold text-black dark:text-white uppercase tracking-tight">
                        Usuarios Administradores
                    </h3>
                    <button onclick="toggleForm('password')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2 justify-center">
                        <span class="material-symbols-outlined text-lg">lock</span>
                        Cambiar Mi Contraseña
                    </button>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-primary text-white">
                                <th class="px-4 py-3 text-left text-sm font-bold uppercase">Usuario</th>
                                <th class="px-4 py-3 text-left text-sm font-bold uppercase">Nombre</th>
                                <th class="px-4 py-3 text-left text-sm font-bold uppercase">Email</th>
                                <th class="px-4 py-3 text-left text-sm font-bold uppercase">Rol</th>
                                <th class="px-4 py-3 text-left text-sm font-bold uppercase">Estado</th>
                                <th class="px-4 py-3 text-left text-sm font-bold uppercase">Último Acceso</th>
                                <th class="px-4 py-3 text-left text-sm font-bold uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="usuariosTableBody" class="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                                <td colspan="7" class="px-4 py-8 text-center text-text-muted">
                                    <div class="flex flex-col items-center gap-2">
                                        <span class="material-symbols-outlined text-4xl">hourglass_empty</span>
                                        <span>Cargando usuarios...</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal Confirmar Eliminación -->
    <div id="modalEliminar" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-red-200 dark:border-red-900">
            <div class="bg-red-600 px-6 py-5 flex items-center gap-3">
                <span class="material-symbols-outlined text-white text-3xl">warning</span>
                <h3 class="text-xl font-black italic uppercase text-white tracking-tight">Confirmar eliminación</h3>
            </div>
            <div class="px-6 py-6">
                <p class="text-text-main dark:text-gray-200 text-base">
                    ¿Estás seguro de eliminar al usuario
                    <span id="modalEliminarNombre" class="font-black text-red-600"></span>?
                </p>
                <p class="text-sm text-text-muted dark:text-gray-400 mt-1">Esta acción no se puede deshacer.</p>
            </div>
            <div class="px-6 pb-6 flex gap-3 justify-end">
                <button onclick="cerrarModalEliminar()" class="px-5 py-2 rounded-lg font-bold text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white transition-colors">
                    Cancelar
                </button>
                <button id="btnConfirmarEliminar" class="px-5 py-2 rounded-lg font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-base">delete</span>
                    Eliminar
                </button>
            </div>
        </div>
    </div>

    
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

export default function AdminUsuarios() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');

    document.body.className = 'bg-background-light dark:bg-background-dark text-text-main font-display min-h-screen';

    let cancelled = false;

    (async () => {
      try {
        await loadScript('/legacy/api-service-v2.js');
        await loadScript('/legacy/admin-usuarios.js');
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


