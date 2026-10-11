/**
 * image-compress.js
 * Utilidad robusta para comprimir comprobantes de pago sin que salgan negros.
 *
 * Causas del problema de imagen negra resueltas:
 * 1. Screenshots PNG con canal alfa: al convertir a JPEG, cualquier transparencia
 *    se convierte en negro por defecto en Canvas. Se soluciona pintando fondo blanco sólido (#FFFFFF).
 * 2. Formato HEIC/HEIF de iPhone: se detecta y se alerta amigablemente al usuario para que use captura.
 * 3. Orientación y límites de memoria en móviles: redimensiona proporcionalmente
 *    a un máximo de 1280px en el lado mayor usando createImageBitmap o Image con ObjectURL.
 * 4. Fugas de memoria en Safari: limpieza de URLs y canvas.
 */
(function () {
  'use strict';

  function esHeic(file) {
    if (!file) return false;
    var tipo = (file.type || '').toLowerCase();
    var nombre = (file.name || '').toLowerCase();
    return tipo.includes('heic') || tipo.includes('heif') ||
           nombre.endsWith('.heic') || nombre.endsWith('.heif');
  }

  function calcularDimensiones(origW, origH, maxDim) {
    var max = maxDim || 1280;
    var w = origW;
    var h = origH;
    if (w <= 0 || h <= 0) {
      w = max;
      h = max;
    }
    if (w > max || h > max) {
      if (w > h) {
        h = Math.round((h * max) / w);
        w = max;
      } else {
        w = Math.round((w * max) / h);
        h = max;
      }
    }
    return { w: Math.max(1, w), h: Math.max(1, h) };
  }

  function dibujarEnCanvasYExportar(imgSource, srcW, srcH, maxWidth, calidad) {
    var dims = calcularDimensiones(srcW, srcH, maxWidth || 1280);
    var canvas = document.createElement('canvas');
    canvas.width = dims.w;
    canvas.height = dims.h;

    var ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      ctx = canvas.getContext('2d');
    }

    // CRÍTICO: Pintar fondo blanco para evitar que transparencias de PNG/capturas se vuelvan negras
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, dims.w, dims.h);

    // Dibujar la imagen escalada
    ctx.drawImage(imgSource, 0, 0, dims.w, dims.h);

    var q = typeof calidad === 'number' ? calidad : 0.82;
    var dataUrl = canvas.toDataURL('image/jpeg', q);

    // Liberar memoria de canvas
    canvas.width = 1;
    canvas.height = 1;

    return dataUrl;
  }

  window.comprimirImagenExif = function comprimirImagenExif(file, maxWidth, calidad) {
    return new Promise(function (resolve, reject) {
      if (!file) {
        return reject(new Error('No se proporcionó ningún archivo'));
      }

      if (esHeic(file)) {
        return reject(new Error('HEIC_NO_SOPORTADO'));
      }

      // Método 1: Intentar createImageBitmap (moderno, rápido, maneja orientación nativa)
      if (typeof window.createImageBitmap === 'function') {
        var opts = { imageOrientation: 'from-image' };
        window.createImageBitmap(file, opts)
          .catch(function () {
            // Reintentar sin opciones si el navegador no acepta imageOrientation
            return window.createImageBitmap(file);
          })
          .then(function (bitmap) {
            try {
              var base64 = dibujarEnCanvasYExportar(bitmap, bitmap.width, bitmap.height, maxWidth, calidad);
              if (typeof bitmap.close === 'function') bitmap.close();
              resolve(base64);
            } catch (err) {
              if (typeof bitmap.close === 'function') bitmap.close();
              throw err;
            }
          })
          .catch(function () {
            // Si createImageBitmap falla por cualquier razón, fallback a Image()
            fallbackConImage();
          });
        return;
      }

      // Método 2: Fallback estándar con Image y ObjectURL
      fallbackConImage();

      function fallbackConImage() {
        var url;
        try {
          url = URL.createObjectURL(file);
        } catch (_e) {
          // Si URL.createObjectURL falla, intentar FileReader
          var reader = new FileReader();
          reader.onload = function (e) {
            cargarImg(e.target.result, false);
          };
          reader.onerror = function () {
            reject(new Error('No se pudo leer el archivo de imagen'));
          };
          reader.readAsDataURL(file);
          return;
        }

        cargarImg(url, true);

        function cargarImg(src, esBlobUrl) {
          var img = new Image();
          var terminado = false;

          var timeoutId = setTimeout(function () {
            if (terminado) return;
            terminado = true;
            if (esBlobUrl) {
              try { URL.revokeObjectURL(src); } catch (_e) {}
            }
            reject(new Error('Tiempo de espera agotado al cargar la imagen'));
          }, 15000);

          img.onload = function () {
            if (terminado) return;
            terminado = true;
            clearTimeout(timeoutId);
            try {
              var w = img.naturalWidth || img.width;
              var h = img.naturalHeight || img.height;
              var base64 = dibujarEnCanvasYExportar(img, w, h, maxWidth, calidad);
              if (esBlobUrl) {
                try { URL.revokeObjectURL(src); } catch (_e) {}
              }
              resolve(base64);
            } catch (err) {
              if (esBlobUrl) {
                try { URL.revokeObjectURL(src); } catch (_e) {}
              }
              reject(err);
            }
          };

          img.onerror = function () {
            if (terminado) return;
            terminado = true;
            clearTimeout(timeoutId);
            if (esBlobUrl) {
              try { URL.revokeObjectURL(src); } catch (_e) {}
            }
            reject(new Error('El archivo no es una imagen válida o está dañado'));
          };

          img.src = src;
        }
      }
    });
  };
})();
