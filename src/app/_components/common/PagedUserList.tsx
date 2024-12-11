import { Dialog, DialogDescription, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { userName } from "@/utils/random";
import { ChangeEvent, useState } from "react";


const PaginatedUserList = ({userIds, handleSelectUser, handleCoinTransfer, getAmountAfterTxnCost, setAddNote, qrUserId, selectedUser, amount, setAmount, setSelectedUser}: {userIds: string[], handleSelectUser: (userId: string) => void, handleCoinTransfer: (amount: number, selectedUser: string, from: string  ) => void, getAmountAfterTxnCost: (amount: number) => number, setAddNote: (note: string) => void, qrUserId: string, selectedUser: string, amount: number, setAmount: (amount: number) => void, setSelectedUser: (userId: string) => void}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(5);


  // Calculate the indices for slicing
  const startIndex = (currentPage - 1) * rows;
  const endIndex = startIndex + rows;

  // Slice the array for the current page
  const paginatedUsers = userIds.slice(startIndex, endIndex);

  // Calculate total pages
const totalPages = Math.ceil(userIds.length / rows);

  // Navigate to the previous page
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Navigate to the next page
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div>
      {paginatedUsers.map((userId, index) => (
        <div
          key={index}
          className="flex w-full flex-row items-center justify-between gap-4"
        >
          <span className="mt-2 flex w-full items-center gap-2 rounded-[12px] py-3 text-start text-white">
            <p className="h-[2rem] w-[2rem] rounded-full bg-white text-[12px] md:text-[18px]"></p>
            {userName(userId)}
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="mt-4 max-w-[250px] rounded-[10px] bg-[#2DC574] py-3 text-center text-sm text-black w-[150px] md:text-md"
                onClick={() => handleSelectUser(userId)}
              >
                Transfer now
              </button>
            </DialogTrigger>
            <DialogContent className="h-[90vh] w-full border-0 bg-[#262626ED] text-white md:w-screen md:max-w-fit">
                                      <DialogHeader>
                                        <DialogDescription className="flex max-h-[80vh] w-full flex-col justify-center overflow-y-auto px-4 py-40 md:max-h-full md:w-[100vh] md:py-0">
                                          <div className="mt-10 flex flex-row items-center justify-center gap-4 md:mt-20">
                                            <p className="text-[12px] uppercase text-white md:text-[20px]">
                                              Enter Amount :
                                            </p>
                                            <input
                                              minLength={3}
                                              placeholder="8.00"
                                              className="w-1/3 rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 text-end text-[20px] text-white outline-none md:w-1/2 md:text-[24px]"
                                              type="number"
                                              onChange={(
                                                e: ChangeEvent<HTMLInputElement>,
                                              ) => {
                                                setAmount(
                                                  Number(e.target.value),
                                                );
                                              }}
                                            />
                                          </div>
                                          <div className="mt-4 flex flex-row items-center justify-center gap-4 text-white">
                                            <p>
                                              Transfers below 100 are not
                                              allowed.
                                            </p>
                                          </div>

                                          <div className="mt-8 flex w-full flex-col md:flex-row">
                                            <div className="mb-4 flex w-full flex-col items-center justify-center text-white md:mb-0 md:w-1/3">
                                              <div className="text-center text-[14px] md:text-[16px]">
                                                <p>From</p>
                                                <p>
                                                  {userName(qrUserId) ?? ""}
                                                </p>
                                              </div>
                                              <div className="mb-4 mt-4 h-[4rem] w-[4rem] rounded-full bg-white md:mb-8 md:h-[6rem] md:w-[6rem]"></div>
                                              <div className="text-center text-[14px] md:text-[16px]">
                                                <p>Total Sent</p>
                                                <p>{amount ?? 0} Tokens</p>
                                              </div>
                                            </div>
                                            <div className="mb-4 flex w-full items-center justify-center text-center md:mb-0 md:w-1/3">
                                              <div className="text-[14px] md:text-[16px]">
                                                <p className="py-2 text-[14px] uppercase text-white md:text-[16px]">
                                                  Transaction Fees
                                                </p>
                                                <p className="text-[16px] font-semibold text-[#EE1818] md:text-[18px]">
                                                  {(amount ?? 0) -
                                                    getAmountAfterTxnCost(
                                                      amount ?? 0,
                                                    ) >
                                                  0
                                                    ? (amount ?? 0) -
                                                      getAmountAfterTxnCost(
                                                        amount ?? 0,
                                                      )
                                                    : 2}{" "}
                                                  TOKENS
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex w-full flex-col items-center justify-center text-white md:w-1/3">
                                              <div className="text-center text-[14px] md:text-[16px]">
                                                <p>To</p>
                                                <p>
                                                  {userName(selectedUser ?? "")}
                                                </p>
                                              </div>
                                              <div className="mb-4 mt-4 h-[4rem] w-[4rem] rounded-full bg-white md:mb-8 md:h-[6rem] md:w-[6rem]"></div>
                                              <div className="text-center text-[14px] md:text-[16px]">
                                                <p>Total Receivable</p>
                                                <p>
                                                  {getAmountAfterTxnCost(
                                                    amount ?? 0,
                                                  )}{" "}
                                                  Tokens
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-center justify-center">
                                            <input
                                              placeholder="Add Note"
                                              className="rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 text-center text-[20px] text-white outline-none md:text-[24px]"
                                              type="text"
                                              onChange={(e) => {
                                                setAddNote(e.target.value);
                                              }}
                                            />
                                            <button
                                              className="mt-8 w-full max-w-[300px] rounded-[10px] bg-[#38F68F] py-3 text-center text-[24px] font-[600] text-black md:mt-12 md:text-[28px]"
                                              onClick={() =>
                                                handleCoinTransfer(amount ?? 0, selectedUser ?? "", qrUserId ?? "")
                                              }
                                            >
                                              Transfer Now
                                            </button>
                                          </div>
                                        </DialogDescription>
                                      </DialogHeader>
                                    </DialogContent>
          </Dialog>
        </div>
      ))}
      {/* Pagination Controls */}
      {/* <div className="mt-8 flex items-center justify-center gap-4">
        <button
          className="rounded bg-gray-400 px-4 py-2 text-white disabled:opacity-50"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-white">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="rounded bg-gray-400 px-4 py-2 text-white disabled:opacity-50"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div> */}
        <div className="flex w-full md:flex-row md:justify-between mb-18">
                    <div className="flex w-full items-center gap-2 text-white px-3">
                      <label>Show rows:</label>
                      <select
                        name="page_number"
                        className="rounded-[10px] border-none bg-[#38F68F] bg-opacity-25 px-4 py-1 text-white outline-none"
                        onChange={(e) => {
                          setCurrentPage(1);
                          setRows(e.target.value ? Number(e.target.value) : 10);
                        }}
                      >
                        {[2,3,4,5,6].map((number) => (
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
                          className={`rounded px-4 py-2 text-green-500`}
                          disabled={true}
                        >
                          {currentPage}
                        </button>
                      </div>
                      <button
                        onClick={handleNextPage}
                        className="cursor-pointer rounded px-4 py-2 text-white hover:bg-gray-800"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
    </div>
  );
};

export default PaginatedUserList;