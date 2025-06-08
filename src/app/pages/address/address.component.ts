import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as L from 'leaflet';

interface Address {
  id?: number;
  street: string;
  number: string;
  userId?: number;
}

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  isNew = false;
  private userId: number;
  private baseUrl = 'http://localhost:5000/address'; // URL del servicio mock
  private map: L.Map;
  private marker: L.Marker;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [],
      street: ['', Validators.required],
      number: ['', Validators.required]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const userParam = this.route.snapshot.paramMap.get('userId');

    if (userParam) {
      this.isNew = true;
      this.userId = +userParam;
    }

    if (idParam && !this.isNew) {
      this.getById(+idParam).subscribe(addr => this.form.patchValue(addr));
    }
  }

  ngAfterViewInit(): void {
    if (this.map) return;

    setTimeout(() => {
      this.map = L.map('map').setView([6.2442, -75.5812], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.marker = L.marker([6.2442, -75.5812], { draggable: true }).addTo(this.map)
        .bindPopup('Ubicación inicial')
        .openPopup();

      this.marker.on('dragend', () => {
        const pos = this.marker.getLatLng();
        console.log('Nueva posición:', pos.lat, pos.lng);
      });

      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }, 300);
  }

  listAll(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.baseUrl}`);
  }

  getById(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.baseUrl}/${id}`);
  }

  getByUser(userId: number): Observable<Address> {
    return this.http.get<Address>(`${this.baseUrl}/user/${userId}`);
  }

  create(addr: Address): Observable<Address> {
    return this.http.post<Address>(`${this.baseUrl}/user/${this.userId}`, addr);
  }

  update(addr: Address): Observable<Address> {
    return this.http.put<Address>(`${this.baseUrl}/${addr.id}`, addr);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  save(): void {
    const addr: Address = this.form.value;

    if (this.isNew) {
      // Verificar si el usuario ya tiene dirección
      this.getByUser(this.userId).subscribe(existingAddr => {
        if (existingAddr && existingAddr.id) {
          // Usuario ya tiene dirección -> actualizamos
          addr.id = existingAddr.id;
          this.update(addr).subscribe(() => this.router.navigate(['/address']));
        } else {
          // Usuario no tiene dirección -> creamos
          this.create(addr).subscribe(() => this.router.navigate(['/address']));
        }
      }, error => {
        // Si error al buscar dirección, intentamos crear de todas formas
        this.create(addr).subscribe(() => this.router.navigate(['/address']));
      });
    } else {
      // Edición normal de dirección existente
      this.update(addr).subscribe(() => this.router.navigate(['/address']));
    }
  }


  deleteAddress(): void {
    const id = this.form.value.id;
    if (id && confirm('¿Estás seguro de eliminar esta dirección?')) {
      this.delete(id).subscribe(() => this.router.navigate(['/address']));
    }
  }
}
