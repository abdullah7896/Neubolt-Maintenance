import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplaintsService, Complaint } from 'src/app/services/complaints.service';
import { FormsModule } from '@angular/forms';

// icons
import { IconService } from '@ant-design/icons-angular';
import { RiseOutline, FallOutline, SettingOutline, GiftOutline, MessageOutline } from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  private iconService = inject(IconService);
  private complaintsService = inject(ComplaintsService);

  complaints: Complaint[] = [];
  loading = true;

  // All statuses coming from API (for table display only)
  statuses = ['Pending', 'In-Progress', 'Completed', 'Requested'];

  // Dropdown me "Completed" hide
  actionStatuses = ['Pending', 'In-Progress', 'Requested'];

  // Alert
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' | null = null;

  // Track which complaint dropdown is open
  dropdownOpenComplaintId: string | null = null;

  constructor() {
    this.iconService.addIcon(...[RiseOutline, FallOutline, SettingOutline, GiftOutline, MessageOutline]);
  }

  ngOnInit(): void {
    this.fetchComplaints();
  }

  // Fetch complaints from API
  fetchComplaints() {
    this.loading = true;
    this.complaintsService.getComplaints().subscribe({
      next: (res: any) => {
        this.complaints = Array.isArray(res.maintenance_complaints) ? res.maintenance_complaints : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching complaints:', err);
        this.loading = false;
      }
    });
  }

  // Construct driver image URL
  getDriverImage(driverImage: string): string {
    if (!driverImage) return 'https://via.placeholder.com/30';
    return driverImage.startsWith('http') ? driverImage : `http://203.135.63.46:5000/${driverImage}`;
  }

  // Toggle dropdown visibility for a complaint
  toggleDropdown(complaint: Complaint) {
    this.dropdownOpenComplaintId = this.dropdownOpenComplaintId === complaint.complaint_id ? null : complaint.complaint_id;
  }

  // Update status from dropdown
  updateStatusFromDropdown(complaint: Complaint, newStatus: string) {
    // ❌ Prevent status update if complaint already Completed
    if (complaint.status === 'Completed') {
      this.showAlert('Completed complaints cannot be updated.', 'danger');
      this.dropdownOpenComplaintId = null;
      return;
    }

    complaint.status = newStatus;
    this.saveStatus(complaint);
    this.dropdownOpenComplaintId = null; // close dropdown
  }

  // Save updated status
  saveStatus(complaint: Complaint) {
    const updatedComplaint: Complaint = {
      ...complaint,
      status_change_time: new Date().toISOString()
    };

    this.complaintsService.updateComplaint(complaint.complaint_id, updatedComplaint).subscribe({
      next: () => {
        complaint.status_change_time = updatedComplaint.status_change_time;
        this.showAlert(`Status updated to "${complaint.status}" successfully.`, 'success');
      },
      error: (err) => {
        console.error('Error updating complaint:', err);
        this.showAlert('Failed to update status. Please try again.', 'danger');
      }
    });
  }

  // Show alert
  showAlert(message: string, type: 'success' | 'danger') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = null;
      this.alertType = null;
    }, 3000);
  }
}
