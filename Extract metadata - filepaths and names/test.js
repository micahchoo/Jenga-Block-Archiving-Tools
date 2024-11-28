// Save this as test.js
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function test() {
    try {
        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 10,
            messages: [{ role: "user", content: "Test" }]
        });
        console.log('Success:', message);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();