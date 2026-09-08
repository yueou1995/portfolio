import type { InlineTextContent } from "@/data/portfolio";

export function InlineText({ content }: { content: InlineTextContent }) {
  if (typeof content === "string") return content;

  return content.map((part, index) => {
    if (part.href) {
      return (
        <a
          key={index}
          className="inline-link"
          href={part.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${part.text} (opens in a new tab)`}
        >
          {part.strong ? <strong>{part.text}</strong> : part.text}
        </a>
      );
    }

    return part.strong ? <strong key={index}>{part.text}</strong> : part.text;
  });
}