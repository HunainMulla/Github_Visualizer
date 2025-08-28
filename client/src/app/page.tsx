"use client"

import { useEffect, useState } from "react";
import Navbar from "./Components/Navbar";
export default function Home() {


  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const handleAccess = async (code: string | null) => {
    if (!code) {
      console.error("No code provided");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to authenticate');
      }

      const data = await response.json();
      console.log("Access Token:", data.access_token);
      setAccessToken(data.access_token)
      localStorage.setItem("access_token", data.access_token)
    } catch (error) {
      console.error("Authentication error:", error);
    }
  }


  useEffect(() => {

    const accessToken = localStorage.getItem("access_token")
    if (accessToken) {
      setAccessToken(accessToken)
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const code: string | null = params.get("code");
    if (!code) {
      return;
    }
    handleAccess(code)

  }, [])


  useEffect(() => {
    const accessToken = localStorage.getItem("access_token")
    if (!accessToken) return;
    const getUserData = async () => {
      try {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        console.log("User Data:", data);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    getUserData();
  }, [accessToken])


  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="font-mono block">
        <h1>Home</h1>
        {accessToken && <p>Access Token: {accessToken}</p>}
        {user && <p>User Data: {JSON.stringify(user)}</p>}
      </div>
    </div>
  );
}
