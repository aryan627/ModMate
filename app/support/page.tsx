"use client";

import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import { MailIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const supportSections = [
  {
    title: "Getting Started",
    description: "Learn how to set up and start using ModMate with our comprehensive guide.",
    link: "/features", // Updated to link to the features page
  },
  {
    title: "FAQs",
    description: "Find answers to the most frequently asked questions about ModMate.",
    link: "/support/faqs",
  },
  {
    title: "Troubleshooting",
    description: "Having issues? Visit our troubleshooting section for common solutions.",
    link: "/features", // Updated to link to the features page
  },
  {
    title: "Contact Support",
    description: "Still need help? Reach out to our support team for further assistance.",
    link: "mailto:aryanagabhyru27@gmail.com", // Updated to mailto link
  },
];

const SupportPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200); // Delay for animation
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="overflow-hidden">
      <MaxWidthWrapper>
        <div className={`py-16 md:py-20 text-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary-foreground">
            We're Here to Help
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers, resources, and contact information to help you make the most of ModMate.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {supportSections.map((section, index) => (
            <div
              key={index}
              className="bg-secondary/50 p-6 rounded-lg hover:shadow-md transition-transform duration-500 hover:scale-105 animate-fade-in"
            >
              <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
              <p className="text-muted-foreground mb-4">{section.description}</p>
              <Link href={section.link} prefetch={false}>
                <span className="text-primary hover:underline">Learn more &rarr;</span>
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <MailIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-lg">
                <a href="mailto:aryanagabhyru27@gmail.com" className="text-primary hover:underline">
                  aryanagabhyru27@gmail.com
                </a>
              </span>
            </div>
            <p className="text-muted-foreground">
              For any further questions or specific support inquiries, feel free to reach out via email.
            </p>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default SupportPage;
