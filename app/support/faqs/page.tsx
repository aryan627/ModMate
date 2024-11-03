"use client";

import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import React, { useState } from "react";

const faqs = [
  {
    question: "What is ModMate?",
    answer:
      "ModMate is an AI-powered tool that helps you manage and moderate YouTube comments with advanced features like spam detection, AI-powered replies, and batch management.",
  },
  {
    question: "How does the spam detection feature work?",
    answer:
      "The spam detection feature uses AI algorithms to identify and flag spam comments based on specific patterns and suspicious content, allowing you to moderate your comments effectively.",
  },
  {
    question: "What is sentiment analysis and how does it help?",
    answer:
      "Sentiment analysis in ModMate helps you gauge the tone of comments—whether positive, negative, or neutral. This can assist in understanding your audience's reactions and prioritizing engagement.",
  },
  {
    question: "Is ModMate secure?",
    answer:
      "Absolutely. ModMate prioritizes user data protection and follows industry best practices to ensure your data is secure.",
  },
  {
    question: "How can I contact support?",
    answer:
      "You can contact our support team at aryanagabhyru27@gmail.com for any inquiries or help with ModMate.",
  },
];

const FAQPage = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="overflow-hidden">
      <MaxWidthWrapper>
        <div className="py-16 md:py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to the most common questions about ModMate.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-secondary/50"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full text-left flex justify-between items-center text-xl font-semibold"
              >
                {faq.question}
                <span className={`ml-2 transform transition-transform ${expandedIndex === index ? 'rotate-180' : 'rotate-0'}`}>
                  ▼
                </span>
              </button>
              {expandedIndex === index && (
                <div className="mt-2 text-muted-foreground">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default FAQPage;
