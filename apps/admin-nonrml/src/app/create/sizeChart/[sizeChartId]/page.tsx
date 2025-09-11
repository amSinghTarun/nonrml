import SizeChartContainer from "@/components/sizeChart/SizeChartContainer";

// app/create/sizeChart/[sizeChartId]/page.tsx (Server Component)
export default async function Page({ params } : { params: Promise<{ sizeChartId: string }> }) {  
  const { sizeChartId } = await params;
  // This is a server component that simply passes the resolved params to client component
  return <SizeChartContainer sizeChartId={sizeChartId} />
  }