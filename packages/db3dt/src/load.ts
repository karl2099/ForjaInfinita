import type { DB3DT } from "./schema";
export type LoadOpts =
  | { kind: "inline"; data: DB3DT }
  | { kind: "remote"; url: string };

export async function loadDB3DT(opts: LoadOpts): Promise<DB3DT> {
  if (opts.kind === "inline") return opts.data;
  const r = await fetch(opts.url);
  return r.json();
}
