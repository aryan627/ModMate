"use client";

import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronRightIcon, PlayCircle } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const typewriterTexts = [
  "Spam Detection. AI-Powered Replies.",
  "Effortless Moderation with ModMate."
];

const TypewriterEffect: React.FC = () => {
  const [currentText, setCurrentText] = useState("");
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isFinished) return;
    if (index >= typewriterTexts.length) {
      setIsFinished(true);
      return;
    }

    const handleTyping = () => {
      const fullText = typewriterTexts[index];

      if (isDeleting) {
        setCurrentText(fullText.substring(0, subIndex - 1));
        setSubIndex(subIndex - 1);
      } else {
        setCurrentText(fullText.substring(0, subIndex + 1));
        setSubIndex(subIndex + 1);
      }

      if (!isDeleting && subIndex === fullText.length) {
        if (index === typewriterTexts.length - 1) {
          setIsFinished(true); // Stop typing at the last phrase
          return;
        }
        setTimeout(() => setIsDeleting(true), 500); // Short pause before deleting
      } else if (isDeleting && subIndex === 0) {
        setIsDeleting(false);
        setIndex(index + 1);
      }
    };

    const typingSpeed = isDeleting ? 20 : 50; // Faster typing speed for snappiness
    const timeout = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, subIndex, index, isFinished]);

  return (
    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary-foreground">
      {currentText}
    </h1>
  );
};

const page = () => {
  return (
    <div className="overflow-hidden">
      <MaxWidthWrapper>
        <div className="py-20 md:py-28 relative text-center">
          <TypewriterEffect />
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Detect, summarize, and batch delete spam comments with ease. ModMate helps keep your channel clean, engaging, and free from scams. With AI-powered replies, you can conveniently respond to your users, saving time and effort.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signin"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "group w-44 transition-transform hover:scale-105 duration-300",
              })}
            >
              Get Started
              <ChevronRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="/features"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "w-44 transition-transform hover:scale-105 duration-300",
              })}
            >
              Learn more
            </Link>
          </div>
        </div>
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "AI-Powered Detection",
              description:
                "Leverage the power of AI to detect and highlight spam comments instantly.",
            },
            {
              title: "Batch Processing",
              description:
                "Review and delete multiple flagged comments with a single click.",
            },
            {
              title: "AI-Powered Replies",
              description:
                "Generate and send AI-powered replies to conveniently respond to your users.",
            },
          ].map((feature, index) => {
            return (
              <div
                key={index}
                className="bg-secondary/50 p-6 rounded-lg hover:shadow-md transition-transform duration-500 hover:scale-105 animate-fade-in"
              >
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
          <div className="col-span-full flex justify-center mt-24">
            <Button variant="outline" size="lg">
              <PlayCircle className="mr-2 h-6 w-6" />
              Watch demo
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default page;
