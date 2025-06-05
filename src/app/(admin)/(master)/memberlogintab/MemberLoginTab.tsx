"use client"
import React , {useState , useEffect,  useMemo} from 'react'
import FormSideBar from '@/components/formsidebar/FormSideBar';
import TableProp from '@/components/tableprop/TableProp';
import { Pencil , Trash } from 'lucide-react';
import axios from 'axios';
import { toast , ToastContainer } from 'react-toastify';
import AddressForm from '@/components/addressform/AddressForm';
import { ref, push , set , update , remove , get , child } from 'firebase/database';
import { database } from '../../../lib/fireBaseConfig';
import SearchBar from '@/components/searchBar/SearchBar';


export type FormErrors<T> = {
  [K in keyof T]?: string;
};



interface AdressProps {
  _id?: string;
  name: string;
  role: string ;
  userId: string;
  contact: string;
  wardNo : string ;
  wardName : string;


}

export interface MemberLoginTabProps {
 refreshKey: number; 
}




const MemberLoginTab:React.FC<MemberLoginTabProps> = ({ refreshKey}) => {
  const [toggleAdd, setToggleAdd] = React.useState(false);
const [formData, setFormData] = useState<AdressProps>({
    name: '',
    role: '',
    userId: '',
    contact: '',
    wardNo : '' ,
    wardName : ''
   
  });
  const [address, setAddress] = useState<AdressProps[]>([]);
  const [toggleText, setToggleText] = useState('Add Member');
  const [deleteId, setDeleteId] = useState<string | null>(null);
   const [errors, setErrors] = useState<{ [key: string]: string }>({});
   const [tableData, setTableData] = useState<AdressProps[]>(address);
  const [validateContact, setValidateContact] = useState<(string)[]>([]);
   const [validateUserId, setValidateUserId] = useState<string[]>([]);
   const [wardInfo, setWardInfo] = useState<{ wardNo: string; wardName: string }[]>([]);
   const [wardNumber , setWardNumber] = useState<string[]>([]);
   const [wardName , setWardName] = useState<string[]>([]);
const [validatePassword, setValidatePassword] = useState<string[]>([]);
const [validateWardNo, setValidateWardNo] = useState<string[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [allData, setAllData] = useState<AdressProps[]>([]);
const [filteredData, setFilteredData] = useState<AdressProps[]>([]);
   const [pagination, setPagination] = useState({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: 10
    });
    const [disabledFields, setDisabledFields] = useState({
  wardNo: false,
  wardName: false,
});


 const fetchAddress = async (page: number = 1, limit: number = 10) => {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, 'memberLogin'));

    if (snapshot.exists()) {
      const rawData = snapshot.val();

      // Convert the object into an array with _id included
      const allData = Object.entries(rawData).map(([key, value]) => ({
        ...(value as any),
        _id: key,
      })).filter((item) => !item.isArchived);

          setAllData(allData);
      setFilteredData(allData); // by default show al
      // ✅ Simulate pagination
      const totalItems = allData.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = allData.slice(startIndex, startIndex + limit);

      setAddress(paginatedData);
      setValidateContact(allData.map(item => item.contact));
setValidateUserId(allData.map(item => item.userId));
setValidatePassword(allData.map(item => item.password));
setValidateWardNo(allData.map(item => item.wardNo))
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
    // useEffect to fetch address when the component mounts
    useEffect(() => {
      fetchAddress();
      console.log('Address data:', address);
    }, [refreshKey]);

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

const fetchWardInfo = async () => {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, 'wardInfo'));

    if (snapshot.exists()) {
      const data = snapshot.val();
      const numbers: string[] = [];
      const names: string[] = [];
      const wardArray: { wardNo: string; wardName: string }[] = [];

      Object.values(data).forEach((item: any) => {
        if (item.wardNumber && item.wardName) {
          numbers.push(item.wardNumber);
          names.push(item.wardName);
            wardArray.push({
            wardNo: item.wardNumber,
            wardName: item.wardName,
          });
        }
      });

      setWardNumber(numbers);
      setWardName(names);
      setWardInfo(wardArray);
    } else {
      console.log("No wardInfo data found.");
    }
  } catch (error) {
    console.error("Error fetching wardInfo:", error);
  }
};

// Run once on component mount
useEffect(() => {
  fetchWardInfo();
}, []);


  const showForm = () => {
    setToggleAdd(!toggleAdd);
    setToggleText('Add Member')
    setFormData({
    name: '',
    role: '',
    userId: '',
    contact: '',
    wardNo: '' ,
    wardName : ''
    })
  }
  
   const goToPage = (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        fetchAddress(page);
      }
    };
  
    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLimit = parseInt(e.target.value, 10);
      fetchAddress(1, newLimit);
    };
    // function to handle editing a mandi
const handleEdit = (data: AdressProps) => {
  const matchedWard = wardInfo.find(
    (item) =>
      item.wardNo === data.wardNo || item.wardName === data.wardName
  );

  const updatedFormData: AdressProps = {
    ...data,
    wardNo: matchedWard?.wardNo || '',
    wardName: matchedWard?.wardName || '',
    _id: data._id, // this is important for update to work
  };

  setFormData(updatedFormData);
  setToggleText('Update Member');
  setToggleAdd(true);
};


  // function to handle deleting a mandi
  const handleDelete = async (address: AdressProps ) => {
    setFormData(address);
    console.log(address)
    setDeleteId(address._id || null);
    setToggleText("Delete Member");
    setToggleAdd(true);
  };

  useEffect(() => {
  if (tableData.length === 0) {
    setTableData(address);
  }
}, [address]);

 const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  try {
    const employeeRef = ref(database, 'memberLogin');

    if (toggleText === 'Add Member') {
             const contactInput = formData.contact.trim().toLowerCase();
  const isDuplicate = validateContact.some(
    (existing) => existing.toLowerCase() === contactInput
  );
    const userIdInput = formData.userId.trim().toLowerCase();
  const isDuplicateShortName = validateUserId.some(
    (existing) => existing.toLowerCase() === userIdInput
  );
    const wardNoInput = formData.wardNo.trim().toLowerCase();
const isDuplicateWardNo = address.some(
  (existing) =>
    existing.wardNo.toLowerCase() === wardNoInput && !existing.isArchived
);

  if (isDuplicate) {
    setErrors((prev) => ({
      ...prev,
      contact: "This contact number already exists.",
    }));
    toast.error('Please fix validation errors before submitting.');
    return;
  }
  if (isDuplicateShortName) {
    setErrors((prev) => ({
      ...prev,
      userId: "This user id already exists.",
    }))
      toast.error('Please fix validation errors before submitting.');
    return;
  };
  if (isDuplicateWardNo) {
    setErrors((prev) => ({
      ...prev,
      wardNo: "Only one member can exist per ward",
    }));
    toast.error('Please fix validation errors before submitting.');
    return;
  }
      const newEmployeeRef = push(employeeRef);
      await set(newEmployeeRef, { ...formData, password: "ABCD@1234" });
      toast.success('Member added!');

    } else if (toggleText === 'Update Member') {
      if (!formData._id) {
        toast.error('ID is required for update!');
        return;
      }

      const memberRef = ref(database, `memberLogin/${formData._id}`);
      console.log("memberRef address" , memberRef);
      await update(memberRef, formData); // updates only the fields you provide
      toast.success('Member updated!');

    } else if (toggleText === 'Delete Member') {
      if (!deleteId) {
        toast.error('ID is required for delete!');
        return;
      }
      const deleteRef = ref(database, `employeeInfo/${deleteId}`);
      await remove(deleteRef);
      toast.success('Member deleted!');
    }

    fetchAddress()
    // Reset form and close popup
    setFormData({
      name: '',
      role: '',
      userId: '',
      contact: '',
      wardNo : '' ,
      wardName : ''
    });

    fetchAddress(); // refresh list
    setToggleAdd(false);

  } catch (err) {
    console.error(err);
    toast.error('Something went wrong!');
  }
  
};


 const closToggle = () => {
setToggleAdd(false);}
        
 
const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  let error = "";

  // Validation logic
  if (name === "contact") {
    if (!/^[0-9]*$/.test(value)) {
      error = "Mobile number should contain only digits";
    } else if (value.length > 10) {
      error = "Mobile number should be only max 10 digits";
    }
  }

  if (name === "name" && !/^[A-Za-z\s]*$/.test(value)) {
    error = "Name should contain only letters";
  }

  setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));

  if (!error) {
    let updatedFormData = { ...formData, [name]: value };

    // Sync fields
    if (name === "wardNo") {
      const matched = wardInfo.find((item) => item.wardNo === value);
      if (matched) {
        updatedFormData.wardName = matched.wardName;
      }
    } else if (name === "wardName") {
      const matched = wardInfo.find((item) => item.wardName === value);
      if (matched) {
        updatedFormData.wardNo = matched.wardNo;
      }
    }

    setFormData(updatedFormData);
  }
};




const handleArchive = async (data: AdressProps) => {
  if (!data._id) {
    toast.error('Invalid data: missing _id');
    return;
  }
  setToggleAdd(false)
  const memberRef = ref(database, `memberLogin/${data._id}`);

  try {
    await update(memberRef, { isArchived: true });
    setTableData(prev => prev.filter(item => item._id !== data._id));
    toast.success("Archived successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to archive");
  }
  fetchAddress()
};

 const formFields = [
{ name: 'name', label: 'Name*', type: 'text', placeholder: 'Enter name', required: true, readOnly: false },
    { name: 'role', label: 'Role*', type: 'select', options: ['Admin', 'Member'], required: false, readOnly: false },
    { name: 'userId', label: 'User Id*', type: 'text', placeholder: 'Enter User Name', required: true, readOnly: false } ,
  // Contact Person Name Section
  { name: 'contact', label: 'Contact*', type: 'text', required: false, readOnly: false },
  { name: 'wardNo', label: 'Ward No', type: 'select', options: wardNumber, required: false, readOnly: false },
  { name: 'wardName', label: 'Ward Name', type: 'select', options: wardName , required: false, readOnly: false },
];

const onSearch = () => {

}

  return (
    <div className=' flex flex-col  gap-8 overflow-x-auto relative px-4 '>
    
    <div className='flex gap-2'>
    <h1 className='text-xl font-bold'>Member </h1>
    <img
            onClick={showForm}
            className={`w-[25px] h-[25px] object-contain transition-transform duration-300 cursor-pointer ${
              toggleAdd ? 'rotate-90' : 'rotate-0'
            }`}
            src="/images/icons/addtwo.svg"
            alt=""
          />
    </div>
    <SearchBar searchQuery={searchQuery} onSearch={handleSearch} placeholder='Search by name, userId, or contact...' />
    <FormSideBar disabledFields={disabledFields} errors={errors} formData={formData} isSideBarOpen={toggleAdd} isSideBarClose={closToggle}  handleSubmit={handleSubmit} formFields={formFields} handleChange={handleChange} toggleText={toggleText}/>
     <TableProp  isSideBarOpen={toggleAdd} handleArchive={handleArchive}  actionMode="archive" data={filteredData} pagination={pagination} goToPage={goToPage} handleLimitChange={handleLimitChange} isSideBarOpen={toggleAdd} handleEdit={handleEdit} handleDelete={handleDelete}/>
  <ToastContainer
  className="z-50 mt-20"
  position="top-right"
  autoClose={3000} />
    </div>
  )
}

export default MemberLoginTab ;