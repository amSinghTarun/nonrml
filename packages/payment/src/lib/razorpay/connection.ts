import Razorpay from 'razorpay';
import dotenv from "dotenv";
import path from "path"

// console.log("\n\n\n\n\n\n\n\n\n-CONNECTION", process.env.NODE_ENV)
// if(process.env.NODE_ENV !== 'production'){
//     dotenv.config({path: path.resolve("../../packages/payment/.env.local")})
//     console.log(process.env.RAZORPAY_KEY_ID)
// };

let rzpInstance: Razorpay | null = null;

const Instance = () => {
  console.log("instance created")
  if (!rzpInstance) {
    rzpInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      })
  }
  return rzpInstance
}
export default Instance;