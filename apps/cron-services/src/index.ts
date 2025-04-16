import cron from "node-cron";
import { prisma } from "@nonrml/prisma";
import { redis } from "@nonrml/cache";

const startCronJobs = () => {
  console.log("Starting Cron Jobs...");

  // Example: Daily job at midnight
  cron.schedule("0 2 * * *", async () => {
    
    console.log("Running daily task to update the product visit count ...");
    const productsCounts = await redis.redisClient.json.get<{[id: string]: number}[]>("VISITED");


    if(!productsCounts || Object.keys(productsCounts).length === 0){
      console.log("No product visited today, sad!")
      return;
    }

    // Create CASE statement for bulk increment
    const caseSQL = Object.entries(productsCounts)
      .map(([id, count]) => `WHEN id = ${+id} THEN "visitedCount" + ${count}`)
      .join(' ');

    const idList = Object.keys(productsCounts).map(id => +id).join(',');

    const rawQuery = `
      UPDATE "Products" 
      SET "visitedCount" = CASE ${caseSQL} ELSE "visitedCount" END
      WHERE id IN (${idList});
    `;

    console.log(rawQuery)
    try{
      const result = await prisma.$executeRawUnsafe(rawQuery);
      if(result)
        await redis.redisClient.json.set("VISITED", "$", {});
    } catch(error){
      console.log(error)
    }

  });
  
  console.log("Cron Jobs Initialized.");
};

startCronJobs();