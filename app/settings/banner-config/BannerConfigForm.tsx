'use client';

import { useState, useEffect, useRef } from "react";
import { ImageIcon, Plus, Trash2, Save, Upload, HelpCircle } from "lucide-react";

interface BannerConfigFormProps {
  initialImages: string[]; 
  onSave: (images: any[]) => Promise<void>; 
}

export default function BannerConfigForm({ initialImages, onSave }: BannerConfigFormProps) {
  const [images, setImages] = useState<any[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRefs = useRef<any>([]);

  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages);
    }
  }, [initialImages]);

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = reader.result as string; 
        setImages(newImages);
      };
      reader.readAsDataURL(file); 
    }
  };

  const handleAddField = () => {
    setImages([...images, ""]);
  };

  const handleRemoveField = (index: number) => {
    if (images.length === 1) {
      setImages([""]);
      return;
    }
    
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validImages = images.filter(img => img !== "");
    
    await onSave(validImages);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 text-black text-left">
      
      <div className="flex items-center justify-between border-b-2 border-amber-500 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-100">
            <ImageIcon size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-amber-500 tracking-tight">Cấu hình Banner Động</h2>
        </div>
      </div>

      <div className="bg-amber-50/60 border-l-4 border-amber-500 p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-amber-700 mb-1 font-bold text-sm">
          <HelpCircle size={18} className="flex-shrink-0" />
          <span>Hướng dẫn thiết lập hệ thống</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          Hệ thống trang <strong>Giới thiệu</strong> ngoài trang chủ sẽ tự động nhận diện danh sách ảnh này.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-gray-100 shadow-xl bg-white p-5 sm:p-6 space-y-4">
        <div className="space-y-3">
          <label className="text-[11px] sm:text-[12px] font-black uppercase text-amber-500 ml-1 tracking-widest block">
            Danh mục hình ảnh hoạt động trên hệ thống
          </label>
          
          {images.map((img, index) => {
            const hasImage = img !== "";
            const isBase64 = typeof img === "string" && img.startsWith("data:image");
            
            const previewSrc = isBase64
              ? img 
              : (typeof img === "string" && img !== "" ? `${process.env.NEXT_PUBLIC_API_URL}${img}` : "");

            return (
              <div key={index} className="flex items-center gap-3 group animate-in fade-in duration-200">
                
                <div 
                  onClick={() => fileInputRefs.current[index]?.click()}
                  className="relative flex-1 bg-gray-50 rounded-2xl p-3 border-2 border-dashed border-gray-200 hover:border-amber-400 focus-within:ring-2 ring-amber-100 transition-all font-bold cursor-pointer flex items-center gap-4"
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={el => { fileInputRefs.current[index] = el; }}
                    onChange={(e) => handleFileChange(index, e)}
                    className="hidden"
                  />

                  {hasImage ? (
                    <div className="flex items-center gap-4 w-full">
                      <div className="relative w-16 h-12 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                        <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xs text-slate-500 font-bold truncate flex-1">
                        Hình ảnh hoạt động trên hệ thống
                      </div>
                      <span className="text-[10px] uppercase bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full whitespace-nowrap">Đổi ảnh</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-slate-400 group-hover:text-amber-500 transition-colors py-1.5 pl-1">
                      <Upload size={18} />
                      <span className="text-sm font-bold">Nhấp vào đây để tải ảnh lên...</span>
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all border-none outline-none flex-shrink-0"
                  title="Xóa ảnh này"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-50">
          <button
            type="button"
            onClick={handleAddField}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-dashed border-amber-300 text-amber-600 hover:bg-amber-50/50 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all outline-none"
          >
            <Plus size={16} /> Thêm khung ảnh mới
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600 px-6 py-2 rounded-lg font-bold shadow-lg shadow-amber-100 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50 border-none outline-none active:scale-95"
          >
            <Save size={16} /> {isSubmitting ? "Đang tải lên..." : "Lưu cấu hình hệ thống"}
          </button>
        </div>
      </form>
    </div>
  );
}