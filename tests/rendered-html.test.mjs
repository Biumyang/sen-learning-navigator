import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the SEN learning navigator", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>明路 · SEN 學習導航器<\/title>/);
  assert.match(html, /讓題目更好懂/);
  assert.match(html, /生成學生版本/);
  assert.match(html, /教師預覽模式/);
  assert.match(html, /專注模式已開啟/);
  assert.match(html, /先閱讀題目，再選出正確數字/);
  assert.match(html, /先選一個數字/);
  assert.doesNotMatch(html, /<div class="number-card">/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("emits product-specific social metadata", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /property="og:title" content="明路 · SEN 學習導航器"/);
  assert.match(html, /property="og:image" content="http:\/\/localhost:3000\/og.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
});
