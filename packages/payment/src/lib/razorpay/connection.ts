import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const Instance = new Razorpay({ 
  key_id: "rzp_test_dpM31kdWN8H58H",
  key_secret: "vQ3zPC5d2jh0USeUhsOd0jbe"
})

export default Instance;