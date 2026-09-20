"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  customers as defaultCustomers,
  customersHeading,
  type Customer,
} from "@/lib/customers";

/**
 * Customers: one plate, a centred heading, and the names laid out across it.
 *
 * The plate carries a faint measured grid with a small cross at each of its
 * corners — the drawing-sheet device the reference uses, which suits a rolling
 * mill better than it does most places it is borrowed for. Everything on it is
 * set in one grey, so eleven names of different lengths read as a row of marks
 * rather than a list, and each cell lifts to the full ink on hover.
 *
 * Cells are a centred wrap rather than a fixed grid: eleven names do not
 * divide into any column count, and a wrap leaves the short last row centred
 * under the rest instead of hanging off one edge.
 */
export default function Customers({
  eyebrow = customersHeading.eyebrow,
  title = customersHeading.title,
  standfirst = customersHeading.standfirst,
  footnote = customersHeading.footnote,
  items = defaultCustomers,
}: {
  eyebrow?: string;
  title?: string;
  standfirst?: string;
  footnote?: string;
  items?: Customer[];
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  /* Held until the band is reached, in step with the other sections. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="customers"
      className="bg-background px-6 py-20 sm:px-10 lg:px-[6.5vw] lg:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="customer-plate relative overflow-hidden rounded-3xl px-6 py-14 sm:px-10 sm:py-16">
          <Corners />

          <header className="relative mx-auto max-w-3xl text-center">
            <p
              className="hl-reveal text-[11px] font-semibold tracking-[0.24em] text-accent uppercase"
              data-visible={visible}
            >
              [ {eyebrow} ]
            </p>
            <h2
              className="hl-reveal type-display mt-4 text-[clamp(1.35rem,3.2vw,2.1rem)] leading-[1.18] text-steel-900 uppercase"
              data-visible={visible}
              style={{ animationDelay: "80ms" }}
            >
              {title}
            </h2>
            <p
              className="hl-reveal mt-5 text-sm leading-relaxed text-steel-800 sm:text-base"
              data-visible={visible}
              style={{ animationDelay: "160ms" }}
            >
              {standfirst}
            </p>
          </header>

          {/* Four across at desktop width: eleven names then fall 4-4-3, so
              the short row still sits centred under two full ones rather than
              leaving a single name stranded. */}
          <ul className="relative mt-12 flex flex-wrap justify-center gap-x-6 gap-y-10 sm:mt-14 sm:gap-x-10">
            {items.map((customer, i) => (
              <li
                key={customer.id}
                className="hl-reveal flex w-[calc(50%-0.75rem)] justify-center sm:w-[calc(33.333%-1.667rem)] lg:w-[calc(25%-1.875rem)]"
                data-visible={visible}
                style={{ animationDelay: `${240 + i * 60}ms` }}
              >
                <Mark customer={customer} />
              </li>
            ))}
          </ul>

          {footnote ? (
            <p
              className="hl-reveal relative mt-12 text-center text-[11px] leading-relaxed text-steel-800/55"
              data-visible={visible}
              style={{ animationDelay: `${240 + items.length * 60}ms` }}
            >
              {footnote}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * One customer.
 *
 * Supplied artwork is printed at a fixed height and left to find its own width
 * — logos differ wildly in proportion, and matching their widths instead would
 * shrink a long wordmark to nothing beside a square mark. Anything without
 * artwork is set in type on the same baseline, so a band that is half pictures
 * and half wordmarks still lines up.
 */
function Mark({ customer }: { customer: Customer }) {
  const { name, mark, suffix, font, logo, logoAlt } = customer;

  return (
    <span
      title={name}
      className="customer-mark flex h-11 items-center justify-center"
    >
      {logo ? (
        <Image
          src={logo}
          alt={logoAlt ?? name}
          width={200}
          height={80}
          className="h-full w-auto object-contain"
        />
      ) : (
        <span
          className={`flex items-baseline gap-1.5 whitespace-nowrap ${
            font === "display" ? "type-display" : ""
          }`}
        >
          <span
            className={
              font === "display"
                ? "text-[clamp(1.05rem,2.4vw,1.5rem)] font-medium tracking-[0.12em]"
                : "text-[clamp(1rem,2.2vw,1.32rem)] font-bold tracking-[0.02em]"
            }
          >
            {mark}
          </span>
          {suffix ? (
            <span className="text-[clamp(0.62rem,1.4vw,0.76rem)] font-light tracking-[0.22em]">
              {suffix}
            </span>
          ) : null}
        </span>
      )}
    </span>
  );
}

/** The four corner crosses that make the plate read as a measured sheet. */
function Corners() {
  const positions = [
    "top-4 left-4",
    "top-4 right-4",
    "bottom-4 left-4",
    "bottom-4 right-4",
  ];

  return (
    <>
      {positions.map((position) => (
        <span
          key={position}
          aria-hidden
          className={`absolute ${position} text-steel-900/20`}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M5.5 0v11M0 5.5h11"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </span>
      ))}
    </>
  );
}
