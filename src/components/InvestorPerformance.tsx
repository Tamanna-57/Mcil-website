"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  BAR_STAGGER,
  PER_SHARE_METRICS,
  performanceHeading,
  performanceMetrics,
  USD_MN_PER_INR_CR,
  type MetricKind,
  type PerformanceMetric,
} from "@/lib/investor-performance";

type Currency = "inr" | "usd";

export default function InvestorPerformance() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [metricId, setMetricId] = useState(performanceMetrics[0].id);
  const [currency, setCurrency] = useState<Currency>("inr");
  const groupName = useId();

  /* Bars stay at zero height until the chart is on screen, so the growth is
     seen rather than missed. */
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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const metric =
    performanceMetrics.find((m) => m.id === metricId) ?? performanceMetrics[0];

  /* Headroom above the tallest bar so its label never crowds the card edge. */
  const scaleMax = useMemo(
    () => Math.max(...metric.points.map((p) => p.value)) * 1.08,
    [metric],
  );

  /* One decimal setting for the whole series — mixing "26.7 Cr" with "34 Cr"
     down the same axis reads as a mistake. */
  /* One decimal setting for the whole series — mixing "26.7 Cr" with "34 Cr"
     down the same axis reads as a mistake — but only as many places as the
     series actually needs, so whole-crore years are not padded to "94.00". */
  const decimals = useMemo(
    () =>
      Math.max(
        ...metric.points.map((p) => {
          const frac = String(p.value).split(".")[1];
          return frac ? Math.min(frac.length, 2) : 0;
        }),
      ),
    [metric],
  );

  return (
    <section
      ref={sectionRef}
      id="performance"
      className="flex min-h-[100svh] flex-col justify-center bg-background px-6 py-20 sm:px-10 lg:px-[6.5vw]"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="text-center">
          <h2 className="type-display text-[clamp(1.7rem,5.4vw,3.9rem)] leading-[1.15] text-steel-900 uppercase">
            {performanceHeading.title}
          </h2>
          <p className="mt-4 text-sm tracking-[0.04em] text-steel-800 sm:text-base">
            {performanceHeading.standfirst}
          </p>
        </header>

        <fieldset className="mt-10 flex items-center justify-center gap-7 lg:justify-end">
          <legend className="sr-only">Currency</legend>
          {(
            [
              ["inr", "In Rupees"],
              ["usd", "In Dollars"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-steel-900 sm:text-base"
            >
              <input
                type="radio"
                name={groupName}
                value={value}
                checked={currency === value}
                onChange={() => setCurrency(value)}
                className="peer sr-only"
              />
              <span className="perf-radio" aria-hidden />
              {label}
            </label>
          ))}
        </fieldset>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-14">
          <div role="tablist" aria-label="Metric" className="self-start">
            {performanceMetrics.map((m) => {
              const active = m.id === metric.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMetricId(m.id)}
                  className={`block w-full cursor-pointer border-b border-steel-900/12 py-4 text-left text-sm font-semibold tracking-[0.08em] uppercase transition-colors sm:text-base ${
                    active
                      ? "text-brand-deep"
                      : "text-steel-900/80 hover:text-steel-900"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <Chart
            metric={metric}
            currency={currency}
            scaleMax={scaleMax}
            decimals={decimals}
            perShare={PER_SHARE_METRICS.has(metric.id)}
            visible={visible}
          />
        </div>

        <p className="mt-8 text-center text-xs text-steel-800/70 lg:text-right">
          FY2025-26 as reported; earlier years from the published annual profit
          and loss.
          {currency === "usd"
            ? ` Converted at US$${USD_MN_PER_INR_CR} mn per ₹1 crore.`
            : ""}
        </p>
      </div>
    </section>
  );
}

function Chart({
  metric,
  currency,
  scaleMax,
  decimals,
  perShare,
  visible,
}: {
  metric: PerformanceMetric;
  currency: Currency;
  scaleMax: number;
  decimals: number;
  perShare: boolean;
  visible: boolean;
}) {
  return (
    <div className="rounded-2xl bg-surface px-4 pt-8 pb-5 ring-1 ring-steel-900/12 sm:px-8 sm:pt-10">
      <div
        className="flex h-[15rem] items-end gap-2 sm:h-[18rem] sm:gap-6 lg:h-[20rem]"
        role="img"
        aria-label={`${metric.label} by financial year, ${metric.points
          .map(
            (p) =>
              `FY${p.year}: ${format(p.value, metric.kind, currency, decimals, perShare)}`,
          )
          .join(", ")}`}
      >
        {metric.points.map((point, i) => (
          <div
            key={point.year}
            className="flex h-full flex-1 flex-col justify-end"
          >
            <span
              className="perf-label mb-2 text-center text-[11px] whitespace-nowrap text-steel-900 sm:text-sm"
              data-visible={visible}
              style={{ transitionDelay: `${i * BAR_STAGGER + 260}ms` }}
            >
              {format(point.value, metric.kind, currency, decimals, perShare)}
            </span>
            <div
              className="perf-bar mx-auto w-full max-w-[3.25rem] sm:max-w-[4.5rem]"
              style={{
                height: visible ? `${(point.value / scaleMax) * 100}%` : "0%",
                transitionDelay: `${i * BAR_STAGGER}ms`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-0 border-t border-steel-900/20" />

      <div className="flex gap-2 sm:gap-6">
        {metric.points.map((point) => (
          <span
            key={point.year}
            className="flex-1 pt-3 text-center text-xs font-semibold text-steel-900 sm:text-sm"
          >
            {point.year}
          </span>
        ))}
      </div>
    </div>
  );
}

function format(
  value: number,
  kind: MetricKind,
  currency: Currency,
  decimals: number,
  perShare = false,
) {
  const fixed = (v: number, d: number, locale: string) =>
    v.toLocaleString(locale, {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });

  if (kind === "percent") return `${fixed(value, decimals, "en-IN")}%`;

  /* EPS is a per-share amount, so it neither carries "Cr" nor converts. */
  if (perShare) return `₹ ${fixed(value, 2, "en-IN")}`;

  if (currency === "usd") {
    /* Conversion shrinks the figures by an order of magnitude, so they need a
       decimal place the rupee series does not. */
    const usd = value * USD_MN_PER_INR_CR;
    return `$ ${fixed(usd, usd < 100 ? 1 : 0, "en-US")} Mn`;
  }

  return `${fixed(value, decimals, "en-IN")} Cr`;
}
