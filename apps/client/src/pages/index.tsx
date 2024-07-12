import Image from "next/image";
import { Button } from "@repo/ui/button";
import { trpc } from "@nonorml/trpc";


export default function Home() {
  const {error, data} = trpc.hello.useQuery();
  if(error) {
    alert(error.message);
  }
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24`}
    >
      <p>{data}</p>
      <Button appName="Arie">Let's Go</Button>
    </main>
  );
}