"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Workflow, Github, Twitter, Linkedin } from "lucide-react";
import { Footer as AnimatedFooter } from "@/components/ui/modem-animated-footer";
import Image from "next/image";
export default function Footer() {
  const socialLinks = [
    {
      icon: <Github className="w-6 h-6" />,
      href: "https://github.com/",
      label: "GitHub",
    },
    // {
    //   icon: <Twitter className="w-6 h-6" />,
    //   href: "https://twitter.com/flowkit",
    //   label: "Twitter",
    // },
    {
      icon: <Linkedin className="w-6 h-6" />,
      href: "https://www.linkedin.com/company",
      label: "LinkedIn",
    },
  ];

  const navLinks = [
    { label: "Workflows", href: "/workflows" },
    { label: "AI Builder", href: "/ai-builder" },
    { label: "Categories", href: "/#categories" },
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ];

  return (
    <AnimatedFooter
      brandName="Fluxora"
      brandDescription="Production-ready automation workflows for modern teams.  Trusted & Maintained by Cipher Labs."
      socialLinks={socialLinks}
      navLinks={navLinks}
      brandIcon={
        <Image
          src="/LogoHero.svg"
          alt=""
          height={100}
          width={100}
          className="object-contain"
          unoptimized
        />
      }
    />
  );
}
