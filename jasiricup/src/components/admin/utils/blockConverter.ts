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
          return `<p>${(block.content || '').replace(/\n/g, '<br>')}</p>`;
        case 'heading':
          const level = block.content?.level || 2;
          const text = block.content?.text || '';
          return `<h${level}>${text}</h${level}>`;
        case 'image':
          const src = block.content?.src || '';
          const alt = block.content?.alt || '';
          return src ? `<img src="${src}" alt="${alt}" class="max-w-full h-auto" />` : '';
        case 'list':
          const listType = block.content?.type || 'bullet';
          const items = block.content?.items || [];
          const tag = listType === 'ordered' ? 'ol' : 'ul';
          const itemsHtml = items.map((item: string) => `<li>${item}</li>`).join('');
          return items.length > 0 ? `<${tag}>${itemsHtml}</${tag}>` : '';
        case 'quote':
          return `<blockquote>${(block.content || '').replace(/\n/g, '<br>')}</blockquote>`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('');
};

export const htmlToBlocks = (html: string): Block[] => {
  console.log('htmlToBlocks input:', html);
  
  if (!html || html.trim() === '' || html.trim() === '<p></p>') {
    return [{ id: Date.now().toString(), type: 'text', content: '' }];
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const elements = doc.body.firstChild?.children || [];
    const blocks: Block[] = [];

    Array.from(elements).forEach((element, index) => {
      const id = `${Date.now()}-${index}`;
      const tagName = element.tagName.toLowerCase();

      switch (tagName) {
        case 'p':
        case 'div':
          const textContent = element.innerHTML.replace(/<br\s*\/?>/gi, '\n');
          blocks.push({ 
            id, 
            type: 'text', 
            content: textContent || ''
          });
          break;
          
        case 'h1':
        case 'h2':
        case 'h3':
          blocks.push({
            id,
            type: 'heading',
            content: { 
              level: parseInt(tagName[1]), 
              text: element.textContent || '' 
            },
          });
          break;
          
        case 'img':
          blocks.push({
            id,
            type: 'image',
            content: { 
              src: element.getAttribute('src') || '', 
              alt: element.getAttribute('alt') || '' 
            },
          });
          break;
          
        case 'ul':
        case 'ol':
          const items = Array.from(element.querySelectorAll('li')).map((li) => li.textContent || '');
          blocks.push({
            id,
            type: 'list',
            content: { 
              type: tagName === 'ol' ? 'ordered' : 'bullet', 
              items 
            },
          });
          break;
          
        case 'blockquote':
          blocks.push({ 
            id, 
            type: 'quote', 
            content: element.innerHTML.replace(/<br\s*\/?>/gi, '\n') || ''
          });
          break;
          
        default:
          // Fallback to text block for unknown elements
          blocks.push({ 
            id, 
            type: 'text', 
            content: element.innerHTML.replace(/<br\s*\/?>/gi, '\n') || ''
          });
          break;
      }
    });

    const result = blocks.length > 0 ? blocks : [{ id: Date.now().toString(), type: 'text', content: '' }];
    console.log('htmlToBlocks output:', result);
    return result;
  } catch (error) {
    console.error('HTML parsing error:', error);
    return [{ id: Date.now().toString(), type: 'text', content: html }];
  }
};