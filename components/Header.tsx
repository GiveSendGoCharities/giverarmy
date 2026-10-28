"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { primaryNav, site } from "@/lib/site";
import { links, PRICE_LABEL } from "@/lib/links";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-cool-100/70 bg-cream-warm/85 backdrop-blur-md supports-[backdrop-filter]:bg-cream-warm/70">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label={`${site.name} home`}
          onClick={() => setOpen(false)}
        >
          <Logo variant="dark" className="h-7 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label="Primary"
        >
          {primaryNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-semibold transition hover:text-gold-deep ${
                  active ? "text-gold-deep" : "text-slate-base"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={links.join}
            className="btn-gold hidden px-5 py-2.5 text-sm sm:inline-flex"
          >
            Join — {PRICE_LABEL}
          </a>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cool-200 text-slate-base md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-t border-cool-100 bg-cream-warm md:hidden"
        >
          <div className="container-page flex flex-col gap-1 py-4">
            {primaryNav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-3 text-base font-semibold ${
                    active
                      ? "bg-white text-gold-deep"
                      : "text-slate-base hover:bg-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={links.join}
              className="btn-gold mt-2 w-full"
            >
              Join the Army — {PRICE_LABEL}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
