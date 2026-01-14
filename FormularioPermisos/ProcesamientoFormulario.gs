var ProcesamientoFormulario = (function() {
  
  function processForm(formData, fileBytes, fileName, fileType) {
    try {
      // Inicializar hojas primero
      BaseDatos.inicializarHojas();
      
      // Configuración de destinatarios - ahora usa el correo del jefe desde la base de datos
      var destinatarios = formData.correoJefe;
      
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
      
      // Generar un ID único para esta solicitud
      var solicitudId = Utilities.getUuid();
      
      // Guardar archivo adjunto en Drive de forma PERMANENTE en la carpeta específica
      var archivoAdjunto = null;
      var fileUrl = '';
      if (fileBytes && fileName && formData.tipoSolicitud !== 'compensacion') {
        try {
          var blob = Utilities.newBlob(Utilities.base64Decode(fileBytes), fileType, fileName);
          
          // Obtener carpeta específica para archivos adjuntos
          var folderIdAdjuntos = '15NmBvO7JlbrQqdUEl0YIM1XTLzW1dAAB';
          var folderAdjuntos;
          
          try {
            folderAdjuntos = DriveApp.getFolderById(folderIdAdjuntos);
            Logger.log('Carpeta de archivos adjuntos encontrada: ' + folderAdjuntos.getName());
          } catch (e) {
            Logger.log('Error al acceder a la carpeta de archivos adjuntos: ' + e.toString());
            // Intentar crear una carpeta de respaldo si no existe
            folderAdjuntos = DriveApp.createFolder('Solicitudes_Archivos_Backup');
            Logger.log('Carpeta de respaldo creada: ' + folderAdjuntos.getName());
          }
          
          // Crear archivo en la carpeta específica
          var file = folderAdjuntos.createFile(blob);
          archivoAdjunto = file;
          fileUrl = file.getUrl();
          
          Logger.log('Archivo guardado en carpeta de archivos adjuntos: ' + fileName + ' - URL: ' + fileUrl);
          
        } catch (e) {
          Logger.log('Error al guardar archivo en carpeta de adjuntos: ' + e.toString());
          // Intentar guardar en root como fallback
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
      
      // Crear PDF con los datos del formulario
      var pdfBlob = GeneradorPDF.generarPDF(formData, fileName);
      
      // Guardar información de la solicitud para referencia futura (incluyendo nombre del archivo)
      BaseDatos.guardarSolicitud(solicitudId, formData, fileName);
      
      // Crear el cuerpo del mensaje con botones de aprobación
      var mensaje = Email.crearMensajeConBotones(formData, fileName, solicitudId);
      
      // Preparar adjuntos para el jefe (PDF + archivo adjunto original)
      var adjuntosJefe = [pdfBlob];
      if (archivoAdjunto) {
        adjuntosJefe.push(archivoAdjunto);
      }
      
      // Enviar correo con PDF + archivo adjunto al jefe
      GmailApp.sendEmail(destinatarios, 
                        'Solicitud de ' + formData.tipoSolicitud + ' - ' + formData.nombre, 
                        'Por favor ver el contenido HTML para revisar esta solicitud.', {
        htmlBody: mensaje,
        name: 'Sistema de Solicitudes',
        attachments: adjuntosJefe // Envía PDF + archivo al jefe
      });
      
      return {
        success: true,
        message: 'Solicitud enviada correctamente al jefe inmediato' + (fileName && formData.tipoSolicitud !== 'compensacion' ? ' con archivo adjunto: ' + fileName : '')
      };
      
    } catch (error) {
      Logger.log('Error en processForm: ' + error.toString());
      return {
        success: false,
        message: 'Error al procesar la solicitud: ' + error.toString()
      };
    }
  }
  
  return {
    processForm: processForm
  };
  
})();