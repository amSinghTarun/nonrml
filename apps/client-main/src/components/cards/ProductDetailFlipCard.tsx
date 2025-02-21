import React from 'react';

const InfoCard = ({ title, content }: { title: string, content: React.ReactNode }) => (
  <div className="relative h-48 w-full perspective-1000">
    <div className="absolute w-full h-full transition-transform duration-500 transform-style-preserve-3d hover:rotate-y-180">
      {/* Front side */}
      <div className="absolute w-full h-full bg-white rounded-lg shadow flex items-center justify-center p-4 backface-hidden">
        <span className="font-medium text-neutral-800">{title}</span>
      </div>
      
      {/* Back side */}
      <div className="absolute w-full h-full bg-neutral-800 text-white rounded-lg shadow p-4 backface-hidden rotate-y-180 overflow-auto">
        {content}
      </div>
    </div>
  </div>
);

const ProductDetails = ({ product }: { product: any }) => {
  const sections = [
    {
      title: 'DESCRIPTION',
      content: <div className="text-sm">{product.description}</div>
    },
    {
      title: 'DETAILS',
      content: <ul className="text-sm list-disc pl-4">{product.details.map((detail: string, index: number) => <li key={index}>{detail}</li>)}</ul>
    },
    {
      title: 'CARE',
      content: <ul className="text-sm list-disc pl-4">{product.care.map((careIns: string, index: number) => <li key={index}>{careIns}</li>)}</ul>
    },
    {
      title: 'SHIPPING',
      content: <ul className="text-sm list-disc pl-4">{product.care.map((careIns: string, index: number) => <li key={index}>{careIns}</li>)}</ul>
    }
  ];

  return (
    <>
      <div className=" flex-col text-neutral-800 flex text-xs bg-white bg-opacity-45 rounded-md divide-y divide-black/25 space-y-2 px-3 py-3 shadow-black/15 shadow">
        <div className="flex">
          <span className="font-normal text-start basis-1/3 flex items-center">DESCRIPTION</span>
          <div className="basis-2/3 font-light text-neutral-600">{product.description}</div>
        </div>

        <div className="flex pt-2">
          <span className="font-normal text-start basis-1/3 flex items-center">DETAILS</span>
          <ul className="basis-2/3 font-light">{product.details.map((detail: string, index: number) => <li key={index}>{detail}</li>)}</ul>
        </div>

        <div className="flex pt-2">
          <span className="font-normal basis-1/3 text-start flex items-center">CARE</span>
          <ul className="basis-2/3 font-light">{product.care.map((careIns: string, index: number) => <li key={index}>{careIns}</li>)}</ul>
        </div>

        <div className="flex pt-2 justify-center">
          <span className="font-normal text-start basis-1/3 flex items-center">SHIPPING</span>
          <ul className="basis-2/3 font-light">{product.care.map((careIns: string, index: number) => <li key={index}>{careIns}</li>)}</ul>
        </div>
      </div>

    </>
  );
};

export default ProductDetails;