import { Footer } from "@/components/Footer";
import { LandingPage } from "@/components/home/landingPage";

export default function Home() {
  return (
    <main className=" flex min-h-screen pt-14 flex-col items-center overflow-y-scroll">
      <LandingPage />
    </main>
  );
}

export const metadata = {
  title: 'My Page',
  description: 'Page description'
};