import { openai, supabase } from "./config.js";
import { movies } from "./content.js";

async function getEmbedding(input) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: input,
  });
  return embedding;
}

async function storeEmbeddings() {
  const embbedings = await getEmbedding(movies.map((m) => m.content));
}
