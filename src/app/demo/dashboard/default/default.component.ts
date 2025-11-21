import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplaintsService, Complaint } from 'src/app/services/complaints.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {

  private complaintsService = inject(ComplaintsService);

  complaints: Complaint[] = [];
  paginatedComplaints: Complaint[] = [];

  loading = true;

  // Dashboard counts
  totalCount = 0;
  inProgressCount = 0;
  pendingCount = 0;
  completedCount = 0;
  requestedCount = 0;

  // Pagination
  pageSize = 7;
  currentPage = 1;
  totalPages = 1;
  totalPagesArr: number[] = [];

  alertMessage: string | null = null;
  alertType: 'success' | 'danger' | null = null;

  dropdownOpenComplaintId: string | null = null;
  actionStatuses = ['In-Progress', 'Requested'];

  sortConfig: { column: string; direction: 'asc' | 'desc' }[] = [];

  ngOnInit(): void {
    this.fetchComplaints();
  }

  fetchComplaints() {
    this.loading = true;

    this.complaintsService.getComplaints().subscribe({
      next: (res: any) => {
        this.complaints = Array.isArray(res.maintenance_complaints) ? res.maintenance_complaints : [];

        this.updateCounts();
        this.setupPagination();

        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching complaints:', err);
        this.loading = false;
      }
    });
  }

  updateCounts() {
    this.totalCount = this.complaints.length;
    this.inProgressCount = this.complaints.filter(c => c.status === 'In-Progress').length;
    this.pendingCount = this.complaints.filter(c => c.status === 'Pending').length;
    this.completedCount = this.complaints.filter(c => c.status === 'Completed').length;
    this.requestedCount = this.complaints.filter(c => c.status === 'Requested').length;
  }

  getDriverImage(driverImage: string): string {
    if (!driverImage) return 'https://via.placeholder.com/40';
    return driverImage.startsWith('http')
      ? driverImage
      : `http://203.135.63.46:5000/${driverImage}`;
  }

  toggleDropdown(complaint: Complaint) {
    this.dropdownOpenComplaintId =
      this.dropdownOpenComplaintId === complaint.complaint_id ? null : complaint.complaint_id;
  }

  updateStatusFromDropdown(complaint: Complaint, newStatus: string) {
    if (complaint.status === 'Completed') {
      this.showAlert('Completed complaints cannot be updated.', 'danger');
      this.dropdownOpenComplaintId = null;
      return;
    }

    complaint.status = newStatus;
    this.saveStatus(complaint);
    this.dropdownOpenComplaintId = null;
  }

  saveStatus(complaint: Complaint) {
    const updatedComplaint: Complaint = {
      ...complaint,
      status_change_time: new Date().toISOString()
    };

    this.complaintsService.updateComplaint(complaint.complaint_id, updatedComplaint).subscribe({
      next: () => {
        complaint.status_change_time = updatedComplaint.status_change_time;
        this.updateCounts();
        this.showAlert(`Status updated to "${complaint.status}" successfully.`, 'success');
      },
      error: () => {
        this.showAlert('Failed to update status. Please try again.', 'danger');
      }
    });
  }

  showAlert(message: string, type: 'success' | 'danger') {
    this.alertMessage = message;
    this.alertType = type;

    setTimeout(() => {
      this.alertMessage = null;
      this.alertType = null;
    }, 3000);
  }

  /* PAGINATION ---------------------------------------- */

  setupPagination() {
    this.totalPages = Math.ceil(this.complaints.length / this.pageSize);
    this.totalPagesArr = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    this.updatePaginatedList();
  }

  updatePaginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedComplaints = this.complaints.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedList();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedList();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePaginatedList();
  }

  /* SORTING ------------------------------------------ */

  sortTable(column: string, multi = false) {
    if (!multi) {
      if (this.sortConfig.length === 1 && this.sortConfig[0].column === column) {
        this.sortConfig[0].direction =
          this.sortConfig[0].direction === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortConfig = [{ column, direction: 'asc' }];
      }
    } else {
      const existing = this.sortConfig.find(s => s.column === column);

      if (existing) {
        existing.direction = existing.direction === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortConfig.push({ column, direction: 'asc' });
      }
    }

    this.applySorting();
  }

  applySorting() {
    this.complaints.sort((a: any, b: any) => {
      for (let config of this.sortConfig) {
        let valueA = a[config.column];
        let valueB = b[config.column];

        if (config.column.includes('time')) {
          valueA = new Date(valueA).getTime();
          valueB = new Date(valueB).getTime();
        }

        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();

        if (valueA < valueB) return config.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.setupPagination(); // refresh pagination
  }

  getSortIcon(column: string): string | null {
    const config = this.sortConfig.find(s => s.column === column);
    if (!config) return null;

    return config.direction === 'asc' ? '↑' : '↓';
  }
}
