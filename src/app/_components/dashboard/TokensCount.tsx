// TokensCount (Client Component)
'use client';

import { TOTAL__TOKEN } from '@/utils/random';
import Image from 'next/image';
import React from 'react';

const TokensCount = ({ burnt, remainingToken }: { burnt: number; remainingToken: number }) => {
    const circulatingSupply = remainingToken;
    const maxSupply = TOTAL__TOKEN;
    const minedSupply = (TOTAL__TOKEN - remainingToken - burnt);
    const burntSupply = burnt;
  return (
    <div className="space-y-4 text-[#38F68F] w-full">
            <div className="">
                    <div className="text-[16px] flex flex-row items-center gap-2"><Image
                      width={18}
                      height={18}
                      src="/icons/generate-dash-icon.svg"
                      alt=""
                      className="cursor-pointer"
                    />
                     <p className="text-[16px] flex-1">Circulating Supply </p>
                     <p className="text-[16px] text-white text-end">{circulatingSupply}</p></div>
                    <div className="mt-2">
                       
                        <div className="h-1.5 w-full rounded-full bg-gray-500">
                          <div className="h-1.5 rounded-full bg-white" style={{ width: `${(remainingToken / TOTAL__TOKEN) * 100}%` }}></div>
                        </div>
                    </div>
            </div>
            <div>
            <div className="text-[16px] flex flex-row items-center gap-2"><Image
                      width={18}
                      height={18}
                      src="/icons/generate-dash-icon.svg"
                      alt=""
                      className="cursor-pointer"
                    />
                     <p className="text-[16px] flex-1">Burnt Tokens</p>
                     <p className="text-[16px] text-white text-end">{burntSupply}</p></div>
            </div>
            <div>
            <div className="text-[16px] flex flex-row items-center gap-2"><Image
                      width={18}
                      height={18}
                      src="/icons/generate-dash-icon.svg"
                      alt=""
                      className="cursor-pointer"
                    />
                     <p className="text-[16px] flex-1">Max Token Supply </p>
                    <p className="text-[16px] text-white text-end">{maxSupply}</p></div>
            </div>
            <div>
            <div className="text-[16px] flex flex-row items-center gap-2"><Image
                      width={18}
                      height={18}
                      src="/icons/generate-dash-icon.svg"
                      alt=""
                      className="cursor-pointer"
                    />
                     <p className="text-[16px] flex-1">Tokens Mined </p>
                    <p className="text-[16px] text-white text-end">{minedSupply}</p></div>
            </div>
          </div>
  );
};

export default TokensCount;