import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PermissionsComponent } from './permissions.component';
import { PermissionService } from 'src/app/services/permission.service'; // 👈 AGREGAR ESTA LÍNEA

describe('PermissionsComponent', () => {
  let component: PermissionsComponent;
  let fixture: ComponentFixture<PermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionsComponent ],
      imports: [ 
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [ PermissionService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct title', () => {
    expect(component.title).toBe('Gestión de Permisos');
  });

  it('should have correct headers', () => {
    expect(component.headers).toEqual(['ID', 'URL', 'Método', 'Acciones']);
  });
});