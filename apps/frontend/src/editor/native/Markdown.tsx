import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  enableMath?: boolean;
  enableGfm?: boolean;
  enableHtml?: boolean;
  linkTarget?: string;
  theme?: 'default' | 'github' | 'dark' | 'minimal' | 'colorful';
}

export const Markdown = memo<MarkdownProps>(({
  content,
  className = '',
  style,
  enableMath = true,
  enableGfm = true,
  enableHtml = true,
  linkTarget = '_blank',
  theme = 'default'
}) => {
  // Configure plugins based on props
  const remarkPlugins = [];
  const rehypePlugins = [];

  if (enableGfm) {
    remarkPlugins.push(remarkGfm);
  }

  if (enableMath) {
    remarkPlugins.push(remarkMath);
    rehypePlugins.push(rehypeKatex);
  }

  if (enableHtml) {
    rehypePlugins.push(rehypeRaw);
  }

  // Theme-based styling
  const getThemeClasses = () => {
    switch (theme) {
      case 'github':
        return 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm';
      case 'dark':
        return 'bg-gray-900 text-gray-100 border border-gray-700 rounded-lg p-6';
      case 'minimal':
        return 'bg-gray-50 p-4 rounded border-l-4 border-blue-500';
      case 'colorful':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg';
      default:
        return 'bg-white p-4 rounded-lg shadow-sm border border-gray-100';
    }
  };

  const getTextTheme = () => {
    switch (theme) {
      case 'dark':
        return {
          heading: 'text-gray-100',
          text: 'text-gray-300',
          muted: 'text-gray-400',
          link: 'text-blue-400 hover:text-blue-300',
          code: 'bg-gray-800 text-green-400',
          blockquote: 'border-blue-400 bg-gray-800',
        };
      case 'colorful':
        return {
          heading: 'text-indigo-900',
          text: 'text-gray-800',
          muted: 'text-gray-600',
          link: 'text-purple-600 hover:text-purple-800',
          code: 'bg-purple-100 text-purple-800',
          blockquote: 'border-purple-500 bg-purple-50',
        };
      case 'minimal':
        return {
          heading: 'text-gray-900',
          text: 'text-gray-700',
          muted: 'text-gray-500',
          link: 'text-blue-600 hover:text-blue-800',
          code: 'bg-gray-200 text-gray-800',
          blockquote: 'border-blue-500 bg-blue-50',
        };
      default:
        return {
          heading: 'text-gray-900',
          text: 'text-gray-700',
          muted: 'text-gray-600',
          link: 'text-blue-600 hover:text-blue-800',
          code: 'bg-gray-100 text-red-600',
          blockquote: 'border-blue-500 bg-blue-50',
        };
    }
  };

  const colors = getTextTheme();

  return (
    <div className={`markdown-content ${getThemeClasses()} ${className}`} style={style}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          // Enhanced styling for all markdown elements with theme support
          h1: ({ children }) => (
            <h1 className={`text-3xl font-bold mb-6 ${colors.heading} border-b-2 border-current pb-3 relative`}>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {children}
              </span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-2xl font-semibold mb-4 ${colors.heading} border-b border-current pb-2 mt-8 first:mt-0`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-xl font-semibold mb-3 ${colors.heading} mt-6 first:mt-0`}>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className={`text-lg font-medium mb-2 ${colors.text} mt-4 first:mt-0`}>
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className={`text-base font-medium mb-2 ${colors.text} mt-3 first:mt-0`}>
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className={`text-sm font-medium mb-1 ${colors.muted} mt-2 first:mt-0`}>
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className={`mb-4 ${colors.text} leading-relaxed text-justify`}>
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={linkTarget}
              rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
              className={`${colors.link} underline hover:no-underline transition-all duration-200 font-medium`}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className={`font-bold ${colors.heading}`}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={`italic ${colors.text} font-medium`}>
              {children}
            </em>
          ),
          del: ({ children }) => (
            <del className={`line-through ${colors.muted} opacity-75`}>
              {children}
            </del>
          ),
          code: ({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
            if (inline) {
              return (
                <code className={`${colors.code} px-2 py-1 rounded text-sm font-mono font-semibold`}>
                  {children}
                </code>
              );
            }

            // Extract language from className (format: language-xxx)
            const language = className?.replace('language-', '') || '';

            return (
              <div className="mb-6 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                {language && (
                  <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs font-mono font-semibold border-b border-gray-600 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-4"></span>
                    {language.toUpperCase()}
                  </div>
                )}
                <pre className={`bg-gray-900 text-gray-100 p-6 overflow-x-auto ${!language ? 'rounded-lg' : 'rounded-b-lg'}`}>
                  <code className="font-mono text-sm leading-relaxed">{children}</code>
                </pre>
              </div>
            );
          },
          pre: ({ children }) => children, // Let code component handle pre styling
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 ${colors.blockquote} pl-6 py-4 mb-6 rounded-r-lg italic font-medium shadow-sm`}>
              <div className="flex">
                <span className="text-4xl opacity-30 mr-2">"</span>
                <div className="flex-1">{children}</div>
              </div>
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className={`list-none mb-6 space-y-2 ${colors.text}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-none mb-6 space-y-2 ${colors.text} counter-reset-[list-counter]`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-2 pl-4 relative">
              <span className="absolute left-0 top-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
              {children}
            </li>
          ),
          hr: () => (
            <div className="my-8 flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <div className="mx-4">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6 rounded-lg shadow-lg border border-gray-200">
              <table className="min-w-full">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-blue-50 transition-colors duration-150">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-6 py-4 text-left font-bold text-white text-sm uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`px-6 py-4 ${colors.text} font-medium`}>
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            <div className="mb-6 text-center">
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-xl shadow-lg mx-auto border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                loading="lazy"
              />
              {alt && (
                <p className={`mt-2 text-sm ${colors.muted} italic`}>
                  {alt}
                </p>
              )}
            </div>
          ),
          // Task list items (GitHub Flavored Markdown)
          input: ({ type, checked, disabled }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  className="mr-3 w-4 h-4 accent-blue-600 rounded border-2 border-gray-300"
                  readOnly
                />
              );
            }
            return <input type={type} checked={checked} disabled={disabled} />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

Markdown.displayName = 'Markdown';