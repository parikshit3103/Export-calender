// FormSideBar.tsx
import React , {useState , useEffect ,  useRef} from 'react';
import { X } from 'lucide-react';
import { ToastContainer } from 'react-toastify';


type FormSideBarProps = {
    isSideBarOpen: boolean;    
    isSideBarClose: () => void;
    toggleText: string;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    formFields: {
        name: string;
        label: string;
        type: string;
        placeholder?: string;
        required?: boolean;
        readOnly?: boolean;
        options?: string[];
        component?: React.ReactNode;
        
    }[];
    formData : any;
    errors: {
        [key: string]: string;
    };
    disabledFields : any ;
    
};


const FormSideBar: React.FC<FormSideBarProps> = ({
  isSideBarOpen,
  isSideBarClose,
  toggleText,
  handleSubmit,
  formFields,
  handleChange,
  formData,
  errors ,
  disabledFields
}) => {
  const isDeleteAction = ['Delete Country', 'Delete State', 'Delete City', 'Delete Pincode', 'Delete Company', 'Delete Bank', 'Delete Details' , 'Delete Employee', "Delete Member"].includes(toggleText);
 
  // 👇 State to preview image
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // 👇 Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        handleChange({
          target: {
            name: 'photo',
            value: reader.result
          }
        } as any); // type cast for synthetic event shape
      };
      reader.readAsDataURL(file);
    }
  };

  // 👇 Clear image
  const clearImage = () => {
    setImagePreview(null);
     if (fileInputRef.current) fileInputRef.current.value = '';
    handleChange({
      target: {
        name: 'photo',
        value: ''
      }
    } as any);
  };

  // 👇 Load preview from formData.photo (for edit mode)
  useEffect(() => {
    if (formData.photo) {
      setImagePreview(formData.photo);
    }
  }, [formData.photo]);

  const isFormComplete = formFields.every(field => {
    if (!field.label || !field.label.includes('*') || isDeleteAction) return true;
    const value = formData[field.name];
    return field.type === 'checkbox' ? true : value && value.trim() !== '';
  });

  return (
    <div
      id="form"
      className={`fixed top-0 right-0 overflow-y-auto h-full w-[20%] bg-white border-l-2 py-28 border-gray-200 transform transition-transform duration-500 ease-in-out ${
        isSideBarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4 relative">
        <button onClick={isSideBarClose} className="absolute top-4 right-4 text-black hover:text-gray-700">
          <X size={20} />
        </button>

        <h3 className="text-lg font-semibold mb-4 text-black">{toggleText}</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 space-y-3">
          {formFields.map((field, index) => {
           const shouldDisable = (
    formData.role === 'Admin' &&
    (field.name === 'wardNo' || field.name === 'wardName')
  );
            return (
            <div className="mb-2" key={index}>
              {field.type !== 'checkbox' && (
  <label htmlFor={field.name} className="block font-medium mb-1 text-black">
    {field.label.split('*').map((part, index, arr) => (
      <span key={index}>
        {part}
        {index < arr.length - 1 && <span className="text-red-500">*</span>}
      </span>
    ))}
  </label>
)}


              {field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className={`block border p-2 w-full ${isDeleteAction || shouldDisable ? 'bg-gray-300 cursor-not-allowed' : ''}`}
                  required={field.required}
                  disabled={shouldDisable || isDeleteAction}
                >
                  <option value="" disabled hidden>Select An Option</option>
                  {field.options?.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center justify-between py-2">
                  <label htmlFor={field.name} className="text-black font-medium">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="checkbox"
                    checked={formData[field.name]}
                    onChange={handleChange}
                    className={`block border p-2 w-full ${isDeleteAction ? 'bg-gray-300 cursor-not-allowed' : ''}`}
                    disabled={isDisabled}
                  />
                </div>
              ) : field.type === 'file' ? (
                <>
                 
  <div className="relative">
    <input
      ref={fileInputRef}
      type="file"
      id={field.name}
      name={field.name}
      accept="image/*"
      onChange={handleImageChange}
      className="hidden"
    />

    <label
      htmlFor={field.name}
      className="inline-block bg-gray-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-600 transition"
    >
      Select File
    </label>

    {/* Filename shown with spacing */}
    {fileInputRef.current?.files?.[0] && (
      <span className="ml-4 text-sm text-gray-700">
        {fileInputRef.current.files[0].name}
      </span>
    )}  
  </div>
                  {imagePreview && (
                    <div className="relative mt-2">
                      <img src={imagePreview} alt="Preview" className="w-full h-auto rounded shadow" />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </>
              ) : field.component ? (
                 <div className="mb-2" key={index}>
                 {field.component}
                  </div>
              ) : field.type === 'message' ? (
  <textarea
    id={field.name}
    name={field.name}
    value={formData[field.name]}
    onChange={handleChange}
    placeholder={field.placeholder}
    rows={5}
    className={`block border p-3 w-full resize-none ${isDeleteAction ? 'bg-gray-300 cursor-not-allowed' : ''}`}
    required={field.required}
    disabled={isDeleteAction}
  />
) : (
  <input
    id={field.name}
    name={field.name}
    type={field.type}
    value={formData[field.name]}
    onChange={handleChange}
    placeholder={field.placeholder}
    className={`block border p-3 w-full ${isDeleteAction ? 'bg-gray-300 cursor-not-allowed' : ''}`}
    required={field.required}
    disabled={isDeleteAction}
  />
              )}

              {errors[field.name] && <span className="text-red-500 text-sm">{errors[field.name]}</span>}
            </div>)
})}

          <button
            type="submit"
            className={`text-white px-6 py-2 rounded w-full ${
              isDeleteAction ? 'bg-red-500' : isFormComplete ? 'bg-blue-500' : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!isFormComplete && !isDeleteAction}
          >
            {toggleText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormSideBar;