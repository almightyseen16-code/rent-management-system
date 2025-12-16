import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types";

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: async (): Promise<Property[]> => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("unit_number");

      if (error) throw error;

      return data.map((p) => ({
        id: p.id,
        unitNumber: p.unit_number,
        streetAddress: p.street_address,
        monthlyRent: Number(p.monthly_rent),
        securityDeposit: Number(p.security_deposit),
        occupancyStatus: p.occupancy_status as Property["occupancyStatus"],
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      }));
    },
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (property: Omit<Property, "id" | "createdAt" | "updatedAt">) => {
      const { data, error } = await supabase
        .from("properties")
        .insert({
          unit_number: property.unitNumber,
          street_address: property.streetAddress,
          monthly_rent: property.monthlyRent,
          security_deposit: property.securityDeposit,
          occupancy_status: property.occupancyStatus,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...property }: Partial<Property> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      if (property.unitNumber !== undefined) updateData.unit_number = property.unitNumber;
      if (property.streetAddress !== undefined) updateData.street_address = property.streetAddress;
      if (property.monthlyRent !== undefined) updateData.monthly_rent = property.monthlyRent;
      if (property.securityDeposit !== undefined) updateData.security_deposit = property.securityDeposit;
      if (property.occupancyStatus !== undefined) updateData.occupancy_status = property.occupancyStatus;

      const { data, error } = await supabase
        .from("properties")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
