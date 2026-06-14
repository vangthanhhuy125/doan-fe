'use client';

import { useState, useEffect } from "react";
import BannerConfigForm from "./BannerConfigForm";

export default function BannerConfigPage() {
  const [initialImages, setInitialImages] = useState<string[]>([]);

  const fetchBannerConfig = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner-config`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.images)) {
          setInitialImages(data.images);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy cấu hình banner:", error);
    }
  };

  useEffect(() => {
    fetchBannerConfig();
  }, []);

  const handleSaveConfig = async (images: any[]) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ images }), 
      });

      if (res.ok) {
        alert("Cập nhật cấu hình banner thành công.");
        fetchBannerConfig();
      } else {
        alert("Có lỗi xảy ra trong quá trình lưu dữ liệu.");
      }
    } catch (error) {
      console.error("Lỗi lưu cấu hình banner:", error);
    }
  };

  return (
    <div className="space-y-6 text-black">
      <BannerConfigForm 
        initialImages={initialImages} 
        onSave={handleSaveConfig} 
      />
    </div>
  );
}