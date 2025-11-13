import { movies } from "./content.js";
const button = document.querySelector(".submit-btn");
button.addEventListener("click", () => {
  main();
});

async function main() {
  try {
    const q1 = document.getElementById("q1-input");
    const q2 = document.getElementById("q2-input");
    const q3 = document.getElementById("q3-input");
    const outputElement = document.getElementById("api-output");
    const query = q1.value + " " + q2.value + " " + q3.value;
    await fetching(query);
    window.location.href = "result.html";
  } catch (error) {
    console.error("Error in main function.", error.message);
    outputElement.innerText = "Sorry, something went wrong. Please try again.";
  }
}

async function fetching(query) {
  try {
    const url = "https://openai-worker.openai-ibro.workers.dev/";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        content: { content: query },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Worker Error: ${data.error}`);
    }

    outputElement.innerText = result.answer;
  } catch (e) {
    console.error("Error:", e.message);
  }
}
