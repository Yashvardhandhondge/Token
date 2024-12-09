import React, { useEffect, useState } from "react";
import randomWords from "random-words";
import { generate, count } from "random-words";
import { api } from "@/trpc/react";
import useLocalStorage from "@/hooks/storage/localStorage";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const NewWallet = () => {
  const [names, setNames] = useState([
    "Alice",
    "Bob",
    "Tom",
    "David",
    "Emma",
    "Frank",
    "Grace",
    "Henry",
    "Ivy",
    "Jack",
    "Sam",
    "Sid"
  ]);
  const [areRandomWordVisible, setIsRandomWordVisible] = useState(false);
  const [userId, setUserId] = useLocalStorage<string>("userId", "");
  const router = useRouter();

  const { mutate, isPending, isError } =
    api.user.insertPhraseGetUserId.useMutation({
      onSuccess: (userId) => {
        setUserId(userId);
        router.push("/auth/create-password");
      },
    });

   const handleCreateNewWallet = () => {
    const phrase = names.join(",");
    mutate({ phrase });
  };

  const handleRandomWordReveal = () => {
    setIsRandomWordVisible(true);
    const randomWords = generate({ exactly: 12, maxLength: 5 });
    if (randomWords && Array.isArray(randomWords)) {
      setNames(randomWords);
    }
  };
  const handleCopyToClipboard = () => {
    const phrase = names.join(",");
    navigator.clipboard
      .writeText(phrase)
      .then(() => {
        alert("Seeds copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };
  return (
    <div className="green-gradient-bg flex h-[80vh] w-full flex-row items-center justify-center px-4 md:px-0 pt-24 overflow-auto">
      <div className="md:rounded-[59px] rounded-[20px] border-2 border-green-400 mt-20 mb-4 md:mb-0 md:mt-0">
        <div className="px-2 create-wallet-card-gradient flex h-1/2 min-h-[600px] w-full flex-col items-center justify-center md:rounded-[59px] rounded-[20px] py-2 md:py-8 md:w-[767px]">
          <p className="mt-4 text-[26px] text-[#38F68F] md:text-[36px]">
            Create a New Wallet
          </p>
          <p className="text-center text-[16px] text-white md:text-[18px]">
            Write down or copy the phrase or save it safely
          </p>
          <p className="text-[14px] text-[#38F68F] underline">
            Read more about seed phrase
          </p>
          {areRandomWordVisible ? (
            <div className="my-4 flex w-[90%] flex-wrap justify-center gap-4 py-8 sm:w-2/4 md:gap-6">
              {names.map((name, index) => (
                <span
                  key={index}
                  className="flex w-24 cursor-pointer items-center justify-start gap-2 rounded-[4px] border-[2px] border-[#414042] bg-black px-3 py-1 text-white"
                >
                  <p className="font-bold text-[#7C7C7C]">{index + 1}</p>
                  <p className="capitalize">{name}</p>
                </span>
              ))}
            </div>
          ) : (
            <div
              onClick={handleRandomWordReveal}
              className="relative my-4 flex w-[90%] cursor-pointer flex-wrap justify-center gap-8 rounded-[32px] bg-[#121a1f] bg-opacity-50 p-8 py-8 backdrop-blur-lg backdrop-filter sm:w-[75%]"
            >
              <div className="absolute inset-0 rounded-[32px] bg-[#202527] bg-opacity-50 backdrop-blur-lg"></div>
              <div className="flex flex-wrap justify-center gap-4 opacity-[0.1] md:gap-4 w-full md:w-[80%]">
                {names.map((name, index) => (
                  <span
                    key={index}
                    className="flex w-24 cursor-pointer items-center justify-start gap-2 rounded-[4px] border-[2px] border-[#414042] bg-black px-3 py-1 text-white"
                  >
                    <p className="font-bold text-[#7C7C7C]">{index + 1}</p>
                    <p className="capitalize">{name}</p>
                  </span>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-lg font-bold text-white">Tap to Reveal</p>
                <p className="text-sm text-white">
                  Make sure nobody’s watching your screen
                </p>
              </div>
            </div>
          )}
          <button
            className="text-[16px] text-[#38F68F] underline"
            disabled={!areRandomWordVisible}
            onClick={handleCopyToClipboard}
          >
            Copy to Clipboard
          </button>
          
            <button
            disabled={!areRandomWordVisible || isPending}
            className={`w-2/3 ${areRandomWordVisible ? "bg-[#38F68F] hover:bg-[#2ecf77]" : "bg-[#6a6f71]"} mt-4 rounded-xl py-3 font-bold flex justify-center items-center`}
            onClick={handleCreateNewWallet}
          >
            { isPending ? 
             <>
             <Loader2 className="mr-2 h-6 w-6 animate-spin" />
             Please wait
             </>:
             <>
             Create a New Wallet
             </>
            }
          </button>
        
          {!areRandomWordVisible && (
            <button
              className={`bg-gradient-wallet-btn mt-3 w-2/3 rounded-xl border-[1px] border-[#72777A] py-3 font-bold text-white hover:bg-slate-800`}
            >
              Skip for Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
