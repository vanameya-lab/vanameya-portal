import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
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
        </div>
      </div>
    </header>
  );
}
