import React, { useEffect } from 'react';

const html = `
  <div class="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden" style="background:#0b1016;">
    <div class="absolute inset-0" style="background-image:url('https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=2000&q=80'),url('assets/jaguar.jpg');background-size:cover,cover;background-position:center,center;filter:blur(9px) saturate(80%) brightness(28%);transform:scale(1.1);"></div>
    <div class="absolute inset-0" style="background:radial-gradient(circle at 22% 18%, rgba(251,146,60,.20), rgba(251,146,60,0) 40%),linear-gradient(145deg, rgba(2,6,23,.94) 0%, rgba(8,12,20,.88) 46%, rgba(25,15,8,.78) 100%);"></div>
    <div class="absolute inset-0" style="box-shadow:inset 0 0 180px rgba(2,6,23,.92);"></div>
    <div class="absolute -top-28 -left-20 w-80 h-80 rounded-full" style="background:radial-gradient(circle, rgba(249,115,22,.24) 0%, rgba(249,115,22,0) 70%);"></div>
    <div class="absolute -bottom-24 -right-16 w-80 h-80 rounded-full" style="background:radial-gradient(circle, rgba(56,189,248,.10) 0%, rgba(56,189,248,0) 72%);"></div>

    <div class="relative w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-3 mb-4">
          <img src="assets/logo.ico" alt="Logo Jaguares" class="h-12 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]">
          <h2 class="text-3xl font-black uppercase tracking-wider" style="color:#f8fafc;text-shadow:0 6px 20px rgba(0,0,0,.55);">JAGUARES</h2>
        </div>
        <div class="inline-block px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider" style="background:rgba(255,255,255,.10);color:#fb923c;border:1px solid rgba(251,146,60,.35);backdrop-filter:blur(3px);">
          Panel Administrativo
        </div>
            </div>
            <div class="rounded-2xl p-8 shadow-2xl border" style="background:rgba(15,23,42,.74);border-color:rgba(148,163,184,.30);backdrop-filter:blur(10px);box-shadow:0 34px 80px rgba(2,6,23,.7);">
        <h1 class="text-3xl font-black mb-6 text-center uppercase tracking-tight" style="color:#f8fafc;">
          Acceso Seguro
        </h1>

        <form id="formLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-bold uppercase tracking-wide mb-2" style="color:#e2e8f0;">
              Usuario o Correo Electrónico
            </label>
            <input 
              id="email" 
              type="text" 
              class="w-full h-12 px-4 rounded-xl text-sm transition-all"
              style="border:1px solid rgba(148,163,184,.30);background:rgba(15,23,42,.58);color:#f8fafc;"
              placeholder="usuario o email@jaguares.com" 
              required
              autocomplete="username"
            />
          </div>

          <div>
            <label class="block text-sm font-bold uppercase tracking-wide mb-2" style="color:#e2e8f0;">
              Contraseña
            </label>
            <input 
              id="password" 
              type="password" 
              class="w-full h-12 px-4 rounded-xl text-sm transition-all"
              style="border:1px solid rgba(148,163,184,.30);background:rgba(15,23,42,.58);color:#f8fafc;"
              placeholder="••••••••" 
              required
              autocomplete="current-password"
            />
          </div>

          <div id="errorMessage" class="hidden rounded-xl p-3" style="background:rgba(127,29,29,.32);border:1px solid rgba(248,113,113,.42);">
            <p class="text-sm font-medium text-center" style="color:#fecaca;"></p>
          </div>

          <button 
            type="submit"
            id="btnLogin"
            class="w-full h-12 font-bold uppercase tracking-wide rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            style="background:#ea580c;color:#fff7ed;"
            onmouseover="this.style.background='#c2410c'"
            onmouseout="this.style.background='#ea580c'"
          >
            <span class="material-symbols-outlined">login</span>
            Iniciar Sesión
          </button>
        </form>

        <div class="mt-6 pt-6" style="border-top:1px solid rgba(148,163,184,.26);">
          <p class="text-xs text-center" style="color:#cbd5e1;">
            Acceso restringido solo para personal autorizado
          </p>
        </div>
            </div>

      <div class="mt-6 text-center">
        <a href="/" class="inline-flex items-center gap-2 font-medium text-sm transition-colors" style="color:#cbd5e1;">
          <span class="material-symbols-outlined text-lg">arrow_back</span>
          Volver al sitio público
        </a>
      </div>
        </div>
    </div>
`;

export default function AdminLogin() {
  useEffect(() => {
    const prevClassName = document.body.className;
    const prevStyle = document.body.getAttribute('style');

    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    document.body.className = 'font-sans admin-readable min-h-screen overflow-x-hidden';
    document.body.style.background = '#0b1016';

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
      document.body.className = prevClassName;
      if (prevStyle === null) {
        document.body.removeAttribute('style');
      } else {
        document.body.setAttribute('style', prevStyle);
      }
    };
  }, []);

  return <div className="page-root" dangerouslySetInnerHTML={{ __html: html }} />;
}




