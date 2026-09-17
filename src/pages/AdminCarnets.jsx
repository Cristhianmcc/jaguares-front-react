import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { fetchWithAuth, API_BASE } from '../config/api.js';

// Patrones estándar Code 128 (índices 0 al 106)
const CODE128_PATTERNS = [
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
  '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
  '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
  '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
  '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
  '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
  '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
  '114131','311141','411131','211412','211214','211232','2331112'
];

function generateCode128Svg(text, height = 40, maxW = 280) {
  const clean = String(text || '').trim();
  if (!clean) return '';

  let checksum = 104;
  const indices = [104];

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i) - 32;
    indices.push(code);
    checksum += code * (i + 1);
  }

  const checkCode = checksum % 103;
  indices.push(checkCode);
  indices.push(106);

  let pattern = '';
  for (const idx of indices) {
    pattern += CODE128_PATTERNS[idx] || '';
  }

  let x = 6;
  const barWidth = 1.35;
  let rects = [];
  let isBar = true;

  for (let i = 0; i < pattern.length; i++) {
    const width = parseInt(pattern[i], 10) * barWidth;
    if (isBar) {
      rects.push(`<rect x="${x.toFixed(1)}" y="1" width="${width.toFixed(1)}" height="${height}" fill="#000"/>`);
    }
    x += width;
    isBar = !isBar;
  }

  const totalWidth = Math.ceil(x + 6);
  return `<svg viewBox="0 0 ${totalWidth} ${height + 2}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; max-width: ${maxW}px; height: ${height + 2}px; display: block; margin: 0 auto;">${rects.join('')}</svg>`;
}


// Helper para convertir URLs de Google Drive a URLs directas de imagen compatibles con <img>
const getDriveFileId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const matchFile = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile) return matchFile[1];
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId) return matchId[1];
  return null;
};

const formatFotoUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.includes('drive.google.com/thumbnail') || trimmed.includes('lh3.googleusercontent.com')) {
    return trimmed;
  }

  const fileId = getDriveFileId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
  }

  return trimmed;
};

export default function AdminCarnets() {
  const [activeTab, setActiveTab] = useState('carnets');
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  // Estados para Bandeja de Impresión Hoja A4 (4 Carnets 2x2)
  const [slotsA4, setSlotsA4] = useState([null, null, null, null]);
  const [arrastrandoCarnet, setArrastrandoCarnet] = useState(false);
  const [hoverSlotA4, setHoverSlotA4] = useState(null);
  const [generandoA4Cuadruple, setGenerandoA4Cuadruple] = useState(false);

  
  // Opciones de Carnet
  const [formatoCarnet, setFormatoCarnet] = useState('vertical'); // 'vertical' (9cm x 11.5cm) | 'horizontal'
  const [temaImpresion, setTemaImpresion] = useState('dark'); // 'dark' | 'light'
  const [tipoCodigo, setTipoCodigo] = useState('barcode');
  const [generandoImagen, setGenerandoImagen] = useState(false);
  const [toastMensaje, setToastMensaje] = useState('');

  const [destinoQr, setDestinoQr] = useState(
    typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'local'
      : 'produccion'
  );

  // Estados del Escáner de Puerta
  const [dniEscaneo, setDniEscaneo] = useState('');
  const [resultadoEscaneo, setResultadoEscaneo] = useState(null);
  const [modalPagoClase, setModalPagoClase] = useState({
    abierto: false,
    alumno: null,
    monto: 15,
    metodo: 'Efectivo'
  });
  const [cargandoEscaneo, setCargandoEscaneo] = useState(false);
  const [historialEscaneo, setHistorialEscaneo] = useState([]);
  const [usarCamara, setUsarCamara] = useState(false);

  // Estados para WhatsApp del Carnet
  const [mostrarModalWhatsApp, setMostrarModalWhatsApp] = useState(false);
  const [waNumero, setWaNumero] = useState('');
  const [waMensaje, setWaMensaje] = useState('');

  // Estados de Autenticación
  const [authError, setAuthError] = useState(false);
  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [iniciandoSesion, setIniciandoSesion] = useState(false);

  const inputScannerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    cargarAlumnos();

    const params = new URLSearchParams(window.location.search);
    const dniUrl = params.get('dni');
    if (dniUrl) {
      setActiveTab('scanner');
      setDniEscaneo(dniUrl);
      procesarEscaneo(dniUrl);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'scanner' && usarCamara) {
      iniciarCamara();
    } else {
      detenerCamara();
    }
    return () => detenerCamara();
  }, [activeTab, usarCamara]);

  useEffect(() => {
    if (activeTab !== 'scanner') return;

    if (inputScannerRef.current) {
      inputScannerRef.current.focus();
    }

    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e) => {
      if (mostrarModalLogin) return;

      const target = e.target;
      if (target && target.tagName === 'INPUT' && target !== inputScannerRef.current) return;
      if (target && target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      if (timeDiff > 250) {
        barcodeBuffer = '';
      }

      if (e.key === 'Enter') {
        const codigoLeido = (barcodeBuffer || (inputScannerRef.current ? inputScannerRef.current.value : '')).trim();
        if (codigoLeido.length >= 6) {
          e.preventDefault();
          barcodeBuffer = '';
          setDniEscaneo(codigoLeido);
          procesarEscaneo(codigoLeido);
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [activeTab, mostrarModalLogin, cargandoEscaneo]);

  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('No se pudo acceder a la cámara:', err);
      alert('No se pudo acceder a la cámara. Verifique los permisos de su navegador.');
      setUsarCamara(false);
    }
  };

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const getAuthToken = () => {
    try {
      const s = localStorage.getItem('adminSession');
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.token) return parsed.token;
      }
      return localStorage.getItem('admin_token') || localStorage.getItem('adminToken') || sessionStorage.getItem('admin_token') || '';
    } catch {
      return localStorage.getItem('admin_token') || localStorage.getItem('adminToken') || sessionStorage.getItem('admin_token') || '';
    }
  };

  const cargarAlumnos = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/admin/inscritos');
      if (res.status === 401 || res.status === 403) {
        setAuthError(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setAuthError(false);
      
      const lista = data.inscritos || data.data || (Array.isArray(data) ? data : []);
      const mapUnicos = new Map();
      lista.forEach(item => {
        if (item.dni && !mapUnicos.has(item.dni)) {
          mapUnicos.set(item.dni, item);
        }
      });
      const alumnosUnicos = Array.from(mapUnicos.values());

      setAlumnos(alumnosUnicos);
      if (alumnosUnicos.length > 0 && !alumnoSeleccionado) {
        cargarDetalleCarnet(alumnosUnicos[0].dni);
      }
    } catch (err) {
      console.error('Error cargando alumnos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (e) => {
    e.preventDefault();
    if (!loginUser || !loginPass) return;
    setIniciandoSesion(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginUser, password: loginPass })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('adminSession', JSON.stringify({
          token: data.token,
          admin: data.admin,
          timestamp: new Date().toISOString()
        }));
        setMostrarModalLogin(false);
        setAuthError(false);
        setLoginUser('');
        setLoginPass('');
        await cargarAlumnos();
      } else {
        setLoginError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setLoginError('Error de conexión con el servidor');
    } finally {
      setIniciandoSesion(false);
    }
  };

  const cargarDetalleCarnet = async (dni) => {
    if (!dni) return;
    setCargandoDetalle(true);
    try {
      const res = await fetchWithAuth(`/api/consultar/${encodeURIComponent(dni)}?incluir_inactivos=1&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.alumno) {
          setAlumnoSeleccionado(data);
          return;
        }
      }

      const resAdmin = await fetchWithAuth(`/api/admin/inscripciones/${encodeURIComponent(dni)}`);
      if (resAdmin.ok) {
        const dataAdmin = await resAdmin.json();
        if (dataAdmin.success) {
          setAlumnoSeleccionado({
            success: true,
            alumno: dataAdmin.alumno,
            pago: { estado: dataAdmin.alumno?.estado_pago || 'pendiente' },
            inscripciones: dataAdmin.inscripciones
          });
          return;
        }
      }
    } catch (err) {
      console.error('Error cargando carnet:', err);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const buscarDirectoDni = async (dniManual) => {
    const d = (dniManual || busqueda).trim();
    if (!d || d.length < 6) return;
    await cargarDetalleCarnet(d);
  };

  const emitirSonido = (tipo) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (tipo === 'exito') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  const procesarEscaneo = async (valorEntrada, forzarIngreso = false, opcionesPagoClase = null) => {
    if (cargandoEscaneo) return;
    let dni = (valorEntrada || dniEscaneo).trim();
    if (!dni) return;

    if (dni.includes('dni=')) {
      const match = dni.match(/dni=([a-zA-Z0-9_-]+)/);
      if (match) dni = match[1];
    } else if (dni.includes('/')) {
      const parts = dni.split('/');
      dni = parts[parts.length - 1];
    }

    dni = dni.replace(/[^0-9a-zA-Z]/g, '');
    if (!dni || dni.length < 6) return;

    setCargandoEscaneo(true);
    try {
      const bodyData = { dni, forzar_ingreso: forzarIngreso };
      if (opcionesPagoClase) {
        bodyData.pago_clase = true;
        bodyData.monto_clase = opcionesPagoClase.monto || 15;
        bodyData.metodo_pago_clase = opcionesPagoClase.metodo || 'Efectivo';
      }

      const res = await fetchWithAuth('/api/admin/carnets/validar-acceso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) {
        throw new Error(`Error en el servidor: HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.success && data.alumno) {
        emitirSonido(data.activo ? 'exito' : 'error');

        const esExcepcion = data.aviso === 'INGRESO AUTORIZADO POR ADMINISTRACIÓN' || (data.estado_original === 'inactiva' && data.activo);

        const nuevoResultado = {
          success: true,
          activo: data.activo,
          es_excepcion: esExcepcion,
          es_pago_clase: data.es_pago_clase || (opcionesPagoClase ? true : false),
          monto_pago_clase: data.monto_pago_clase || (opcionesPagoClase ? opcionesPagoClase.monto : null),
          metodo_pago_clase: data.metodo_pago_clase || (opcionesPagoClase ? opcionesPagoClase.metodo : null),
          aviso: data.aviso,
          motivo: data.motivo,
          pase_entregado: data.pase_entregado,
          asistencia_puerta_registrada: data.asistencia_puerta_registrada,
          hora_ingreso: data.hora_ingreso,
          puede_autorizar: data.puede_autorizar,
          alumno: data.alumno,
          horario_hoy: data.horario_hoy,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        setResultadoEscaneo(nuevoResultado);
        setHistorialEscaneo(prev => [nuevoResultado, ...prev.slice(0, 14)]);
      } else {
        emitirSonido('error');
        setResultadoEscaneo({
          success: false,
          dni,
          error: data.error || 'Alumno no encontrado en el sistema',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      }
    } catch (err) {
      console.error('Error al escanear:', err);
      emitirSonido('error');
      setResultadoEscaneo({
        success: false,
        dni,
        error: 'Error de red o conexión al servidor',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    } finally {
      setCargandoEscaneo(false);
      setDniEscaneo('');
      if (inputScannerRef.current) inputScannerRef.current.focus();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // [DATO 1]: Primer Nombre y Primer Apellido
  const getPrimerNombreYPrimerApellido = (nombres, apellidos) => {
    const primerNombre = (nombres || '').trim().split(/\s+/)[0] || '';
    const primerApellido = (apellidos || '').trim().split(/\s+/)[0] || '';
    return `${primerNombre} ${primerApellido}`.toUpperCase().trim() || 'ALUMNO JAGUARES';
  };

  // [DATO 3]: Año de Nacimiento
  const getAnioNacimiento = (fecha) => {
    if (!fecha) return '----';
    const match = String(fecha).match(/(\d{4})/);
    return match ? match[1] : '----';
  };

  // Normalizador de tildes
  const limpiarTexto = (t) => {
    if (!t) return '';
    return String(t)
      .replace(/FÃºtbol|FÃ°tbol|F\uFFFDtbol/gi, 'Fútbol')
      .replace(/EconÃ³mico|EconÃ³m|Econ\uFFFDmico/gi, 'Económico')
      .replace(/EstÃ¡ndar|Est\uFFFDndar/gi, 'Estándar')
      .replace(/CategorÃ­a|Categor\uFFFD/gi, 'Categoría')
      .replace(/BÃ¡squet|B\uFFFDsquet/gi, 'Básquet')
      .replace(/VÃ³ley|V\uFFFDley/gi, 'Vóley');
  };

  // Helper para captura 100% IDÉNTICA a la pantalla usando el motor de renderizado nativo del navegador
  const capturarCarnetDataUrl = async (carnetEl, formato = 'jpeg') => {
    const bgFondo = temaImpresion === 'light' ? '#ffffff' : '#0a0f1d';
    const options = {
      quality: 0.98,
      pixelRatio: 3, // 300 DPI ultra HD
      backgroundColor: bgFondo,
      cacheBust: false,
      skipFonts: true,
      filter: (node) => {
        // Ignorar imágenes que fallaron al cargar (404 / eliminadas) o están ocultas
        if (node.tagName === 'IMG' && (node.style.display === 'none' || node.naturalWidth === 0)) {
          return false;
        }
        return true;
      },
      style: {
        transform: 'none',
        margin: '0',
      }
    };

    try {
      if (formato === 'png') {
        return await htmlToImage.toPng(carnetEl, options);
      } else {
        return await htmlToImage.toJpeg(carnetEl, options);
      }
    } catch (err) {
      console.warn('htmlToImage falló, usando respaldo html2canvas:', err);
      const canvas = await html2canvas(carnetEl, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: bgFondo,
        logging: false,
      });
      return canvas.toDataURL(formato === 'png' ? 'image/png' : 'image/jpeg', 0.98);
    }
  };

  // 1. Exportar PDF con tamaño exacto del carnet: 90mm ancho x 115mm alto (página completa carnet)
  const exportarCarnetPDF = async () => {
    const carnetEl = document.getElementById('carnetImprimible');
    if (!carnetEl || !alumnoSeleccionado) return;
    setGenerandoImagen(true);

    try {
      const al = alumnoSeleccionado.alumno || {};
      const nombreAlumno = getPrimerNombreYPrimerApellido(al.nombres, al.apellidos);
      const safeNombre = nombreAlumno.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Carnet_${safeNombre}.pdf`;

      // Captura ultra-fiel nativa sin desfase de textos
      const imgData = await capturarCarnetDataUrl(carnetEl, 'jpeg');

      // PDF con medida física EXACTA de la mica: 90mm de ancho x 115mm de alto
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [90, 115]
      });

      // Se dibuja en toda la página del PDF (0, 0 a 90mm x 115mm)
      pdf.addImage(imgData, 'JPEG', 0, 0, 90, 115, undefined, 'FAST');

      pdf.save(filename);
      setToastMensaje('¡PDF descargado en tamaño oficial 9x11.5 cm! Listo para visualizar o imprimir.');
      setTimeout(() => setToastMensaje(''), 5000);
    } catch (err) {
      console.error('Error generando PDF:', err);
      setToastMensaje('Hubo un error al generar el PDF del carnet.');
      setTimeout(() => setToastMensaje(''), 4000);
    } finally {
      setGenerandoImagen(false);
    }
  };

  // 2. Exportar en Hoja A4 con guías de corte para imprimir en hoja común
  
  // Funciones para la Bandeja de Impresión Hoja A4 (4 Carnets 2x2)
  const agregarAlumnoASlot = async (slotIndex) => {
    const carnetEl = document.getElementById('carnetImprimible');
    if (!carnetEl || !alumnoSeleccionado) {
      setToastMensaje('Selecciona primero un alumno para agregarlo a la hoja.');
      setTimeout(() => setToastMensaje(''), 3500);
      return;
    }

    let targetIndex = slotIndex;
    if (targetIndex === undefined || targetIndex === null) {
      targetIndex = slotsA4.findIndex(s => s === null);
      if (targetIndex === -1) {
        setToastMensaje('¡La hoja A4 ya tiene los 4 espacios ocupados! Quita uno o vacía la hoja.');
        setTimeout(() => setToastMensaje(''), 4000);
        return;
      }
    }

    try {
      const dataUrl = await capturarCarnetDataUrl(carnetEl, 'jpeg');
      const al = alumnoSeleccionado.alumno || {};
      const nombre = getPrimerNombreYPrimerApellido(al.nombres, al.apellidos);
      const dni = al.dni || '';
      const deporte = alumnoSeleccionado.inscripciones?.[0]?.deporte || 'Fútbol';
      const plan = alumnoSeleccionado.inscripciones?.[0]?.plan || 'Oficial';

      setSlotsA4(prev => {
        const copy = [...prev];
        copy[targetIndex] = {
          dataUrl,
          alumno: al,
          nombre,
          dni,
          deporte,
          plan,
          formato: formatoCarnet
        };
        return copy;
      });

      setToastMensaje(`¡Carnet de ${nombre} asignado al Espacio ${targetIndex + 1} de la Hoja A4!`);
      setTimeout(() => setToastMensaje(''), 3500);
    } catch (err) {
      console.error('Error al capturar carnet para slot A4:', err);
      setToastMensaje('No se pudo capturar el carnet para la hoja A4.');
      setTimeout(() => setToastMensaje(''), 3500);
    }
  };

  const quitarDeSlot = (slotIndex) => {
    setSlotsA4(prev => {
      const copy = [...prev];
      copy[slotIndex] = null;
      return copy;
    });
    setToastMensaje(`Espacio ${slotIndex + 1} liberado.`);
    setTimeout(() => setToastMensaje(''), 2500);
  };

  const vaciarHojaA4 = () => {
    setSlotsA4([null, null, null, null]);
    setToastMensaje('Hoja A4 vaciada. Lista para un nuevo lote.');
    setTimeout(() => setToastMensaje(''), 2500);
  };

  const exportarPdfHojaA4Cuadruple = async (accion = 'descargar') => {
    const ocupados = slotsA4.filter(Boolean);
    if (ocupados.length === 0) {
      setToastMensaje('Agrega al menos 1 carnet a la hoja A4 antes de imprimir o descargar.');
      setTimeout(() => setToastMensaje(''), 4000);
      return;
    }

    setGenerandoA4Cuadruple(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Medidas de carnet oficial: 90mm x 115mm
      const carnetW = 90;
      const carnetH = 115;

      // Coordenadas exactas para cuadrícula 2x2 en A4 (210mm x 297mm):
      // Ancho: 10mm margen + 90mm + 10mm separación + 90mm + 10mm margen = 210mm
      // Alto:  20mm margen + 115mm + 20mm separación + 115mm + 27mm margen = 297mm
      const posiciones = [
        { x: 10,  y: 20 },  // Slot 0: Arriba Izquierda
        { x: 110, y: 20 },  // Slot 1: Arriba Derecha
        { x: 10,  y: 155 }, // Slot 2: Abajo Izquierda
        { x: 110, y: 155 }, // Slot 3: Abajo Derecha
      ];

      // Encabezado superior oficial
      pdf.setFontSize(8.5);
      pdf.setTextColor(80, 80, 80);
      pdf.text('CLUB DEPORTES JAGUARES - PLANTILLA OFICIAL DE IMPRESIÓN EN HOJA A4 (4 CARNETS)', 105, 10, { align: 'center' });
      pdf.setFontSize(7);
      pdf.setTextColor(130, 130, 130);
      pdf.text('Imprimir en escala 100% (sin ajuste de página) en papel fotográfico u opalina A4 (9 cm × 11.5 cm por carnet).', 105, 14.5, { align: 'center' });

      // Pie de página
      pdf.setFontSize(7.5);
      pdf.setTextColor(120, 120, 120);
      pdf.text('Líneas punteadas exteriores diseñadas para corte exacto con guillotina o tijera para mica estándar.', 105, 290, { align: 'center' });

      // Dibujar los slots
      slotsA4.forEach((slot, index) => {
        const pos = posiciones[index];
        
        // Línea de corte punteada
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineDashPattern([2, 2], 0);
        pdf.setLineWidth(0.25);
        pdf.rect(pos.x - 0.5, pos.y - 0.5, carnetW + 1, carnetH + 1);

        if (slot && slot.dataUrl) {
          // Marcador de tijera arriba de cada carnet
          pdf.setFontSize(6.5);
          pdf.setTextColor(130, 130, 130);
          pdf.text(`✂ Espacio ${index + 1}: ${slot.nombre} (DNI ${slot.dni})`, pos.x + carnetW / 2, pos.y - 2, { align: 'center' });

          // Imagen del carnet en alta resolución
          pdf.addImage(slot.dataUrl, 'JPEG', pos.x, pos.y, carnetW, carnetH, undefined, 'FAST');
        } else {
          // Espacio vacío marcado en el PDF
          pdf.setFontSize(8);
          pdf.setTextColor(200, 200, 200);
          pdf.text(`[ Espacio ${index + 1} Vacío ]`, pos.x + carnetW / 2, pos.y + carnetH / 2, { align: 'center' });
        }
      });

      if (accion === 'imprimir') {
        const blobUrl = pdf.output('bloburl');
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow) {
          printWindow.addEventListener('load', () => {
            printWindow.print();
          });
        }
        setToastMensaje('¡Abriendo vista de impresión de la Hoja A4!');
      } else {
        const fechaStr = new Date().toISOString().split('T')[0];
        pdf.save(`Hoja_A4_4_Carnets_${fechaStr}.pdf`);
        setToastMensaje('¡Hoja A4 (4 carnets) descargada con éxito!');
      }
      setTimeout(() => setToastMensaje(''), 4500);
    } catch (err) {
      console.error('Error al generar PDF Hoja A4:', err);
      setToastMensaje('Hubo un error al generar la Hoja A4.');
      setTimeout(() => setToastMensaje(''), 4000);
    } finally {
      setGenerandoA4Cuadruple(false);
    }
  };

  const exportarCarnetHojaA4 = async () => {
    const carnetEl = document.getElementById('carnetImprimible');
    if (!carnetEl || !alumnoSeleccionado) return;
    setGenerandoImagen(true);

    try {
      const al = alumnoSeleccionado.alumno || {};
      const nombreAlumno = getPrimerNombreYPrimerApellido(al.nombres, al.apellidos);
      const safeNombre = nombreAlumno.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Imprimir_A4_Carnet_${safeNombre}.pdf`;

      const imgData = await capturarCarnetDataUrl(carnetEl, 'jpeg');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const carnetW = 90;
      const carnetH = 115;
      const posX = (210 - carnetW) / 2; // 60mm centrado
      const posY = 35; // Centrado verticalmente arriba

      // Líneas de corte punteadas
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.setLineWidth(0.3);
      pdf.rect(posX - 0.5, posY - 0.5, carnetW + 1, carnetH + 1);

      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.text('CARNET OFICIAL CLUB DEPORTES JAGUARES (9 cm de ancho × 11.5 cm de alto)', 105, posY - 8, { align: 'center' });
      pdf.setFontSize(7.5);
      pdf.setTextColor(130, 130, 130);
      pdf.text('Recorte por la línea de puntos exterior para colocar directamente dentro de la mica.', 105, posY - 3.5, { align: 'center' });

      pdf.addImage(imgData, 'JPEG', posX, posY, carnetW, carnetH, undefined, 'FAST');

      pdf.text('Imprimir al 100% de escala en papel fotográfico u opalina (sin ajuste de página)', 105, posY + carnetH + 8, { align: 'center' });

      pdf.save(filename);
      setToastMensaje('¡Hoja A4 generada con guías de corte listas!');
      setTimeout(() => setToastMensaje(''), 5000);
    } catch (err) {
      console.error('Error generando Hoja A4:', err);
    } finally {
      setGenerandoImagen(false);
    }
  };

  // 3. Exportar carnet como imagen JPG o PNG 100% IDÉNTICA A LA PANTALLA
  const exportarCarnetImagen = async (formato = 'jpg', descargar = true, copiar = true) => {
    const carnetEl = document.getElementById('carnetImprimible');
    if (!carnetEl || !alumnoSeleccionado) return;
    setGenerandoImagen(true);

    try {
      const al = alumnoSeleccionado.alumno || {};
      const nombreAlumno = getPrimerNombreYPrimerApellido(al.nombres, al.apellidos);
      const safeNombre = nombreAlumno.replace(/[^a-zA-Z0-9]/g, '_');
      const extension = formato === 'png' ? 'png' : 'jpg';
      const filename = `Carnet_${safeNombre}.${extension}`;

      // Captura directa nativa
      const dataUrl = await capturarCarnetDataUrl(carnetEl, formato === 'png' ? 'png' : 'jpeg');

      if (descargar) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      if (copiar && navigator.clipboard && window.ClipboardItem) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setToastMensaje(`¡Carnet (${extension.toUpperCase()}) descargado y copiado al portapapeles! Puedes pegarlo (Ctrl + V) en WhatsApp.`);
          setTimeout(() => setToastMensaje(''), 5000);
        } catch (clipErr) {
          setToastMensaje(`¡Carnet (${extension.toUpperCase()}) descargado en tu computadora!`);
          setTimeout(() => setToastMensaje(''), 4000);
        }
      }
    } catch (err) {
      console.error('Error generando imagen de carnet:', err);
      setToastMensaje('Hubo un problema generando la imagen del carnet.');
      setTimeout(() => setToastMensaje(''), 4000);
    } finally {
      setGenerandoImagen(false);
    }
  };

    const abrirModalWhatsApp = () => {
    if (!alumnoSeleccionado) return;
    const al = alumnoSeleccionado.alumno || {};
    const alLista = alumnos.find(a => a.dni === al.dni) || {};

    const numRaw = al.telefono_apoderado || al.telefono || alLista.telefono_apoderado || alLista.telefono || '';
    let numClean = String(numRaw).replace(/[^0-9]/g, '');
    if (numClean.length === 9 && numClean.startsWith('9')) {
      numClean = '51' + numClean;
    }

    const nombreAlumno = getPrimerNombreYPrimerApellido(al.nombres, al.apellidos);
    const plan = limpiarTexto(alumnoSeleccionado.inscripciones?.[0]?.plan || 'Oficial');
    const deporte = limpiarTexto(alumnoSeleccionado.inscripciones?.[0]?.deporte || 'Fútbol');

    const textoDefault = `Estimado(a) apoderado(a):\n\nLe hacemos entrega del Carnet Oficial de Membresía 2026 para el alumno(a): *${nombreAlumno}* (${deporte} - Plan ${plan}).\n\nAdjuntamos su carnet digital oficial. Por favor consérvelo en su teléfono o preséntelo impreso en portería para el control de acceso a los entrenamientos.\n\nAtentamente,\nJAGUARES`;

    setWaNumero(numClean);
    setWaMensaje(textoDefault);
    setMostrarModalWhatsApp(true);
  };

  const enviarPorWhatsApp = async () => {
    if (!waNumero || waNumero.trim().length < 8) {
      alert('Por favor ingrese un número de WhatsApp válido.');
      return;
    }
    
    await exportarCarnetImagen(true, true);

    const cleanNum = waNumero.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNum}?text=${encodeURIComponent(waMensaje)}`;
    window.open(url, '_blank');
    setMostrarModalWhatsApp(false);
  };

  const alumnosFiltrados = alumnos.filter(a => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      (a.dni && String(a.dni).toLowerCase().includes(q)) ||
      (a.nombres && String(a.nombres).toLowerCase().includes(q)) ||
      (a.apellidos && String(a.apellidos).toLowerCase().includes(q)) ||
      (a.deporte && String(a.deporte).toLowerCase().includes(q))
    );
  });

  const getQrVerificationUrl = (dni) => {
    if (destinoQr === 'produccion') {
      return `https://jaguarescar.com/verificar-carnet?dni=${encodeURIComponent(dni || '')}`;
    }
    const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? '192.168.1.8'
      : window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `http://${host}${port}/verificar-carnet?dni=${encodeURIComponent(dni || '')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-12">
      {/* Estilos para impresión exacta: 90mm ancho x 115mm alto para la mica */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          body * {
            visibility: hidden !important;
          }
          #carnetPrintWrapper, #carnetPrintWrapper * {
            visibility: visible !important;
          }
          #carnetPrintWrapper {
            position: fixed !important;
            top: 25mm !important;
            left: 0 !important;
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
            background: transparent !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          #carnetImprimible.formato-vertical {
            width: 90mm !important;
            min-width: 90mm !important;
            max-width: 90mm !important;
            height: 115mm !important;
            min-height: 115mm !important;
            max-height: 115mm !important;
            margin: 0 auto !important;
            border: 2px solid #d97706 !important;
            box-shadow: none !important;
            outline: 1.5px dashed #94a3b8 !important;
            outline-offset: 1mm !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
          #carnetImprimible.formato-horizontal {
            width: 86mm !important;
            max-width: 86mm !important;
            height: 54mm !important;
            max-height: 54mm !important;
            margin: 0 auto !important;
            border: 2px solid #d97706 !important;
            box-shadow: none !important;
            transform: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.ico" alt="Jaguares" className="h-9 w-auto" />
            <div>
              <h2 className="text-xl font-black italic tracking-wider uppercase text-slate-900 dark:text-white flex items-center gap-2">
                JAGUARES <span className="text-amber-500 font-bold text-sm tracking-normal">| Carnets & Control</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/admin-panel"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Volver al Panel
            </a>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMensaje && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <span className="material-symbols-outlined text-2xl">check_circle</span>
          <p className="text-sm font-bold">{toastMensaje}</p>
        </div>
      )}

      {/* Modal para enviar Carnet por WhatsApp */}
      {mostrarModalWhatsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl text-emerald-500">
                    chat
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Enviar Carnet por WhatsApp
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Alumno: <strong>{getPrimerNombreYPrimerApellido(alumnoSeleccionado?.alumno?.nombres, alumnoSeleccionado?.alumno?.apellidos)}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalWhatsApp(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Número de WhatsApp (con código de país ej: 51999888777)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                    phone
                  </span>
                  <input
                    type="text"
                    value={waNumero}
                    onChange={(e) => setWaNumero(e.target.value)}
                    placeholder="51999888777"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  <span className={`material-symbols-outlined text-sm ${waNumero ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {waNumero ? 'check_circle' : 'info'}
                  </span>
                  <span>
                    {waNumero ? 'Número registrado detectado automáticamente.' : 'Ingrese el número del apoderado manualmente.'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Mensaje a Enviar
                </label>
                <textarea
                  rows="5"
                  value={waMensaje}
                  onChange={(e) => setWaMensaje(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white resize-none font-sans"
                />
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-500 text-xl mt-0.5 flex-shrink-0">auto_awesome</span>
                <p className="text-[11.5px] text-slate-700 dark:text-slate-200 leading-relaxed">
                  <strong>Envío directo:</strong> Al pulsar <strong>"Abrir WhatsApp"</strong>, el carnet se descarga automáticamente y se copia a tu portapapeles. Solo presiona <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono font-bold">Ctrl + V</kbd> en WhatsApp Web o arrastra el archivo descargado para enviarlo como imagen adjunta.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => exportarCarnetImagen('jpg', true, true)}
                  disabled={generandoImagen}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Descargar PNG
                </button>
                <button
                  type="button"
                  onClick={enviarPorWhatsApp}
                  disabled={generandoImagen}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  {generandoImagen ? 'Generando...' : 'Abrir WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Carnets & <span className="text-amber-500">Control de Acceso</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Credenciales oficiales con código de barras adaptadas al porta fotocheck del club (9 cm × 11.5 cm).
            </p>
          </div>

          {/* Selector de Pestañas */}
          <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl">
            <button
              onClick={() => setActiveTab('carnets')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'carnets'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">badge</span>
              Generador de Carnets
            </button>
            <button
              onClick={() => {
                setActiveTab('scanner');
                setTimeout(() => inputScannerRef.current?.focus(), 150);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'scanner'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
              Control de Puerta (Escáner)
            </button>
          </div>
        </div>

        {/* PESTAÑA 1: GENERADOR DE CARNETS */}
        {activeTab === 'carnets' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-6 items-start">
            {/* Buscador y Lista de Alumnos */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Buscar Alumno ({alumnosFiltrados.length})
                </h3>
              </div>

              <div className="relative mb-4 flex gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') buscarDirectoDni();
                    }}
                    placeholder="Buscar por DNI, nombre o disciplina..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={() => buscarDirectoDni()}
                  title="Buscar DNI directamente en base de datos"
                  className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-colors flex items-center justify-center shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">search</span>
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-left animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-500 text-2xl mt-0.5">lock_clock</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-amber-800 dark:text-amber-200">
                        Sesión Expirada o No Iniciada
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Inicia sesión para cargar la lista completa de alumnos.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => setMostrarModalLogin(true)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-base">login</span>
                          Iniciar Sesión Rápido
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-3xl text-amber-500">progress_activity</span>
                  <p className="text-xs font-medium mt-2">Cargando alumnos...</p>
                </div>
              ) : alumnosFiltrados.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-400">person_search</span>
                  <p className="text-sm font-medium">No se encontraron alumnos con ese criterio</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {alumnosFiltrados.map((a) => {
                    const isSelected = alumnoSeleccionado?.alumno?.dni === a.dni;
                    return (
                      <div
                        key={a.dni || a.alumno_id}
                        onClick={() => cargarDetalleCarnet(a.dni)}
                        className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-500/60 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-black flex items-center justify-center text-sm flex-shrink-0">
                            {(a.nombres || 'A')[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                              {a.nombres} {a.apellidos}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 font-mono">
                              DNI: {a.dni} • {limpiarTexto(a.deporte || a.deportes)}
                            </p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-lg">chevron_right</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Previsualización del Carnet Oficial */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-5 flex flex-col items-center">
              <div className="w-full mb-3 flex flex-col gap-2.5">
                {/* Fila 1: Título de Formato y Selectores de Configuración */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {formatoCarnet === 'vertical' ? 'Carnet Vertical (9 × 11.5 cm)' : 'Carnet Horizontal (CR80)'}
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Selector de Formato: Vertical vs Horizontal */}
                    <div className="inline-flex p-0.5 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setFormatoCarnet('vertical')}
                        className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                          formatoCarnet === 'vertical'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Formato Vertical 9cm x 11.5cm exactos para la mica del cliente"
                      >
                        <span className="material-symbols-outlined text-sm">portrait</span>
                        Vertical
                      </button>
                      <button
                        onClick={() => setFormatoCarnet('horizontal')}
                        className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                          formatoCarnet === 'horizontal'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Formato Horizontal CR80"
                      >
                        <span className="material-symbols-outlined text-sm">landscape</span>
                        Horizontal
                      </button>
                    </div>

                    {/* Selector de Tipo de Código */}
                    <div className="inline-flex p-0.5 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setTipoCodigo('barcode')}
                        className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                          tipoCodigo === 'barcode'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Código de Barras Code 128: Para pistola lectora USB en portería"
                      >
                        <span className="material-symbols-outlined text-sm">barcode</span>
                        Barras
                      </button>
                      <button
                        onClick={() => setTipoCodigo('qr')}
                        className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                          tipoCodigo === 'qr'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Código QR: Para cámara de celular"
                      >
                        <span className="material-symbols-outlined text-sm">qr_code_2</span>
                        QR
                      </button>
                    </div>

                    {/* Selector de Tema */}
                    <div className="inline-flex p-0.5 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setTemaImpresion('dark')}
                        className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                          temaImpresion === 'dark'
                            ? 'bg-slate-900 text-amber-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-slate-950 border border-amber-400 inline-block" />
                        Oscuro
                      </button>
                      <button
                        onClick={() => setTemaImpresion('light')}
                        className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                          temaImpresion === 'light'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-white border border-slate-400 inline-block" />
                        Claro
                      </button>
                    </div>
                  </div>
                </div>

                {/* Fila 2: Acciones del Carnet Individual (flex-wrap garantizado) */}
                {alumnoSeleccionado && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 w-full pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Imprimir carnet individual"
                    >
                      <span className="material-symbols-outlined text-sm">print</span>
                      <span>Imprimir</span>
                    </button>

                    <button
                      onClick={exportarCarnetPDF}
                      disabled={generandoImagen}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-all shadow-xs hover:shadow cursor-pointer active:scale-95"
                      title="Descargar PDF con tamaño exacto de la mica (9cm x 11.5cm)"
                    >
                      <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                      <span>{generandoImagen ? 'Generando...' : 'PDF Carnet'}</span>
                    </button>

                    <button
                      onClick={exportarCarnetHojaA4}
                      disabled={generandoImagen}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Descargar PDF en hoja A4 centrado con guías para recortar (1 carnet)"
                    >
                      <span className="material-symbols-outlined text-sm">content_cut</span>
                      <span>Hoja A4 (1)</span>
                    </button>

                    <button
                      onClick={() => exportarCarnetImagen('jpg', true, true)}
                      disabled={generandoImagen}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Descargar carnet en alta definición como JPG"
                    >
                      <span className="material-symbols-outlined text-sm">image</span>
                      <span>JPG</span>
                    </button>

                    <button
                      onClick={() => exportarCarnetImagen('png', true, true)}
                      disabled={generandoImagen}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Descargar carnet como imagen PNG"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>PNG</span>
                    </button>

                    <button
                      onClick={abrirModalWhatsApp}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
                      title="Enviar carnet por WhatsApp al apoderado"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </button>
                  </div>
                )}
              </div>

              {cargandoDetalle ? (
                <div className="text-center py-20 text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-4xl text-amber-500">progress_activity</span>
                  <p className="text-sm font-medium mt-2">Generando carnet...</p>
                </div>
              ) : alumnoSeleccionado ? (
                <>
                  {/* Barra compacta de asignación a Hoja A4 y Drag & Drop */}
                  <div className="flex items-center justify-between w-full max-w-[360px] mb-2 px-1 gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold select-none leading-none">
                      <span className="material-symbols-outlined text-sm text-amber-500 animate-pulse">drag_indicator</span>
                      <span>Arrastra a la Hoja A4</span>
                      <span className="material-symbols-outlined text-xs text-amber-400/80">arrow_forward</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => agregarAlumnoASlot()}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-xs active:scale-95 flex-shrink-0 cursor-pointer leading-none"
                      title="Asignar carnet al siguiente espacio libre de la Hoja A4"
                    >
                      <span className="material-symbols-outlined text-sm">add_to_photos</span>
                      <span>Agregar a Hoja A4</span>
                    </button>
                  </div>
              <div id="carnetPrintWrapper" className="w-full flex justify-center py-1">
                  {/* ====== VISTA VERTICAL 9cm x 11.5cm CON LOS 5 DATOS EXACTOS PEDIDOS ====== */}
                  {formatoCarnet === 'vertical' ? (
                    <div
                      id="carnetImprimible"
                      draggable={Boolean(alumnoSeleccionado)}
                      onDragStart={(e) => {
                        if (!alumnoSeleccionado) return;
                        e.dataTransfer.setData('text/plain', 'carnet-actual');
                        setArrastrandoCarnet(true);
                      }}
                      onDragEnd={() => {
                        setArrastrandoCarnet(false);
                        setHoverSlotA4(null);
                      }}
                      className={`formato-vertical w-[360px] h-[460px] rounded-2xl overflow-hidden relative border-2 transition-all flex flex-col justify-between shadow-2xl ${
                        temaImpresion === 'light'
                          ? 'bg-white text-slate-900 border-amber-500 shadow-xl'
                          : 'bg-slate-950 text-white border-amber-500/90 shadow-2xl'
                      }`}
                      style={{
                        width: '360px',
                        height: '460px',
                        minWidth: '360px',
                        minHeight: '460px',
                        maxWidth: '360px',
                        maxHeight: '460px',
                        boxSizing: 'border-box',
                        backgroundColor: temaImpresion === 'light' ? '#ffffff' : '#0a0f1d',
                        color: temaImpresion === 'light' ? '#0f172a' : '#ffffff',
                        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                      }}
                    >
                      {/* Efectos de fondo sutiles en modo oscuro */}
                      {temaImpresion === 'dark' && (
                        <>
                          <div
                            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 pointer-events-none"
                            style={{
                              background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
                              transform: 'translate(30%, -30%)'
                            }}
                          />
                          <div
                            className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15 pointer-events-none"
                            style={{
                              background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
                              transform: 'translate(-30%, 30%)'
                            }}
                          />
                        </>
                      )}

                      {/* 1. ENCABEZADO OFICIAL */}
                      <div
                        style={{
                          padding: '8px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: `1px solid ${temaImpresion === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                          background: temaImpresion === 'light' ? '#f8fafc' : 'rgba(0,0,0,0.5)',
                          position: 'relative',
                          zIndex: 10,
                          flexShrink: 0,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src="/assets/logo.ico" alt="Logo" style={{ height: '28px', width: 'auto' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <p
                              style={{
                                fontWeight: 900,
                                fontSize: '12px',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                lineHeight: 1,
                                color: temaImpresion === 'light' ? '#d97706' : '#fbbf24',
                                margin: 0,
                              }}
                            >
                              JAGUARES
                            </p>
                            <p
                              style={{
                                fontSize: '8px',
                                letterSpacing: '0.1em',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                lineHeight: 1,
                                color: temaImpresion === 'light' ? '#64748b' : '#94a3b8',
                                margin: 0,
                              }}
                            >
                              Carnet Oficial de Miembro
                            </p>
                          </div>
                        </div>
                        {/* Badge Temporada 2026 - SVG nativo para centrado matemático perfecto en pantalla, JPG y PDF */}
                        <svg
                          width="104"
                          height="22"
                          viewBox="0 0 104 22"
                          style={{ display: 'block', flexShrink: 0 }}
                        >
                          <rect
                            x="0.5"
                            y="0.5"
                            width="103"
                            height="21"
                            rx="10.5"
                            fill={temaImpresion === 'light' ? '#fef3c7' : 'rgba(245,158,11,0.2)'}
                            stroke={temaImpresion === 'light' ? '#fcd34d' : 'rgba(245,158,11,0.4)'}
                            strokeWidth="1"
                          />
                          <text
                            x="52"
                            y="11"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={temaImpresion === 'light' ? '#92400e' : '#fcd34d'}
                            fontSize="8"
                            fontWeight="900"
                            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            letterSpacing="0.08em"
                          >
                            TEMPORADA 2026
                          </text>
                        </svg>
                      </div>

                      {/* 2. CUERPO CENTRAL CON LOS 5 DATOS — gap fijo para centrado perfecto */}
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          padding: '8px 16px',
                          position: 'relative',
                          zIndex: 10,
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      >
                        {/* [DATO 2 + DATO 3]: Foto + Año de Nacimiento */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                          <div
                            style={{
                              width: '120px',
                              height: '132px',
                              borderRadius: '16px',
                              overflow: 'hidden',
                              border: '2px solid #f59e0b',
                              background: temaImpresion === 'light' ? '#f1f5f9' : '#0f172a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              flexShrink: 0,
                            }}
                          >
                            {alumnoSeleccionado.alumno?.foto_carnet_url ? (
                              <img
                                src={formatFotoUrl(alumnoSeleccionado.alumno.foto_carnet_url)}
                                alt="Foto alumno"
                                crossOrigin="anonymous"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onLoad={(e) => {
                                  e.target.style.display = 'block';
                                  const fallback = e.target.parentElement.querySelector('.fallback-foto');
                                  if (fallback) fallback.style.display = 'none';
                                }}
                                onError={(e) => {
                                  const raw = alumnoSeleccionado.alumno?.foto_carnet_url || '';
                                  const fId = getDriveFileId(raw);
                                  if (fId && !e.target.dataset.triedLh3) {
                                    e.target.dataset.triedLh3 = 'true';
                                    e.target.src = `https://lh3.googleusercontent.com/d/${fId}`;
                                    return;
                                  }
                                  e.target.style.display = 'none';
                                  const fallback = e.target.parentElement.querySelector('.fallback-foto');
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="fallback-foto"
                              style={{
                                display: alumnoSeleccionado.alumno?.foto_carnet_url ? 'none' : 'flex',
                                position: 'absolute',
                                inset: 0,
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                              }}
                            >
                              <svg style={{ width: '40px', height: '40px', opacity: 0.6, color: '#94a3b8', fill: 'currentColor' }} viewBox="0 0 24 24">
                                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 2.07a8 8 0 0 1 4.54 2.22l-1.89 2.6-2.65-.86zm-2 0v3.96l-2.65.86-1.89-2.6A8 8 0 0 1 11 4.07zM5.16 8.08l2.25 1.63L6.34 12l-2.3-1.67a7.92 7.92 0 0 1 1.12-2.25zM4.07 13h3.96l.86 2.65-2.6 1.89A8 8 0 0 1 4.07 13zm3.34 6.25 1.63-2.25 2.29.74-.74 2.29a7.92 7.92 0 0 1-3.18-.78zm5.59.68.74-2.29 2.29-.74 1.63 2.25a7.92 7.92 0 0 1-4.66.78zm5.93-3.04-2.6-1.89.86-2.65h3.96a8 8 0 0 1-2.22 4.54zm.99-6.9-2.3 1.67-1.07-2.29 2.25-1.63a7.92 7.92 0 0 1 1.12 2.25zM12 14.5l-2.37-1.72.9-2.78h2.94l.9 2.78z"/>
                              </svg>
                              <p style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', lineHeight: 1, margin: '4px 0 0 0' }}>Sin Foto</p>
                            </div>
                          </div>

                          {/* [DATO 3]: Año de Nacimiento - SVG nativo con cápsula redondeada perfecta a ambos extremos */}
                          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <svg
                              width="224"
                              height="24"
                              viewBox="0 0 224 24"
                              style={{
                                display: 'block',
                                flexShrink: 0,
                              }}
                            >
                              <rect x="1" y="1" width="222" height="22" rx="11" fill="#f59e0b" />
                              <g transform="translate(28, 6.5) scale(0.46)">
                                <path
                                  fill="#0a0a0a"
                                  d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
                                />
                              </g>
                              <text
                                x="46"
                                y="12"
                                textAnchor="start"
                                dominantBaseline="central"
                                fill="#0a0a0a"
                                fontSize="8.5"
                                fontWeight="900"
                                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                                letterSpacing="0.02em"
                              >
                                AÑO DE NACIMIENTO: {getAnioNacimiento(alumnoSeleccionado.alumno?.fecha_nacimiento)}
                              </text>
                            </svg>
                          </div>
                        </div>

                        {/* [DATO 1]: Primer Nombre y Primer Apellido */}
                        <div
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '12px',
                            border: `1px solid ${temaImpresion === 'light' ? '#fcd34d' : 'rgba(245,158,11,0.4)'}`,
                            background: temaImpresion === 'light' ? 'rgba(254,243,199,0.8)' : 'linear-gradient(90deg,rgba(245,158,11,0.15),rgba(245,158,11,0.22),rgba(245,158,11,0.15))',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '7.5px',
                              textTransform: 'uppercase',
                              fontWeight: 700,
                              letterSpacing: '0.2em',
                              lineHeight: 1,
                              color: temaImpresion === 'light' ? '#b45309' : '#fbbf24',
                              display: 'block',
                            }}
                          >
                            ALUMNO
                          </span>
                          <span
                            style={{
                              fontWeight: 900,
                              fontSize: '20px',
                              textTransform: 'uppercase',
                              lineHeight: 1,
                              color: temaImpresion === 'light' ? '#0f172a' : '#ffffff',
                              display: 'block',
                              width: '100%',
                              textAlign: 'center',
                            }}
                          >
                            {getPrimerNombreYPrimerApellido(alumnoSeleccionado.alumno?.nombres, alumnoSeleccionado.alumno?.apellidos)}
                          </span>
                        </div>

                        {/* [DATO 4]: Deporte y Plan */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
                          {/* Deporte */}
                          <div
                            style={{
                              padding: '8px',
                              borderRadius: '12px',
                              border: `1px solid ${temaImpresion === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                              background: temaImpresion === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.05)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              boxSizing: 'border-box',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '7.5px',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                lineHeight: 1,
                              }}
                            >
                              <svg style={{ width: '10px', height: '10px', fill: '#f59e0b', flexShrink: 0 }} viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                              </svg>
                              DEPORTE
                            </span>
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                lineHeight: 1,
                                color: temaImpresion === 'light' ? '#0f172a' : '#ffffff',
                                display: 'block',
                                width: '100%',
                                textAlign: 'center',
                              }}
                            >
                              {limpiarTexto(alumnoSeleccionado.inscripciones?.[0]?.deporte || 'Fútbol')}
                            </span>
                          </div>

                          {/* Plan */}
                          <div
                            style={{
                              padding: '8px',
                              borderRadius: '12px',
                              border: `1px solid ${temaImpresion === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                              background: temaImpresion === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.05)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              boxSizing: 'border-box',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '7.5px',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                lineHeight: 1,
                              }}
                            >
                              <svg style={{ width: '10px', height: '10px', fill: '#f59e0b', flexShrink: 0 }} viewBox="0 0 24 24">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                              </svg>
                              PLAN
                            </span>
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                lineHeight: 1,
                                color: temaImpresion === 'light' ? '#d97706' : '#fbbf24',
                                display: 'block',
                                width: '100%',
                                textAlign: 'center',
                              }}
                            >
                              {limpiarTexto(alumnoSeleccionado.inscripciones?.[0]?.plan || 'Económico')}
                            </span>
                          </div>
                        </div>

                        {/* [DATO 5]: Código de Barras */}
                        <div style={{ width: '100%' }}>
                          {tipoCodigo === 'barcode' ? (
                            <div
                              style={{
                                width: '100%',
                                background: '#ffffff',
                                borderRadius: '12px',
                                padding: '8px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                boxSizing: 'border-box',
                              }}
                            >
                              <div
                                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', height: '34px' }}
                                dangerouslySetInnerHTML={{
                                  __html: generateCode128Svg(alumnoSeleccionado.alumno?.dni || '00000000', 34, 280)
                                }}
                              />
                              <p
                                style={{
                                  fontSize: '7.5px',
                                  fontWeight: 800,
                                  color: '#475569',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.08em',
                                  lineHeight: 1,
                                  textAlign: 'center',
                                  margin: 0,
                                }}
                              >
                                CÓDIGO DE CONTROL EN PORTERÍA
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-1.5 bg-white/10 rounded-xl border border-white/10">
                              <div
                                className="p-0.5 bg-white rounded-md shadow-xs flex-shrink-0 border border-slate-200 flex items-center justify-center"
                                style={{ width: '42px', height: '42px' }}
                              >
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&data=${encodeURIComponent(
                                    getQrVerificationUrl(alumnoSeleccionado.alumno?.dni)
                                  )}`}
                                  alt="QR Acceso"
                                  className="w-full h-full object-contain block"
                                />
                              </div>
                              <div className="min-w-0">
                                <p
                                  className={`text-[8.5px] font-black uppercase tracking-wider leading-tight ${
                                    temaImpresion === 'light' ? 'text-slate-800' : 'text-amber-400'
                                  }`}
                                >
                                  QR Oficial de Portería
                                </p>
                                <p className="text-[7.5px] text-slate-400 truncate leading-tight">
                                  Escaneo para validar membresía
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. PIE DEL CARNET */}
                      <div
                        style={{
                          padding: '7px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderTop: `1px solid ${temaImpresion === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                          background: temaImpresion === 'light' ? '#f8fafc' : 'rgba(0,0,0,0.6)',
                          position: 'relative',
                          zIndex: 10,
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1, color: temaImpresion === 'light' ? '#64748b' : '#94a3b8' }}>Válido Temporada 2026</span>
                      </div>
                    </div>
                  ) : (
                    /* ====== VISTA HORIZONTAL CR80 ====== */
                    <div
                      id="carnetImprimible"
                      className={`formato-horizontal w-[410px] sm:w-[430px] rounded-2xl overflow-hidden relative border-2 transition-all ${
                        temaImpresion === 'light'
                          ? 'bg-white text-slate-900 border-amber-500 shadow-xl'
                          : 'bg-slate-950 text-white border-amber-500/90 shadow-2xl'
                      }`}
                      style={{
                        aspectRatio: '1.586',
                        backgroundColor: temaImpresion === 'light' ? '#ffffff' : '#0a0f1d',
                        color: temaImpresion === 'light' ? '#0f172a' : '#ffffff',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                      }}
                    >
                      <div
                        className={`px-4 py-2 flex items-center justify-between border-b relative z-10 ${
                          temaImpresion === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src="/assets/logo.ico" alt="Logo" className="h-6 w-auto drop-shadow" />
                          <div>
                            <p className="font-black text-[11px] tracking-wider uppercase text-amber-500">JAGUARES</p>
                            <p className="text-[7.5px] font-semibold text-slate-400 uppercase">Carnet Oficial de Membresía</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {limpiarTexto(alumnoSeleccionado.inscripciones?.[0]?.plan || 'OFICIAL')}
                        </span>
                      </div>

                      <div className="p-3.5 flex gap-3.5 items-center relative z-10">
                        <div className="flex-shrink-0 flex flex-col items-center">
                          <div className="w-[85px] h-[102px] rounded-xl overflow-hidden border-2 border-amber-500 bg-slate-900 flex items-center justify-center">
                            {alumnoSeleccionado.alumno?.foto_carnet_url ? (
                              <img src={formatFotoUrl(alumnoSeleccionado.alumno.foto_carnet_url)} alt="Foto" crossOrigin="anonymous" className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-3xl text-slate-400">photo_camera</span>
                            )}
                          </div>
                          <div className="mt-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
                            CAT. {getAnioNacimiento(alumnoSeleccionado.alumno?.fecha_nacimiento)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between" style={{ height: '120px' }}>
                          <div>
                            <p className="text-[8px] uppercase font-bold text-amber-400">Alumno</p>
                            <h3 className="font-black text-sm sm:text-base truncate leading-tight">
                              {getPrimerNombreYPrimerApellido(alumnoSeleccionado.alumno?.nombres, alumnoSeleccionado.alumno?.apellidos)}
                            </h3>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-[8px] uppercase font-bold text-slate-400">Deporte</p>
                              <p className="font-bold truncate text-amber-300">{limpiarTexto(alumnoSeleccionado.inscripciones?.[0]?.deporte || 'Fútbol')}</p>
                            </div>
                            <div>
                              <p className="text-[8px] uppercase font-bold text-slate-400">Plan</p>
                              <p className="font-bold truncate text-slate-300">{limpiarTexto(alumnoSeleccionado.inscripciones?.[0]?.plan || 'Económico')}</p>
                            </div>
                          </div>

                          <div className="w-full pt-1">
                            <div className="px-2 py-1.5 bg-white rounded-lg shadow-xs border border-slate-200 flex items-center justify-center overflow-hidden" style={{ height: '42px' }}>
                              <div
                                className="w-full flex justify-center items-center"
                                dangerouslySetInnerHTML={{
                                  __html: generateCode128Svg(alumnoSeleccionado.alumno?.dni || '00000000', 34, 230)
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-1 flex items-center justify-between text-[8px] border-t bg-black/50 text-slate-400">
                        <span>Válido temporada 2026</span>
                        <span></span>
                      </div>
                    </div>
                  )}
                </div>
                </>
              ) : (
                <div className="text-center py-20 text-slate-400">
                  <span className="material-symbols-outlined text-5xl mb-2 text-slate-400">badge</span>
                  <p className="text-sm font-medium">Seleccione un alumno de la lista para previsualizar el carnet</p>
                </div>
              )}
            </div>

            {/* Columna 3: Bandeja Hoja A4 (4 Carnets 2x2 con Drag & Drop) */}
            <div className="col-span-12 lg:col-span-12 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col">
              {/* Cabecera de la Bandeja */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-xl">layers</span>
                    <h3 className="font-black text-sm uppercase tracking-wide text-slate-900 dark:text-white">
                      Bandeja Hoja A4 (4 Carnets)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      {slotsA4.filter(Boolean).length} / 4 Carnets
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Arrastra o asigna carnets a los 4 espacios para imprimir en 1 sola hoja sin gastar papel
                  </p>
                </div>

                {/* Acciones principales de la Bandeja */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => exportarPdfHojaA4Cuadruple('imprimir')}
                    disabled={slotsA4.filter(Boolean).length === 0 || generandoA4Cuadruple}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-sm ${
                      slotsA4.filter(Boolean).length > 0
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow cursor-pointer'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                    title="Imprimir directamente la hoja A4 con los carnets asignados"
                  >
                    <span className="material-symbols-outlined text-sm">print</span>
                    Imprimir A4
                  </button>

                  <button
                    onClick={() => exportarPdfHojaA4Cuadruple('descargar')}
                    disabled={slotsA4.filter(Boolean).length === 0 || generandoA4Cuadruple}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-sm ${
                      slotsA4.filter(Boolean).length > 0
                        ? 'bg-rose-600 hover:bg-rose-500 text-white hover:shadow cursor-pointer'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                    title="Descargar PDF A4 oficial con guías de corte listas"
                  >
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                    {generandoA4Cuadruple ? 'Generando...' : 'PDF A4'}
                  </button>

                  {slotsA4.some(Boolean) && (
                    <button
                      onClick={vaciarHojaA4}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                      title="Vaciar todos los espacios de la hoja A4"
                    >
                      <span className="material-symbols-outlined text-base">delete_sweep</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Representación visual de la Hoja A4 física (Proporción exacta 210 x 297 mm) */}
              <div className="flex-1 flex justify-center items-center py-1">
                <div
                  className="w-full max-w-[420px] bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700/80 rounded-2xl p-3 shadow-inner relative flex flex-col justify-between"
                  style={{
                    aspectRatio: '210 / 297',
                  }}
                >
                  {/* Encabezado guía de corte superior */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-dashed border-slate-300 dark:border-slate-800 text-[9px] font-mono text-slate-600 dark:text-slate-400">
                    <span>✂ 210 mm (ANCHO A4)</span>
                    <span className="font-bold text-amber-500">2 × 2 CARNETS (9 × 11.5 cm)</span>
                    <span>297 mm ✂</span>
                  </div>

                  {/* Cuadrícula 2x2 con los 4 espacios de corte */}
                  <div className="grid grid-cols-2 gap-2.5 my-auto">
                    {slotsA4.map((slot, index) => {
                      const isHovered = hoverSlotA4 === index;
                      const posNombre = ['Arriba Izquierda', 'Arriba Derecha', 'Abajo Izquierda', 'Abajo Derecha'][index];

                      return (
                        <div
                          key={index}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'copy';
                            setHoverSlotA4(index);
                          }}
                          onDragLeave={() => setHoverSlotA4(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setHoverSlotA4(null);
                            setArrastrandoCarnet(false);
                            agregarAlumnoASlot(index);
                          }}
                          onClick={() => {
                            if (!slot && alumnoSeleccionado) {
                              agregarAlumnoASlot(index);
                            }
                          }}
                          className={`rounded-xl transition-all relative overflow-hidden flex flex-col items-center justify-center ${
                            slot
                              ? 'bg-slate-900 border-2 border-amber-500 shadow-md'
                              : isHovered
                              ? 'bg-amber-500/20 border-2 border-dashed border-amber-400 scale-[1.02] shadow-lg animate-pulse'
                              : arrastrandoCarnet
                              ? 'bg-amber-500/5 border-2 border-dashed border-amber-500/50 hover:bg-amber-500/15'
                              : 'bg-white/60 dark:bg-slate-900/60 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-500/5 cursor-pointer'
                          }`}
                          style={{
                            aspectRatio: '90 / 115', // Medida física oficial proporcional
                          }}
                        >
                          {slot ? (
                            // Espacio Ocupado
                            <div className="w-full h-full relative group">
                              <img
                                src={slot.dataUrl}
                                alt={slot.nombre}
                                className="w-full h-full object-cover"
                              />
                              {/* Overlay con datos y botón quitar */}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/70 p-2 flex flex-col justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center justify-between">
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
                                    #{index + 1}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      quitarDeSlot(index);
                                    }}
                                    className="w-6 h-6 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                                    title="Quitar este carnet de la hoja A4"
                                  >
                                    <span className="material-symbols-outlined text-sm font-bold">close</span>
                                  </button>
                                </div>

                                <div>
                                  <p className="font-black text-[10.5px] text-white truncate leading-tight drop-shadow-md">
                                    {slot.nombre}
                                  </p>
                                  <p className="text-[8.5px] text-amber-300 font-mono truncate">
                                    DNI: {slot.dni} • {slot.deporte}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Espacio Vacío
                            <div className="p-2 text-center flex flex-col items-center justify-center gap-1 select-none">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                isHovered
                                  ? 'bg-amber-500 text-slate-950 scale-110 shadow'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                              }`}>
                                <span className="material-symbols-outlined text-base">
                                  {isHovered ? 'arrow_downward' : 'add'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                                  Espacio {index + 1}
                                </span>
                                <span className="text-[8.5px] font-medium text-slate-400 dark:text-slate-500 block leading-tight">
                                  {isHovered
                                    ? '¡Suelta aquí!'
                                    : alumnoSeleccionado
                                    ? 'Clic para poner'
                                    : posNombre}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Guía inferior con porcentaje de ahorro de papel */}
                  <div className="pt-1.5 border-t border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-amber-500">eco</span>
                      Ahorro de papel: 75%
                    </span>
                    <span>Guías punteadas de corte</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* PESTAÑA 2: CONTROL DE PUERTA / ESCÁNER EN TIEMPO REAL */}
        {activeTab === 'scanner' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <span className="material-symbols-outlined text-3xl">barcode_reader</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Control de Puerta — Escáner en Tiempo Real
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Escanee el carnet con su lector de código de barras USB/inalámbrico, active la cámara web, o ingrese el DNI para verificar al instante la membresía del alumno.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-2xl text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Pistola Lectora USB Lista: Escanee directamente sin hacer clic</span>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setUsarCamara(!usarCamara)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    usarCamara
                      ? 'bg-rose-500 hover:bg-rose-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {usarCamara ? 'videocam_off' : 'photo_camera'}
                  </span>
                  {usarCamara ? 'Apagar Cámara' : 'Escanear con Cámara Web / Celular'}
                </button>
              </div>

              {usarCamara && (
                <div className="mt-4 max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-amber-400 bg-black aspect-video relative flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-dashed border-amber-400/70 m-6 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-amber-300 bg-black/60 px-2 py-0.5 rounded font-bold">
                      Apunta al carnet del alumno
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-6 max-w-md mx-auto flex gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    barcode_reader
                  </span>
                  <input
                    ref={inputScannerRef}
                    type="text"
                    value={dniEscaneo}
                    onChange={(e) => setDniEscaneo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') procesarEscaneo();
                    }}
                    placeholder="Pase el carnet por el lector de barras..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-base font-bold focus:outline-none focus:border-amber-500 tracking-wider text-center"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => procesarEscaneo()}
                  disabled={cargandoEscaneo}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-md flex items-center justify-center disabled:opacity-50"
                >
                  {cargandoEscaneo ? (
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  ) : (
                    'Validar'
                  )}
                </button>
              </div>
            </div>

            {/* Resultado del Escaneo */}
            {resultadoEscaneo && (
              <div
                className={`rounded-3xl p-6 border-2 transition-all shadow-lg animate-in fade-in-50 duration-200 ${
                  resultadoEscaneo.success
                    ? resultadoEscaneo.sin_clase_hoy
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500'
                      : resultadoEscaneo.es_excepcion
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500'
                        : resultadoEscaneo.activo
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500'
                          : 'bg-rose-50 dark:bg-rose-950/30 border-rose-500'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-400'
                }`}
              >
                {resultadoEscaneo.success ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            resultadoEscaneo.es_pago_clase
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                              : resultadoEscaneo.es_excepcion
                                ? 'bg-amber-500 text-slate-950'
                              : resultadoEscaneo.activo
                                ? 'bg-emerald-500 text-white'
                                : 'bg-rose-500 text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-4xl">
                            {resultadoEscaneo.es_pago_clase ? 'payments' : (resultadoEscaneo.sin_clase_hoy ? 'event_busy' : (resultadoEscaneo.es_excepcion ? 'lock_open' : (resultadoEscaneo.activo ? 'check_circle' : 'cancel')))}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                resultadoEscaneo.es_excepcion
                                  ? 'bg-amber-200 text-amber-950 border border-amber-400 dark:bg-amber-900/70 dark:text-amber-200'
                                  : resultadoEscaneo.activo
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                              }`}
                            >
                              {resultadoEscaneo.es_pago_clase
                                ? 'PAGO POR CLASE INDIVIDUAL'
                                : resultadoEscaneo.sin_clase_hoy
                                  ? 'SIN CLASE PROGRAMADA HOY'
                                : resultadoEscaneo.es_excepcion
                                  ? 'PASE POR EXCEPCION (DEBE MENSUALIDAD)'
                                  : resultadoEscaneo.activo
                                    ? 'INGRESO AUTORIZADO'
                                    : 'ACCESO DENEGADO'}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {resultadoEscaneo.timestamp}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                            {resultadoEscaneo.alumno?.nombres} {resultadoEscaneo.alumno?.apellidos}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            DNI: {resultadoEscaneo.alumno?.dni}
                          </p>
                        </div>
                      </div>

                      {!resultadoEscaneo.activo && resultadoEscaneo.puede_autorizar && (
                        <div className="flex flex-col gap-2 w-full sm:w-auto min-w-[210px]">
                          <button
                            onClick={() => procesarEscaneo(resultadoEscaneo.alumno?.dni, true)}
                            disabled={cargandoEscaneo}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-base">lock_open</span>
                            Autorizar Excepción
                          </button>
                          <button
                            onClick={() => setModalPagoClase({
                              abierto: true,
                              alumno: resultadoEscaneo.alumno,
                              monto: 15,
                              metodo: 'Efectivo'
                            })}
                            disabled={cargandoEscaneo}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-base">payments</span>
                            Paga por Clase (S/ 15.00)
                          </button>
                        </div>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-2xl border ${
                        resultadoEscaneo.es_excepcion
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                          : resultadoEscaneo.activo
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
                      }`}
                    >
                      <p className="text-sm font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">
                          {resultadoEscaneo.es_excepcion ? 'lock_open' : resultadoEscaneo.activo ? 'verified' : 'warning'}
                        </span>
                        {resultadoEscaneo.es_excepcion
                          ? 'Ingreso autorizado por excepción de administración. La mensualidad sigue pendiente de pago en el sistema.'
                          : (resultadoEscaneo.motivo || resultadoEscaneo.aviso)}
                      </p>
                      {resultadoEscaneo.asistencia_puerta_registrada && (
                        <p className="text-xs font-semibold mt-1 opacity-90">
                          Asistencia registrada en puerta ({resultadoEscaneo.hora_ingreso || 'Ahora'}).
                        </p>
                      )}
                    </div>

                    {resultadoEscaneo.horario_hoy && (
                      <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl text-xs flex items-center justify-between">
                        <span className="text-slate-500">Clase de hoy:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {resultadoEscaneo.horario_hoy.deporte} • {resultadoEscaneo.horario_hoy.dias} ({resultadoEscaneo.horario_hoy.hora_inicio} - {resultadoEscaneo.horario_hoy.hora_fin})
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">error</span>
                    <h3 className="font-bold text-base text-rose-700 dark:text-rose-300">
                      {resultadoEscaneo.error}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">DNI buscado: {resultadoEscaneo.dni}</p>
                  </div>
                )}
              </div>
            )}

            {historialEscaneo.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">history</span>
                  Últimos Alumnos Escaneados en Puerta
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {historialEscaneo.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            item.es_excepcion ? 'bg-amber-500' : item.activo ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                              {item.alumno?.nombres} {item.alumno?.apellidos}
                            </p>
                            {item.es_pago_clase && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                <span className="material-symbols-outlined text-xs">payments</span>
                                Pago S/ {item.monto_pago_clase || 15} • {item.metodo_pago_clase || 'Efectivo'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-mono">
                            DNI: {item.alumno?.dni} • {item.es_pago_clase ? (item.motivo || 'Clase individual pagada en puerta') : item.es_excepcion ? 'Pase por excepción (Deuda de mensualidad pendiente)' : (item.motivo || item.aviso)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-mono flex-shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Modal Elegante: Registrar Pago por Clase con Efectivo / Yape / Plin */}
        {modalPagoClase.abierto && (
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setModalPagoClase(prev => ({ ...prev, abierto: false }))}
          >
            <div 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Encabezado */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">payments</span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight">
                      Paga por Clase
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Entrenamiento individual extra / diario
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalPagoClase(prev => ({ ...prev, abierto: false }))}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Info Alumno */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                  {modalPagoClase.alumno?.nombres?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {modalPagoClase.alumno?.nombres} {modalPagoClase.alumno?.apellidos || modalPagoClase.alumno?.nombre_completo}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    DNI: {modalPagoClase.alumno?.dni}
                  </p>
                </div>
              </div>

              {/* Selección de Monto */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Monto a Cobrar (S/.)
                </label>
                <div className="flex items-center gap-2">
                  {[15, 20, 10].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModalPagoClase(prev => ({ ...prev, monto: m }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${
                        Number(modalPagoClase.monto) === m
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      S/ {m}.00
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={modalPagoClase.monto === '' ? '' : modalPagoClase.monto}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setModalPagoClase(prev => ({
                        ...prev,
                        monto: val === '' ? '' : val
                      }));
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej. 15.00"
                  />
                </div>
              </div>

              {/* Método de Pago con Iconos Profesionales */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Método de Pago Recibido
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Efectivo */}
                  <button
                    type="button"
                    onClick={() => setModalPagoClase(prev => ({ ...prev, metodo: 'Efectivo' }))}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                      modalPagoClase.metodo === 'Efectivo'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm ring-2 ring-emerald-500/40'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl text-emerald-500">payments</span>
                    <span className="text-xs font-black">Efectivo</span>
                  </button>

                  {/* Yape */}
                  <button
                    type="button"
                    onClick={() => setModalPagoClase(prev => ({ ...prev, metodo: 'Yape' }))}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                      modalPagoClase.metodo === 'Yape'
                        ? 'bg-purple-500/10 border-[#742284] text-[#8B2BB2] dark:text-purple-300 shadow-md ring-2 ring-[#742284]/40 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#742284] flex items-center justify-center shadow-xs">
                      <img
                        src="/assets/yape.jpg"
                        alt="Yape"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <span className="text-xs font-black tracking-wide">Yape</span>
                  </button>

                  {/* Plin */}
                  <button
                    type="button"
                    onClick={() => setModalPagoClase(prev => ({ ...prev, metodo: 'Plin' }))}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                      modalPagoClase.metodo === 'Plin'
                        ? 'bg-cyan-500/10 border-[#00B4D8] text-[#0096C7] dark:text-cyan-300 shadow-md ring-2 ring-[#00B4D8]/40 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl overflow-hidden bg-white p-0.5 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                      <img
                        src="/assets/plinlogo.png"
                        alt="Plin"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <span className="text-xs font-black tracking-wide">Plin</span>
                  </button>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalPagoClase(prev => ({ ...prev, abierto: false }))}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={cargandoEscaneo || !modalPagoClase.monto || parseFloat(modalPagoClase.monto) <= 0}
                  onClick={async () => {
                    const alumnoDni = modalPagoClase.alumno?.dni;
                    const monto = parseFloat(modalPagoClase.monto) || 0;
                    if (monto <= 0) return;
                    const metodo = modalPagoClase.metodo;
                    setModalPagoClase(prev => ({ ...prev, abierto: false }));
                    await procesarEscaneo(alumnoDni, true, { monto, metodo });
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Confirmar Ingreso (S/ {Number(modalPagoClase.monto || 0).toFixed(2)})
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
