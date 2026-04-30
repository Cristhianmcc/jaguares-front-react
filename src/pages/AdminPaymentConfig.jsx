import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || '';

function getToken() {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || '';
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

export default function AdminPaymentConfig() {
  const [pagos, setPagos] = useState({
    plin: { numero: '', destinatario: '', qr_url: '' },
    yape: { numero: '', alias: '' },
    transferencias: []
  });

  const [status, setStatus] = useState('idle'); // idle, loading, saved, error
  const [statusMsg, setStatusMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  // Cargar datos actuales
  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = useCallback(async () => {
    setStatus('loading');
    try {
      const response = await fetch(`${API_BASE}/api/admin/landing-content`, {
        headers: authHeaders()
      });
      const data = await response.json();
      if (data.success && data.data.pagos) {
        // Backwards compatibility: if pagos.transferencia exists, convert to array
        const pagosServer = { ...data.data.pagos };
        if (pagosServer.transferencia && !pagosServer.transferencias) {
          pagosServer.transferencias = [
            {
              codigo: (pagosServer.transferencia.banco || 'OTRO').toUpperCase(),
              nombre: pagosServer.transferencia.banco || 'Banco',
              cuenta: pagosServer.transferencia.cuenta || '',
              cci: pagosServer.transferencia.cci || '',
              titular: pagosServer.transferencia.titular || '',
              logo: ''
            }
          ];
          delete pagosServer.transferencia;
        }
        setPagos(pagosServer);
        setStatus('idle');
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setStatus('error');
      setStatusMsg('Error al cargar configuración');
    }
  }, []);

  const handleInputChange = (metodo, campo, valor) => {
    setPagos(prev => ({
      ...prev,
      [metodo]: { ...prev[metodo], [campo]: valor }
    }));
  };

  // Transferencias array helpers
  const addTransferencia = () => {
    setPagos(prev => ({
      ...prev,
      transferencias: [...(prev.transferencias || []), { codigo: 'OTRO', nombre: 'Otro Banco', cuenta: '', cci: '', titular: '', logo: '' }]
    }));
  };

  const updateTransferenciaField = (index, field, value) => {
    setPagos(prev => {
      const arr = Array.isArray(prev.transferencias) ? [...prev.transferencias] : [];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, transferencias: arr };
    });
  };

  const removeTransferencia = (index) => {
    setPagos(prev => ({
      ...prev,
      transferencias: prev.transferencias.filter((_, i) => i !== index)
    }));
  };

  const handleQRUpload = async (e, metodo) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_BASE}/api/admin/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        handleInputChange(metodo, 'qr_url', data.url);
        setStatusMsg(`QR ${metodo} actualizado`);
      } else {
        setStatusMsg(data.error || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      setStatusMsg('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = '/admin-panel';
  };

  const handleGuardar = async () => {
    setStatus('loading');
    setStatusMsg('');

    try {
      const response = await fetch(`${API_BASE}/api/admin/landing-content`, {
        method: 'GET',
        headers: authHeaders()
      });
      const data = await response.json();
      
      if (!data.success) throw new Error('Error cargando contenido');

      const contenidoCompleto = data.data;
      contenidoCompleto.pagos = pagos;

      const saveResponse = await fetch(`${API_BASE}/api/admin/landing-content`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(contenidoCompleto)
      });

      const saveData = await saveResponse.json();
      if (saveData.success) {
        setStatus('saved');
        setStatusMsg('✓ Configuración guardada correctamente');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        throw new Error(saveData.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando:', error);
      setStatus('error');
      setStatusMsg(error.message || 'Error al guardar configuración');
    }
  };

  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '30px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      marginBottom: '30px',
      borderBottom: '2px solid #e2e8f0',
      paddingBottom: '20px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
      margin: 0
    },
    card: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    fieldGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '12px',
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '14px',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s'
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    uploadArea: {
      border: '2px dashed #cbd5e1',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: '#f8fafc'
    },
    previewImage: {
      maxWidth: '100%',
      maxHeight: '150px',
      borderRadius: '6px',
      marginTop: '8px',
      border: '1px solid #e2e8f0'
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    btn: {
      padding: '10px 24px',
      fontSize: '14px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textTransform: 'uppercase'
    },
    btnPrimary: {
      background: '#3b82f6',
      color: '#fff'
    },
    btnPrimaryHover: {
      background: '#2563eb',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    btnSecondary: {
      background: '#e2e8f0',
      color: '#1e293b'
    },
    btnSecondaryHover: {
      background: '#cbd5e1'
    },
    statusMessage: {
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    statusSaved: {
      background: '#dcfce7',
      color: '#166534',
      border: '1px solid #bbf7d0'
    },
    statusError: {
      background: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    },
    methodBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    plinBadge: { background: '#dcfce7', color: '#166534' },
    yapeBadge: { background: '#fef08a', color: '#854d0e' },
    transferenciaBadge: { background: '#dbeafe', color: '#0c4a6e' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={styles.title}>Configuración de Métodos de Pago</h1>
            <p style={styles.subtitle}>
              Actualiza los números de teléfono, QR y datos bancarios sin necesidad de modificar el código
            </p>
          </div>
          <button
            type="button"
            onClick={handleGoBack}
            style={{
              ...styles.btn,
              ...styles.btnSecondary,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Atrás
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {statusMsg && (
        <div style={{
          ...styles.statusMessage,
          ...(status === 'saved' ? styles.statusSaved : styles.statusError)
        }}>
          {statusMsg}
        </div>
      )}

      {/* PLIN */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          <span style={{...styles.methodBadge, background: '#dcfce7', color: '#166534'}}>Plin</span>
          Código QR Inmediato
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Número Teléfono</label>
          <input
            type="tel"
            style={styles.input}
            value={pagos.plin?.numero || ''}
            onChange={(e) => handleInputChange('plin', 'numero', e.target.value)}
            placeholder="+51973324460"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Destinatario</label>
          <input
            type="text"
            style={styles.input}
            value={pagos.plin?.destinatario || ''}
            onChange={(e) => handleInputChange('plin', 'destinatario', e.target.value)}
            placeholder="Oscar Orosco"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>URL QR o Sube Imagen</label>
          <input
            type="text"
            style={styles.input}
            value={pagos.plin?.qr_url || ''}
            onChange={(e) => handleInputChange('plin', 'qr_url', e.target.value)}
            placeholder="assets/plinqr.jpeg"
            disabled={uploading}
          />
          {/* QR preview removed to avoid large image rendering in admin panel */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleQRUpload(e, 'plin')}
            disabled={uploading}
            style={{ marginTop: '8px', display: 'block', fontSize: '12px' }}
          />
        </div>
      </div>

      {/* YAPE */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          <span style={{...styles.methodBadge, background: '#fef08a', color: '#854d0e'}}>Yape</span>
          Transferencia Instantánea
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Número Teléfono</label>
          <input
            type="tel"
            style={styles.input}
            value={pagos.yape?.numero || ''}
            onChange={(e) => handleInputChange('yape', 'numero', e.target.value)}
            placeholder="+51973324460"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Alias (Opcional)</label>
          <input
            type="text"
            style={styles.input}
            value={pagos.yape?.alias || ''}
            onChange={(e) => handleInputChange('yape', 'alias', e.target.value)}
            placeholder="oscar.orosco"
          />
        </div>
      </div>

      {/* TRANSFERENCIAS BANCARIAS (lista editable) */}
      {(pagos.transferencias || []).map((t, idx) => (
        <div key={idx} style={styles.card}>
          <div style={styles.cardTitle}>
            <span style={{...styles.methodBadge, ...styles.transferenciaBadge}}>{t.codigo || 'Banco'}</span>
            {t.nombre || 'Transferencia Bancaria'}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Código (ej. BCP)</label>
            <input
              type="text"
              style={styles.input}
              value={t.codigo || ''}
              onChange={(e) => updateTransferenciaField(idx, 'codigo', e.target.value)}
              placeholder="BCP"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Nombre</label>
            <input
              type="text"
              style={styles.input}
              value={t.nombre || ''}
              onChange={(e) => updateTransferenciaField(idx, 'nombre', e.target.value)}
              placeholder="BCP"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Número de Cuenta</label>
            <input
              type="text"
              style={styles.input}
              value={t.cuenta || ''}
              onChange={(e) => updateTransferenciaField(idx, 'cuenta', e.target.value)}
              placeholder="191-23434-0-78"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>CCI (Código de Cuenta Interbancaria)</label>
            <input
              type="text"
              style={styles.input}
              value={t.cci || ''}
              onChange={(e) => updateTransferenciaField(idx, 'cci', e.target.value)}
              placeholder="002191002343402780"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Titular</label>
            <input
              type="text"
              style={styles.input}
              value={t.titular || ''}
              onChange={(e) => updateTransferenciaField(idx, 'titular', e.target.value)}
              placeholder="Oscar Orosco"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Logo / Imagen (ruta)</label>
            <input
              type="text"
              style={styles.input}
              value={t.logo || ''}
              onChange={(e) => updateTransferenciaField(idx, 'logo', e.target.value)}
              placeholder="assets/logo-bcp.jpg"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => removeTransferencia(idx)} style={{ ...styles.btn, background: '#ef4444', color: '#fff', marginLeft: '8px' }}>Eliminar</button>
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'right', marginBottom: '18px' }}>
        <button onClick={addTransferencia} style={{ ...styles.btn, ...styles.btnSecondary, padding: '8px 16px' }}>Agregar Banco</button>
      </div>

      {/* Botones */}
      <div style={styles.buttonGroup}>
        <button
          style={{ ...styles.btn, ...styles.btnSecondary }}
          onClick={cargarConfiguracion}
          disabled={status === 'loading'}
        >
          Recargar
        </button>
        <button
          style={{ ...styles.btn, ...styles.btnPrimary, opacity: status === 'loading' || uploading ? 0.6 : 1 }}
          onClick={handleGuardar}
          disabled={status === 'loading' || uploading}
        >
          {status === 'loading' ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
