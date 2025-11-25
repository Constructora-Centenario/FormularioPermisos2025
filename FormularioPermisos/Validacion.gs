/**
 * MÓDULO DE VALIDACIONES
 * Contiene funciones de validación reutilizables en todo el sistema
 * Enfocado en validación de formatos y datos de entrada
 */

var Validacion = (function() {
  
  /**
   * Valida el formato de un correo electrónico
   * @param {string} correo - Correo electrónico a validar
   * @returns {boolean} True si el correo es válido, False si no
   */
  function validarCorreo(correo) {
    // Verificar que el correo no esté vacío o sea nulo
    if (!correo || correo.trim() === '') return false;
    
    // Expresión regular para validar formato básico de email
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Aplicar la expresión regular al correo (eliminando espacios)
    return emailRegex.test(correo.trim());
  }
  
  // EXPORTAR FUNCIONALIDADES PÚBLICAS
  return {
    validarCorreo: validarCorreo
  };
  
})();