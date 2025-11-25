/**
 * MÓDULO DE GESTIÓN DE BASE DE DATOS
 * Maneja todas las operaciones con Google Sheets
 * Incluye: búsqueda, guardado, actualización y diagnóstico
 */

var BaseDatos = (function() {
  
  // ID de la spreadsheet principal - MODIFICAR SEGÚN SEA NECESARIO
  var SPREADSHEET_ID = '1IQQTx9ml2oCv0co56TxNn8PHVEYR4eGvPUlEsu1mZHg';
  
  /**
   * Obtiene la instancia de la spreadsheet
   * @returns {SpreadsheetApp.Spreadsheet} Instancia de la spreadsheet
   */
  function getSpreadsheet() {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  
  /**
   * Realiza diagnóstico completo de la base de datos
   * @returns {Object} Resultado del diagnóstico
   */
  function diagnosticarBaseDatos() {
    try {
      var spreadsheet = getSpreadsheet();
      var sheet = spreadsheet.getSheetByName('Usuarios');
      
      // Verificar existencia de la hoja
      if (!sheet) {
        return {
          success: false,
          message: 'No se encontró la hoja "Usuarios"'
        };
      }
      
      // Obtener todos los datos
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      Logger.log('Encabezados encontrados: ' + JSON.stringify(headers));
      
      // Calcular índices de columnas de manera flexible
      var indices = {
        'Cédula': headers.indexOf('Cédula'),
        'Nombre': headers.indexOf('Nombre'),
        'Correo': headers.indexOf('Correo'),
        'Cargo': headers.indexOf('Cargo'),
        'Jefe': headers.indexOf('Jefe'),
        'Correo jefe': headers.indexOf('Correo jefe')
      };
      
      Logger.log('Índices de columnas: ' + JSON.stringify(indices));
      
      // Mostrar datos de ejemplo para verificación
      if (data.length > 1) {
        Logger.log('Primera fila de datos: ' + JSON.stringify(data[1]));
      }
      
      return {
        success: true,
        headers: headers,
        indices: indices,
        totalFilas: data.length
      };
      
    } catch (error) {
      return {
        success: false,
        message: 'Error en diagnóstico: ' + error.toString()
      };
    }
  }
  
  /**
   * Inicializa las hojas de cálculo con estructura y datos básicos
   * @returns {Object} Estado de la inicialización
   */
  function inicializarHojas() {
    var spreadsheet = getSpreadsheet();
    
    // VERIFICAR/CREAR HOJA DE USUARIOS
    var usuariosSheet = spreadsheet.getSheetByName('Usuarios');
    if (!usuariosSheet) {
      usuariosSheet = spreadsheet.insertSheet('Usuarios');
      
      // Configurar estructura de la hoja
      usuariosSheet.getRange(1, 1, 1, 6).setValues([[
        'Cédula', 'Nombre', 'Correo', 'Cargo', 'Jefe', 'Correo jefe'
      ]]);
      
      // Insertar datos de ejemplo
      usuariosSheet.getRange(2, 1, 4, 6).setValues([
        ['1001315070', 'Ana María Rodríguez', 'absortedz@gmail.com', 'Analista de Marketing', 'Carlos Fuentes', 'fabio.caro@constructoracentenario.com'],
        ['1715986320', 'Luis Fernando Vásquez', '', 'Desarrollador Junior', 'María José Pazmiño', 'manueljavierq97@gmail.com'],
        ['923457189', 'Sofía Alejandra Mendoza', '', 'Asistente Administrativa', 'Roberto Salazar', 'manueljavierq97@gmail.com'],
        ['1312458796', 'Juan Carlos López', '', 'Ingeniero de Soporte TI', 'Karla Valdivieso', 'manueljavierq97@gmail.com']
      ]);
    }
    
    // VERIFICAR/CREAR HOJA DE SOLICITUDES
    var solicitudesSheet = spreadsheet.getSheetByName('Solicitudes');
    if (!solicitudesSheet) {
      solicitudesSheet = spreadsheet.insertSheet('Solicitudes');
      
      // Configurar estructura completa de solicitudes
      solicitudesSheet.getRange(1, 1, 1, 17).setValues([[
        'ID', 'Fecha', 'Cédula', 'Nombre', 'Correo', 'Cargo', 'Jefe', 'Correo Jefe', 
        'Tipo Solicitud', 'Detalle', 'Motivo de Solicitud',
        'Fecha Permiso', 'Hora Inicio', 'Hora Fin', 'Archivo', 'Estado', 'Motivo Denegación'
      ]]);
      
      // Mejorar visualización ajustando anchos
      solicitudesSheet.setColumnWidths(1, 17, 100);
    }
    
    return {
      usuarios: usuariosSheet !== null,
      solicitudes: solicitudesSheet !== null
    };
  }
  
  /**
   * Busca un usuario por número de cédula
   * @param {string} cedula - Número de cédula a buscar
   * @returns {Object} Resultado de la búsqueda
   */
  function buscarPorCedula(cedula) {
    try {
      Logger.log('Buscando cédula: ' + cedula);
      
      var spreadsheet = getSpreadsheet();
      var sheet = spreadsheet.getSheetByName('Usuarios');
      
      // Verificar existencia de la hoja
      if (!sheet) {
        Logger.log('No se encontró la hoja Usuarios');
        return {
          success: false,
          message: 'No se encontró la base de datos de usuarios'
        };
      }
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      Logger.log('Encabezados: ' + JSON.stringify(headers));
      Logger.log('Total de filas: ' + data.length);
      
      // BUSCAR ÍNDICES DE COLUMNAS DE MANERA FLEXIBLE
      var cedulaIndex = -1;
      var nombreIndex = -1;
      var correoIndex = -1;
      var cargoIndex = -1;
      var jefeIndex = -1;
      var correoJefeIndex = -1;
      
      for (var i = 0; i < headers.length; i++) {
        var header = headers[i].toString().toLowerCase();
        if (header.includes('cédula') || header.includes('cedula')) {
          cedulaIndex = i;
        } else if (header.includes('nombre')) {
          nombreIndex = i;
        } else if (header.includes('correo') && !header.includes('jefe')) {
          correoIndex = i;
        } else if (header.includes('cargo')) {
          cargoIndex = i;
        } else if (header.includes('jefe') && !header.includes('correo')) {
          jefeIndex = i;
        } else if (header.includes('correo jefe') || (header.includes('correo') && header.includes('jefe'))) {
          correoJefeIndex = i;
        }
      }
      
      Logger.log('Índices encontrados - Cédula: ' + cedulaIndex + ', Nombre: ' + nombreIndex + ', Correo: ' + correoIndex + ', CorreoJefe: ' + correoJefeIndex);
      
      // VALIDAR COLUMNAS MÍNIMAS REQUERIDAS
      if (cedulaIndex === -1 || nombreIndex === -1 || correoJefeIndex === -1) {
        return {
          success: false,
          message: 'La estructura de la base de datos no es válida. Se requieren al menos las columnas: Cédula, Nombre y Correo jefe. Encabezados encontrados: ' + JSON.stringify(headers)
        };
      }
      
      // BUSCAR CÉDULA EN LOS DATOS
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var cedulaEncontrada = row[cedulaIndex] ? row[cedulaIndex].toString().trim() : '';
        
        Logger.log('Comparando: ' + cedula + ' con ' + cedulaEncontrada);
        
        if (cedulaEncontrada === cedula) {
          // USUARIO ENCONTRADO - EXTRAER DATOS
          var correoJefe = row[correoJefeIndex] ? row[correoJefeIndex].toString().trim() : '';
          var correoUsuario = correoIndex !== -1 ? (row[correoIndex] ? row[correoIndex].toString().trim() : '') : '';
          var cargo = cargoIndex !== -1 ? (row[cargoIndex] ? row[cargoIndex].toString().trim() : '') : '';
          var jefe = jefeIndex !== -1 ? (row[jefeIndex] ? row[jefeIndex].toString().trim() : '') : '';
          
          Logger.log('Usuario encontrado: ' + row[nombreIndex] + ', Correo: ' + correoUsuario + ', Correo jefe: ' + correoJefe);
          
          // VALIDAR CORREO DEL JEFE
          if (!Validacion.validarCorreo(correoJefe)) {
            return {
              success: false,
              message: 'El correo del jefe no es válido: ' + correoJefe + '. Contacte al administrador.'
            };
          }
          
          // RETORNAR DATOS DEL USUARIO
          return {
            success: true,
            data: {
              cedula: cedulaEncontrada,
              nombre: row[nombreIndex] ? row[nombreIndex].toString().trim() : '',
              correo: correoUsuario,
              cargo: cargo,
              jefe: jefe,
              correoJefe: correoJefe
            }
          };
        }
      }
      
      // CÉDULA NO ENCONTRADA
      Logger.log('No se encontró la cédula: ' + cedula);
      return {
        success: false,
        message: 'No se encontró ningún usuario con la cédula: ' + cedula
      };
      
    } catch (error) {
      Logger.log('Error en buscarPorCedula: ' + error.toString());
      return {
        success: false,
        message: 'Error al buscar en la base de datos: ' + error.toString()
      };
    }
  }
  
  /**
   * Guarda una nueva solicitud en la base de datos
   * @param {string} solicitudId - ID único de la solicitud
   * @param {Object} formData - Datos del formulario
   * @param {string} fileName - Nombre del archivo adjunto
   */
  function guardarSolicitud(solicitudId, formData, fileName) {
    try {
      var spreadsheet = getSpreadsheet();
      var sheet = spreadsheet.getSheetByName('Solicitudes');
      
      // Crear hoja si no existe
      if (!sheet) {
        inicializarHojas();
        sheet = spreadsheet.getSheetByName('Solicitudes');
      }
      
      // PREPARAR FILA CON TODOS LOS DATOS
      var nuevaFila = [
        solicitudId,                       // ID
        new Date(),                        // Fecha
        formData.cedula,                   // Cédula
        formData.nombre,                   // Nombre
        formData.correo,                   // Correo
        formData.cargo,                    // Cargo
        formData.jefe,                     // Jefe
        formData.correoJefe,               // Correo Jefe
        formData.tipoSolicitud,            // Tipo Solicitud
        formData.tipoDetalleTexto,         // Detalle
        formData.observaciones,            // Motivo de Solicitud
        formData.fechaPermiso || '',       // Fecha Permiso
        formData.horaInicioPermiso || '',  // Hora Inicio
        formData.horaFinPermiso || '',     // Hora Fin
        fileName || '',                    // Archivo
        'Pendiente',                       // Estado
        ''                                 // Motivo Denegación
      ];
      
      // AGREGAR FILA A LA HOJA
      sheet.appendRow(nuevaFila);
      
    } catch (error) {
      Logger.log('Error al guardar solicitud: ' + error.toString());
    }
  }
  
  /**
   * Actualiza el estado de una solicitud
   * @param {string} solicitudId - ID de la solicitud
   * @param {string} estado - Nuevo estado (Aprobado/Denegado)
   * @param {string} motivo - Motivo en caso de denegación
   */
  function actualizarEstadoSolicitud(solicitudId, estado, motivo) {
    try {
      var spreadsheet = getSpreadsheet();
      var sheet = spreadsheet.getSheetByName('Solicitudes');
      
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        
        // BUSCAR SOLICITUD POR ID
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === solicitudId) {
            // ACTUALIZAR ESTADO (columna 16) y MOTIVO (columna 17)
            sheet.getRange(i + 1, 16).setValue(estado);
            if (motivo) {
              sheet.getRange(i + 1, 17).setValue(motivo);
            }
            break;
          }
        }
      }
    } catch (error) {
      Logger.log('Error al actualizar estado: ' + error.toString());
    }
  }
  
  /**
   * Obtiene información básica de una solicitud por ID
   * @param {string} solicitudId - ID de la solicitud
   * @returns {Object} Datos de la solicitud
   */
  function obtenerSolicitudPorId(solicitudId) {
    try {
      var spreadsheet = getSpreadsheet();
      var sheet = spreadsheet.getSheetByName('Solicitudes');
      
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === solicitudId) {
            return {
              nombre: data[i][3],
              cedula: data[i][2],
              correo: data[i][4],
              cargo: data[i][5],
              jefe: data[i][6],
              tipoSolicitud: data[i][8],
              detalle: data[i][9],
              observaciones: data[i][10]
            };
          }
        }
      }
    } catch (error) {
      Logger.log('Error al obtener solicitud: ' + error.toString());
    }
    return null;
  }
  
  /**
   * Obtiene información completa de una solicitud por ID (incluye archivo)
   * @param {string} solicitudId - ID de la solicitud
   * @returns {Object} Datos completos de la solicitud
   */
  function obtenerSolicitudCompletaPorId(solicitudId) {
    try {
      var spreadsheet = getSpreadsheet();
      var sheet = spreadsheet.getSheetByName('Solicitudes');
      
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] === solicitudId) {
            return {
              nombre: data[i][3],
              cedula: data[i][2],
              correo: data[i][4],
              cargo: data[i][5],
              jefe: data[i][6],
              tipoSolicitud: data[i][8],
              detalle: data[i][9],
              observaciones: data[i][10],
              archivo: data[i][14] // Nombre del archivo adjunto
            };
          }
        }
      }
    } catch (error) {
      Logger.log('Error al obtener solicitud completa: ' + error.toString());
    }
    return null;
  }
  
  // EXPORTAR FUNCIONALIDADES PÚBLICAS
  return {
    diagnosticarBaseDatos: diagnosticarBaseDatos,
    inicializarHojas: inicializarHojas,
    buscarPorCedula: buscarPorCedula,
    guardarSolicitud: guardarSolicitud,
    actualizarEstadoSolicitud: actualizarEstadoSolicitud,
    obtenerSolicitudPorId: obtenerSolicitudPorId,
    obtenerSolicitudCompletaPorId: obtenerSolicitudCompletaPorId
  };
  
})();