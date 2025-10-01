"use client";

const HTML_TAG_RE = /<[a-z][\s\S]*>/i;

export function isHtmlContent(value?: string | null): boolean {
  if (!value) return false;
  return HTML_TAG_RE.test(value);
}

export function stripHtml(value?: string | null): string {
  if (!value) return "";
  if (!isHtmlContent(value)) return value.trim();
  // Remove tags, decode the few entities the rich text editor commonly emits,
  // and collapse whitespace for clean clamped previews.
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasRichTextContent(value?: string | null): boolean {
  return stripHtml(value).length > 0;
}

interface RichContentProps {
  html?: string | null;
  className?: string;
}

export default function RichContent({ html, className = "" }: RichContentProps) {
  if (!html) return null;

  if (isHtmlContent(html)) {
    return (
      <div
        className={`
          rich-text-content
          prose prose-sm max-w-none
          prose-p:my-2 prose-p:leading-relaxed prose-p:text-gray-600 prose-p:break-words prose-p:whitespace-normal
          prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-4 prose-headings:mb-2 prose-headings:break-words
          prose-h1:text-xl prose-h1:font-bold prose-h1:mb-3 prose-h1:break-words
          prose-h2:text-lg prose-h2:font-bold prose-h2:mb-2.5 prose-h2:break-words
          prose-h3:text-base prose-h3:font-semibold prose-h3:mb-2 prose-h3:break-words
          prose-h4:text-sm prose-h4:font-semibold prose-h4:mb-1.5 prose-h4:break-words
          prose-h5:text-sm prose-h5:font-medium prose-h5:mb-1 prose-h5:break-words
          prose-ul:my-2 prose-ul:pl-5 prose-ul:list-disc prose-ul:break-words
          prose-ol:my-2 prose-ol:pl-5 prose-ol:list-decimal prose-ol:break-words
          prose-li:my-1 prose-li:leading-relaxed prose-li:break-words prose-li:whitespace-normal
          prose-li:marker:text-gray-500
          prose-strong:font-semibold prose-strong:text-gray-900 prose-strong:break-words
          prose-em:text-gray-600 prose-em:italic prose-em:break-words
          prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-2 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:break-words
          prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:break-words
          prose-pre:bg-gray-50 prose-pre:text-gray-700 prose-pre:p-3 prose-pre:rounded-lg prose-pre:my-3 prose-pre:overflow-x-auto prose-pre:whitespace-pre-wrap prose-pre:break-words
          prose-a:text-[#0158B7] prose-a:underline prose-a:decoration-[#0158B7]/30 prose-a:hover:decoration-[#0158B7] prose-a:break-words
          prose-img:rounded-lg prose-img:my-2 prose-img:max-w-full prose-img:h-auto
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:break-words [&_ul]:whitespace-normal
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:break-words [&_ol]:whitespace-normal
          [&_li]:my-1 [&_li]:break-words [&_li]:whitespace-normal
          [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-2 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:break-words
          [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:break-words
          [&_pre]:bg-gray-50 [&_pre]:text-gray-700 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre_code]:bg-transparent [&_pre_code]:p-0
          [&_a]:text-[#0158B7] [&_a]:underline [&_a]:decoration-[#0158B7]/30 [&_a:hover]:decoration-[#0158B7] [&_a]:break-words
          [&_img]:rounded-lg [&_img]:my-2 [&_img]:max-w-full [&_img]:h-auto
          [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-gray-900 [&_h1]:break-words
          [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2.5 [&_h2]:text-gray-900 [&_h2]:break-words
          [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-gray-900 [&_h3]:break-words
          [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:mb-1.5 [&_h4]:text-gray-900 [&_h4]:break-words
          [&_h5]:text-sm [&_h5]:font-medium [&_h5]:mb-1 [&_h5]:text-gray-900 [&_h5]:break-words
          [&_p]:my-2 [&_p]:leading-relaxed [&_p]:text-gray-600 [&_p]:break-words [&_p]:whitespace-normal
          [&_strong]:font-semibold [&_strong]:text-gray-900 [&_strong]:break-words
          [&_em]:italic [&_em]:text-gray-600 [&_em]:break-words
          overflow-hidden
          break-words
          whitespace-normal
          w-full
          max-w-full
          ${className}
        `}
        style={{
          wordWrap: "break-word",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          maxWidth: "100%",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <p
      className={`text-sm text-gray-600 leading-relaxed break-words whitespace-pre-wrap w-full max-w-full ${className}`}
      style={{
        wordWrap: "break-word",
        overflowWrap: "break-word",
        wordBreak: "break-word",
      }}
    >
      {html}
    </p>
  );
}

interface RichContentPreviewProps {
  html?: string | null;
  className?: string;
  lines?: 1 | 2 | 3 | 4 | 5 | 6;
  fallback?: string;
}

const CLAMP_CLASS: Record<number, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

export function RichContentPreview({
  html,
  className = "",
  lines = 2,
  fallback = "",
}: RichContentPreviewProps) {
  const text = stripHtml(html) || fallback;
  if (!text) return null;
  return (
    <p className={`${CLAMP_CLASS[lines]} break-words ${className}`}>{text}</p>
  );
}
