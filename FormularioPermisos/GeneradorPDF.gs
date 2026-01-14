var GeneradorPDF = (function() {
  
  // IDs de carpetas
  var CARPETA_PDFS_ID = '1OSbIXHFema1VYusyTctCCpwoRTpgm_8T';
  
  // Función auxiliar para guardar PDF en carpeta específica
  function guardarPDFEnCarpeta(pdfBlob, nombreArchivo) {
    try {
      var pdfFolder = DriveApp.getFolderById(CARPETA_PDFS_ID);
      var pdfFile = pdfFolder.createFile(pdfBlob);
      pdfFile.setName(nombreArchivo);
      Logger.log('PDF guardado en carpeta específica: ' + nombreArchivo + ' - URL: ' + pdfFile.getUrl());
      return pdfFile;
    } catch (error) {
      Logger.log('Error al guardar PDF en carpeta específica: ' + error.toString());
      // Si falla, guardar en root
      var pdfFile = DriveApp.createFile(pdfBlob);
      pdfFile.setName(nombreArchivo);
      return pdfFile;
    }
  }
  
  // Función auxiliar para agregar campos al formulario en el PDF
  function addFormField(body, label, value) {
    var field = body.appendParagraph(label + ': ' + value);
    field.setIndentFirstLine(20);
  }
  
  function generarPDF(formData, fileName) {
    try {
      // Crear un documento PDF con todas las informaciones
      var doc = DocumentApp.create('Solicitud de ' + formData.tipoSolicitud + ' - ' + formData.nombre);
      var body = doc.getBody();
      
      // Estilo del documento
      body.setMarginTop(50);
      body.setMarginBottom(50);
      body.setMarginLeft(60);
      body.setMarginRight(60);
      
      // Título
      var title = body.appendParagraph('SOLICITUD DE ' + formData.tipoSolicitud.toUpperCase());
      title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      title.setBold(true);
      body.appendParagraph('');
      
      // Información de la solicitud
      var infoTitle = body.appendParagraph('INFORMACIÓN DEL SOLICITANTE');
      infoTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      infoTitle.setBold(true);
      
      addFormField(body, 'Fecha de solicitud', new Date().toLocaleDateString('es-ES'));
      addFormField(body, 'Nombre', formData.nombre);
      addFormField(body, 'Cédula', formData.cedula);
      addFormField(body, 'Correo electrónico', formData.correo);
      addFormField(body, 'Cargo/Dependencia', formData.cargo);
      addFormField(body, 'Jefe inmediato', formData.jefe);
      addFormField(body, 'Correo del jefe', formData.correoJefe);
      addFormField(body, 'Tipo de solicitud', formData.tipoSolicitud);
      addFormField(body, 'Detalle', formData.tipoDetalleTexto);
      
      // Agregar campos específicos según el tipo de solicitud
      if (formData.tipoSolicitud === 'permisos') {
        addFormField(body, 'Fecha del permiso', formData.fechaPermiso);
        addFormField(body, 'Hora de inicio', formData.horaInicioPermiso);
        addFormField(body, 'Hora de fin', formData.horaFinPermiso);
      } else if (formData.tipoSolicitud === 'incapacidades') {
        addFormField(body, 'Fecha de inicio', formData.fechaInicio);
        addFormField(body, 'Fecha de fin', formData.fechaFin);
      } else if (formData.tipoSolicitud === 'compensacion') {
        addFormField(body, 'Tipo de solicitud', 'Compensación de Horas');
      }
      
      body.appendParagraph('');
      
      // Motivo de solicitud (Observaciones)
      var obsTitle = body.appendParagraph('MOTIVO DE SOLICITUD');
      obsTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      obsTitle.setBold(true);
      
      var observaciones = body.appendParagraph(formData.observaciones);
      observaciones.setIndentFirstLine(20);
      body.appendParagraph('');
      
      // Información del soporte
      var soporteTitle = body.appendParagraph('DOCUMENTO ADJUNTO');
      soporteTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      soporteTitle.setBold(true);
      
      if (fileName) {
        addFormField(body, 'Nombre del archivo', fileName);
        addFormField(body, 'Estado', 'Archivo adjuntado correctamente');
        
        // Agregar mensaje sobre el archivo
        var mensajeArchivo = body.appendParagraph('El archivo adjunto ha sido incluido en el correo electrónico enviado.');
        mensajeArchivo.setItalic(true);
      } else {
        addFormField(body, 'Documento adjunto', 'No se adjuntó ningún documento de soporte.');
      }
      
      body.appendParagraph('');
      body.appendParagraph('');
      
      // Pie de página
      var footer = body.appendParagraph('Sistema Automatizado de Gestión de Solicitudes - ' + new Date().getFullYear());
      footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      footer.setItalic(true);
      
      // Guardar y cerrar el documento
      doc.saveAndClose();
      
      // Convertir el Documento a PDF
      var docFile = DriveApp.getFileById(doc.getId());
      var pdfBlob = docFile.getAs('application/pdf');
      var nombrePDF = 'Solicitud_' + formData.cedula + '_' + new Date().getTime() + '.pdf';
      
      // Guardar el PDF en la carpeta específica
      var pdfGuardado = guardarPDFEnCarpeta(pdfBlob, nombrePDF);
      
      // Eliminar el documento temporal
      docFile.setTrashed(true);
      
      // Retornar el blob del PDF
      return pdfBlob;
      
    } catch (error) {
      Logger.log('Error al generar PDF: ' + error.toString());
      // En caso de error, retornar un blob vacío para evitar que falle el proceso
      return Utilities.newBlob('', 'application/pdf', 'solicitud.pdf');
    }
  }
  
  function generarPDFDesdeSolicitud(solicitud) {
    try {
      // Crear un documento PDF
      var doc = DocumentApp.create('Solicitud Aprobada - ' + solicitud.nombre);
      var body = doc.getBody();
      
      // Estilo del documento
      body.setMarginTop(50);
      body.setMarginBottom(50);
      body.setMarginLeft(60);
      body.setMarginRight(60);
      
      // Título
      var title = body.appendParagraph('SOLICITUD APROBADA - ' + solicitud.tipoSolicitud.toUpperCase());
      title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      title.setBold(true);
      body.appendParagraph('');
      
      // Información de la solicitud
      var infoTitle = body.appendParagraph('INFORMACIÓN DEL SOLICITANTE');
      infoTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      infoTitle.setBold(true);
      
      addFormField(body, 'Fecha de solicitud', new Date().toLocaleDateString('es-ES'));
      addFormField(body, 'Nombre', solicitud.nombre);
      addFormField(body, 'Cédula', solicitud.cedula);
      addFormField(body, 'Correo electrónico', solicitud.correo);
      addFormField(body, 'Cargo/Dependencia', solicitud.cargo);
      addFormField(body, 'Jefe inmediato', solicitud.jefe);
      addFormField(body, 'Tipo de solicitud', solicitud.tipoSolicitud);
      addFormField(body, 'Detalle', solicitud.detalle);
      addFormField(body, 'Motivo de solicitud', solicitud.observaciones);
      
      body.appendParagraph('');
      
      // Sección de aprobación
      var aprobacionTitle = body.appendParagraph('INFORMACIÓN DE APROBACIÓN');
      aprobacionTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      aprobacionTitle.setBold(true);
      
      addFormField(body, 'Estado', 'APROBADO');
      addFormField(body, 'Fecha de aprobación', new Date().toLocaleDateString('es-ES'));
      addFormField(body, 'Aprobado por', solicitud.jefe);
      
      body.appendParagraph('');
      body.appendParagraph('');
      
      // Pie de página (SIN FIRMAS)
      var footer = body.appendParagraph('Sistema Automatizado de Gestión de Solicitudes - ' + new Date().getFullYear());
      footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      footer.setItalic(true);
      
      // Guardar y cerrar el documento
      doc.saveAndClose();
      
      // Convertir el Documento a PDF
      var docFile = DriveApp.getFileById(doc.getId());
      var pdfBlob = docFile.getAs('application/pdf');
      var nombrePDF = 'Solicitud_Aprobada_' + solicitud.cedula + '_' + new Date().getTime() + '.pdf';
      
      // Guardar el PDF en la carpeta específica
      var pdfGuardado = guardarPDFEnCarpeta(pdfBlob, nombrePDF);
      
      // Eliminar el documento temporal
      docFile.setTrashed(true);
      
      return pdfBlob;
      
    } catch (error) {
      Logger.log('Error al generar PDF desde solicitud: ' + error.toString());
      // En caso de error, retornar un blob vacío para evitar que falle el proceso
      return Utilities.newBlob('', 'application/pdf', 'solicitud_aprobada.pdf');
    }
  }
  
  function generarPDFDenegada(solicitud, motivo) {
    try {
      var doc = DocumentApp.create('Solicitud Denegada - ' + solicitud.nombre);
      var body = doc.getBody();
      
      body.setMarginTop(50);
      body.setMarginBottom(50);
      body.setMarginLeft(60);
      body.setMarginRight(60);
      
      // Título
      var title = body.appendParagraph('SOLICITUD DENEGADA - ' + solicitud.tipoSolicitud.toUpperCase());
      title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      title.setBold(true);
      body.appendParagraph('');
      
      // Información de la solicitud
      var infoTitle = body.appendParagraph('INFORMACIÓN DEL SOLICITANTE');
      infoTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      infoTitle.setBold(true);
      
      addFormField(body, 'Fecha de solicitud', new Date().toLocaleDateString('es-ES'));
      addFormField(body, 'Nombre', solicitud.nombre);
      addFormField(body, 'Cédula', solicitud.cedula);
      addFormField(body, 'Correo electrónico', solicitud.correo);
      addFormField(body, 'Cargo/Dependencia', solicitud.cargo);
      addFormField(body, 'Jefe inmediato', solicitud.jefe);
      addFormField(body, 'Tipo de solicitud', solicitud.tipoSolicitud);
      addFormField(body, 'Detalle', solicitud.detalle);
      addFormField(body, 'Motivo de solicitud', solicitud.observaciones);
      
      body.appendParagraph('');
      
      // Sección de denegación
      var denegacionTitle = body.appendParagraph('INFORMACIÓN DE DENEGACIÓN');
      denegacionTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      denegacionTitle.setBold(true);
      
      addFormField(body, 'Estado', 'DENEGADO');
      addFormField(body, 'Motivo de denegación', motivo);
      addFormField(body, 'Fecha de denegación', new Date().toLocaleDateString('es-ES'));
      addFormField(body, 'Denegado por', solicitud.jefe);
      
      body.appendParagraph('');
      
      // Pie de página (SIN FIRMAS)
      var footer = body.appendParagraph('Sistema Automatizado de Gestión de Solicitudes - ' + new Date().getFullYear());
      footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      footer.setItalic(true);
      
      doc.saveAndClose();
      var docFile = DriveApp.getFileById(doc.getId());
      var pdfBlob = docFile.getAs('application/pdf');
      var nombrePDF = 'Solicitud_Denegada_' + solicitud.cedula + '_' + new Date().getTime() + '.pdf';
      
      // Guardar el PDF en la carpeta específica
      var pdfGuardado = guardarPDFEnCarpeta(pdfBlob, nombrePDF);
      
      // Eliminar el documento temporal
      docFile.setTrashed(true);
      
      return pdfBlob;
      
    } catch (error) {
      Logger.log('Error al generar PDF denegada: ' + error.toString());
      return Utilities.newBlob('', 'application/pdf', 'solicitud_denegada.pdf');
    }
  }
  
  return {
    generarPDF: generarPDF,
    generarPDFDesdeSolicitud: generarPDFDesdeSolicitud,
    generarPDFDenegada: generarPDFDenegada
  };
  
})();