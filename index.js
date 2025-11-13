window.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".submit-btn");
  if (!button) return console.error("Submit button not found");

  button.addEventListener("click", async () => {
    try {
      const q1 = document.getElementById("q1-input");
      const q2 = document.getElementById("q2-input");
      const q3 = document.getElementById("q3-input");

      if (!q1 || !q2 || !q3) {
        alert("Please fill in all input fields.");
        return;
      }

      const query = `${q1.value} ${q2.value} ${q3.value}`;

      const resultText = await fetching(query);

      localStorage.setItem("originalText", query);
      localStorage.setItem("text", resultText);
      window.location.href = "result.html";
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred. Please try again.");
    }
  });
});

async function fetching(input) {
  try {
    const url = "https://popchoice.openai-ibro.workers.dev/";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `${input}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Unknown API error");
    }

    let responseBody;
    try {
      responseBody = await response.json();
    } catch (e) {
      const rawText = await response.text();
      throw new Error(
        `Non-JSON response received. Status: ${response.status}. Raw body: ${rawText}`
      );
    }

    if (!response.ok) {
      throw new Error(
        responseBody.error || `API error with status ${response.status}`
      );
    }

    console.log("Content sent:", responseBody.content);
    console.log("Context from Supabase:", responseBody.context);
    console.log("Answer:", responseBody.answer);

    return responseBody.answer || JSON.stringify(data);
  } catch (e) {
    console.error("Fetching error:", e.message);
    return "Error contacting API. Check the server code.";
  }
}
