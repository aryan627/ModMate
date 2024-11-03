import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronRightIcon, PlayCircle } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getAuthUrl } from "@/lib/google-auth";

const page = () => {
  const authUrl = getAuthUrl();
  return (
    <div className="overflow-hidden">
      <MaxWidthWrapper>
        <div className="py-20 md:py-28 relative text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary-foreground">
            Effortless YouTube comment moderation with ModMate.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Detect, summarize, and batch delete spam comments with ease. ModMate helps keep your channel clean,engaging,and free from scams.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={authUrl}
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "group w-44",
              })}
            >
              Get Started
              <ChevronRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/about"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "w-44",
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
              title: "Customizable Filters",
              description:
                "Set custom rules for comment filtering based on your channel's needs.",
            },
          ].map((feature, index) => {
            return (
              <div
                className="bg-secondary/50 p-6 rounded-lg hover:shadow-md transition"
                key={index}
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
