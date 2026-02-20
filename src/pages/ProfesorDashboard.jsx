import React, { useState, useEffect, useCallback } from 'react';
import '../styles/animations.css';
import { API_BASE, getFechaLocalPeru } from '../config/api';

export default function ProfesorDashboard() {
    const [profesorData, setProfesorData] = useState(null);
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [diaActual, setDiaActual] = useState('');

    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Verificar sesión
    useEffect(() => {
        const session = localStorage.getItem('adminSession');
        if (!session) {
            window.location.href = '/admin-login';
            return;
        }
        try {
            const data = JSON.parse(session);
            if (data.admin?.rol !== 'profesor') {
                window.location.href = '/admin-panel';
                return;
            }
            setProfesorData(data);
            const hoy = dias[new Date().getDay()];
            setDiaActual(hoy);
        } catch (e) {
            window.location.href = '/admin-login';
        }
    }, []);

    // Cargar clases del día
    const cargarClases = useCallback(async (dia) => {
        if (!profesorData) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/profesor/mis-clases?dia=${dia}`, {
                headers: { 'Authorization': `Bearer ${profesorData.token}` }
            });
            const data = await response.json();
            if (data.success) {
                setClases(data.clases || []);
            }
        } catch (error) {
            console.error('Error al cargar clases:', error);
        } finally {
            setLoading(false);
        }
    }, [profesorData]);

    useEffect(() => {
        if (diaActual && profesorData) {
            cargarClases(diaActual);
        }
    }, [diaActual, profesorData, cargarClases]);

    const handleCerrarSesion = () => {
        localStorage.removeItem('adminSession');
        window.location.href = '/admin-login';
    };

    const irATomarAsistencia = (horarioId) => {
        window.location.href = `/profesor-asistencias?horario=${horarioId}`;
    };

    if (!profesorData) return null;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border-color bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm shadow-sm">
                <div className="px-4 py-4 lg:px-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/assets/logo.ico" alt="Logo" className="h-10 w-auto" />
                            <h2 className="text-xl lg:text-2xl font-black italic uppercase text-black dark:text-white">JAGUARES</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-xs text-gray-500 uppercase">Profesor</p>
                                <p className="text-sm font-semibold text-black dark:text-white">{profesorData.email}</p>
                            </div>
                            <button
                                onClick={handleCerrarSesion}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-semibold text-sm flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">logout</span>
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-4 lg:px-10 py-8 max-w-screen-2xl mx-auto">
                {/* Título */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black italic uppercase text-black dark:text-white">
                        Panel de <span className="text-primary">Profesor</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Bienvenido, {profesorData.nombre_completo || profesorData.usuario}</p>
                </div>

                {/* Accesos rápidos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <a href="/profesor-asistencias" className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-blue-500">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-4xl text-blue-500">fact_check</span>
                            <div>
                                <h3 className="font-bold text-black dark:text-white">Tomar Asistencia</h3>
                                <p className="text-sm text-gray-500">Registra asistencia de tus alumnos</p>
                            </div>
                        </div>
                    </a>
                    <a href="/profesor-ranking" className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-yellow-500">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-4xl text-yellow-500">emoji_events</span>
                            <div>
                                <h3 className="font-bold text-black dark:text-white">Ranking</h3>
                                <p className="text-sm text-gray-500">Gestiona puntos y ranking</p>
                            </div>
                        </div>
                    </a>
                    <a href="/profesor-reportes" className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-green-500">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-4xl text-green-500">analytics</span>
                            <div>
                                <h3 className="font-bold text-black dark:text-white">Reportes</h3>
                                <p className="text-sm text-gray-500">Ver estadísticas de asistencia</p>
                            </div>
                        </div>
                    </a>
                </div>

                {/* Selector de día */}
                <div className="mb-6">
                    <label className="block text-sm font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">
                        Clases del día
                    </label>
                    <select
                        value={diaActual}
                        onChange={(e) => setDiaActual(e.target.value)}
                        className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-black dark:text-white w-full md:w-64"
                    >
                        {dias.slice(1, 7).map(dia => (
                            <option key={dia} value={dia}>{dia}</option>
                        ))}
                    </select>
                </div>

                {/* Lista de clases */}
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined">calendar_today</span>
                            Mis Clases - {diaActual}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                            <p className="mt-2 text-gray-500">Cargando clases...</p>
                        </div>
                    ) : clases.length === 0 ? (
                        <div className="p-8 text-center">
                            <span className="material-symbols-outlined text-5xl text-gray-400">event_busy</span>
                            <p className="mt-2 text-gray-500">No tienes clases programadías para {diaActual}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {clases.map((clase, index) => (
                                <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary">sports</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-black dark:text-white">{clase.deporte}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {clase.categoria} • {clase.hora_inicio} - {clase.hora_fin}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-primary">{clase.total_alumnos || 0}</p>
                                                <p className="text-xs text-gray-500">Alumnos</p>
                                            </div>
                                            <button
                                                onClick={() => irATomarAsistencia(clase.horario_id)}
                                                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined">edit_note</span>
                                                Tomar Asistencia
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-surface-light dark:bg-surface-dark py-6 mt-auto border-t border-border-color">
                <p className="text-center text-text-muted text-sm">© 2026 Club Jaguares. Panel de Profesor.</p>
            </footer>
        </div>
    );
}

