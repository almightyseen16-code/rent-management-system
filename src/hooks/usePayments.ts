import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Payment, PaymentWithTenant, PaymentMethod, Property } from "@/types";
import { calculatePaymentStatus } from "@/lib/utils";

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("rent_due_date", { ascending: false });

      if (error) throw error;

      return data.map((p) => ({
        id: p.id,
        tenantId: p.tenant_id,
        rentDueDate: new Date(p.rent_due_date),
        amountDue: Number(p.amount_due),
        amountPaid: Number(p.amount_paid),
        paymentDate: p.payment_date ? new Date(p.payment_date) : null,
        paymentMethod: p.payment_method as PaymentMethod | null,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      }));
    },
  });
}

export function usePaymentsWithTenants() {
  return useQuery({
    queryKey: ["payments-with-tenants"],
    queryFn: async (): Promise<PaymentWithTenant[]> => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          tenants (
            *,
            properties (*)
          )
        `)
        .order("rent_due_date", { ascending: false });

      if (error) throw error;

      return data
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
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: {
      tenantId: string;
      rentDueDate: Date;
      amountDue: number;
      amountPaid: number;
      paymentDate: Date | null;
      paymentMethod: PaymentMethod | null;
    }) => {
      const { data, error } = await supabase
        .from("payments")
        .insert({
          tenant_id: payment.tenantId,
          rent_due_date: payment.rentDueDate.toISOString().split("T")[0],
          amount_due: payment.amountDue,
          amount_paid: payment.amountPaid,
          payment_date: payment.paymentDate?.toISOString().split("T")[0] || null,
          payment_method: payment.paymentMethod,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments-with-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      amountPaid,
      paymentDate,
      paymentMethod,
    }: {
      id: string;
      amountPaid: number;
      paymentDate: Date;
      paymentMethod: PaymentMethod;
    }) => {
      const { data, error } = await supabase
        .from("payments")
        .update({
          amount_paid: amountPaid,
          payment_date: paymentDate.toISOString().split("T")[0],
          payment_method: paymentMethod,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments-with-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
