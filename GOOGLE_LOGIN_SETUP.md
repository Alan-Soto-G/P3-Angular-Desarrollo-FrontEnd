# Configuración de Google Login

## Estado Actual
- ✅ Sistema de autenticación base funcionando
- ✅ Modo demo de Google funcionando  
- ⚠️ Google real requiere configuración

## Para Activar Google Login Real

### 1. Crear Proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre sugerido: "Front Con Seguridad"

### 2. Habilitar APIs
1. Ve a **"APIs & Services"** > **"Library"**
2. Busca y habilita **"Google+ API"** 
3. O busca **"Google Identity Services API"**

### 3. Crear Credenciales OAuth
1. Ve a **"APIs & Services"** > **"Credentials"**
2. Haz clic en **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
3. Si es la primera vez, configura la pantalla de consentimiento:
   - Tipo: External
   - Nombre de la app: "Front Con Seguridad"
   - Email de soporte: tu email
   - Dominios autorizados: `localhost`

### 4. Configurar OAuth Client
- **Application type**: Web application
- **Name**: Front Con Seguridad Login
- **Authorized JavaScript origins**: 
  ```
  http://localhost:4200
  ```
- **Authorized redirect URIs**: 
  ```
  http://localhost:4200
  ```

### 5. Copiar Client ID
1. Después de crear, copia el **Client ID** 
2. Debería verse como: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

### 6. Actualizar Configuración
Edita el archivo `src/app/config/google.config.ts`:

```typescript
export const googleConfig = {
  clientId: 'TU_CLIENT_ID_REAL_AQUI', // Pega aquí tu Client ID
};
```

### 7. Probar
1. Reinicia el servidor de desarrollo: `ng serve`
2. Ve a la página de login
3. Deberías ver el botón oficial de Google
4. Al hacer clic, se abrirá el popup de Google real

## Modo Demo vs Real

### Modo Demo (Actual)
- ✅ Funciona inmediatamente
- ✅ No requiere configuración
- ✅ Perfecto para desarrollo
- ❌ No autentica usuarios reales

### Modo Real (Después de configurar)
- ✅ Autentica usuarios reales de Google
- ✅ Datos reales del perfil
- ✅ Token JWT válido
- ❌ Requiere configuración inicial

## Problemas Comunes

### Error 401: invalid_client
- **Causa**: Client ID no configurado o incorrecto
- **Solución**: Verificar que el Client ID esté bien copiado

### Error CORS
- **Causa**: Dominio no autorizado  
- **Solución**: Agregar `http://localhost:4200` a JavaScript origins

### Botón no aparece
- **Causa**: Script de Google no carga
- **Solución**: Verificar conexión a internet y scripts en index.html

## Contacto
Si tienes problemas, revisa la consola del navegador para más detalles del error.
