var Email = (function() {
  
  function crearMensajeConBotones(formData, fileName, solicitudId) {
    var baseUrl = ScriptApp.getService().getUrl();
    
    var mensaje = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Solicitud de ${formData.tipoSolicitud}</h2>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="color: #2c3e50; margin-top: 0;">Información del Solicitante</h3>
        <p><strong>Nombre:</strong> ${formData.nombre}</p>
        <p><strong>Cédula:</strong> ${formData.cedula}</p>
        <p><strong>Correo electrónico:</strong> ${formData.correo || 'No disponible'}</p>
        <p><strong>Cargo/Dependencia:</strong> ${formData.cargo}</p>
        <p><strong>Jefe inmediato:</strong> ${formData.jefe}</p>
      </div>
      
      <div style="background: #e8f4fc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="color: #2c3e50; margin-top: 0;">Detalles de la Solicitud</h3>
        <p><strong>Tipo de solicitud:</strong> ${formData.tipoSolicitud}</p>
        <p><strong>Detalle:</strong> ${formData.tipoDetalleTexto}</p>
    `;
    
    // Agregar campos específicos según el tipo de solicitud
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
    } else if (formData.tipoSolicitud === 'compensacion') {
      mensaje += `
        <p><strong>Tipo de solicitud:</strong> Compensación de Horas</p>
      `;
    }
    
    mensaje += `
        <p><strong>Observaciones:</strong> ${formData.observaciones}</p>
        <p><strong>Soporte adjunto:</strong> ${fileName ? 'Sí (' + fileName + ')' : 'No'}</p>
      </div>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
        <h3 style="color: #856404; margin-top: 0;">Acción Requerida</h3>
        <p>Por favor revise la solicitud y tome una decisión:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${baseUrl}?action=aprobar&id=${solicitudId}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 0 10px; display: inline-block; font-weight: bold;">
             ✅ Aprobar Solicitud
          </a>
          
          <a href="${baseUrl}?action=denegar&id=${solicitudId}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 0 10px; display: inline-block; font-weight: bold;">
             ❌ Denegar Solicitud
          </a>
        </div>
        
        <p style="font-size: 12px; color: #666; text-align: center;">
          <em>Al hacer clic en "Denegar Solicitud" se le pedirá que ingrese el motivo de la denegación.</em>
        </p>
      </div>
      
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
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #6c757d; font-size: 12px; text-align: center;">
        Este mensaje fue generado automáticamente por el Sistema de Gestión de Solicitudes.<br>
        Ver archivos adjuntos para más detalles.
      </p>
    </div>
    `;
    
    return mensaje;
  }
  
  return {
    crearMensajeConBotones: crearMensajeConBotones
  };
  
})();