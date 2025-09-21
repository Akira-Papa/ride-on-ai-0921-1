import { NextResponse } from "next/server";

type ErrorBody = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

type SuccessBody<T> = T extends void ? Record<string, never> : T;

type ErrorOptions = {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export function jsonOk<T>(body: SuccessBody<T>, init?: ResponseInit) {
  return NextResponse.json(body, { status: 200, ...init });
}

export function jsonCreated<T>(body: SuccessBody<T>) {
  return NextResponse.json(body, { status: 201 });
}

export function jsonNoContent() {
  return new NextResponse(null, { status: 204 });
}

export function jsonError({
  status,
  code,
  message,
  details,
}: ErrorOptions) {
  const body: ErrorBody = {
    error: {
      code,
      message,
      details,
    },
  };
  return NextResponse.json(body, { status });
}
