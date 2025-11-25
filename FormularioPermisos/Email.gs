/**
 * MÓDULO DE GESTIÓN DE CORREOS ELECTRÓNICOS
 * Se encarga de la creación y formato de mensajes de email
 * Genera emails con botones de acción para aprobación/denegación
 */

var Email = (function() {
  
  /**
   * Crea un mensaje de email HTML con botones de acción
   * @param {Object} formData - Datos del formulario de solicitud
   * @param {string} fileName - Nombre del archivo adjunto
   * @param {string} solicitudId - ID único de la solicitud
   * @returns {string} Mensaje HTML formateado
   */
  function crearMensajeConBotones(formData, fileName, solicitudId) {
    // Obtener la URL base del servicio web app
    var baseUrl = ScriptApp.getService().getUrl();
    
    /**
     * CONSTRUCCIÓN DEL MENSAJE HTML
     * Estructura:
     * 1. Encabezado y título
     * 2. Información del solicitante
     * 3. Detalles de la solicitud
     * 4. Botones de acción (Aprobar/Denegar)
     * 5. Información adicional
     * 6. Pie de página
     */
    var mensaje = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- ENCABEZADO Y TÍTULO -->
      <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
        Solicitud de ${formData.tipoSolicitud}
      </h2>
      
      <!-- INFORMACIÓN DEL SOLICITANTE -->
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="color: #2c3e50; margin-top: 0;">Información del Solicitante</h3>
        <p><strong>Nombre:</strong> ${formData.nombre}</p>
        <p><strong>Cédula:</strong> ${formData.cedula}</p>
        <p><strong>Correo electrónico:</strong> ${formData.correo || 'No disponible'}</p>
        <p><strong>Cargo/Dependencia:</strong> ${formData.cargo}</p>
        <p><strong>Jefe inmediato:</strong> ${formData.jefe}</p>
      </div>
      
      <!-- DETALLES DE LA SOLICITUD -->
      <div style="background: #e8f4fc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="color: #2c3e50; margin-top: 0;">Detalles de la Solicitud</h3>
        <p><strong>Tipo de solicitud:</strong> ${formData.tipoSolicitud}</p>
        <p><strong>Detalle:</strong> ${formData.tipoDetalleTexto}</p>
    `;
    
    // AGREGAR CAMPOS ESPECÍFICOS SEGÚN EL TIPO DE SOLICITUD
    if (formData.tipoSolicitud === 'permisos') {
      mensaje += `
        <p><strong>Fecha del permiso:</strong> ${formData.fechaPermiso}</p>
        <p><strong>Hora de inicio:</strong> ${formData.horaInicioPermiso}</p>
        <p><strong>Hora de fin:</strong> ${formData.horaFinPermiso}</p>
      `;
    } else if (formData.tipoSolicitud === 'incapacidades') {
      mensaje += `
        <p><strong>Fecha de inicio:</strong> ${formData.fechaInicio}</p>
        <p><strong>Fecha de fin:</strong> ${formData.fechaFin}</p>
      `;
    }
    
    // CONTINUACIÓN DEL MENSAJE
    mensaje += `
        <p><strong>Observaciones:</strong> ${formData.observaciones}</p>
        <p><strong>Soporte adjunto:</strong> ${fileName ? 'Sí (' + fileName + ')' : 'No'}</p>
      </div>
      
      <!-- SECCIÓN DE ACCIÓN REQUERIDA -->
      <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
        <h3 style="color: #856404; margin-top: 0;">Acción Requerida</h3>
        <p>Por favor revise la solicitud y tome una decisión:</p>
        
        <!-- BOTONES DE ACCIÓN -->
        <div style="text-align: center; margin: 20px 0;">
          <!-- BOTÓN APROBAR -->
          <a href="${baseUrl}?action=aprobar&id=${solicitudId}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 0 10px; display: inline-block; font-weight: bold;">
             ✅ Aprobar Solicitud
          </a>
          
          <!-- BOTÓN DENEGAR -->
          <a href="${baseUrl}?action=denegar&id=${solicitudId}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 0 10px; display: inline-block; font-weight: bold;">
             ❌ Denegar Solicitud
          </a>
        </div>
        
        <p style="font-size: 12px; color: #666; text-align: center;">
          <em>Al hacer clic en "Denegar Solicitud" se le pedirá que ingrese el motivo de la denegación.</em>
        </p>
      </div>
      
      <!-- INFORMACIÓN ADICIONAL -->
      <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="color: #0c5460; margin-top: 0;">Información Adicional</h3>
        <p><strong>ID de Solicitud:</strong> ${solicitudId}</p>
        <p><strong>Fecha de envío:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
        <p><strong>Archivos adjuntos:</strong></p>
        <ul>
          <li>PDF con detalles de la solicitud</li>
          ${fileName ? '<li>Documento adjuntado por el solicitante: ' + fileName + '</li>' : ''}
        </ul>
      </div>
      
      <!-- PIE DE PÁGINA -->
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #6c757d; font-size: 12px; text-align: center;">
        Este mensaje fue generado automáticamente por el Sistema de Gestión de Solicitudes.<br>
        Ver archivos adjuntos para más detalles.
      </p>
    </div>
    `;
    
    return mensaje;
  }
  
  // EXPORTAR FUNCIONALIDADES PÚBLICAS
  return {
    crearMensajeConBotones: crearMensajeConBotones
  };
  
})();