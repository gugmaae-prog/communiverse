export const howItWorks = {
  metaTitle: "How It Works | Communiverse",
  metaDescription:
    "See how Communiverse helps communities, makers, and collectors build something they own together.",
  eyebrow: "(How It Works)",
  heading: "A CLUB THAT RUNS ITSELF.",
  intro:
    "Communiverse gives the people who make culture the structure to keep it alive. Bring your people together, build a shared home, and let the value move back to the people who created it.",
  stepsHeading: "THREE STEPS TO A CLUB THAT RUNS ITSELF.",
  steps: [
    {
      n: "01",
      title: "Found",
      body: "Find the people who share your obsession, then make a place worth returning to.",
    },
    {
      n: "02",
      title: "Build",
      body: "Open the store, share the tools, and give members roles, reputation, and a real say.",
    },
    {
      n: "03",
      title: "Earn",
      body: "Let the commerce you create flow back through the people who made the culture.",
    },
  ],
  closeHeading: "START WITH YOUR PEOPLE.",
  close:
    "Whether you make, collect, teach, want to learn, or gather people around a shared idea, there is a place for you in Communiverse.",
  cta: { label: "JOIN THE WAITLIST", href: "/contact" },
};

export const makersPage = {
  eyebrow: "(For Makers)",
  heading: "YOU MADE THE WORK. YOU SHOULD OWN WHAT IT BECOMES.",
  intro:
    "Communiverse is a home for emerging artists and craftspeople. One maker per craft, signed and verified, selling and teaching on their own terms. We are opening in waves. This is how you get in early.",
  cta: { label: "JOIN THE MAKER WAITLIST", href: "/contact" },
  keep: {
    heading: "WHAT YOU KEEP",
    items: [
      {
        n: "01",
        title: "YOUR NAME",
        body: "Every piece and every session carries your maker’s mark. Buyers see who made it, where, and how.",
      },
      {
        n: "02",
        title: "YOUR WORK",
        body: "You set what you make, how much of it, and how it is presented. We do not turn craft into product lines.",
      },
      {
        n: "03",
        title: "YOUR PEOPLE",
        body: "The buyers who find you are yours. We connect, we do not sit in between.",
      },
    ],
  },
  standard: {
    eyebrow: "(The Standard)",
    heading: "WE DO NOT LIST ANYONE WE HAVE NOT MET.",
    body: "Every maker is verified in person before they go live. We look at the work, the process, and the workshop. We take one maker per craft in each market so nobody is competing against a hundred near copies of themselves. In exchange we ask for consistency, honesty about lead times, and the willingness to show your process.",
  },
  mark: {
    eyebrow: "(Provenance)",
    heading: "THE MAKER’S MARK",
    body: "Once you are verified, your maker’s mark is issued on chain. It follows every piece you sell and every session you run, permanently. Years from now, whoever holds your work can still trace it back to your hands.",
  },
  earn: {
    heading: "FOUR WAYS TO EARN",
    items: [
      { n: "01", title: "TEACH", body: "Run workshops and private sessions, for individuals or for company teams." },
      { n: "02", title: "MAKE", body: "Sell kits, made to order goods and commissions." },
      { n: "03", title: "SELL", body: "List one of one pieces to collectors who want provenance, not volume." },
      { n: "04", title: "BELONG", body: "Build the club around your craft and earn from the culture you created." },
    ],
  },
  close: {
    heading: "WE ARE SIGNING MAKERS NOW.",
    body: "Tell us what you make. If it is a craft we are opening next, we will come and see it.",
    cta: { label: "JOIN THE MAKER WAITLIST", href: "/contact" },
  },
};

export const contactPage = {
  heading: "Find Your People",
  intro:
    "Join the Communiverse waitlist. Tell us whether you are a maker, brand, or collector and we will be in touch.",
  submit: "SUBMIT",
  emailDisplay: "hello@communiverseclubs.com",
  fields: [
    { name: "name", label: "Name", placeholder: "Your Name*", type: "text", required: true },
    { name: "email", label: "Email", placeholder: "Email*", type: "email", required: true },
    { name: "subject", label: "Subject (optional)", placeholder: "Subject (optional)", type: "text", required: false },
    { name: "message", label: "Message", placeholder: "Message*", type: "textarea", required: true },
  ],
} as const;

const clubSteps = [
  {
    n: "01",
    title: "Found",
    body: "Apply to establish your club, define your niche, and invite your founding circle.",
  },
  {
    n: "02",
    title: "Build",
    body: "Your AI-powered store goes live. Members earn roles, reputation, and real voting power.",
  },
  {
    n: "03",
    title: "Earn",
    body: "Club commerce generates a reward pool. The culture pays its creators every single month.",
  },
] as const;

export const aboutPage = {
  metaTitle: "About | Communiverse",
  metaDescription:
    "Communiverse is the club infrastructure for makers, artists, and collector communities. Learn, make, sell, and belong together.",
  eyebrow: "(About Communiverse)",
  heading: "Where Passion Becomes Power.",
  intro:
    "Communiverse is the platform where the world’s most passionate makers, artists and collector communities learn, make, sell, experience and grow together. We are built for the culture.",
  pointsHeading: "Not another social app.",
  points: [
    {
      n: "01",
      title: "Own the niche",
      body: "The people who live and breathe a niche can govern their club, run their store, and earn from the culture they created.",
    },
    {
      n: "02",
      title: "Keep the name",
      body: "Makers are signed and verified. Every piece carries a maker’s mark, and provenance stays with the object.",
    },
    {
      n: "03",
      title: "Open in waves",
      body: "Communiverse is opening in waves. Join the waitlist and tell us whether you make, collect, found, or partner.",
    },
  ],
  close:
    "Learn in a workshop. Make from the bench. Collect one of one. Belong to the club around the craft. That is the whole invitation.",
  cta: { label: "JOIN THE WAITLIST", href: "/contact" },
} as const;

export const foundersPage = {
  metaTitle: "For Founders | Communiverse",
  metaDescription:
    "Found a Communiverse club around the niche you already know. Define the circle, open the store, and earn with the people who built it.",
  eyebrow: "(For Founders)",
  heading: "You Built the Community. Now Build the Business.",
  intro:
    "We are looking for the curators, the artists, the specialists in their crafts and the obsessives who already have a following or the conviction to build one. If you know your niche better than anyone else, we will give you the tools to turn that passion into a club worth joining.",
  pointsHeading: "Three steps to a club that runs itself.",
  points: clubSteps,
  close: "Tell us the niche, who is already in the circle, and what you want the club to make possible.",
  cta: { label: "JOIN THE WAITLIST", href: "/contact" },
} as const;

export const brandsPage = {
  metaTitle: "For Brands | Communiverse",
  metaDescription:
    "Partner with verified Communiverse makers. Commission work, co-create a limited run, or put your name behind a craft people already care about.",
  eyebrow: "(For Brands)",
  heading: "Stop Sponsoring Audiences. Start Partnering With Communities.",
  intro:
    "Communiverse lets brands collaborate directly with the artists themselves. Not agencies, not audiences, not ad slots. The work is real, the maker is verified, and the community sees who made it.",
  pointsHeading: "Three ways to show up.",
  points: [
    {
      n: "01",
      title: "Commission",
      body: "Ask a verified maker to make a piece. Their name stays on the work.",
    },
    {
      n: "02",
      title: "Co-create",
      body: "Make a limited run together. The club sees the maker, the process, and the partnership.",
    },
    {
      n: "03",
      title: "Stand behind the craft",
      body: "Put your name behind a craft people already care about, instead of buying an ad slot beside it.",
    },
  ],
  close: "Join the brand waitlist and tell us the maker, the material, or the community you want to work with.",
  cta: { label: "JOIN THE BRAND WAITLIST", href: "/contact" },
} as const;

export const startupsPage = {
  metaTitle: "For Startups | Communiverse",
  metaDescription:
    "Communiverse has no separate startup track. A startup here founds a club: the store, the roles, and the reward pool are the same tools every founder uses.",
  eyebrow: "(For Startups)",
  heading: "Found the club. The company can follow.",
  intro:
    "Communiverse does not run a separate startup program. If you are starting a studio, a label, or a shop around people who already share a niche, you are a founder. The club is the company.",
  pointsHeading: "The same three steps.",
  points: clubSteps,
  close:
    "Use the waitlist message to say what you are starting, who it is for, and whether you need makers, members, or both. There is no second application.",
  cta: { label: "JOIN THE WAITLIST", href: "/contact" },
} as const;
