import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScanQrCode, Search } from 'lucide-react'
import Image from 'next/image'
import React, { ChangeEvent, useState } from 'react'
import ScanDialog from './QrScannerPopup'
import { getAmountAfterTxnCost, userName } from '@/utils/random'

  const MobileNav = ({handleSearch, userId, userIds, handleSelectUser, setAmount, qrUserId, selectedUser, addNote, handleCoinTransfer, amount, setAddNote}: {handleSearch:  (userId: string) => void, userId: string, userIds: string[], handleSelectUser: (userId: string) => void, setAmount: (amount: number) => void, qrUserId: string, selectedUser: string | null, addNote: string, handleCoinTransfer: (amount: number) => void, amount: number | null, setAddNote: (note: string) => void}) => {
  
  return (
    <div className='flex flex-row items-center justify-between p-4'>
        <Image
            src="/logos/tokenwale-logo.svg"
            alt="Logo"
            width={43}
            height={43}
        />
        <div className='flex flex-row items-center justify-between gap-4'>
            <Dialog
                      onOpenChange={(e) =>
                        e === false ? handleSearch("") : null
                      }
                    >
                      <DialogTrigger asChild>
                      <Search onClick={() => handleSearch(userId)} color='white' size={24} />
               
                      </DialogTrigger>
                      <DialogContent className="h-[90vh] w-screen border-0 bg-[#262626ED] p-10 text-white md:w-screen md:max-w-fit md:p-16">
                        <DialogHeader>
                          <DialogTitle className="flex justify-between text-[30px] text-white md:text-[30px]">
                            <p>Transfer Tokens</p>
                            <ScanDialog handleSearch={handleSearch} />
                          </DialogTitle>
                          <div className="relative w-full">
                            <input
                              type="number"
                              placeholder="Search by User ID"
                              onChange={(e) => handleSearch(e.target.value)}
                              className="w-full border-b-[1px] border-[#38F68F] bg-[#232323] px-4 py-1 pr-12 text-black outline-none"
                            />
                            <button className="rounded-[0 12px 12px 0] absolute right-0 top-0 h-full px-4 text-black">
                              <Image
                                alt=""
                                height={18}
                                width={18}
                                src="/icons/search-icon.svg"
                              />
                            </button>
                          </div>
                          <DialogDescription className="flex w-full flex-col justify-center px-4 md:w-[100vh] md:flex-row">
                            <div className="flex w-full flex-col">
                              {userIds.map((userId, index) => (
                                <div
                                  key={index}
                                  className="flex w-full flex-row items-center justify-between gap-4"
                                >
                                  <span className="mt-4 flex w-full items-center gap-2 rounded-[12px] py-3 text-start text-white">
                                    <p className="h-[2rem] w-[2rem] rounded-full bg-white text-[12px] md:text-[18px]"></p>
                                    {userName(userId)}
                                  </span>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <button
                                        className="mt-4 w-full max-w-[250px] rounded-[10px] bg-[#2DC574] py-3 text-center text-[18px] text-black md:w-[250px] md:text-[20px]"
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
                                                handleCoinTransfer(amount ?? 0)
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
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
            </Dialog>

           <ScanDialog  handleSearch={handleSearch} scanIcon={<ScanQrCode  color='white' size={24} />} />
        </div>
    </div>
  )
}

export default MobileNav