import React from 'react'
import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className='h-16 bg-purple-700 flex justify-between px-6 items-center text-white shadow-lg'>
      <div className="logo font-bold text-2xl">
        <Link href="/" className="hover:text-purple-200 transition">TinyLink</Link>
      </div>
      <ul className='flex justify-center gap-4 items-center'>
        <li><Link href="/" className='hover:text-purple-200 transition'>Dashboard</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar