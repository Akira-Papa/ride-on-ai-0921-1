export class NextResponse {
  public status: number;
  public body: unknown;

  constructor(body: unknown, init?: { status?: number }) {
    this.body = body;
    this.status = init?.status ?? 200;
  }

  static json(body: unknown, init?: { status?: number }) {
    return new NextResponse(body, { status: init?.status ?? 200 });
  }

  async json() {
    return this.body;
  }
}
