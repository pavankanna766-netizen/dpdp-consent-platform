export class Clock {
  static now(): Date {
    return new Date();
  }

  static iso(): string {
    return this.now().toISOString();
  }
}