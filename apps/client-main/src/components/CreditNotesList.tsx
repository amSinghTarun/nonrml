import React, { useState } from 'react';

interface OutputItem {
  creditNote: string;
  email: string;
}

export default function CreditNoteOTPVerification() {
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [outputList, setOutputList] = useState<OutputItem[]>([]);

  // Simulated OTP verification (replace with actual verification logic)
  const handleOTPSubmit = async () => {
    setIsLoading(true);
    
    // Simulated verification - replace with actual backend call
    try {
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock verification (replace with actual logic)
      if (otp === '123456') {
        // Simulated data fetch
        const mockData: OutputItem[] = [
          { creditNote: 'CN-001', email: 'user1@example.com' },
          { creditNote: 'CN-002', email: 'user2@example.com' }
        ];
        
        setOutputList(mockData);
        setIsVerified(true);
      } else {
        alert('Invalid OTP');
      }
    } catch (error) {
      alert('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center pt-32 justify-center bg-black/5 z-50">
      <div className="max-w-3xl w-11/12 backdrop-blur-3xl bg-white/20 p-4 rounded-md shadow-lg text-neutral-900 relative">
        {isLoading ? (
          <p className='text-xs text-neutral-600 text-center py-8'>Verifying OTP...</p>
        ) : !isVerified ? (
          <>
            <h2 className="text-sm text-center font-semibold mb-4 mt-2">OTP Verification</h2>
            <div className="flex flex-col items-center space-y-4">
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full max-w-xs px-3 py-2 text-xs border border-white/10 rounded-md bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleOTPSubmit}
                className="px-4 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Submit OTP
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-sm text-center font-semibold mb-4 mt-2">Verified Output</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="p-2 text-center border font-normal border-white/10">Credit Note</th>
                    <th className="p-2 text-center border font-normal border-white/10">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {outputList.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2 border border-white/10 text-center">{item.creditNote}</td>
                      <td className="p-2 border border-white/10 text-center">{item.email}</td>
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
}