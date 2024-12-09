import { Navbar } from '../../app/_components/common/Navbar'
import React from 'react'
import { Button } from '../../components/ui/button';

const rules = () => {
  return (
    <section className='w-full'>
      <Navbar />      
      <div className='w-full flex flex-row'>
        <div className='w-[45%] h-screen rule-bg-2 md:flex hidden flex-col justify-end items-start text-[48px] text-white'>
          <div className='bg-black bg-opacity-20 shadow-lg backdrop-blur-md border-white border-opacity-30 w-full py-8 px-12'>
          <p>Rules</p>
          </div>
        </div>
        <div className='max-h-screen overflow-y-auto w-full md:w-[55%] h-full min-h-screen bg-black pb-12'>
          <div className="flex flex-col justify-start text-white pt-20 md:pt-20 pl-16 pr-6">
            <p className='text-[28px] md:text-[48px]'>Rules</p>
            <div className='flex flex-col gap-4 mt-12'>
              <p>1. Total number of tokens available would be 10,000cr tokens</p>
              <p>2. Maximum tokens in any wallet cannot exceed 1cr tokens</p>
              <p>3. On every transfer (wallet to wallet) there will be 0.2% transaction fee which will be burnt and these tokens cannot be used at all.</p>
              <p>4. Minimum tokens you need for transfers should be 100 Tokens, below which you cannot transfer.</p>
              <p>5. Upto 1000 tokens every transfer will cost 2 Tokens (fixed) and above that it&lsquo;ll be 0.2% transaction fee</p>
              <p>6. On the admin side, we should have an option to generate and send tokens to specific wallets (only can be done by super admin)</p>
              <p>7. Certain accounts can be banned by super admins and if their number is listed, they won&lsquo;t be able to create a new account with that phone number or email either (but their data should not be deleted)</p>
              <p>8. Admin should be able to keep a range of tokens that everyone can get on each task (like on spin the wheel users can get from 0-10 tokens)</p>
              <p>9. Admin can also add certain user ids to each task and specify a range for them specifically so that these user ids will get more tokens</p>
              <p>10. Promo codes can be claimed by the users to get a certain amount of tokens as listed in the promo code</p>
              <p>11. These promo codes can be created on the admin side and beside each promo code there will be an expiry date and max number of times it can be used</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default rules