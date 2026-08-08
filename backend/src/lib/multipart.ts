import Busboy from "busboy";
import { Readable } from "node:stream";
import { BadRequestError, PayloadTooLargeError } from "./errors.ts";

export type MultipartFile = {
  readonly fieldName: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly buffer: Buffer;
};

export type MultipartResult = {
  readonly fields: Record<string, string>;
  readonly file: MultipartFile | null;
};

export async function parseMultipart(input: {
  readonly headers: Record<string, string | string[] | undefined>;
  readonly rawBody: Buffer;
  readonly maxFileBytes: number;
}): Promise<MultipartResult> {
  const contentType = input.headers["content-type"];
  const contentTypeValue = Array.isArray(contentType)
    ? contentType[0]
    : contentType;
  if (
    contentTypeValue === undefined ||
    !contentTypeValue.toLowerCase().includes("multipart/form-data")
  ) {
    throw new BadRequestError("Expected multipart/form-data");
  }

  return new Promise<MultipartResult>((resolve, reject) => {
    const fields: Record<string, string> = {};
    let file: MultipartFile | null = null;
    let settled = false;

    const fail = (err: Error): void => {
      if (settled) {
        return;
      }
      settled = true;
      reject(err);
    };

    const bb = Busboy({
      headers: { "content-type": contentTypeValue },
      limits: {
        files: 1,
        fileSize: input.maxFileBytes,
        fields: 20,
        fieldSize: 16_384,
      },
    });

    bb.on("file", (fieldName, stream, info) => {
      const chunks: Buffer[] = [];
      let total = 0;
      let truncated = false;

      stream.on("data", (chunk: Buffer) => {
        total += chunk.byteLength;
        if (total > input.maxFileBytes) {
          truncated = true;
          stream.resume();
          return;
        }
        chunks.push(chunk);
      });

      stream.on("limit", () => {
        truncated = true;
      });

      stream.on("end", () => {
        if (truncated) {
          fail(new PayloadTooLargeError());
          return;
        }
        file = {
          fieldName,
          filename: info.filename,
          mimeType: info.mimeType,
          buffer: Buffer.concat(chunks, total),
        };
      });
    });

    bb.on("field", (name, value) => {
      fields[name] = value;
    });

    bb.on("error", (err: Error) => {
      fail(err);
    });

    bb.on("finish", () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve({ fields, file });
    });

    Readable.from(input.rawBody).pipe(bb);
  });
}
