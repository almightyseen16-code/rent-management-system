import { useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useProperties, useCreateProperty, useUpdateProperty, useDeleteProperty } from "@/hooks/useProperties";
import { formatCurrency, getOccupancyLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Property, OccupancyStatus } from "@/types";

const occupancyVariants: Record<string, 'occupied' | 'vacant' | 'notice'> = {
  occupied: 'occupied',
  vacant: 'vacant',
  notice_given: 'notice',
};

export default function Properties() {
  const { data: properties = [], isLoading } = useProperties();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    unitNumber: "",
    streetAddress: "",
    monthlyRent: "",
    securityDeposit: "",
    occupancyStatus: "vacant" as OccupancyStatus,
  });

  const filteredProperties = properties.filter(
    (p) =>
      p.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.streetAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      unitNumber: "",
      streetAddress: "",
      monthlyRent: "",
      securityDeposit: "",
      occupancyStatus: "vacant",
    });
  };

  const handleAdd = async () => {
    try {
      await createProperty.mutateAsync({
        unitNumber: formData.unitNumber,
        streetAddress: formData.streetAddress,
        monthlyRent: parseFloat(formData.monthlyRent) || 0,
        securityDeposit: parseFloat(formData.securityDeposit) || 0,
        occupancyStatus: formData.occupancyStatus,
      });
      toast({ title: "Property added successfully" });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "Failed to add property", variant: "destructive" });
    }
  };

  const handleEdit = async () => {
    if (!editingProperty) return;
    try {
      await updateProperty.mutateAsync({
        id: editingProperty.id,
        unitNumber: formData.unitNumber,
        streetAddress: formData.streetAddress,
        monthlyRent: parseFloat(formData.monthlyRent) || 0,
        securityDeposit: parseFloat(formData.securityDeposit) || 0,
        occupancyStatus: formData.occupancyStatus,
      });
      toast({ title: "Property updated successfully" });
      setEditingProperty(null);
      resetForm();
    } catch (error) {
      toast({ title: "Failed to update property", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty.mutateAsync(id);
      toast({ title: "Property deleted successfully" });
    } catch (error) {
      toast({ title: "Failed to delete property", variant: "destructive" });
    }
  };

  const openEditDialog = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      unitNumber: property.unitNumber,
      streetAddress: property.streetAddress,
      monthlyRent: property.monthlyRent.toString(),
      securityDeposit: property.securityDeposit.toString(),
      occupancyStatus: property.occupancyStatus,
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

  const PropertyFormFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="unitNumber">Unit Number</Label>
        <Input
          id="unitNumber"
          value={formData.unitNumber}
          onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
          placeholder="e.g., 101"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="streetAddress">Street Address</Label>
        <Input
          id="streetAddress"
          value={formData.streetAddress}
          onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
          placeholder="e.g., 123 Main Street"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
          <Input
            id="monthlyRent"
            type="number"
            value={formData.monthlyRent}
            onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
          <Input
            id="securityDeposit"
            type="number"
            value={formData.securityDeposit}
            onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="occupancyStatus">Occupancy Status</Label>
        <Select
          value={formData.occupancyStatus}
          onValueChange={(v) => setFormData({ ...formData, occupancyStatus: v as OccupancyStatus })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vacant">Vacant</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="notice_given">Notice Given</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="container px-4 md:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Properties</h1>
          <p className="text-muted-foreground">
            Manage your rental properties and units ({properties.length} total)
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
            </DialogHeader>
            <PropertyFormFields />
            <Button onClick={handleAdd} disabled={createProperty.isPending}>
              {createProperty.isPending ? "Adding..." : "Add Property"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4 animate-slide-up">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Properties Table */}
      <div className="rounded-xl border bg-card animate-slide-up">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Unit</TableHead>
              <TableHead className="font-semibold">Address</TableHead>
              <TableHead className="font-semibold text-right">Monthly Rent</TableHead>
              <TableHead className="font-semibold text-right">Security Deposit</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No properties match your search" : "No properties yet. Add your first property!"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProperties.map((property) => (
                <TableRow key={property.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium">{property.unitNumber}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{property.streetAddress}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(property.monthlyRent)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(property.securityDeposit)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={occupancyVariants[property.occupancyStatus]}>
                      {getOccupancyLabel(property.occupancyStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Dialog open={editingProperty?.id === property.id} onOpenChange={(open) => !open && setEditingProperty(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(property)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Property</DialogTitle>
                          </DialogHeader>
                          <PropertyFormFields />
                          <Button onClick={handleEdit} disabled={updateProperty.isPending}>
                            {updateProperty.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(property.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
