import { z } from "zod";
import { SALESPERSONS, PRODUCTS } from "../constants/mock-data";

export const EntryFormSchema = z.object({
  salesperson: z.enum(SALESPERSONS, {
    message: "Please select a salesperson.",
  }),
  customerName: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  sameAsBilling: z.boolean().default(true),
  shippingAddress: z.string().optional(),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal('')),
  product: z.enum(PRODUCTS, {
    message: "Please select a product.",
  }).default("Instant Dry Ginger Coffee (10gm)"),
  quantity: z.coerce.number().min(1, {
    message: "Quantity must be at least 1.",
  }),
  rate: z.coerce.number().min(0, {
    message: "Rate must be a positive number.",
  }).default(7),
  customerType: z.enum(["Customer", "Business"]).optional(),
  gstNumber: z.string().optional(),
  gstType: z.enum(["Intra-state", "Inter-state"]).optional(),
  delivery: z.enum(["Direct", "Courier"], {
    message: "Please select a delivery method.",
  }),
  courierCharge: z.coerce.number().optional(),
  chargeCourierToCustomer: z.boolean().default(true),
  entryType: z.enum(["Sale", "Sample"], {
    message: "Please select an entry type.",
  }),
  sampleQuantity: z.coerce.number().optional(),
  invoiceNumber: z.string().optional(),
}).refine((data) => {
  if (data.delivery === "Courier" && data.courierCharge !== undefined && data.courierCharge < 0) {
    return false;
  }
  return true;
}, {
  message: "Courier charge cannot be negative.",
  path: ["courierCharge"],
}).refine((data) => {
  if (data.entryType === "Sample" && (data.sampleQuantity === undefined || data.sampleQuantity < 1)) {
    return false;
  }
  return true;
}, {
  message: "Sample quantity is required when Sample is selected.",
  path: ["sampleQuantity"],
}).refine((data) => {
  if (data.entryType === "Sale" && !data.gstType) {
    return false;
  }
  return true;
}, {
  message: "Please select GST type (Intra-state / Inter-state).",
  path: ["gstType"],
}).refine((data) => {
  if (data.entryType === "Sale" && !data.customerType) {
    return false;
  }
  return true;
}, {
  message: "Please select Customer Type.",
  path: ["customerType"],
}).refine((data) => {
  if (data.entryType === "Sale" && data.customerType === "Business" && (!data.gstNumber || data.gstNumber.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "GST Number is required for Business customers.",
  path: ["gstNumber"],
}).refine((data) => {
  if (!data.sameAsBilling && (!data.shippingAddress || data.shippingAddress.length < 5)) {
    return false;
  }
  return true;
}, {
  message: "Shipping address must be at least 5 characters.",
  path: ["shippingAddress"],
});

export type EntryFormValues = z.infer<typeof EntryFormSchema>;

export interface Entry {
  id: string;
  date: string;
  salesperson: string;
  customer: string;
  product: string;
  quantity: number;
  entryType: 'Sale' | 'Sample';
}
