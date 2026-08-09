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
  enable_leadership_survey?: boolean;
  leadership_title?: string;
  leadership_options?: string[];
}

export interface Submission {
  student_id: string;
  full_name: string;
  class_name: string;
  choices: Record<string, string>;
  leadership_choices?: Record<string, string[]>;
  submitted_at: string;
}

export interface FormPermission {
  user_id: string;
  user_name?: string;
  username?: string;
  can_view_submissions?: boolean;
  can_export?: boolean;
  can_edit?: boolean;
  can_lock?: boolean;
  can_delete?: boolean;
}

export interface RegistrationForm {
  _id: string | { $oid: string };
  title: string;
  description: string;
  created_at: string;
  created_by?: string;
  is_locked?: boolean; 
  programs: ProgramConfig[];
  submissions: Submission[];
  shared_permissions?: FormPermission[];
}