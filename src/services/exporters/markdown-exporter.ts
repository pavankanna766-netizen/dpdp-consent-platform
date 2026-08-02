export class MarkdownExportService {
  exportMarkdown(options: {
    companyName: string;
    documentTitle: string;
    documentVersion: number;
    resolvedHtml: string;
    publishedAt?: string | null;
  }): string {
    let md = `# ${options.companyName} — ${options.documentTitle}\n\n`;
    md += `**Version**: ${options.documentVersion}.0  \n`;
    md += `**Date**: ${options.publishedAt ? new Date(options.publishedAt).toLocaleDateString() : new Date().toLocaleDateString()}  \n`;
    md += `**Jurisdiction**: DPDP Act 2023 Statutory Disclosure  \n\n`;
    md += `---\n\n`;

    // Convert HTML tags to Markdown
    const clean = options.resolvedHtml
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n\n")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
      .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
      .replace(/<ul[^>]*>/gi, "\n")
      .replace(/<\/ul>/gi, "\n")
      .replace(/<ol[^>]*>/gi, "\n")
      .replace(/<\/ol>/gi, "\n")
      .replace(/<hr[^>]*>/gi, "\n---\n")
      .replace(/<br\s*\/?>/gi, "  \n")
      .replace(/<[^>]*>/g, ""); // Strip any remaining tags

    md += clean.trim();
    return md;
  }
}

export const markdownExportService = new MarkdownExportService();
