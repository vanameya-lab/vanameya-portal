import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function RecentEntriesTable({ entries }: { entries: any[] }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Salesperson</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No recent entries found.
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {new Date(entry.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{entry.salesperson}</TableCell>
                <TableCell>{entry.customers?.customer_name || 'Unknown'}</TableCell>
                <TableCell>{entry.products?.product_name || 'Unknown'}</TableCell>
                <TableCell className="text-right">{entry.quantity}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={entry.entry_type === "Sale" ? "default" : "secondary"}
                  >
                    {entry.entry_type}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
