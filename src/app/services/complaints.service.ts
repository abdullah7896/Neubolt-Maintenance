import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  // GET complaints
  getComplaints(): Observable<Complaint[] | Complaint> {
  return this.http.get<Complaint[] | Complaint>(`${this.baseUrl}/get-compaints`);
}


  // PUT complaint update (status, etc.)
  updateComplaint(complaintId: string, complaintData: Complaint): Observable<Complaint> {
    return this.http.put<Complaint>(`${this.baseUrl}/put-complaints/${complaintId}`, complaintData);
  }
}
