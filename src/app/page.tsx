import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-muted/50 to-primary/5 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      
      <div className="relative z-10 w-full max-w-md space-y-6 text-center bg-background/80 backdrop-blur-xl p-8 rounded-3xl border shadow-2xl">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative h-20 w-20 flex items-center justify-center">
            <Image
              src="/logo/teal.png"
              alt="VANAMÉYA Logo"
              fill
              className="object-contain drop-shadow-sm dark:hidden"
              priority
            />
            <Image
              src="/logo/Logo%20White.webp"
              alt="VANAMÉYA Logo"
              fill
              className="object-contain drop-shadow-sm hidden dark:block"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            VANAMÉYA Portal
          </h1>
          <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
            Internal business portal for sales and sample tracking.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-4">
          <Link href="/entry" className={cn(buttonVariants({ size: "default" }), "w-full sm:w-auto shadow-md hover:shadow-lg transition-all")}>
            Open Sales Entry
          </Link>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full sm:w-auto bg-background/50 hover:bg-background/80 transition-all")}>
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
