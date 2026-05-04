"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navbarLinksList, NavProps } from "@/config/nav";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useAuthStore } from "@/store/authStore";
const { title } = siteConfig;

export const MobileNavFragment = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="px-2">
        <Menu
          className="flex md:hidden h-5 w-5"
          onClick={() => setIsOpen(true)}
        >
          {/* <span className="sr-only">Menu Icon</span> */}
        </Menu>
      </SheetTrigger>

      <SheetContent side={"left"}>
        <SheetHeader>
          <SheetTitle className="font-bold text-xl">{title}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col justify-center items-center gap-2 mt-4">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className={buttonVariants({ variant: "ghost" })}
          >
            Dashboard
          </Link>
          {navbarLinksList.map(({ href, label }: NavProps) => (
            <Link
              key={label}
              href={href}
              onClick={() => setIsOpen(false)}
              className={buttonVariants({ variant: "ghost" })}
            >
              {label}
            </Link>
          ))}
          <Link
            href={siteConfig.links.github}
            target="_blank"
            className={`w-[110px] border ${buttonVariants({
              variant: "secondary",
            })}`}
          >
            <GitHubLogoIcon className="mr-2 w-5 h-5" />
            Github
          </Link>
          <MobileUserNav setIsOpen={setIsOpen} />
        </nav>
      </SheetContent>
    </Sheet>
  );
};

const MobileUserNav = ({ setIsOpen }: { setIsOpen: (open: boolean) => void }) => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        onClick={() => setIsOpen(false)}
        className={`w-[110px] ${buttonVariants({ variant: "default" })}`}
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full mt-2 border-t pt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
          {user?.initials}
        </div>
        <span className="text-sm font-medium">{user?.full_name}</span>
      </div>
      <Button
        variant="ghost"
        className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={() => {
          document.cookie = "fudd-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          logout();
          setIsOpen(false);
          router.push("/login");
        }}
      >
        Log out
      </Button>
    </div>
  );
};
