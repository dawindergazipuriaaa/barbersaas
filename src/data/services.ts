export type Servicetype = {
    id: string;
    name: string;
    price:number;
      type?: "service" | "package";
}

export const service:Servicetype[] = [
  { id: 'classic-haircut', name: 'Classic Haircut', price: 30 },
  { id: 'skin-fade', name: 'Skin Fade', price: 35 },
  { id: 'beard-trim-shape', name: 'Beard Trim & Shape', price: 20 },
  { id: 'hot-towel-shave', name: 'Hot Towel Shave', price: 25 },
  { id: 'full-shave-straight-razor', name: 'Full Shave (Straight Razor)', price: 30 },
  { id: 'hair-wash-conditioning', name: 'Hair Wash & Conditioning', price: 10 },
  { id: 'scalp-massage', name: 'Scalp Massage', price: 15 },
  { id: 'line-up-edging', name: 'Line Up / Edging', price: 10 },
  { id: 'eyebrow-grooming', name: 'Eyebrow Grooming / Shaping', price: 10 },
  { id: 'black-mask-facial', name: 'Black Mask Facial', price: 15 },
  { id: 'beard-colour-tint', name: 'Beard Colour / Tint', price: 15 },
  { id: 'hair-colour-touchup', name: 'Hair Colour Touch-Up', price: 40 },
  { id: 'hairstyling', name: 'Hairstyling (Blow/Style)', price: 35 },
  { id: 'manicure', name: 'Manicure', price: 25 },
  { id: 'basic-facial-cleanse', name: 'Basic Facial Cleanse', price: 20 },
  { id: 'deep-conditioning-treatment', name: 'Deep Conditioning Treatment', price: 30 },
  { id: 'head-spa-treatment', name: 'Head Spa Treatment', price: 45 },
  { id: 'kids-haircut', name: 'Kids Haircut (Under 12)', price: 20 },
]

 export const essentialsPackages =[

 ["CLASSIC HAIRCUT", true],
  ["BEARD TRIM & SHAPE", true],
  ["HAIR WASH & CONDITIONING", true],
  ["LINE UP / EDGING", true],
  ["HOT TOWEL SHAVE", true],
  ["SCALP MASSAGE", false]
];
export const deluxePackages = [
  ["CLASSIC HAIRCUT", true],
  ["BEARD TRIM & SHAPE", true],
  ["HOT TOWEL SHAVE", true],
  ["SCALP MASSAGE", true],
  ["HAIR COLOUR TOUCH-UP", true],
  ["BLACK MASK FACIAL", true]
]; 
 export  const groomPackages=[
  ["CLASSIC HAIRCUT", true],
  ["BEARD TRIM & SHAPE", true],
  ["HOT TOWEL SHAVE", true],
  ["SCALP MASSAGE", true],
  ["AFTERCARE PRODUCTS", true],
  ["EYEBROW GROOMING", false]    
  ]