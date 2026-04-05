import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private apiUrl = `${environment.apiUrl}/customers`;

    constructor(private http: HttpClient) { }

    getCustomers(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getCustomerById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    updateStatus(id: string, status: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/status`, { status });
    }

    deleteCustomer(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
