'use client';

import React, { useState, useEffect } from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });

import BlockToolbar from './BlockToolbar';
import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ImageBlock from './blocks/ImageBlock';
import ListBlock from './blocks/ListBlock';
import QuoteBlock from './blocks/QuoteBlock';
import { convertBlocksToHtml, htmlToBlocks } from '../utils/blockConverter';

type BlockType = 'text' | 'heading' | 'image' | 'list' | 'quote';

interface Block {
  id: string;
  type: BlockType;
  content: any;
}

interface BlockEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ initialContent, onChange }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    console.log('BlockEditor initialContent:', initialContent); // Debug log
    if (initialContent) {
      try {
        const parsedBlocks = htmlToBlocks(initialContent);
        console.log('Parsed blocks:', parsedBlocks); // Debug log
        setBlocks((prevBlocks) => {
          if (JSON.stringify(prevBlocks) !== JSON.stringify(parsedBlocks)) {
            console.log('Setting new blocks:', parsedBlocks); // Debug log
            return parsedBlocks;
          }
          return prevBlocks;
        });
      } catch (error) {
        console.error('Error parsing initialContent:', error);
        setBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
        onChange('<p></p>');
      }
    } else {
      console.log('No initialContent, setting default block'); // Debug log
      setBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
      onChange('<p></p>');
    }
  }, [initialContent]);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: type === 'image' ? { src: '', alt: '' } : type === 'list' ? { type: 'bullet', items: [] } : type === 'heading' ? { level: 2, text: '' } : '',
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    onChange(convertBlocksToHtml(newBlocks));
  };

  const updateBlock = (id: string, newContent: any) => {
    const newBlocks = blocks.map((b) => (b.id === id ? { ...b, content: newContent } : b));
    setBlocks(newBlocks);
    onChange(convertBlocksToHtml(newBlocks));
  };

  const removeBlock = (id: string) => {
    const newBlocks = blocks.filter((b) => b.id !== id);
    setBlocks(newBlocks);
    onChange(convertBlocksToHtml(newBlocks));
  };

  return (
    <div className={`border border-gray-300 rounded-lg bg-white min-h-[300px] ${montserrat.className}`}>
      <BlockToolbar onAddBlock={addBlock} />
      {blocks.length === 0 && (
        <p className="p-4 text-gray-500">Add a block to start editing...</p>
      )}
      {blocks.map((block) => {
        console.log('Rendering block:', block); // Debug log
        switch (block.type) {
          case 'text':
            return <TextBlock key={block.id} content={block.content} onChange={(c) => updateBlock(block.id, c)} onRemove={() => removeBlock(block.id)} />;
          case 'heading':
            return <HeadingBlock key={block.id} content={block.content} onChange={(c) => updateBlock(block.id, c)} onRemove={() => removeBlock(block.id)} />;
          case 'image':
            return <ImageBlock key={block.id} content={block.content} onChange={(c) => updateBlock(block.id, c)} onRemove={() => removeBlock(block.id)} />;
          case 'list':
            return <ListBlock key={block.id} content={block.content} onChange={(c) => updateBlock(block.id, c)} onRemove={() => removeBlock(block.id)} />;
          case 'quote':
            return <QuoteBlock key={block.id} content={block.content} onChange={(c) => updateBlock(block.id, c)} onRemove={() => removeBlock(block.id)} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default BlockEditor;