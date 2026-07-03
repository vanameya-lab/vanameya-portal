"use client";

import Link from "next/link";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentRecord {
  id: string;
  date: string;
  customerName: string;
  invoiceNumber: string;
  totalAmount: number;
  amountPaid: number;
  balanceAmount: number;
  paymentStatus: string;
  entryType: string;
  quantity: number;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);
  const [modalMode, setModalMode] = useState<'receive' | 'edit'>('receive');
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments');
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
      } else {
        toast.error("Failed to load payments");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (record: PaymentRecord, mode: 'receive' | 'edit') => {
    setSelectedRecord(record);
    setModalMode(mode);
    setPaymentAmount(mode === 'receive' ? record.balanceAmount.toString() : record.amountPaid.toString());
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
    setPaymentAmount("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record entirely?")) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Record deleted successfully");
        fetchPayments();
      } else {
        toast.error("Failed to delete record");
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const inputAmount = parseFloat(paymentAmount);
    if (isNaN(inputAmount) || inputAmount < 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    let newAmountPaid;
    if (modalMode === 'receive') {
      newAmountPaid = selectedRecord.amountPaid + inputAmount;
    } else {
      newAmountPaid = inputAmount;
    }

    const newBalance = selectedRecord.totalAmount - newAmountPaid;

    if (newBalance < 0) {
      toast.error("Amount paid cannot exceed total invoice amount");
      return;
    }

    setIsSubmitting(true);
    
    let newStatus = selectedRecord.paymentStatus;
    if (newBalance <= 0) {
      newStatus = 'Paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'Partial';
    } else {
      newStatus = 'Pending';
    }

    try {
      const res = await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRecord.id,
          amountPaid: newAmountPaid,
          balanceAmount: newBalance,
          paymentStatus: newStatus
        })
      });
      
      const result = await res.json();
      
      if (result.success) {
        toast.success("Payment recorded successfully!");
        fetchPayments(); // Refresh list
        handleCloseModal();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error("Failed to record payment", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Paid':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Paid</Badge>;
      case 'Partial':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Partial</Badge>;
      case 'Pending':
      default:
        return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">Pending</Badge>;
    }
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-8 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments & Receivables</h1>
        <p className="text-muted-foreground mt-2">Track pending invoices and record received payments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales & Samples</CardTitle>
          <CardDescription>A list of all your transactions and their payment status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice / Type</TableHead>
                  <TableHead className="text-right">Total (₹)</TableHead>
                  <TableHead className="text-right">Paid (₹)</TableHead>
                  <TableHead className="text-right">Balance (₹)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32">Loading...</TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32">No entries found.</TableCell>
                  </TableRow>
                ) : (
                  payments.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell className="font-medium">{record.customerName}</TableCell>
                      <TableCell>
                        {record.entryType === 'Sale' ? (
                          <span className="font-mono text-xs">{record.invoiceNumber}</span>
                        ) : (
                          <Badge variant="outline">Sample</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{record.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{record.amountPaid.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">{record.balanceAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(record.paymentStatus)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {record.paymentStatus !== 'Paid' && (
                          <Button size="sm" variant="outline" onClick={() => handleOpenModal(record, 'receive')}>
                            Receive
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => router.push(`/entry?editId=${record.id}`)} title="Edit Sale Details">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-edit"><path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/></svg>
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenModal(record, 'edit')} title="Edit Payment">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                          onClick={() => handleDelete(record.id)} 
                          disabled={isDeleting === record.id}
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal Overlay */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-background rounded-xl shadow-lg w-full max-w-md p-6 border animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-1">
              {modalMode === 'receive' ? 'Record Payment' : 'Edit Payment Details'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {modalMode === 'receive' ? `Recording payment for ${selectedRecord.customerName}` : `Adjusting total paid by ${selectedRecord.customerName}`}
            </p>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div className="space-y-2">
                <Label>Total Invoice Amount</Label>
                <div className="p-2 bg-muted rounded-md font-medium">₹ {selectedRecord.totalAmount.toFixed(2)}</div>
              </div>
              
              <div className="space-y-2">
                <Label>Current Balance</Label>
                <div className="p-2 bg-muted rounded-md font-medium text-destructive">₹ {selectedRecord.balanceAmount.toFixed(2)}</div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="paymentAmount">
                  {modalMode === 'receive' ? 'Amount Received Now (₹)' : 'Total Amount Paid so far (₹)'}
                </Label>
                <Input 
                  id="paymentAmount" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  max={modalMode === 'receive' ? selectedRecord.balanceAmount : selectedRecord.totalAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Confirm Payment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
