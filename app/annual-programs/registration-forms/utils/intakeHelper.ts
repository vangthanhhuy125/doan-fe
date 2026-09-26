import { RegistrationForm, ProgramConfig } from '../types';

export const extractIntake = (user: { class_name?: string; student_id?: string; class?: string }): string => {
  if (!user) return '';
  const classStr = user.class_name || user.class || '';
  const match = String(classStr).match(/(?:19|20)\d{2}/);
  if (match) {
    const year = parseInt(match[0], 10);
    if (year >= 1990 && year <= 2050) return String(year);
  }
  const sid = String(user.student_id || '').trim();
  if (sid.length >= 2) {
    const prefix = parseInt(sid.substring(0, 2), 10);
    if (!isNaN(prefix) && prefix >= 15 && prefix <= 35) {
      return `20${prefix}`;
    }
  }
  return '';
};

export const checkCanRegisterProgram = (
  user: any,
  program: ProgramConfig
): { canRegister: boolean; userIntake: string; message?: string } => {
  const userIntake = extractIntake(user);
  const allowedIntakes = program.target_intakes || [];

  if (allowedIntakes.length === 0 || !userIntake) {
    return { canRegister: true, userIntake };
  }

  const isEligible = allowedIntakes.includes(userIntake);
  return {
    canRegister: isEligible,
    userIntake,
    message: isEligible ? undefined : `Chỉ dành cho khóa ${allowedIntakes.map(k => `K${k}`).join(', ')}`
  };
};

export const checkCanRegister = (
  user: any,
  form: RegistrationForm
): { canRegister: boolean; userIntake: string; message?: string } => {
  const userIntake = extractIntake(user);

  if (form.is_locked) {
    return { canRegister: false, userIntake, message: 'Phiếu đăng ký đã bị khóa' };
  }

  const programs = form.programs || [];
  if (programs.length === 0) {
    return { canRegister: true, userIntake };
  }

  const isEligibleAny = programs.some((prog) => {
    const allowed = prog.target_intakes || [];
    return allowed.length === 0 || !userIntake || allowed.includes(userIntake);
  });

  return {
    canRegister: isEligibleAny,
    userIntake,
    message: isEligibleAny ? undefined : 'Bạn không thuộc đối tượng của bất kỳ chương trình nào trong phiếu'
  };
};