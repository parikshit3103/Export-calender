// 'use client';

// import { signIn, signOut, useSession } from "next-auth/react";
// import Image from "next/image";
// import React, { useState, useEffect, useRef } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import Link from "next/link";

// const AppHeader: React.FC = () => {
//   const { data: session } = useSession();
//   const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [startDate, setStartDate] = useState<Date | null>(null);
//   const [endDate, setEndDate] = useState<Date | null>(null);

//   const toggleApplicationMenu = () => {
//     setApplicationMenuOpen(!isApplicationMenuOpen);
//   };

//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if ((event.metaKey || event.ctrlKey) && event.key === "k") {
//         event.preventDefault();
//         inputRef.current?.focus();
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);
//     return () => document.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   const handleFetchGoogleCalendar = async () => {
//     if (!startDate || !endDate) return alert("Select date range");

//     const res = await fetch(`/api/calendar?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
//     const data = await res.json();
//     localStorage.setItem("googleEvents", JSON.stringify(data));
//     window.location.href = "/CalendarEvent"; // Redirect to viewer
//   };

//   return (
//     <header className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
//       <div className="flex flex-col items-center justify-between grow lg:flex-row w-full">
//         <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-12 lg:py-4">
          
//         <Link href="/dashboard">
//             <Image src="/images/logo/IMG_2300.jpg" alt="Logo" width={150} height={40} className="dark:hidden cursor-pointer" />
//           </Link>
          
//           <div className="flex items-center gap-4 ml-auto">
//             {session ? (
//               <>
//                 <div className="flex items-center gap-2">
//                   <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start Date" />
//                   <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End Date" />
//                   <button
//                     onClick={handleFetchGoogleCalendar}
//                     className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm"
//                   >
//                     Load Google Events
//                   </button>
//                 </div>
//                 <button onClick={() => signOut()} className="text-sm text-red-500 font-medium ml-2">
//                   Sign Out
//                 </button>
//               </>
//             ) : (
//               <button onClick={() => signIn("google")} className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm">
//                 Sign in with Google
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default AppHeader;

'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const AppHeader: React.FC = () => {
  const { data: session } = useSession();
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex flex-col items-center justify-between grow lg:flex-row w-full">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-12 lg:py-4">
          <Link href="/dashboard">
            <Image src="/images/logo/IMG_2300.jpg" alt="Logo" width={150} height={40} className="dark:hidden cursor-pointer" />
          </Link>
          
          <div className="flex items-center gap-4 ml-auto">
            {session && (
              <button onClick={() => signOut({ callbackUrl: "/dashboard" })} className="text-sm text-red-500 font-medium ml-2">
                Sign Out
              </button>
           
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;