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
}

export interface Submission {
  student_id: string;
  full_name: string;
  class_name: string;
  choices: Record<string, string>;
  submitted_at: string;
}

export interface RegistrationForm {
  _id: string | { $oid: string };
  title: string;
  description: string;
  created_at: string;
  programs: ProgramConfig[];
  submissions: Submission[];
}