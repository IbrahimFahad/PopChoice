import { movies } from "./content.js";
window.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".btn");
  button.addEventListener("click", main());
});
async function main() {
  const outputElement = document.getElementById("api-output");

  try {
    const q1 = document.getElementById("q1-input");
    const q2 = document.getElementById("q2-input");
    const q3 = document.getElementById("q3-input");

    const query = q1.value + " " + q2.value + " " + q3.value;

    await fetching(query, outputElement);
    window.location.href = "result.html";
  } catch (error) {
    console.error("Error in main function.", error.message);
    outputElement.innerText = "Sorry, something went wrong. Please try again.";
  }
}

async function fetching(query, outputElement) {
  try {
    const url = "https://popchoice.openai-ibro.workers.dev/";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: query }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Worker Error: ${result.error}`);
    }

    outputElement.innerText = result;
  } catch (e) {
    console.error("Error:", e.message);
    outputElement.innerText = "Error contacting API.";
  }
}
