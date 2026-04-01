export const componentContentFallbacks = {
  activityMeta: "No timestamp yet",
  activityStatus: "Queued",
  activityTitle: "Activity",
  faqAnswer: "Add an answer in the inspector.",
  faqQuestion: "Question",
  messageSender: "user",
  transcriptMessage: "Message",
} as const;

export function toLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseTable(columnsValue: string, rowsValue: string) {
  const columns = columnsValue
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  const rows = toLines(rowsValue).map((row) =>
    row
      .split("|")
      .map((cell) => cell.trim())
      .slice(0, columns.length || undefined),
  );

  return { columns, rows };
}

export function parseTranscript(value: string) {
  return toLines(value).map((entry) => {
    const [sender, ...rest] = entry.split("|");
    const message = rest.join("|").trim();
    const normalizedSender = sender.trim() || componentContentFallbacks.messageSender;

    return {
      sender: normalizedSender,
      message: message || componentContentFallbacks.transcriptMessage,
      isAssistant: /assistant|copilot|system/i.test(normalizedSender),
    };
  });
}

export function parseFaqItems(value: string) {
  return toLines(value).map((entry) => {
    const [question, ...rest] = entry.split("|");
    const answer = rest.join("|").trim();

    return {
      answer: answer || componentContentFallbacks.faqAnswer,
      question: question.trim() || componentContentFallbacks.faqQuestion,
    };
  });
}

export function parseActivityEntries(value: string) {
  return toLines(value).map((entry) => {
    const [title, meta, status] = entry.split("|").map((item) => item.trim());

    return {
      meta: meta || componentContentFallbacks.activityMeta,
      status: status || componentContentFallbacks.activityStatus,
      title: title || componentContentFallbacks.activityTitle,
    };
  });
}
