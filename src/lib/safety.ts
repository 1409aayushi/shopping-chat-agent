export type Refusal = { reason: string } | null;

export function refusalIfAny(input: string): Refusal {
  const inj = /(ignore.*rules|reveal (system|api)|developer message|show your prompt|prompt injection|override.*instructions|break.*rules|ignore.*safety)/i.test(input);
  const secrets = /(api key|access token|password|credential|secret|token)/i.test(input);
  const abuse = /(trash|hate|stupid|idiot|dumb|brand\s+sucks|defame|slander|libel)/i.test(input);
  const offTopic = /(homework|essay|code my assignment|politics|adult|nsfw|violent|weapons|drugs)/i.test(input);
  if (inj || secrets) return { reason: "security" };
  if (abuse) return { reason: "bias" };
  if (offTopic) return { reason: "off_topic" };
  return null;
}

export function refusalMessage(reason: string): string {
  switch (reason) {
    case "security":
      return "I can’t help with that, but I can recommend or compare phones.";
    case "bias":
      return "I stay neutral on brands. I can compare specs or value if you’d like.";
    case "off_topic":
      return "I’m focused on helping you shop for phones. Try asking for recommendations or comparisons.";
    default:
      return "I can’t assist with that. Want help picking a phone instead?";
  }
}


