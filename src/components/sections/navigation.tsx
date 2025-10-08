"use client";

import * as React from "react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { Menu, X, User, LifeBuoy } from "lucide-react";

const logoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bed331a4-4ee3-449f-84a7-36725a6dadf3-timetoreply-com/assets/svgs/timetoreply-logo-1.svg?";

const navItems = [
  { title: "Features", href: "https://info.timetoreply.com/features" },
  { title: "Pricing", href: "https://timetoreply.com/pricing/" },
  { title: "Platforms", children: [
      { title: "Outlook", href: "https://timetoreply.com/email-analytics-for-outlook-and-o365/" },
      { title: "Gmail", href: "https://timetoreply.com/email-analytics-for-gmail/" },
    ],
  },
  { title: "Who's it for", children: [
      { title: "Insurance", href: "https://timetoreply.com/email-analytics-for-insurance-companies/" },
      { title: "Corporate Travel", href: "https://timetoreply.com/email-analytics-for-mid-market-large-corporate-travel-companies/" },
      { title: "Property Management", href: "https://timetoreply.com/email-analytics-for-large-property-management-companies/" },
      { title: "Professional Services", href: "https://timetoreply.com/email-analytics-for-leading-professional-services-companies/" },
      { title: "Legal Services", href: "https://timetoreply.com/email-analytics-for-leading-legal-services-companies/" },
      { title: "Logistics", href: "https://timetoreply.com/logistics-outbound/" },
      { title: "Manufacturing", href: "https://timetoreply.com/email-analytics-for-manufacturing-companies/" },
    ],
  },
  { title: "Resources", children: [
      { title: "Case Studies", href: "https://timetoreply.com/case-studies/" },
      { title: "Guides", href: "https://timetoreply.com/guides/" },
      { title: "Blog", href: "https://timetoreply.com/blog/" },
      { title: "Integrations", href: "https://timetoreply.com/integrations/" },
      { title: "FAQs", href: "https://timetoreply.com/quick-email-responses-faq/" },
      { title: "Trust Center", href: "https://timetoreply.com/security/" },
      { title: "Help Centre", href: "https://help.timetoreply.com/" },
    ],
  },
  { title: "Lite", href: "https://timetoreply.com/lite/" },
];

import { useSession } from "@/lib/auth-client";
import SignOutButton from "@/components/auth/SignOutButton";

const Navigation = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="bg-background font-sans w-full">
      <div className="container mx-auto flex h-24 items-center justify-between relative">
        <a href="https://timetoreply.com" className="flex-shrink-0">
          <Image src={logoUrl} alt="timetoreply" width={180} height={32} priority />
        </a>

        <div className="hidden lg:flex justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.children ? (
                    <>
                      <NavigationMenuTrigger className="bg-transparent font-semibold text-primary-dark text-base hover:text-primary focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-4 w-[250px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.children.map((child) => (
                            <ListItem key={child.title} href={child.href} title={child.title} />
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink href={item.href} className={cn(navigationMenuTriggerStyle(), "bg-transparent font-semibold text-primary-dark text-base hover:text-primary focus:bg-transparent")}>
                      {item.title}
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center">
          <div className="hidden lg:flex items-center space-x-5">
            {session?.user ? (
              <>
                <a href="/dashboard" className="text-xs font-bold text-primary-dark hover:text-primary transition-colors uppercase tracking-wider">
                  Dashboard
                </a>
                <a href="/account" className="text-xs font-bold text-primary-dark hover:text-primary transition-colors uppercase tracking-wider">
                  Cuenta
                </a>
                <SignOutButton />
              </>
            ) : (
              <>
                <a href="/login" className="flex items-center space-x-1.5 text-xs font-bold text-primary-dark hover:text-primary transition-colors uppercase tracking-wider">
                  <User size={16} />
                  <span>Login</span>
                </a>
                <a href="https://help.timetoreply.com" className="flex items-center space-x-1.5 text-xs font-bold text-primary-dark hover:text-primary transition-colors uppercase tracking-wider">
                  <LifeBuoy size={16} />
                  <span>Support</span>
                </a>
                <Button asChild className="font-semibold text-base py-3 px-5 h-auto rounded-lg border-2 border-primary-dark bg-transparent text-primary-dark hover:bg-primary-dark hover:text-white transition-colors" variant="outline">
                  <a href="/register">Try Free</a>
                </Button>
                <Button asChild className="bg-primary text-primary-foreground font-semibold text-base py-3 px-5 h-auto rounded-lg hover:bg-primary/90 transition-colors border-2 border-primary">
                  <a href="https://info.timetoreply.com/book-demo">Book Demo</a>
                </Button>
              </>
            )}
          </div>

          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-8 w-8 text-primary-dark" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-xs bg-background p-0 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <a href="https://timetoreply.com" onClick={() => setMobileMenuOpen(false)}>
                    <Image src={logoUrl} alt="timetoreply" width={150} height={26} />
                  </a>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-6 w-6 text-primary-dark" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Accordion type="single" collapsible className="w-full">
                    {navItems.map((item) => item.children ? (
                      <AccordionItem value={item.title} key={item.title} className="border-b px-4">
                        <AccordionTrigger className="py-4 font-semibold text-primary-dark text-base hover:no-underline">{item.title}</AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <ul className="space-y-1">
                            {item.children.map((child) => (
                              <li key={child.title}>
                                <a href={child.href} className="block pl-4 py-2 text-muted-foreground hover:text-primary-dark" onClick={() => setMobileMenuOpen(false)}>
                                  {child.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <a key={item.title} href={item.href} className="block py-4 px-4 font-semibold text-primary-dark text-base border-b" onClick={() => setMobileMenuOpen(false)}>
                        {item.title}
                      </a>
                    ))}
                  </Accordion>
                </div>
                <div className="p-4 border-t space-y-3">
                  {session?.user ? (
                    <>
                      <Button asChild className="w-full bg-primary text-primary-foreground font-semibold" onClick={() => setMobileMenuOpen(false)}>
                        <a href="/dashboard">Dashboard</a>
                      </Button>
                      <Button asChild className="w-full" variant="outline" onClick={() => setMobileMenuOpen(false)}>
                        <a href="/account">Cuenta</a>
                      </Button>
                      <div className="pt-2">
                        <SignOutButton />
                      </div>
                    </>
                  ) : (
                    <>
                      <Button asChild className="w-full bg-primary text-primary-foreground font-semibold">
                        <a href="https://info.timetoreply.com/book-demo">Book Demo</a>
                      </Button>
                      <Button asChild className="w-full" variant="outline">
                        <a href="/register">Try Free</a>
                      </Button>
                      <div className="flex justify-around pt-2">
                        <a href="/login" className="flex items-center space-x-1 text-sm font-bold text-primary-dark hover:text-primary transition-colors uppercase" onClick={() => setMobileMenuOpen(false)}>
                          <User size={16} />
                          <span>Login</span>
                        </a>
                        <a href="https://help.timetoreply.com" className="flex items-center space-x-1 text-sm font-bold text-primary-dark hover:text-primary transition-colors uppercase" onClick={() => setMobileMenuOpen(false)}>
                          <LifeBuoy size={16} />
                          <span>Support</span>
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none text-primary-dark">{title}</div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default Navigation;