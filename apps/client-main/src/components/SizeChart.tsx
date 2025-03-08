"use client"

import { trpc } from '@/app/_trpc/client';
import React, { useState, useEffect, useRef } from 'react';

// Modal Size Chart component
export const SizeChart = ({ isOpen, onClose, sizeChartCategoryNameId } : { isOpen: boolean, onClose: () => void, sizeChartCategoryNameId : number}) => {
  const modalRef = useRef(null);
  const chartData = trpc.viewer.sizeChart.getProductSizeChart.useQuery({
    sizeChartCategoryNameId: sizeChartCategoryNameId
  });
  
  // Close when clicking outside the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get all unique sizes across all measurement types
  let allSizes = chartData.isSuccess ? Array.from(
    new Set(
      chartData.data?.data.measurements.flatMap(measurement => 
        measurement.sizeValues.map(sv => sv.size)
      )
    )
  ).sort() : [];
  
  // Create a lookup function to find value for a specific measurement and size
  const getMeasurementValue = (measurementName: string, size: string) => {
    const measurement = chartData.data?.data.measurements.find(m => m.name === measurementName);
    if (!measurement) return "-";
    
    const sizeValue = measurement.sizeValues.find(sv => sv.size === size);
    return sizeValue ? sizeValue.value : "-";
  };

  return (
    <div className="fixed inset-0 flex items-center pt-32 justify-center bg-black/5 z-50">
      <div 
        ref={modalRef}
        className="max-w-3xl w-11/12 backdrop-blur-3xl bg-white/20 p-4 rounded-md shadow-lg text-neutral-900 relative"
      >
        
        {chartData.isLoading ? (
          <p className='text-xs text-neutral-600 text-center py-8'>Loading The Size Chart For You...</p>
        ) : (
          <>
            <h2 className="text-sm text-center font-semibold mb-4 mt-2">{chartData.data?.data.chartName}</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="p-2 text-center border font-normal border-white/10">Size</th>
                    {chartData.data?.data.measurements.map((measurement) => (
                      <th key={measurement.name} className="p-3 text-center border font-normal border-white/10">
                        {measurement.name.charAt(0) + measurement.name.slice(1).toLowerCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allSizes.map((size, index) => (
                    <tr key={size}>
                      <td className="p-2 border border-white/10 text-center">{size}</td>
                      {chartData.data?.data.measurements.map((measurement) => (
                        <td key={`${size}-${measurement.name}`} className="p-3 border border-white/10 font-medium text-center">
                          {getMeasurementValue(measurement.name, size)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};