'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  const [initialized, setInitialized] = useState(false);

  // Initialize blocks only once when component mounts or initialContent changes
  useEffect(() => {
    console.log('BlockEditor initializing with content:', initialContent);
    
    if (initialContent && initialContent.trim() !== '') {
      try {
        const parsedBlocks = htmlToBlocks(initialContent);
        console.log('Parsed blocks:', parsedBlocks);
        // Ensure type is BlockType
        const typedBlocks: Block[] = parsedBlocks.map((b: any) => ({
          ...b,
          type: b.type as BlockType,
        }));
        setBlocks(typedBlocks);
      } catch (error) {
        console.error('Error parsing initialContent:', error);
        setBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
      }
    } else {
      setBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
    }
    
    setInitialized(true);
  }, [initialContent]); // Only depend on initialContent, NOT onChange

  // Separate function to handle content updates
  const updateContent = useCallback((newBlocks: Block[]) => {
    const html = convertBlocksToHtml(newBlocks);
    onChange(html);
  }, [onChange]);

  const addBlock = (type: BlockType) => {
    const defaultContent = {
      text: '',
      heading: { level: 2, text: '' },
      image: { src: '', alt: '' },
      list: { type: 'bullet', items: [''] },
      quote: ''
    };

    const newBlock: Block = {
      id: Date.now().toString() + Math.random(),
      type,
      content: defaultContent[type] || '',
    };
    
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    updateContent(newBlocks);
  };

  const updateBlock = (id: string, newContent: any) => {
    const newBlocks = blocks.map((b) => (b.id === id ? { ...b, content: newContent } : b));
    setBlocks(newBlocks);
    updateContent(newBlocks);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return; // Don't allow removing the last block
    
    const newBlocks = blocks.filter((b) => b.id !== id);
    setBlocks(newBlocks);
    updateContent(newBlocks);
  };

  if (!initialized) {
    return (
      <div className={`border border-gray-300 rounded-lg bg-white min-h-[300px] flex items-center justify-center ${montserrat.className}`}>
        <p className="text-gray-500">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg bg-white min-h-[300px] ${montserrat.className}`}>
      <BlockToolbar onAddBlock={addBlock} />
      {blocks.length === 0 && (
        <p className="p-4 text-gray-500">Add a block to start editing...</p>
      )}
      {blocks.map((block) => {
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
