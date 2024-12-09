import { HeroTable } from "@/app/_components/landing-page/HeroTable";
import { LandingPageFooter } from "@/app/_components/landing-page/LandingPageFooter";
import { Navbar } from "../../app/_components/common/Navbar";
import React, { useState } from "react";
import { api } from "@/trpc/react";
import { formatFirestoreTimestamp, userName } from "@/utils/random";

const Spinner = () => (
  <div className="flex h-full items-center justify-center">
    <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-solid border-green-500"></div>
  </div>
);

const Viewall = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3);
  const [rows, showRows] = useState(10);
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
  } = api.txn.getLatestTxnInf.useInfiniteQuery(
    {
      limit: rows,
    },
    {
      getNextPageParam: (last) => last.lastVisible,
      getPreviousPageParam: (prev) => prev.lastVisible,
    },
  );

  const numbers = Array.from({ length: 3 }, (_, i) => (i + 1) * 10);

  const handleNextPage = async () => {
    await fetchNextPage();
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageNumberClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <section className="w-full">
      <Navbar />
      <div className="flex flex-col gap-8 px-4 py-4 pt-10 text-white md:flex-row md:px-8 lg:px-12 xl:px-20">
        <div className="dashboard-card-bg mt-12 flex h-[210px] w-full items-center justify-center rounded-xl border-[1px] border-[#2D2D2D] text-[50px] md:w-full">
          ADS
        </div>
      </div>
      <section className="w-full px-4 py-4 md:px-8 lg:px-12 xl:px-20">
        <div className="mb-6 flex flex-col items-center justify-start gap-4 px-4 md:flex-row md:gap-12">
          <div className="flex items-center bg-[#38F68F] px-4 py-2">
            <p className="text-[14px] font-semibold tracking-[0.2em] text-black md:text-[16px]">
              GLOBAL TRANSACTION
            </p>
          </div>
        </div>
        <div className="flex flex-col">
          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#38F68F] text-[#A7B0AF]">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-start text-[14px] font-medium uppercase text-[#A7B0AF] md:text-[16px]">
                        SENDER ID
                      </th>
                      <th className="px-4 py-3 text-start text-[14px] font-medium uppercase text-[#A7B0AF] md:text-[16px]">
                        RECEIVER ID
                      </th>
                      <th className="px-4 py-3 text-start text-[14px] font-medium uppercase text-[#A7B0AF] md:text-[16px]">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-end text-[14px] font-medium uppercase text-[#A7B0AF] md:text-[16px]">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.pages[currentPage - 1]?.transactions.map(
                      ({ amount, from, id, timestamp, to }) => (
                        <tr key={id}>
                          <td className="whitespace-nowrap px-4 py-3 text-[14px] font-medium text-white md:text-[16px]">
                            {userName(from)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[14px] text-white md:text-[16px]">
                            {userName(to)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[14px] text-white md:text-[16px]">
                            {amount}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-end text-[14px] text-white md:text-[16px]">
                            {formatFirestoreTimestamp(timestamp)?.date}{" "}
                            {formatFirestoreTimestamp(timestamp)?.time}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end px-4 py-2 text-[14px] text-[#38F68F] md:text-[16px]">
                <div className="flex w-full flex-col md:flex-row md:justify-between">
                  <div className="flex w-full items-center gap-2 text-white">
                    <label>Show rows:</label>
                    <select
                      name="page_number"
                      className="rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 text-white outline-none"
                      onChange={(e) =>
                        showRows(e.target.value ? Number(e.target.value) : 10)
                      }
                    >
                      {numbers.map((number) => (
                        <option
                          key={number}
                          className="text-black"
                          value={number}
                        >
                          {number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-4 flex w-1/3 items-center justify-between">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="cursor-pointer rounded px-4 py-2 text-white hover:bg-gray-800"
                    >
                      &lt;
                    </button>
                    <div className="flex gap-2">
                      <button
                        disabled={true}
                        className={`rounded px-4 py-2 text-green-500`}
                      >
                        {currentPage}
                      </button>
                    </div>
                    <button
                      onClick={handleNextPage}
                      disabled={hasNextPage === false}
                      className="cursor-pointer rounded px-4 py-2 text-white hover:bg-gray-800"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      <LandingPageFooter />
    </section>
  );
};

export default Viewall;
