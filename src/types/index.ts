export type OccupancyStatus = 'occupied' | 'vacant' | 'notice_given';
export type PaymentMethod = 'bank_transfer' | 'mobile_money' | 'cash';
export type PaymentStatus = 'paid_on_time' | 'late_paid' | 'overdue' | 'pending';

export interface Property {
  id: string;
  unitNumber: string;
  streetAddress: string;
  monthlyRent: number;
  securityDeposit: number;
  occupancyStatus: OccupancyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyId: string;
  leaseStartDate: Date;
  leaseEndDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  tenantId: string;
  rentDueDate: Date;
  amountDue: number;
  amountPaid: number;
  paymentDate: Date | null;
  paymentMethod: PaymentMethod | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantWithProperty extends Tenant {
  property: Property;
}

export interface PaymentWithTenant extends Payment {
  tenant: TenantWithProperty;
  status: PaymentStatus;
}
