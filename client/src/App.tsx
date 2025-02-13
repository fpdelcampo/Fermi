import { useState, ChangeEvent } from 'react'
import './App.css'


interface GenerateResponse {
  	question: string;
  	aiAnswer: string;
}

function App() {
	const [question, setQuestion] = useState<string>('');
	const [aiAnswer, setAiAnswer] = useState<string>('');
	const [userAnswer, setUserAnswer] = useState<string>('');
	const [score, setScore] = useState<number | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

  	// Calls the backend to generate a question and the corresponding AI answer.
  	const generateQuestion = async () => {
		setLoading(true);
		setError('');
		setQuestion('');
		setAiAnswer('');
		setUserAnswer('');
		setScore(null);
    	try {
     		const response = await fetch('http://localhost:5555/api/generate');
      		if (!response.ok) {
        		throw new Error('Failed to generate question');
      		}
			const data: GenerateResponse = await response.json();
			setQuestion(data.question);
			setAiAnswer(data.aiAnswer);
		} 
		catch (err: any) {
    		setError(err.message);
    	} 
		finally {
      		setLoading(false);
    	}
  	};

	// Computes a score by comparing the orders of magnitude (via logarithms) of the user's answer and the target answer.
	const computeScore = (user: string, target: string): number => {
		try {
			const userVal = parseFloat(user);
			const targetVal = parseFloat(target);
			if (isNaN(userVal) || isNaN(targetVal) || userVal <= 0 || targetVal <= 0) {
				return 0;
			}
			const diff = Math.abs(Math.log10(userVal) - Math.log10(targetVal));
			// For example: if diff is 0, score is 1.0; if diff is 2, score becomes 0.
			// return Math.max(0, 1 - diff / 2);
			return diff;
		} 
		catch {
			return 0;
		}
	};

	const handleSubmit = () => {
		const s = computeScore(userAnswer, aiAnswer);
		setScore(s);
	};

	const handleUserAnswerChange = (e: ChangeEvent<HTMLInputElement>) => {
		setUserAnswer(e.target.value);
	};

	return (
		<div className="max-w-2xl mt-20 mx-auto p-4 font-sans">
		<h1 className="text-3xl font-bold mb-4">Fermi Estimation Challenge</h1>
		<button
			onClick={generateQuestion}
			disabled={loading}
			className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
		>
			{loading ? 'Generating Question...' : 'Generate Question'}
		</button>
		{error && <p className="text-red-500 mt-4">Error: {error}</p>}
		{question && (
			<div className="mt-6">
			<h2 className="text-2xl font-semibold mb-2">Question:</h2>
			<p className="mb-4">{question}</p>
			<p className="italic mb-4">(The AI's target answer has been generated behind the scenes.)</p>
			<div className="mb-4">
				<label className="block text-gray-700">
				Your Answer (number):
				<input
					type="text"
					value={userAnswer}
					onChange={handleUserAnswerChange}
					className="mt-1 block w-full p-2 border border-gray-300 rounded"
				/>
				</label>
			</div>
			<button
				onClick={handleSubmit}
				className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
			>
				Submit Answer
			</button>
			{score !== null && (
				<div className="mt-6">
				<h3 className="text-xl font-semibold">Your Score:</h3>
				{/* <p className="mb-2">{score.toFixed(2)} (1.0 is perfect, 0 means far off)</p> */}
				<p className="mb-2">{score.toFixed(2)} (Measures orders of magnitude off)</p>
				<p>
					<strong>AI's Answer:</strong> {aiAnswer}
				</p>
				</div>
			)}
			</div>
		)}
		</div>
	);
};

export default App;
