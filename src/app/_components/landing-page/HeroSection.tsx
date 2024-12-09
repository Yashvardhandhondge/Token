/* eslint-disable @next/next/no-img-element */
import { api } from "@/trpc/server";
import { TOTAL__TOKEN } from "@/utils/random";
import Image from "next/image";
import React from "react";

export const HeroSection = async () => {
  const { burnt, remainingToken } = await api.global.getRemainingToken();
  return (
    <section>
      <div className="coin-bg animate-fadeIn relative h-screen pt-[72px]">
        <div className="flex h-[90vh] w-full flex-col items-center justify-center px-2">
          <p className="animate-slideInLeft mb-4 text-center text-[10px] tracking-[0.4em] text-[#38F68F] md:text-[16px]">
            A PLAY TO EARN TOKEN GAME FOR
          </p>
          <div className="flex w-[70%] flex-col text-center text-[40px] text-white md:text-[96px]">
            <div className="animate-slideInLeft flex justify-start">
              <p>REDEFINING</p>
            </div>
            <div className="animate-slideInRight flex justify-end">
              <p>REWARD SYSTEM</p>
            </div>
          </div>
        </div>
        <button className="absolute bottom-16 right-[1rem] animate-bounce rounded-full sm:right-[3rem]">
          <Image
            height={100}
            width={100}
            src="/icons/download.svg"
            className="z-40 h-2/3 w-2/3 sm:h-full sm:w-full"
            alt="download"
          />
        </button>
        <div className="relative w-full">
          <Image
            src="/backgrounds/bottom-vector-hero-1.png"
            alt=""
            // layout="responsive"
            width={4000}
            height={10}
            className="absolute left-0 top-0 -mt-4 h-auto w-full md:-mt-12"
          />
        </div>{" "}
      </div>
      <div className="animate-fadeIn flex h-[50vh] items-center justify-center bg-black md:h-[100vh]">
        <span className="flex w-[80%] flex-col justify-center uppercase text-white">
          <p className="mb-4 text-[10px] text-[#38F68F] sm:text-[16px]">{`//ABOUT`}</p>
          <p className="text-[20px] md:text-[48px]">
            Tokenwale redefines the REWARD industry. Original and renowned Web2
            SYSTEM IS transformed in play-to-earn games that unlock ownership
            and rewards for the community.
          </p>
        </span>
      </div>
      <img
        className="absolute right-0 -mt-10 h-60 w-auto md:-mt-48 md:h-auto md:w-auto"
        src="/backgrounds/coin.png"
        alt=""
      />
      <div className="animate-fadeIn flex h-[60vh] items-center justify-center rounded-[59px] uppercase md:h-[80vh]">
        <span className="coin-card-bg flex h-2/3 w-[80%] flex-col items-center justify-center rounded-[59px] border-[1px] border-[#99db96] bg-opacity-30 bg-clip-padding backdrop-blur-sm backdrop-filter">
          <p className="text-[20px] text-[#38F68F] sm:text-[30px] md:text-[44px] lg:text-[60px]">
            {remainingToken.toLocaleString()}
          </p>
          <p className="text-[16px] font-[500] text-[#A6A6A6] sm:text-[24px] md:text-[32px] lg:text-[48px]">
            Tokens left
          </p>
          <p className="text-[12px] tracking-widest text-white sm:text-[16px] md:text-[20px] lg:text-[24px]">
            Grab the tokens before its too late
          </p>
          <div className="mt-8 flex w-2/3 flex-row items-center justify-between gap-8 text-[#38F68F] md:flex-row">
            <div className="flex flex-col justify-end">
              <span className="flex gap-2 text-[12px] md:text-[20px]">
                <Image
                  width={18}
                  height={18}
                  src={"/icons/generate-dash-icon.svg"}
                  alt={""}
                />
                <p>TOKENS mined</p>
              </span>
              <p className="ml-6 text-[20px] text-white md:text-[30px]">
                {(TOTAL__TOKEN - remainingToken).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col justify-end">
              <span className="flex gap-2 text-[12px] md:text-[20px]">
                <Image
                  width={18}
                  height={18}
                  src={"/icons/generate-dash-icon.svg"}
                  alt={""}
                />
                <p>BURNT TOKENS</p>
              </span>
              <p className="ml-6 text-[20px] text-white md:text-[30px]">
                {burnt.toLocaleString()}
              </p>
            </div>
          </div>
        </span>
      </div>
    </section>
  );
};
