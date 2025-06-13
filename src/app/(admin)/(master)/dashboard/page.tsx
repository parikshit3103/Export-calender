import React from 'react';
import '../../styles.css';


const DashBoard:React.FC = () => {
  return (
    <div className="flex justify-center items-center mt-24 px-4">
  <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-3xl w-full fade-up">
    <h1 className="text-3xl font-bold text-center text-[#184e93] mb-4">
      Welcome to <span className="text-blue-600">Excel World</span>
    </h1>
    <p className="text-lg text-gray-700 text-center">
      <span className="text-xl font-bold">
      </span> Add your <span className="font-medium text-gray-900">Excel file  </span> 
    </p>
    <p className="text-xl mt-4 text-center font-bold">
      Welcome:&nbsp;
      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full shadow-md font-semibold">
        Dear User
      </span>
    </p>
  </div>
</div>
  )
}

export default DashBoard