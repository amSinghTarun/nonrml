import cron from "node-cron";
import { prisma } from "@nonrml/prisma";
import { redis } from "@nonrml/cache";

const startCronJobs = () => {
  console.log("Starting Cron Jobs...");

  // Example: Daily job at midnight
  cron.schedule("0 3 * * *", async () => {
    
    console.log("Running daily task to update the product visit count ...");
    const productsCounts = await redis.redisClient.json.get<{[id: string]: number}[]>("VISITED");

    if(!productsCounts || Object.keys(productsCounts).length === 0)
        return;

    // Create CASE statement for bulk increment
    const cases = Object.keys(productsCounts).map(productId  => {
        return `WHEN id = ${+productId} THEN "visitedCount" + ${productsCounts[productId as keyof typeof productsCounts]}`;
    }).join(' ');

    const productIds = Object.keys(productsCounts);

    // This will generate and execute SQL that looks like:
    // UPDATE products 
    // SET "visitedCount" = CASE 
    //   WHEN id = 1 THEN "visitedCount" + 150 
    //   WHEN id = 2 THEN "visitedCount" + 300 
    //   WHEN id = 3 THEN "visitedCount" + 75 
    // END
    // WHERE id IN (1,2,3)
    
    await prisma.$executeRaw`
        UPDATE products 
        SET "visitedCount" = CASE ${cases} END
        WHERE id IN (${productIds})
    `;

    await redis.redisClient.json.set("VISITED", "$", {});
  });
  
  console.log("Cron Jobs Initialized.");
};

startCronJobs();