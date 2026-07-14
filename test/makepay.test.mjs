import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
const source = await readFile(new URL("../src/makepay.js", import.meta.url), "utf8");
function browser() { const dom = new JSDOM("<!doctype html><body></body>", { url: "https://merchant.example", runScripts: "outside-only" }); dom.window.eval(source); return dom.window; }
function configuredBrowser() { const dom = new JSDOM('<!doctype html><script data-api-url-prefix="https://pay.example"></script><body></body>', { url: "https://merchant.example", runScripts: "outside-only" }); dom.window.eval(source); return dom.window; }
test("contains no hard-coded MakePay domain", () => assert.doesNotMatch(source, /makepay\.io/i));
test("requires explicit configuration", () => assert.throws(() => browser().makepay.showPayment("p_1"), /Configure MakePay/));
test("builds payment URL from configured origin", () => { const w = browser(); w.makepay.init({ apiUrlPrefix: "https://pay.example/base/" }); w.makepay.showPayment("a/b", { viewType: "minimal" }); const frame = w.document.querySelector("iframe"); assert.equal(new URL(frame.src).origin, "https://pay.example"); assert.match(frame.src, /\/embed\/payment\/a%2Fb/); assert.match(frame.src, /viewType=minimal/); });
test("reads checkout origin from the script attribute", () => { const w = configuredBrowser(); w.makepay.showPayment("p_1"); assert.equal(new URL(w.document.querySelector("iframe").src).origin, "https://pay.example"); });
test("ignores close messages from other origins", () => { const w = browser(); w.makepay.setApiUrlPrefix("https://pay.example").showPayment("p_1"); const frame = w.document.querySelector("iframe"); w.dispatchEvent(new w.MessageEvent("message", { origin: "https://evil.example", data: "close" })); assert.equal(frame.style.display, "block"); w.dispatchEvent(new w.MessageEvent("message", { origin: "https://pay.example", data: "close" })); assert.equal(frame.style.display, "none"); });
test("forwards trusted checkout events", () => { const w = configuredBrowser(); let received; w.makepay.showPayment("p_1", { onEvent: event => { received = event; } }); w.dispatchEvent(new w.MessageEvent("message", { origin: "https://pay.example", data: { source: "makepay", type: "makepay.payment.status", payload: { status: "paid" } } })); assert.equal(received.type, "makepay.payment.status"); assert.equal(received.payload.status, "paid"); });
test("data attribute opens a payment", () => { const w = browser(); w.makepay.setApiUrlPrefix("https://pay.example"); const button = w.document.createElement("button"); button.dataset.makepayPaymentLink = "p_2"; w.document.body.append(button); button.click(); assert.match(w.document.querySelector("iframe").src, /p_2/); });
