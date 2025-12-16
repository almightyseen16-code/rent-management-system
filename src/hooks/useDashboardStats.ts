import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentWithTenant, Property, PaymentMethod } from "@/types";
import { calculatePaymentStatus } from "@/lib/utils";

interface DashboardStats {
  occupiedUnits: number;
  totalUnits: number;
  vacancyRate: number;
  totalCollectedThisMonth: number;
  expectedMonthlyRent: number;
  collectionRate: number;
  overduePayments: PaymentWithTenant[];
  pendingPayments: PaymentWithTenant[];
  totalOverdueAmount: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("*");

      if (propertiesError) throw propertiesError;

      // Fetch payments with tenant and property info
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          *,
          tenants (
            *,
            properties (*)
          )
        `)
        .order("rent_due_date", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Calculate stats
      const occupiedUnits = propertiesData.filter((p) => p.occupancy_status === "occupied").length;
      const totalUnits = propertiesData.length;

      const thisMonth = new Date();
      const paymentsWithTenants: PaymentWithTenant[] = paymentsData
        .filter((p) => p.tenants && p.tenants.properties)
        .map((p) => {
          const rentDueDate = new Date(p.rent_due_date);
          const paymentDate = p.payment_date ? new Date(p.payment_date) : null;
          const amountDue = Number(p.amount_due);
          const amountPaid = Number(p.amount_paid);

          return {
            id: p.id,
            tenantId: p.tenant_id,
            rentDueDate,
            amountDue,
            amountPaid,
            paymentDate,
            paymentMethod: p.payment_method as PaymentMethod | null,
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at),
            status: calculatePaymentStatus(amountDue, amountPaid, rentDueDate, paymentDate),
            tenant: {
              id: p.tenants!.id,
              name: p.tenants!.name,
              phone: p.tenants!.phone || "",
              email: p.tenants!.email || "",
              propertyId: p.tenants!.property_id || "",
              leaseStartDate: p.tenants!.lease_start_date ? new Date(p.tenants!.lease_start_date) : new Date(),
              leaseEndDate: p.tenants!.lease_end_date ? new Date(p.tenants!.lease_end_date) : new Date(),
              createdAt: new Date(p.tenants!.created_at),
              updatedAt: new Date(p.tenants!.updated_at),
              property: {
                id: p.tenants!.properties!.id,
                unitNumber: p.tenants!.properties!.unit_number,
                streetAddress: p.tenants!.properties!.street_address,
                monthlyRent: Number(p.tenants!.properties!.monthly_rent),
                securityDeposit: Number(p.tenants!.properties!.security_deposit),
                occupancyStatus: p.tenants!.properties!.occupancy_status as Property["occupancyStatus"],
                createdAt: new Date(p.tenants!.properties!.created_at),
                updatedAt: new Date(p.tenants!.properties!.updated_at),
              },
            },
          };
        });

      const totalCollectedThisMonth = paymentsWithTenants
        .filter((p) => {
          if (!p.paymentDate) return false;
          return (
            p.paymentDate.getMonth() === thisMonth.getMonth() &&
            p.paymentDate.getFullYear() === thisMonth.getFullYear()
          );
        })
        .reduce((sum, p) => sum + p.amountPaid, 0);

      const overduePayments = paymentsWithTenants.filter((p) => p.status === "overdue");
      const pendingPayments = paymentsWithTenants.filter((p) => p.status === "pending");

      const expectedMonthlyRent = propertiesData
        .filter((p) => p.occupancy_status === "occupied")
        .reduce((sum, p) => sum + Number(p.monthly_rent), 0);

      return {
        occupiedUnits,
        totalUnits,
        vacancyRate: totalUnits > 0 ? ((totalUnits - occupiedUnits) / totalUnits) * 100 : 0,
        totalCollectedThisMonth,
        expectedMonthlyRent,
        collectionRate: expectedMonthlyRent > 0 ? (totalCollectedThisMonth / expectedMonthlyRent) * 100 : 0,
        overduePayments,
        pendingPayments,
        totalOverdueAmount: overduePayments.reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0),
      };
    },
  });
}
