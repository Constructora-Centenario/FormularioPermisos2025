function manejarAccionJefe(e) {
  var action = e.parameter.action;
  var solicitudId = e.parameter.id;
  
  if (action === 'aprobar') {
    return aprobarSolicitud(solicitudId);
  } else if (action === 'denegar') {
    return mostrarFormularioDenegacion(solicitudId);
  } else if (action === 'denegacionCompletada') {
    return mostrarDenegacionCompletada(solicitudId);
  }
  
  return HtmlService.createHtmlOutput('<script>window.location.href="' + ScriptApp.getService().getUrl() + '"</script>');
}

function aprobarSolicitud(solicitudId) {
  try {
    Logger.log('=== APROBANDO SOLICITUD: ' + solicitudId + ' ===');
    
    // 1. Actualizar estado en la base de datos
    BaseDatos.actualizarEstadoSolicitud(solicitudId, 'Aprobado');
    
    // 2. Obtener información COMPLETA de la solicitud
    var solicitud = BaseDatos.obtenerSolicitudCompletaPorId(solicitudId);
    
    if (!solicitud) {
      Logger.log('ERROR: Solicitud no encontrada');
      return HtmlService.createHtmlOutput('Error: Solicitud no encontrada');
    }
    
    Logger.log('Solicitud encontrada: ' + solicitud.nombre);
    
    // 3. Generar PDF (se guardará automáticamente en la carpeta de PDFs)
    var pdfBlob = GeneradorPDF.generarPDFDesdeSolicitud(solicitud);
    
    // 4. CORREOS DE GESTIÓN
    var correosGestion = 'gestionhumana@constructoracentenario.com , ana.pelaez@constructoracentenario.com';
    
    // 5. Buscar archivo adjunto original en la nueva carpeta específica de archivos adjuntos
    var archivoAdjuntoOriginal = null;
    if (solicitud.archivo && solicitud.archivo !== '' && solicitud.tipoSolicitud !== 'compensacion') {
      try {
        // Buscar en la carpeta específica de archivos adjuntos
        var folderIdAdjuntos = '15NmBvO7JlbrQqdUEl0YIM1XTLzW1dAAB';
        var folderAdjuntos;
        
        try {
          folderAdjuntos = DriveApp.getFolderById(folderIdAdjuntos);
          var files = folderAdjuntos.getFilesByName(solicitud.archivo);
          
          if (files.hasNext()) {
            archivoAdjuntoOriginal = files.next();
            Logger.log('Archivo adjunto encontrado en carpeta de archivos adjuntos: ' + solicitud.archivo);
          } else {
            // Si no se encuentra en la carpeta específica, buscar en todo Drive
            Logger.log('Buscando archivo en todo Drive: ' + solicitud.archivo);
            var allFiles = DriveApp.getFilesByName(solicitud.archivo);
            if (allFiles.hasNext()) {
              archivoAdjuntoOriginal = allFiles.next();
              Logger.log('Archivo adjunto encontrado en búsqueda global: ' + solicitud.archivo);
            }
          }
        } catch (e) {
          Logger.log('Error al acceder a carpeta de archivos adjuntos: ' + e.toString());
          // Buscar en todo Drive como fallback
          var allFiles = DriveApp.getFilesByName(solicitud.archivo);
          if (allFiles.hasNext()) {
            archivoAdjuntoOriginal = allFiles.next();
          }
        }
      } catch (e) {
        Logger.log('Error al buscar archivo adjunto: ' + e.toString());
      }
    }
    
    // 6. Preparar adjuntos para gestión
    var adjuntosGestion = [pdfBlob];
    if (archivoAdjuntoOriginal) {
      adjuntosGestion.push(archivoAdjuntoOriginal);
    }
    
    // 7. Enviar correo a gestión
    var mensajeAprobacion = `
    <h2>✅ Solicitud Aprobada</h2>
    <p>La siguiente solicitud ha sido <strong>APROBADA</strong> por el jefe inmediato:</p>
    
    <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3>Información de la Solicitud</h3>
      <p><strong>Solicitante:</strong> ${solicitud.nombre}</p>
      <p><strong>Cédula:</strong> ${solicitud.cedula}</p>
      <p><strong>Correo del solicitante:</strong> ${solicitud.correo || 'No disponible'}</p>
      <p><strong>Cargo:</strong> ${solicitud.cargo}</p>
      <p><strong>Tipo:</strong> ${solicitud.tipoSolicitud} - ${solicitud.detalle}</p>
      <p><strong>Motivo de solicitud:</strong> ${solicitud.observaciones}</p>
      <p><strong>Jefe que aprobó:</strong> ${solicitud.jefe}</p>
      <p><strong>Fecha de aprobación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      <p><strong>Archivo adjunto:</strong> ${solicitud.archivo ? 'Sí (' + solicitud.archivo + ')' : 'No'}</p>
    </div>
    
    <p>Por favor proceda con la gestión correspondiente.</p>
    <p><strong>Archivos adjuntos:</strong></p>
    <ul>
      <li>PDF con detalles de la solicitud aprobada</li>
      ${solicitud.archivo ? '<li>Documento original adjuntado por el solicitante: ' + solicitud.archivo + '</li>' : ''}
    </ul>
    `;
    
    GmailApp.sendEmail(
      correosGestion,
      'Solicitud Aprobada - ' + solicitud.nombre,
      'Ver contenido HTML para detalles. Los archivos adjuntos contienen la información completa.',
      { 
        htmlBody: mensajeAprobacion,
        attachments: adjuntosGestion,
        name: 'Sistema de Solicitudes - Aprobación'
      }
    );
    
    Logger.log('Correo enviado a gestión: ' + correosGestion);
    
    // 8. NOTIFICAR AL USUARIO
    if (solicitud.correo && Validacion.validarCorreo(solicitud.correo)) {
      var mensajeUsuario = `
      <h2>✅ Su Solicitud ha sido Aprobada</h2>
      <p>Estimado/a ${solicitud.nombre},</p>
      <p>Su solicitud de <strong>${solicitud.tipoSolicitud}</strong> ha sido <strong>APROBADA</strong> por su jefe inmediato.</p>
      
      <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Detalles de la Solicitud Aprobada</h3>
        <p><strong>Tipo:</strong> ${solicitud.detalle}</p>
        <p><strong>Motivo de solicitud:</strong> ${solicitud.observaciones}</p>
        <p><strong>Fecha de aprobación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
        <p><strong>Jefe que aprobó:</strong> ${solicitud.jefe}</p>
      </div>
      
      <p>Su solicitud ha sido enviada al área de gestión para su procesamiento.</p>
      <p><strong>Archivo PDF:</strong> Encuentre los detalles completos en el documento adjunto.</p>
      <p style="color: #666; font-size: 12px;">ID de solicitud: ${solicitudId}</p>
      `;
      
      GmailApp.sendEmail(
        solicitud.correo,
        '✅ Solicitud Aprobada - ' + solicitud.tipoSolicitud,
        'Su solicitud ha sido aprobada. Ver el PDF adjunto para más detalles.',
        { 
          htmlBody: mensajeUsuario,
          attachments: [pdfBlob],
          name: 'Sistema de Solicitudes - Aprobación'
        }
      );
      
      Logger.log('Correo enviado al usuario: ' + solicitud.correo);
    }
    
    // 9. Mostrar página de éxito
    Logger.log('Mostrando página de envío adicional...');
    return mostrarPaginaEnvioAdicional(solicitudId);
    
  } catch (error) {
    Logger.log('ERROR en aprobarSolicitud: ' + error.toString());
    return HtmlService.createHtmlOutput('Error al procesar la solicitud: ' + error.toString());
  }
}

function mostrarPaginaEnvioAdicional(solicitudId) {
  var htmlOutput = HtmlService.createTemplateFromFile('PaginaEnvioAdicional');
  htmlOutput.solicitudId = solicitudId;
  return htmlOutput.evaluate();
}

function enviarCorreosAdicionales(solicitudId, correosAdicionales) {
  try {
    Logger.log('=== ENVÍO REAL DE CORREOS ADICIONALES ===');
    Logger.log('solicitudId: ' + solicitudId);
    Logger.log('correosAdicionales: ' + JSON.stringify(correosAdicionales));
    
    // 1. Obtener información de la solicitud
    var solicitud = BaseDatos.obtenerSolicitudCompletaPorId(solicitudId);
    if (!solicitud) {
      Logger.log('ERROR: No se encontró la solicitud');
      return {
        success: false,
        message: 'No se encontró la solicitud en la base de datos'
      };
    }
    
    Logger.log('Solicitud encontrada: ' + solicitud.nombre);
    
    // 2. Generar PDF (se guardará automáticamente en la carpeta de PDFs)
    var pdfBlob = GeneradorPDF.generarPDFDesdeSolicitud(solicitud);
    Logger.log('PDF generado correctamente');
    
    // 3. Buscar archivo adjunto original en la nueva carpeta específica de archivos adjuntos
    var archivoAdjuntoOriginal = null;
    if (solicitud.archivo && solicitud.archivo.trim() !== '' && solicitud.tipoSolicitud !== 'compensacion') {
      try {
        // Buscar en la carpeta específica de archivos adjuntos
        var folderIdAdjuntos = '15NmBvO7JlbrQqdUEl0YIM1XTLzW1dAAB';
        var folderAdjuntos;
        
        try {
          folderAdjuntos = DriveApp.getFolderById(folderIdAdjuntos);
          var files = folderAdjuntos.getFilesByName(solicitud.archivo);
          
          if (files.hasNext()) {
            archivoAdjuntoOriginal = files.next();
            Logger.log('Archivo adjunto encontrado en carpeta de archivos adjuntos: ' + solicitud.archivo);
          } else {
            // Si no se encuentra en la carpeta específica, buscar en todo Drive
            Logger.log('Buscando archivo en todo Drive: ' + solicitud.archivo);
            var allFiles = DriveApp.getFilesByName(solicitud.archivo);
            if (allFiles.hasNext()) {
              archivoAdjuntoOriginal = allFiles.next();
              Logger.log('Archivo adjunto encontrado en búsqueda global: ' + solicitud.archivo);
            }
          }
        } catch (e) {
          Logger.log('Error al acceder a carpeta de archivos adjuntos: ' + e.toString());
          // Buscar en todo Drive como fallback
          var allFiles = DriveApp.getFilesByName(solicitud.archivo);
          if (allFiles.hasNext()) {
            archivoAdjuntoOriginal = allFiles.next();
          }
        }
      } catch (e) {
        Logger.log('Error al buscar archivo adjunto: ' + e.toString());
      }
    }
    
    // 4. Preparar adjuntos
    var adjuntos = [pdfBlob];
    if (archivoAdjuntoOriginal) {
      adjuntos.push(archivoAdjuntoOriginal);
    }
    
    // 5. Crear mensaje
    var mensajeAdicional = `
    <h2>📋 Copia de Solicitud Aprobada</h2>
    <p>Se le comparte una copia de la siguiente solicitud que ha sido <strong>APROBADA</strong>:</p>
    
    <div style="background: #e8f4fc; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3 style="color: #2c3e50; margin-top: 0;">Información de la Solicitud</h3>
      <p><strong>Solicitante:</strong> ${solicitud.nombre}</p>
      <p><strong>Cédula:</strong> ${solicitud.cedula}</p>
      <p><strong>Correo del solicitante:</strong> ${solicitud.correo || 'No disponible'}</p>
      <p><strong>Cargo:</strong> ${solicitud.cargo}</p>
      <p><strong>Tipo:</strong> ${solicitud.tipoSolicitud} - ${solicitud.detalle}</p>
      <p><strong>Motivo de solicitud:</strong> ${solicitud.observaciones}</p>
      <p><strong>Jefe que aprobó:</strong> ${solicitud.jefe}</p>
      <p><strong>Fecha de aprobación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      <p><strong>Archivo adjunto:</strong> ${solicitud.archivo ? 'Sí (' + solicitud.archivo + ')' : 'No'}</p>
    </div>
    
    <p><strong>Nota:</strong> Esta es una copia informativa. La solicitud ya ha sido enviada al área de gestión para su procesamiento.</p>
    
    <p><strong>Archivos adjuntos:</strong></p>
    <ul>
      <li>PDF con detalles de la solicitud aprobada</li>
      ${solicitud.archivo ? '<li>Documento original adjuntado por el solicitante: ' + solicitud.archivo + '</li>' : ''}
    </ul>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="color: #6c757d; font-size: 12px; text-align: center;">
      Este mensaje fue generado automáticamente por el Sistema de Gestión de Solicitudes.
    </p>
    `;
    
    // 6. Enviar correos
    var correosEnviados = [];
    var correosFallidos = [];
    
    for (var i = 0; i < correosAdicionales.length; i++) {
      var correo = correosAdicionales[i].trim();
      Logger.log('Enviando correo a: ' + correo);
      
      try {
        // Validación básica del correo
        if (!correo || correo.indexOf('@') === -1) {
          Logger.log('Correo inválido: ' + correo);
          correosFallidos.push(correo + ' (formato inválido)');
          continue;
        }
        
        // ENVÍO REAL DEL CORREO
        GmailApp.sendEmail(
          correo,
          'Copia - Solicitud Aprobada - ' + solicitud.nombre,
          'Se le ha compartido una copia de una solicitud aprobada. Por favor ver el contenido HTML para más detalles.',
          { 
            htmlBody: mensajeAdicional,
            attachments: adjuntos,
            name: 'Sistema de Solicitudes - Copia de Aprobación'
          }
        );
        
        correosEnviados.push(correo);
        Logger.log('✓ Correo enviado exitosamente a: ' + correo);
        
        // Pequeña pausa entre envíos para evitar límites
        if (i < correosAdicionales.length - 1) {
          Utilities.sleep(1000); // 1 segundo de pausa
        }
        
      } catch (error) {
        Logger.log('✗ Error al enviar correo a ' + correo + ': ' + error.toString());
        correosFallidos.push(correo + ' (error: ' + error.message + ')');
      }
    }
    
    // 7. Preparar resultado
    var resultado = {
      success: true,
      message: 'Correos enviados exitosamente',
      detalles: {
        total: correosAdicionales.length,
        enviados: correosEnviados,
        fallidos: correosFallidos
      }
    };
    
    // Ajustar mensaje según resultados
    if (correosEnviados.length === 0 && correosFallidos.length > 0) {
      resultado.success = false;
      resultado.message = 'No se pudo enviar a ningún correo';
    } else if (correosFallidos.length > 0) {
      resultado.message = 'Algunos correos no se pudieron enviar';
    }
    
    Logger.log('=== RESUMEN FINAL ===');
    Logger.log('Resultado: ' + JSON.stringify(resultado));
    
    return resultado;
    
  } catch (error) {
    Logger.log('=== ERROR CRÍTICO ===');
    Logger.log('Error en enviarCorreosAdicionales: ' + error.toString());
    
    return {
      success: false,
      message: 'Error al procesar los correos: ' + error.message
    };
  }
}

function probarConexionSimple() {
  Logger.log('=== PRUEBA CONEXIÓN SIMPLE ===');
  return {
    success: true,
    message: 'Conexión funcionando - ' + new Date().toLocaleTimeString(),
    data: 'Test exitoso'
  };
}

function mostrarFormularioDenegacion(solicitudId) {
  var baseUrl = ScriptApp.getService().getUrl();
  
  var html = `
  <!DOCTYPE html>
  <html>
  <head>
    <base target="_top">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #599d5e 0%, #478252 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
      .container { background: white; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; width: 100%; max-width: 500px; }
      .header { background: linear-gradient(135deg, #2f6c46 0%, #478252 50%, #599d5e 100%); color: white; padding: 30px; text-align: center; }
      .header h2 { margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 1.5em; }
      .content { padding: 30px; }
      .form-group { margin-bottom: 20px; }
      label { display: block; margin-bottom: 8px; font-weight: bold; color: #2f6c46; font-size: 14px; }
      textarea { width: 100%; min-height: 120px; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 14px; font-family: inherit; resize: vertical; transition: border-color 0.3s ease; }
      textarea:focus { outline: none; border-color: #599d5e; box-shadow: 0 0 0 3px rgba(89, 157, 94, 0.1); }
      .buttons { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
      .btn { padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; font-size: 14px; }
      .btn-denegar { background: linear-gradient(135deg, #478252 0%, #599d5e 100%); color: white; }
      .btn-denegar:hover { background: linear-gradient(135deg, #2f6c46 0%, #478252 100%); transform: translateY(-1px); box-shadow: 0 5px 15px rgba(47, 108, 70, 0.3); }
      .btn-cancelar { background-color: #6c8789; color: white; }
      .btn-cancelar:hover { background-color: #5a7173; transform: translateY(-1px); }
      .error { color: #dc3545; font-size: 12px; margin-top: 5px; display: none; }
      .loading { display: none; text-align: center; padding: 20px; }
      .loading-spinner { border: 3px solid #f3f3f3; border-top: 3px solid #599d5e; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 10px; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2><i class="fas fa-times-circle"></i> Denegar Solicitud</h2>
      </div>
      <div class="content">
        <p style="margin-bottom: 20px; color: #555;">Por favor ingrese el motivo de la denegación:</p>
        
        <form id="denegarForm">
          <div class="form-group">
            <label for="motivo">Motivo de denegación:</label>
            <textarea id="motivo" name="motivo" placeholder="Explique detalladamente por qué se denega la solicitud..." required></textarea>
            <div id="motivoError" class="error">Por favor ingrese el motivo de denegación</div>
          </div>
        </form>
        
        <div class="loading" id="loading">
          <div class="loading-spinner"></div>
          <p>Procesando denegación...</p>
        </div>
        
        <div class="buttons">
          <button type="button" class="btn btn-cancelar" id="btnCancelar">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button type="button" class="btn btn-denegar" id="btnDenegar">
            <i class="fas fa-ban"></i> Confirmar Denegación
          </button>
        </div>
      </div>
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const motivoInput = document.getElementById('motivo');
        const motivoError = document.getElementById('motivoError');
        const btnCancelar = document.getElementById('btnCancelar');
        const btnDenegar = document.getElementById('btnDenegar');
        const loading = document.getElementById('loading');
        const buttons = document.querySelector('.buttons');
        
        function validarFormulario() {
          const motivo = motivoInput.value.trim();
          if (!motivo) {
            motivoError.style.display = 'block';
            motivoInput.focus();
            return false;
          }
          motivoError.style.display = 'none';
          return true;
        }
        
        function mostrarLoading() {
          loading.style.display = 'block';
          buttons.style.display = 'none';
        }
        
        function ocultarLoading() {
          loading.style.display = 'none';
          buttons.style.display = 'flex';
        }
        
        btnCancelar.addEventListener('click', function() {
          window.history.back();
        });
        
        btnDenegar.addEventListener('click', function() {
          if (validarFormulario()) {
            mostrarLoading();
            const motivo = motivoInput.value.trim();
            
            google.script.run
              .withSuccessHandler(function(result) {
                if (result && result.success) {
                  window.location.href = '${baseUrl}?action=denegacionCompletada&id=${solicitudId}';
                } else {
                  ocultarLoading();
                  alert('Error: ' + (result ? result.message : 'Error desconocido'));
                }
              })
              .withFailureHandler(function(error) {
                ocultarLoading();
                alert('Error al denegar la solicitud: ' + error.message);
              })
              .denegarSolicitud('${solicitudId}', motivo);
          }
        });
        
        denegarForm.addEventListener('submit', function(e) {
          e.preventDefault();
          btnDenegar.click();
        });
        
        motivoInput.addEventListener('input', function() {
          if (this.value.trim()) {
            motivoError.style.display = 'none';
          }
        });
        
        motivoInput.focus();
      });
    </script>
  </body>
  </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

function denegarSolicitud(solicitudId, motivo) {
  try {
    Logger.log('Denegando solicitud: ' + solicitudId + ' con motivo: ' + motivo);
    
    // Actualizar estado en la base de datos
    BaseDatos.actualizarEstadoSolicitud(solicitudId, 'Denegado', motivo);
    
    // Obtener información de la solicitud
    var solicitud = BaseDatos.obtenerSolicitudPorId(solicitudId);
    
    if (solicitud) {
      // Generar PDF de la solicitud denegada (se guardará automáticamente en la carpeta de PDFs)
      var pdfBlob = GeneradorPDF.generarPDFDenegada(solicitud, motivo);
      
      if (solicitud.correo && Validacion.validarCorreo(solicitud.correo)) {
        // Enviar correo al usuario notificando la denegación
        var mensajeDenegacion = `
        <h2>❌ Su Solicitud ha sido Denegada</h2>
        <p>Estimado/a ${solicitud.nombre},</p>
        <p>Lamentamos informarle que su solicitud de <strong>${solicitud.tipoSolicitud}</strong> ha sido <strong>DENEGADA</strong>.</p>
        
        <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Detalles de la Denegación</h3>
          <p><strong>Tipo de solicitud:</strong> ${solicitud.detalle}</p>
          <p><strong>Motivo de denegación:</strong> ${motivo}</p>
          <p><strong>Jefe que denegó:</strong> ${solicitud.jefe}</p>
          <p><strong>Fecha de denegación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
        
        <p>Si tiene preguntas sobre esta decisión, por favor contacte a su jefe inmediato.</p>
        <p><strong>Archivo PDF:</strong> Encuentre los detalles completos en el documento adjunto.</p>
        </p>
        `;
        
        GmailApp.sendEmail(solicitud.correo,
                          'Solicitud Denegada - ' + solicitud.tipoSolicitud,
                          'Su solicitud ha sido denegada. Ver el PDF adjunto para más detalles.',
                          { 
                            htmlBody: mensajeDenegacion,
                            attachments: [pdfBlob],
                            name: 'Sistema de Solicitudes - Denegación'
                          });
      }
      
      Logger.log('Solicitud denegada exitosamente');
      return {
        success: true,
        message: 'Solicitud denegada exitosamente'
      };
    } else {
      Logger.log('No se encontró la solicitud con ID: ' + solicitudId);
      return {
        success: false,
        message: 'No se encontró la solicitud'
      };
    }
    
  } catch (error) {
    Logger.log('Error al denegar solicitud: ' + error.toString());
    return { 
      success: false, 
      message: 'Error al procesar la denegación: ' + error.toString() 
    };
  }
}

function mostrarDenegacionCompletada(solicitudId) {
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
        .success { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
        .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success">❌ Solicitud Denegada</div>
        <p>La solicitud ha sido denegada exitosamente.</p>
        <p>Se ha enviado la notificación con el PDF adjunto al solicitante.</p>
        <a href="${ScriptApp.getService().getUrl()}" class="btn">Volver al sistema</a>
      </div>
    </body>
    </html>
  `);
}