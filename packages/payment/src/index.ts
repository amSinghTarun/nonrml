import { loadEnv } from "@nonrml/common";

loadEnv("../../packages/payment/.env.local", "INDEX PAYMENT");

export * from "./lib/razorpay"
