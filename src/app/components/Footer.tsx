'use client'

import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";
import { FiPhone } from "react-icons/fi";
import { SlLocationPin } from "react-icons/sl";
import { TfiEmail } from "react-icons/tfi";

const footerLinks = [
  "Services",
  "Book Appointment",
  "About Us",
  "Blogs",
];

const businessHours = [
  { day: "Mon - Friday", time: "09:00 - 21:00" },
  { day: "Saturday", time: "09:00 - 18:00" },
];

const contactInfo = [
  { icon: FiPhone, text: "+123 (4567) - 890" },
  { icon: SlLocationPin, text: "1785 Queen St E, Brampton, ON L6T 4S3, Canada" },
  { icon: TfiEmail, text: "yourmail@info.com" },
];
const legalLinks = [
  "Country site map",
  "Exceptional Service",
  "Quality Cuts",
];
const policyLinks = [
  "Privacy Policy",
  "Modern slavery statement",
  "Timeless Style",
  "Modern Styles",
];

const socialIcons = [FaFacebookF, FaXTwitter, FaInstagram];

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white px-10 pt-16">

      {/* TOP GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* LINKS */}
        <div>
          <h3 className="text-xl font-bold mb-4">Links</h3>
          <ul className="space-y-2">
            {footerLinks.map((item, i) => (
              <li key={i} className="hover:text-golden cursor-pointer">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* BUSINESS HOURS */}
        <div>
          <h3 className="text-xl font-bold mb-4">Business Hours</h3>
          {businessHours.map((item, i) => (
            <div key={i} className="mb-3">
              <p className="text-golden">{item.day}</p>
              <p>{item.time}</p>
            </div>
          ))}
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contact</h3>
          <ul className="space-y-3">
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={i} className="flex items-center gap-3">
                  <Icon size={26} className="text-golden" />
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* FOLLOW US */}
        <div>
          <h3 className="text-xl font-bold mb-4">Follow Us</h3>
          <div className="flex gap-4">
            {socialIcons.map((Icon, i) => (
              <div
                key={i}
                className="border rounded-full p-3 hover:bg-golden hover:text-black cursor-pointer transition"
              >
                <Icon />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-neutral-200 my-12" />

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* LOGO */}
        <div>
          <h2 className="text-2xl font-bold">Clip & Cut</h2>
          <p className="mt-4 text-sm text-neutral-400">
            Lorem ipsum dolor sit amet consectetur. Lectus ac sed purus
            ultrices diam eu scelerisque.
          </p>
        </div>

        {/* LEGAL */}
        <div>
          <h4 className="font-bold mb-4">Legal</h4>
          <ul className="space-y-2">
            {legalLinks.map((item, i) => (
              <li key={i} className="underline cursor-pointer">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* POLICY */}
        <div>
          <h4 className="font-bold mb-4">Privacy Policy</h4>
          <ul className="space-y-2">
            {policyLinks.map((item, i) => (
              <li key={i} className="underline cursor-pointer">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-neutral-700 mt-12 py-6 text-center text-sm text-neutral-400">
        ©2025 All Rights Reserved. Clip & Cut — Designed & Developed by UIPARADOX
      </div>

    </footer>
  );
};

export default Footer;
