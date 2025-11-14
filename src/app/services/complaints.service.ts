// src/app/services/complaints.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Complaint {
  complaint_id: string;
  complaint_name: string;
  complaint_register_time: string;
  description: string;
  driver_cnic: string;
  driver_image: string;
  driver_name: string;
  driver_number: string;
  ev_id: string;
  status: string;
  status_change_time: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ComplaintsService {
  private baseUrl = 'http://203.135.63.46:5000/neubolt/maintenance';
  private authUrl = 'http://203.135.63.46:5000/neubolt/auth';

  constructor(private http: HttpClient) {}

  // 🔹 LOGIN API
  login(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http.post(`${this.authUrl}/login`, body).pipe(
      tap((response: any) => {
        // Store token in localStorage after successful login
        if (response && response.access_token) {
          localStorage.setItem('accessToken', response.access_token);
          console.log('✅ Token saved to localStorage');
        } else {
          console.error('❌ No access_token found in login response');
        }
      })
    );
  }

  // 🔹 Helper: Get Headers with Bearer Token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // 🔹 GET Complaints
  getComplaints(): Observable<Complaint[] | Complaint> {
    return this.http.get<Complaint[] | Complaint>(
      `${this.baseUrl}/get-complaints`, // fixed spelling
      { headers: this.getAuthHeaders() }
    );
  }

  // 🔹 UPDATE Complaint
  updateComplaint(complaintId: string, complaintData: Complaint): Observable<Complaint> {
    return this.http.put<Complaint>(
      `${this.baseUrl}/put-complaints/${complaintId}`,
      complaintData,
      { headers: this.getAuthHeaders() }
    );
  }

  // 🔹 LOGOUT Helper
  logout(): void {
    localStorage.removeItem('accessToken');
    console.log('🚪 Logged out and token removed from localStorage');
  }
}
