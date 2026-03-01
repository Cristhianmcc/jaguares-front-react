let dniValidado = false;
let imagenDNIFrontal = null;
let imagenDNIReverso = null;
let imagenFotoCarnet = null;

function getUtils() {
  return window.Utils;
}

function getLocalStorage() {
  return window.LocalStorage;
}

function getValidaciones() {
  return window.Validaciones;
}

function getAcademiaAPI() {
  return window.academiaAPI;
}

async function manejarImagenSeleccionada(event, tipo) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    getUtils().mostrarNotificacion('Solo se permiten archivos de imagen', 'error');
    event.target.value = '';
    return;
  }

  try {
    const uploadBtn = document.getElementById(`upload_btn_${tipo}`);
    if (uploadBtn) uploadBtn.textContent = 'Comprimiendo...';

    // Comprimir con Canvas: máx 1024px, calidad JPEG 75% (~200KB sin importar el tamaño original)
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          let w = img.width, h = img.height;
          if (w > 1024) { h = Math.round(h * 1024 / w); w = 1024; }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    if (tipo === 'dni_frontal') imagenDNIFrontal = base64;
    else if (tipo === 'dni_reverso') imagenDNIReverso = base64;
    else if (tipo === 'foto_carnet') imagenFotoCarnet = base64;

    mostrarPreview(base64, tipo);

    const kb = Math.round((base64.length * 3) / 4 / 1024);
    console.log(`📸 ${tipo}: comprimido a ~${kb}KB`);

  } catch (err) {
    console.error('Error al comprimir imagen:', err);
    getUtils().mostrarNotificacion('Error al procesar la imagen. Intenta con otra foto.', 'error');
    event.target.value = '';
  }
}

function mostrarPreview(base64, tipo) {
  const previewDiv = document.getElementById(`preview_${tipo}`);
  const uploadBtn = document.getElementById(`upload_btn_${tipo}`);
  const img = previewDiv?.querySelector('img');

  if (img && previewDiv && uploadBtn) {
    img.src = base64;
    previewDiv.classList.remove('hidden');
    uploadBtn.classList.add('hidden');
  }
}

export function eliminarImagen(tipo) {
  if (tipo === 'dni_frontal') {
    imagenDNIFrontal = null;
  } else if (tipo === 'dni_reverso') {
    imagenDNIReverso = null;
  } else if (tipo === 'foto_carnet') {
    imagenFotoCarnet = null;
  }

  const input = document.getElementById(tipo);
  if (input) {
    input.value = '';
  }

  const previewDiv = document.getElementById(`preview_${tipo}`);
  const uploadBtn = document.getElementById(`upload_btn_${tipo}`);

  if (previewDiv) {
    previewDiv.classList.add('hidden');
  }

  if (uploadBtn) {
    uploadBtn.classList.remove('hidden');
  }

  getUtils().mostrarNotificacion('Imagen eliminada correctamente', 'success');
}

function cargarDatosGuardados() {
  const datosGuardados = getLocalStorage().get('datosInscripcion');

  if (datosGuardados && datosGuardados.alumno) {
    const alumno = datosGuardados.alumno;

    document.getElementById('dni').value = alumno.dni || '';
    document.getElementById('nombres').value = alumno.nombres || '';
    document.getElementById('apellido_paterno').value = alumno.apellido_paterno || '';
    document.getElementById('apellido_materno').value = alumno.apellido_materno || '';
    // Restaurar fecha en el hidden input y en los 3 selects
    if (alumno.fecha_nacimiento) {
      document.getElementById('fecha_nacimiento').value = alumno.fecha_nacimiento;
      const partes = alumno.fecha_nacimiento.split('-'); // [YYYY, MM, DD]
      if (partes.length === 3) {
        const s = document.getElementById('dia_nac');
        const m = document.getElementById('mes_nac');
        const a = document.getElementById('anio_nac');
        if (s) s.value  = partes[2];
        if (m) m.value  = partes[1];
        if (a) a.value  = partes[0];
      }
    }
    document.getElementById('telefono').value = alumno.telefono || '';
    document.getElementById('direccion').value = alumno.direccion || '';
    document.getElementById('email').value = alumno.email || '';
    document.getElementById('seguro_tipo').value = alumno.seguro_tipo || '';
    document.getElementById('condicion_medica').value = alumno.condicion_medica || '';

    if (alumno.sexo) {
      const radioSexo = document.querySelector(`input[name="sexo"][value="${alumno.sexo}"]`);
      if (radioSexo) radioSexo.checked = true;
    }

    if (alumno.apoderado) {
      document.getElementById('apoderado').value = alumno.apoderado || '';
      document.getElementById('telefono_apoderado').value = alumno.telefono_apoderado || '';
    }

    if (alumno.fecha_nacimiento) {
      verificarEdad();
    }
  }
}

function verificarEdad() {
  const fechaNacimiento = document.getElementById('fecha_nacimiento').value;
  const apoderadoSection = document.getElementById('apoderadoSection');
  const apoderadoInput = document.getElementById('apoderado');
  const telefonoApoderadoInput = document.getElementById('telefono_apoderado');

  if (!fechaNacimiento) return;

  const edad = getUtils().calcularEdad(fechaNacimiento);

  if (edad < 18) {
    apoderadoSection.classList.remove('hidden');
    apoderadoSection.classList.add('flex');
    apoderadoInput.required = true;
    telefonoApoderadoInput.required = true;
  } else {
    apoderadoSection.classList.add('hidden');
    apoderadoSection.classList.remove('flex');
    apoderadoInput.required = false;
    telefonoApoderadoInput.required = false;
  }
}

async function buscarDNI() {
  const dniInput = document.getElementById('dni');
  const dni = dniInput.value.trim();
  const helper = document.getElementById('dni-helper');

  if (!getUtils().validarDNI(dni)) {
    getUtils().mostrarNotificacion('El DNI debe tener 8 dígitos', 'error');
    return;
  }

  helper.classList.remove('hidden');
  helper.textContent = 'Verificando DNI...';
  helper.className = 'text-sm text-blue-600 mt-1';

  try {
    const response = await getAcademiaAPI().validarDNI(dni);

    if (!response.valido) {
      helper.textContent = response.error;
      helper.className = 'text-sm text-red-600 mt-1 font-semibold';
      dniInput.value = '';
      dniInput.focus();
      getUtils().mostrarNotificacion(response.error, 'error');
      return;
    }

    dniValidado = true;
    helper.textContent = '✓ DNI disponible para registro';
    helper.className = 'text-sm text-green-600 mt-1 font-semibold';
    getUtils().mostrarNotificacion('DNI válido, continúa con el registro', 'success');

    helper.textContent = 'Datos no encontrados. Complete manualmente.';
    setTimeout(() => {
      helper.classList.add('hidden');
    }, 3000);
  } catch (error) {
    helper.textContent = 'Error al buscar. Complete manualmente.';
    helper.classList.add('text-red-500');
    setTimeout(() => {
      helper.classList.add('hidden');
      helper.classList.remove('text-red-500');
    }, 3000);
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  const dni = document.getElementById('dni').value.trim();

  const fechaVal = document.getElementById('fecha_nacimiento').value;
  if (!fechaVal) {
    getUtils().mostrarNotificacion('Debes seleccionar la fecha de nacimiento', 'error');
    document.getElementById('fecha-helper')?.classList.remove('hidden');
    return;
  }

  if (!imagenDNIFrontal || !imagenDNIReverso || !imagenFotoCarnet) {
    getUtils().mostrarNotificacion('Debes subir todas las imágenes requeridas (DNI frontal, DNI reverso y foto carnet)', 'error');
    return;
  }

  if (!dniValidado) {
    if (!getUtils().validarDNI(dni)) {
      getUtils().mostrarNotificacion('El DNI debe tener 8 dígitos', 'error');
      document.getElementById('dni').focus();
      return;
    }

    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Verificando DNI...';

    const response = await getAcademiaAPI().validarDNI(dni);

    btnSubmit.disabled = false;
    btnSubmit.innerHTML = textoOriginal;

    if (!response.valido) {
      getUtils().mostrarNotificacion(`❌ ${response.error}`, 'error');
      document.getElementById('dni').value = '';
      document.getElementById('dni').focus();
      return;
    }

    dniValidado = true;
  }

  const formData = new FormData(e.target);
  const alumno = {
    dni: formData.get('dni'),
    nombres: formData.get('nombres'),
    apellido_paterno: formData.get('apellido_paterno'),
    apellido_materno: formData.get('apellido_materno'),
    apellidos: `${formData.get('apellido_paterno')} ${formData.get('apellido_materno')}`,
    fecha_nacimiento: formData.get('fecha_nacimiento'),
    sexo: formData.get('sexo'),
    telefono: formData.get('telefono'),
    direccion: formData.get('direccion'),
    email: formData.get('email'),
    seguro_tipo: formData.get('seguro_tipo'),
    condicion_medica: formData.get('condicion_medica'),
    apoderado: formData.get('apoderado'),
    telefono_apoderado: formData.get('telefono_apoderado'),
    imagen_dni_frontal: imagenDNIFrontal,
    imagen_dni_reverso: imagenDNIReverso,
    imagen_foto_carnet: imagenFotoCarnet
  };

  alumno.edad = getUtils().calcularEdad(alumno.fecha_nacimiento);

  const validacion = getValidaciones().validarAlumno(alumno);

  if (!validacion.valido) {
    getUtils().mostrarNotificacion(validacion.errores.join('\n'), 'error');
    return;
  }

  getLocalStorage().set('datosInscripcion', {
    alumno,
    paso: 1,
    fecha: new Date().toISOString()
  });

  window.location.href = '/seleccion-horarios-new';
}

export function initInscripcion() {
  const form = document.getElementById('formInscripcion');
  const btnBuscarDni = document.getElementById('btnBuscarDni');
  const fechaNacimientoInput = document.getElementById('fecha_nacimiento');

  // Poblar select de días (01-31)
  const selDia = document.getElementById('dia_nac');
  const selAnio = document.getElementById('anio_nac');
  if (selDia) {
    for (let d = 1; d <= 31; d++) {
      const opt = document.createElement('option');
      opt.value = String(d).padStart(2, '0');
      opt.textContent = d;
      selDia.appendChild(opt);
    }
  }
  if (selAnio) {
    const anioActual = new Date().getFullYear();
    for (let y = anioActual - 2; y >= 1980; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      selAnio.appendChild(opt);
    }
  }

  // Sincronizar selects → hidden input → verificarEdad
  const actualizarFecha = () => {
    const d = selDia?.value, m = document.getElementById('mes_nac')?.value, a = selAnio?.value;
    if (d && m && a) {
      fechaNacimientoInput.value = `${a}-${m}-${d}`;
      verificarEdad();
    } else {
      fechaNacimientoInput.value = '';
    }
  };
  selDia?.addEventListener('change', actualizarFecha);
  document.getElementById('mes_nac')?.addEventListener('change', actualizarFecha);
  selAnio?.addEventListener('change', actualizarFecha);

  cargarDatosGuardados();

  fechaNacimientoInput?.addEventListener('change', verificarEdad);
  btnBuscarDni?.addEventListener('click', buscarDNI);

  const dniInput = document.getElementById('dni');
  dniInput?.addEventListener('input', () => {
    dniValidado = false;
    const helper = document.getElementById('dni-helper');
    helper.classList.add('hidden');
    helper.textContent = '';
    helper.className = 'text-sm text-primary hidden';
  });

  document.getElementById('dni_frontal')?.addEventListener('change', (e) => manejarImagenSeleccionada(e, 'dni_frontal'));
  document.getElementById('dni_reverso')?.addEventListener('change', (e) => manejarImagenSeleccionada(e, 'dni_reverso'));
  document.getElementById('foto_carnet')?.addEventListener('change', (e) => manejarImagenSeleccionada(e, 'foto_carnet'));

  form?.addEventListener('submit', handleSubmit);

  window.eliminarImagen = eliminarImagen;

  return () => {
    fechaNacimientoInput?.removeEventListener('change', verificarEdad);
    btnBuscarDni?.removeEventListener('click', buscarDNI);
    dniInput?.removeEventListener('input', () => {});
    form?.removeEventListener('submit', handleSubmit);
  };
}