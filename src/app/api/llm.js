import { NextResponse } from 'next/server';

export async function GET() {
  // Access the OpenAI API key from environment variables
  const openAIKey = process.env.OPENAI_API_KEY;

  return NextResponse.json({
    openAIKey: openAIKey || 'No OpenAI API Key found. Please set it in your environment variables.',
  });
}


// export async function POST(request: Request) {
//   const { prompt } = await request.json();
//     // const prompt = "Tell me a joke"

//   try {
//     const response = await openai.chat.completions.create({
//       model: 'gpt-4o', // or any other model you want to use
//       messages: [{ role: 'user', content: prompt }],
//       stream: true, // Enable streaming
//     });

//     const stream = new ReadableStream({
//       start(controller) {
//         response.on('data', (data) => {
//           controller.enqueue(data.choices[0].delta.content);
//         });

//         response.on('end', () => {
//           controller.close();
//         });
//       },
//     });

//     return new NextResponse(stream);
//   } catch (error) {
//     console.error('Error fetching OpenAI response:', error);
//     return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 });
//   }
// }

