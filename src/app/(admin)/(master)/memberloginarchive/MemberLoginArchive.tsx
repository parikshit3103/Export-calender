import React , {useState , useEffect} from 'react';
import { database } from '../../../lib/fireBaseConfig';
import FormSideBar from '@/components/formsidebar/FormSideBar';
import TableProp from '@/components/tableprop/TableProp';
import { toast , ToastContainer } from 'react-toastify';
import { ref, remove , push  , get , child , update } from 'firebase/database';
import { ArchiveRestore } from 'lucide-react';
import SearchBar from '@/components/searchBar/SearchBar';


interface AdressProps {
  _id?: string;
  name: string;
  role: string ;
  userId: string;
  password: string;
  contact: string;
  wardNo : string ;
  wardName : string;

}

interface Props {
  refreshKey: number;
  onAction: () => void; // Notify parent to refresh other tabs
}

interface PaginatedData {
  data: AdressProps[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const MemberLoginArchive:React.FC<Props>  = ( { refreshKey, onAction}) => {
    const [toggleAdd, setToggleAdd] = React.useState(false);
    const [address, setAddress] = useState<AdressProps[]>([]);
    const [tableData, setTableData] = useState<AdressProps[]>(address);
    const [searchQuery, setSearchQuery] = useState('');
    const [allData, setAllData] = useState<AdressProps[]>([]);
    const [filteredData, setFilteredData] = useState<AdressProps[]>([]);
    const [pagination, setPagination] = useState({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          limit: 10
        });
    const handleArchive = async (data: AdressProps) => {
      const archiveRef = ref(database, 'archive');
      await push(archiveRef, data);
      setTableData(prev => prev.filter(item => item.userId !== data.userId));
      toast.success("archived successfully");
    };
   const fetchAddress = async (page: number = 1, limit: number = 10) => {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, 'memberLogin')); // ✅ fetch from main collection

    if (snapshot.exists()) {
      const rawData = snapshot.val();

      const allData = Object.entries(rawData)
        .map(([key, value]) => ({
          ...(value as any),
          _id: key,
        }))
        .filter(item => item.isArchived); // ✅ Only archived items

             setAllData(allData);
      setFilteredData(allData);

      const totalItems = allData.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = allData.slice(startIndex, startIndex + limit);

      setAddress(paginatedData);
      setPagination({
        currentPage: page,
        totalPages,
        totalItems,
        limit,
      });
    } else {
      setAddress([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, limit });
    }
  } catch (err) {
    console.error(err);
    toast.error('Failed to fetch members');
  }
};

       useEffect(() => {
  fetchAddress();
}, [refreshKey]);

        useEffect(() => {
          if (tableData.length === 0) {
            setTableData(address);
          }
        }, [address]);
    
    const goToPage = (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        fetchAddress(page);
      }
    };
       const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
          const newLimit = parseInt(e.target.value, 10);
          fetchAddress(1, newLimit);
        };
        const handleEdit = (data: AdressProps) => {
  
};

const handleDelete = (data : AdressProps) => {

}


 const handleSearch = (query: string) => {
  setSearchQuery(query);

  if (query.trim() === '') {
    setFilteredData(allData);
    return;
  }

  const lower = query.toLowerCase();

  const result = allData.filter((item) =>
    item.name.toLowerCase().includes(lower) ||
    item.userId.toLowerCase().includes(lower) ||
    item.contact.includes(lower)
  );

  setFilteredData(result);

  // Reset pagination when search changes
  setPagination((prev) => ({
    ...prev,
    currentPage: 1,
    totalItems: result.length,
    totalPages: Math.ceil(result.length / prev.limit),
  }));
};


const archiveRestore = async (data: AdressProps) => {
  try {
    const id = data._id;
    if (!id) {
      toast.error('Missing ID. Cannot restore item.');
      return;
    }

    // Step 1: Update the isArchived flag to false in the database
    await update(ref(database, `memberLogin/${id}`), {
      ...data,
      isArchived: false,
    });

    // Step 2: Update local UI (remove from archive table view)
    setTableData(prev => prev.filter(item => item._id !== id));

    // Step 3: Optional fetch (if you want to re-fetch instead of relying on setTableData)
    // await fetchAddress();

    // Step 4: Trigger refresh in MemberLoginTab
    onAction?.(); // call the refresh function passed from parent

    toast.success('Row restored successfully!');
  } catch (error) {
    console.error('Restore failed:', error);
    toast.error('Failed to restore item.');
  }
};

  return (
    <div className='p-4 flex flex-col  gap-8 overflow-x-auto  '>
      <SearchBar searchQuery={searchQuery} onSearch={handleSearch} placeholder='Search by name, userId, or contact...' />
    <div className='flex gap-2'>
    <h1 className='text-xl font-bold'>Archived Data</h1>
    </div>
     <TableProp handleArchiveRestore={archiveRestore}  handleArchive={handleArchive}  actionMode="restore" data={filteredData}  pagination={pagination} goToPage={goToPage} handleLimitChange={handleLimitChange} isSideBarOpen={toggleAdd} handleEdit={handleEdit} handleDelete={handleDelete} />
  <ToastContainer
  className="z-50 mt-20"
  position="top-right"
  autoClose={3000} />
    </div>
  )
}

export default MemberLoginArchive