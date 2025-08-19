interface Block {
  id: string;
  type: string;
  content: any;
}

export const convertBlocksToHtml = (blocks: Block[]): string => {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'text':
          return `<p>${block.content.replace(/\n/g, '<br>')}</p>`;
        case 'heading':
          return `<h${block.content.level}>${block.content.text}</h${block.content.level}>`;
        case 'image':
          return `<img src="${block.content.src}" alt="${block.content.alt || ''}" class="max-w-full h-auto" />`;
        case 'list':
          const tag = block.content.type === 'ordered' ? 'ol' : 'ul';
          const items = block.content.items.map((item: string) => `<li>${item}</li>`).join('');
          return `<${tag}>${items}</${tag}>`;
        case 'quote':
          return `<blockquote>${block.content.replace(/\n/g, '<br>')}</blockquote>`;
        default:
          return '';
      }
    })
    .join('');
};

export const htmlToBlocks = (html: string): Block[] => {
  console.log('htmlToBlocks input:', html); // Debug log
  if (!html || html.trim() === '') {
    console.log('Empty or invalid HTML, returning default block');
    return [{ id: Date.now().toString(), type: 'text', content: '' }];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = doc.body.children;
  const blocks: Block[] = [];

  Array.from(elements).forEach((element, index) => {
    const id = Date.now().toString() + '-' + index;
    switch (element.tagName.toLowerCase()) {
      case 'p':
      case 'div':
      case 'span':
      case 'article':
        blocks.push({ id, type: 'text', content: element.innerHTML.replace(/<br\s*\/?>/g, '\n') });
        break;
      case 'h1':
      case 'h2':
      case 'h3':
        blocks.push({
          id,
          type: 'heading',
          content: { level: parseInt(element.tagName[1]), text: element.textContent || '' },
        });
        break;
      case 'img':
        blocks.push({
          id,
          type: 'image',
          content: { src: element.getAttribute('src') || '', alt: element.getAttribute('alt') || '' },
        });
        break;
      case 'ul':
      case 'ol':
        const items = Array.from(element.querySelectorAll('li')).map((li) => li.textContent || '');
        blocks.push({
          id,
          type: 'list',
          content: { type: element.tagName.toLowerCase() === 'ol' ? 'ordered' : 'bullet', items },
        });
        break;
      case 'blockquote':
        blocks.push({ id, type: 'quote', content: element.innerHTML.replace(/<br\s*\/?>/g, '\n') });
        break;
      default:
        console.log('Unhandled tag in htmlToBlocks:', element.tagName); // Debug log
        blocks.push({ id, type: 'text', content: element.innerHTML.replace(/<br\s*\/?>/g, '\n') }); // Fallback to text
        break;
    }
  });

  const result = blocks.length > 0 ? blocks : [{ id: Date.now().toString(), type: 'text', content: '' }];
  console.log('htmlToBlocks output:', result); // Debug log
  return result;
};