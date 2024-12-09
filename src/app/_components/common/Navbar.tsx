"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import Link from 'next/link'

export const Navbar = () => {
  const { status } = useSession();
  const router = useRouter();

  const handleRulesClick = () => {
    router.push('/rules');
  };

  return (
    <nav className='flex flex-row h-[72px] w-full items-center justify-between text-white bg-black pl-4 sm:pl-8 md:pl-12 fixed z-20'>
      <div className='flex flex-row justify-center items-center gap-2'>
      <Link href="/">
        <img 
          onClick={() => { router.push('/') }} 
          src="/logos/tokenwale-logo.svg" 
          alt="Tokenwale Logo" 
          className='h-8 sm:h-10 cursor-pointer hover:scale-105 transition-transform duration-200'
        />
        </Link>
        <Link href="/">
        <p 
          className='text-white text-sm sm:text-xl sm:flex hidden cursor-pointer hover:text-gray-300 transition-colors duration-200'
        >
          TOKENWALE
        </p>
        </Link>
      </div>
      <div className="flex flex-row items-center justify-center gap-2 sm:gap-8">
        <span className="flex gap-2 sm:gap-8">
          <button className="text-[10px] font-semibold tracking-widest text-white sm:text-base hover:text-gray-300 transition-colors duration-200">
            REWARDS
          </button>
          <button
            className="text-[10px] font-semibold tracking-widest text-white sm:text-base hover:text-gray-300 transition-colors duration-200"
            onClick={handleRulesClick}
          >
            RULES
          </button>
        </span>
        {
          (status == 'authenticated') ?
            <div className="pr-4">
              <Image 
                width={50} 
                height={50} 
                src={'/icons/profile-icon.svg'} 
                alt={''} 
                className="cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => { router.push('/dashboard') }}
              />
            </div> :
            <Link href="/auth/new-wallet">
            <div className='flex flex-row items-center h-full bg-[#38F68F] px-4 sm:px-6 md:px-8 py-7 sm:py-6 cursor-pointer hover:bg-[#2dcf70] transition-colors duration-200'>
              <button 
                className='text-black font-semibold tracking-widest text-xs sm:text-sm md:text-base' 
              >
                CONNECT TO WALLET
              </button>
              <img src="/logos/arrow.svg" alt="Arrow" className='h-4 sm:h-5' />
            </div>
            </Link>
        }
      </div>
    </nav>
  );
};
