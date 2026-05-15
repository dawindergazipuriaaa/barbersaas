// data/packages.ts
import { Servicetype } from "./services";

export type PackageType = {
  id: string;
  name: string;
  price: number;
  heading: string;
  services: Servicetype[];
};

export const PACKAGES: Record<string, PackageType> = {
  essentials: {
    id: "pkg_essentials",
    name: "Essentials Package",
    heading:"Most Popular for Everyday Look",
    price: 120,
    services: [
      { id: "classic-haircut", name: "Classic Haircut", price: 0 },
      { id: "beard-trim-shape", name: "Beard Trim & Shape", price: 0 },
      { id: "hair-wash-conditioning", name: "Hair Wash & Conditioning", price: 0 },
      { id: "line-up-edging", name: "Line Up / Edging", price: 0 },
      { id: "hot-towel-shave", name: "Hot Towel Shave", price: 0 },
      { id: "scalp-massage", name: "Scalp Massage", price: 0 },
    ],
  },

  groom: {
    id: "pkg_groom",
    name: "Groom Package",
    heading: "Premium men’s Grooming Experience",
    price: 150,
    services: [
      { id: "classic-haircut", name: "Classic Haircut", price: 0 },
      { id: "beard-trim-shape", name: "Beard Trim & Shape", price: 0 },
      { id: "hot-towel-shave", name: "Hot Towel Shave", price: 0 },
      { id: "scalp-massage", name: "Scalp Massage", price: 0 },
      { id: "hair-colour-touchup", name: "Hair Colour Touch-Up", price: 0 },
      { id: "black-mask-facial", name: "Black Mask Facial", price: 0 },
        
    ],
  },

  deluxe: {
    id: "pkg_deluxe",
    name: "Deluxe Package",
    heading:"Pick as you suit",
    price: 200,
    services: [
      { id: "classic-haircut", name: "Classic Haircut", price: 0 },
      { id: "beard-trim-shape", name: "Beard Trim & Shape", price: 0 },
      { id: "hot-towel-shave", name: "Hot Towel Shave", price: 0 },
      { id: "scalp-massage", name: "Scalp Massage", price: 0 },
      { id: "aftercare_products", name: "After Products", price: 0 },
      { id: "eyebrow-grooming", name: "Eyebrow Grooming", price: 0 },
    ],
  },
};
