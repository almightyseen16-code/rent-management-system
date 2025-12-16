import { useState } from "react";
import { Plus, Search, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { useTenantsWithProperties, useCreateTenant, useUpdateTenant, useDeleteTenant } from "@/hooks/useTenants";
import { useProperties } from "@/hooks/useProperties";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TenantWithProperty } from "@/types";

export default function Tenants() {
  const { data: tenants = [], isLoading } = useTenantsWithProperties();
  const { data: properties = [] } = useProperties();
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantWithProperty | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    propertyId: "",
    leaseStartDate: "",
    leaseEndDate: "",
  });

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      propertyId: "",
      leaseStartDate: "",
      leaseEndDate: "",
    });
  };

  const handleAdd = async () => {
    try {
      await createTenant.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        propertyId: formData.propertyId,
        leaseStartDate: new Date(formData.leaseStartDate),
        leaseEndDate: new Date(formData.leaseEndDate),
      });
      toast({ title: "Tenant added successfully" });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "Failed to add tenant", variant: "destructive" });
    }
  };

  const handleEdit = async () => {
    if (!editingTenant) return;
    try {
      await updateTenant.mutateAsync({
        id: editingTenant.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        propertyId: formData.propertyId,
        leaseStartDate: new Date(formData.leaseStartDate),
        leaseEndDate: new Date(formData.leaseEndDate),
      });
      toast({ title: "Tenant updated successfully" });
      setEditingTenant(null);
      resetForm();
    } catch (error) {
      toast({ title: "Failed to update tenant", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTenant.mutateAsync(id);
      toast({ title: "Tenant deleted successfully" });
    } catch (error) {
      toast({ title: "Failed to delete tenant", variant: "destructive" });
    }
  };

  const openEditDialog = (tenant: TenantWithProperty) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      email: tenant.email,
      propertyId: tenant.propertyId,
      leaseStartDate: tenant.leaseStartDate.toISOString().split("T")[0],
      leaseEndDate: tenant.leaseEndDate.toISOString().split("T")[0],
    });
  };

  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-6 space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const TenantFormFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Smith"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="property">Property</Label>
        <Select
          value={formData.propertyId}
          onValueChange={(v) => setFormData({ ...formData, propertyId: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                Unit {property.unitNumber} - {property.streetAddress}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="leaseStart">Lease Start</Label>
          <Input
            id="leaseStart"
            type="date"
            value={formData.leaseStartDate}
            onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="leaseEnd">Lease End</Label>
          <Input
            id="leaseEnd"
            type="date"
            value={formData.leaseEndDate}
            onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container px-4 md:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Tenants</h1>
          <p className="text-muted-foreground">
            Manage your tenant information and leases ({tenants.length} total)
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
            </DialogHeader>
            <TenantFormFields />
            <Button onClick={handleAdd} disabled={createTenant.isPending}>
              {createTenant.isPending ? "Adding..." : "Add Tenant"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4 animate-slide-up">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-xl border bg-card animate-slide-up">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Tenant</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Property</TableHead>
              <TableHead className="font-semibold">Lease Period</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No tenants match your search" : "No tenants yet. Add your first tenant!"}
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => {
                const leaseEndDate = new Date(tenant.leaseEndDate);
                const today = new Date();
                const daysUntilEnd = Math.ceil((leaseEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysUntilEnd <= 60 && daysUntilEnd > 0;
                const isExpired = daysUntilEnd <= 0;

                return (
                  <TableRow key={tenant.id} className="transition-colors hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {tenant.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <span className="font-medium">{tenant.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{tenant.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{tenant.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">Unit {tenant.property.unitNumber}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {tenant.property.streetAddress}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(tenant.leaseStartDate)} - {formatDate(tenant.leaseEndDate)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {isExpired ? (
                        <Badge variant="error">Expired</Badge>
                      ) : isExpiringSoon ? (
                        <Badge variant="warning">Expiring Soon</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Dialog open={editingTenant?.id === tenant.id} onOpenChange={(open) => !open && setEditingTenant(null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(tenant)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Tenant</DialogTitle>
                            </DialogHeader>
                            <TenantFormFields />
                            <Button onClick={handleEdit} disabled={updateTenant.isPending}>
                              {updateTenant.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(tenant.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
