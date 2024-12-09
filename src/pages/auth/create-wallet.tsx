
import { NewWallet } from '@/app/_components/auth/NewWallet'
import { Navbar } from '@/app/_components/common/Navbar'
import React from 'react'

const login = () => {
  return (
    <div>
      <Navbar />
      <NewWallet />
    </div>
  )
}

export default login