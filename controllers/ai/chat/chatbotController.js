// controllers/chatbotController.js
const OpenAI = require("openai");
const { systemPrompt } = require("./chatbotHelperData");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// console.log("openai:", openai);

exports.chatbot = async (req, res) => {
  try {
    const { messages } = req.body;
    // console.log("messages:", messages);

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ msg: "Valid messages array is required" });
    }

    const MAX_MESSAGES = 10;
    const recentMessages = messages.slice(-MAX_MESSAGES);

    const transformedMessages = recentMessages.map((msg) => ({
      role: msg.sender === "bot" ? "assistant" : "user",
      content: msg.text,
    }));

    // Prepend the system prompt
    const completeMessages = [systemPrompt, ...transformedMessages];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: completeMessages,
      max_tokens: 250,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content.trim();
    console.log("reply:", reply);

    res.status(200).json({ reply });
  } catch (error) {
    console.log("error", error);
    console.error(
      "Chatbot Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ msg: "Failed to process the request" });
  }
};
