import React, { useState } from 'react';

const SizeChartComponent = () => {
  const [activeTab, setActiveTab] = useState('measurements');
  
  // Sample data based on the schema provided
  const sizeChartData = {
    name: "Oversize T-Shirt Size Chart",
    measurements: [
      { size: "XS", chest: "44", sleeve: "22" },
      { size: "S", chest: "46", sleeve: "23" },
      { size: "M", chest: "48", sleeve: "24" },
      { size: "L", chest: "50", sleeve: "25" },
      { size: "XL", chest: "52", sleeve: "26" },
      { size: "XXL", chest: "54", sleeve: "27" }
    ]
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-center mb-4">{sizeChartData.name}</h2>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'measurements' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('measurements')}
        >
          Measurements (cm)
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'guide' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('guide')}
        >
          Size Guide
        </button>
      </div>
      
      {/* Size Chart Table */}
      {activeTab === 'measurements' && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left font-semibold border border-gray-200">Size</th>
                <th className="p-3 text-left font-semibold border border-gray-200">Chest (cm)</th>
                <th className="p-3 text-left font-semibold border border-gray-200">Sleeve (cm)</th>
              </tr>
            </thead>
            <tbody>
              {sizeChartData.measurements.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 border border-gray-200 font-medium">{item.size}</td>
                  <td className="p-3 border border-gray-200">{item.chest}</td>
                  <td className="p-3 border border-gray-200">{item.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Size Guide */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="font-medium mb-2">How to Measure</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li><span className="font-medium">Chest:</span> Measure around the fullest part of your chest, keeping the measuring tape horizontal.</li>
                <li><span className="font-medium">Sleeve:</span> Measure from the center back of your neck, across your shoulder and down to your wrist.</li>
              </ul>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-2">Fit Guide</h3>
              <p className="text-gray-700 mb-2">This is an oversized fit t-shirt designed to be worn loosely.</p>
              <p className="text-gray-700">If you prefer a more fitted look, we recommend going one size down from your usual size.</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-2">Note:</h3>
            <p className="text-gray-700 text-sm">All measurements are approximate. There may be a slight variation of 1-2cm in the actual product.</p>
          </div>
        </div>
      )}
      
      {/* Care Instructions */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <h3 className="font-medium mb-3">Care Instructions</h3>
        <div className="flex gap-6 flex-wrap">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded">
              <span className="text-sm">30°</span>
            </div>
            <span className="text-xs mt-1">Machine Wash</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded">
              <span className="text-sm">✕</span>
            </div>
            <span className="text-xs mt-1">No Bleach</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded">
              <span className="text-sm">•</span>
            </div>
            <span className="text-xs mt-1">Tumble Dry Low</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded">
              <span className="text-sm">⦵</span>
            </div>
            <span className="text-xs mt-1">Iron Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChartComponent;