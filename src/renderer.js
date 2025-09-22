const MERMAID_BLOCK_PATTERN = /(^[ \t]*)```mermaid[^\r\n]*\r?\n([\s\S]*?)(?:\r?\n\1```[ \t]*)(?=\r?\n|$)/gm;

function dedentLines(lines) {
  const indents = lines
    .filter((line) => line.trim() !== '')
    .map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0);

  if (indents.length === 0) {
    return lines;
  }

  const indentSize = Math.min(...indents);

  return lines.map((line) => {
    if (line.trim() === '') {
      return '';
    }

    const sliceStart = Math.min(indentSize, line.length);
    return line.slice(sliceStart);
  });
}

export function normalizeMermaidDiagram(diagram) {
  if (typeof diagram !== 'string') {
    throw new TypeError('Mermaid diagram must be a string');
  }

  const normalizedLineEndings = diagram.replace(/\r\n?/g, '\n');
  const lines = normalizedLineEndings.split('\n');

  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }

  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  if (lines.length === 0) {
    return '';
  }

  const dedented = dedentLines(lines);

  return dedented.join('\n');
}

export function renderMermaidBlocks(markdown, options = {}) {
  if (typeof markdown !== 'string') {
    throw new TypeError('Markdown content must be a string');
  }

  const { wrapperTag = 'div', className = 'mermaid' } = options;
  const classAttribute = className ? ` class="${className}"` : '';

  MERMAID_BLOCK_PATTERN.lastIndex = 0;

  return markdown.replace(MERMAID_BLOCK_PATTERN, (_match, indent = '', diagram) => {
    const normalizedDiagram = normalizeMermaidDiagram(diagram);
    const inner = normalizedDiagram ? `\n${normalizedDiagram}\n` : '\n';
    return `${indent}<${wrapperTag}${classAttribute}>${inner}${indent}</${wrapperTag}>`;
  });
}

export { MERMAID_BLOCK_PATTERN };
export default renderMermaidBlocks;
