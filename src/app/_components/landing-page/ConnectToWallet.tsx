"use client";
import { useRouter } from 'next/navigation';
import React from 'react';

export const ConnectToWallet = () => {
  const router = useRouter();
  return (
    <section className='w-full md:h-[70vh] h-[50vh] flex flex-col items-center'>
      <img
        className='absolute left-0 md:-mt-20 -mt-10 w-1/4 md:w-[16%]'
        src="/backgrounds/connect-coin-1.png"
        alt="Connect Coin 1"
      />
      <div className='md:h-[476px] h-[276px] bg-[#38F68F] w-full flex justify-center items-center flex-col'>
        <p className='uppercase text-[24px] md:text-[64px] w-11/12 md:w-2/3 text-center font-[700] text-[#19231E]'>
          Want to play and earn without any cash?
        </p>
        <button
          onClick={() => { router.push('/auth/new-wallet'); }}
          className='text-white font-semibold tracking-[0.2em] text-[14px] md:text-[16px] bg-black p-2 md:p-4 mt-4 hover:bg-gray-800 transition-colors duration-200'
        >
          Connect to Wallet
        </button>
      </div>
      <img
        className='w-full relative md:-mt-20 -mt-8'
        src="/backgrounds/bottom-vector-hero.png"
        alt="Bottom Vector"
      />
      <img
        className='absolute right-0 mt-32 w-1/4 md:w-[20%] lg:w-[16%]'
        src="/backgrounds/connect-coin-2.png"
        alt="Connect Coin 2"
      />
    </section>
  );
};
