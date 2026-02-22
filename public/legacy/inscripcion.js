/**
 * Script para el formulario de inscripción
 */

// Variable de control para validación de DNI
let dniValidado = false;

// Variables para almacenar imágenes en base64
let imagenDNIFrontal = null;
let imagenDNIReverso = null;
let imagenFotoCarnet = null;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formInscripcion');
    const btnBuscarDni = document.getElementById('btnBuscarDni');
    const apoderadoSection = document.getElementById('apoderadoSection');
    const fechaNacimientoInput = document.getElementById('fecha_nacimiento');
    
    // Cargar datos guardados si existen
    cargarDatosGuardados();
    
    // Listener para detectar si es Menor de edad
    fechaNacimientoInput.addEventListener('change', verificarEdad);
    
    // Buscar DNI (opcional - API RENIEC si está disponible)
    btnBuscarDni.addEventListener('click', buscarDNI);
    
    // Resetear validación cuando el usuario edita el DNI
    const dniInput = document.getElementById('dni');
    dniInput.addEventListener('input', () => {
        dniValidado = false;
        const helper = document.getElementById('dni-helper');
        helper.classList.add('hidden');
        helper.textContent = '';
        helper.className = 'text-sm text-primary hidden';
    });
    
    // Listeners para los inputs de imágenes
    document.getElementById('dni_frontal').addEventListener('change', (e) => manejarImagenSeleccionada(e, 'dni_frontal'));
    document.getElementById('dni_reverso').addEventListener('change', (e) => manejarImagenSeleccionada(e, 'dni_reverso'));
    document.getElementById('foto_carnet').addEventListener('change', (e) => manejarImagenSeleccionada(e, 'foto_carnet'));
    
    // Submit del formulario
    form.addEventListener('submit', handleSubmit);
});

/**
 * Manejar selección de imagen y convertir a base64
 */
function manejarImagenSeleccionada(event, tipo) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validar tamaño (máx 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
        Utils.mostrarNotificacion('La imagen es muy grande. Máximo 5MB', 'error');
        event.target.value = ''; // Limpiar input
        return;
    }
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        Utils.mostrarNotificacion('Solo se permiten archivos de imagen', 'error');
        event.target.value = '';
        return;
    }
    
    // Convertir a base64 y comprimir con canvas para reducir peso
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            let w = img.width, h = img.height;
            if (w > 1000) { h = Math.round(h * 1000 / w); w = 1000; }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            if (tipo === 'dni_frontal') imagenDNIFrontal = base64;
            else if (tipo === 'dni_reverso') imagenDNIReverso = base64;
            else if (tipo === 'foto_carnet') imagenFotoCarnet = base64;
            mostrarPreview(base64, tipo);
        };
        img.onerror = function() { Utils.mostrarNotificacion('Error al procesar la imagen', 'error'); };
        img.src = e.target.result;
    };
    reader.onerror = function() {
        Utils.mostrarNotificacion('Error al cargar la imagen', 'error');
    };
    reader.readAsDataURL(file);
}

/**
 * Mostrar preview de la imagen
 */
function mostrarPreview(base64, tipo) {
    const previewDiv = document.getElementById(`preview_${tipo}`);
    const uploadBtn = document.getElementById(`upload_btn_${tipo}`);
    const img = previewDiv.querySelector('img');
    
    if (img && previewDiv && uploadBtn) {
        img.src = base64;
        previewDiv.classList.remove('hidden');
        uploadBtn.classList.add('hidden'); // Ocultar botón de subir
    }
}

/**
 * Eliminar imagen seleccionada
 */
function eliminarImagen(tipo) {
    // Limpiar la variable correspondiente
    if (tipo === 'dni_frontal') {
        imagenDNIFrontal = null;
    } else if (tipo === 'dni_reverso') {
        imagenDNIReverso = null;
    } else if (tipo === 'foto_carnet') {
        imagenFotoCarnet = null;
    }
    
    // Limpiar el input file
    const input = document.getElementById(tipo);
    if (input) {
        input.value = '';
    }
    
    // Ocultar preview y mostrar botón de subir
    const previewDiv = document.getElementById(`preview_${tipo}`);
    const uploadBtn = document.getElementById(`upload_btn_${tipo}`);
    
    if (previewDiv) {
        previewDiv.classList.add('hidden');
    }
    
    if (uploadBtn) {
        uploadBtn.classList.remove('hidden');
    }
    
    Utils.mostrarNotificacion('Imagen eliminada correctamente', 'success');
}

function cargarDatosGuardados() {
    const datosGuardados = LocalStorage.get('datosInscripcion');
    
    if (datosGuardados && datosGuardados.alumno) {
        const alumno = datosGuardados.alumno;
        
        // Rellenar campos
        document.getElementById('dni').value = alumno.dni || '';
        document.getElementById('nombres').value = alumno.nombres || '';
        document.getElementById('apellido_paterno').value = alumno.apellido_paterno || '';
        document.getElementById('apellido_materno').value = alumno.apellido_materno || '';
        document.getElementById('fecha_nacimiento').value = alumno.fecha_nacimiento || '';
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
        
        // Verificar edad
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
    
    const edad = Utils.calcularEdad(fechaNacimiento);
    
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
    
    if (!Utils.validarDNI(dni)) {
        Utils.mostrarNotificacion('El DNI debe tener 8 dígitos', 'error');
        return;
    }
    
    // Mostrar indicador de carga
    helper.classList.remove('hidden');
    helper.textContent = 'Verificando DNI...';
    helper.className = 'text-sm text-blue-600 mt-1';
    
    try {
        // Validar si el DNI ya está registrado
        const response = await academiaAPI.validarDNI(dni);
        
        if (!response.valido) {
            // DNI duplicado o inválido
            helper.textContent = response.error;
            helper.className = 'text-sm text-red-600 mt-1 font-semibold';
            dniInput.value = '';
            dniInput.focus();
            Utils.mostrarNotificacion(response.error, 'error');
            return;
        }
        
        // DNI válido y disponible
        dniValidado = true; // Marcar como validado
        helper.textContent = '✓ DNI disponible para registro';
        helper.className = 'text-sm text-green-600 mt-1 font-semibold';
        Utils.mostrarNotificacion('DNI válido, continúa con el registro', 'success');
        
        // Opcional: Aquí se puede integrar con API RENIEC si está disponible
        // Por ahora, solo validamos disponibilidad
        
        // Simular respuesta (en producción vendría de la API)
        // const response = await fetch(`https://api-reniec/consulta/${dni}`);
        // const data = await response.json();
        
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
    
    // Validar que las imágenes estén cargadas
    if (!imagenDNIFrontal || !imagenDNIReverso || !imagenFotoCarnet) {
        Utils.mostrarNotificacion('Debes subir todas las imágenes requeridas (DNI frontal, DNI reverso y foto carnet)', 'error');
        return;
    }
    
    // Si el DNI no fue validado aún, validarlo ahora automáticamente
    if (!dniValidado) {
        // Validar formato primero
        if (!Utils.validarDNI(dni)) {
            Utils.mostrarNotificacion('El DNI debe tener 8 dígitos', 'error');
            document.getElementById('dni').focus();
            return;
        }
        
        // Mostrar loading
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Verificando DNI...';
        
        // Validar si el DNI ya está registrado
        const response = await academiaAPI.validarDNI(dni);
        
        // Restaurar botón
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal;
        
        if (!response.valido) {
            // DNI duplicado o inválido
            Utils.mostrarNotificacion(`❌ ${response.error}`, 'error');
            document.getElementById('dni').value = '';
            document.getElementById('dni').focus();
            return;
        }
        
        // DNI válido, continuar con el proceso
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
        // Agregar imágenes en base64
        imagen_dni_frontal: imagenDNIFrontal,
        imagen_dni_reverso: imagenDNIReverso,
        imagen_foto_carnet: imagenFotoCarnet
    };
    
    // Calcular edad
    alumno.edad = Utils.calcularEdad(alumno.fecha_nacimiento);
    
    // Validar
    const validacion = Validaciones.validarAlumno(alumno);
    
    if (!validacion.valido) {
        Utils.mostrarNotificacion(validacion.errores.join('\n'), 'error');
        return;
    }
    
    // Guardar en localStorage - puede fallar si las imágenes pesan demasiado
    try {
        localStorage.setItem('datosInscripcion', JSON.stringify({
            alumno,
            paso: 1,
            fecha: new Date().toISOString()
        }));
    } catch (err) {
        Utils.mostrarNotificacion(
            'No se pudo continuar porque las imágenes son demasiado pesadas. Sube imágenes más pequeñas (menos de 2MB cada una) e inténtalo de nuevo.',
            'error'
        );
        return;
    }
    
    // Ir al siguiente paso - CRONOGRAMA NUEVO
    window.location.href = 'seleccion-horarios-new.html';
}



