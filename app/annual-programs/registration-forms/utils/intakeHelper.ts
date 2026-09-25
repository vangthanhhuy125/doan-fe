import { RegistrationForm } from '../types';

// Trích xuất khóa từ Lớp hoặc MSSV
export const extractIntake = (user: any): string => {
  if (!user) return '';
  if (user.intake) return String(user.intake).trim();
  if (user.khoa) return String(user.khoa).trim();

  // 1. Phân tích 4 chữ số năm từ lớp (VD: KTPM2023.2 -> 2023, PMCL2025.1 -> 2025)
  const classStr = user.class || user.class_name || user.chi_doan || '';
  const match = String(classStr).match(/(?:19|20)\d{2}/);
  if (match) {
    const year = parseInt(match[0], 10);
    if (year >= 1990 && year <= 2050) return String(year);
  }

  // 2. Dự phòng từ 2 số đầu MSSV (VD: 25520185 -> 2025, 23521084 -> 2023)
  const sid = String(user.student_id || user.mssv || '').trim();
  if (sid.length >= 2) {
    const prefix = parseInt(sid.substring(0, 2), 10);
    if (!isNaN(prefix) && prefix >= 15 && prefix <= 35) {
      return `20${prefix}`;
    }
  }

  return '';
};

// Kiểm tra xem sinh viên có thuộc khóa được phép đăng ký không
export const checkCanRegister = (
  user: any,
  form: RegistrationForm
): { canRegister: boolean; userIntake: string; message?: string } => {
  const allowedIntakes = form.target_intakes || [];
  const userIntake = extractIntake(user);

  // Nếu không chỉ định khóa hoặc để rỗng => Tất cả các khóa đều được phép
  if (!allowedIntakes || allowedIntakes.length === 0) {
    return { canRegister: true, userIntake };
  }

  if (!userIntake) {
    return { canRegister: true, userIntake: '' };
  }

  const isAllowed = allowedIntakes.includes(userIntake);
  return {
    canRegister: isAllowed,
    userIntake,
    message: isAllowed
      ? undefined
      : `Phiếu này chỉ dành cho sinh viên khóa [${allowedIntakes.map(k => `K${k}`).join(', ')}]. Bạn thuộc khóa [K${userIntake}] nên không thể tham gia đăng ký.`
  };
};