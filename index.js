import { movies } from "./content.js";

window.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".submit-btn");
  if (!button) return console.error("Submit button not found");

  button.addEventListener("click", async () => {
    try {
      const q1 = document.getElementById("q1-input");
      const q2 = document.getElementById("q2-input");
      const q3 = document.getElementById("q3-input");

      if (!q1 || !q2 || !q3) {
        outputElement.innerText = "Please fill in all input fields.";
        return;
      }

      const query = `${q1.value} ${q2.value} ${q3.value}`;

      const resultText = await fetching(query);

      localStorage.setItem("originalText", query);
      localStorage.setItem("text", resultText);

      window.location.href = "Results_view.html";
    } catch (err) {
      console.error("Error:", err);
      outputElement.innerText = "An error occurred. Please try again.";
    }
  });
});

async function fetching(query) {
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

    const data = await response.json();

    return typeof data === "string" ? data : JSON.stringify(data);
  } catch (e) {
    console.error("Fetching error:", e);
    return "Error contacting API.";
  }
}
