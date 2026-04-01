export const blockContentFallbacks = {
  activityMeta: "No timestamp yet",
  activityStatus: "Queued",
  activityTitle: "Activity",
  faqAnswer: "Add an answer in the inspector.",
  faqQuestion: "Question",
  infoItemLabel: "Label",
  infoItemValue: "Value",
  messageSender: "user",
  metricItemLabel: "Metric",
  metricItemMeta: "Details",
  metricItemValue: "0",
  stepDetail: "Add supporting detail in the inspector.",
  stepTitle: "Step",
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
    const normalizedSender = sender.trim() || blockContentFallbacks.messageSender;

    return {
      sender: normalizedSender,
      message: message || blockContentFallbacks.transcriptMessage,
      isAssistant: /assistant|copilot|system/i.test(normalizedSender),
    };
  });
}

export function parseFaqItems(value: string) {
  return toLines(value).map((entry) => {
    const [question, ...rest] = entry.split("|");
    const answer = rest.join("|").trim();

    return {
      answer: answer || blockContentFallbacks.faqAnswer,
      question: question.trim() || blockContentFallbacks.faqQuestion,
    };
  });
}

export function parseActivityEntries(value: string) {
  return toLines(value).map((entry) => {
    const [title, meta, status] = entry.split("|").map((item) => item.trim());

    return {
      meta: meta || blockContentFallbacks.activityMeta,
      status: status || blockContentFallbacks.activityStatus,
      title: title || blockContentFallbacks.activityTitle,
    };
  });
}

export function parseInfoListItems(value: string) {
  return toLines(value).map((entry) => {
    const [label, ...rest] = entry.split("|");
    const itemValue = rest.join("|").trim();

    return {
      label: label.trim() || blockContentFallbacks.infoItemLabel,
      value: itemValue || blockContentFallbacks.infoItemValue,
    };
  });
}

export function parseMetricItems(value: string) {
  return toLines(value).map((entry) => {
    const [label, itemValue, meta] = entry.split("|").map((item) => item.trim());

    return {
      label: label || blockContentFallbacks.metricItemLabel,
      meta: meta || blockContentFallbacks.metricItemMeta,
      value: itemValue || blockContentFallbacks.metricItemValue,
    };
  });
}

export function parseStepItems(value: string) {
  return toLines(value).map((entry, index) => {
    const [title, ...rest] = entry.split("|");
    const detail = rest.join("|").trim();

    return {
      detail: detail || blockContentFallbacks.stepDetail,
      index: index + 1,
      title: title.trim() || `${blockContentFallbacks.stepTitle} ${index + 1}`,
    };
  });
}
