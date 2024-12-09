import { CreatePassword } from '@/app/_components/auth/CreatePassword'
import { Navbar } from '@/app/_components/common/Navbar'
import React from 'react'

const index = () => {
  return (
    <div>
        <Navbar />
        <CreatePassword/>
    </div>
  )
}

export default index