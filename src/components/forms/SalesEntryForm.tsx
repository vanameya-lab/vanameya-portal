"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EntryFormSchema, type EntryFormValues } from "@/types";
import { SALESPERSONS, PRODUCTS } from "@/constants/mock-data";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesEntryFormProps {
  editId?: string;
}

export function SalesEntryForm({ editId }: SalesEntryFormProps = {}) {
  const router = useRouter();
  const [isLoadingForm, setIsLoadingForm] = useState(!!editId);

  const {
    control,
    handleSubmit,
    watch,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(EntryFormSchema) as any,
    defaultValues: {
      product: "Instant Dry Ginger Coffee (10gm)",
      delivery: "Direct",
      entryType: "Sale",
      quantity: 1,
      rate: 7,
      customerName: "",
      address: "",
      sameAsBilling: true,
      shippingAddress: "",
      phoneNumber: "",
      email: "",
      customerType: "Customer",
      gstNumber: "",
      gstType: "Intra-state",
    },
  });

  const watchDelivery = watch("delivery");
  const watchEntryType = watch("entryType");
  const watchCustomerType = watch("customerType");
  const watchSameAsBilling = watch("sameAsBilling");

  useEffect(() => {
    if (editId) {
      fetch(`/api/sales/${editId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            reset(data.data);
          } else {
            toast.error("Failed to load sale details");
          }
        })
        .catch(() => toast.error("Error loading sale"))
        .finally(() => setIsLoadingForm(false));
    }
  }, [editId, reset]);

  async function onSubmit(values: EntryFormValues) {
    try {
      const url = editId ? `/api/sales/${editId}` : '/api/sales';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(editId ? "Sale updated successfully!" : "Sale recorded successfully!");
        
        if (values.entryType === 'Sale') {
          // Both POST and PUT return invoice: { invoice_number } if applicable
          const invoiceData = {
            ...values,
            invoiceNumber: result.invoice?.invoice_number || (editId ? "Updated" : "Pending")
          };
          
          const encodedData = encodeURIComponent(btoa(JSON.stringify(invoiceData)));
          router.push(`/invoice?data=${encodedData}`);
        } else {
          reset();
          if (editId) {
            router.push('/payments');
          }
        }
      } else {
        throw new Error(result.error || 'Failed to submit form');
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message
      });
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl border-none shadow-none sm:border-solid sm:shadow-sm">
      <CardHeader>
        <CardTitle>Sales & Sample Entry</CardTitle>
        <CardDescription>
          Record a new offline sale or sample distribution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salesperson">Salesperson</Label>
              <Controller
                control={control}
                name="salesperson"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger id="salesperson">
                      <SelectValue placeholder="Select salesperson" />
                    </SelectTrigger>
                    <SelectContent>
                      {SALESPERSONS.map((person) => (
                        <SelectItem key={person} value={person}>
                          {person}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.salesperson && (
                <p className="text-sm font-medium text-destructive">{errors.salesperson.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" placeholder="John Doe" {...register("customerName")} />
              {errors.customerName && (
                <p className="text-sm font-medium text-destructive">{errors.customerName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-2">
              <Label htmlFor="address">Billing Address</Label>
              <Input id="address" placeholder="123 Main St, City" {...register("address")} />
              {errors.address && (
                <p className="text-sm font-medium text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Controller
                control={control}
                name="sameAsBilling"
                render={({ field }) => (
                  <Switch
                    id="sameAsBilling"
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="sameAsBilling" className="font-medium cursor-pointer">Shipping address is same as billing</Label>
            </div>

            {!watchSameAsBilling && (
              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <Input id="shippingAddress" placeholder="456 Shipping Ave, City" {...register("shippingAddress")} />
                {errors.shippingAddress && (
                  <p className="text-sm font-medium text-destructive">{errors.shippingAddress.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" placeholder="1234567890" type="tel" {...register("phoneNumber")} />
              {errors.phoneNumber && (
                <p className="text-sm font-medium text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" placeholder="john@example.com" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="product">Product</Label>
              <Controller
                control={control}
                name="product"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCTS.map((prod) => (
                        <SelectItem key={prod} value={prod}>
                          {prod}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.product && (
                <p className="text-sm font-medium text-destructive">{errors.product.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min="1" {...register("quantity")} />
              {errors.quantity && (
                <p className="text-sm font-medium text-destructive">{errors.quantity.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rate">Rate (₹)</Label>
              <Input id="rate" type="number" min="0" step="0.01" {...register("rate")} />
              {errors.rate && (
                <p className="text-sm font-medium text-destructive">{errors.rate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <Label>Delivery Method</Label>
                <Controller
                  control={control}
                  name="delivery"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Direct" id="delivery-direct" />
                        <Label htmlFor="delivery-direct" className="font-normal">Direct</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Courier" id="delivery-courier" />
                        <Label htmlFor="delivery-courier" className="font-normal">Courier</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.delivery && (
                  <p className="text-sm font-medium text-destructive">{errors.delivery.message}</p>
                )}
              </div>

              {watchDelivery === "Courier" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="courierCharge">Courier Charge (₹) - Optional</Label>
                    <Input id="courierCharge" type="number" min="0" step="0.01" placeholder="Can be entered later" {...register("courierCharge", { valueAsNumber: true })} />
                    {errors.courierCharge && (
                      <p className="text-sm font-medium text-destructive">{errors.courierCharge.message}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Charge to Customer</Label>
                      <p className="text-xs text-muted-foreground">Include charge on the invoice.</p>
                    </div>
                    <Controller
                      control={control}
                      name="chargeCourierToCustomer"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <Label>Entry Type</Label>
                <Controller
                  control={control}
                  name="entryType"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Sale" id="type-sale" />
                        <Label htmlFor="type-sale" className="font-normal">Sale</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Sample" id="type-sample" />
                        <Label htmlFor="type-sample" className="font-normal">Sample</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.entryType && (
                  <p className="text-sm font-medium text-destructive">{errors.entryType.message}</p>
                )}
              </div>

              {watchEntryType === "Sample" && (
                <div className="space-y-2">
                  <Label htmlFor="sampleQuantity">Sample Quantity</Label>
                  <Input id="sampleQuantity" type="number" min="1" {...register("sampleQuantity", { valueAsNumber: true })} />
                  {errors.sampleQuantity && (
                    <p className="text-sm font-medium text-destructive">{errors.sampleQuantity.message}</p>
                  )}
                </div>
              )}
            </div>
            
            {watchEntryType === "Sale" && (
              <div className="mt-6 rounded-xl border-2 border-primary/20 bg-primary/5 p-5 shadow-sm space-y-6">
                
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-base font-semibold">Select GST Type</Label>
                  <Controller
                    control={control}
                    name="gstType"
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid gap-3 sm:grid-cols-2"
                      >
                        <div>
                          <RadioGroupItem value="Intra-state" id="gst-intra" className="peer sr-only" />
                          <Label 
                            htmlFor="gst-intra" 
                            className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer text-center transition-all ${field.value === 'Intra-state' ? 'border-primary bg-primary/10' : 'border-muted bg-transparent hover:bg-muted hover:text-accent-foreground'}`}
                          >
                            <span className="font-bold text-sm">Intra-state</span>
                            <span className="text-xs text-muted-foreground mt-1">CGST (2.5%) + SGST (2.5%)</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="Inter-state" id="gst-inter" className="peer sr-only" />
                          <Label 
                            htmlFor="gst-inter" 
                            className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer text-center transition-all ${field.value === 'Inter-state' ? 'border-primary bg-primary/10' : 'border-muted bg-transparent hover:bg-muted hover:text-accent-foreground'}`}
                          >
                            <span className="font-bold text-sm">Inter-state</span>
                            <span className="text-xs text-muted-foreground mt-1">IGST (5%)</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.gstType && (
                    <p className="text-sm font-medium text-destructive">{errors.gstType.message}</p>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-primary/10">
                  <Label className="text-base font-semibold">Customer Type</Label>
                  <Controller
                    control={control}
                    name="customerType"
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid gap-3 sm:grid-cols-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Customer" id="type-customer" />
                          <Label htmlFor="type-customer" className="font-normal cursor-pointer">Consumer / Unregistered</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Business" id="type-business" />
                          <Label htmlFor="type-business" className="font-normal cursor-pointer">Business (B2B)</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.customerType && (
                    <p className="text-sm font-medium text-destructive">{errors.customerType.message}</p>
                  )}
                </div>

                {watchCustomerType === "Business" && (
                  <div className="space-y-2 animate-in fade-in">
                    <Label htmlFor="gstNumber">Customer GST Number <span className="text-destructive">*</span></Label>
                    <Input id="gstNumber" placeholder="e.g. 29GGGGG1314R9Z6" {...register("gstNumber")} className="uppercase" />
                    {errors.gstNumber && (
                      <p className="text-sm font-medium text-destructive">{errors.gstNumber.message}</p>
                    )}
                  </div>
                )}
                
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            {watchEntryType === "Sale" ? (
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (editId ? "Updating..." : "Generating...") : (editId ? "Update Sale & Invoice" : "Generate GST Invoice")}
              </Button>
            ) : (
              <Button type="submit" size="lg" variant="secondary" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (editId ? "Updating..." : "Saving...") : (editId ? "Update Sample" : "Save Sample")}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
