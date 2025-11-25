/**
 * MÓDULO DE GENERACIÓN DE DOCUMENTOS PDF
 * Crea documentos PDF para diferentes estados de solicitud
 * Utiliza Google Documents temporalmente y los convierte a PDF
 */

var GeneradorPDF = (function() {
  
  /**
   * Función auxiliar para agregar campos al formulario en el PDF
   * @param {DocumentApp.Body} body - Cuerpo del documento
   * @param {string} label - Etiqueta del campo
   * @param {string} value - Valor del campo
   */
  function addFormField(body, label, value) {
    var field = body.appendParagraph(label + ': ' + value);
    field.setIndentFirstLine(20); // Sangría para mejor presentación
  }
  
  /**
   * Genera PDF inicial con los datos de la solicitud
   * @param {Object} formData - Datos del formulario
   * @param {string} fileName - Nombre del archivo adjunto
   * @returns {Blob} Documento PDF como blob
   */
  function generarPDF(formData, fileName) {
    try {
      // 1. CREAR DOCUMENTO TEMPORAL
      var doc = DocumentApp.create('Solicitud de ' + formData.tipoSolicitud + ' - ' + formData.nombre);
      var body = doc.getBody();
      
      // 2. CONFIGURAR ESTILOS DEL DOCUMENTO
      body.setMarginTop(50);      // Margen superior
      body.setMarginBottom(50);   // Margen inferior
      body.setMarginLeft(60);     // Margen izquierdo
      body.setMarginRight(60);    // Margen derecho
      
      // 3. TÍTULO PRINCIPAL
      var title = body.appendParagraph('SOLICITUD DE ' + formData.tipoSolicitud.toUpperCase());
      title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      title.setBold(true);
      body.appendParagraph(''); // Espacio en blanco
      
      // 4. INFORMACIÓN DEL SOLICITANTE
      var infoTitle = body.appendParagraph('INFORMACIÓN DEL SOLICITANTE');
      infoTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      infoTitle.setBold(true);
      
      // Agregar campos de información personal
      addFormField(body, 'Fecha de solicitud', new Date().toLocaleDateString('es-ES'));
      addFormField(body, 'Nombre', formData.nombre);
      addFormField(body, 'Cédula', formData.cedula);
      addFormField(body, 'Correo electrónico', formData.correo);
      addFormField(body, 'Cargo/Dependencia', formData.cargo);
      addFormField(body, 'Jefe inmediato', formData.jefe);
      addFormField(body, 'Correo del jefe', formData.correoJefe);
      addFormField(body, 'Tipo de solicitud', formData.tipoSolicitud);
      addFormField(body, 'Detalle', formData.tipoDetalleTexto);
      
      // 5. CAMPOS ESPECÍFICOS SEGÚN TIPO DE SOLICITUD
      if (formData.tipoSolicitud === 'permisos') {
        addFormField(body, 'Fecha del permiso', formData.fechaPermiso);
        addFormField(body, 'Hora de inicio', formData.horaInicioPermiso);
        addFormField(body, 'Hora de fin', formData.horaFinPermiso);
      } else if (formData.tipoSolicitud === 'incapacidades') {
        addFormField(body, 'Fecha de inicio', formData.fechaInicio);
        addFormField(body, 'Fecha de fin', formData.fechaFin);
      }
      
      body.appendParagraph(''); // Espacio en blanco
      
      // 6. MOTIVO DE SOLICITUD
      var obsTitle = body.appendParagraph('MOTIVO DE SOLICITUD');
      obsTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      obsTitle.setBold(true);
      
      var observaciones = body.appendParagraph(formData.observaciones);
      observaciones.setIndentFirstLine(20); // Sangría para el texto
      body.appendParagraph('');
      
      // 7. INFORMACIÓN DEL SOPORTE
      var soporteTitle = body.appendParagraph('DOCUMENTO ADJUNTO');
      soporteTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      soporteTitle.setBold(true);
      
      if (fileName) {
        addFormField(body, 'Nombre del archivo', fileName);
        addFormField(body, 'Estado', 'Archivo adjuntado correctamente');
        
        // Mensaje informativo sobre el archivo
        var mensajeArchivo = body.appendParagraph('El archivo adjunto ha sido incluido en el correo electrónico enviado.');
        mensajeArchivo.setItalic(true);
      } else {
        addFormField(body, 'Documento adjunto', 'No se adjuntó ningún documento de soporte.');
      }
      
      // 8. ESPACIOS FINALES Y PIE DE PÁGINA
      body.appendParagraph('');
      body.appendParagraph('');
      
      var footer = body.appendParagraph('Sistema Automatizado de Gestión de Solicitudes - ' + new Date().getFullYear());
      footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      footer.setItalic(true);
      
      // 9. GUARDAR Y CONVERTIR A PDF
      doc.saveAndClose();
      
      // Convertir el Documento a PDF
      var pdf = DriveApp.getFileById(doc.getId()).getAs('application/pdf');
      
      // 10. ELIMINAR DOCUMENTO TEMPORAL
      DriveApp.getFileById(doc.getId()).setTrashed(true);
      
      return pdf;
      
    } catch (error) {
      // MANEJO DE ERRORES - Retornar PDF vacío para no interrumpir el proceso
      Logger.log('Error al generar PDF: ' + error.toString());
      return Utilities.newBlob('', 'application/pdf', 'solicitud.pdf');
    }
  }
  
  /**
   * Genera PDF para solicitudes aprobadas
   * @param {Object} solicitud - Datos de la solicitud aprobada
   * @returns {Blob} Documento PDF como blob
   */
  function generarPDFDesdeSolicitud(solicitud) {
    try {
      // CREAR DOCUMENTO PARA SOLICITUD APROBADA
      var doc = DocumentApp.create('Solicitud Aprobada - ' + solicitud.nombre);
      var body = doc.getBody();
      
      // CONFIGURAR ESTILOS
      body.setMarginTop(50);
      body.setMarginBottom(50);
      body.setMarginLeft(60);
      body.setMarginRight(60);
      
      // TÍTULO PRINCIPAL
      var title = body.appendParagraph('SOLICITUD APROBADA - ' + solicitud.tipoSolicitud.toUpperCase());
      title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      title.setBold(true);
      body.appendParagraph('');
      
      // INFORMACIÓN DEL SOLICITANTE
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
      
      // SECCIÓN DE APROBACIÓN
      var aprobacionTitle = body.appendParagraph('INFORMACIÓN DE APROBACIÓN');
      aprobacionTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      aprobacionTitle.setBold(true);
      
      addFormField(body, 'Estado', 'APROBADO');
      addFormField(body, 'Fecha de aprobación', new Date().toLocaleDateString('es-ES'));
      addFormField(body, 'Aprobado por', solicitud.jefe);
      
      // ESPACIOS FINALES Y PIE DE PÁGINA
      body.appendParagraph('');
      body.appendParagraph('');
      
      var footer = body.appendParagraph('Sistema Automatizado de Gestión de Solicitudes - ' + new Date().getFullYear());
      footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      footer.setItalic(true);
      
      // CONVERTIR Y LIMPIAR
      doc.saveAndClose();
      var pdf = DriveApp.getFileById(doc.getId()).getAs('application/pdf');
      DriveApp.getFileById(doc.getId()).setTrashed(true);
      
      return pdf;
      
    } catch (error) {
      Logger.log('Error al generar PDF desde solicitud: ' + error.toString());
      return Utilities.newBlob('', 'application/pdf', 'solicitud_aprobada.pdf');
    }
  }
  
  /**
   * Genera PDF para solicitudes denegadas
   * @param {Object} solicitud - Datos de la solicitud
   * @param {string} motivo - Motivo de la denegación
   * @returns {Blob} Documento PDF como blob
   */
  function generarPDFDenegada(solicitud, motivo) {
    try {
      // CREAR DOCUMENTO PARA SOLICITUD DENEGADA
      var doc = DocumentApp.create('Solicitud Denegada - ' + solicitud.nombre);
      var body = doc.getBody();
      
      // CONFIGURAR ESTILOS
      body.setMarginTop(50);
      body.setMarginBottom(50);
      body.setMarginLeft(60);
      body.setMarginRight(60);
      
      // TÍTULO PRINCIPAL
      var title = body.appendParagraph('SOLICITUD DENEGADA - ' + solicitud.tipoSolicitud.toUpperCase());
      title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      title.setBold(true);
      body.appendParagraph('');
      
      // INFORMACIÓN DEL SOLICITANTE
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
      
      // SECCIÓN DE DENEGACIÓN
      var denegacionTitle = body.appendParagraph('INFORMACIÓN DE DENEGACIÓN');
      denegacionTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      denegacionTitle.setBold(true);
      
      addFormField(body, 'Estado', 'DENEGADO');
      addFormField(body, 'Motivo de denegación', motivo);
      addFormField(body, 'Fecha de denegación', new Date().toLocaleDateString('es-ES'));
      addFormField(body, 'Denegado por', solicitud.jefe);
      
      body.appendParagraph('');
      
      // PIE DE PÁGINA
      var footer = body.appendParagraph('Sistema Automatizado de Gestión de Solicitudes - ' + new Date().getFullYear());
      footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      footer.setItalic(true);
      
      // CONVERTIR Y LIMPIAR
      doc.saveAndClose();
      var pdf = DriveApp.getFileById(doc.getId()).getAs('application/pdf');
      DriveApp.getFileById(doc.getId()).setTrashed(true);
      
      return pdf;
      
    } catch (error) {
      Logger.log('Error al generar PDF denegada: ' + error.toString());
      return Utilities.newBlob('', 'application/pdf', 'solicitud_denegada.pdf');
    }
  }
  
  // EXPORTAR FUNCIONALIDADES PÚBLICAS
  return {
    generarPDF: generarPDF,
    generarPDFDesdeSolicitud: generarPDFDesdeSolicitud,
    generarPDFDenegada: generarPDFDenegada
  };
  
})();