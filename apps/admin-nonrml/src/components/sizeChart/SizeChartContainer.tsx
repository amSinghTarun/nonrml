// components/SingleSizeChartClientPage.tsx (Client Component)
"use client"
import { trpc } from "@/app/_trpc/client";
import { SizeChartForm } from "@/components/create/createSizeChart";

// Now receives sizeChartId directly as a prop instead of params
interface SizeChartContainer {
  sizeChartId: string;
}

const SizeChartContainer = ({ sizeChartId }: SizeChartContainer) => {
  const categories = trpc.viewer.sizeChart.getSizeChart.useQuery({id: +sizeChartId});
  
  if (categories.isLoading) return <div>Loading...</div>;
  if (categories.error) return <div>Error: {categories.error.message}</div>;
  if (!categories.data?.data?.length) return <div>No data found</div>;
  
  return (
    <>
      <section className="flex flex-col w-screen h-screen">
        <h1 className="bg-stone-700 text-white p-3">ADD NEW CATEGORY</h1>
        <SizeChartForm 
          parentId={categories.data.data[0].id} 
          parentName={categories.data.data[0].name} 
          parentType={categories.data.data[0].type} 
        />
      </section>
    </>
  )   
}

export default SizeChartContainer;