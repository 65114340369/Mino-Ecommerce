import { Injectable } from '@angular/core';

/**
 * Lightweight Markdown → HTML renderer
 * Supports: headings, bold, italic, code blocks, inline code,
 *           blockquotes, unordered/ordered lists, tables, horizontal rules,
 *           links, and paragraphs.
 * No external dependencies.
 */
@Injectable({ providedIn: 'root' })
export class MarkdownService {
  render(markdown: string): string {
    if (!markdown) return '';

    let html = markdown
      // Normalise line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // ── Fenced code blocks ─────────────────────────────────────────────────
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = escapeHtml(code.trimEnd());
      const cls = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${cls}>${escaped}</code></pre>`;
    });

    // ── Process line by line ───────────────────────────────────────────────
    const lines = html.split('\n');
    const output: string[] = [];
    let inTable = false;
    let tableHeader = false;
    let inList: 'ul' | 'ol' | null = null;
    let inBlockquote = false;
    let paragraph: string[] = [];

    const flushParagraph = () => {
      if (paragraph.length) {
        output.push(`<p>${paragraph.join(' ')}</p>`);
        paragraph = [];
      }
    };

    const flushList = () => {
      if (inList) {
        output.push(`</${inList}>`);
        inList = null;
      }
    };

    const flushBlockquote = () => {
      if (inBlockquote) {
        output.push('</blockquote>');
        inBlockquote = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip already-processed code blocks (they're on one "line" now)
      if (line.startsWith('<pre>')) {
        flushParagraph(); flushList(); flushBlockquote();
        output.push(line);
        continue;
      }

      // ── Horizontal rule ──────────────────────────────────────────────────
      if (/^---+$/.test(line.trim())) {
        flushParagraph(); flushList(); flushBlockquote();
        output.push('<hr>');
        continue;
      }

      // ── Headings ─────────────────────────────────────────────────────────
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        flushParagraph(); flushList(); flushBlockquote();
        const level = headingMatch[1].length;
        output.push(`<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`);
        continue;
      }

      // ── Blockquote ───────────────────────────────────────────────────────
      const bqMatch = line.match(/^>\s*(.*)/);
      if (bqMatch) {
        flushParagraph(); flushList();
        if (!inBlockquote) { output.push('<blockquote>'); inBlockquote = true; }
        output.push(`<p>${inlineFormat(bqMatch[1])}</p>`);
        continue;
      } else if (inBlockquote) {
        flushBlockquote();
      }

      // ── Table ─────────────────────────────────────────────────────────────
      if (line.includes('|')) {
        const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (cells.length > 0) {
          flushParagraph(); flushList();
          if (!inTable) {
            output.push('<table>');
            inTable = true;
            tableHeader = true;
          }
          // Separator row
          if (cells.every((c) => /^[-: ]+$/.test(c.trim()))) continue;

          const tag = tableHeader ? 'th' : 'td';
          const row = cells.map((c) => `<${tag}>${inlineFormat(c.trim())}</${tag}>`).join('');
          if (tableHeader) {
            output.push(`<thead><tr>${row}</tr></thead><tbody>`);
            tableHeader = false;
          } else {
            output.push(`<tr>${row}</tr>`);
          }
          continue;
        }
      } else if (inTable) {
        output.push('</tbody></table>');
        inTable = false;
      }

      // ── Unordered list ────────────────────────────────────────────────────
      const ulMatch = line.match(/^[-*+]\s+(.*)/);
      if (ulMatch) {
        flushParagraph(); flushBlockquote();
        if (inList !== 'ul') { flushList(); output.push('<ul>'); inList = 'ul'; }
        output.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
        continue;
      }

      // ── Ordered list ──────────────────────────────────────────────────────
      const olMatch = line.match(/^\d+\.\s+(.*)/);
      if (olMatch) {
        flushParagraph(); flushBlockquote();
        if (inList !== 'ol') { flushList(); output.push('<ol>'); inList = 'ol'; }
        output.push(`<li>${inlineFormat(olMatch[1])}</li>`);
        continue;
      } else if (inList && line.trim() === '') {
        flushList();
      }

      // ── Empty line → flush paragraph ──────────────────────────────────────
      if (line.trim() === '') {
        flushParagraph();
        continue;
      }

      // ── Regular paragraph text ────────────────────────────────────────────
      paragraph.push(inlineFormat(line));
    }

    // Flush remaining
    flushParagraph();
    flushList();
    flushBlockquote();
    if (inTable) output.push('</tbody></table>');

    return output.join('\n');
  }
}

// ── Inline formatting ─────────────────────────────────────────────────────────
function inlineFormat(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
