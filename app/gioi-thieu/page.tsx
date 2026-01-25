import Image from "next/image";
import { Info, Target, ShieldCheck, Award } from "lucide-react";

export default function GioiThieuPage() {
  return (
    <div className="space-y-8">
      {/* 1. Header Trang */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-[#0054a5] uppercase">Giới thiệu hệ thống</h1>
        <p className="text-gray-500 text-sm">Thông tin tổng quan về Hệ thống nghiệp vụ công tác Đoàn của Đoàn khoa Công nghệ Phần mềm trực thuộc Đoàn trường Đại học Công nghệ Thông tin - Đại học Quốc gia thành phố Hồ Chí Minh</p>
      </div>

      {/* 2. Banner chính */}
      <div className="relative h-64 w-full rounded-xl overflow-hidden shadow-lg">
        <Image 
          src="/banner-doan.jpg" 
          alt="Banner Đoàn" 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/40 flex items-center px-8">
          <div className="text-white max-w-lg">
            <h2 className="text-3xl font-bold mb-2">Đoàn TNCS Hồ Chí Minh khoa Công nghệ Phần mềm</h2>
              <p className="text-blue-50 font-medium">
                Đội dự bị tin cậy của Đảng Cộng sản Việt Nam, là lực lượng nòng cốt chính trị,
                đóng vai trò quan trọng trong việc tập hợp, định hướng và phát huy sức mạnh
                của thanh niên. Tổ chức Đoàn không ngừng giáo dục lý tưởng cách mạng, bồi dưỡng
                bản lĩnh chính trị, đạo đức, lối sống và tinh thần cống hiến, góp phần xây dựng
                thế hệ trẻ giàu tri thức, trách nhiệm và khát vọng phát triển đất nước.
              </p>
          </div>
        </div>
      </div>

      {/* 3. Lưới thông tin (Grid) - Chỉnh lại thành grid 3 cột để đẩy Thành tích xuống */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white mb-4">
            <Target size={24} />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Sứ mệnh</h3>
          <p className="text-sm text-gray-600">Đoàn kết, tập hợp thanh niên, giáo dục lý tưởng cách mạng và đạo đức lối sống.</p>
        </div>

        <div className="p-6 bg-green-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Nhiệm vụ</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Đoàn Khoa Công nghệ Phần mềm có nhiệm vụ tập hợp, giáo dục đoàn viên, sinh viên; tổ chức các phong trào học tập, nghiên cứu, tình nguyện và rèn luyện kỹ năng; góp phần xây dựng lực lượng sinh viên trẻ năng động, sáng tạo.
          </p>
        </div>

        <div className="p-6 bg-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white mb-4">
            <Info size={24} />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Cơ cấu</h3>
          <p className="text-sm text-gray-600">
            Cơ cấu trẻ gồm 1 Bí thư, 1 Phó Bí thư, 3 Ủy viên Ban Thường vụ (trong đó 1 UV BTV phụ trách công tác Hội - Liên chi Hội trưởng) và 10 Ủy viên Ban Chấp hành, có nhiều kinh nghiệm trong công tác tổ chức chương trình, công tác Đoàn và phong trào thanh niên.
          </p>
        </div>

      </div>

      {/* Ô Thành tích nằm riêng một mình phía dưới để có không gian rộng hơn */}
      <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-100 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-6">
          <div className="w-14 h-14 bg-yellow-500 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-yellow-200">
            <Award size={30} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-800 mb-2">Thành tích nổi bật</h3>
            <p className="text-gray-700 leading-relaxed">
              Năm học <span className="font-semibold">2024–2025</span> đánh dấu chặng đường hoạt động sôi nổi, toàn diện và nhiều dấu ấn của 
              <span className="font-semibold"> Đoàn – Hội Khoa Công nghệ Phần mềm</span>. 
              Với tinh thần xung kích, sáng tạo và trách nhiệm, Đoàn – Hội Khoa đã triển khai đồng bộ các mặt công tác: 
              giáo dục chính trị tư tưởng; phong trào thi đua, văn hóa – thể thao; học thuật, nghiên cứu khoa học, đổi mới sáng tạo; 
              tình nguyện vì cộng đồng; phát triển kỹ năng nghề nghiệp, năng lực số và hội nhập quốc tế; đồng thời chú trọng công tác 
              xây dựng tổ chức Đoàn – Hội vững mạnh.
              <br />
              Trong năm học, nhiều hoạt động chào mừng các ngày lễ lớn như  
              <span className="font-semibold"> 20/11, 26/3 </span>
              được tổ chức với quy mô ngày càng chuyên nghiệp, thu hút đông đảo sinh viên tham gia. 
              Các chương trình Tháng Thanh niên, Xuân Sum Vầy, về nguồn – giáo dục truyền thống, tuyên truyền pháp luật, 
              chuyển dịch xanh, an toàn không gian mạng, phát triển văn hóa đọc, triển lãm AR văn hóa, seminar định hướng nghề nghiệp 
              và rèn luyện kỹ năng mềm đã góp phần nâng cao nhận thức, bản lĩnh và tinh thần trách nhiệm của sinh viên nhà Mềm.
              <br />
              Song song đó, các chiến dịch tình nguyện như 
              <span className="font-semibold"> Xuân Tình Nguyện, Mùa Hè Xanh, Mảnh Ghép Mới, </span>
              được triển khai hiệu quả với nhiều phần việc thiết thực hướng đến thiếu nhi, học sinh, gia đình khó khăn và cộng đồng địa phương, 
              lan tỏa mạnh mẽ giá trị nhân văn và tinh thần cống hiến của tuổi trẻ Công nghệ Phần mềm. 
              Hoạt động thể thao, tiêu biểu là các giải bóng đá truyền thống, tạo sân chơi lành mạnh, tăng cường sự gắn kết giữa các chi đoàn.
              <br />
              Đặc biệt, <span className="font-bold">công trình thanh niên tiêu biểu  
              “Website học tiếng Anh thông qua minigame dành cho học sinh tiểu học trên địa bàn TP. Thủ Đức” </span> đã khẳng định năng lực chuyên môn, 
              tư duy đổi mới sáng tạo và khả năng ứng dụng công nghệ vào phục vụ cộng đồng của sinh viên Khoa Công nghệ Phần mềm, 
              được tuyên dương ở cấp cơ sở Đoàn trực thuộc Đoàn Trường.
              <br />
              Công tác xây dựng tổ chức Đoàn – Hội tiếp tục được củng cố thông qua công tác đào tạo, 
              bồi dưỡng đội ngũ cán bộ, đảm bảo tính kế thừa, hoàn thành chỉ tiêu giới thiệu Đoàn viên ưu tú cho Đảng và phối hợp chặt chẽ 
              với Liên Chi hội, Ban Chủ nhiệm Khoa trong tổ chức các hoạt động học thuật, phong trào và định hướng cho sinh viên.
              <br />
              Với những kết quả nổi bật đó, <span className="font-semibold">Đoàn – Hội Khoa Công nghệ Phần mềm</span> vinh dự đạt danh hiệu 
              <span className="font-bold">“Đơn vị hoàn thành xuất sắc nhiệm vụ”</span>, khẳng định vai trò nòng cốt trong công tác Đoàn – Hội 
              và phong trào thanh niên, đồng thời tạo nền tảng vững chắc để tiếp tục đổi mới, phát triển và đồng hành cùng sinh viên trong 
              các năm học tiếp theo.
            </p>

          </div>
        </div>
      </div>

      {/* 4. Nội dung chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-100 shadow-sm leading-relaxed">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Về phần mềm quản lý
          </h3>
          <p className="text-gray-700 mb-4">
            Phần mềm <strong>Hệ thống nghiệp vụ công tác Đoàn</strong> được xây dựng nhằm đáp ứng nhu cầu chuyển đổi số trong công tác Đoàn và phong trào thanh niên. Hệ thống cung cấp các giải pháp quản trị thông minh, giúp Đoàn khoa dễ dàng theo dõi tiến độ công việc và nhân sự.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Quản lý thông tin hoạt động trong năm học.</li>
            <li>Theo dõi các phong trào thi đua, khen thưởng và kỷ luật.</li>
            <li>Hỗ trợ công tác triển khai, thông báo và báo cáo.</li>
            <li>Quản lý nhân sự của Đoàn khoa.</li>
          </ul>
        </div>

        <div className="bg-[#0054a5] p-8 rounded-xl text-white">
          <h3 className="text-xl font-bold mb-4">Thông tin liên hệ</h3>
          <div className="space-y-8 text-sm opacity-90">
            <p><strong>Địa chỉ:</strong> Tầng 7, toà E, trường ĐH Công nghệ Thông tin, khu phố 34, phường Linh Xuân, thành phố Hồ Chí Minh</p>
            <p><strong>Email:</strong> doankhoa.cnpm.uit@gmail.com</p>
            <p><strong>Fanpage:</strong> https://www.facebook.com/CNPM.Fanpage</p>
          </div>
        </div>
      </div>
    </div>
  );
}