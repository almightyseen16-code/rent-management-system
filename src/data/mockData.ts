import { Property, Tenant, Payment, PaymentWithTenant, TenantWithProperty } from '@/types';
import { calculatePaymentStatus } from '@/lib/utils';

// Mock Properties
export const properties: Property[] = [
  {
    id: 'prop-1',
    unitNumber: '101',
    streetAddress: '123 Oak Street, Apt 101',
    monthlyRent: 1200,
    securityDeposit: 1200,
    occupancyStatus: 'occupied',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'prop-2',
    unitNumber: '102',
    streetAddress: '123 Oak Street, Apt 102',
    monthlyRent: 1350,
    securityDeposit: 1350,
    occupancyStatus: 'occupied',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'prop-3',
    unitNumber: '103',
    streetAddress: '123 Oak Street, Apt 103',
    monthlyRent: 1100,
    securityDeposit: 1100,
    occupancyStatus: 'vacant',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'prop-4',
    unitNumber: '201',
    streetAddress: '456 Maple Avenue, Unit A',
    monthlyRent: 1500,
    securityDeposit: 1500,
    occupancyStatus: 'occupied',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: 'prop-5',
    unitNumber: '202',
    streetAddress: '456 Maple Avenue, Unit B',
    monthlyRent: 1450,
    securityDeposit: 1450,
    occupancyStatus: 'notice_given',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'prop-6',
    unitNumber: '301',
    streetAddress: '789 Pine Road, House 1',
    monthlyRent: 1800,
    securityDeposit: 2700,
    occupancyStatus: 'occupied',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
];

// Mock Tenants
export const tenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john.smith@email.com',
    propertyId: 'prop-1',
    leaseStartDate: new Date('2024-01-01'),
    leaseEndDate: new Date('2025-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'tenant-2',
    name: 'Sarah Johnson',
    phone: '(555) 234-5678',
    email: 'sarah.j@email.com',
    propertyId: 'prop-2',
    leaseStartDate: new Date('2024-02-01'),
    leaseEndDate: new Date('2025-01-31'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'tenant-3',
    name: 'Michael Brown',
    phone: '(555) 345-6789',
    email: 'mbrown@email.com',
    propertyId: 'prop-4',
    leaseStartDate: new Date('2024-03-01'),
    leaseEndDate: new Date('2025-02-28'),
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
  {
    id: 'tenant-4',
    name: 'Emily Davis',
    phone: '(555) 456-7890',
    email: 'emily.davis@email.com',
    propertyId: 'prop-5',
    leaseStartDate: new Date('2024-04-01'),
    leaseEndDate: new Date('2025-03-31'),
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01'),
  },
  {
    id: 'tenant-5',
    name: 'Robert Wilson',
    phone: '(555) 567-8901',
    email: 'rwilson@email.com',
    propertyId: 'prop-6',
    leaseStartDate: new Date('2024-05-01'),
    leaseEndDate: new Date('2025-04-30'),
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01'),
  },
];

// Mock Payments (December 2024)
export const payments: Payment[] = [
  // Tenant 1 - Paid on time
  {
    id: 'pay-1',
    tenantId: 'tenant-1',
    rentDueDate: new Date('2024-12-01'),
    amountDue: 1200,
    amountPaid: 1200,
    paymentDate: new Date('2024-11-30'),
    paymentMethod: 'bank_transfer',
    createdAt: new Date('2024-11-30'),
    updatedAt: new Date('2024-11-30'),
  },
  // Tenant 2 - Late paid
  {
    id: 'pay-2',
    tenantId: 'tenant-2',
    rentDueDate: new Date('2024-12-01'),
    amountDue: 1350,
    amountPaid: 1350,
    paymentDate: new Date('2024-12-05'),
    paymentMethod: 'mobile_money',
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05'),
  },
  // Tenant 3 - Overdue
  {
    id: 'pay-3',
    tenantId: 'tenant-3',
    rentDueDate: new Date('2024-12-01'),
    amountDue: 1500,
    amountPaid: 0,
    paymentDate: null,
    paymentMethod: null,
    createdAt: new Date('2024-11-25'),
    updatedAt: new Date('2024-11-25'),
  },
  // Tenant 4 - Pending (due later this month)
  {
    id: 'pay-4',
    tenantId: 'tenant-4',
    rentDueDate: new Date('2024-12-15'),
    amountDue: 1450,
    amountPaid: 0,
    paymentDate: null,
    paymentMethod: null,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
  },
  // Tenant 5 - Paid on time
  {
    id: 'pay-5',
    tenantId: 'tenant-5',
    rentDueDate: new Date('2024-12-01'),
    amountDue: 1800,
    amountPaid: 1800,
    paymentDate: new Date('2024-12-01'),
    paymentMethod: 'cash',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
  },
];

// Helper functions to get enriched data
export function getTenantsWithProperties(): TenantWithProperty[] {
  return tenants.map(tenant => ({
    ...tenant,
    property: properties.find(p => p.id === tenant.propertyId)!,
  }));
}

export function getPaymentsWithTenants(): PaymentWithTenant[] {
  const tenantsWithProps = getTenantsWithProperties();
  
  return payments.map(payment => {
    const tenant = tenantsWithProps.find(t => t.id === payment.tenantId)!;
    const status = calculatePaymentStatus(
      payment.amountDue,
      payment.amountPaid,
      payment.rentDueDate,
      payment.paymentDate
    );
    
    return {
      ...payment,
      tenant,
      status,
    };
  });
}

export function getDashboardStats() {
  const occupiedUnits = properties.filter(p => p.occupancyStatus === 'occupied').length;
  const totalUnits = properties.length;
  const paymentsWithTenants = getPaymentsWithTenants();
  
  const thisMonth = new Date();
  const totalCollectedThisMonth = paymentsWithTenants
    .filter(p => {
      if (!p.paymentDate) return false;
      const payDate = new Date(p.paymentDate);
      return payDate.getMonth() === thisMonth.getMonth() && 
             payDate.getFullYear() === thisMonth.getFullYear();
    })
    .reduce((sum, p) => sum + p.amountPaid, 0);
  
  const overduePayments = paymentsWithTenants.filter(p => p.status === 'overdue');
  const pendingPayments = paymentsWithTenants.filter(p => p.status === 'pending');
  
  const expectedMonthlyRent = properties
    .filter(p => p.occupancyStatus === 'occupied')
    .reduce((sum, p) => sum + p.monthlyRent, 0);
  
  return {
    occupiedUnits,
    totalUnits,
    vacancyRate: ((totalUnits - occupiedUnits) / totalUnits) * 100,
    totalCollectedThisMonth,
    expectedMonthlyRent,
    collectionRate: (totalCollectedThisMonth / expectedMonthlyRent) * 100,
    overduePayments,
    pendingPayments,
    totalOverdueAmount: overduePayments.reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0),
  };
}
