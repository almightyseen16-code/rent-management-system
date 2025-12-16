import { useState } from "react";
import { CalendarIcon, Check, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { TenantWithProperty, PaymentMethod } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface PaymentFormProps {
  tenants: TenantWithProperty[];
  onSubmit?: (data: {
    tenantId: string;
    paymentDate: Date;
    amountPaid: number;
    paymentMethod: PaymentMethod;
  }) => void;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'cash', label: 'Cash' },
];

export function PaymentForm({ tenants, onSubmit }: PaymentFormProps) {
  const { toast } = useToast();
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<Date>();
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTenantData = tenants.find(t => t.id === selectedTenant);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTenant || !paymentDate || !amountPaid || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (onSubmit) {
      onSubmit({
        tenantId: selectedTenant,
        paymentDate,
        amountPaid: parseFloat(amountPaid),
        paymentMethod: paymentMethod as PaymentMethod,
      });
    }

    toast({
      title: "Payment Recorded",
      description: `Successfully recorded ${formatCurrency(parseFloat(amountPaid))} from ${selectedTenantData?.name}.`,
    });

    // Reset form
    setSelectedTenant("");
    setPaymentDate(undefined);
    setAmountPaid("");
    setPaymentMethod("");
    setIsSubmitting(false);
  };

  return (
    <div className="rounded-xl border bg-card p-6 animate-slide-up">
      <div className="mb-6">
        <h2 className="text-lg font-semibold font-display flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Record Payment
        </h2>
        <p className="text-sm text-muted-foreground">
          Quickly record a new rent payment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="tenant">Tenant</Label>
          <Select value={selectedTenant} onValueChange={setSelectedTenant}>
            <SelectTrigger id="tenant" className="w-full">
              <SelectValue placeholder="Select a tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  <div className="flex items-center gap-2">
                    <span>{tenant.name}</span>
                    <span className="text-muted-foreground text-xs">
                      (Unit {tenant.property.unitNumber})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTenantData && (
            <p className="text-xs text-muted-foreground">
              Monthly rent: {formatCurrency(selectedTenantData.property.monthlyRent)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Payment Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !paymentDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {paymentDate ? format(paymentDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={paymentDate}
                onSelect={setPaymentDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount Paid</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              K
            </span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="method">Payment Method</Label>
          <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
            <SelectTrigger id="method" className="w-full">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Recording...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Record Payment
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
