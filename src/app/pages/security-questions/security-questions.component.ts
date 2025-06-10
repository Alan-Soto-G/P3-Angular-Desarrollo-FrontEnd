import { Component, OnInit } from '@angular/core';
import { SecurityQuestion, SecurityQuestionDisplay } from 'src/app/models/security-question.model';
import { SecurityQuestionService } from 'src/app/services/security-question.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-security-questions',
  templateUrl: './security-questions.component.html',
  styleUrls: ['./security-questions.component.scss']
})
export class SecurityQuestionsComponent implements OnInit {
  // Configuración de la tabla CRUD
  title = 'Gestión de Preguntas de Seguridad';
  headers = ['ID', 'Nombre', 'Descripción'];
  securityQuestions: SecurityQuestion[] = [];
  displayData: SecurityQuestionDisplay[] = [];
  isLoading = false;

  // Estadísticas para las tarjetas superiores
  statistics = [
    {
      title: 'Total Preguntas',
      value: '0',
      color: 'primary',
      icon: 'fas fa-question-circle'
    },
    {
      title: 'Activas',
      value: '0',
      color: 'success',
      icon: 'fas fa-check-circle'
    }
  ];

  constructor(
    private securityQuestionService: SecurityQuestionService
  ) { }

  ngOnInit(): void {
    this.loadSecurityQuestions();
  }

  // Cargar lista de preguntas de seguridad
  loadSecurityQuestions() {
    this.isLoading = true;
    this.securityQuestionService.list().subscribe({
      next: (questions) => {
        this.securityQuestions = questions;
        this.mapDataForDisplay();
        this.updateStatistics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando preguntas de seguridad:', error);
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar las preguntas de seguridad', 'error');
      }
    });
  }

  // Mapear datos para mostrar en la tabla
  mapDataForDisplay() {
    this.displayData = this.securityQuestions.map(question => ({
      id: question.id,
      nombre: question.name,
      descripcion: question.description,
      _originalData: question // Guardamos el objeto original para usarlo en eventos
    }));
  }

  // Actualizar estadísticas
  updateStatistics() {
    this.statistics[0].value = this.securityQuestions.length.toString();
    this.statistics[1].value = this.securityQuestions.length.toString(); // Todas están activas por defecto
  }

  // Manejar click en fila - mostrar modal con información completa
  onRowClick(event: any) {
    const originalQuestion: SecurityQuestion = event.row._originalData;
    
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    Swal.fire({
      title: 'Información de la Pregunta de Seguridad',
      html: `
        <div class="text-left">
          <p><strong>ID:</strong> ${originalQuestion.id}</p>
          <p><strong>Nombre:</strong> ${originalQuestion.name}</p>
          <p><strong>Descripción:</strong> ${originalQuestion.description}</p>
          <p><strong>Fecha de Creación:</strong> ${originalQuestion.created_at ? formatDate(originalQuestion.created_at) : 'N/A'}</p>
          <p><strong>Última Actualización:</strong> ${originalQuestion.updated_at ? formatDate(originalQuestion.updated_at) : 'N/A'}</p>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Editar',
      denyButtonText: 'Eliminar',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#3085d6',
      denyButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.editSecurityQuestion(originalQuestion);
      } else if (result.isDenied) {
        this.deleteSecurityQuestion(originalQuestion);
      }
    });
  }

  // Función para crear nueva pregunta de seguridad
  onAddSecurityQuestion() {
    Swal.fire({
      title: 'Nueva Pregunta de Seguridad',
      html: `
        <div class="form-group">
          <label for="questionName">Nombre de la Pregunta:</label>
          <input type="text" id="questionName" class="swal2-input" placeholder="¿Cuál fue el nombre de tu primera mascota?">
        </div>
        <div class="form-group">
          <label for="questionDescription">Descripción:</label>
          <textarea id="questionDescription" class="swal2-textarea" placeholder="Ingresa el nombre de tu primera mascota"></textarea>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById('questionName') as HTMLInputElement).value;
        const description = (document.getElementById('questionDescription') as HTMLTextAreaElement).value;
        
        if (!name || !description) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return null;
        }
        
        return { name, description };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.createSecurityQuestion(result.value);
      }
    });
  }

  // Crear pregunta de seguridad
  createSecurityQuestion(questionData: { name: string, description: string }) {
    this.securityQuestionService.create(questionData).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Pregunta de seguridad creada correctamente', 'success');
        this.loadSecurityQuestions();
      },
      error: (error) => {
        console.error('Error creando pregunta de seguridad:', error);
        Swal.fire('Error', 'No se pudo crear la pregunta de seguridad', 'error');
      }
    });
  }

  // Editar pregunta de seguridad
  editSecurityQuestion(question: SecurityQuestion) {
    Swal.fire({
      title: 'Editar Pregunta de Seguridad',
      html: `
        <div class="form-group">
          <label for="editQuestionName">Nombre de la Pregunta:</label>
          <input type="text" id="editQuestionName" class="swal2-input" value="${question.name}">
        </div>
        <div class="form-group">
          <label for="editQuestionDescription">Descripción:</label>
          <textarea id="editQuestionDescription" class="swal2-textarea">${question.description}</textarea>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById('editQuestionName') as HTMLInputElement).value;
        const description = (document.getElementById('editQuestionDescription') as HTMLTextAreaElement).value;
        
        if (!name || !description) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return null;
        }
        
        return { name, description };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.updateSecurityQuestion(question.id!, result.value);
      }
    });
  }

  // Actualizar pregunta de seguridad
  updateSecurityQuestion(id: number, questionData: { name: string, description: string }) {
    this.securityQuestionService.update(id, questionData).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Pregunta de seguridad actualizada correctamente', 'success');
        this.loadSecurityQuestions();
      },
      error: (error) => {
        console.error('Error actualizando pregunta de seguridad:', error);
        Swal.fire('Error', 'No se pudo actualizar la pregunta de seguridad', 'error');
      }
    });
  }

  // Eliminar pregunta de seguridad
  deleteSecurityQuestion(question: SecurityQuestion) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la pregunta "${question.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.securityQuestionService.delete(question.id!).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La pregunta de seguridad ha sido eliminada', 'success');
            this.loadSecurityQuestions();
          },
          error: (error) => {
            console.error('Error eliminando pregunta de seguridad:', error);
            Swal.fire('Error', 'No se pudo eliminar la pregunta de seguridad', 'error');
          }
        });
      }
    });
  }
}
