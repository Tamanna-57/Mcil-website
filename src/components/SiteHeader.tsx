"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { navItems, type NavItem, type NavLink } from "@/lib/site-nav";

/* Pages that open on a light ground rather than a dark hero. The bar's
   transparent state paints white type for a photograph to sit behind; on these
   the glass is on from the first pixel instead. */
const LIGHT_TOP_ROUTES = ["/contact"];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpenId, setMobileOpenId] = useState<string | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  /*
   * The drop panel stays mounted while it is open, so moving between nav items
   * used to swap its children with nothing in between — the box never moved and
   * only the words changed, which is what made it read as a glitch rather than
   * a transition.
   *
   * Three pieces of state instead of one:
   *   openId    — which item the pointer is on; null closes the panel
   *   shownId   — what is drawn, which outlives openId so the panel can
   *               collapse with its content still in it
   *   leavingId — the panel being replaced, kept for one beat so the two
   *               cross-fade instead of cutting
   */
  const [shownId, setShownId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const openIdRef = useRef<string | null>(null);
  const swapTimer = useRef<number | undefined>(undefined);
  const clearTimer = useRef<number | undefined>(undefined);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  /* The open panel's own height drives the container, so switching between a
     panel of prose and a panel of figures eases between the two rather than
     jumping. */
  const measurePanel = useCallback((node: HTMLDivElement | null) => {
    resizeObserver.current?.disconnect();
    resizeObserver.current = null;
    if (!node) return;

    setPanelHeight(node.offsetHeight);
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.borderBoxSize?.[0];
      setPanelHeight(box ? box.blockSize : entries[0].contentRect.height);
    });
    observer.observe(node);
    resizeObserver.current = observer;
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(closeTimer.current);
      window.clearTimeout(swapTimer.current);
      window.clearTimeout(clearTimer.current);
      resizeObserver.current?.disconnect();
    },
    [],
  );

  const open = useCallback((id: string) => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(clearTimer.current);

    const current = openIdRef.current;
    if (current === id) return;

    /* Moving between two open panels: hold the old one for the length of the
       cross-fade so it can fade out under the new one. */
    if (current !== null) {
      setLeavingId(current);
      window.clearTimeout(swapTimer.current);
      swapTimer.current = window.setTimeout(() => setLeavingId(null), 300);
    }

    openIdRef.current = id;
    setOpenId(id);
    setShownId(id);
  }, []);

  /* Closing keeps the content mounted until the panel has finished collapsing;
     clearing it immediately would empty the box on the way down. */
  const startClose = useCallback(() => {
    openIdRef.current = null;
    setOpenId(null);
    setLeavingId(null);
    window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => {
      setShownId(null);
      /* Back to nothing, so the next open grows from zero rather than popping
         straight to the height the last panel happened to have. */
      setPanelHeight(0);
    }, 460);
  }, []);

  /* A short grace period on the way out: the pointer crosses a few pixels of
     header chrome between the nav row and the panel, and dropping the menu
     there would make it feel twitchy. */
  const scheduleClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(startClose, 130);
  }, [startClose]);

  const closeNow = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    startClose();
  }, [startClose]);

  const pathname = usePathname();
  const lightTop = LIGHT_TOP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const openItem = navItems.find((item) => item.id === openId) ?? null;
  const shownItem = navItems.find((item) => item.id === shownId) ?? null;
  const leavingItem = navItems.find((item) => item.id === leavingId) ?? null;
  const solid = lightTop || scrolled || menuOpen || openId !== null;

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "site-header--glass" : "bg-transparent"
      } ${menuOpen ? "site-header--sheet" : ""}`}
      onMouseLeave={scheduleClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") closeNow();
      }}
    >
      <div className="flex items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-[3vw]">
        <Link
          href="/"
          className="text-lg font-bold tracking-[0.16em] text-[color:var(--nav-ink)] uppercase transition-colors duration-300"
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
            className="cursor-pointer text-[color:var(--nav-ink-soft)] transition-colors hover:text-[color:var(--nav-ink)]"
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            onFocus={closeNow}
            className="cursor-pointer border border-[color:var(--nav-line)] px-5 py-1.5 text-[11px] tracking-[0.12em] text-[color:var(--nav-ink)] uppercase transition-colors hover:bg-[color:var(--nav-hover-ground)] hover:text-[color:var(--nav-hover-ink)]"
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
          className="cursor-pointer text-[color:var(--nav-ink)] transition-colors duration-300 lg:hidden"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Drop panel. Kept inside <header> so the pointer never leaves the
          element that owns the close timer. */}
      {shownItem && (
        <div
          className="mega-panel hidden lg:block"
          data-open={openItem !== null}
          style={{ height: openItem ? panelHeight : 0 }}
          onMouseEnter={() => openItem && open(openItem.id)}
        >
          <div className="mega-stack">
            {leavingItem && (
              <div className="mega-layer mega-layer--out" aria-hidden>
                <Panel item={leavingItem} onNavigate={closeNow} />
              </div>
            )}
            <div
              key={shownItem.id}
              ref={measurePanel}
              className="mega-layer mega-layer--in"
            >
              <Panel item={shownItem} onNavigate={closeNow} />
            </div>
          </div>
        </div>
      )}

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="max-h-[calc(100svh-var(--header-h))] overflow-y-auto border-t border-[color:var(--nav-rule)] px-6 pb-6 sm:px-10 lg:hidden"
        >
          {navItems.map((item) => {
            const expanded = mobileOpenId === item.id;
            return (
              <div
                key={item.id}
                className="border-b border-[color:var(--nav-rule)]"
              >
                <div className="flex items-center justify-between gap-4">
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 py-4 text-sm tracking-[0.08em] text-[color:var(--nav-ink)] uppercase"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="flex-1 py-4 text-sm tracking-[0.08em] text-[color:var(--nav-ink)] uppercase">
                      {item.label}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-label={`${expanded ? "Hide" : "Show"} ${item.label} links`}
                    onClick={() => setMobileOpenId(expanded ? null : item.id)}
                    className={`shrink-0 cursor-pointer p-2 text-xl leading-none text-[color:var(--nav-ink-soft)] transition-transform duration-300 ${
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
                            tone="bar"
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
    active
      ? "text-[color:var(--nav-ink)]"
      : "text-[color:var(--nav-ink-soft)] hover:text-[color:var(--nav-ink)]"
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
      <div className="mega-face mega-face--lead px-[3vw] py-11">
        <h2 className="type-display text-[clamp(1.5rem,2.5vw,2.2rem)] leading-tight text-steel-900">
          {title}
        </h2>
        <div className="mt-5 h-px bg-steel-900/20" />

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

      <div className="mega-face mega-face--links px-[3vw] py-11">
        <ul className="grid gap-x-[3vw] sm:grid-cols-2">
          {links.map((link, i) => (
            <li
              key={link.label}
              className={
                i % 2 === 1 ? "mega-divider sm:border-l sm:pl-[3vw]" : ""
              }
            >
              <SubLink link={link} onNavigate={onNavigate} tone="panel" />
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
  tone: "panel" | "bar";
}) {
  const bar = tone === "bar";
  const row = bar
    ? "flex items-center justify-between gap-3 py-2.5 text-sm"
    : "flex items-center justify-between gap-3 border-b py-4 text-base";
  const rule = bar ? "" : "border-steel-900/12";

  if (link.soon || !link.href) {
    return (
      <span
        className={`${row} ${rule} ${bar ? "opacity-45" : "text-steel-800/45"}`}
      >
        {link.label}
        <span className="rounded-full border border-current px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em] uppercase">
          Soon
        </span>
      </span>
    );
  }

  const className = `${row} ${rule} transition-colors ${
    bar
      ? "text-[color:var(--nav-ink-soft)] hover:text-[color:var(--nav-ink)]"
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
