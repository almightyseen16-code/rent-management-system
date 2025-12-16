import { PaymentWithTenant } from "@/types";
import { formatCurrency, formatDate, getStatusLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RentRollTableProps {
  payments: PaymentWithTenant[];
}

const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'muted'> = {
  paid_on_time: 'success',
  late_paid: 'warning',
  overdue: 'error',
  pending: 'muted',
};

export function RentRollTable({ payments }: RentRollTableProps) {
  return (
    <div className="rounded-xl border bg-card animate-slide-up">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold font-display">Rent Roll</h2>
        <p className="text-sm text-muted-foreground">
          Current month payment status for all units
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Unit</TableHead>
              <TableHead className="font-semibold">Tenant</TableHead>
              <TableHead className="font-semibold">Due Date</TableHead>
              <TableHead className="font-semibold text-right">Amount Due</TableHead>
              <TableHead className="font-semibold text-right">Amount Paid</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment, index) => (
              <TableRow 
                key={payment.id}
                className="transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell className="font-medium">
                  <div>
                    <p>{payment.tenant.property.unitNumber}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {payment.tenant.property.streetAddress}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{payment.tenant.name}</p>
                    <p className="text-xs text-muted-foreground">{payment.tenant.email}</p>
                  </div>
                </TableCell>
                <TableCell>{formatDate(payment.rentDueDate)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(payment.amountDue)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(payment.amountPaid)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={statusVariants[payment.status]}>
                    {getStatusLabel(payment.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
