export async function copyText(text: string, clipboard = globalThis.navigator?.clipboard): Promise<void> {
  if (!clipboard?.writeText) throw new Error("Clipboard is unavailable.");
  await clipboard.writeText(text);
}
