"use client"

import { useEffect, useState } from "react";
import Navbar from "./Components/Navbar";
import Dashboard from "./Components/Dashboard";
export default function Home() {


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
