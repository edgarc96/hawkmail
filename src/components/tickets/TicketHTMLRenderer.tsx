"use client";

import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TicketHTMLRendererProps {
  html: string;
  className?: string;
}

export function TicketHTMLRenderer({ html, className = "" }: TicketHTMLRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showQuoted, setShowQuoted] = useState(false);

  useEffect(() => {
    if (containerRef.current && html) {
      // Sanitización básica
      const cleanHTML = DOMPurify.sanitize(html, {
        ADD_ATTR: [
          "style",
          "class",
          "target",
          "align",
          "valign",
          "bgcolor",
          "width",
          "height",
          "border",
          "cellpadding",
          "cellspacing",
          "colspan",
          "rowspan",
          "dir"
        ],
        ADD_TAGS: ["style", "center", "font"],
        FORBID_TAGS: ["script", "iframe"],
        KEEP_CONTENT: true,
      });

      containerRef.current.innerHTML = cleanHTML;

      // Ajustes mínimos
      const links = containerRef.current.querySelectorAll('a');
      links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });

      const imgs = containerRef.current.querySelectorAll('img');
      imgs.forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      });

      // Ocultar citas si están colapsadas
      const blockquotes = containerRef.current.querySelectorAll('blockquote');
      blockquotes.forEach(bq => {
        if (!showQuoted) {
          (bq as HTMLElement).style.display = 'none';
        } else {
          (bq as HTMLElement).style.display = 'block';
        }
      });
    }
  }, [html, showQuoted]);

  if (!html) {
    return (
      <div className="text-gray-500 italic py-4">
        <p>No hay contenido disponible</p>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        className={`email-content ${className}`}
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#e2e8f0',
          wordBreak: 'break-word',
          padding: '0',
        }}
      />
      
      {containerRef.current?.querySelectorAll('blockquote').length ? (
        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuoted(!showQuoted)}
            className="text-xs text-gray-400 hover:text-violet-400 hover:bg-white/10"
          >
            {showQuoted ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Ocultar contenido citado
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Mostrar contenido citado
              </>
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
