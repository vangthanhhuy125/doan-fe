export type AttendanceStatus = 'present' | 'late' | 'excused' | 'absent';

export interface SharedUser {
  user_id: string;
  user_name?: string;
  username?: string;
}

export interface AttendanceRecord {
  student_id: string;
  full_name: string;
  class_name?: string;
  status: AttendanceStatus;
  checkin_time: string;
  note?: string;
}

export interface AttendanceSession {
  _id: string;
  title: string;
  code: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  description?: string;
  target_intakes?: string[];
  is_locked?: boolean;
  records: AttendanceRecord[];
  created_by?: string;
  shared_users?: SharedUser[];
  created_at: string;
  updated_at?: string;
}