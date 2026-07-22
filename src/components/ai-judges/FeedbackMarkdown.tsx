'use client';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type FeedbackMarkdownProps = {
  content: string;
};

export function FeedbackMarkdown({ content }: FeedbackMarkdownProps) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-[family-name:var(--font-heading)] prose-headings:font-semibold prose-a:text-primary prose-sm leading-relaxed">
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
}
