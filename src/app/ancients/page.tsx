'use client'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

const philosophers: Philosopher[] = [
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
  }
];

function Test() {
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<Philosopher | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');

  const handleAvatarClick = (philosopher: Philosopher) => {
    setSelectedPhilosopher(philosopher);
    setChatMessages([]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && selectedPhilosopher) {
      setChatMessages([...chatMessages, { sender: 'User', text: userInput }]);
      setUserInput('');
      // Simulate philosopher's response (you can replace this with actual AI-generated responses)
      setTimeout(() => {
        setChatMessages(prevMessages => [...prevMessages, { sender: selectedPhilosopher.name, text: `This is a response from ${selectedPhilosopher.name}.` }]);
      }, 1000);
    }
  };

  return (
    <main className='container grid flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0'>
      <div>
        <h1>* &quot;Hey, what would Aristotle <span className='underline'><a href='https://www.youtube.com/watch?v=2YzLMPm3Jgw' target='_blank' rel='noopener noreferrer'>have said</a></span>?&quot;</h1>
        <br />
        <div className='flex gap-5'>
          {philosophers.map((philosopher) => (
            <Avatar key={philosopher.name} onClick={() => handleAvatarClick(philosopher)} className='cursor-pointer'>
              <AvatarImage src={philosopher.image} alt={philosopher.name} />
              <AvatarFallback>{philosopher.initials}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
      {selectedPhilosopher && (
        <div className='mt-6 w-full'>
          <h2 className='text-xl mb-4'>{selectedPhilosopher.name}</h2>
          <p>{selectedPhilosopher.bio}</p>
          <br />
          <div className='bg-gray-100 p-4 rounded-lg h-64 overflow-y-auto mb-4'>
            {chatMessages.map((message, index) => (
              <div key={index} className={`mb-2 ${message.sender === 'User' ? 'text-right' : 'text-left'}`}>
                <span className='font-bold'>{message.sender}: </span>
                {message.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className='flex gap-2'>
            <input
              type='text'
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className='flex-grow border rounded p-2'
              placeholder='Type your message...'
            />
            <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded'>Send</button>
          </form>
        </div>
      )}
    </main>
  );
}

export default Test;