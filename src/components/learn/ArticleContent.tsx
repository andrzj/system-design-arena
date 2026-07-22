import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ArticleContentProps = {
  content: string;
  className?: string;
};

/** Drop leading `# Title` so page header is not duplicated. */
function stripLeadingH1(markdown: string): string {
  return markdown.replace(/^#\s+[^\n]+\n+/, '');
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  return (
    <div
      className={
        className ??
        'prose prose-invert mt-8 max-w-none prose-headings:font-[family-name:var(--font-heading)] prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none'
      }
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;
            const external = href.startsWith('http://') || href.startsWith('https://');
            if (external) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            }
            return <Link href={href}>{children}</Link>;
          },
        }}
      >
        {stripLeadingH1(content)}
      </Markdown>
    </div>
  );
}
