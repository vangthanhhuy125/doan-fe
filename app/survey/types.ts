export type QuestionType = 'short_text' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'dropdown';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: QuestionOption[];
  image_url?: string; // 🖼️ Ảnh đính kèm câu hỏi
  section_id?: string; // 📑 ID Phần/Trang chứa câu hỏi này
}

export interface Section {
  id: string;
  title: string;
  description?: string;
}

export interface SurveyAnswer {
  question_id: string;
  value: string | string[];
}

export interface SurveyResponse {
  user_id?: string;
  student_id?: string;
  full_name?: string;
  answers: SurveyAnswer[];
  submitted_at: string;
}

export interface SurveyForm {
  _id: string;
  voucherNo: string;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  is_locked?: boolean;
  sections?: Section[]; // 📑 Danh sách các phần/trang
  questions: Question[];
  responses: SurveyResponse[];
}