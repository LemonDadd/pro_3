import type { Book, Bookmark, Highlight, Note } from '../types';

const bookTitles = [
  '三体',
  '活着',
  '百年孤独',
  '小王子',
  '人类简史',
  '未来简史',
  '枪炮、病菌与钢铁',
  '思考，快与慢',
];

const authors = [
  '刘慈欣',
  '余华',
  '加西亚·马尔克斯',
  '圣埃克苏佩里',
  '尤瓦尔·赫拉利',
  '贾雷德·戴蒙德',
  '丹尼尔·卡尼曼',
];

const descriptions = [
  '这是一部震撼人心的科幻小说，讲述了人类与外星文明的首次接触。',
  '一部描写中国当代文学的经典之作，展现了生命的坚韧与尊严。',
  '魔幻现实主义的巅峰之作，讲述了布恩迪亚家族七代人的传奇故事。',
  '一则关于爱与责任的童话，适合所有年龄段的读者。',
  '从动物到上帝，人类如何登上生物链顶端的历程。',
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function generateMockBooks(count: number): Book[] {
  const books: Book[] = [];
  for (let i = 0; i < count; i++) {
    const index = i % bookTitles.length;
    books.push({
      id: generateId(),
      title: bookTitles[index],
      author: authors[index % authors.length],
      cover: `https://picsum.photos/seed/book${i + 1}/300/400`,
      description: descriptions[index % descriptions.length],
      format: i === 0 ? 'epub' : i === 1 ? 'mobi' : 'epub',
      filePath: `/books/book${i + 1}.epub`,
      fileSize: Math.floor(Math.random() * 10000000) + 1000000,
      progress: Math.floor(Math.random() * 80),
      currentLocation: `epubcfi(/6/10[chapter${i}!/4/2/2[chapter]/2])`,
      totalPages: Math.floor(Math.random() * 500) + 100,
      currentPage: Math.floor(Math.random() * 300) + 50,
      addedAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastReadAt: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      language: 'zh-CN',
      publisher: '某某出版社',
      pubDate: '2020-01-01',
      categories: i % 2 === 0 ? ['科幻'] : ['文学'],
    });
  }
  return books;
}

export function generateMockBookmarks(bookId: string): Bookmark[] {
  return [
    {
      id: generateId(),
      bookId,
      cfi: 'epubcfi(/6/10[chapter1]!/4/2/2[page1]/2)',
      chapter: '第一章 序幕',
      location: 15,
      text: '这是一个精彩的段落...',
      createdAt: Date.now() - 86400000,
    },
    {
      id: generateId(),
      bookId,
      cfi: 'epubcfi(/6/12[chapter3]!/4/2/2[page50]/2)',
      chapter: '第三章 转折点',
      location: 87,
      text: '重要的情节发生了...',
      createdAt: Date.now() - 43200000,
    },
  ];
}

export function generateMockHighlights(bookId: string): Highlight[] {
  const colors = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff'];
  return [
    {
      id: generateId(),
      bookId,
      cfi: 'epubcfi(/6/10[chapter1]!/4/2/2[highlight1]/2)',
      color: colors[0],
      text: '这是一段被高亮的重要文字内容，表达了深刻的思想和见解。',
      note: '这段很有启发性',
      chapter: '第一章 序幕',
      createdAt: Date.now() - 172800000,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: generateId(),
      bookId,
      cfi: 'epubcfi(/6/10[chapter1]!/4/2/2[highlight2]/2)',
      color: colors[2],
      text: '另一段精彩的描述，让人身临其境。',
      chapter: '第一章 序幕',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: generateId(),
      bookId,
      cfi: 'epubcfi(/6/12[chapter2]!/4/2/2[highlight3]/2)',
      color: colors[1],
      text: '第二章中的关键段落，揭示了主题。',
      note: '这里需要再仔细品味',
      chapter: '第二章 发展',
      createdAt: Date.now() - 43200000,
      updatedAt: Date.now() - 21600000,
    },
  ];
}

export function generateMockNotes(bookId: string): Note[] {
  return [
    {
      id: generateId(),
      bookId,
      content: '这是第一章的读书笔记，记录了一些想法和感悟。这是第一章的读书笔记，记录了一些想法和感悟。',
      chapter: '第一章 序幕',
      createdAt: Date.now() - 172800000,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: generateId(),
      bookId,
      content: '关于第二章的一些思考...',
      chapter: '第二章 发展',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 43200000,
    },
  ];
}

export const mockChapters = [
  { id: 'chapter1', title: '第一章 序幕', href: 'chapter1.xhtml', level: 1 },
  { id: 'chapter2', title: '第二章 发展', href: 'chapter2.xhtml', level: 1 },
  { id: 'chapter3', title: '第三章 转折点', href: 'chapter3.xhtml', level: 1 },
  { id: 'chapter4', title: '第一节 细节', href: 'chapter4.xhtml', level: 2 },
  { id: 'chapter5', title: '第二节 深入', href: 'chapter5.xhtml', level: 2 },
  { id: 'chapter6', title: '第四章 高潮', href: 'chapter6.xhtml', level: 1 },
  { id: 'chapter7', title: '第五章 结局', href: 'chapter7.xhtml', level: 1 },
  { id: 'chapter8', title: '尾声', href: 'chapter8.xhtml', level: 1 },
];

export const mockReadingContent = `
  <h1>第一章 序幕</h1>
  <p>这是一个关于一个普通的一天，太阳从东方升起，照亮了整个城市。街道上的人们开始了新的一天，车水马龙，人来人往。</p>
  <p>主人公站在窗前，望着窗外的景色，心中充满了对未来的期待和迷茫。他不知道今天会遇到什么人，发生什么事。</p>
  <p>"生活就像一盒巧克力，你永远不知道下一颗是什么味道。" —— 这句话在他脑海中回响。</p>
  <p>他深吸一口气，推开了门，走向了未知的世界。</p>
  <h2>第一节 相遇</h2>
  <p>在街角的咖啡店，他遇到了一个陌生人。那人穿着一件黑色的外套，戴着一副墨镜，看起来神秘莫测。</p>
  <p>"你好，"陌生人说，"我等你很久了。"</p>
  <p>主人公愣住了，他不认识这个人，但对方似乎认识他。</p>
  <p>"你是谁？"他问道。</p>
  <p>陌生人笑了笑，说："我是来告诉你一个秘密的人。"</p>
  <h2>第二节 秘密</h2>
  <p>那个秘密改变了一切。主人公从未想过，自己的人生会因为一次偶遇而彻底改变。</p>
  <p>秘密是什么呢？也许是关于他的身世，也许是关于他的未来，也许是关于这个世界的真相。</p>
  <p>无论如何，从这一刻起，他的人生将不再平凡。</p>
`;

export function generateMockSearchResults(bookId: string, query: string) {
  return [
    {
      bookId,
      chapter: '第一章 序幕',
      cfi: 'epubcfi(/6/10[chapter1]!/4/2/2[result1]/2)',
      excerpt: `...这是一个关于${query}的故事，讲述了一个普通人的故事...`,
      matchIndex: 0,
    },
    {
      bookId,
      chapter: '第二章 发展',
      cfi: 'epubcfi(/6/12[chapter2]!/4/2/2[result2]/2)',
      excerpt: `...在第二章中，${query}再次出现，带来了新的转折...`,
      matchIndex: 1,
    },
    {
      bookId,
      chapter: '第三章 转折点',
      cfi: 'epubcfi(/6/14[chapter3]!/4/2/2[result3]/2)',
      excerpt: `...关于${query}的真相逐渐浮出水面，让人大吃一惊...`,
      matchIndex: 2,
    },
  ];
}
