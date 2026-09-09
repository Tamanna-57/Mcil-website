"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "About Us", href: "/#about" },
  { label: "Products", href: "/#products" },
  { label: "MCIL Advantage", href: "/#advantage" },
  { label: "Investors", href: "/investors" },
  { label: "Media", href: "/#media" },
  { label: "Careers", href: "/#careers" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen
          ? "bg-steel-900/95 backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-[3vw]">
        <Link
          href="/"
          className="text-lg font-bold tracking-[0.16em] text-white uppercase"
        >
          MCIL
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] tracking-[0.08em] text-white/90 uppercase transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            aria-label="Search"
            className="cursor-pointer text-white/90 transition-colors hover:text-white"
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            className="cursor-pointer border border-white/60 px-5 py-1.5 text-[11px] tracking-[0.12em] text-white uppercase transition-colors hover:bg-white hover:text-steel-900"
          >
            English
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="cursor-pointer text-white lg:hidden"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-t border-white/10 px-6 pb-6 sm:px-10 lg:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-white/10 py-4 text-sm tracking-[0.08em] text-white/90 uppercase"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <circle cx="7.75" cy="7.75" r="5.75" />
      <path d="M12 12l4 4" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
    </svg>
  );
}
