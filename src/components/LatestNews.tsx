"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  newsHeading,
  newsItems,
  socialChannel,
  socialPosts,
  type NewsItem,
  type SocialPost,
} from "@/lib/latest-news";

/**
 * Latest News: one tall social feed on the left, news cards stacked to its
 * right.
 *
 * The cards are split down the middle — photograph one half, copy the other —
 * and the photograph swaps sides card by card, so the two halves of the column
 * mirror each other. Below `lg` the feed drops under the cards and each card
 * stacks its photograph above its copy, which is the only way the two-line
 * headline still fits at phone width.
 *
 * Copy lives in `src/lib/latest-news.ts`; nothing here is hard-coded.
 */

/**
 * Colourway.
 *
 * The section sits between a near-white page and the navy footer, so the cards
 * are the one thing here with a ground of their own. Cards alternate between
 * two tones — the reference runs a darker card above a lighter one — and the
 * feed carries the lighter of the two so it reads as a panel rather than a
 * third card.
 */
type Scheme = {
  /** Card grounds, applied in order and repeated. */
  cards: [string, string];
  /** Text on a card. */
  card: {
    eyebrow: string;
    title: string;
    link: string;
    date: string;
  };
  /** The feed panel. */
  feed: {
    panel: string;
    rule: string;
    avatar: string;
    name: string;
    meta: string;
    body: string;
    frame: string;
  };
};

const SCHEMES: Record<string, Scheme> = {
  /* Ink and sand: a warm near-black against a pale sand card, both lifted off
     the page rather than continuing the navy of the chrome. */
  ink: {
    cards: ["news-ink", "news-sand"],
    card: {
      eyebrow: "text-accent",
      title: "text-white",
      link: "text-accent",
      date: "text-white/55",
    },
    feed: {
      panel: "news-ink",
      rule: "border-white/10",
      avatar: "bg-white/10",
      name: "text-white",
      meta: "text-white/45",
      body: "text-white/75",
      frame: "ring-white/10",
    },
  },
  /* Teal: a deep slate-teal, the accent's near opposite and the furthest of
     the three from the navy of the header and footer. */
  teal: {
    cards: ["news-teal", "news-sand"],
    card: {
      eyebrow: "text-accent",
      title: "text-white",
      link: "text-accent",
      date: "text-white/55",
    },
    feed: {
      panel: "news-teal",
      rule: "border-white/10",
      avatar: "bg-white/10",
      name: "text-white",
      meta: "text-white/45",
      body: "text-white/75",
      frame: "ring-white/10",
    },
  },
  /* Paper: white cards on the page's own ground, navy type, the warm accent
     doing the work the dark ground used to. */
  paper: {
    cards: ["news-paper", "news-paper"],
    card: {
      eyebrow: "text-brand-deep",
      title: "text-steel-900",
      link: "text-accent",
      date: "text-steel-800/70",
    },
    feed: {
      panel: "news-paper",
      rule: "border-steel-900/10",
      avatar: "bg-brand-pale",
      name: "text-steel-900",
      meta: "text-steel-800/60",
      body: "text-steel-800",
      frame: "ring-steel-900/10",
    },
  },
};

export default function LatestNews({
  heading = newsHeading,
  items = newsItems,
  channel = socialChannel,
  posts = socialPosts,
  scheme = "ink",
}: {
  heading?: typeof newsHeading;
  items?: NewsItem[];
  channel?: typeof socialChannel;
  posts?: SocialPost[];
  scheme?: keyof typeof SCHEMES;
}) {
  const tone = SCHEMES[scheme] ?? SCHEMES.ink;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  /* Same hold-until-seen as the other sections: the column rises in as you
     reach it rather than having already played. */
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
      id="news"
      aria-label={heading.label}
      className="bg-background px-6 py-20 sm:px-10 lg:px-[6.5vw] lg:py-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h2
          className="hl-reveal type-display text-center text-[clamp(1.5rem,4vw,2.6rem)] leading-[1.15] text-steel-900 uppercase"
          data-visible={visible}
        >
          {heading.title}
        </h2>

        {/* The feed is the narrower column; the cards take the rest. */}
        <div className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-stretch">
          <Feed channel={channel} posts={posts} tone={tone} visible={visible} />

          <div className="flex flex-col gap-4">
            {items.map((item, i) => (
              <Card
                key={item.id}
                item={item}
                tone={tone}
                ground={tone.cards[i % tone.cards.length]}
                /* Odd cards carry the photograph on the right. */
                flipped={i % 2 === 1}
                index={i}
                visible={visible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({
  item,
  tone,
  ground,
  flipped,
  index,
  visible,
}: {
  item: NewsItem;
  tone: Scheme;
  ground: string;
  flipped: boolean;
  index: number;
  visible: boolean;
}) {
  /* A card on a pale ground carries its type in navy; the tone map's card
     colours are written for the dark ground, so the pale one overrides them. */
  const pale = ground === "news-sand" || ground === "news-paper";
  const text = pale
    ? {
        /* The copper the accent is cut from, dark enough to carry small type —
           the accent itself is a decorative tint and too pale to read here. */
        eyebrow: "text-[var(--accent-ink)]",
        title: "text-steel-900",
        link: "text-[var(--accent-ink)]",
        date: "text-steel-800/70",
      }
    : tone.card;

  return (
    <article
      className={`hl-reveal group relative grid overflow-hidden rounded-2xl sm:grid-cols-2 ${ground}`}
      data-visible={visible}
      style={{ animationDelay: `${200 + index * 110}ms` }}
    >
      <div
        className={`relative h-44 sm:h-full sm:min-h-[15.5rem] ${
          flipped ? "sm:order-2" : ""
        }`}
      >
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-col p-6 sm:p-8">
        <p
          className={`text-[10px] font-semibold tracking-[0.24em] uppercase ${text.eyebrow}`}
        >
          {item.category}
        </p>

        <h3
          className={`mt-4 font-display text-base leading-snug font-light sm:text-lg ${text.title}`}
        >
          {/* The whole card is the link; the headline carries it so the
              accessible name is the headline itself. */}
          <a
            href={item.href}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {item.title}
          </a>
        </h3>

        <span
          className={`mt-4 inline-flex w-fit items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase ${text.link}`}
        >
          Read more
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden>
            <path
              d="M0 4h12M9 1l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-[2px]"
            />
          </svg>
        </span>

        <time
          dateTime={item.date}
          className={`mt-auto pt-6 text-xs italic ${text.date}`}
        >
          {item.dateLabel}
        </time>
      </div>
    </article>
  );
}

function Feed({
  channel,
  posts,
  tone,
  visible,
}: {
  channel: typeof socialChannel;
  posts: SocialPost[];
  tone: Scheme;
  visible: boolean;
}) {
  const feed = tone.feed;

  return (
    /* On lg the panel is taken out of flow so the row's height is set by the
       cards beside it, and the feed fills whatever that comes to — the feed is
       the longer column, and left in flow it would stretch the row to its own
       content. Below lg it sits in flow under its own capped height. */
    <div className="relative">
      <div
        className={`hl-reveal flex max-h-[30rem] flex-col overflow-hidden rounded-2xl lg:absolute lg:inset-0 lg:max-h-none ${feed.panel}`}
        data-visible={visible}
        style={{ animationDelay: "120ms" }}
      >
        <div
          className={`flex items-center gap-3 border-b px-5 py-4 ${feed.rule}`}
        >
          <span
            className={`relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full ${feed.avatar}`}
          >
            <Image
              src={channel.avatar}
              alt=""
              width={22}
              height={22}
              className="object-contain"
            />
          </span>
          <span className="min-w-0">
            <a
              href={channel.href}
              className={`block truncate text-sm font-semibold hover:underline ${feed.name}`}
            >
              {channel.name}
            </a>
            <span className={`block truncate text-[11px] ${feed.meta}`}>
              {channel.handle} · {channel.label}
            </span>
          </span>
        </div>

        {/* The feed scrolls inside the panel, so the column can hold more posts
            than the cards beside it are tall. On lg it is stretched to the
            cards' height by the grid; below that it keeps its own max height. */}
        <ol
          className={`min-h-0 flex-1 divide-y overflow-y-auto ${feed.rule.replace("border-", "divide-")}`}
        >
          {posts.map((post) => (
            <li key={post.id} className="px-5 py-5">
              <div className="flex items-baseline gap-2">
                <span
                  className={`truncate text-[13px] font-semibold ${feed.name}`}
                >
                  {channel.name}
                </span>
                <time
                  dateTime={post.date}
                  className={`text-[11px] ${feed.meta}`}
                >
                  {post.dateLabel}
                </time>
              </div>

              <p className={`mt-2 text-[13px] leading-relaxed ${feed.body}`}>
                {post.body}
              </p>

              {post.image ? (
                <a
                  href={post.href}
                  className={`relative mt-3 block aspect-[16/10] overflow-hidden rounded-lg ring-1 ${feed.frame}`}
                >
                  <Image
                    src={post.image}
                    alt={post.alt ?? ""}
                    fill
                    sizes="(min-width: 1024px) 26vw, 100vw"
                    className="object-cover"
                  />
                </a>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
