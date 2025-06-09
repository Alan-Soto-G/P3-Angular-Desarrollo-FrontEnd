export const googleConfig = {
  clientId: '106455160900-23kn686ptrfqhpf97e5n9upqbqoegfrk.apps.googleusercontent.com', // Tu Client ID real de Google
  // Para volver al modo demo, cambia a 'DEMO_MODE'
};

// Instrucciones para obtener el Client ID real:
// 1. Ve a https://console.cloud.google.com/
// 2. Crea un proyecto o selecciona uno existente
// 3. Habilita la Google+ API o Google Identity API
// 4. Ve a "APIs & Services" > "Credentials"
// 5. Crear "OAuth 2.0 Client IDs"
// 6. Tipo: Web application
// 7. Authorized JavaScript origins: http://localhost:4200
// 8. Authorized redirect URIs: http://localhost:4200
// 9. Copia el Client ID aquí

export const isGoogleConfigured = () => {
  return googleConfig.clientId !== 'DEMO_MODE' && 
         googleConfig.clientId !== 'TU_GOOGLE_CLIENT_ID_AQUI' &&
         googleConfig.clientId.includes('.apps.googleusercontent.com') &&
         googleConfig.clientId.length > 20;
};
