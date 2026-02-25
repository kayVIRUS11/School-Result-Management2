export function calculateTotal(ca1: number, ca2: number, ca3: number, exam: number): number {
  return Math.min(100, ca1 + ca2 + ca3 + exam);
}

export function calculateGrade(total: number): { grade: string; remark: string } {
  if (total >= 70) return { grade: "A", remark: "Excellent" };
  if (total >= 60) return { grade: "B", remark: "Very Good" };
  if (total >= 50) return { grade: "C", remark: "Good" };
  if (total >= 45) return { grade: "D", remark: "Fair" };
  if (total >= 40) return { grade: "E", remark: "Pass" };
  return { grade: "F", remark: "Fail" };
}
