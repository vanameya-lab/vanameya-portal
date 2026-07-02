"use client";

import { Suspense } from "react";
import { SalesEntryForm } from "@/components/forms/SalesEntryForm";
import { useSearchParams } from "next/navigation";

function EntryPageContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId") || undefined;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">
          {editId ? "Edit Sale Details" : "Sales Entry"}
        </h2>
      </div>
      <div className="flex justify-center">
        <SalesEntryForm editId={editId} />
      </div>
    </div>
  );
}

export default function EntryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading form...</div>
      </div>
    }>
      <EntryPageContent />
    </Suspense>
  );
}
