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
  image_url?: string;
  section_id?: string;
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
  target_intakes?: string[];
  target_users?: string[];
  sections?: Section[];
  questions: Question[];
  responses: SurveyResponse[];
}