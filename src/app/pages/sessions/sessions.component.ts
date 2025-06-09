import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from 'src/app/models/session.model';
import { SessionService } from 'src/app/services/session.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {
  title = 'Gestión de Sesiones';
  // Headers actualizados para mostrar nombres legibles
  headers = ['ID', 'Token', 'Expiración', 'Código', 'Estado'];
  sessions: Session[] = [];
  displayData: any[] = [];
  isLoading = false;

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    this.isLoading = true;
    this.sessionService.list().subscribe({
      next: (sessions) => {
        console.log('Sesiones recibidas:', sessions);
        this.sessions = sessions;
        this.processSessionsForDisplay(sessions);
      },
      error: (error) => {
        console.error('Error al cargar sesiones:', error);
        Swal.fire('Error', 'Error al cargar la lista de sesiones', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  processSessionsForDisplay(sessions: any[]) {
    this.displayData = sessions.map(session => {
      // Formatear la fecha de expiración para mostrarla mejor
      let formattedExpiration = session.expiration;
      try {
        const date = new Date(session.expiration);
        formattedExpiration = date.toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        formattedExpiration = session.expiration;
      }

      return {
        id: session.id,
        token: session.token,
        expiration: formattedExpiration,
        FACode: session.FACode,
        state: session.state,
        acciones: '',
        _originalSession: session
      };
    });
    console.log('Datos procesados:', this.displayData);
  }

  onRowClick(event: any) {
    const originalSession = event.row._originalSession;
    console.log('Sesión seleccionada:', originalSession);
    
    let expirationFormatted = originalSession.expiration;
    try {
      expirationFormatted = new Date(originalSession.expiration).toLocaleString();
    } catch (e) { }

    Swal.fire({
      title: `Detalles de la Sesión`,
      html: `
        <div class="text-left">
          <p><strong>ID:</strong> ${originalSession.id ?? ''}</p>
          <p><strong>Token:</strong> ${originalSession.token}</p>
          <p><strong>Expiración:</strong> ${expirationFormatted}</p>
          <p><strong>FACode:</strong> ${originalSession.FACode}</p>
          <p><strong>Estado:</strong> ${originalSession.state}</p>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: '<i class="fas fa-edit"></i> Editar',
      denyButtonText: '<i class="fas fa-trash"></i> Eliminar',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#28a745',
      denyButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.editSession(originalSession);
      } else if (result.isDenied) {
        this.deleteSession(originalSession);
      }
    });
  }

  editSession(session: Session) {
    let expirationISO = '';
    try {
      expirationISO = new Date(session.expiration).toISOString().slice(0, 16);
    } catch (e) {
      expirationISO = '';
    }

    Swal.fire({
      title: 'Editar Sesión',
      html: `
        <div class="mb-3">
          <label for="editToken" class="form-label">Token:</label>
          <input id="editToken" class="swal2-input" value="${session.token}" required>
        </div>
        <div class="mb-3">
          <label for="editExpiration" class="form-label">Fecha de Expiración:</label>
          <input id="editExpiration" class="swal2-input" type="datetime-local" value="${expirationISO}" required>
        </div>
        <div class="mb-3">
          <label for="editFACode" class="form-label">FACode:</label>
          <input id="editFACode" class="swal2-input" value="${session.FACode}" required>
        </div>
        <div class="mb-3">
          <label for="editState" class="form-label">Estado:</label>
          <select id="editState" class="swal2-input" required>
            <option value="active" ${session.state === 'active' ? 'selected' : ''}>Activa</option>
            <option value="expired" ${session.state === 'expired' ? 'selected' : ''}>Expirada</option>
            <option value="revoked" ${session.state === 'revoked' ? 'selected' : ''}>Revocada</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const token = (document.getElementById('editToken') as HTMLInputElement).value;
        const expirationInput = (document.getElementById('editExpiration') as HTMLInputElement).value;
        const FACode = (document.getElementById('editFACode') as HTMLInputElement).value;
        const state = (document.getElementById('editState') as HTMLSelectElement).value;
        
        let expiration = '';
        if (expirationInput) {
          expiration = expirationInput.replace('T', ' ') + ':00';
        }

        if (!token || !expiration || !FACode || !state) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        return { token, expiration, FACode, state };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { token, expiration, FACode, state } = result.value;
        const updatedSession: Session = {
          ...session,
          token,
          expiration,
          FACode,
          state
        };
        
        this.sessionService.update(updatedSession).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Sesión actualizada correctamente', 'success');
            this.loadSessions();
          },
          error: (error) => {
            console.error('Error al actualizar sesión:', error);
            Swal.fire('Error', 'Error al actualizar la sesión', 'error');
          }
        });
      }
    });
  }

  deleteSession(session: Session) {
    Swal.fire({
      title: '¿Eliminar sesión?',
      text: `¿Estás seguro de eliminar esta sesión? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed && session.id) {
        this.sessionService.delete(session.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Sesión eliminada correctamente', 'success');
            this.loadSessions();
          },
          error: (error) => {
            console.error('Error al eliminar sesión:', error);
            Swal.fire('Error', 'Error al eliminar la sesión', 'error');
          }
        });
      }
    });
  }
}