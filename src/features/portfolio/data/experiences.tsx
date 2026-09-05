import {
  BriefcaseBusinessIcon,
  CodeXmlIcon,
} from "lucide-react"

import type { Experience } from "@/features/portfolio/types/experiences"

export const EXPERIENCES: Experience[] = [
  {
    id: "arithi",
    companyName: "ARITHI",
    companyLogo: "",
    companyWebsite: "https://arithi.in",
    location: "Raurkela, Odisha, India",
    locationType: "Hybrid",
    positions: [
      {
        id: "arithi-cofounder",
        title: "Co-Founder",
        employmentPeriod: {
          start: "03.2026",
        },
        employmentType: "Full-time",
        icon: <BriefcaseBusinessIcon />,
        description: "Co-founding ARITHI — working on product, tech, and strategy.",
        isExpanded: true,
      },
    ],
    isCurrentEmployer: true,
  },
  {
    id: "girlscript",
    companyName: "GirlScript Summer of Code",
    companyLogo: "",
    location: "Raurkela, Odisha, India",
    locationType: "Remote",
    positions: [
      {
        id: "girlscript-contributor",
        title: "Contributor",
        employmentPeriod: {
          start: "05.2026",
        },
        employmentType: "Full-time",
        icon: <CodeXmlIcon />,
        description: "Open source contributor to GirlScript SoC projects.",
      },
    ],
  },
  {
    id: "ecell-nitr",
    companyName: "Entrepreneurship Cell, NIT Rourkela",
    companyLogo: "",
    location: "Raurkela, Odisha, India",
    locationType: "On-site",
    positions: [
      {
        id: "ecell-tech",
        title: "Technical Team Member",
        employmentPeriod: {
          start: "08.2026",
        },
        employmentType: "Full-time",
        icon: <CodeXmlIcon />,
        description: "Technical team member at E-Cell NIT Rourkela.",
      },
    ],
  },
  {
    id: "axiom-nitr",
    companyName: "Axiom NIT Rourkela",
    companyLogo: "",
    location: "Raurkela, Odisha, India",
    locationType: "On-site",
    positions: [
      {
        id: "axiom-member",
        title: "Member",
        employmentPeriod: {
          start: "02.2026",
        },
        employmentType: "Full-time",
        icon: <BriefcaseBusinessIcon />,
        description: "Maths enthusiast, content writer and designer at Axiom — NIT Rourkela's math club.",
      },
    ],
  },
  {
    id: "axyl-os",
    companyName: "Axyl OS",
    companyLogo: "",
    location: "Remote",
    locationType: "Remote",
    positions: [
      {
        id: "axyl-specialist",
        title: "Linux Specialist",
        employmentPeriod: {
          start: "05.2021",
          end: "05.2022",
        },
        employmentType: "Part-time",
        icon: <CodeXmlIcon />,
        description: "Automated the ISO build process (adopted by EndeavourOS). Developed and maintained packages; supported new users.",
      },
    ],
  },
]
