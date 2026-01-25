'use client';

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        router.push("/gioi-thieu"); 
      } else {
        setError("Tài khoản hoặc mật khẩu không chính xác!");
        setIsLoading(false);
      }
    }, 1000); 
  };

  return (
    <main className="flex min-h-screen w-full flex-col md:flex-row bg-white overflow-hidden text-black">
      
      <div className="relative z-10 flex w-full flex-col items-center justify-center p-8 md:w-[450px] lg:w-[500px] shrink-0 bg-white shadow-2xl md:shadow-none">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="relative mb-6 transform transition-hover hover:scale-105 duration-300">
            <Image
              src="/logo_doan.png" 
              alt="Logo Đoàn"
              width={300}
              height={200}
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold uppercase leading-tight text-[#0054a5] tracking-tight">
            Hệ thống nghiệp vụ công tác <br /> 
            <span className="text-2xl">Đoàn TNCS Hồ Chí Minh <br /> </span>
            <span className="text-xl opacity-80">Khoa Công nghệ Phần mềm <br /> SE - UIT - VNUHCM</span>
          </h1>
        </div>

        <div className="w-full max-w-[340px]">
          <div className="mb-8 relative">
            <h3 className="inline-block pb-2 text-sm font-bold uppercase text-[#0070d2] border-b-2 border-[#0070d2] relative z-10">
              Thông tin đăng nhập
            </h3>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-100"></div>
          </div>

          <form className="space-y-5 flex flex-col items-center" onSubmit={handleLogin}>
            {error && (
              <div className="w-full text-red-500 text-xs italic bg-red-50 p-2 rounded border border-red-100">
                {error}
              </div>
            )}

            <div className="w-full group relative border-b-2 border-gray-200 focus-within:border-[#0070d2] transition-all">
              <div className="absolute inset-y-0 left-0 flex items-center text-gray-400 group-focus-within:text-[#0070d2]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tài khoản"
                className="w-full py-3 pl-8 pr-4 text-[15px] outline-none bg-transparent placeholder:text-gray-400"
              />
            </div>

            <div className="w-full group relative border-b-2 border-gray-200 focus-within:border-[#0070d2] transition-all">
              <div className="absolute inset-y-0 left-0 flex items-center text-gray-400 group-focus-within:text-[#0070d2]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full py-3 pl-8 pr-10 text-[15px] outline-none bg-transparent placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`mt-4 w-full md:w-auto bg-[#1d92ff] hover:bg-[#0070d2] px-12 py-3 text-sm font-bold text-white rounded-md shadow-lg shadow-blue-200 transition-all active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? "ĐANG KIỂM TRA..." : "ĐĂNG NHẬP"}
            </button>
          </form>
          <p className="mt-8 text-[10px] text-gray-400 text-center tracking-widest">
            © 2026 Bản quyền thuộc về Khoa CNPM - Trường ĐH CNTT - ĐHQG-HCM <br/>
            Thực hiện: Văng Thanh Huy
          </p>
        </div>
      </div>

      <div className="relative hidden md:flex flex-1 bg-blue-50">
        <div className="absolute inset-0">
          <Image
            src="/cnpm.jpg" 
            alt="Banner Đoàn"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent"></div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
           <svg className="w-80 h-80 fill-[#1d92ff] opacity-20 transform -translate-x-20 -translate-y-20" viewBox="0 0 200 200">
              <path d="M0,0 Q100,0 200,200 L0,200 Z" />
           </svg>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[150px] lg:h-[220px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,120 600,0 900,100 L1200,40 L1200,120 L0,120 Z" fill="#1d92ff" opacity="0.4"></path>
            <path d="M0,50 C400,150 800,50 1200,110 L1200,120 L0,120 Z" fill="#0054a5"></path>
          </svg>
        </div>
      </div>
    </main>
  );
}