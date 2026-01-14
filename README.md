# Sistema de Gestión de Solicitudes - Constructora Centenario

## 📋 Descripción del Proyecto

Sistema web automatizado para la gestión de solicitudes de permisos, incapacidades y licencias desarrollado en Google Apps Script. Permite a los empleados enviar solicitudes y a los jefes aprobarlas/denegarlas mediante un flujo completamente digital.

## 🚀 Características Principales

- ✅ **Formularios dinámicos** según tipo de solicitud
- 📧 **Notificaciones automáticas** por correo electrónico
- 📄 **Generación automática de PDF**
- 💾 **Almacenamiento en Google Sheets**
- 🔄 **Flujo de aprobación/denegación** con un click
- 📱 **Diseño responsive** para todos los dispositivos
- 🔓 **Acceso sin autenticación** (configurable)

## 🛠️ Tecnologías Utilizadas

- **Google Apps Script** - Backend y lógica de negocio
- **HTML5/CSS3/JavaScript** - Frontend y interfaz de usuario
- **Google Sheets** - Base de datos
- **Google Drive** - Almacenamiento de archivos
- **Gmail** - Envío de notificaciones
- **Google Docs** - Generación de PDFs

## 📁 Estructura del Proyecto

```
SistemaSolicitudes/
├── Code.gs                          # Punto de entrada principal
├── index.html                       # Interfaz de usuario principal
├── styles.html                      # Estilos CSS
├── BaseDatos.gs                     # Gestión de Google Sheets
├── ProcesamientoFormulario.gs       # Procesamiento de formularios
├── Validacion.gs                    # Utilidades de validación
├── Email.gs                         # Generación de emails
├── GeneradorPDF.gs                  # Generación de documentos PDF
├── AccionesJefe.gs                  # Manejo de aprobaciones/denegaciones
├── Autenticacion.gs                 # Gestión de permisos
└── PaginaEnvioAdicional.html        # Interfaz para envíos adicionales
```

## ⚙️ Configuración e Instalación

### Paso 1: Crear Proyecto Google Apps Script

1. Ve a [Google Apps Script](https://script.google.com)
2. Crea un nuevo proyecto
3. Nombra el proyecto "Sistema de Solicitudes"

### Paso 2: Configurar Archivos

1. **Crea los archivos .gs** (Code.gs, BaseDatos.gs, etc.)
2. **Crea los archivos .html** (index.html, styles.html, etc.)
3. **Copia el código** de cada archivo según la estructura

### Paso 3: Configurar Google Sheets

1. **Crea una nueva Google Sheets**
2. **Obtén el ID** de la spreadsheet de la URL:
   ```
   https://docs.google.com/spreadsheets/d/ID_DE_TU_SPREADSHEET/edit
   ```
3. **En BaseDatos.gs**, línea 59, reemplaza el SPREADSHEET_ID:
   ```javascript
   var SPREADSHEET_ID = 'TU_ID_DE_SPREADSHEET_AQUI';
   ```

### Paso 4: Configurar Usuarios

1. **En BaseDatos.gs**, función `inicializarHojas()`, modifica los datos de ejemplo:
   ```javascript
   usuariosSheet.getRange(2, 1, 4, 6).setValues([
     ['1001315070', 'Ana María Rodríguez', 'ana@empresa.com', 'Analista', 'Carlos Fuentes', 'carlos@empresa.com'],
     // Agrega más usuarios según necesidad
   ]);
   ```

### Paso 5: Configurar Correos de Gestión

1. **En AccionesJefe.gs**, función `aprobarSolicitud()`, línea ~50:
   ```javascript
   var correosGestion = 'tucorreo@empresa.com, otrocorreo@empresa.com';
   ```

### Paso 6: Desplegar como Web App

1. **Ve a "Deploy"** → "New deployment"
2. **Selecciona tipo**: "Web app"
3. **Configuración de ejecución**: "Me"
4. **Quién tiene acceso**: "Cualquier persona"
5. **Haz click en "Deploy"**
6. **Copia la URL** de la web app generada

## 📁 Guardado de archivos

Los archivos se guardan automaticamente en una carpeta de drive con propiedad de fabio.caro@constructoracentenario.com o del administrador del servidor.

# Carpeta de Solicitudes: https://drive.google.com/drive/folders/1OSbIXHFema1VYusyTctCCpwoRTpgm_8T?usp=drive_link

# Carpeta de archivos adjuntos: https://drive.google.com/drive/folders/15NmBvO7JlbrQqdUEl0YIM1XTLzW1dAAB?usp=drive_link

## 🎯 Manual de Uso

### Para Empleados (Solicitantes)

#### Paso 1: Acceder al Sistema
1. Abre la URL de la web app
2. Verás el formulario de validación por cédula

#### Paso 2: Validar Cédula
1. Ingresa tu número de cédula
2. Haz click en "Buscar"
3. El sistema cargará tus datos automáticamente

#### Paso 3: Completar Solicitud
1. **Selecciona el tipo de solicitud:**
   - Permisos
   - Incapacidades  
   - Licencias
   - Compensación

2. **Completa los campos específicos** según el tipo:
   - **Permisos**: Fecha, horario, tipo de permiso
   - **Incapacidades**: Fechas de inicio y fin
   - **Licencias**: Tipo de licencia
   - **Compensación**: Motivo de compensación

3. **Describe el motivo** detalladamente

4. **Adjunta documento de soporte** (requerido)

5. **Haz click en "Enviar Solicitud"**

#### Paso 4: Confirmación
- Recibirás un mensaje de éxito
- Tu jefe recibirá un correo para revisión

### Para Jefes (Aprobadores)

#### Flujo de Aprobación

1. **Recibirás un correo** con:
   - Detalles de la solicitud
   - Botones "Aprobar" y "Denegar"

2. **Para Aprobar:**
   - Haz click en "✅ Aprobar Solicitud"
   - Se enviará automáticamente a gestión
   - Opcional: Enviar copias a otros correos

3. **Para Denegar:**
   - Haz click en "❌ Denegar Solicitud"
   - Ingresa el motivo de denegación
   - Confirma la acción
   - El solicitante será notificado

## 🔧 Configuración Avanzada

### Modificar Tipos de Solicitud

**En index.html**, busca la sección de tipos de solicitud:
```html
<select id="tipoSolicitud" name="tipoSolicitud" required>
    <option value="">Seleccione una opción</option>
    <option value="permisos">Permisos</option>
    <option value="incapacidades">Incapacidades</option>
    <option value="licencias">Licencias</option>
    <!-- Agregar nuevos tipos aquí -->
</select>
```

### Agregar Nuevos Tipos de Permisos

**En index.html**, en el event listener de `tipoSolicitud`:
```javascript
else if (tipo === 'permisos') {
    opcionesContainer.innerHTML = `
        <!-- Agregar nuevas opciones al select -->
        <option value="nuevo_permiso">Nuevo Tipo de Permiso</option>
    `;
}
```

### Personalizar Documentos Requeridos

**En index.html**, función `updateHelpContent()`:
```javascript
else if (tipoSolicitud === 'nuevo_tipo') {
    content = `
        <h4>Nuevo Tipo de Solicitud</h4>
        <p><strong>Documentos requeridos:</strong></p>
        <ul>
            <li>Documento 1</li>
            <li>Documento 2</li>
        </ul>
    `;
}
```

## 🐛 Solución de Problemas Comunes

### Error: "No se encontró la hoja Usuarios"
**Solución:** Ejecuta la función `configurarSistema()` desde el editor de Apps Script

### Error: "Permiso denegado"
**Solución:** Verifica que la web app esté configurada con acceso "Cualquier persona"

### Error: "Permisos de drive"
**Solución:** Verificar los permisos del archivo App script desde Drive

### Error al enviar correos
**Solución:** Verifica las cuotas diarias de Gmail y los límites de Apps Script

### Archivos no se adjuntan
**Solución:** Verifica los permisos de Google Drive y los tipos de archivo permitidos

## 📊 Monitoreo y Mantenimiento

### Funciones de Diagnóstico

```javascript
// Verificar estado del sistema
diagnosticarBaseDatos();

// Diagnóstico y reparación automática
diagnosticarYCorregir();

// Probar conectividad
probarConexionSimple();
```

### Logs y Auditoría
- Revisa los logs en **Ver → Logs** en Apps Script
- Monitorea el uso en **Ejecuciones** del dashboard

## 🔒 Seguridad y Permisos

### Configuración Actual
- **Autenticación**: Deshabilitada (acceso libre)
- **Permisos**: Solo los jefes directos pueden aprobar/denegar
- **Almacenamiento**: Google Sheets con acceso restringido

### Para Habilitar Autenticación (Opcional)

**En Autenticacion.gs**, modifica `verificarPermisos()`:
```javascript
function verificarPermisos() {
    try {
        var userEmail = Session.getActiveUser().getEmail();
        // Verificar contra lista de correos autorizados
        return CORREOS_AUTORIZADOS.includes(userEmail.toLowerCase());
    } catch (error) {
        return false;
    }
}
```
