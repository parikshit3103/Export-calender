import {SearchIcon} from "lucide-react"

interface SearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  placeholder : string ;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearch , placeholder }) => {
  return (
    <div className=" ">
      <div className="relative w-full max-w-xl transition-all duration-300">
        <span className="absolute left-3 top-2.5 text-gray-400">
          <SearchIcon />
        </span>
        <input
          id="search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-4 py-2 
            border border-gray-300 
            rounded-md shadow-sm 
            focus:outline-none 
            focus:ring-2 focus:ring-blue-400 focus:border-blue-500 
            transition-all duration-300 
            text-gray-700 bg-white
          "
        />
      </div>
    </div>
  );
};

export default SearchBar;