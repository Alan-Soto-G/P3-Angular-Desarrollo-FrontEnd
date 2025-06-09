import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { SecurityService } from 'src/app/services/security.service';
import Swal from 'sweetalert2';

declare const gapi: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  user: User;
  
  constructor(
    private securityService: SecurityService,
    private router: Router
  ) {
    this.user = { email: "", password: "" };
  }

  ngOnInit() {
    // Cargar Google API de forma segura
    this.loadGoogleAPI();
  }

  loadGoogleAPI() {
    if (typeof gapi !== 'undefined') {
      gapi.load('auth2', () => {
        gapi.auth2.init({
          client_id: '106455160900-23kn686ptrfqhpf97e5n9upqbqoegfrk.apps.googleusercontent.com'
        });
      });
    } else {
      // Esperar a que GAPI se cargue
      setTimeout(() => {
        this.loadGoogleAPI();
      }, 100);
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

  // Login con Google - Con verificación de GAPI
  signInWithGoogle(): void {
    if (typeof gapi === 'undefined') {
      Swal.fire("Error", "Google API no está cargada", "error");
      return;
    }

    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
      Swal.fire("Error", "Google Auth no está inicializado", "error");
      return;
    }

    authInstance.signIn().then((googleUser: any) => {
      const profile = googleUser.getBasicProfile();
      const idToken = googleUser.getAuthResponse().id_token;
      
      const userData = {
        user: {
          id: profile.getId(),
          name: profile.getName(),
          email: profile.getEmail(),
          photo: profile.getImageUrl()
        },
        token: idToken
      };
      
      this.securityService.saveSession(userData);
      this.router.navigate(["dashboard"]);
      
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Hola ${profile.getName()}`,
        timer: 2000,
        showConfirmButton: false
      });
    }).catch((error: any) => {
      console.error('Error en Google login:', error);
      Swal.fire("Error", "Error en autenticación con Google", "error");
    });
  }

  // GitHub placeholder
  signInWithGitHub(): void {
    Swal.fire({
      icon: 'info',
      title: 'GitHub Login',
      text: 'GitHub login will be implemented soon!',
      timer: 2000,
      showConfirmButton: false
    });
  }

  ngOnDestroy() {
  }
}
