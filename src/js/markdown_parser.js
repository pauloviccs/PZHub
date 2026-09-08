/**
 * PZHub Desktop - Safe & Tactical Markdown Parser (Zero Dependencies)
 * Converte Markdown para HTML sanitizado com suporte a títulos, listas, citações, código e quebras.
 */
export function parseMarkdown(md) {
  if (!md) return '';
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Títulos h1 a h4
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Citações
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Blocos de código multilinhas
  html = html.replace(/```([\s\S]*?)```/gim, '<pre class="tarkov-code-block"><code>$1</code></pre>');

  // Código inline
  html = html.replace(/`([^`]+)`/gim, '<code class="tarkov-inline-code">$1</code>');

  // Negrito e Itálico
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/___(.*?)___/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

  // Links seguros com abertura controlada
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="tarkov-link">$1</a>');

  // Listas não ordenadas
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>(\n|$))+/gim, '<ul class="tarkov-list">$&</ul>');

  // Linhas divisórias
  html = html.replace(/^(?:---|\*\*\*|___)\s*$/gim, '<hr class="tarkov-divider" />');

  // Quebras de parágrafo e linhas
  html = html.replace(/\n\n+/g, '</p><p>');
  html = html.replace(/\n/g, '<br />');

  return `<div class="md-rendered-content">${html}</div>`;
}
