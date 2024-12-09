"use client";
import React, { useState, useCallback } from "react";
import { api } from "@/trpc/react";
import useLocalStorage from "@/hooks/storage/localStorage";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

export const SeedPhraseLogin = () => {
  const [seedPhrases, setSeedPhrases] = useState<string[]>(Array(12).fill(""));
  const [userId, setUserId] = useLocalStorage<string>("userId", "");
  const router = useRouter();

  const { mutate, isPending } =
    api.user.getUserIdFromPhrase.useMutation({
      onSuccess: async (userId) => {
        setUserId(userId);
        await router.push("/auth/create-password");
      },
      onError: (error) => {
        console.error("Error logging in with seed phrase:", error);
      },
    });

  const handleCreateNewWallet = () => {
    const phrase = seedPhrases.join(",");
    mutate({ phrase });
  };

  const handleSeedPhraseChange = (index: number, value: string) => {
    const updatedSeedPhrases = [...seedPhrases];
    updatedSeedPhrases[index] = value;
    setSeedPhrases(updatedSeedPhrases);
  };

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    const phrasesArray = pastedData.split(',').map(phrase => phrase.trim()).filter(phrase => phrase.length > 0);

    if (phrasesArray.length === 12) {
      setSeedPhrases(phrasesArray);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleCreateNewWallet();
  };

  return (
    <div className="green-gradient-bg flex h-[80vh] w-full flex-row items-center justify-center px-4 md:px-0 pt-12">
      <div className="w-full md:rounded-[59px] rounded-[20px] border-2 border-green-500 md:w-auto">
        <div className="create-wallet-card-gradient flex h-1/2 min-h-[500px] w-full flex-col items-center justify-center md:rounded-[59px] rounded-[20px] py-8 md:w-[767px]">
          <span className="text-center">
            <p className="mt-4 text-[26px] text-[#38F68F] md:text-[40px]">
              Login through Seed phrase
            </p>
            <p className="text-[10px] text-[#A0A0A0] md:text-[16px]">
              Your 12 word seed phrase can help you log in
            </p>
          </span>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-center justify-center gap-4 px-4 pb-4 pt-10 md:px-0"
          >
            <div className="flex w-[90%] flex-wrap justify-center gap-4 sm:w-[40%] md:gap-6">
              {seedPhrases.map((phrase, index) => (
                <input
                  key={index}
                  type="text"
                  value={phrase}
                  onChange={(e) => handleSeedPhraseChange(index, e.target.value)}
                  onPaste={(e) => handlePaste(e, index)}
                  className="bg-[#182528] text-white h-[46px] w-[76px] px-2 py-1 rounded-[10px]"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full flex items-center justify-center rounded-xl bg-[#38F68F] py-3 font-bold md:w-[50%]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Please wait
                </>
              ) : (
                <>Recover Account</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
