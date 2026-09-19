/**
 * The two places MCIL is reached at, in the order a visitor needs them: the
 * registered office for correspondence, the works for material.
 *
 * `mapQuery` is what Google geocodes for the embed, and it is not the postal
 * address: it is whatever phrasing actually resolves to the right point. For
 * the office that means dropping the unit number ("912") and naming the
 * building; for the works it means naming the company, because the estate and
 * sector on their own match nothing. See the note above `queries`.
 */

import { company } from "@/lib/company";

export type ContactLocation = {
  id: string;
  label: string;
  role: string;
  address: string;
  phone: string;
  mapQuery: string;
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

/*
 * What Google is asked to find for each pin.
 *
 * Both are checked against the embed rather than assumed, because a query the
 * geocoder cannot place does not fail visibly — it drops the pin on whatever
 * well-known landmark is nearest and looks perfectly convincing. The works
 * query used to be the estate and sector alone, which matched nothing and put
 * the pin on "Faridabad Industrial Town" in Sector 57, a good 10 km from the
 * plant. Naming the company resolves it to the plant itself:
 *
 *   office -> Nehru Pl Market Rd, Nehru Place, New Delhi 110019
 *             (28.5476618, 77.2522895)
 *   works  -> PLOT no 113, Metal Coating India, Sector 59, Faridabad 121004
 *             (28.310174, 77.3085286)
 *
 * If either pin ever looks wrong again, load the embed URL on its own and
 * check it resolves to a named place: the coordinates above are the answer it
 * should give.
 */
const queries = {
  office: "Hemkunt Chambers, 89 Nehru Place, New Delhi 110019",
  works:
    "Metal Coatings India Limited, Plot 113, HSIIDC Industrial Estate, Sector 59, Faridabad, Haryana 121004",
};

export const locations: ContactLocation[] = [
  {
    id: "office",
    label: "Registered Office",
    role: "Correspondence, accounts and investor relations",
    address: company.registeredOffice,
    phone: company.phone,
    mapQuery: queries.office,
  },
  {
    id: "works",
    label: "Works",
    role: "Rolling line, despatch and material enquiries",
    address: company.works,
    phone: company.worksPhone,
    mapQuery: queries.works,
  },
];

export function mapEmbed(location: ContactLocation) {
  return embedSrc(location.mapQuery);
}

/** Where the embed's own "view larger map" goes. */
export function mapLink(location: ContactLocation) {
  const q = encodeURIComponent(location.mapQuery);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
