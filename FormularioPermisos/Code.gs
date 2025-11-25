/**
 * SISTEMA DE GESTIÓN DE SOLICITUDES - CONSTRUCTORA CENTENARIO
 * Archivo principal que maneja las solicitudes HTTP y coordina el sistema
 * Versión: 2.0
 * Autor: Sistema Automatizado
 * Fecha: 2025
 */

/**
 * Función principal que maneja las solicitudes GET HTTP
 * @param {Object} e - Parámetros de la solicitud HTTP
 * @returns {HtmlService.HtmlOutput} Interfaz HTML del sistema
 */
function doGet(e) {
  try {
    // Verificar si es una acción de jefe (aprobación/denegación)
    if (e && e.parameter && e.parameter.action) {
      return manejarAccionJefe(e);
    }
    
    // Si no es acción de jefe, mostrar la interfaz principal
    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Sistema de Solicitudes')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    // Manejo de errores en la carga inicial
    Logger.log('Error en doGet: ' + error.toString());
    return HtmlService.createHtmlOutput('Error al cargar el sistema: ' + error.message);
  }
}

/**
 * Incluye archivos HTML/CSS en el proyecto
 * @param {string} filename - Nombre del archivo a incluir
 * @returns {string} Contenido del archivo
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Función de configuración inicial del sistema
 * @returns {Object} Resultado de la configuración
 */
function configurarSistema() {
  try {
    var resultado = BaseDatos.inicializarHojas();
    Logger.log('Configuración completada: ' + JSON.stringify(resultado));
    return resultado;
  } catch (error) {
    Logger.log('Error en configuración: ' + error.toString());
    return { success: false, message: 'Error en configuración: ' + error.message };
  }
}

/**
 * Función puente para buscar usuario por cédula
 * @param {string} cedula - Número de cédula a buscar
 * @returns {Object} Información del usuario
 */
function buscarPorCedula(cedula) {
  return BaseDatos.buscarPorCedula(cedula);
}

/**
 * Función puente para procesar formularios de solicitud
 * @param {Object} formData - Datos del formulario
 * @param {string} fileBytes - Archivo adjunto en base64
 * @param {string} fileName - Nombre del archivo
 * @param {string} fileType - Tipo MIME del archivo
 * @returns {Object} Resultado del procesamiento
 */
function processForm(formData, fileBytes, fileName, fileType) {
  return ProcesamientoFormulario.processForm(formData, fileBytes, fileName, fileType);
}

/**
 * Función de diagnóstico de la base de datos
 * @returns {Object} Resultados del diagnóstico
 */
function diagnosticarBaseDatos() {
  return BaseDatos.diagnosticarBaseDatos();
}

/**
 * Función puente para denegar solicitudes
 * @param {string} solicitudId - ID de la solicitud
 * @param {string} motivo - Motivo de la denegación
 * @returns {Object} Resultado de la denegación
 */
function denegarSolicitud(solicitudId, motivo) {
  return denegarSolicitud(solicitudId, motivo);
}

/**
 * Función completa de diagnóstico y corrección automática
 * @returns {Object} Resultado del diagnóstico y correcciones aplicadas
 */
function diagnosticarYCorregir() {
  try {
    var resultado = {
      diagnosticos: [],
      correcciones: []
    };

    // 1. VERIFICAR ACCESO A LA SPREADSHEET
    var spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById('1IQQTx9ml2oCv0co56TxNn8PHVEYR4eGvPUlEsu1mZHg');
      resultado.diagnosticos.push('✅ Acceso a la spreadsheet: OK');
    } catch (error) {
      resultado.diagnosticos.push('❌ Error al acceder a la spreadsheet: ' + error.toString());
      return resultado;
    }

    // 2. VERIFICAR EXISTENCIA DE HOJAS NECESARIAS
    var usuariosSheet = spreadsheet.getSheetByName('Usuarios');
    var solicitudesSheet = spreadsheet.getSheetByName('Solicitudes');

    // Verificar/Crear hoja de Usuarios
    if (!usuariosSheet) {
      resultado.diagnosticos.push('❌ No se encontró la hoja "Usuarios"');
      resultado.correcciones.push('Creando hoja "Usuarios"...');
      usuariosSheet = spreadsheet.insertSheet('Usuarios');
      
      // Configurar encabezados
      usuariosSheet.getRange(1, 1, 1, 6).setValues([[
        'Cédula', 'Nombre', 'Correo', 'Cargo', 'Jefe', 'Correo jefe'
      ]]);
      
      // Agregar datos de ejemplo
      usuariosSheet.getRange(2, 1, 4, 6).setValues([
        ['1001315070', 'Ana María Rodríguez', 'absortedz@gmail.com', 'Analista de Marketing', 'Carlos Fuentes', 'fabio.caro@constructoracentenario.com'],
        ['1715986320', 'Luis Fernando Vásquez', '', 'Desarrollador Junior', 'María José Pazmiño', 'manueljavierq97@gmail.com'],
        ['923457189', 'Sofía Alejandra Mendoza', '', 'Asistente Administrativa', 'Roberto Salazar', 'manueljavierq97@gmail.com'],
        ['1312458796', 'Juan Carlos López', '', 'Ingeniero de Soporte TI', 'Karla Valdivieso', 'manueljavierq97@gmail.com']
      ]);
      resultado.correcciones.push('✅ Hoja "Usuarios" creada exitosamente');
    } else {
      resultado.diagnosticos.push('✅ Hoja "Usuarios": OK');
    }

    // Verificar/Crear hoja de Solicitudes
    if (!solicitudesSheet) {
      resultado.diagnosticos.push('❌ No se encontró la hoja "Solicitudes"');
      resultado.correcciones.push('Creando hoja "Solicitudes"...');
      solicitudesSheet = spreadsheet.insertSheet('Solicitudes');
      
      // Configurar encabezados completos
      solicitudesSheet.getRange(1, 1, 1, 17).setValues([[
        'ID', 'Fecha', 'Cédula', 'Nombre', 'Correo', 'Cargo', 'Jefe', 'Correo Jefe', 
        'Tipo Solicitud', 'Detalle', 'Motivo de Solicitud',
        'Fecha Permiso', 'Hora Inicio', 'Hora Fin', 'Archivo', 'Estado', 'Motivo Denegación'
      ]]);
      
      // Ajustar anchos de columnas para mejor visualización
      solicitudesSheet.setColumnWidths(1, 17, 100);
      resultado.correcciones.push('✅ Hoja "Solicitudes" creada exitosamente');
    } else {
      resultado.diagnosticos.push('✅ Hoja "Solicitudes": OK');
    }

    resultado.diagnosticos.push('🎉 Diagnóstico completado');
    resultado.correcciones.push('Sistema listo para usar');

    return resultado;

  } catch (error) {
    // Manejo de errores críticos
    return {
      diagnosticos: ['❌ Error crítico durante el diagnóstico: ' + error.toString()],
      correcciones: ['No se pudieron aplicar todas las correcciones automáticas']
    };
  }
}