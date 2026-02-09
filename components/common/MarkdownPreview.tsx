"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Box } from "@mui/material";

interface MarkdownPreviewProps {
  content: string;
}

/**
 * Markdown テキストをレンダリングするプレビューコンポーネント
 */
export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <Box
      sx={{
        lineHeight: 1.7,
        "& h1, & h2, & h3, & h4, & h5, & h6": {
          mt: 2,
          mb: 1,
          fontWeight: 600,
        },
        "& p": { mb: 1 },
        "& ul, & ol": { pl: 3, mb: 1 },
        "& code": {
          bgcolor: "#F5F5F5",
          px: 0.5,
          borderRadius: 0.5,
          fontSize: "0.875em",
          fontFamily: "monospace",
        },
        "& pre": { mb: 1 },
        "& img": { maxWidth: "100%", borderRadius: 1 },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            if (match) {
              return (
                <SyntaxHighlighter
                  style={oneLight}
                  language={match[1]}
                  PreTag="div"
                >
                  {codeString}
                </SyntaxHighlighter>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}
