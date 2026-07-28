export const SITE = {
  name: "SEED Foundation",
  tagline: "Every community deserves the opportunity to thrive.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://seedfound.org",
  email: "contact@seedfound.org",
  phone: "[Phone to be provided]",
  hours: "[Hours to be provided]",
  address: "No. 36, R.C. Street, Elankadai, Kottar Post, Nagercoil, Tamil Nadu 629002",
  mapEmbed:
    "https://maps.google.com/maps?q=8.2,77.4&z=14&output=embed",
  compliance: {
    trustReg: "R/Idalagudi/Book-4/23/2018",
    pan: "AAWTS0127Q",
    darpan: "TN/2026/1130617",
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/our-stories", label: "Our Stories" },
  { href: "/get-involved", label: "Get Involved" },
] as const;

export const HERO = {
  headline: "Every community deserves the opportunity to thrive.",
  subheading:
    "SEED FOUNDATION works alongside communities to improve health awareness, expand educational opportunities, protect the environment, and respond to humanitarian needs. Through community-led programs, awareness initiatives, and collaborative action, we help people gain knowledge, build confidence, and create positive change where it matters most.",
  cta: { label: "Explore Our Stories", href: "/our-stories" },
} as const;

export const BELIEF = {
  quote: "We believe lasting change begins with informed communities.",
  highlight: "informed communities",
  body: "Whether helping students make better career decisions, encouraging early health awareness, promoting environmental responsibility, or supporting families during times of crisis, our work is built on the belief that knowledge, participation, and compassion create stronger communities.",
  cta: { label: "Learn more about our role", href: "/about" },
} as const;

export type FocusArea = "health" | "education" | "environment" | "disaster-relief";

export const PILLARS: {
  id: FocusArea;
  title: string;
  description: string;
  href: string;
}[] = [
  {
    id: "health",
    title: "Health Awareness",
    description:
      "We conduct community awareness initiatives that encourage prevention, early intervention, and informed decision-making. Our programs help communities understand important health issues while creating safe spaces for discussion and learning. This is reflected in initiatives such as the Cancer Awareness Program and the \"Missing Numbers\" suicide awareness initiative.",
    href: "/our-stories?area=health",
  },
  {
    id: "education",
    title: "Education & Career Guidance",
    description:
      "Students deserve access to information that helps them shape their future. Our career guidance programs introduce educational pathways, career opportunities, and practical guidance so young people can make informed decisions with greater confidence.",
    href: "/our-stories?area=education",
  },
  {
    id: "environment",
    title: "Environment",
    description:
      "Healthy communities depend on a healthy environment. Through awareness campaigns, waste segregation initiatives, and community cleanup efforts, we encourage responsible environmental practices that protect coastal ecosystems and marine life.",
    href: "/our-stories?area=environment",
  },
  {
    id: "disaster-relief",
    title: "Humanitarian Relief",
    description:
      "When communities face emergencies, collective action matters. We mobilize volunteers, educational institutions, and community members to provide practical support that reaches people when they need it most.",
    href: "/our-stories?area=disaster-relief",
  },
];

export const PROGRAMS: {
  slug: string;
  title: string;
  focusArea: FocusArea;
  focusLabel: string;
  status: "active" | "completed";
  summary: string;
  description: string;
  storySlug?: string;
}[] = [
  {
    slug: "you-can-cancer-awareness",
    title: "You Can – Cancer Awareness Program",
    focusArea: "health",
    focusLabel: "Health",
    status: "completed",
    summary:
      "Community education on cancer prevention, early detection, and timely medical consultation in Kadiapattanam Village.",
    description:
      "The \"You Can\" Cancer Awareness Program brought together residents of Kadiapattanam Village to learn about cancer prevention, early detection, and the importance of timely medical consultation. Through educational sessions and open discussions, participants gained practical knowledge while myths surrounding cancer were addressed through direct interaction.",
    storySlug: "helping-communities-understand-cancer",
  },
  {
    slug: "missing-numbers",
    title: "Missing Numbers – Suicide Awareness Initiative",
    focusArea: "health",
    focusLabel: "Health",
    status: "completed",
    summary:
      "Storytelling through film to encourage open conversations about mental health among students.",
    description:
      "\"Missing Numbers\" used storytelling through film to encourage students to discuss mental health openly. The initiative aimed to reduce stigma, promote early help-seeking, and remind young people that support is available.",
    storySlug: "encouraging-conversations-around-mental-health",
  },
  {
    slug: "puthoor-career-guidance",
    title: "Career Guidance – Puthoor Village",
    focusArea: "education",
    focusLabel: "Education",
    status: "completed",
    summary:
      "Interactive sessions helping students explore educational pathways and career options.",
    description:
      "Students from Puthoor Village participated in career guidance sessions that explored educational pathways, career options, and practical planning. Interactive discussions helped participants better understand opportunities aligned with their interests and aspirations.",
    storySlug: "guiding-students-towards-their-future",
  },
  {
    slug: "colachel-coastal-conservation",
    title: "Colachel Harbour Coastal Conservation",
    focusArea: "environment",
    focusLabel: "Environment",
    status: "completed",
    summary:
      "Awareness, waste segregation infrastructure, and community cleanup to protect marine life.",
    description:
      "At Colachel Harbour, awareness campaigns, waste segregation bins, and a community cleanup effort encouraged residents to take an active role in protecting marine life and reducing coastal pollution.",
    storySlug: "protecting-our-coastline",
  },
  {
    slug: "kerala-flood-relief-2018",
    title: "Kerala Flood Relief – Rice Donation Drive",
    focusArea: "disaster-relief",
    focusLabel: "Disaster Relief",
    status: "completed",
    summary:
      "Community-led food support for flood-affected families with St. John's College partners.",
    description:
      "Following the 2018 Kerala floods, SEED FOUNDATION partnered with St. John's College of Arts and Science to organize a rice donation drive that mobilized students, staff, and faculty to support flood-affected families with essential food supplies.",
    storySlug: "supporting-families-during-crisis",
  },
];

export const STORIES: {
  slug: string;
  title: string;
  category: string;
  focusArea: FocusArea;
  excerpt: string;
  body: string;
  image?: string;
}[] = [
  {
    slug: "helping-communities-understand-cancer",
    title: "Helping Communities Understand Cancer",
    category: "Health",
    focusArea: "health",
    excerpt:
      "The \"You Can\" Cancer Awareness Program brought practical knowledge on prevention and early detection to Kadiapattanam Village.",
    body: "The \"You Can\" Cancer Awareness Program brought together residents of Kadiapattanam Village to learn about cancer prevention, early detection, and the importance of timely medical consultation. Through educational sessions and open discussions, participants gained practical knowledge while myths surrounding cancer were addressed through direct interaction.",
  },
  {
    slug: "encouraging-conversations-around-mental-health",
    title: "Encouraging Conversations Around Mental Health",
    category: "Health",
    focusArea: "health",
    excerpt:
      "\"Missing Numbers\" used storytelling through film to help students discuss mental health openly.",
    body: "\"Missing Numbers\" used storytelling through film to encourage students to discuss mental health openly. The initiative aimed to reduce stigma, promote early help-seeking, and remind young people that support is available.",
  },
  {
    slug: "protecting-our-coastline",
    title: "Protecting Our Coastline",
    category: "Environment",
    focusArea: "environment",
    excerpt:
      "At Colachel Harbour, awareness, waste segregation, and cleanup efforts put residents at the center of coastal care.",
    body: "At Colachel Harbour, awareness campaigns, waste segregation bins, and a community cleanup effort encouraged residents to take an active role in protecting marine life and reducing coastal pollution.",
    image: "/images/stories/protecting-our-coastline.png",
  },
  {
    slug: "supporting-families-during-crisis",
    title: "Supporting Families During Crisis",
    category: "Disaster Relief",
    focusArea: "disaster-relief",
    excerpt:
      "After the 2018 Kerala floods, a rice donation drive mobilized students and faculty to support affected families.",
    body: "Following the 2018 Kerala floods, SEED FOUNDATION partnered with St. John's College of Arts and Science to organize a rice donation drive that mobilized students, staff, and faculty to support flood-affected families with essential food supplies.",
    image: "/images/stories/supporting-families-during-crisis.png",
  },
  {
    slug: "guiding-students-towards-their-future",
    title: "Guiding Students Towards Their Future",
    category: "Education",
    focusArea: "education",
    excerpt:
      "Career guidance sessions in Puthoor Village helped students explore pathways aligned with their aspirations.",
    body: "Students from Puthoor Village participated in career guidance sessions that explored educational pathways, career options, and practical planning. Interactive discussions helped participants better understand opportunities aligned with their interests and aspirations.",
    image: "/images/stories/guiding-students-towards-their-future.png",
  },
];

export const APPROACH_STEPS = [
  {
    title: "Listen",
    description: "Understand community needs through engagement and discussion.",
  },
  {
    title: "Educate",
    description: "Provide practical information through awareness sessions and interactive learning.",
  },
  {
    title: "Engage",
    description: "Encourage participation through open dialogue and community involvement.",
  },
  {
    title: "Act",
    description:
      "Translate awareness into meaningful action through campaigns, clean-up drives, relief efforts, or educational support.",
  },
  {
    title: "Strengthen",
    description:
      "Build relationships that encourage continued community participation and future initiatives.",
  },
] as const;

export const IMPACT = {
  audiences: [
    "Village communities",
    "School students",
    "College students",
    "Educational institutions",
    "Local residents",
    "Coastal communities",
    "Volunteers and community partners",
  ],
  outcomes: [
    "Increased awareness of cancer prevention and early detection",
    "Greater openness to conversations about mental health",
    "Improved understanding of career opportunities among students",
    "Increased environmental responsibility through coastal conservation efforts",
    "Community participation in humanitarian relief initiatives",
  ],
} as const;

export const ABOUT = {
  whoWeAre: [
    "SEED FOUNDATION is a community-focused nonprofit organization that designs and delivers awareness programs, educational initiatives, environmental campaigns, and humanitarian relief efforts. Across every initiative, our focus remains the same: helping communities gain knowledge, strengthen resilience, and improve wellbeing through participation and collaboration.",
    "The projects documented in our reports demonstrate work with village communities, students, educational institutions, local residents, and community partners across Tamil Nadu.",
  ],
  approachIntro:
    "Every program begins by understanding a community's needs. We then bring together local partners, community members, educators, volunteers, and institutions to create initiatives that are practical, accessible, and locally relevant.",
  principles: [
    "Awareness through education",
    "Community participation",
    "Open dialogue",
    "Practical action",
    "Long-term community engagement",
  ],
} as const;

export const GET_INVOLVED = {
  intro:
    "Positive change grows through collaboration. Whether you are a student, educator, volunteer, community leader, or institution, there are opportunities to participate in awareness programs, community initiatives, educational outreach, and humanitarian activities that strengthen communities together.",
  paths: [
    {
      id: "volunteer",
      title: "Volunteer",
      description:
        "Join community programs as a facilitator, organizer, or supporter. Volunteers help deliver sessions, mobilize partners, and bring practical action to the ground.",
    },
    {
      id: "partner",
      title: "Partner",
      description:
        "Schools, colleges, and community organizations can collaborate with SEED FOUNDATION on programs that are locally relevant and participatory.",
    },
  ],
} as const;

export const WORK_AREAS = [
  {
    id: "health" as FocusArea,
    title: "Health",
    description:
      "We organize awareness initiatives that encourage early detection, reduce stigma, improve public understanding, and promote preventive healthcare.",
  },
  {
    id: "education" as FocusArea,
    title: "Education",
    description:
      "We help students explore career pathways, understand educational opportunities, and make informed academic decisions through interactive guidance sessions.",
  },
  {
    id: "environment" as FocusArea,
    title: "Environment",
    description:
      "Our environmental initiatives combine awareness with action by encouraging waste segregation, installing public waste infrastructure, and leading coastal cleanup campaigns.",
  },
  {
    id: "disaster-relief" as FocusArea,
    title: "Disaster Relief",
    description:
      "We coordinate community-led humanitarian responses that mobilize institutions and volunteers to provide essential support to affected families.",
  },
];

export function getProgram(slug: string) {
  return PROGRAMS.find((p) => p.slug === slug);
}

export function getStory(slug: string) {
  return STORIES.find((s) => s.slug === slug);
}
