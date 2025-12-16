import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tenant, TenantWithProperty, Property } from "@/types";

export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async (): Promise<Tenant[]> => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("name");

      if (error) throw error;

      return data.map((t) => ({
        id: t.id,
        name: t.name,
        phone: t.phone || "",
        email: t.email || "",
        propertyId: t.property_id || "",
        leaseStartDate: t.lease_start_date ? new Date(t.lease_start_date) : new Date(),
        leaseEndDate: t.lease_end_date ? new Date(t.lease_end_date) : new Date(),
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at),
      }));
    },
  });
}

export function useTenantsWithProperties() {
  return useQuery({
    queryKey: ["tenants-with-properties"],
    queryFn: async (): Promise<TenantWithProperty[]> => {
      const { data, error } = await supabase
        .from("tenants")
        .select(`
          *,
          properties (*)
        `)
        .order("name");

      if (error) throw error;

      return data
        .filter((t) => t.properties)
        .map((t) => ({
          id: t.id,
          name: t.name,
          phone: t.phone || "",
          email: t.email || "",
          propertyId: t.property_id || "",
          leaseStartDate: t.lease_start_date ? new Date(t.lease_start_date) : new Date(),
          leaseEndDate: t.lease_end_date ? new Date(t.lease_end_date) : new Date(),
          createdAt: new Date(t.created_at),
          updatedAt: new Date(t.updated_at),
          property: {
            id: t.properties!.id,
            unitNumber: t.properties!.unit_number,
            streetAddress: t.properties!.street_address,
            monthlyRent: Number(t.properties!.monthly_rent),
            securityDeposit: Number(t.properties!.security_deposit),
            occupancyStatus: t.properties!.occupancy_status as Property["occupancyStatus"],
            createdAt: new Date(t.properties!.created_at),
            updatedAt: new Date(t.properties!.updated_at),
          },
        }));
    },
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenant: Omit<Tenant, "id" | "createdAt" | "updatedAt">) => {
      const { data, error } = await supabase
        .from("tenants")
        .insert({
          name: tenant.name,
          phone: tenant.phone,
          email: tenant.email,
          property_id: tenant.propertyId || null,
          lease_start_date: tenant.leaseStartDate.toISOString().split("T")[0],
          lease_end_date: tenant.leaseEndDate.toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants-with-properties"] });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...tenant }: Partial<Tenant> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      if (tenant.name !== undefined) updateData.name = tenant.name;
      if (tenant.phone !== undefined) updateData.phone = tenant.phone;
      if (tenant.email !== undefined) updateData.email = tenant.email;
      if (tenant.propertyId !== undefined) updateData.property_id = tenant.propertyId || null;
      if (tenant.leaseStartDate !== undefined) updateData.lease_start_date = tenant.leaseStartDate.toISOString().split("T")[0];
      if (tenant.leaseEndDate !== undefined) updateData.lease_end_date = tenant.leaseEndDate.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("tenants")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants-with-properties"] });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tenants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants-with-properties"] });
    },
  });
}
