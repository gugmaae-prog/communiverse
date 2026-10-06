export const howItWorks = {
  metaTitle: "How It Works | Communiverse",
  metaDescription:
    "See how Communiverse helps communities, makers, and collectors build something they own together.",
  eyebrow: "(How It Works)",
  heading: "A CLUB THAT RUNS ITSELF.",
  intro:
    "Communiverse gives people of the same interest a place to keep it alive: makers, collectors, crafts, art, and collectibles. Bring your people together, build a shared home, and let the value move back to the people who created it.",
  stepsHeading: "THREE STEPS TO A CLUB THAT RUNS ITSELF.",
  steps: [
    {
      n: "01",
      title: "FIND",
      body: "Find the people who share your obsession, then make a place worth returning to.",
    },
    {
      n: "02",
      title: "BUILD",
      body: "Open the store, share the tools, and give members roles, reputation, and a real say.",
    },
    {
      n: "03",
      title: "EARN",
      body: "Let the commerce you create flow back through the people who made the culture.",
    },
  ],
  closeHeading: "START WITH YOUR PEOPLE.",
  close:
    "Whether you make, collect, teach, or gather people around the same interest — a craft, an artwork, or a collectible — there is a place for you on Communiverse.",
  cta: { label: "JOIN THE WAITLIST", href: "/contact" },
};

export const makersPage = {
  eyebrow: "(For Makers)",
  heading: "YOU MADE THE WORK. YOU SHOULD OWN WHAT IT BECOMES.",
  intro:
    "Communiverse is a home for makers and the people who collect what they make, from crafts and art to collectibles of the same interest. One maker per craft, signed and verified, selling and teaching on their own terms. We are opening in waves. This is how you get in early.",
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
      { n: "04", title: "BELONG", body: "Build the club around your craft and the people who share that interest, including the collectors who keep the work." },
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
    "Join the Communiverse waitlist. Tell us whether you make, collect, or bring together people of the same interest — crafts, art, or collectibles — and we will be in touch.",
  submit: "Join the waitlist",
  emailDisplay: "Hello@communiverseclubs.com",
  fields: [
    { name: "name", label: "Name", placeholder: "Your Name*", type: "text", required: true },
    { name: "email", label: "Email", placeholder: "Email*", type: "email", required: true },
    { name: "subject", label: "Subject (optional)", placeholder: "Subject", type: "text", required: false },
    { name: "message", label: "Message", placeholder: "Message*", type: "textarea", required: true },
  ],
} as const;

export const articles = {
  about: {
    metaTitle: "About | Communiverse",
    eyebrow: "(About Communiverse)",
    kicker: "Communiverse / About",
    heading: "Where Passion Becomes Power.",
    lede: "Communiverse is where people who share an interest gather: makers and the people who collect what they make, including crafts, art, and collectibles such as cards, records, and other novelty objects. Clubs connect people of the same interest.",
    note: "We are built for the culture.",
    cta: { label: "Join the waitlist", href: "/contact" },
    sections: [
      {
        eyebrow: "(For the culture)",
        heading: "The culture has always been here. It just never had a home.",
        body: "Every maker, every collector, and every club built around a shared interest, from a craft to a collectible. This is built for you.",
      },
      {
        eyebrow: "(The provenance)",
        heading: "Every Product Has a Story. We Make Sure It's Never Lost.",
        body: "Behind items sold through Communiverse is a maker, a designer, an artist, or a collectible people keep. We surface that story, permanently. Through on-chain provenance, every product carries its origin, its creator, and its journey from hands to community. Because ownership means nothing without knowing where something truly came from.",
      },
    ],
  },
  founders: {
    metaTitle: "For Founders | Communiverse",
    eyebrow: "(For Founders)",
    kicker: "Communiverse / For Founders",
    heading: "You Built the Community. Now Build the Business.",
    lede: "We are looking for curators, makers, and collectors who already gather people around one interest: a craft, an art, or a collectible. If you know your niche better than anyone else, we will give you the tools to turn that into a club worth joining.",
    note: "A space for the passionate, from everywhere.",
    cta: { label: "Join the waitlist", href: "/contact" },
    sections: [
      {
        eyebrow: "(Your community)",
        heading: "The culture has always been here. It just never had a home.",
        body: "Every maker, every collector, and every club built around a shared interest, from a craft to a collectible. This is built for you.",
      },
      {
        eyebrow: "(How it works)",
        heading: "Three Steps to a Club That Runs Itself.",
        body: "Apply to establish your club, define your niche, and invite your founding circle. Your AI-powered store goes live. Members earn roles, reputation, and real voting power. Club commerce generates a reward pool. The culture pays its creators every single month.",
      },
    ],
  },
  brands: {
    metaTitle: "For Brands | Communiverse",
    eyebrow: "(For Brands)",
    kicker: "Communiverse / For Brands",
    heading: "Stop Sponsoring Audiences. Start Partnering With Communities.",
    lede: "Communiverse lets brands work with the makers and the clubs around them. Not agencies, not audiences, not ad slots. Commission a maker, co-create a limited run, or put your name behind a craft, an artwork, or a collectible people already share an interest in. The work is real, the maker is verified, and the community sees who made it.",
    note: "The work is real. The maker is verified.",
    cta: { label: "Join the brand waitlist", href: "/contact" },
    sections: [
      {
        eyebrow: "(For makers)",
        heading: "Made by hand. Signed by name.",
        body: "Communiverse is built for the people who actually make things. Painters, woodworkers, potters, perfumers, watchmakers, calligraphers, stone carvers. We do not list anyone we have not met.",
      },
      {
        eyebrow: "(Experiences)",
        heading: "Some things you cannot ship.",
        body: "Beyond the object is the hour you spend making it. Communiverse runs live workshops and private sessions with the same verified makers who sell on the platform.",
      },
    ],
  },
  startups: {
    metaTitle: "For Startups | Communiverse",
    eyebrow: "(For Startups)",
    kicker: "Communiverse / For Startups",
    heading: "A Club That Runs Itself.",
    lede: "Communiverse gives people of the same interest a place to keep it alive: makers, collectors, crafts, art, and collectibles. Bring your people together, build a shared home, and let the value move back to the people who created it.",
    note: "Makers, collectors, and people of the same interest. Find your people.",
    cta: { label: "Join the waitlist", href: "/contact" },
    sections: [
      {
        eyebrow: "(About Communiverse)",
        heading: "Where Passion Becomes Power.",
        body: "Communiverse is designed as a powerful infrastructure. We didn’t build another social app. We built a platform where the people who live and breathe their niche can finally own a piece of it, governing their club, running their store, and earning from the culture they created.",
      },
      {
        eyebrow: "(How it works)",
        heading: "Three Steps to a Club That Runs Itself.",
        body: "Find the people who share your obsession, then make a place worth returning to. Open the store, share the tools, and give members roles, reputation, and a real say. Let the commerce you create flow back through the people who made the culture.",
      },
    ],
  },
} as const;

export const shells = [
  {
    slug: "about",
    title: "About",
    note: "Published route with shared navigation and footer. No body sections are rendered on the live site.",
  },
  {
    slug: "for-founders",
    title: "For Founders",
    note: "Published route with shared navigation and footer. No body sections are rendered on the live site.",
  },
  {
    slug: "for-brands",
    title: "For Brands",
    note: "Published route with shared navigation and footer. Brand storytelling lives on the homepage #for-brands section.",
  },
  {
    slug: "for-startups",
    title: "For Startups",
    note: "Published route with shared navigation and footer. No body sections are rendered on the live site.",
  },
] as const;
