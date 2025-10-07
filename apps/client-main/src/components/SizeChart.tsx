"use client"

import { trpc } from '@/app/_trpc/client';
import React, { useState, useEffect, useRef } from 'react';

// Modal Size Chart component
export const SizeChart = ({ isOpen, onClose, sizeChartCategoryNameId } : { isOpen: boolean, onClose: () => void, sizeChartCategoryNameId : number}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const chartData = trpc.viewer.sizeChart.getProductSizeChart.useQuery({
    sizeChartCategoryNameId: sizeChartCategoryNameId
  });
  
  // Close when clicking outside the modal
  useEffect(() => {
    const handleClickOutside = (event:any) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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

  // Custom sort function for clothing sizes
  const sortSizes = (sizes: string[]) => {
    const sizeOrder: { [key: string]: number } = {
      'XS': 1,
      'S': 2,
      'M': 3,
      'L': 4,
      'XL': 5,
      'XXL': 6,
      '2XL': 6,
      'XXXL': 7,
      '3XL': 7,
    };

    return sizes.sort((a, b) => {
      // Get order values, default to 999 if not found (for custom sizes)
      const orderA = sizeOrder[a.toUpperCase()] || 999;
      const orderB = sizeOrder[b.toUpperCase()] || 999;
      
      // If both sizes are in our predefined order, use that
      if (orderA !== 999 && orderB !== 999) {
        return orderA - orderB;
      }
      
      // Otherwise, fall back to alphabetical
      return a.localeCompare(b);
    });
  };

  // Get all unique sizes across all measurement types and sort them properly
  let allSizes = chartData.isSuccess ? sortSizes(
    Array.from(
      new Set(
        chartData.data?.data.measurements.flatMap(measurement => 
          measurement.sizeValues.map(sv => sv.size)
        )
      )
    )
  ) : [];
  
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
                        <td key={`${size}-${measurement.name}`} className="p-3 border border-white/10 font-bold text-center">
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