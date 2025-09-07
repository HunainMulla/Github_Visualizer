
// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { FaGithub } from 'react-icons/fa';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       // TODO: Implement login logic here
//       console.log('Logging in with:', { email });
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
//     } catch (error) {
//       console.error('Login failed:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-black border border-gray-800 p-8 rounded-xl shadow-lg">
//         <div className="text-center">
//           <h2 className="mt-6 text-3xl font-extrabold text-white">
//             Welcome back
//           </h2>
//           <p className="mt-2 text-sm text-gray-300">
//             Don't have an account?{' '}
//             <Link href="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">
//               Sign up
//             </Link>
//           </p>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="rounded-md shadow-sm space-y-4">
//             <div>
//               <label htmlFor="email-address" className="sr-only">
//                 Email address
//               </label>
//               <input
//                 id="email-address"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Email address"
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="sr-only">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Password"
//               />
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 name="remember-me"
//                 type="checkbox"
//                 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-700 bg-gray-800 rounded"
//               />
//               <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
//                 Remember me
//               </label>
//             </div>

//             <div className="text-sm">
//               <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300">
//                 Forgot your password?
//               </a>
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
//             >
//               {isLoading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </div>
//         </form>

//         <div className="mt-6">
//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-700"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 bg-black text-gray-400">Or continue with</span>
//             </div>
//           </div>

//           <div className="mt-6 flex justify-center">
//             <button
//               type="button"
//               className="w-full max-w-xs inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               <FaGithub className="h-5 w-5" />
//               <span className="ml-2">GitHub</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navabar from "../Components/Navbar";
import { FiGithub } from 'react-icons/fi';
import Link from "next/link";

const LoginPage = () => {
    const CLIENT_ID = "Ov23liGJCPkj3Kr5zdGq";
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        window.location.assign(
            "https://github.com/login/oauth/authorize" +
            "?client_id=" + CLIENT_ID +
            "&redirect_uri=" +
            "&scope=repo%20read:user%20user:email"
          );
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        
        if (code) {
            console.log("Authorization code received:", code);
            // The main page will handle the token exchange
            router.push(`/?code=${code}`);
        }
    }, [router])

    return (
        <div>
            <div className="nav">
                <Navabar />
            </div>
        <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 font-mono">
            <div className="max-w-md w-full space-y-8 bg-[#0a0a0a] border border-gray-800 p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="flex-shrink-0 text-3xl font-bold uppercase tracking-widest text-white mb-6 flex justify-center">
                        GV
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">
                        GitHub Authentication
                    </h2>
                    <p className="mt-2 text-sm text-gray-300">
                        Connect with your GitHub account to visualize your data
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm">
                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center items-center py-3 px-4 border border-gray-700 rounded-md shadow-sm bg-[#0a0a0a] text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <FiGithub className="h-5 w-5 mr-2" />
                            {isLoading ? 'Connecting...' : 'Sign in with GitHub'}
                        </button>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="text-sm">
                            <Link href="/" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
                                Return to Home
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#0a0a0a] text-gray-400">GitHub Visualization</span>
                        </div>
                    </div>
                    <p className="mt-6 text-xs text-center text-gray-500">
                        By signing in, you'll be able to visualize your GitHub repositories, contributions, and activity.
                    </p>
                </div>
            </div>
        </div>
                            </div>
    );
}

export default LoginPage;