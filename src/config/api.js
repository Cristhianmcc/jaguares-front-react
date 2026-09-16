// Configuración centralizada de la API
const isDevelopment = import.meta.env.DEV;
const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || 
     /^192\.168\./.test(window.location.hostname) || /^10\./.test(window.location.hostname) || 
     /^172\.(1[6-9]|2\d|3[0-1])\./.test(window.location.hostname));

// En desarrollo con proxy de Vite, usamos rutas relativas
// En producción o sin proxy, usamos la URL completa
export const API_BASE = isDevelopment && isLocalhost 
    ? '' // Usa proxy de Vite
    : (import.meta.env.VITE_API_BASE || 'https://api.jaguarescar.com');

// Helper para obtener fecha local de Perú (UTC-5)
export function getFechaLocalPeru() {
    const ahora = new Date();
    const offsetPeru = -5 * 60; // UTC-5 en minutos
    const offsetLocal = ahora.getTimezoneOffset();
    const diferencia = offsetPeru - offsetLocal;
    const fechaPeru = new Date(ahora.getTime() + diferencia * 60 * 1000);
    return fechaPeru.toISOString().split('T')[0];
}

// Helper para hacer peticiones autenticadas
export async function fetchWithAuth(endpoint, options = {}) {
    let token = '';
    
    // 1. Intentar desde adminSession
    const session = localStorage.getItem('adminSession');
    if (session) {
        try {
            const data = JSON.parse(session);
            token = data.token || data.admin_token || '';
        } catch (e) {
            console.error('Error parsing session:', e);
        }
    }
    
    // 2. Intentar desde claves alternativas si no se encontró en adminSession
    if (!token) {
        token = localStorage.getItem('admin_token') || 
                localStorage.getItem('adminToken') || 
                sessionStorage.getItem('admin_token') || '';
    }
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });
    
    return response;
}

// Helper para peticiones GET autenticadas
export async function apiGet(endpoint) {
    const response = await fetchWithAuth(endpoint);
    return response.json();
}

// Helper para peticiones POST autenticadas
export async function apiPost(endpoint, body) {
    const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    });
    return response.json();
}

// Helper para peticiones PUT autenticadas
export async function apiPut(endpoint, body) {
    const response = await fetchWithAuth(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    });
    return response.json();
}

// Helper para peticiones DELETE autenticadas
export async function apiDelete(endpoint) {
    const response = await fetchWithAuth(endpoint, {
        method: 'DELETE'
    });
    return response.json();
}

export default {
    API_BASE,
    getFechaLocalPeru,
    fetchWithAuth,
    apiGet,
    apiPost,
    apiPut,
    apiDelete
};
