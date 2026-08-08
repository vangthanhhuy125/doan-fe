export interface Program {
  _id: string | { $oid: string };
  program_name: string;
  stakeholders?: string;
  month?: string;
  year?: string;
  semester?: string;
  academic_year?: string;
  source_url?: string;
  plan_url?: string;
  budget_url?: string;
  training_score_list_url?: string;
  createdAt?: string | { $date: string };
}

export interface ProgramConfig {
  program_id: string;
  program_name: string;
  description: string;
  departments: string[];
  enable_leadership_survey?: boolean;  // Bật/tắt mục ứng cử
  leadership_title?: string;           // Tiêu đề mục (vd: "Ứng cử vào các chức vụ Trưởng/Phó Ban:")
  leadership_options?: string[];       // Danh sách các vị trí ứng cử (vd: ["Trưởng Ban Tổ chức", "Trưởng Ban Nội dung"])
}

export interface Submission {
  student_id: string;
  full_name: string;
  class_name: string;
  choices: Record<string, string>;
  leadership_choices?: Record<string, string[]>; // Lưu danh sách vị trí đã tích chọn
  submitted_at: string;
}

export interface RegistrationForm {
  _id: string | { $oid: string };
  title: string;
  description: string;
  created_at: string;
  is_locked?: boolean; 
  programs: ProgramConfig[];
  submissions: Submission[];
}