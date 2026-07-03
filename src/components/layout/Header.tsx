"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, Menu, X, Home, LayoutDashboard, FilePlus, CreditCard, PieChart } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sales Entry", href: "/entry", icon: FilePlus },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Expenses", href: "/expenses", icon: PieChart },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10 flex items-center justify-center overflow-hidden">
              <Image 
                src="/logo/teal.png"
                alt="VANAMÉYA Logo"
                fill
                sizes="40px"
                className="object-contain drop-shadow-sm dark:hidden"
              />
              <Image 
                src="/logo/Logo%20White.webp"
                alt="VANAMÉYA Logo"
                fill
                sizes="40px"
                className="object-contain drop-shadow-sm hidden dark:block"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">VANAMÉYA</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground hidden sm:inline-block">Internal Portal</span>
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-background md:hidden flex flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-border/40">
             <div className="flex items-center gap-2">
               <span className="text-xl font-bold tracking-tight text-primary">VANAMÉYA</span>
             </div>
             <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
               <X size={24} />
             </button>
          </div>
          <div className="flex flex-col gap-2 p-4">
             {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                   <Link 
                     key={item.name} 
                     href={item.href} 
                     onClick={() => setIsMobileMenuOpen(false)} 
                     className={cn(
                       "flex items-center gap-4 rounded-lg px-4 py-4 text-lg font-medium transition-colors", 
                       isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                     )}
                   >
                      <item.icon size={24} />
                      {item.name}
                   </Link>
                )
             })}
          </div>
          <div className="mt-auto p-4 border-t border-border/40">
            <button 
              onClick={async () => { 
                await fetch('/api/auth/logout', { method: 'POST' }); 
                window.location.href = '/login'; 
              }} 
              className="flex w-full items-center gap-4 rounded-lg px-4 py-4 text-lg font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
               <LogOut size={24} />
               Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
