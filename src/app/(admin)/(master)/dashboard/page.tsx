// 'use client';

// import React from 'react';
// import { useRouter } from 'next/navigation';
// import '../../styles.css';

// const DashBoard: React.FC = () => {
//   const router = useRouter();

//   const handleGetStarted = () => {
//     router.push('/showICSfile');
//   };

//   return (
//    <div className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-r from-blue-100 to-purple-100"> 
//       <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-4xl w-full text-center">
//         <h1 className="text-4xl font-extrabold text-[#184e93] mb-6">
//           Welcome to <span className="text-blue-600">Calendar Export</span>
//         </h1>
//         <p className="text-lg text-gray-700 mb-6">
//           Your one-stop solution to convert <span className="font-medium text-gray-900">ICS files</span> into
//           <span className="font-bold text-blue-600"> PDF</span> or
//           <span className="font-bold text-purple-600"> Excel</span> formats effortlessly.
//         </p>
//         <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-md font-semibold inline-block mb-6">
//           Welcome, Dear User!
//         </div>
//         <div className="text-left">
//           <h2 className="text-2xl font-bold text-[#184e93] mb-4">Features:</h2>
//           <ul className="list-disc list-inside text-gray-700 text-lg">
//             <li>Upload your ICS files with ease.</li>
//             <li>Convert ICS files into PDF or Excel formats in seconds.</li>
//             <li>Preview your calendar data before exporting.</li>
//             <li>Completely free and open to all users.</li>
//             <li>Secure and fast processing of your files.</li>
//           </ul>
//         </div>
//         <div className="mt-8">
//           <h2 className="text-2xl font-bold text-[#184e93] mb-4">Why Choose Us?</h2>
//           <p className="text-lg text-gray-700">
//             Our platform is designed to make calendar file conversion simple and accessible for everyone. Whether you're a professional or a casual user,
//             <span className="font-medium text-blue-600"> Calendar Export</span> ensures a seamless experience with no hidden costs.
//           </p>
//         </div>
//         <div className="mt-8">
//           <button
//             onClick={handleGetStarted}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all"
//           >
//             Get Started
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashBoard;

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import '../../styles.css';

const DashBoard: React.FC = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/showICSfile');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-2   ">
      <div className="h-[90vh] max-w-[90%] w-full text-center space-y-6 fade-up flex flex-col items-center justify-center " >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#184e93] text-center">
          Welcome to <span className="text-blue-600">Calendar Export</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-700 text-center">
          Your one-stop solution to convert 
          <span className="font-medium text-gray-900"> ICS files </span>
          into 
          <span className="font-bold text-blue-600"> PDF </span> or 
          <span className="font-bold text-purple-600"> Excel </span> formats effortlessly.
        </p>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-md font-semibold inline-block text-lg text-center">
          Welcome, Dear User!
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#184e93]">🚀 Features:</h2>
          <ul className="list-disc list-inside text-gray-800 text-xl  space-y-1 pl-4 text-center">
            <li>Upload your ICS files with ease</li>
            <li>Convert ICS files into PDF or Excel formats in seconds</li>
            <li>Preview your calendar data before exporting</li>
            <li>Completely free and open to all users</li>
            <li>Secure and fast processing of your files</li>
          </ul>
        </div>

        <div className="text-center space-y-4 mt-6">
          <h2 className="text-3xl font-bold text-[#184e93]">💡 Why Choose Us?</h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            Our platform is designed to make calendar file conversion simple and accessible for everyone. Whether you're a professional
            <br></br>
            a casual user,
            <span className="font-medium text-blue-600"> Calendar Export </span>
            ensures a seamless experience with no hidden costs or complicated steps.
          </p>
        </div>

        <div className="pt-6 text-center">
          <button
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 duration-300"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
