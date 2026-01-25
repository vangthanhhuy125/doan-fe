import { Users, UserCircle } from "lucide-react";

const banThuongVu = [
  { name: "Nguyễn Văn A", role: "Bí thư Đoàn khoa" },
  { name: "Trần Thị B", role: "Phó Bí thư Đoàn khoa" },
  { name: "Lê Văn C", role: "Ủy viên Ban Thường vụ" },
  { name: "Phạm Thị D", role: "Ủy viên Ban Thường vụ" },
  { name: "Hoàng Văn E", role: "Ủy viên Ban Thường vụ" },
];

export default function NhanSuPage() {
  // Hàm bổ trợ để lấy màu sắc theo chức danh
  const getRoleStyles = (index: number) => {
    if (index === 0) return { text: "text-red-600", bg: "bg-red-50", border: "border-red-100" };
    if (index === 1) return { text: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" };
    if (index < 5) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" };
    return { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" };
  };

  return (
    <div className="space-y-10 text-black pb-10">
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <Users className="text-[#0054a5]" size={24} />
        <h2 className="text-xl font-bold uppercase text-[#0054a5]">Quản lý nhân sự Ban Chấp hành</h2>
      </div>

      {/* 1. Ban Thường vụ (05 người) */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
           <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
           1. Ban Thường vụ Đoàn khoa
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {banThuongVu.map((person, index) => {
            const styles = getRoleStyles(index);
            return (
              <div key={index} className="bg-white p-6 rounded-2xl border border-blue-50 shadow-sm hover:shadow-md transition-all text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-2xl shadow-lg ${index === 0 ? 'bg-red-600 shadow-red-100' : index === 1 ? 'bg-amber-500 shadow-amber-100' : index < 5 ? 'bg-emerald-600 shadow-emerald-100' : 'bg-blue-600 shadow-blue-100'} text-white`}>
                  {person.name.split(' ').pop()?.charAt(0)}
                </div>
                <h4 className="font-bold text-base text-slate-800">{person.name}</h4>
                <p className={`${styles.text} ${styles.bg} text-[11px] font-bold mt-3 px-3 py-1 rounded-full inline-block border ${styles.border}`}>
                  {person.role}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Ban Chấp hành (15 người bao gồm cả BTV) */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-1 h-5 bg-slate-400 rounded-full"></span>
           2. Nhân sự "Ban Chấp hành Đoàn khoa" (15 đồng chí)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...banThuongVu, ...Array(10)].map((person, index) => {
            let displayRole = "";
            if (index === 0) displayRole = "Bí thư Đoàn khoa";
            else if (index === 1) displayRole = "Phó Bí thư Đoàn khoa";
            else if (index < 5) displayRole = "Ủy viên Ban Thường vụ";
            else displayRole = "Ủy viên Ban Chấp hành";

            const styles = getRoleStyles(index);

            return (
              <div key={index} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 transition-all">
                <div className={`w-10 h-10 ${styles.bg} rounded-lg flex items-center justify-center ${styles.text}`}>
                  <UserCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {index < 5 ? person.name : `Ủy viên BCH ${index - 4}`}
                  </p>
                  <p className={`text-[10px] ${styles.text} font-bold uppercase tracking-wider`}>
                    {displayRole}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}