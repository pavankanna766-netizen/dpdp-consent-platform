export interface PdfSection {
  title: string;
  content: string[];
}

export interface PrivacyPdf {
  title: string;

  generatedAt: string;

  sections: PdfSection[];
}