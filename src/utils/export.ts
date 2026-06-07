import type { Highlight, Book } from '../types';

export function exportHighlightsToMarkdown(
  highlights: Highlight[],
  books: Book[],
  getBookTitle: (bookId: string) => string
): string {
  const groupedByBook: Record<string, Highlight[]> = {};

  highlights.forEach((hl) => {
    if (!groupedByBook[hl.bookId]) {
      groupedByBook[hl.bookId] = [];
    }
    groupedByBook[hl.bookId].push(hl);
  });

  let markdown = '# 读书笔记导出\n\n';
  markdown += `> 导出时间：${new Date().toLocaleString()}\n`;
  markdown += `> 共 ${highlights.length} 条高亮\n\n`;
  markdown += '---\n\n';

  Object.entries(groupedByBook).forEach(([bookId, bookHighlights]) => {
    const book = books.find((b) => b.id === bookId);
    const title = getBookTitle(bookId);

    markdown += `## 📖 ${title}\n\n`;
    if (book?.author) {
      markdown += `**作者：** ${book.author}\n\n`;
    }

    const groupedByChapter: Record<string, Highlight[]> = {};
    bookHighlights.forEach((hl) => {
      const chapter = hl.chapter || '未分类';
      if (!groupedByChapter[chapter]) {
        groupedByChapter[chapter] = [];
      }
      groupedByChapter[chapter].push(hl);
    });

    Object.entries(groupedByChapter).forEach(([chapter, chapterHighlights]) => {
      markdown += `### 📑 ${chapter}\n\n`;

      chapterHighlights.forEach((hl, idx) => {
        markdown += `> ${hl.text}\n\n`;

        if (hl.note) {
          markdown += `📝 **笔记：** ${hl.note}\n\n`;
        }

        markdown += `<sub>📍 定位：\`${hl.cfi}\`</sub>\n\n`;
        markdown += `<sub>🕐 ${new Date(hl.createdAt).toLocaleString()}</sub>\n\n`;

        if (idx < chapterHighlights.length - 1) {
          markdown += '---\n\n';
        }
      });
    });

    markdown += '---\n\n';
  });

  return markdown;
}
