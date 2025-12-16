import { Building, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { OverdueAlert } from "@/components/dashboard/OverdueAlert";
import { RentRollTable } from "@/components/dashboard/RentRollTable";
import { PaymentForm } from "@/components/dashboard/PaymentForm";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useTenantsWithProperties } from "@/hooks/useTenants";
import { usePaymentsWithTenants, useUpdatePayment, useCreatePayment } from "@/hooks/usePayments";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: payments = [], isLoading: paymentsLoading } = usePaymentsWithTenants();
  const { data: tenants = [], isLoading: tenantsLoading } = useTenantsWithProperties();
  const updatePayment = useUpdatePayment();
  const createPayment = useCreatePayment();
  const { toast } = useToast();

  const handlePaymentSubmit = async (data: {
    tenantId: string;
    paymentDate: Date;
    amountPaid: number;
    paymentMethod: "bank_transfer" | "mobile_money" | "cash";
  }) => {
    // Find existing pending payment for this tenant
    const existingPayment = payments.find(
      (p) => p.tenantId === data.tenantId && (p.status === "pending" || p.status === "overdue")
    );

    try {
      if (existingPayment) {
        await updatePayment.mutateAsync({
          id: existingPayment.id,
          amountPaid: data.amountPaid,
          paymentDate: data.paymentDate,
          paymentMethod: data.paymentMethod,
        });
      } else {
        // Create a new payment record
        const tenant = tenants.find((t) => t.id === data.tenantId);
        if (tenant) {
          await createPayment.mutateAsync({
            tenantId: data.tenantId,
            rentDueDate: new Date(),
            amountDue: tenant.property.monthlyRent,
            amountPaid: data.amountPaid,
            paymentDate: data.paymentDate,
            paymentMethod: data.paymentMethod,
          });
        }
      }
      toast({
        title: "Payment Recorded",
        description: "The payment has been successfully recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = statsLoading || paymentsLoading || tenantsLoading;

  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-6 space-y-6">
        <div className="animate-fade-in">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="container px-4 md:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold font-display">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your rental portfolio for {currentMonth}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Occupied Units"
          value={`${stats?.occupiedUnits || 0}/${stats?.totalUnits || 0}`}
          subtitle={`${(100 - (stats?.vacancyRate || 0)).toFixed(0)}% occupancy rate`}
          icon={Building}
          variant="default"
        />
        <StatCard
          title="Collected This Month"
          value={formatCurrency(stats?.totalCollectedThisMonth || 0)}
          subtitle={`of ${formatCurrency(stats?.expectedMonthlyRent || 0)} expected`}
          icon={DollarSign}
          trend={{ value: stats?.collectionRate || 0, isPositive: (stats?.collectionRate || 0) >= 80 }}
          variant="success"
        />
        <StatCard
          title="Collection Rate"
          value={`${(stats?.collectionRate || 0).toFixed(0)}%`}
          subtitle="This month's performance"
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="Overdue Amount"
          value={formatCurrency(stats?.totalOverdueAmount || 0)}
          subtitle={`${stats?.overduePayments.length || 0} overdue payment${(stats?.overduePayments.length || 0) !== 1 ? 's' : ''}`}
          icon={AlertCircle}
          variant={(stats?.overduePayments.length || 0) > 0 ? "danger" : "default"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Alerts and Table */}
        <div className="lg:col-span-2 space-y-6">
          <OverdueAlert overduePayments={stats?.overduePayments || []} />
          <RentRollTable payments={payments} />
        </div>

        {/* Right Column - Payment Form */}
        <div>
          <PaymentForm tenants={tenants} onSubmit={handlePaymentSubmit} />
        </div>
      </div>
    </div>
  );
}
