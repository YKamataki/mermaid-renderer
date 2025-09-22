import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { normalizeMermaidDiagram, renderMermaidBlocks } from '../src/renderer.js';

const normalizeNewlines = (value) => value.replace(/\r\n/g, '\n');

describe('normalizeMermaidDiagram', () => {
  it('trims blank lines and dedents the diagram', () => {
    const diagram = '\n    graph TD\n      A --> B\n      B --> C\n    \n';
    const expected = 'graph TD\n  A --> B\n  B --> C';

    assert.strictEqual(normalizeMermaidDiagram(diagram), expected);
  });

  it('returns an empty string when content is only whitespace', () => {
    assert.strictEqual(normalizeMermaidDiagram('   \n\t\n'), '');
  });

  it('throws when the input is not a string', () => {
    assert.throws(() => normalizeMermaidDiagram(), TypeError);
  });
});

describe('renderMermaidBlocks', () => {
  it('leaves text without mermaid blocks unchanged', () => {
    const markdown = '# Title\n\nParagraph.\n';
    assert.strictEqual(renderMermaidBlocks(markdown), markdown);
  });

  it('renders a single mermaid block as a HTML container', () => {
    const markdown = [
      'Diagram example:',
      '',
      '```mermaid',
      '    graph TD',
      '      A --> B',
      '      B --> C',
      '```',
      'Done.'
    ].join('\n');

    const expected = [
      'Diagram example:',
      '',
      '<div class="mermaid">',
      'graph TD',
      '  A --> B',
      '  B --> C',
      '</div>',
      'Done.'
    ].join('\n');

    assert.strictEqual(renderMermaidBlocks(markdown), expected);
  });

  it('handles multiple diagrams and normalizes Windows newlines', () => {
    const markdown = [
      '```mermaid {init: {"theme": "forest"}}',
      '\tsequenceDiagram',
      '\tAlice->>Bob: Hello Bob, how are you?',
      '```',
      '',
      '```mermaid',
      'graph TD',
      '    X --> Y',
      '```',
      ''
    ].join('\r\n');

    const expected = [
      '<div class="mermaid">',
      'sequenceDiagram',
      'Alice->>Bob: Hello Bob, how are you?',
      '</div>',
      '',
      '<div class="mermaid">',
      'graph TD',
      '    X --> Y',
      '</div>',
      ''
    ].join('\n');

    assert.strictEqual(normalizeNewlines(renderMermaidBlocks(markdown)), expected);
  });

  it('keeps surrounding indentation when a block is nested in Markdown structures', () => {
    const markdown = [
      '- Item',
      '  ```mermaid',
      '  graph TD',
      '      A --> B',
      '  ```',
      '  After.'
    ].join('\n');

    const expected = [
      '- Item',
      '  <div class="mermaid">',
      'graph TD',
      '    A --> B',
      '  </div>',
      '  After.'
    ].join('\n');

    assert.strictEqual(renderMermaidBlocks(markdown), expected);
  });

  it('throws when markdown is not a string', () => {
    assert.throws(() => renderMermaidBlocks(null), TypeError);
  });
});
