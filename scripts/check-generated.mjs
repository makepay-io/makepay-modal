import { readFile } from "node:fs/promises";
for (const file of ["../dist/makepay.js", "../dist/makepay.min.js"]) {
  const contents = await readFile(new URL(file, import.meta.url), "utf8");
  if (/makepay\.io/i.test(contents)) throw new Error(`${file} contains a hard-coded MakePay domain.`);
}
