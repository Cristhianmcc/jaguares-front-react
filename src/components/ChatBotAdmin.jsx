import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../config/api';

const SUGERENCIAS = [
    '¿Cuántos alumnos hay en total?',
    '¿Cuántas inscripciones activas hay?',
    '¿Qué horarios de Fútbol hay el Lunes?',
    '¿Cuántos alumnos tienen pago pendiente?',
    'Muéstrame los profesores activos',
];

export default function ChatBotAdmin() {
    const [abierto, setAbierto] = useState(false);
    const [mensajes, setMensajes] = useState([
        {
            rol: 'bot',
            texto: '¡Hola! Soy Jaguacito\nPuedes preguntarme sobre alumnos, horarios, inscripciones, docentes, asistencias y más.',
        },
    ]);
    const [input, setInput] = useState('');
    const [cargando, setCargando] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [mensajes, abierto]);

    useEffect(() => {
        if (abierto && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [abierto]);

    async function enviar(texto) {
        const msg = (texto || input).trim();
        if (!msg || cargando) return;

        setInput('');
        setMensajes(prev => [...prev, { rol: 'user', texto: msg }]);
        setCargando(true);

        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/api/admin/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ mensaje: msg }),
            });
            const data = await res.json();
            if (data.success) {
                setMensajes(prev => [...prev, { rol: 'bot', texto: data.respuesta }]);
            } else {
                setMensajes(prev => [...prev, { rol: 'bot', texto: `Error: ${data.error || 'No pude procesar eso.'}`, error: true }]);
            }
        } catch {
            setMensajes(prev => [...prev, { rol: 'bot', texto: 'Sin conexión con el servidor.', error: true }]);
        } finally {
            setCargando(false);
        }
    }

    function handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviar();
        }
    }

    return (
        <>
            {/* Panel del chat */}
            {abierto && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        right: '20px',
                        width: '360px',
                        maxWidth: 'calc(100vw - 40px)',
                        height: '480px',
                        maxHeight: 'calc(100vh - 120px)',
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 9999,
                        overflow: 'hidden',
                        fontFamily: 'inherit',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #d4a017, #f0c040)',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            flexShrink: 0,
                        }}
                    >
                        <img
                            src="/assets/jaguarcito.png"
                            alt="Jaguacito"
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                flexShrink: 0,
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>Jaguacito</div>
                            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)' }}>Consulta rápida de datos</div>
                        </div>
                        <button
                            onClick={() => setAbierto(false)}
                            style={{
                                background: 'rgba(0,0,0,0.12)',
                                border: 'none',
                                borderRadius: '50%',
                                width: 28,
                                height: 28,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 16,
                                color: '#333',
                            }}
                            title="Cerrar"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Mensajes */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            backgroundColor: '#f8f9fa',
                        }}
                    >
                        {mensajes.map((m, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    justifyContent: m.rol === 'user' ? 'flex-end' : 'flex-start',
                                    alignItems: 'flex-start',
                                    gap: 6,
                                }}
                            >
                                {m.rol === 'bot' && (
                                    <img
                                        src="/assets/jaguarcito.png"
                                        alt="Jaguacito"
                                        style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: 4 }}
                                    />
                                )}
                                <div
                                    style={{
                                        maxWidth: '80%',
                                        padding: '9px 13px',
                                        borderRadius: m.rol === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        backgroundColor: m.rol === 'user' ? '#d4a017' : m.error ? '#fee2e2' : '#fff',
                                        color: m.rol === 'user' ? '#fff' : m.error ? '#991b1b' : '#222',
                                        fontSize: 13,
                                        lineHeight: 1.5,
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {m.texto}
                                </div>
                            </div>
                        ))}

                        {/* Indicador "escribiendo" */}
                        {cargando && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: '16px 16px 16px 4px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                        display: 'flex',
                                        gap: 4,
                                        alignItems: 'center',
                                    }}
                                >
                                    {[0, 1, 2].map(n => (
                                        <div
                                            key={n}
                                            style={{
                                                width: 7,
                                                height: 7,
                                                borderRadius: '50%',
                                                backgroundColor: '#d4a017',
                                                animation: `chatBounce 1.2s ${n * 0.2}s infinite ease-in-out`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Sugerencias rápidas (solo al inicio) */}
                    {mensajes.length === 1 && !cargando && (
                        <div
                            style={{
                                padding: '8px 12px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 6,
                                backgroundColor: '#f8f9fa',
                                borderTop: '1px solid #eee',
                            }}
                        >
                            {SUGERENCIAS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => enviar(s)}
                                    style={{
                                        fontSize: 11,
                                        padding: '4px 10px',
                                        borderRadius: 20,
                                        border: '1px solid #d4a017',
                                        backgroundColor: '#fff',
                                        color: '#b8860b',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fef9e7')}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div
                        style={{
                            padding: '10px 12px',
                            borderTop: '1px solid #e5e7eb',
                            display: 'flex',
                            gap: 8,
                            backgroundColor: '#fff',
                            flexShrink: 0,
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Escribe tu consulta..."
                            disabled={cargando}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: 20,
                                border: '1px solid #d1d5db',
                                fontSize: 13,
                                outline: 'none',
                                backgroundColor: cargando ? '#f9fafb' : '#fff',
                            }}
                        />
                        <button
                            onClick={() => enviar()}
                            disabled={cargando || !input.trim()}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                backgroundColor: cargando || !input.trim() ? '#e5e7eb' : '#d4a017',
                                border: 'none',
                                cursor: cargando || !input.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'background 0.15s',
                            }}
                            title="Enviar"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cargando || !input.trim() ? '#9ca3af' : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Botón flotante */}
            <button
                onClick={() => setAbierto(a => !a)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: abierto ? '#b8860b' : '#d4a017',
                    border: '2px solid rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(212,160,23,0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    transition: 'background 0.2s, transform 0.2s',
                    overflow: 'hidden',
                    padding: 0,
                }}
                title={abierto ? 'Cerrar Jaguacito' : 'Hablar con Jaguacito'}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
                {abierto ? (
                    <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, lineHeight: 1 }}>✕</span>
                ) : (
                    <img
                        src="/assets/jaguarcito.png"
                        alt="Jaguacito"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                )}
            </button>

            {/* CSS para animación del typing indicator */}
            <style>{`
                @keyframes chatBounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-5px); opacity: 1; }
                }
            `}</style>
        </>
    );
}
