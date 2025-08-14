// Minimal AI stub: pass-through with debug metadata.
// Replace this with real AI orchestration.
export async function processWithAI(job) {
  // Example: append an AI-derived intent based on content title/body
  const intents = Array.isArray(job.intents) ? [...job.intents] : [];
  try {
    const title = job?.content?.title || '';
    if (title.toLowerCase().includes('urgent')) {
      intents.push(['intent', 'high_priority']);
    }
  } catch {}

  return { ...job, intents };
}
