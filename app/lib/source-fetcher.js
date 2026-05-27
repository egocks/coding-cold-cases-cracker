export async function fetchOriginalQuestion(coldCase) {
  if (!coldCase.question_id || process.env.CCCC_FETCH_STACKOVERFLOW === "false") {
    return {
      fetched: false,
      source: "index-excerpt",
      text: coldCase.why_interesting || "",
      note: "Original question fetch skipped; using source index excerpt."
    };
  }

  const stackPrinterUrl = `https://stackprinter.appspot.com/export?question=${encodeURIComponent(coldCase.question_id)}&service=stackoverflow&language=en&hideAnswers=false&showAll=true&width=900`;
  const apiUrl = `https://api.stackexchange.com/2.3/questions/${encodeURIComponent(coldCase.question_id)}?order=desc&sort=activity&site=stackoverflow&filter=withbody`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(process.env.CCCC_SOURCE_FETCH_TIMEOUT_MS || 15000));

  try {
    const api = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        "user-agent": "CodingColdCasesCracker/0.1 (+https://github.com/egocks/coding-cold-cases-cracker)"
      }
    });

    if (api.ok) {
      const json = await api.json();
      const item = json.items?.[0];
      if (item?.body) {
        return {
          fetched: true,
          source: apiUrl,
          text: htmlToText(item.body),
          owner: stackOwner(item.owner),
          note: "Fetched original Stack Overflow question body via Stack Exchange API."
        };
      }
    }

    const response = await fetch(stackPrinterUrl, { signal: controller.signal });
    if (!response.ok) {
      return fallback(coldCase, stackPrinterUrl, `StackPrinter returned HTTP ${response.status}. Stack Exchange API did not return a usable body.`);
    }

    const html = await response.text();
    const text = htmlToText(html);
    if (looksLikeRateLimit(text)) {
      return fallback(coldCase, stackPrinterUrl, "StackPrinter returned a rate-limit page and Stack Exchange API did not return a usable body.");
    }
    if (!text.trim()) {
      return fallback(coldCase, stackPrinterUrl, "StackPrinter returned no readable text.");
    }

    return {
      fetched: true,
      source: stackPrinterUrl,
      text,
      note: "Fetched original Stack Overflow question via StackPrinter."
    };
  } catch (error) {
    return fallback(coldCase, apiUrl, `Fetch failed: ${error.message}`);
  } finally {
    clearTimeout(timer);
  }
}

function fallback(coldCase, source, note) {
  return {
    fetched: false,
    source,
    text: coldCase.why_interesting || "",
    owner: null,
    note
  };
}

function stackOwner(owner) {
  if (!owner) return null;
  return {
    display_name: owner.display_name || null,
    user_id: owner.user_id || null,
    link: owner.link || null
  };
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|pre|blockquote|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function looksLikeRateLimit(text) {
  const normalized = text.toLowerCase();
  return normalized.includes("too many requests") || normalized.includes("quota") && normalized.includes("stackprinter");
}
