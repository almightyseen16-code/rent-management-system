import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { usePaymentsWithTenants, useCreatePayment } from "@/hooks/usePayments";
import { useTenantsWithProperties } from "@/hooks/useTenants";
import { formatCurrency, formatDate, getStatusLabel } from "@/lib/utils";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PaymentMethod } from "@/types";

const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'muted'> = {
  paid_on_time: 'success',
  late_paid: 'warning',
  overdue: 'error',
  pending: 'muted',
};

const paymentMethodLabels: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  cash: 'Cash',
};

export default function Payments() {
  const { data: payments = [], isLoading } = usePaymentsWithTenants();
  const { data: tenants = [] } = useTenantsWithProperties();
  const createPayment = useCreatePayment();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tenantId: "",
    rentDueDate: "",
    amountDue: "",
    amountPaid: "",
    paymentDate: "",
    paymentMethod: "" as PaymentMethod | "",
  });

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.tenant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      tenantId: "",
      rentDueDate: "",
      amountDue: "",
      amountPaid: "",
      paymentDate: "",
      paymentMethod: "",
    });
  };

  const handleAdd = async () => {
    try {
      await createPayment.mutateAsync({
        tenantId: formData.tenantId,
        rentDueDate: new Date(formData.rentDueDate),
        amountDue: parseFloat(formData.amountDue) || 0,
        amountPaid: parseFloat(formData.amountPaid) || 0,
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate) : null,
        paymentMethod: formData.paymentMethod || null,
      });
      toast({ title: "Payment record created successfully" });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "Failed to create payment record", variant: "destructive" });
    }
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

  return (
    <div className="container px-4 md:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Payments</h1>
          <p className="text-muted-foreground">
            Track and manage all rent payments ({payments.length} total)
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payment Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant</Label>
                <Select
                  value={formData.tenantId}
                  onValueChange={(v) => {
                    const tenant = tenants.find((t) => t.id === v);
                    setFormData({
                      ...formData,
                      tenantId: v,
                      amountDue: tenant?.property.monthlyRent.toString() || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name} (Unit {tenant.property.unitNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentDueDate">Rent Due Date</Label>
                <Input
                  id="rentDueDate"
                  type="date"
                  value={formData.rentDueDate}
                  onChange={(e) => setFormData({ ...formData, rentDueDate: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amountDue">Amount Due ($)</Label>
                  <Input
                    id="amountDue"
                    type="number"
                    value={formData.amountDue}
                    onChange={(e) => setFormData({ ...formData, amountDue: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amountPaid">Amount Paid ($)</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(v) => setFormData({ ...formData, paymentMethod: v as PaymentMethod })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button onClick={handleAdd} disabled={createPayment.isPending}>
              {createPayment.isPending ? "Creating..." : "Create Payment Record"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid_on_time">Paid on Time</SelectItem>
              <SelectItem value="late_paid">Late Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border bg-card animate-slide-up">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Tenant</TableHead>
              <TableHead className="font-semibold">Unit</TableHead>
              <TableHead className="font-semibold">Due Date</TableHead>
              <TableHead className="font-semibold text-right">Amount Due</TableHead>
              <TableHead className="font-semibold text-right">Amount Paid</TableHead>
              <TableHead className="font-semibold">Payment Date</TableHead>
              <TableHead className="font-semibold">Method</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchQuery || statusFilter !== "all" ? "No payments match your filters" : "No payment records yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium">{payment.tenant.name}</TableCell>
                  <TableCell>{payment.tenant.property.unitNumber}</TableCell>
                  <TableCell>{formatDate(payment.rentDueDate)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(payment.amountDue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(payment.amountPaid)}</TableCell>
                  <TableCell>{payment.paymentDate ? formatDate(payment.paymentDate) : "—"}</TableCell>
                  <TableCell>{payment.paymentMethod ? paymentMethodLabels[payment.paymentMethod] : "—"}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusVariants[payment.status]}>{getStatusLabel(payment.status)}</Badge>
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
