/**
 * MÓDULO DE PROCESAMIENTO DE FORMULARIOS
 * Coordina el flujo completo de procesamiento de solicitudes
 * Incluye: validación, guardado, generación de PDF y envío de correos
 */

var ProcesamientoFormulario = (function() {
  
  /**
   * Procesa el formulario completo de solicitud
   * @param {Object} formData - Datos del formulario
   * @param {string} fileBytes - Archivo en base64
   * @param {string} fileName - Nombre del archivo
   * @param {string} fileType - Tipo MIME del archivo
   * @returns {Object} Resultado del procesamiento
   */
  function processForm(formData, fileBytes, fileName, fileType) {
    try {
      // 1. INICIALIZAR HOJAS DE BASE DE DATOS
      BaseDatos.inicializarHojas();
      
      // 2. CONFIGURACIÓN DE DESTINATARIOS
      var destinatarios = formData.correoJefe;
      
      // Validar que exista correo del jefe
      if (!destinatarios) {
        return {
          success: false,
          message: 'No se encontró el correo del jefe inmediato en la base de datos'
        };
      }
      
      // Validar formato del correo del jefe
      if (!Validacion.validarCorreo(destinatarios)) {
        return {
          success: false,
          message: 'El correo del jefe no tiene un formato válido: ' + destinatarios
        };
      }
      
      // 3. GENERAR ID ÚNICO PARA LA SOLICITUD
      var solicitudId = Utilities.getUuid();
      
      // 4. PROCESAR ARCHIVO ADJUNTO
      var archivoAdjunto = null;
      var fileUrl = '';
      if (fileBytes && fileName) {
        try {
          // Convertir base64 a blob
          var blob = Utilities.newBlob(Utilities.base64Decode(fileBytes), fileType, fileName);
          
          // Crear o obtener carpeta para archivos
          var folderName = 'Solicitudes_Archivos';
          var folders = DriveApp.getFoldersByName(folderName);
          var folder;
          
          if (folders.hasNext()) {
            folder = folders.next();
          } else {
            folder = DriveApp.createFolder(folderName);
          }
          
          // Guardar archivo permanentemente
          var file = folder.createFile(blob);
          archivoAdjunto = file;
          fileUrl = file.getUrl();
          
          Logger.log('Archivo guardado permanentemente: ' + fileName + ' - URL: ' + fileUrl);
          
        } catch (e) {
          Logger.log('Error al guardar archivo permanentemente: ' + e.toString());
          // Fallback: guardar en root
          try {
            var blob = Utilities.newBlob(Utilities.base64Decode(fileBytes), fileType, fileName);
            var file = DriveApp.getRootFolder().createFile(blob);
            archivoAdjunto = file;
            fileUrl = file.getUrl();
          } catch (e2) {
            Logger.log('Error al guardar archivo en root: ' + e2.toString());
          }
        }
      }
      
      // 5. GENERAR PDF CON LOS DATOS
      var pdfBlob = GeneradorPDF.generarPDF(formData, fileName);
      
      // 6. GUARDAR EN BASE DE DATOS
      BaseDatos.guardarSolicitud(solicitudId, formData, fileName);
      
      // 7. CREAR MENSAJE DE CORREO CON BOTONES DE ACCIÓN
      var mensaje = Email.crearMensajeConBotones(formData, fileName, solicitudId);
      
      // 8. PREPARAR ADJUNTOS PARA EL JEFE
      var adjuntosJefe = [pdfBlob];
      if (archivoAdjunto) {
        adjuntosJefe.push(archivoAdjunto);
      }
      
      // 9. ENVIAR CORREO AL JEFE INMEDIATO
      GmailApp.sendEmail(destinatarios, 
                        'Solicitud de ' + formData.tipoSolicitud + ' - ' + formData.nombre, 
                        'Por favor ver el contenido HTML para revisar esta solicitud.', {
        htmlBody: mensaje,
        name: 'Sistema de Solicitudes',
        attachments: adjuntosJefe
      });
      
      // 10. RETORNAR RESULTADO EXITOSO
      return {
        success: true,
        message: 'Solicitud enviada correctamente al jefe inmediato' + (fileName ? ' con archivo adjunto: ' + fileName : '')
      };
      
    } catch (error) {
      // MANEJO DE ERRORES
      Logger.log('Error en processForm: ' + error.toString());
      return {
        success: false,
        message: 'Error al procesar la solicitud: ' + error.toString()
      };
    }
  }
  
  // EXPORTAR FUNCIONALIDAD
  return {
    processForm: processForm
  };
  
})();