async function extractStream(url, prompt) {
  const res = await fetch("https://api.yellowcake.dev/v1/extract-stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "YOUR-YELLOWCAKE-API-KEY",
    },
    body: JSON.stringify({ url, prompt }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.body;
}

async function run() {
  const stream = await extractStream(
    "https://example.com",
    "Extract all product names and prices"
  );

  const reader = stream.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    process.stdout.write(chunk);
  }

  console.log("\n--- stream ended ---");
}

run().catch(console.error);
