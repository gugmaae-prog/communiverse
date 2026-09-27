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
    "Whether you make, collect, teach, want to learn or gather people around a shared idea, there is a place for you Communiverse.",
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
  emailDisplay: "Hello@communiverseclubs.com",
  fields: [
    { name: "name", label: "Name", placeholder: "Your Name*", type: "text", required: true },
    { name: "email", label: "Email", placeholder: "Email*", type: "email", required: true },
    { name: "subject", label: "Subject", placeholder: "Subject", type: "text", required: true },
    { name: "message", label: "Message", placeholder: "Message*", type: "textarea", required: true },
  ],
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
