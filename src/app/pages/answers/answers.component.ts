import { Component, OnInit } from '@angular/core';
import { Answer, AnswerDisplay } from 'src/app/models/answer.model';
import { SecurityQuestion } from 'src/app/models/security-question.model';
import { User } from 'src/app/models/user.model';
import { AnswerService } from 'src/app/services/answer.service';
import { SecurityQuestionService } from 'src/app/services/security-question.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.scss']
})
export class AnswersComponent implements OnInit {

  // Configuración de la tabla CRUD
  title = 'Gestión de Respuestas de Seguridad';
  headers = ['ID', 'Usuario', 'Pregunta', 'Contenido', 'Fecha Creación'];
  answers: Answer[] = [];
  displayData: AnswerDisplay[] = [];
  isLoading = false;

  // Datos para los dropdowns
  users: User[] = [];
  securityQuestions: SecurityQuestion[] = [];

  // Estadísticas para las tarjetas superiores
  statistics = [
    {
      title: 'Total Respuestas',
      value: '0',
      color: 'primary',
      icon: 'fas fa-reply'
    },
    {
      title: 'Usuarios con Respuestas',
      value: '0',
      color: 'success',
      icon: 'fas fa-user-check'
    },
    {
      title: 'Preguntas Respondidas',
      value: '0',
      color: 'info',
      icon: 'fas fa-question-circle'
    },
    {
      title: 'Este Mes',
      value: '0',
      color: 'warning',
      icon: 'fas fa-calendar-alt'
    }
  ];

  constructor(
    private answerService: AnswerService,
    private securityQuestionService: SecurityQuestionService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadSecurityQuestions();
    this.loadAnswers();
  }

  // Cargar usuarios para el dropdown
  loadUsers() {
    this.userService.list().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Usuarios cargados:', users);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  // Cargar preguntas de seguridad para el dropdown
  loadSecurityQuestions() {
    this.securityQuestionService.list().subscribe({
      next: (questions) => {
        this.securityQuestions = questions;
        console.log('Preguntas de seguridad cargadas:', questions);
      },
      error: (error) => {
        console.error('Error al cargar preguntas de seguridad:', error);
      }
    });
  }

  // Cargar lista de respuestas
  loadAnswers() {
    this.isLoading = true;
    this.answerService.list().subscribe({
      next: (answers) => {
        this.answers = answers;
        this.mapDataForDisplay();
        this.updateStatistics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando respuestas:', error);
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar las respuestas', 'error');
      }
    });
  }

  // Mapear datos para mostrar en la tabla
  mapDataForDisplay() {
    this.displayData = this.answers.map(answer => ({
      id: answer.id!,
      usuario: this.getUserName(answer.user_id),
      pregunta: this.getQuestionName(answer.security_question_id),
      content: answer.content,
      fecha_creacion: this.formatDate(answer.created_at),
      _originalData: answer
    }));
  }

  // Obtener nombre del usuario por ID
  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : `Usuario ID: ${userId}`;
  }

  // Obtener nombre de la pregunta por ID
  getQuestionName(questionId: number): string {
    const question = this.securityQuestions.find(q => q.id === questionId);
    return question ? question.name : `Pregunta ID: ${questionId}`;
  }

  // Formatear fecha
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Actualizar estadísticas
  updateStatistics() {
    const totalAnswers = this.answers.length;
    const uniqueUsers = new Set(this.answers.map(a => a.user_id)).size;
    const uniqueQuestions = new Set(this.answers.map(a => a.security_question_id)).size;
    const thisMonth = this.answers.filter(a => {
      if (!a.created_at) return false;
      const createdDate = new Date(a.created_at);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    }).length;

    this.statistics[0].value = totalAnswers.toString();
    this.statistics[1].value = uniqueUsers.toString();
    this.statistics[2].value = uniqueQuestions.toString();
    this.statistics[3].value = thisMonth.toString();
  }

  // Manejar click en fila - mostrar modal con información completa
  onRowClick(event: any) {
    const originalAnswer: Answer = event.row._originalData;
    
    const userName = this.getUserName(originalAnswer.user_id);
    const questionName = this.getQuestionName(originalAnswer.security_question_id);

    Swal.fire({
      title: 'Información de la Respuesta',
      html: `
        <div class="text-left">
          <p><strong>ID:</strong> ${originalAnswer.id}</p>
          <p><strong>Usuario:</strong> ${userName}</p>
          <p><strong>Pregunta:</strong> ${questionName}</p>
          <p><strong>Contenido:</strong> ${originalAnswer.content}</p>
          <p><strong>Fecha de Creación:</strong> ${originalAnswer.created_at ? this.formatDate(originalAnswer.created_at) : 'N/A'}</p>
          <p><strong>Última Actualización:</strong> ${originalAnswer.updated_at ? this.formatDate(originalAnswer.updated_at) : 'N/A'}</p>
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
        this.editAnswer(originalAnswer);
      } else if (result.isDenied) {
        this.deleteAnswer(originalAnswer);
      }
    });
  }

  // Función para crear nueva respuesta
  onAddAnswer() {
    const userOptions = this.users.map(user => `<option value="${user.id}">${user.name} (${user.email})</option>`).join('');
    const questionOptions = this.securityQuestions.map(question => `<option value="${question.id}">${question.name}</option>`).join('');

    Swal.fire({
      title: 'Crear Respuesta de Seguridad',
      html: `
        <div class="form-group">
          <label for="userId">Usuario:</label>
          <select id="userId" class="swal2-input" required>
            <option value="">Seleccionar usuario...</option>
            ${userOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="questionId">Pregunta de Seguridad:</label>
          <select id="questionId" class="swal2-input" required>
            <option value="">Seleccionar pregunta...</option>
            ${questionOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="answerContent">Respuesta:</label>
          <input type="text" id="answerContent" class="swal2-input" placeholder="Ingrese la respuesta" required>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const userId = (document.getElementById('userId') as HTMLSelectElement).value;
        const questionId = (document.getElementById('questionId') as HTMLSelectElement).value;
        const content = (document.getElementById('answerContent') as HTMLInputElement).value;
        
        if (!userId || !questionId || !content) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return null;
        }
        
        return { userId: parseInt(userId), questionId: parseInt(questionId), content };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.createAnswer(result.value);
      }
    });
  }

  // Crear respuesta
  createAnswer(answerData: { userId: number, questionId: number, content: string }) {
    const answer = { content: answerData.content };
    this.answerService.create(answerData.userId, answerData.questionId, answer).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Respuesta creada correctamente', 'success');
        this.loadAnswers();
      },
      error: (error) => {
        console.error('Error creando respuesta:', error);
        Swal.fire('Error', 'No se pudo crear la respuesta', 'error');
      }
    });
  }

  // Editar respuesta
  editAnswer(answer: Answer) {
    Swal.fire({
      title: 'Editar Respuesta',
      html: `
        <div class="form-group">
          <label for="editAnswerContent">Respuesta:</label>
          <input type="text" id="editAnswerContent" class="swal2-input" value="${answer.content}" required>
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const content = (document.getElementById('editAnswerContent') as HTMLInputElement).value;
        
        if (!content) {
          Swal.showValidationMessage('Por favor completa el campo');
          return null;
        }
        
        return { content };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.updateAnswer(answer.id!, result.value);
      }
    });
  }

  // Actualizar respuesta
  updateAnswer(id: number, answerData: { content: string }) {
    this.answerService.update(id, answerData).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Respuesta actualizada correctamente', 'success');
        this.loadAnswers();
      },
      error: (error) => {
        console.error('Error actualizando respuesta:', error);
        Swal.fire('Error', 'No se pudo actualizar la respuesta', 'error');
      }
    });
  }

  // Eliminar respuesta
  deleteAnswer(answer: Answer) {
    const userName = this.getUserName(answer.user_id);
    const questionName = this.getQuestionName(answer.security_question_id);

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la respuesta de "${userName}" para "${questionName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.answerService.delete(answer.id!).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La respuesta ha sido eliminada', 'success');
            this.loadAnswers();
          },
          error: (error) => {
            console.error('Error eliminando respuesta:', error);
            Swal.fire('Error', 'No se pudo eliminar la respuesta', 'error');
          }
        });
      }
    });
  }
}
