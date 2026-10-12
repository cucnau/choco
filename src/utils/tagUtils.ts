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

  const result: string[] = [];
  const seen = new Set<string>();

  const addTag = (val: string) => {
    const trimmed = String(val).trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  };

  if (Array.isArray(rawText)) {
    for (const item of rawText) {
      if (!item) continue;
      addTag(String(item));
    }
    return result;
  }

  const str = String(rawText).trim();
  if (!str) return [];

  // Nếu chuỗi chứa các dấu phân cách phổ biến
  const hasDelimiter = /[,，•/;\n|]/.test(str);
  let rawArray: string[];

  if (hasDelimiter) {
    rawArray = str.split(/[,，•/;\n|]+/);
  } else if (/\s+/.test(str)) {
    // Nếu ngăn cách bằng khoảng trắng
    rawArray = str.split(/\s+/);
  } else if (str.includes('-')) {
    // Nếu là dạng novelClass kiểu "原创-纯爱-架空历史-爱情"
    rawArray = str.split('-');
  } else {
    rawArray = [str];
  }

  for (const item of rawArray) {
    if (!item) continue;
    const trimmed = String(item).trim();
    if (!trimmed) continue;

    if (trimmed.includes('-') && (trimmed.includes('原创') || trimmed.includes('衍生') || trimmed.includes('纯爱'))) {
      const parts = trimmed.split('-');
      for (const p of parts) {
        addTag(p);
      }
    } else {
      addTag(trimmed);
    }
  }

  return result;
}
