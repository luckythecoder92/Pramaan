import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }

  return "";
}

function getCodeLanguage(children: ReactNode): string | null {
  const firstChild = Children.toArray(children)[0];

  if (!isValidElement<{ className?: string }>(firstChild)) {
    return null;
  }

  const match = /language-([\w-]+)/.exec(firstChild.props.className ?? "");
  return match?.[1] ?? null;
}

function CodeBlock({ children }: ComponentPropsWithoutRef<"pre">) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  const language = getCodeLanguage(children);
  const code = extractText(children).replace(/\n$/, "");

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      // Clipboard access can be blocked; the code remains selectable.
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/50 px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {language ?? "code"}
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>

      <pre className="overflow-x-auto p-3 text-[12px] leading-6 text-foreground">
        {children}
      </pre>
    </div>
  );
}

const components: Components = {
  a: ({ href, children, title }) => (
    <a
      href={href}
      title={title}
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
    >
      {children}
    </a>
  ),
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => (
    <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 mt-4 text-[15px] font-semibold first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-1.5 mt-3 text-sm font-semibold first:mt-0">{children}</h4>
  ),
  h4: ({ children }) => (
    <h5 className="mb-1.5 mt-3 text-sm font-semibold first:mt-0">{children}</h5>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5 marker:text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-primary/40 pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-border" />,
  pre: CodeBlock,
  code: ({ className, children }) => {
    const isBlock = Boolean(className?.includes("language-"));

    if (isBlock) {
      return (
        <code className="font-mono text-[12px] leading-6">{children}</code>
      );
    }

    return (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-left text-xs">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-border px-3 py-2 font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border px-3 py-2 last:border-b-0">
      {children}
    </td>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt ?? ""}
      className="my-2 max-w-full rounded-lg border border-border"
    />
  ),
};

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="max-w-none break-words text-sm leading-6 text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
