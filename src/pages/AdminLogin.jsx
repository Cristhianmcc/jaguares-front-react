import React, { useEffect } from 'react';

const html = `
    <div class="w-full max-w-md">
        <div class="text-center mb-8">
            <div class="inline-flex items-center gap-3 mb-4">
                <img src="assets/logo.ico" alt="Logo Jaguares" class="h-12 w-auto object-contain">
                <h2 class="text-3xl font-black italic uppercase tracking-wider text-black dark:text-white">JAGUARES</h2>
            </div>
            <div class="inline-block px-4 py-1.5 bg-gradient-to-r from-gray-900 to-gray-800 text-primary rounded-md text-sm font-bold uppercase tracking-wider">
                Panel Administrativo
            </div>
        </div>

        <div class="bg-white dark:bg-surface-dark rounded-xl p-8 shadow-2xl border-t-4 border-primary">
            <h1 class="text-2xl font-bold text-black dark:text-white mb-6 text-center uppercase tracking-tight">
                Acceso Seguro
            </h1>

            <form id="formLogin" class="space-y-6">
                <div>
                    <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">
                        Usuario o Correo Electrónico
                    </label>
                    <input 
                        id="email" 
                        type="text" 
                        class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary" 
                        placeholder="usuario o email@jaguares.com" 
                        required
                        autocomplete="username"
                    />
                </div>

                <div>
                    <label class="block text-sm font-bold text-text-main dark:text-gray-300 uppercase tracking-wide mb-2">
                        Contraseña
                    </label>
                    <input 
                        id="password" 
                        type="password" 
                        class="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white dark:bg-[#252525] dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary" 
                        placeholder="••••••••" 
                        required
                        autocomplete="current-password"
                    />
                </div>

                <div id="errorMessage" class="hidden bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p class="text-sm text-red-800 dark:text-red-300 font-medium text-center"></p>
                </div>

                <button 
                    type="submit"
                    id="btnLogin"
                    class="w-full h-12 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-primary font-bold uppercase tracking-wide rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                    <span class="material-symbols-outlined">login</span>
                    Iniciar Sesión
                </button>
            </form>

            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <p class="text-xs text-text-muted dark:text-gray-500 text-center">
                    Acceso restringido solo para personal autorizado
                </p>
            </div>
        </div>

        <div class="mt-6 text-center">
            <a href="/" class="inline-flex items-center gap-2 text-text-muted hover:text-primary font-medium text-sm transition-colors">
                <span class="material-symbols-outlined text-lg">arrow_back</span>
                Volver al sitio público
            </a>
        </div>
    </div>

    
`;

export default function AdminLogin() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    document.body.className = 'bg-background-light dark:bg-background-dark font-display min-h-screen flex items-center justify-center p-4';

    const form = document.getElementById('formLogin');
    const btnLogin = document.getElementById('btnLogin');
    const errorMessage = document.getElementById('errorMessage');

    if (!form || !btnLogin || !errorMessage) return () => {};

    const onSubmit = async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      errorMessage.classList.add('hidden');

      const textoOriginal = btnLogin.innerHTML;
      btnLogin.disabled = true;
      btnLogin.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Verificando...';

      try {
        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:3002'
          : 'https://api.jaguarescar.com';

        const response = await fetch(`${API_BASE}/api/admin/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('adminSession', JSON.stringify({
            token: data.token,
            admin: data.admin,
            timestamp: new Date().toISOString()
          }));

          if (data.admin.rol === 'profesor') {
            window.location.href = '/profesor';
          } else {
            window.location.href = '/admin-panel';
          }
        } else {
          errorMessage.querySelector('p').textContent = data.error || 'Credenciales inválidías';
          errorMessage.classList.remove('hidden');
          btnLogin.disabled = false;
          btnLogin.innerHTML = textoOriginal;
        }
      } catch (error) {
        console.error('Error en login:', error);
        errorMessage.querySelector('p').textContent = 'Error de conexión. Verifica que el servidor esté activo.';
        errorMessage.classList.remove('hidden');
        btnLogin.disabled = false;
        btnLogin.innerHTML = textoOriginal;
      }
    };

    form.addEventListener('submit', onSubmit);

    const session = localStorage.getItem('adminSession');
    if (session) {
      const data = JSON.parse(session);
      const sessionTime = new Date(data.timestamp).getTime();
      const now = new Date().getTime();
      const hoursElapsed = (now - sessionTime) / (1000 * 60 * 60);

      if (hoursElapsed < 8) {
        if (data.admin.rol === 'profesor') {
          window.location.href = '/profesor';
        } else {
          window.location.href = '/admin-panel';
        }
      } else {
        localStorage.removeItem('adminSession');
        localStorage.removeItem('admin_token');
      }
    }

    return () => {
      form.removeEventListener('submit', onSubmit);
    };
  }, []);

  return <div className="page-root" dangerouslySetInnerHTML={{ __html: html }} />;
}




