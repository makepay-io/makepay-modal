import { mkdir, readFile, writeFile } from "node:fs/promises";
import { minify } from "terser";
const source = await readFile(new URL("../src/makepay.js", import.meta.url), "utf8");
await mkdir(new URL("../dist/", import.meta.url), { recursive: true });
await writeFile(new URL("../dist/makepay.js", import.meta.url), source);
const result = await minify(source, { compress: true, mangle: true, format: { comments: /^!/ } });
if (!result.code) throw new Error("Terser did not produce output.");
await writeFile(new URL("../dist/makepay.min.js", import.meta.url), result.code + "\n");
