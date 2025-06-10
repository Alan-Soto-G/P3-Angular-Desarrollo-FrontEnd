import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { SecurityService } from 'src/app/services/security.service';
import { googleConfig, isGoogleConfigured } from 'src/app/config/google.config';
import Swal from 'sweetalert2';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  user: User;
  private googleClientId = googleConfig.clientId;
  public isGoogleConfigured = isGoogleConfigured();
  public debugInfo = {
    googleLoaded: false,
    googleInitialized: false,
    buttonRendered: false
  };
  
  constructor(
    private securityService: SecurityService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.user = { email: "", password: "" };
  }

  ngOnInit() {
    console.log('🔧 Login component inicializado');
    console.log('🔧 Google configurado:', this.isGoogleConfigured);
    console.log('🔧 Client ID:', this.googleClientId);
    
    if (this.isGoogleConfigured) {
      // Esperar un poco para que los scripts se carguen
      setTimeout(() => {
        this.initializeGoogleSignIn();
      }, 1000);
    } else {
      console.log('⚠️ Google no está configurado');
    }
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }

  private initializeGoogleSignIn() {
    console.log('🔧 Inicializando Google Sign In...');
    console.log('🔧 Google object disponible:', typeof google !== 'undefined');
    
    this.debugInfo.googleLoaded = typeof google !== 'undefined';
    
    if (typeof google !== 'undefined' && this.isGoogleConfigured) {
      try {
        console.log('🔧 Inicializando Google Identity...');
        
        google.accounts.id.initialize({
          client_id: this.googleClientId,
          callback: (response: any) => this.handleGoogleCallback(response),
          auto_select: false,
          cancel_on_tap_outside: false
        });

        this.debugInfo.googleInitialized = true;
        console.log('✅ Google Identity inicializado');

        // Renderizar el botón de Google solo si está configurado
        const buttonElement = document.getElementById('google-signin-button');
        if (buttonElement) {
          console.log('🔧 Renderizando botón de Google...');
          google.accounts.id.renderButton(buttonElement, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular'
          });
          this.debugInfo.buttonRendered = true;
          console.log('✅ Botón de Google renderizado');
        } else {
          console.error('❌ No se encontró el elemento google-signin-button');
        }
      } catch (error) {
        console.error('❌ Error inicializando Google:', error);
        this.showGoogleError('Error inicializando Google Sign-In: ' + error);
      }
    } else {
      console.log('⚠️ Google Identity Services no está disponible o no configurado');
      if (typeof google === 'undefined') {
        console.log('❌ El objeto google no está definido - script no cargado');
      }
    }
  }

  // Método de debug para mostrar información
  showDebugInfo(): void {
    const info = {
      googleConfigured: this.isGoogleConfigured,
      clientId: this.googleClientId,
      googleLoaded: this.debugInfo.googleLoaded,
      googleInitialized: this.debugInfo.googleInitialized,
      buttonRendered: this.debugInfo.buttonRendered,
      googleObject: typeof google !== 'undefined' ? 'Disponible' : 'No disponible'
    };
    
    console.table(info);
    
    Swal.fire({
      title: 'Debug Info - Google Login',
      html: `
        <div style="text-align: left;">
          <p><strong>Google Configurado:</strong> ${info.googleConfigured}</p>
          <p><strong>Client ID:</strong> ${info.clientId}</p>
          <p><strong>Google Cargado:</strong> ${info.googleLoaded}</p>
          <p><strong>Google Inicializado:</strong> ${info.googleInitialized}</p>
          <p><strong>Botón Renderizado:</strong> ${info.buttonRendered}</p>
          <p><strong>Objeto Google:</strong> ${info.googleObject}</p>
        </div>
      `,
      icon: 'info'
    });
  }
  private handleGoogleCallback(response: any) {
    console.log('🔧 Google callback recibido:', response);
    
    this.ngZone.run(() => {
      try {
        // Decodificar el JWT token
        const payload = this.decodeJwtResponse(response.credential);
        console.log('🔧 Token decodificado:', payload);
        
        if (payload) {
          const userData = {
            user: {
              id: payload.sub,
              name: payload.name,
              email: payload.email,
              picture: payload.picture || null
            },
            token: response.credential
          };
          
          console.log('✅ Google login exitoso:', userData);
          this.securityService.saveSession(userData);
          
          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Hola ${payload.name}`,
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/dashboard']);
          });
        } else {
          console.error('❌ No se pudo decodificar el token de Google');
          this.showGoogleError('No se pudo procesar la respuesta de Google');
        }
      } catch (error) {
        console.error('❌ Error procesando respuesta de Google:', error);
        this.showGoogleError('Error al procesar la respuesta de Google: ' + error);
      }
    });
  }

  private decodeJwtResponse(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      return null;
    }
  }

  // Login tradicional
  login() {
    this.securityService.login(this.user).subscribe({
      next: (data) => {
        this.securityService.saveSession(data);
        this.router.navigate(["dashboard"]);
      },
      error: (error) => {
        Swal.fire("Autenticación Inválida", "Usuario o contraseña inválido", "error");
      }
    });
  }

  // Login con Google - Solo funcionalidad real
  signInWithGoogle(): void {
    console.log('🔧 Click en Google login');
    console.log('🔧 Google configurado:', this.isGoogleConfigured);
    console.log('🔧 Google object:', typeof google !== 'undefined');
    
    if (this.isGoogleConfigured && typeof google !== 'undefined') {
      try {
        console.log('🔧 Llamando a google.accounts.id.prompt()');
        // Usar Google real si está configurado
        google.accounts.id.prompt((notification: any) => {
          console.log('🔧 Google prompt notification:', notification);
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('⚠️ Google prompt no se mostró');
            Swal.fire({
              title: 'Google Sign-In',
              text: 'No se pudo mostrar el popup de Google. Por favor, intente nuevamente.',
              icon: 'warning'
            });
          }
        });
      } catch (error) {
        console.error('❌ Error con Google prompt:', error);
        this.showGoogleError('Error al mostrar Google login: ' + error);
      }
    } else {
      Swal.fire({
        title: 'Google Sign-In no disponible',
        text: 'Google Sign-In no está configurado correctamente. Contacte al administrador.',
        icon: 'error'
      });
    }
  }

  // Método para mostrar errores de Google
  private showGoogleError(message: string): void {
    console.error('❌ Google Error:', message);
    Swal.fire({
      title: 'Error de Google Login',
      text: message,
      icon: 'error'
    });
  }
}
