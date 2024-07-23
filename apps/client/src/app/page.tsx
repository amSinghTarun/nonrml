import { Inter, Eagle_Lake } from "next/font/google";
import { HomeDisplayText } from "@/components/home/DisplayText";

export default function Home() {
  return (
    <main className="bg-red-400 static flex min-h-screen flex-col items-center p-24  overflow-y-scroll">
      <HomeDisplayText />
      <HomeDisplayText />
      <HomeDisplayText />
    </main>
  );
}
