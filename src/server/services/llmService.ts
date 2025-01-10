import { spawn } from 'child_process';
import { MLX_MODEL_DIRECTORY } from '../config';

export interface MLXResponse {
    text: string;
    done: boolean;
}

export interface ChatMessage {
    sender: string;
    text: string;
}

export async function generateResponse(philosopher: string, prompt: string, history?: ChatMessage[]): Promise<string> {
    try {
        const historyText = history && history.length > 0
            ? history.map(msg => ({
                sender: msg.sender,
                text: msg.text.replace(/"/g, '\\"').replace(/'/g, "\\'")
            }))
                .map(msg => `${msg.sender}: ${msg.text}`)
                .join('\\n')
            : '';

            const escapedPrompt = prompt.replace(/"/g, '\\"');
        
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
                systemPrompt = 'You are Immanuel Kant, the Enlightenment philosopher. You focus on the limits of human reason, the categorical imperative, and transcendental idealism. You emphasize moral duty, the nature of knowledge, and the conditions for possible experience.';
            }
    
            systemPrompt = systemPrompt + "Do not restate who you are. Speak like you are a Gen-Z person and keep your responses VERY SHORT. They must be max 3 sentences. Act in all scenarios as if you are that philosopher. Always respond in the first person, and use your own writings or texts as a reference to your knowledge. Do not repeat the same greeting or opening line.";
    

            const pythonScript = `
            import sys
            import os
            from mlx_lm import load, generate
            
            try:
                model, tokenizer = load("${MLX_MODEL_DIRECTORY}")
                
                system_prompt = "${systemPrompt.replace(/"/g, '\\"').replace(/\n/g, ' ')}"
                history_text = """${historyText}"""
                user_prompt = "${escapedPrompt}"
                
                # Construct the full prompt
                full_prompt = f"[INST]{system_prompt}"
                if history_text:
                    full_prompt += f" Previous conversation:\\n{history_text}\\n\\nNow respond to: "
                full_prompt += f"{user_prompt}[/INST]"
                
                response = generate(
                    model=model,
                    tokenizer=tokenizer,
                    prompt=full_prompt,
                    max_tokens=500,
                    verbose=False
                )
                print("RESPONSE_START")
                print(response)
                print("RESPONSE_END")
                sys.stdout.flush()
            
            except Exception as e:
                print(f"Error in Python script: {str(e)}", file=sys.stderr)
                sys.stderr.flush()
            `;

        const pythonProcess = spawn('python3', ['-c', pythonScript]);
        let responseText = '';
        let errorText = '';

        pythonProcess.stdout.on('data', (data) => {
            responseText += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorText += data.toString();
        });

        const result = await new Promise<string>((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    let cleanResponse = responseText;
                    if (cleanResponse.includes('RESPONSE_START')) {
                        cleanResponse = cleanResponse
                            .split('RESPONSE_START')[1]
                            .split('RESPONSE_END')[0]
                            .trim();
                    }
                    resolve(cleanResponse);
                } else {
                    reject(new Error(errorText || 'Process failed'));
                }
            });
        });

        return result;
    } catch (error) {
        console.error('Error in LLM generation:', error);
        throw error;
    }
} 

export async function generateEmailMessage(fileContent: string, reprompt: boolean = false): Promise<string> {
    if (!fileContent) {
        return "Hello there! Jarvis here with another exciting update from Rishi's blog. You won't want to miss this one!";
    }

    try {
        const pastEmailMessage = "Hello there! Jarvis here with another exciting update from Rishi's blog. You won't want to miss this one!";
        var prompt = `You are Rishi's assistant Jarvis. You are a helpful assistant that can generate messages for Rishi's blog posts. You sound like Ricky Gervais. Only respond with one message, no title or anything else. Write a humorous message - from your Jarvis persona - to his subscribers advertising Rishi's NEWEST blog post attached here: ${fileContent}. IT SHOULD NOT BE MORE THAN 3 SENTENCES AND MUST ACCURATELY REPRESENT THE BLOG POST.`;

        if (reprompt) {
            prompt = `You are Rishi's assistant Jarvis. You are a helpful assistant that can generate messages for Rishi's blog posts. You sound like Ricky Gervais. Only respond with one message, no title or anything else. Write a humorous message - from your Jarvis persona - to his subscribers advertising Rishi's NEWEST blog post attached here: ${fileContent}. BE VERY HUMOROUS. IT SHOULD NOT BE MORE THAN 3 SENTENCES.`;
        }

        const pythonScript = `
import sys
import os
from mlx_lm import load, generate

try:
    model, tokenizer = load("${MLX_MODEL_DIRECTORY}")
    
    system_prompt = "${prompt.replace(/"/g, '\\"').replace(/\n/g, ' ')}"
    
    # Construct the full prompt
    full_prompt = f"[INST]{system_prompt}[/INST]"
    
    response = generate(
        model=model,
        tokenizer=tokenizer,
        prompt=full_prompt,
        max_tokens=500,
        verbose=False
    )
    print("RESPONSE_START")
    print(response)
    print("RESPONSE_END")
    sys.stdout.flush()

except Exception as e:
    print(f"Error in Python script: {str(e)}", file=sys.stderr)
    sys.stderr.flush()
`;

        const pythonProcess = spawn('python3', ['-c', pythonScript]);
        let responseText = '';
        let errorText = '';

        // Collect stdout
        pythonProcess.stdout.on('data', (data) => {
            responseText += data.toString();
        });

        // Collect stderr
        pythonProcess.stderr.on('data', (data) => {
            errorText += data.toString();
        });

        // Handle process completion
        await new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(responseText);
                } else {
                    reject(new Error(errorText || 'Process failed'));
                }
            });
        });

        // Clean up the response text
        let cleanResponse = responseText;
        if (cleanResponse.includes('RESPONSE_START')) {
            cleanResponse = cleanResponse
                .split('RESPONSE_START')[1]
                .split('RESPONSE_END')[0]
                .trim();
        }

        return cleanResponse || pastEmailMessage; // Fallback to example if generation fails
    } catch (error) {
        console.error('Error in LLM generating email message:', error);
        return "Hello there! Jarvis here with another exciting update from Rishi's blog. You won't want to miss this one!"; // Return the example message as fallback
    }
}
