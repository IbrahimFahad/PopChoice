import { movies } from "./content.js";

document.querySelector(".submit-btn").addEventListener("click", function () {
  main();
});

async function main() {
  const outputElement = document.getElementById("api-output");
  if (!outputElement) {
    console.error("Output element not found");
    return;
  }

  try {
    const q1 = document.getElementById("q1-input");
    const q2 = document.getElementById("q2-input");
    const q3 = document.getElementById("q3-input");

    if (!q1 || !q2 || !q3) {
      console.error("One or more input fields are missing");
      outputElement.innerText = "Please fill in all fields.";
      return;
    }

    const query = `${q1.value} ${q2.value} ${q3.value}`;

    await fetching(query, outputElement);
  } catch (error) {
    console.error("Error in main function.", error);
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown API error");
    }

    const result = await response.json();
    outputElement.innerText = result;
  } catch (e) {
    console.error("Error:", e);
    outputElement.innerText = "Error contacting API.";
  }
}
