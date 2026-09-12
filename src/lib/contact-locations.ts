/**
 * The two places MCIL is reached at, in the order a visitor needs them: the
 * registered office for correspondence, the works for material.
 *
 * `mapQuery` is what Google geocodes for the embed. It is deliberately looser
 * than the postal address — a unit number ("912") sends the pin to a street
 * centroid, where the building name lands it on the building.
 */

import { company } from "@/lib/company";

export type ContactLocation = {
  id: string;
  label: string;
  role: string;
  address: string;
  phone: string;
  mapQuery: string;
  /** Where the embed's own "view larger map" would go. */
  mapUrl: string;
};

/*
 * The keyless embed, addressed directly rather than through the familiar
 * `maps?q=...&output=embed` form. That one answers 301 to this URL and carries
 * `X-Frame-Options: SAMEORIGIN` on the redirect itself, which is a needless
 * thing to ask a browser to forgive inside an iframe; this URL answers 200
 * with no framing header at all. `pb` is Google's packed parameter string —
 * `!1m2!2m1!1s` is "search for the text that follows".
 */
function embedSrc(query: string) {
  const q = encodeURIComponent(query).replace(/%20/g, "+");
  return `https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1s${q}`;
}

const queries = {
  office: "Hemkunt Chambers, 89 Nehru Place, New Delhi 110019",
  works:
    "HSIIDC Industrial Estate, Sector 59, Faridabad, Haryana 121004, India",
};

export const locations: ContactLocation[] = [
  {
    id: "office",
    label: "Registered Office",
    role: "Correspondence, accounts and investor relations",
    address: company.registeredOffice,
    phone: company.phone,
    mapQuery: queries.office,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queries.office)}`,
  },
  {
    id: "works",
    label: "Works",
    role: "Rolling line, despatch and material enquiries",
    address: company.works,
    phone: company.worksPhone,
    mapQuery: queries.works,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queries.works)}`,
  },
];

export function mapEmbed(location: ContactLocation) {
  return embedSrc(location.mapQuery);
}
