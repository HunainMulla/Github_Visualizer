"use client"

import { useEffect, useState } from "react";
import Navbar from "./Components/Navbar";
import Dashboard from "./Components/Dashboard";
import {useRouter} from "next/navigation"
export default function Home() {
const router = useRouter()
  useEffect(() => {
    const acess_token = localStorage.getItem("access_token")
    const jwt_token = localStorage.getItem("jwt_token")
    if(!acess_token || !jwt_token){
      router.push("/login")      
    }
  }, [])

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  return (
    <div>
      <div className="font-mono py-7">
        <Navbar />
      </div>
      <Dashboard />
    </div>
  );
}
