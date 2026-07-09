import {
  PDFPage,
  PDFFont,
} from "pdf-lib";

export class PdfCanvas {
  private cursorY = 780;

  constructor(
    private readonly page: PDFPage,
    private readonly font: PDFFont,
    private readonly boldFont: PDFFont
  ) {}

  heading(text: string) {
    this.page.drawText(text, {
      x: 50,
      y: this.cursorY,
      size: 24,
      font: this.boldFont,
    });

    this.cursorY -= 35;
  }

  subHeading(text: string) {
    this.page.drawText(text, {
      x: 50,
      y: this.cursorY,
      size: 16,
      font: this.boldFont,
    });

    this.cursorY -= 25;
  }

  text(text: string) {
    this.page.drawText(text, {
      x: 50,
      y: this.cursorY,
      size: 11,
      font: this.font,
    });

    this.cursorY -= 18;
  }

  labelValue(
  label: string,
  value: string
) {
  this.page.drawText(label, {
    x: 50,
    y: this.cursorY,
    size: 11,
    font: this.boldFont,
  });

  this.page.drawText(value, {
    x: 180,
    y: this.cursorY,
    size: 11,
    font: this.font,
  });

  this.cursorY -= 18;
}

  divider() {
    this.page.drawLine({
      start: {
        x: 50,
        y: this.cursorY,
      },
      end: {
        x: 545,
        y: this.cursorY,
      },
      thickness: 1,
    });

    this.cursorY -= 20;
  }

  table(
  rows: Record<string, unknown>[]
) {
  if (rows.length === 0) {
    return;
  }

  const headers = [
    "Time",
    "Event",
    "Entity",
    "Actor",
  ];

  const keys = [
    "time",
    "event",
    "entity",
    "actor",
  ];

  const widths = [
    170,
    130,
    90,
    90,
  ];

  let x = 50;

  // Header
  headers.forEach(
    (header, index) => {
      this.page.drawText(header, {
        x,
        y: this.cursorY,
        size: 11,
        font: this.boldFont,
      });

      x += widths[index];
    }
  );

  this.cursorY -= 18;

  this.divider();

  rows.forEach((row) => {
    x = 50;

    keys.forEach(
      (key, index) => {
        const value = String(
          row[key] ?? ""
        );

        this.page.drawText(value, {
          x,
          y: this.cursorY,
          size: 9,
          font: this.font,
        });

        x += widths[index];
      }
    );

    this.cursorY -= 16;
  });
}

  get y() {
    return this.cursorY;
  }
}