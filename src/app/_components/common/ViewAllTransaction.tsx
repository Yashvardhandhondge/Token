import { api } from "@/trpc/server";
import { transactionName, userName } from "@/utils/random";
import Link from "next/link";

const ViewAllTransaction = async () => {
  const data = await api.txn.getLatestTxn({ limit: 10 });
  
  return (
    <section className="w-full px-4 md:px-8 lg:px-12 xl:px-20 py-4">
      <div className="flex flex-col md:flex-row items-center justify-start gap-4 md:gap-12 px-4 mb-6">
        <div className="flex items-center bg-[#38F68F] px-4 py-2">
          <p className="text-[14px] md:text-[16px] font-semibold tracking-[0.2em] text-black">
            GLOBAL TRANSACTION
          </p>
        </div>
        {/* <p className="text-[14px] md:text-[16px] font-semibold tracking-[0.2em] text-white">
          BURN TOKENS
        </p> */}
      </div>
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#38F68F] text-[#A7B0AF]">
            <thead>
              <tr>
                <th className="font-medium uppercase px-4 py-2 text-start text-[14px] md:text-[16px] text-[#A7B0AF]">
                  SENDER ID
                </th>
                <th className="px-4 py-3 text-start text-[14px] md:text-[16px] font-medium uppercase text-[#A7B0AF]">
                  RECEIVER ID
                </th>
                <th className="px-4 py-3 text-start text-[14px] md:text-[16px] font-medium uppercase text-[#A7B0AF]">
                  Amount
                </th>
                <th className="px-4 py-3 text-end text-[14px] md:text-[16px] font-medium uppercase text-[#A7B0AF]">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0,3).map((transaction, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap px-4 py-3 text-[14px] md:text-[16px] font-medium text-white">
                    {userName(transaction.to)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[14px] md:text-[16px] text-white">
                    {transactionName(transaction.id)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[14px] md:text-[16px] text-white">
                    {transaction.amount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-end text-[14px] md:text-[16px] text-white">
                    {transaction.timestamp.seconds.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-end px-4 py-2 text-[14px] md:text-[16px] text-[#38F68F] underline">
          <Link href="/view-all-transactions">
            <p className="bg-transparent border-none cursor-pointer">VIEW MORE</p>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ViewAllTransaction;
