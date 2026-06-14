'use client';

import { useState, useEffect } from "react";
import SystemConfigForm from "./SystemConfigForm";

export default function SystemConfigPage() {
  const [configData, setConfigData] = useState<any>(null);

  const fetchSystemConfig = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system-config`);
      if (res.ok) {
        const data = await res.json();
        setConfigData(data);
      }
    } catch (error) {
      console.error("Lỗi lấy cấu hình hệ thống:", error);
    }
  };

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  const handleSaveConfig = async (updatedPayload: any) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(updatedPayload),
      });

      if (res.ok) {
        alert("Cập nhật và áp dụng tham số hệ thống mới thành công.");
        fetchSystemConfig();
      } else {
        alert("Có lỗi xảy ra trong quá trình cập nhật tham số.");
      }
    } catch (error) {
      console.error("Lỗi cập nhật tham số hệ thống:", error);
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <div className="space-y-6 text-black">
      <SystemConfigForm 
        initialData={configData} 
        onSave={handleSaveConfig} 
      />
    </div>
  );
}