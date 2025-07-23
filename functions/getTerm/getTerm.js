const fs = require("fs");
const path = require("path");

exports.handler = async function (event) {
  const term = event.queryStringParameters.term?.toLowerCase();
  const filePath = path.join(__dirname, "terms.json"); // ✅ Just "terms.json" now

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const terms = JSON.parse(raw);

    if (!term || !terms[term]) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Term not found" })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(terms[term])
    };
  } catch (err) {
    console.error("Function error:", err); // ✅ Helpful for logs in Netlify
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};