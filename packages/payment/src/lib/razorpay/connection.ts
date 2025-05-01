import Razorpay from 'razorpay';
import { loadEnv } from "@nonrml/common";

loadEnv("../../packages/payment/.env.local", "INDEX PAYMENT");

let rzpInstance: Razorpay | null = null;

const Instance = () => {
  console.log("instance created", process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET)
  if (!rzpInstance) {
    rzpInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      })
  }
  console.log(rzpInstance)
  return rzpInstance
}
export default Instance;