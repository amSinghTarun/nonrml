'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import SignIn from '@/components/Signin'

export default function SessionProvider({
  children
}: {
  children: React.ReactNode
}) {
    const sessionData = useSession()
    const [showSignIn, setShowSignIn] = useState(false)

    useEffect(() => {
        if (sessionData.status === 'unauthenticated' || (sessionData.data?.user && "role" in sessionData.data.user && sessionData.data?.user?.role != "ADMIN")) {
          setShowSignIn(true)
        } else {
          setShowSignIn(false)
        }
    }, [sessionData.status, sessionData.data?.user])

    return (
        <>
        {showSignIn ? <SignIn /> : children}
        </>
    )
}