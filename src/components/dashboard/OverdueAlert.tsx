import { AlertTriangle } from "lucide-react";
import { PaymentWithTenant } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OverdueAlertProps {
  overduePayments: PaymentWithTenant[];
}

export function OverdueAlert({ overduePayments }: OverdueAlertProps) {
  if (overduePayments.length === 0) {
    return (
      <div className="rounded-xl border bg-status-paid-bg/50 p-6 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-status-paid/10 p-2">
            <svg
              className="h-5 w-5 text-status-paid"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-status-paid">All Payments Current</h3>
            <p className="text-sm text-muted-foreground">
              No overdue payments at this time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-status-overdue/20 bg-status-overdue-bg p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-lg bg-status-overdue/10 p-2">
          <AlertTriangle className="h-5 w-5 text-status-overdue" />
        </div>
        <div>
          <h3 className="font-semibold text-status-overdue">
            {overduePayments.length} Overdue Payment{overduePayments.length > 1 ? 's' : ''}
          </h3>
          <p className="text-sm text-muted-foreground">
            Immediate attention required
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {overduePayments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between rounded-lg bg-card/80 p-4 border border-status-overdue/10"
          >
            <div>
              <p className="font-medium">{payment.tenant.name}</p>
              <p className="text-sm text-muted-foreground">
                Unit {payment.tenant.property.unitNumber} • Due {formatDate(payment.rentDueDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-status-overdue">
                {formatCurrency(payment.amountDue - payment.amountPaid)}
              </p>
              <p className="text-xs text-muted-foreground">Outstanding</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
