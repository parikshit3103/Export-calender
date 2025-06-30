'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from "next-auth/react";
import '../../styles.css';

const DashBoard: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleGetStarted = () => {
    router.push('/showICSfile');
  };

  const handleSignIn = () => {
    if (session) {
      // Redirect to CalendarEvent page if already signed in
      router.push('/CalendarEvent');
    } else {
      // Sign in with Google if not signed in
      signIn("google", { callbackUrl: "/CalendarEvent" });
    }
  };

  return (
    <div className="w-full overflow-x-hidden"> {/* Prevent side scroll */}
      <div className="flex flex-col items-center justify-start min-h-screen w-full px-4 py-20">
        <div className="w-full max-w-5xl text-center space-y-10 fade-up">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#184e93]">
            Welcome to <span className="text-blue-600">Calendar Export</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-700">
            Your one-stop solution to convert 
            <span className="font-medium text-gray-900"> ICS files </span>
            or import 
            <span className="font-medium text-gray-900"> Google Calendar events </span>
            into 
            <span className="font-bold text-blue-600"> PDF </span> or 
            <span className="font-bold text-purple-600"> Excel </span> formats effortlessly.
          </p>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#184e93]">🚀 Features:</h2>
            <ul className="list-disc list-inside text-gray-800 text-lg sm:text-xl text-left sm:text-center px-4">
              <li>Upload your ICS files with ease</li>
              <li>Import Google Calendar events by signing in and selecting a date range</li>
              <li>Preview your calendar data in a customizable table</li>
              <li>Convert ICS files or Google Calendar events into PDF or Excel formats in seconds</li>
              <li>Completely free and open to all users</li>
              <li>Secure and fast processing of your files</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4 px-8 sm:px-32 rounded-2xl shadow-lg transition-transform hover:scale-105 duration-300"
            >
              Get Started
            </button>
            <button
              onClick={handleSignIn}
              className={`${
                session ? "bg-gray-400 cursor-pointer" : "bg-blue-600 hover:bg-blue-700"
              } text-white font-bold text-xl py-4 px-8 sm:px-16 rounded-2xl shadow-lg transition-transform hover:scale-105 duration-300`}
            >
              {session ? "You are already signed in" : "Sign in with Google"}
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-[#184e93]">💡 Why Choose Us?</h2>
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
              Our platform is designed to make calendar file conversion and Google Calendar integration simple and accessible for everyone.
              Whether you're a professional managing schedules or a casual user organizing events,
              <span className="font-medium text-blue-600"> Calendar Export </span>
              ensures a seamless experience with no hidden costs or complicated steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
