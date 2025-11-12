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
  console.log("Getting embeddings...");
  const embeddings = await getEmbedding(movies.map((m) => m.content));
  console.log("Embeddings received:", embeddings.data.length);
  const movieEmbeddings = movies.map((movie, i) => ({
    content: movie.content,
    embedding: embeddings.data[i].embedding,
  }));
  console.log("Start Storing...");
  const { data, error } = await supabase.from("movies").insert(movieEmbeddings);
  if (error) {
    console.error("Error storing embeddings:", error);
  } else {
    console.log("Stored embeddings complete:", data);
  }
}
storeEmbeddings();
