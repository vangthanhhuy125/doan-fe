import Image from "next/image";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Image src="/doankhoa.png" alt="Logo" width={120} height={120} />
        <span className="font-semibold text-[#0054a5] hidden md:block">
          ĐOÀN KHOA CÔNG NGHỆ PHẦN MỀM, ĐOÀN TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN - ĐHQG-HCM   
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">Nguyễn Văn Anh</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[#0054a5] font-bold">
          Anh
        </div>
      </div>
    </header>
  );
}