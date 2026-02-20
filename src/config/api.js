// Configuración centralizada de la API
const isDevelopment = import.meta.env.DEV;
const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

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
    const session = localStorage.getItem('adminSession');
    let token = '';
    
    if (session) {
        try {
            const data = JSON.parse(session);
            token = data.token;
        } catch (e) {
            console.error('Error parsing session:', e);
        }
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
