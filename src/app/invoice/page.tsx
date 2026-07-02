"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate";
import { type EntryFormValues } from "@/types";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function InvoicePageContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<EntryFormValues | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const dataParam = searchParams.get("data");
      if (dataParam) {
        const decoded = JSON.parse(atob(decodeURIComponent(dataParam)));
        setData(decoded);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to parse invoice data", err);
      setError(true);
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Invalid Invoice Data</h1>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading invoice...</div>
      </div>
    );
  }

  return <InvoiceTemplate data={data} />;
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <InvoicePageContent />
    </Suspense>
  );
}
