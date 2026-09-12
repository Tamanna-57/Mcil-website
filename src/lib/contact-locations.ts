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

function embedSrc(query: string, zoom: number) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;
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
  /* The works sits in an industrial estate that needs the wider frame to make
     sense of; the office is one building on a known street. */
  return embedSrc(location.mapQuery, location.id === "works" ? 15 : 16);
}
