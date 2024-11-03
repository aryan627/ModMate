"use client";

import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

const pricingOptions = [
  {
    title: "Basic Plan",
    price: "$0",
    description: "Ideal for light users",
    features: ["Delete up to 20 comments per month", "Community support"],
    limitations: ["Limited to basic features"],
    buttonText: "Get started for free",
    popular: false,
  },
  {
    title: "Standard Plan",
    price: "$10",
    description: "For regular users",
    features: ["Delete up to 100 comments per month", "Priority support"],
    limitations: [],
    buttonText: "Upgrade to Standard",
    popular: true,
  },
  {
    title: "Pro Plan",
    price: "$25",
    description: "For power users and professionals",
    features: ["Unlimited comment deletions", "24/7 premium support", "Access to advanced analytics"],
    limitations: [],
    buttonText: "Go Pro",
    popular: false,
  },
];

const PricingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200); // Delay for animation
    return () => clearTimeout(timer);
  }, []);

  return (
    <MaxWidthWrapper className="py-24 min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className={`py-16 md:py-20 text-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary-foreground">
          Affordable, straightforward plans
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Select the plan that fits your needs best. No hidden fees, just honest pricing.
        </p>
        <p className="text-xl text-muted-foreground">
          *All plans are billed monthly without any long-term commitments*
        </p>
      </div>
      <div className="flex justify-center items-center text-2xl font-bold mb-12">
        <span className="bg-primary/10 text-primary px-4 py-2 rounded-full">
          Monthly Billing
        </span>
      </div>
      <div className="grid md:grid-cols-3 gap-8 lg:gap-12 lg:items-stretch">
        {pricingOptions.map((option, index) => (
          <Card
            key={index}
            className={`relative overflow-hidden transition-all duration-300 ${
              option.popular
                ? "border-primary shadow-lg hover:shadow-xl"
                : "hover:border-primary/50 hover:shadow-md"
            }`}
          >
            {option.popular && (
              <div className="absolute top-0 right-0">
                <Badge className="m-2 py-1.5 uppercase bg-primary text-primary-foreground">
                  Best value
                </Badge>
              </div>
            )}
            <CardHeader className="text-center pb-8 pt-10">
              <CardTitle className="text-3xl font-bold mb-2">
                {option.title}
              </CardTitle>
              <span className="text-5xl font-extrabold">{option.price}</span>
              {option.price !== "$0" && (
                <span className="text-xl text-muted-foreground">/month</span>
              )}
            </CardHeader>
            <CardDescription className="text-center px-4 pb-4">
              {option.description}
            </CardDescription>
            <CardContent>
              <ul className="space-y-4 mb-8">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="w-4 h-4 mr-2 text-primary" />
                    {feature}
                  </li>
                ))}
                {option.limitations?.map((limitation, index) => (
                  <li key={index} className="flex items-center">
                    <XIcon className="w-4 h-4 mr-2 text-red-500" />
                    {limitation}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full py-6 text-lg ${
                  option.popular
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                }`}
              >
                {option.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </MaxWidthWrapper>
  );
};

export default PricingPage;
