'use client'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageTracker } from '@/app/blog/PageTracker';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Philosopher {
  name: string;
  initials: string;
  image: string;
  bio: string;
  studentOf: string | null;
  teacherOf: string[];
}

interface ChatMessage {
  sender: string;
  text: string;
}

const philosophers = [
  {
    name: 'Socrates',
    initials: 'SC',
    image: 'https://freedomandcitizenship.columbia.edu/sites/default/files/styles/cu_crop/public/content/Syllabus/Socrates.jpeg?itok=aWO3SPEk',
    bio: 'A classical Greek philosopher known for his contributions to ethics and epistemology.',
    studentOf: null,
    teacherOf: ['Plato']
  },
  {
    name: 'Plato',
    initials: 'PL',
    image: 'https://cdn.britannica.com/88/149188-050-DC34842F/Plato-portrait-bust-original-Capitoline-Museums-Rome.jpg',
    bio: 'An influential philosopher who founded the Academy in Athens and wrote philosophical dialogues.',
    studentOf: 'Socrates',
    teacherOf: ['Aristotle']
  },
  {
    name: 'Aristotle',
    initials: 'AT',
    image: 'https://ethics.org.au/wp-content/uploads/2021/03/Aristotle_sq.jpg',
    bio: 'A prominent Greek philosopher and polymath who made significant contributions to various fields of knowledge.',
    studentOf: 'Plato',
    teacherOf: []
  },
  {
    name: 'Aquinas',
    initials: 'AQ',
    image: 'https://churchlifejournal.nd.edu/assets/518774/1200x/1900px_botticelli_aquinas.jpg',
    bio: 'A medieval philosopher and theologian who synthesized Aristotelian philosophy with Christian theology.',
    studentOf: 'Albert the Great',
    teacherOf: []
  },
  {
    name: 'Kant',
    initials: 'KT',
    image: 'https://www.philosophers.co.uk/immanuel-kant.jpg',
    bio: 'An Enlightenment philosopher who revolutionized ethics and epistemology through his critical philosophy.',
    studentOf: null,
    teacherOf: []
  }
];

function Test() {
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<Philosopher | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Add ref for the chat container
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  // Add scroll to bottom function
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Scroll when messages or typing state changes
  React.useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleAvatarClick = (philosopher: Philosopher) => {
    setSelectedPhilosopher(philosopher);
    setChatMessages([]);
  };

  const TypingIndicator = () => (
    <div className="flex space-x-2 p-2">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && selectedPhilosopher) {
      // Add message and scroll immediately
      setChatMessages(prev => [...prev, { sender: 'User', text: userInput }]);
      setUserInput('');
      setIsTyping(true);
      scrollToBottom();

      try {
        // Get the last few messages for context (e.g., last 5 messages)
        const recentHistory = chatMessages.slice(-5).map(msg => ({
          sender: msg.sender,
          text: msg.text
        }));

        const API_URL = process.env.NODE_ENV === 'production'
            ? 'https://6b06-128-84-127-255.ngrok-free.app'
            : 'http://localhost:3001';

        const response = await fetch(`${API_URL}/api/llm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: userInput,
            philosopher: selectedPhilosopher.name,
            history: recentHistory  // Include recent chat history
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setIsTyping(false);

        if (data.text) {
          setChatMessages(prev => [...prev, {
            sender: selectedPhilosopher?.name || 'AI',
            text: data.text
          }]);
          // No need to call scrollToBottom here as useEffect will handle it
        }
      } catch (error) {
        console.error('Error:', error);
        setIsTyping(false);
        setChatMessages(prev => [...prev, {
          sender: 'System',
          text: 'Error: Could not connect to Rishi\'s server.'
        }]);
      }
    }
  };

  return (
    <main className='container grid flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0'>
      <PageTracker path={`/ancients`} />
      <div>
        <h1>&apos;&apos;Hey, what would Aristotle <span className='underline'><a href='https://www.youtube.com/watch?v=2YzLMPm3Jgw' target='_blank' rel='noopener noreferrer'>have said</a></span>?&apos;&apos;</h1>
        <br />
        <div className='flex gap-5'>
          <TooltipProvider delayDuration={100}>
            {philosophers.map((philosopher) => (
              <Tooltip key={philosopher.name}>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer">
                    <Avatar 
                      onClick={() => handleAvatarClick(philosopher)}
                      className='hover:opacity-80 transition-opacity w-12 h-12 relative'
                    >
                      <AvatarImage 
                        src={philosopher.image} 
                        alt={philosopher.name}
                        className="object-cover"
                      />
                      <AvatarFallback>{philosopher.initials}</AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  className="bg-white px-3 py-1.5 text-sm font-medium text-gray-900 rounded-md shadow-md border"
                  sideOffset={5}
                >
                  {philosopher.name}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
      {selectedPhilosopher && (
        <div className='mt-6 w-full'>
          <h2 className='text-xl mb-4'>{selectedPhilosopher.name}</h2>
          <p>{selectedPhilosopher.bio}</p>
          <br />
          <div
            ref={chatContainerRef}
            className='bg-gray-100 p-4 rounded-lg h-64 overflow-y-auto mb-4 scroll-smooth'
          >
            <div className="flex flex-col space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'User' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender !== 'User' && (
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarImage src={philosophers.find(p => p.name === message.sender)?.image} />
                      <AvatarFallback>{message.sender[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`
                      max-w-[70%] px-4 py-2 rounded-2xl
                      ${message.sender === 'User'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white border border-gray-300 rounded-bl-none'
                      }
                    `}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <Avatar className="w-8 h-8 mr-2">
                    <AvatarImage src={selectedPhilosopher.image} />
                    <AvatarFallback>{selectedPhilosopher.initials}</AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-gray-300 rounded-2xl rounded-bl-none px-4 py-2">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>
          </div>
          <form onSubmit={handleSendMessage} className='flex gap-2'>
            <input
              type='text'
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className='flex-grow border rounded-full px-4 py-2'
              placeholder='Type your message...'
              disabled={isTyping}
            />
            <button
              type='submit'
              className='bg-blue-500 text-white px-6 py-2 rounded-full disabled:bg-gray-400 hover:bg-blue-600 transition-colors'
              disabled={isTyping}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

export default Test;