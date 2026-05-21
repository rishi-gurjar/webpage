const OLLAMA_BASE_URL = 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = 'minimax-m2.5:cloud';

export interface ChatMessage {
    sender: string;
    text: string;
}

async function ollamaChat(messages: { role: string; content: string }[]): Promise<string> {
    const response = await fetch(OLLAMA_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages,
            stream: false,
        }),
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Ollama request failed (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    return data.message?.content?.trim() || '';
}

export async function generateResponse(philosopher: string, prompt: string, history?: ChatMessage[]): Promise<string> {
    try {
        let systemPrompt = '';
        if (philosopher === 'Socrates') {
            systemPrompt = 'You are Socrates, the great Athenian philosopher known for the Socratic method. You engage in dialogue through questioning, helping others discover truth through critical thinking.';
        } else if (philosopher === 'Plato') {
            systemPrompt = 'You are Plato, student of Socrates and founder of the Academy in Athens. You believe in the theory of forms and the importance of philosopher-kings.';
        } else if (philosopher === 'Aristotle') {
            systemPrompt = 'You are Aristotle, student of Plato and tutor of Alexander the Great. You focus on logic, empirical observation, and the nature of reality.';
        } else if (philosopher === 'Aquinas') {
            systemPrompt = 'You are Thomas Aquinas, the medieval philosopher and theologian.';
        } else if (philosopher === 'Kant') {
            systemPrompt = 'You are Immanuel Kant, the Enlightenment philosopher. You focus on the limits of human reason, the categorical imperative, and transcendental idealism.';
        }

        systemPrompt += " Do not restate who you are. Speak like you are a Gen-Z person and keep your responses VERY SHORT. They must be max 3 sentences. Act in all scenarios as if you are that philosopher. Always respond in the first person, and use your own writings or texts as a reference to your knowledge. Do not repeat the same greeting or opening line.";

        const messages: { role: string; content: string }[] = [
            { role: 'system', content: systemPrompt },
        ];

        if (history && history.length > 0) {
            for (const msg of history) {
                messages.push({
                    role: msg.sender === philosopher ? 'assistant' : 'user',
                    content: msg.text,
                });
            }
        }

        messages.push({ role: 'user', content: prompt });

        return await ollamaChat(messages);
    } catch (error) {
        console.error('Error in LLM generation:', error);
        throw error;
    }
}

export async function generateEmailMessage(fileContent: string, reprompt: boolean = false): Promise<string> {
    const fallback = "Hello there! Jarvis here with another exciting update from Rishi's blog. You won't want to miss this one!";

    if (!fileContent) return fallback;

    try {
        const systemPrompt = "You are Rishi's assistant Jarvis. You sound like Ricky Gervais — dry, witty, slightly self-deprecating. Only respond with one message, no title or anything else. IT SHOULD NOT BE MORE THAN 3 SENTENCES AND MUST ACCURATELY REPRESENT THE BLOG POST.";

        let userPrompt = `Write a humorous message — from your Jarvis persona — to Rishi's subscribers advertising his NEWEST blog post. Here's the post:\n\n${fileContent}`;
        if (reprompt) {
            userPrompt = `Write a VERY humorous message — from your Jarvis persona — to Rishi's subscribers advertising his NEWEST blog post. Be extra witty. Here's the post:\n\n${fileContent}`;
        }

        const result = await ollamaChat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ]);

        return result || fallback;
    } catch (error) {
        console.error('Error in LLM generating email message:', error);
        return fallback;
    }
}
