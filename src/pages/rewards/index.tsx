"use client";
import { Navbar } from '../../app/_components/common/Navbar';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';


const Rewards = () => {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const handleScan = (data: any) => {
  //   if (data) {
 
  //     setResult(data.text || JSON.stringify(data));
  //     console.log(data.text || JSON.stringify(data))
  //   } else {
  //     setResult(null);
  //   }
  // };

  const handleError = (error: Error) => {
    setError(error);
  };

  return (
    <section className='w-full'>
      <Navbar />      
      <div className='w-full flex flex-row'>
        <div className='w-[45%] rule-bg-2 md:flex hidden flex-col justify-end items-start text-[48px] text-white'>
          <div className='bg-black bg-opacity-20 shadow-lg backdrop-blur-md border-white border-opacity-30 w-full py-8 px-12'>
            <p>Rules</p>
          </div>
        </div>
        <div className='w-full md:w-[55%] h-full min-h-screen bg-black pb-12'>
          {/* <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>
            {result && <p className="mt-4 text-lg">QR Code Result: {result}</p>}
            {error && <p className="mt-4 text-red-500">Error: {error.message}</p>}
          </div> */}
        </div>
      </div>
    </section>
  );
}

export default Rewards;
