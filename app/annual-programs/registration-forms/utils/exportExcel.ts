import * as XLSX from 'xlsx';
import { RegistrationForm } from '../types';

export const exportRegistrationToExcel = (form: RegistrationForm) => {
  if (!form || !form.submissions || form.submissions.length === 0) {
    alert("Chưa có lượt đăng ký nào để xuất Excel!");
    return;
  }

  // 1. Lấy danh sách tất cả các Ban (Departments) xuất hiện trong các chương trình
  const allDepartments: string[] = [];
  form.programs.forEach(prog => {
    prog.departments.forEach(dept => {
      if (!allDepartments.includes(dept)) {
        allDepartments.push(dept);
      }
    });
  });

  // 2. Tạo mảng chứa dữ liệu bảng Excel (Array of Arrays)
  const headerRow = ["Ban / Bộ phận", ...form.programs.map(p => p.program_name)];
  const excelRows: any[][] = [headerRow];

  // Mảng lưu vị trí gộp ô (Merge) cho Cột A (Cột Ban)
  const merges: XLSX.Range[] = [];
  let currentRowIndex = 1; // Row 0 là Header

  // 3. Duyệt qua từng Ban để tạo nhóm dữ liệu
  allDepartments.forEach(dept => {
    const progStudentsMap: Record<string, string[]> = {};
    let maxRowsForDept = 1;

    // Lọc danh sách sinh viên theo từng chương trình cho Ban này
    form.programs.forEach(prog => {
      const studentsInDept = form.submissions
        .filter(sub => sub.choices && sub.choices[prog.program_id] === dept)
        .map(sub => sub.full_name);

      progStudentsMap[prog.program_id] = studentsInDept;
      if (studentsInDept.length > maxRowsForDept) {
        maxRowsForDept = studentsInDept.length;
      }
    });

    const startRow = currentRowIndex;

    // Tạo các dòng danh sách sinh viên cho Ban hiện tại
    for (let i = 0; i < maxRowsForDept; i++) {
      const rowData: string[] = [i === 0 ? dept : ""];

      form.programs.forEach(prog => {
        const studentList = progStudentsMap[prog.program_id] || [];
        rowData.push(studentList[i] || "");
      });

      excelRows.push(rowData);
      currentRowIndex++;
    }

    const endRow = currentRowIndex - 1;

    // Gộp ô cột A nếu Ban có nhiều hơn 1 dòng
    if (endRow > startRow) {
      merges.push({
        s: { r: startRow, c: 0 },
        e: { r: endRow, c: 0 }
      });
    }
  });

  // 4. Tạo Worksheet, thêm cấu hình gộp ô và độ rộng cột
  const worksheet = XLSX.utils.aoa_to_sheet(excelRows);
  worksheet['!merges'] = merges;

  const colWidths = [
    { wch: 20 },
    ...form.programs.map(p => ({ wch: Math.max(p.program_name.length + 5, 25) }))
  ];
  worksheet['!cols'] = colWidths;

  // 5. Xuất file Excel
  const getFormId = (id: any) => typeof id === 'object' && id?.$oid ? id.$oid : String(id);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách phân ban");
  XLSX.writeFile(workbook, `Danh_sach_phan_ban_${getFormId(form._id)}.xlsx`);
};