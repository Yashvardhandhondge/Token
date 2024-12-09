"use client";
import { api } from "@/trpc/react";
import { formatFirestoreTimestamp, userName } from "@/utils/random";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";
import React from "react";
interface Transaction {
  from: string;
  to: string;
  amount: number;
  timestamp: Timestamp | { _seconds: number; _nanoseconds: number };
}
const Spinner = () => (
  <div className="flex h-full items-center justify-center">
    <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-solid border-green-500"></div>
  </div>
);
export const HeroTable = () => {
  const { data, isLoading } = api.txn.getLatestTxn.useQuery({
    limit: 3,
  });


  return (
    <section className="w-full px-4 py-4 md:px-8 lg:px-12 xl:px-20">
      <div className="mb-6 flex flex-col items-center justify-start gap-4 px-4 md:flex-row md:gap-12">
        <div className="flex items-center bg-[#38F68F] px-4 py-2">
          <p className="text-[14px] font-semibold tracking-[0.2em] text-black md:text-[16px]">
            GLOBAL TRANSACTION
          </p>
        </div>
        {/* <p className="text-[14px] font-semibold tracking-[0.2em] text-white md:text-[16px]">
          BURN TOKENS
        </p> */}
      </div>
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[#38F68F] text-[#A7B0AF]">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-start text-[14px] font-medium uppercase text-[#A7B0AF] md:text-[16px]">
                    SENDER ID
                  </th>
                  <th className="px-4 py-3 text-start text-[14px] font-medium uppercase text-[#A7B0AF] md:text-[16px]">
                    RECIEVER ID
                  </th>
                  <th className="px-4 py-3 text-start text-[14px] font-medium uppercase text-[#A7B0AF] md:text-[16px]">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-end text-[14px] font-medium uppercase text-[#A7B0AF] md:text-[16px]">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.map((transaction: Transaction, index: number) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-4 py-3 text-[14px] font-medium text-white md:text-[16px]">
                      {userName(transaction.from)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[14px] text-white md:text-[16px]">
                      {userName(transaction.to)}
                      {/* {transactionName(transaction.id)} */}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[14px] text-white md:text-[16px]">
                      {transaction.amount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-end text-[14px] text-white md:text-[16px]">
                      {formatFirestoreTimestamp(transaction.timestamp)?.date}{" "}
                      {formatFirestoreTimestamp(transaction.timestamp)?.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-6 flex justify-end px-4 py-2 text-[14px] text-[#38F68F] underline md:text-[16px]">
          <Link href="/view-all-transactions">
            <p className="cursor-pointer border-none bg-transparent">
              VIEW MORE
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
};
