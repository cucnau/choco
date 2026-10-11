/**
 * Tiện ích chuẩn hóa và phân tách Tag gốc của Tấn Giang (JJWXC)
 * TUYỆT ĐỐI GIỮ NGUYÊN TAG GỐC 100%, KHÔNG TỰ Ý DỊCH, KHÔNG TỰ Ý LỌC BỎ TAG.
 */

/**
 * Tách danh sách tag gốc của truyện thành từng tag riêng lẻ
 * Hỗ trợ các dấu phân tách: dấu phẩy (,), dấu phẩy Trung (，), dấu chấm tròn (•), gạch chéo (/), chấm phẩy (;), v.v.
 * Giữ nguyên 100% tất cả các tag gốc, không xóa bỏ bất kỳ tag nào.
 */
export function splitTagList(rawText: string | string[] | undefined): string[] {
  if (!rawText) return [];

  const rawArray: string[] = Array.isArray(rawText) 
    ? rawText 
    : String(rawText).split(/[,，•/;\n|]+/);

  const result: string[] = [];
  const seen = new Set<string>();

  for (const item of rawArray) {
    if (!item) continue;
    const trimmed = String(item).trim();
    if (!trimmed) continue;

    // Nếu là dạng chuỗi nối gạch ngang (như novelClass "原创-纯爱-架空历史-爱情")
    if (trimmed.includes('-')) {
      const parts = trimmed.split('-');
      for (const p of parts) {
        const cleanP = p.trim();
        if (cleanP && !seen.has(cleanP)) {
          seen.add(cleanP);
          result.push(cleanP);
        }
      }
    } else {
      if (!seen.has(trimmed)) {
        seen.add(trimmed);
        result.push(trimmed);
      }
    }
  }

  return result;
}
