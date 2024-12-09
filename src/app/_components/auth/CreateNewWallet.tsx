import React from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const CreateNewWallet = () => {
  const router = useRouter();

  const handleCreateWallet = async () => {
    await router.push('/auth/create-wallet');
  };

  const handleSeedPhraseLogin = async () => {
    await router.push('/auth/seed-phrase-login');
  };

  return (
    <div className='flex flex-row justify-center items-center h-[80vh] w-full px-4 md:px-0 green-gradient-bg'>
      <div className='border-green-500 border-2 md:rounded-[59px] rounded-[20px]'>
        <div className='create-wallet-card-gradient md:rounded-[59px] rounded-[20px] w-full md:w-[767px] h-1/2 min-h-[500px] flex flex-col justify-center items-center md:py-8'>
          <span>
            <p className='text-[#38F68F] text-[26px] md:text-[40px] mt-4 text-center'>Join Us to earn rewards</p>
            <p className='text-[#38F68F] text-[26px] md:text-[40px] text-center'>through tokens</p>
          </span>
          <button 
            className='w-2/3 bg-[#38F68F] mt-12 py-3 rounded-xl font-bold hover:bg-[#2ecf77] transition-colors duration-200' 
            onClick={handleCreateWallet}
          >
            Create a new Wallet
          </button>
          <button 
            className='w-2/3 bg-gradient-wallet-btn text-white mt-3 py-3 rounded-xl font-bold border-[#72777A] border-[1px] hover:bg-slate-800 transition-colors duration-200' 
            onClick={handleSeedPhraseLogin}
          >
            Already have a wallet
          </button>
          <p className='text-white text-[10px] md:text-[14px] mt-4 text-center w-2/3'>
            By signing up, you acknowledge that you have read and
          </p>
          <p className='text-white text-[10px] md:text-[14px] text-center w-2/3'>
            understood, and agree to Tokenwale&apos;s <Dialog>
            <DialogTrigger asChild>
              <button className="border-0 px-0 py-0 text-[13px] text-[#625DF5] hover:bg-none">
                Terms and Privacy Policy.
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-black terms-condition-popup text-white">
              <DialogHeader>
                <DialogTitle className="pb-10 text-[#38F68F]">
                  Terms and Privacy Policy
                </DialogTitle>
                <DialogDescription className="text-white">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Expedita doloremque in delectus hic deserunt nesciunt numquam
                  debitis doloribus, saepe ea vitae nemo molestias voluptas
                  earum et maxime fugit a! Inventore. Lorem ipsum, dolor sit
                  amet consectetur adipisicing elit. Assumenda provident atque
                  iusto nobis aliquam vel dignissimos repellat, quia quasi
                  facilis praesentium necessitatibus culpa aspernatur maiores
                  quae inventore vitae eligendi ipsa.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          </p>
        </div>
      </div>
    </div>
  );
};
