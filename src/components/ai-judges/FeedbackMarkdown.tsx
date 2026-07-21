'use client';

type FeedbackMarkdownProps = {
  content: string;
};

export function FeedbackMarkdown({ content }: FeedbackMarkdownProps) {
  return (
    <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
      {content}
    </div>
  );
}
