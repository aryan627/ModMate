"use client";

import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // Import Swiper styles

const features = [
  {
    title: "AI-Powered Spam Detection",
    description: "Automatically identify and flag spam comments using advanced AI to keep your community clean.",
  },
  {
    title: "Batch Comment Management",
    description: "Review and delete flagged comments in bulk with just a few clicks to save time.",
  },
  {
    title: "AI-Powered Replies",
    description: "Generate engaging, thoughtful replies with AI assistance for streamlined communication.",
  },
  {
    title: "Sentiment Analysis",
    description: "Analyze the sentiment of comments to better understand audience engagement and feedback.",
  },
];

const comingSoonFeatures = [
  {
    title: "Advanced YouTube Analytics",
    description:
      "Gain deeper insights into your video performance and audience behavior.",
  },
  {
    title: "Newsletter Generation",
    description:
      "Turn your video content into newsletters, summarizing key points for your audience.",
  },
  {
    title: "Automatic Chapter Generation",
    description:
      "Effortlessly create chapters for your videos to enhance viewer navigation.",
  },
];

const FeaturesPage = () => {
  return (
    <div className="overflow-hidden">
      <MaxWidthWrapper>
        <div className="py-16 md:py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary-foreground">
            Explore ModMate's Features
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            ModMate provides powerful features to optimize your YouTube management and interaction.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-secondary/50 p-6 rounded-lg hover:shadow-md transition-transform duration-500 hover:scale-105 animate-fade-in max-w-md mx-auto"
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
          <Swiper
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-8"
          >
            {comingSoonFeatures.map((feature, index) => (
              <SwiperSlide key={index}>
                <div className="relative bg-muted/50 p-6 rounded-lg shadow-md hover:shadow-lg transition-transform duration-500 hover:scale-105 animate-fade-in max-w-sm mx-auto">
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    Coming Soon
                  </Badge>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default FeaturesPage;
