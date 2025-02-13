import express from 'express';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5173;

// Middleware
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
	console.error("OPENAI_API_KEY is missing in the environment variables.");
	process.exit(1);
}

// Initialize OpenAI client
const configuration = new Configuration({
	apiKey: OPENAI_API_KEY,
});
const openaiClient = new OpenAIApi(configuration);

/**
 * Uses GPT-4 to generate a creative Fermi estimation question.
 */
async function generateFermiQuestion(): Promise<string> {
	const prompt = "Generate a creative Fermi estimation question that requires order-of-magnitude reasoning. " +
					"The question should involve everyday objects or situations and be solvable by making rough estimates.";
	try {
		const response = await openaiClient.createChatCompletion({
			model: "gpt-4", // Use GPT-4 for question generation
			messages: [{ role: "user", content: prompt }],
			temperature: 0.7,
			max_tokens: 100,
		});
		const question = response.data.choices[0].message?.content?.trim();
		return question || "Error generating question.";
	} 
	catch (error) {
		console.error("Error generating question:", error);
		throw error;
	}
}

async function generateTargetAnswer(question: string): Promise<string> {
	try {
		const response = await openaiClient.createChatCompletion({
			model: "gpt-4",
			messages: [{ role: "user", content: `Please provide a Fermi estimate for the following question. It may help to break the problem into intermediate steps. Extract and return only the final numerical result from the following text as a plain integer, with no additional words or punctuation. Question: ${question}`}],
			temperature: 0.7,
			max_tokens: 2000,
		});
		const answer = response.data.choices[0].message?.content?.trim();
		return answer || "Error generating answer.";
	} 
	catch (error) {
		console.error("Error generating target answer:", error);
		throw error;
	}
}

// API endpoint that returns the question and target answer.
app.get('/api/generate', async (req, res) => {
	try {
		const question = await generateFermiQuestion();
		const aiAnswer = await generateTargetAnswer(question);
		res.json({ question, aiAnswer });
		// res.json({ question });
	} 
	catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
