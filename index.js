import { openai, supabase } from "./config.js";
import { movies } from "./content.js";

button.addEventListener("click", () => {
  main();
});

async function main() {
  try {
    const q1 = document.getElementById("q1-input");
    const q2 = document.getElementById("q2-input");
    const q3 = document.getElementById("q3-input");
    const outputElement = document.getElementById("api-output");
    const button = document.querySelector(".submit-btn");
    const query = q1.value + " " + q2.value + " " + q3.value;
    const queryEmbedding = await getEmbedding(query);
    const match = await findNearestMatch(queryEmbedding);
    await getChatCompletion(match, query);
    window.location.href = "result.html";
  } catch (error) {
    console.error("Error in main function.", error.message);
    outputElement.innerText = "Sorry, something went wrong. Please try again.";
  }
}

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

async function findNearestMatch(embedding) {
  const { data } = await supabase.rpc("match_movies", {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 3,
  });

  const match = data.map((obj) => obj.content).join("\n");
  return match;
}
const chatMessages = [
  {
    role: "system",
    content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`,
  },
];

async function getChatCompletion(text, query) {
  chatMessages.push({
    role: "user",
    content: `Context: ${text} Question: ${query}`,
  });

  const { choices } = await openai.chat.completions.create({
    model: "gpt-4",
    messages: chatMessages,
    temperature: 0.65,
    frequency_penalty: 0.5,
  });
  outputElement.innerText = choices[0].message.content;
}
window.main = main;
