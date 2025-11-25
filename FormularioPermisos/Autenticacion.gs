/**
 * MÓDULO DE AUTENTICACIÓN Y AUTORIZACIÓN
 * VERSIÓN MODIFICADA: Acceso liberado sin restricciones
 * 
 * CAMBIOS REALIZADOS:
 * - Todas las funciones retornan valores que permiten acceso libre
 * - Eliminada la verificación contra lista de correos autorizados
 * - Deshabilitado el sistema de permisos temporalmente
 * 
 * MOTIVO DE LA MODIFICACIÓN:
 * Resolver conflictos cuando los usuarios ingresan sin cuenta de correo logueada
 * o cuando hay problemas con la autenticación de Google Apps Script
 */

var Autenticacion = (function() {
  
  /**
   * Verifica permisos de acceso - SIEMPRE PERMITE ACCESO
   * VERSIÓN MODIFICADA: Retorna siempre true sin verificar credenciales
   * @returns {boolean} Siempre retorna true (acceso permitido)
   * 
   * FUNCIÓN ORIGINAL: Verificaba contra lista de correos autorizados
   * FUNCIÓN ACTUAL: Permite acceso a todos los usuarios
   */
  function verificarPermisos() {
    // 🔓 ACCESO LIBERADO - SIN VERIFICACIÓN DE AUTENTICACIÓN
    Logger.log('🔓 Acceso permitido sin autenticación');
    return true; // SIEMPRE retorna true - acceso permitido
  }
  
  /**
   * Obtiene identificador del usuario actual
   * VERSIÓN MODIFICADA: Retorna usuario genérico
   * @returns {string} Identificador genérico 'usuario-sistema'
   * 
   * FUNCIÓN ORIGINAL: Retornaba el email del usuario autenticado
   * FUNCIÓN ACTUAL: Retorna valor genérico para evitar errores
   */
  function obtenerUsuarioActual() {
    return 'usuario-sistema'; // Usuario genérico predefinido
  }
  
  /**
   * Verifica si un correo específico está autorizado
   * VERSIÓN MODIFICADA: Siempre retorna true
   * @param {string} correo - Correo a verificar (no se usa)
   * @returns {boolean} Siempre retorna true
   * 
   * FUNCIÓN ORIGINAL: Verificaba si el correo estaba en lista autorizada
   * FUNCIÓN ACTUAL: Retorna true para cualquier correo
   */
  function esUsuarioAutorizado(correo) {
    return true; // TODOS los correos están autorizados
  }
  
  /**
   * Obtiene lista de correos autorizados
   * VERSIÓN MODIFICADA: Retorna mensaje informativo
   * @returns {Array} Lista con mensaje informativo
   * 
   * FUNCIÓN ORIGINAL: Retornaba lista real de correos autorizados
   * FUNCIÓN ACTUAL: Retorna mensaje indicando acceso libre
   */
  function obtenerCorreosAutorizados() {
    return ['Todos los usuarios autorizados']; // Mensaje informativo
  }
  
  // EXPORTAR FUNCIONALIDADES PÚBLICAS
  return {
    verificarPermisos: verificarPermisos,
    obtenerUsuarioActual: obtenerUsuarioActual,
    esUsuarioAutorizado: esUsuarioAutorizado,
    obtenerCorreosAutorizados: obtenerCorreosAutorizados
  };
  
})();