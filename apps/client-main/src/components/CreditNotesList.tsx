"use client"

import React, { useState } from 'react';
import { GeneralButton } from './ui/buttons';
import { trpc } from '@/app/_trpc/client';
import { useToast } from '@/hooks/use-toast';
import { Cross2Icon } from "@radix-ui/react-icons"

interface OutputItem {
  creditCode: string;
  email: string;
}

export default function CreditNoteOTPVerification({closeHandler}:{closeHandler: ()=>void}) {
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [outputList, setOutputList] = useState<OutputItem[]>([]);
  const creditNote = trpc.useUtils();
  const { toast } = useToast();

  const handleOTPSubmit = async () => {
    try{
        setIsLoading(true)
        const creditNoteData = await creditNote.viewer.creditNotes.getAllCreditNotes.fetch({otp: otp})
        if(creditNoteData) {
          setIsLoading(false)
          setIsVerified(true)
          setOutputList(creditNoteData.data);
        }
    } catch(error:any) {
        setIsLoading(false)
        toast({variant:"destructive", title: error.message ?? "Can'nt serve you right now, Sorry!", duration:5000 })
    }
}

  return (
    <div className="fixed inset-0 flex items-center pt-20 justify-center backdrop-blur-sm z-50 text-xs bg-black/10">
      <div className="max-w-3xl w-11/12 max-h-[70%] shadow-md shadow-neutral-200 bg-white/95 p-4 rounded-md text-neutral-900 relative flex flex-col">
        <Cross2Icon className='text-neutral-700 cursor-pointer absolute right-2 top-2' onClick={closeHandler}></Cross2Icon>
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
                className="w-full max-w-xs px-3 py-2 border border-neutral-100 rounded-md focus:outline-none "
              />
              <GeneralButton 
                onClick={handleOTPSubmit}
                className='p-3'
                display='Submit OTP'
              />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-sm text-center font-semibold mb-4 mt-2">Credit Notes</h2>
            <div className='flex-grow overflow-auto'>
              <table className="w-full text-xs">
                <tbody>
                  {outputList.map((item, index) => (
                    <tr 
                      key={index} 
                      className='p-2 shadow-sm shadow-neutral-200 rounded-sm flex flex-row justify-between mb-2 bg-white'
                    >
                      <td>{item.creditCode}</td>
                      <td>{item.email}</td>
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