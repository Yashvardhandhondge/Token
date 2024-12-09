import { CreateNewWallet } from '@/app/_components/auth/CreateNewWallet'
import { NewWallet } from '@/app/_components/auth/NewWallet'
import { Navbar } from '@/app/_components/common/Navbar'
import React from 'react'

const index = () => {
  return (
    <div>
      <Navbar />
      <CreateNewWallet />
    </div>
  )
}

export default index