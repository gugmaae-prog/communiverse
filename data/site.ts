import { publicUrl } from "@/lib/public-url";

export const site = {
  name: "Communiverse",
  title: "Communiverse Clubs",
  description:
    "A marketplace for collector communities, crafts, arts and experiences. Buy, sell, earn and authenticate collectibles within trusted clubs. A home for the makers. Find your people.",
  url: "https://espacios.me/communiverse",
  email: "hello@communiverseclubs.com",
  launch: "Q4 2026 LAUNCH",
  copyright: "2026 © COMMUNIVERSE. All Rights Reserved",
  poweredBy: {
    label: "XDC Network",
    href: "https://xdc.org/",
  },
  founder: {
    label: "Find Your People",
    href: "https://x.com/jenkatemw",
  },
  footerNote: "Let's build Together!",
  ogImage: publicUrl("/media/xXdYhZAFRTBsbncmKuApxDc3TO8.png"),
  nav: [
    { label: "HOW IT WORKS", href: "/#how-it-works" },
    { label: "FOR MAKERS", href: "/makers" },
    { label: "FOR BRANDS", href: "/#for-brands" },
    { label: "EXPERIENCES", href: "/#experiences" },
    { label: "CONTACT", href: "/contact" },
  ],
  explore: [
    { label: "About", href: "/about" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Makers", href: "/makers" },
    { label: "Founders", href: "/for-founders" },
    { label: "Brands", href: "/for-brands" },
    { label: "Startups", href: "/for-startups" },
    { label: "Waitlist", href: "/contact" },
  ],
  socials: [
    { short: "X", label: "Jennifer Kate Matthews on X", href: "https://x.com/jenkatemw" },
  ],
} as const;

export const media = {
  hero: publicUrl("/media/F62NYdlNldBd9GBgYl583lpEw.jpg"),
  passion: publicUrl("/media/X5gX62U3yLhddX2yQq6pcoQr4Sc.jpg"),
  passionAlt: publicUrl("/media/gV8gx6QRVR0oBuREvifEEPSF5B8.jpg"),
  makers: publicUrl("/media/4TAKDmMvV5Kkoyuv8GBgH3Ukbk.jpg"),
  experiences: publicUrl("/media/kZ2JxGufuXrPgs3dUt3JxBMxoM.jpg"),
  culture: publicUrl("/media/5PuwaR1yxXEfewCxWT7T1vHN7i4.jpg"),
  founders: publicUrl("/media/B7ZX2ZkkhUXOX7tMrJTnVowdI.jpg"),
  foundersAlt: publicUrl("/media/csi2c4MekSygIHDswE8yEM2REs.jpg"),
  brands: publicUrl("/media/boBGdBVFnju6mgTQKpuKzrS0NX0.jpg"),
  provenance: publicUrl("/media/hKYLAFwwwuUzCUqPDTXHYyLRE.jpg"),
  contact: publicUrl("/media/H11U2dbWXHrKYYOEoiUkp5cJjw.jpg"),
  contactMark: publicUrl("/media/NJ6WHgDRoFICzgCCxPreVlUpq8.jpg"),
} as const;
