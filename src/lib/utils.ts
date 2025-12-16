import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PaymentStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function calculatePaymentStatus(
  amountDue: number,
  amountPaid: number,
  rentDueDate: Date,
  paymentDate: Date | null
): PaymentStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(rentDueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  // If payment has been made
  if (paymentDate !== null && amountPaid >= amountDue) {
    const paidDate = new Date(paymentDate);
    paidDate.setHours(0, 0, 0, 0);
    
    if (paidDate <= dueDate) {
      return 'paid_on_time';
    } else {
      return 'late_paid';
    }
  }
  
  // If payment hasn't been made or is partial
  if (today > dueDate && amountPaid < amountDue) {
    return 'overdue';
  }
  
  return 'pending';
}

export function getStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    paid_on_time: 'Paid on Time',
    late_paid: 'Late Paid',
    overdue: 'Overdue',
    pending: 'Pending',
  };
  return labels[status];
}

export function getStatusClass(status: PaymentStatus): string {
  const classes: Record<PaymentStatus, string> = {
    paid_on_time: 'status-paid',
    late_paid: 'status-late',
    overdue: 'status-overdue',
    pending: 'status-pending',
  };
  return classes[status];
}

export function getOccupancyLabel(status: string): string {
  const labels: Record<string, string> = {
    occupied: 'Occupied',
    vacant: 'Vacant',
    notice_given: 'Notice Given',
  };
  return labels[status] || status;
}
