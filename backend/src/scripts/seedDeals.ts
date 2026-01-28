import mongoose from "mongoose";
import dotenv from "dotenv";
import Deal from "../models/Deal.js";
import config from "../config/config.js";
import logger from "../utils/logger.js";

dotenv.config();

const sampleDeals = [
  {
    title: "AWS Activate Credits",
    description:
      "Get up to $100,000 in AWS credits for your startup. Build and scale your applications with industry-leading cloud infrastructure. Includes access to technical support and startup resources.",
    partnerName: "Amazon Web Services",
    category: "cloud",
    isLocked: false,
    eligibilityText: "Available to all registered startups",
    dealValue: "$100,000 in credits",
  },
  {
    title: "Google Cloud Credits",
    description:
      "Receive $100,000 in Google Cloud credits valid for 2 years. Access powerful computing, storage, and machine learning capabilities to accelerate your startup journey.",
    partnerName: "Google Cloud",
    category: "cloud",
    isLocked: false,
    eligibilityText: "Available to all registered startups",
    dealValue: "$100,000 in credits",
  },
  {
    title: "HubSpot for Startups",
    description:
      "Get 90% off HubSpot CRM, Marketing, Sales, and Service Hub for your first year. Build better customer relationships and grow your business faster.",
    partnerName: "HubSpot",
    category: "marketing",
    isLocked: true,
    eligibilityText: "Verified startups only - founded within last 2 years",
    dealValue: "90% off for 1 year",
  },
  {
    title: "Notion Plus",
    description:
      "Free Notion Plus for up to 6 months. Collaborate with your team using the all-in-one workspace for notes, docs, wikis, and project management.",
    partnerName: "Notion",
    category: "productivity",
    isLocked: false,
    eligibilityText: "Available to all registered startups",
    dealValue: "6 months free",
  },
  {
    title: "Stripe Atlas",
    description:
      "Incorporate your company, open a bank account, and start accepting payments with $100 credit. Everything you need to launch your startup.",
    partnerName: "Stripe",
    category: "finance",
    isLocked: true,
    eligibilityText: "Verified startups only",
    dealValue: "$100 credit + discounted setup",
  },
  {
    title: "Mixpanel Growth Plan",
    description:
      "Get 1 year of Mixpanel Growth plan for free. Analyze user behavior and make data-driven decisions to improve your product.",
    partnerName: "Mixpanel",
    category: "analytics",
    isLocked: true,
    eligibilityText: "Verified startups with less than $8M in funding",
    dealValue: "$999 value - 1 year free",
  },
  {
    title: "Figma Professional",
    description:
      "Free Figma Professional plan for 1 year. Design and prototype your product with the industry-standard collaborative design tool.",
    partnerName: "Figma",
    category: "design",
    isLocked: false,
    eligibilityText: "Available to all registered startups",
    dealValue: "$180 value - 1 year free",
  },
  {
    title: "GitHub Enterprise",
    description:
      "Get GitHub Team for free for 1 year. Collaborate on code with your team using advanced code review, project management, and CI/CD tools.",
    partnerName: "GitHub",
    category: "development",
    isLocked: false,
    eligibilityText: "Available to all registered startups",
    dealValue: "$48 per user per year",
  },
  {
    title: "Slack Pro",
    description:
      "Receive 25% off Slack Pro for your first year. Communicate and collaborate with your team more effectively.",
    partnerName: "Slack",
    category: "communication",
    isLocked: true,
    eligibilityText: "Verified startups only",
    dealValue: "25% off for 1 year",
  },
  {
    title: "Zendesk for Startups",
    description:
      "Get 6 months of Zendesk Suite free. Build better customer support experiences with ticketing, live chat, and knowledge base tools.",
    partnerName: "Zendesk",
    category: "communication",
    isLocked: true,
    eligibilityText: "Verified startups with less than $5M in funding",
    dealValue: "6 months free",
  },
];

const seedDeals = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info("Connected to MongoDB");

    // Clear existing deals
    await Deal.deleteMany({});
    logger.info("Cleared existing deals");

    // Insert sample deals
    const deals = await Deal.insertMany(sampleDeals);
    logger.info(`Inserted ${deals.length} sample deals`);

    logger.info("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Seed failed:", error);
    process.exit(1);
  }
};

seedDeals();
