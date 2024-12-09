import { LoginComponent } from '@/app/_components/auth/LoginComponent'
import { NewWallet } from '@/app/_components/auth/NewWallet'
import { SeedPhraseLogin } from '@/app/_components/auth/SeedPhraseLogin'
import { Navbar } from '@/app/_components/common/Navbar'
import React from 'react'

const recover = () => {
  return (
    <div>
      <Navbar />
      <SeedPhraseLogin />
    </div>
  )
}

export default recover