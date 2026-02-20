// Gestión de usuarios administradores
let usuariosData = [];

// Verificar autenticación al cargar
function initAdminUsuarios() {
    console.log('📄 DOMContentLoaded disparado');
    console.log('🔍 Verificando autenticación...');
    
    const token = localStorage.getItem('admin_token');
    console.log('🎫 Token en localStorage:', token ? `PRESENTE (${token.substring(0, 20)}...)` : 'NO HAY TOKEN');
    
    if (verificarAutenticacion()) {
        console.log('✅ Autenticación verificada, cargando usuarios...');
        cargarUsuarios();
    } else {
        console.log('❌ Autenticación fallida, debería redirigir...');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminUsuarios);
} else {
    initAdminUsuarios();
}


function verificarAutenticacion() {
    console.log('🔐 Ejecutando verificarAutenticacion()...');
    const token = localStorage.getItem('admin_token');
    console.log('🎫 Token encontrado:', token ? 'SÍ' : 'NO');
    
    if (!token) {
        console.log('⚠️ No hay token, redirigiendo a login...');
        window.location.href = 'admin-login.html';
        return false;
    }
    
    console.log('✅ Token válido, continuando...');
    return true;
}

function mostrarAlerta(Mensaje, tipo = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    
    const iconos = {
        'success': 'check_circle',
        'error': 'error'
    };
    
    const colores = {
        'success': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-500',
        'error': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-500'
    };
    
    alert.className = `flex items-center gap-3 p-4 rounded-lg border-l-4 mb-4 ${colores[tipo]}`;
    alert.innerHTML = `
        <span class="material-symbols-outlined">${iconos[tipo]}</span>
        <span class="font-semibold">${Mensaje}</span>
    `;
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function toggleForm(tipo) {
    const formCrear = document.getElementById('formCrear');
    const formPassword = document.getElementById('formPassword');
    
    if (tipo === 'crear') {
        formCrear.classList.toggle('hidden');
        formPassword.classList.add('hidden');
        document.getElementById('formCrearUsuario').reset();
    } else if (tipo === 'password') {
        formPassword.classList.toggle('hidden');
        formCrear.classList.add('hidden');
        document.getElementById('formCambiarPassword').reset();
    }
}

async function cargarUsuarios() {
    try {
        console.log('🔍 Intentando cargar usuarios...');
        console.log('🎫 Token:', localStorage.getItem('admin_token') ? 'PRESENTE' : 'NO HAY');
        
        const response = await academiaAPI.ejecutarConToken('GET', '/api/admin/usuarios');
        
        console.log('📥 Respuesta recibida:', response);
        
        if (response.success) {
            usuariosData = response.usuarios;
            console.log('✅ Usuarios cargados:', response.usuarios.length);
            renderizarUsuarios(response.usuarios);
        } else {
            console.error('❌ Error en respuesta:', response.error);
            mostrarAlerta(response.error || 'Error al cargar usuarios', 'error');
        }
    } catch (error) {
        console.error('❌ Error al cargar usuarios:', error);
        console.error('📋 Detalles del error:', {
            message: error.message,
            stack: error.stack
        });
        
        // Si es error de autenticación, redirigir al login
        if (error.message && error.message.includes('Sesión expirada')) {
            console.log('🔄 Sesión expirada, redirigiendo al login...');
            window.location.href = 'admin-login.html';
            return;
        }
        
        // Mostrar error más específico
        const MensajeError = error.message || 'Error de conexión al cargar usuarios';
        mostrarAlerta(MensajeError, 'error');
        
        // Mostrar Mensaje de cargando por si acaso
        const tbody = document.getElementById('usuariosTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-8 text-center text-red-600">
                    <div class="flex flex-col items-center gap-2">
                        <span class="material-symbols-outlined text-4xl">error</span>
                        <span class="font-bold">${MensajeError}</span>
                        <button onclick="cargarUsuarios()" class="mt-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm">
                            Reintentar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

function renderizarUsuarios(usuarios) {
    const tbody = document.getElementById('usuariosTableBody');
    
    if (usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-8 text-center text-text-muted">
                    <div class="flex flex-col items-center gap-2">
                        <span class="material-symbols-outlined text-4xl">group_off</span>
                        <span>No hay usuarios registrados</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = usuarios.map(user => {
        const rolClass = user.rol === 'super_admin' ? 'bg-purple-600' : 'bg-blue-600';
        const rolText = user.rol === 'super_admin' ? 'Super Admin' : 'Admin';
        const estadoClass = user.estado === 'activo' ? 'bg-green-600' : 'bg-red-600';
        const ultimoAcceso = user.ultimo_acceso 
            ? new Date(user.ultimo_acceso).toLocaleString('es-PE', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : 'Nunca';
        
        const esUsuarioActual = isCurrentUser(user);
        
        return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">account_circle</span>
                        <span class="font-bold text-black dark:text-white">${user.usuario}</span>
                        ${esUsuarioActual ? '<span class="text-xs bg-primary text-white px-2 py-1 rounded">Tú</span>' : ''}
                    </div>
                </td>
                <td class="px-4 py-3 text-black dark:text-white">${user.nombre_completo || '-'}</td>
                <td class="px-4 py-3 text-text-muted dark:text-gray-400">${user.email}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white ${rolClass}">
                        <span class="material-symbols-outlined text-sm">${user.rol === 'super_admin' ? 'admin_panel_settings' : 'manage_accounts'}</span>
                        ${rolText}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white ${estadoClass}">
                        ${user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-text-muted dark:text-gray-400">${ultimoAcceso}</td>
                <td class="px-4 py-3">
                    ${esUsuarioActual ? 
                        '<span class="text-xs italic text-text-muted">Tu cuenta</span>' : 
                        `<button onclick="eliminarUsuario(${user.admin_id}, '${user.usuario}')" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">delete</span>
                            Eliminar
                        </button>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function isCurrentUser(user) {
    // Decodificar el token para obtener el usuario actual
    const token = localStorage.getItem('admin_token');
    if (!token) return false;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id === user.admin_id; // payload.id es del JWT, user.admin_id es de la DB
    } catch {
        return false;
    }
}

async function crearUsuario(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('nuevo_usuario').value.trim();
    const nombre = document.getElementById('nuevo_nombre').value.trim();
    const email = document.getElementById('nuevo_email').value.trim();
    const password = document.getElementById('nuevo_password').value;
    const rol = document.getElementById('nuevo_rol').value;
    
    if (password.length < 6) {
        mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    try {
        const response = await academiaAPI.ejecutarConToken('POST', '/api/admin/crear-usuario', {
            usuario,
            email,
            password,
            nombre_completo: nombre,
            rol
        });
        
        if (response.success) {
            mostrarAlerta('Usuario creado correctamente', 'success');
            toggleForm('crear');
            cargarUsuarios();
        } else {
            mostrarAlerta(response.error || 'Error al crear usuario', 'error');
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
        mostrarAlerta('Error de conexión al crear usuario', 'error');
    }
}

async function cambiarPassword(event) {
    event.preventDefault();
    
    const passwordActual = document.getElementById('password_actual').value;
    const passwordNueva = document.getElementById('password_nueva').value;
    const passwordConfirmar = document.getElementById('password_confirmar').value;
    
    if (passwordNueva !== passwordConfirmar) {
        mostrarAlerta('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (passwordNueva.length < 6) {
        mostrarAlerta('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    try {
        const response = await academiaAPI.ejecutarConToken('POST', '/api/admin/cambiar-password', {
            password_actual: passwordActual,
            password_nueva: passwordNueva
        });
        
        if (response.success) {
            mostrarAlerta('Contraseña actualizada correctamente', 'success');
            toggleForm('password');
        } else {
            mostrarAlerta(response.error || 'Error al cambiar contraseña', 'error');
        }
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        mostrarAlerta('Error de conexión al cambiar contraseña', 'error');
    }
}

function eliminarUsuario(adminId, usuario) {
    const modal = document.getElementById('modalEliminar');
    const nombre = document.getElementById('modalEliminarNombre');
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');
    if (!modal || !nombre || !btnConfirmar) return;

    nombre.textContent = `"${usuario}"`;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Cerrar al hacer clic en el fondo
    modal.onclick = (e) => { if (e.target === modal) cerrarModalEliminar(); };

    btnConfirmar.onclick = async () => {
        cerrarModalEliminar();
        try {
            const response = await academiaAPI.ejecutarConToken('DELETE', `/api/admin/usuarios/${adminId}`);
            if (response.success) {
                mostrarAlerta('Usuario eliminado correctamente', 'success');
                cargarUsuarios();
            } else {
                mostrarAlerta(response.error || 'Error al eliminar usuario', 'error');
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            mostrarAlerta('Error de conexión al eliminar usuario', 'error');
        }
    };
}

function cerrarModalEliminar() {
    const modal = document.getElementById('modalEliminar');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}







