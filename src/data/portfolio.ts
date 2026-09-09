type WebUrl = `https://${string}`;

export type InlineTextContent =
  | string
  | readonly { text: string; strong?: boolean; href?: WebUrl }[];

export type Experience = {
  period: string;
  role: string;
  company: string;
  location: string;
  highlights: readonly InlineTextContent[];
};

export type Project = {
  id: string;
  title: string;
  href: WebUrl;
  description: string;
  contribution: InlineTextContent;
  technologies?: readonly string[];
  source?: { href: WebUrl; label: string };
  thumbnail?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

export type ContactLink = {
  kind: "email" | "github" | "linkedin";
  label: string;
  href: WebUrl | `mailto:${string}`;
};

type Portfolio = {
  name: string;
  title: string;
  about: readonly string[];
  education: {
    degree: string;
    school: string;
    detail: string;
    location: string;
  };
  experience: readonly Experience[];
  resume: { href: string; label: string } | null;
  projects: readonly Project[];
  contact: { links: readonly ContactLink[] };
  metadata: { title: string; description: string };
};

const inclusiveDesignUrl: WebUrl = "https://inclusive.microsoft.design/";
const immersiveReaderUrl: WebUrl =
  "https://learn.microsoft.com/en-us/training/educator-center/product-guides/immersive-reader/";

export const portfolio: Portfolio = {
  name: "Yue Ou",
  title: "Program Manager | Engineering background, design instincts",
  about: [
    "I care about what's worth building, and I love figuring out how to build it. My experience across software engineering, program management, and UX helps me connect what people need with what it takes to make it happen.",
    "AI is changing what's possible. I help teams find focus, make decisions, and ship—even when the path forward isn't clear.",
  ],
  education: {
    degree: "B.Sc. in Computer Science",
    school: "Karlsruhe Institute of Technology",
    detail: "Minor in Business Administration",
    location: "Germany",
  },
  experience: [
    {
      period: "2022 - Present",
      role: "Design Program Manager",
      company: "Microsoft",
      location: "Redmond, USA",
      highlights: [
        "Simplified cross-studio planning, rhythm of business, and portfolio management with AI and automation, helping teams see priorities clearly, stay aligned, make better decisions, and work more efficiently.",
        [
          { text: "Led the launch and evolution of the " },
          { text: "Microsoft Inclusive Design site", href: inclusiveDesignUrl },
          { text: ", with resources adopted by 30+ enterprise customers and featured in the UN Women toolkit." },
        ],
        "Scaled inclusive design across Azure through co-design with people with disabilities and neurodivergent users. Built cross-org partnerships, evaluation frameworks, and reusable guidance so teams could deliver inclusive products independently.",
        "Improved accessibility and responsible AI practices for Azure Copilot. Co-led a design sprint to identify customer needs and opportunities to improve onboarding, retention, and Azure usage.",
      ],
    },
    {
      period: "2020 - 2022",
      role: "Technical Program Manager",
      company: "Microsoft",
      location: "Redmond, USA",
      highlights: [
        "Led planning for BuildXL and delivered 6x faster JavaScript builds for 400 users.",
        "Scaled 1ES Build Assistant to 5 repositories and 2,000+ developers, improving local build times by 15-30% and growing daily active users from 200 to 600.",
        "Partnered with Windows to reduce P80 pull request build time by 43%.",
      ],
    },
    {
      period: "2016 - 2020",
      role: "Software Engineer",
      company: "Microsoft",
      location: "Vancouver, Canada, Redmond, USA",
      highlights: [
        [
          { text: "Built full-stack features for OneNote Learning Tools (" },
          { text: "Immersive Reader", href: immersiveReaderUrl },
          { text: "), improving reading accessibility for learners of all abilities." },
        ],
        "Created tooling to build, review, and manage a Picture Dictionary library of 30,000+ images.",
        "Expanded language support from 8 to 20 and increased daily usage from 15,000 to 33,000+ clicks.",
      ],
    },
  ],
  resume: null,
  projects: [
    {
      id: "ui-traps",
      title: "UI Traps",
      href: "https://ui-traps.ou-yue.workers.dev/",
      description:
        "A satirical look at enterprise UX: nine design traps that make everyday tasks harder than they need to be.",
      contribution: [
        { text: "Vibe coded this personal project", strong: true },
        { text: " using GPT-5.6 Sol." },
      ],
      thumbnail: {
        src: "/projects/ui-traps.jpg",
        alt: "UI Traps homepage with the headline No UI Tenets. All Traps.",
        width: 1200,
        height: 800,
      },
    },
    {
      id: "inclusive-design",
      title: "Microsoft Inclusive Design",
      href: inclusiveDesignUrl,
      description:
        "A home for inclusive design principles, practical toolkits, and real-world examples, with guidance on cognition and neurodiversity.",
      contribution: [
        { text: "Led the site\u2019s launch and evolution", strong: true },
        { text: ", from research and design through implementation." },
      ],
      thumbnail: {
        src: "/projects/inclusive-design.jpg",
        alt: "Microsoft Inclusive Design homepage with its illustrated header and design principles.",
        width: 1200,
        height: 800,
      },
    },
    {
      id: "inclusive-design-for-cognition",
      title: "Inclusive Design for Cognition",
      href: "https://www.microsoft.com/en-us/garage/wall-of-fame/inclusive-design-for-cognition/",
      description:
        "A Microsoft Garage project using co-design to reduce cognitive barriers in digital experiences.",
      contribution: [
        { text: "Co-led the project.", strong: true },
        { text: " It won the 2022 Microsoft Global Hackathon and was inducted into the Microsoft Garage Wall of Fame." },
      ],
      thumbnail: {
        src: "/projects/inclusive-design-for-cognition.jpg",
        alt: "Microsoft Garage Wall of Fame page for Inclusive Design for Cognition with an illustration of people collaborating.",
        width: 1200,
        height: 800,
      },
    },
    {
      id: "immersive-reader",
      title: "Microsoft Immersive Reader",
      href: immersiveReaderUrl,
      description:
        "A reading tool that supports comprehension with read-aloud, translation, and personalized reading settings across Microsoft products.",
      contribution: [
        { text: "Built full-stack features and tooling", strong: true },
        { text: " for Immersive Reader." },
      ],
      thumbnail: {
        src: "/projects/immersive-reader.avif",
        alt: "Immersive Reader with syllable highlighting and a Picture Dictionary popup for the word valleys.",
        width: 2000,
        height: 1282,
      },
    },
  ],
  contact: {
    links: [
      {
        kind: "github",
        label: "GitHub",
        href: "https://github.com/yueou1995",
      },
      {
        kind: "linkedin",
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/yueou",
      },
    ],
  },
  metadata: {
    title: "Yue Ou | Design Program Manager",
    description:
      "Yue Ou is a Design Program Manager at Microsoft with a background in software engineering. Explore work in inclusive design, AI experiences, and developer tools.",
  },
};