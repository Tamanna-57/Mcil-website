"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { navItems, type NavItem, type NavLink } from "@/lib/site-nav";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpenId, setMobileOpenId] = useState<string | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  /* A short grace period on the way out: the pointer crosses a few pixels of
     header chrome between the nav row and the panel, and dropping the menu
     there would make it feel twitchy. */
  const open = useCallback((id: string) => {
    window.clearTimeout(closeTimer.current);
    setOpenId(id);
  }, []);

  const scheduleClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenId(null), 130);
  }, []);

  const closeNow = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    setOpenId(null);
  }, []);

  const openItem = navItems.find((item) => item.id === openId) ?? null;
  const solid = scrolled || menuOpen || openId !== null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "bg-steel-900/95 backdrop-blur-sm" : "bg-transparent"
      }`}
      onMouseLeave={scheduleClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") closeNow();
      }}
    >
      <div className="flex items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-[3vw]">
        <Link
          href="/"
          className="text-lg font-bold tracking-[0.16em] text-white uppercase"
          onFocus={closeNow}
        >
          MCIL
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <NavTrigger
              key={item.id}
              item={item}
              active={openId === item.id}
              onOpen={() => open(item.id)}
            />
          ))}

          <button
            type="button"
            aria-label="Search"
            onFocus={closeNow}
            className="cursor-pointer text-white/90 transition-colors hover:text-white"
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            onFocus={closeNow}
            className="cursor-pointer border border-white/60 px-5 py-1.5 text-[11px] tracking-[0.12em] text-white uppercase transition-colors hover:bg-white hover:text-steel-900"
          >
            English
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="cursor-pointer text-white lg:hidden"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Drop panel. Kept inside <header> so the pointer never leaves the
          element that owns the close timer. */}
      {openItem && (
        <div
          className="mega-panel hidden lg:block"
          onMouseEnter={() => open(openItem.id)}
        >
          <Panel item={openItem} onNavigate={closeNow} />
        </div>
      )}

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="max-h-[calc(100svh-var(--header-h))] overflow-y-auto border-t border-white/10 px-6 pb-6 sm:px-10 lg:hidden"
        >
          {navItems.map((item) => {
            const expanded = mobileOpenId === item.id;
            return (
              <div key={item.id} className="border-b border-white/10">
                <div className="flex items-center justify-between gap-4">
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 py-4 text-sm tracking-[0.08em] text-white/90 uppercase"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="flex-1 py-4 text-sm tracking-[0.08em] text-white/90 uppercase">
                      {item.label}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-label={`${expanded ? "Hide" : "Show"} ${item.label} links`}
                    onClick={() => setMobileOpenId(expanded ? null : item.id)}
                    className={`shrink-0 cursor-pointer p-2 text-xl leading-none text-white/70 transition-transform duration-300 ${
                      expanded ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </button>
                </div>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <ul className="pb-4 pl-1">
                      {item.panel.links.map((link) => (
                        <li key={link.label}>
                          <SubLink
                            link={link}
                            onNavigate={() => setMenuOpen(false)}
                            tone="dark"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      )}
    </header>
  );
}

/** Top-level item: navigates where it can, and opens its panel either way. */
function NavTrigger({
  item,
  active,
  onOpen,
}: {
  item: NavItem;
  active: boolean;
  onOpen: () => void;
}) {
  const inner = (
    <>
      {item.label}
      <span className="nav-underline" data-active={active} aria-hidden />
    </>
  );

  const className = `relative cursor-pointer pb-1.5 text-[13px] tracking-[0.08em] uppercase transition-colors ${
    active ? "text-white" : "text-white/90 hover:text-white"
  }`;

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={className}
        onMouseEnter={onOpen}
        onFocus={onOpen}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-expanded={active}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onOpen}
    >
      {inner}
    </button>
  );
}

/** Two columns: prose or figures on the light ground, links on the tint. */
function Panel({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const { title, body, figures, caption, links } = item.panel;

  return (
    <div
      className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
      role="region"
      aria-label={item.label}
    >
      <div className="bg-surface px-[3vw] py-11">
        <h2 className="type-display text-[clamp(1.5rem,2.5vw,2.2rem)] leading-tight text-steel-900">
          {title}
        </h2>
        <div className="mt-5 h-px bg-steel-900/15" />

        {figures ? (
          <dl className="mt-6">
            {figures.map((figure) => (
              <div
                key={figure.label}
                className="flex flex-wrap items-baseline gap-x-8 gap-y-1 border-b border-steel-900/10 py-3.5 last:border-b-0"
              >
                <dt className="sr-only">{figure.label}</dt>
                <dd className="type-figure w-[9.5rem] shrink-0 text-lg text-brand-deep uppercase">
                  {figure.value}
                </dd>
                <dd className="text-sm text-steel-800">{figure.label}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-6 max-w-md text-sm leading-relaxed text-steel-800">
            {body}
          </p>
        )}

        {caption && (
          <p className="mt-6 text-[11px] font-semibold tracking-[0.16em] text-accent uppercase">
            {caption}
          </p>
        )}
      </div>

      <div className="bg-background px-[3vw] py-11">
        <ul className="grid gap-x-[3vw] sm:grid-cols-2">
          {links.map((link, i) => (
            <li
              key={link.label}
              className={
                i % 2 === 1
                  ? "sm:border-l sm:border-steel-900/10 sm:pl-[3vw]"
                  : ""
              }
            >
              <SubLink link={link} onNavigate={onNavigate} tone="light" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SubLink({
  link,
  onNavigate,
  tone,
}: {
  link: NavLink;
  onNavigate: () => void;
  tone: "light" | "dark";
}) {
  const dark = tone === "dark";
  const row = dark
    ? "flex items-center justify-between gap-3 py-2.5 text-sm"
    : "flex items-center justify-between gap-3 border-b py-4 text-base";
  const rule = dark ? "" : "border-steel-900/12";

  if (link.soon || !link.href) {
    return (
      <span
        className={`${row} ${rule} ${dark ? "text-white/40" : "text-steel-800/45"}`}
      >
        {link.label}
        <span className="rounded-full border border-current px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em] uppercase">
          Soon
        </span>
      </span>
    );
  }

  const className = `${row} ${rule} transition-colors ${
    dark
      ? "text-white/70 hover:text-white"
      : "text-steel-900 hover:text-brand-deep"
  }`;

  if (link.external) {
    return (
      <a href={link.href} className={className} onClick={onNavigate}>
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className} onClick={onNavigate}>
      {link.label}
    </Link>
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
