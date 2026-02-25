"use client";

/**
 * Renders product description with optional structure:
 * - Lines starting with "## " = section heading (shown uppercase, bold)
 * - Lines starting with "- " or "• " = bullet item (red bullet + vertical line)
 * - Other lines = plain paragraph (preserves newlines)
 */
export function ProductDescription({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const blocks: { type: "heading" | "list" | "paragraph"; content: string; items?: string[] }[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "heading", content: trimmed.slice(3).trim() });
      i++;
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const items: string[] = [];
      while (i < lines.length) {
        const ln = lines[i].trim();
        if (ln.startsWith("- ")) items.push(ln.slice(2));
        else if (ln.startsWith("• ")) items.push(ln.slice(2));
        else if (ln === "") break;
        else break;
        i++;
      }
      blocks.push({ type: "list", content: "", items });
      continue;
    }

    if (trimmed === "") {
      i++;
      continue;
    }

    const para: string[] = [trimmed];
    i++;
    while (i < lines.length) {
      const ln = lines[i];
      if (ln.trim() === "" || ln.trim().startsWith("## ") || ln.trim().startsWith("- ") || ln.trim().startsWith("• "))
        break;
      para.push(ln.trim());
      i++;
    }
    blocks.push({ type: "paragraph", content: para.join("\n") });
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          return (
            <h3
              key={idx}
              className="text-sm font-bold uppercase tracking-wider text-white sm:text-base"
            >
              {block.content}
            </h3>
          );
        }
        if (block.type === "list" && block.items?.length) {
          return (
            <ul
              key={idx}
              className="list-none space-y-1.5 border-l-2 border-element-red pl-4"
              style={{ borderImage: "none" }}
            >
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-element-red" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} className="whitespace-pre-wrap leading-relaxed text-gray-300">
            {block.content}
          </p>
        );
      })}
    </div>
  );
}
