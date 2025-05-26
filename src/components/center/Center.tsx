import React, {useState} from 'react';
import FormSideBar from '../formsidebar/FormSideBar';
import { ToastContainer , toast } from 'react-toastify';
import axios from 'axios';
import TableProp from '../tableprop/TableProp';

interface CenterProps {
  _id: string;
  centerType : string;
  sapPlantCode: string;
  centerName: string;
  contactNumber: string;
  email: string;
  inProductionAllowed: boolean;
  isConfirmationAllowed: boolean;
  address: string;
}

interface PaginatedData {
  data: CenterProps[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}


const Center: React.FC = () => {
  const [toggleAdd, setToggleAdd] = React.useState(false);
  const [formData, setFormData] = React.useState<CenterProps>({
    _id: '', // You'll need to include this since it's required by CenterProps
    centerType: '',
    sapPlantCode: '',
    centerName: '',
    contactNumber: '',
    email: '',
    inProductionAllowed: false,
    isConfirmationAllowed: false,
    address: ''
  });
   const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 10
      });
  const [center, setCenter] = React.useState<CenterProps[]>([]);
  const [toggleText, setToggleText] = React.useState('Add Centre ');
    const [deleteId, setDeleteId] = useState<string | null>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  setFormData({
    ...formData,
    [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
  
  }) };
  const showForm = () => {
    setToggleAdd(!toggleAdd);
    setToggleText("Add Centre")
  };

      const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = parseInt(e.target.value, 10);
        fetchCenter(1, newLimit);
      };
 
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (toggleText === 'Add Centre') {
              await axios.post('/api/center', formData);
              toast.success('Mandi');
              
            } else if (toggleText === 'Update Centre') {
              if (!formData._id) {
                toast.error('ID is required for update');
              }
              await axios.put('/api/center', formData);
              toast.success('Center updated');
            } else if (toggleText === 'Delete Centre') {
              const id = deleteId;
              console.log("delete id" ,id)
              await axios.delete(`/api/center?id=${id}`);
              toast.success('Address deleted!');
             
            }
            fetchCenter()
        toast.success('Center delete!');
        setToggleAdd(false);
          }
 
   const fetchCenter = async (page: number = pagination.currentPage, limit: number = pagination.limit) => {
    try {
      const res = await axios.get('/api/center');
      console.log('Response:', res.data);
        const data: PaginatedData = res.data;
        console.log(data)
        setCenter(data.data);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalItems: data.totalItems,
          limit
        });
    } catch (error) {
      console.error('Error fetching center data:', error);
    }
  };
  React.useEffect(() => {
    fetchCenter();
  }
  , []);
  const closToggle = () => {
    setToggleAdd(false);
  };
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchCenter(page);
    }
  };

      // function to handle editing a mandi
      const handleEdit = (center: CenterProps) => {
        setFormData(center);
        console.log("edit are" ,center);
        setToggleText('Update Centre');
        setToggleAdd(true);
      };
    
      // function to handle deleting a mandi
      const handleDelete = async (center: CenterProps ) => {
        setFormData(center);
        console.log(center)
        setDeleteId(center._id || null);
        setToggleText("Delete Centre");
        setToggleAdd(true);
      };
  const formFields = [
    {
      name: 'centerType',
      label: 'Center Type',
      type: 'select',
      options: ['Plant 1', 'Plant 2'],
      required: true
    },
    {
      name: 'sapPlantCode',
      label: 'SAP Plant Code',
      type: 'text',
      placeholder: 'Enter SAP Plant Code',
      required: true
    },
    {
      name: 'centerName',
      label: 'Center Name',
      type: 'text',
      placeholder: 'Enter Center Name',
      required: true
    },
    {
      name: 'contactNumber',
      label: 'Contact Number',
      type: 'text',
      placeholder: 'Enter Contact Number',
      required: true
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter Email Address',
      required: true
    },
    {
      name: 'inProductionAllowed',
      label: 'In Production Allowed',
      type: 'checkbox'
    },
    {
      name: 'isConfirmationAllowed',
      label: 'Is Confirmation Allowed?',
      type: 'checkbox'
    },
    {
      name: 'address',
      label: 'Address',
      type: 'textarea',
      placeholder: 'Enter Address',
      required: true
    }
  ];

  return (
    <div className='p-4'>
      <ToastContainer position='top-center' autoClose={3000} />
      <div className='flex gap-2'>
        <h1 className='text-xl font-bold'>Center Collection</h1>
        <img
          onClick={showForm}
          className={`w-[25px] h-[25px] object-contain transition-transform duration-300 cursor-pointer ${
            toggleAdd ? 'rotate-90' : 'rotate-0'
          }`}
          src="/images/icons/addtwo.svg"
          alt="Add"
        />
      </div>

      <FormSideBar
        isSideBarOpen={toggleAdd}
        isSideBarClose={closToggle}
        toggleText={toggleText}
        handleSubmit={handleSubmit}
        formFields={formFields}
        formData={formData}
        handleChange={handleChange}
/>

<TableProp data={center} pagination={pagination} goToPage={goToPage} handleLimitChange={handleLimitChange} isSideBarOpen={toggleAdd} handleDelete={handleDelete} handleEdit={handleEdit}   />

    </div>
  );
};

export default Center;