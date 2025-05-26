import React from 'react';
import { ChevronDown } from "lucide-react";

type AddressFormProps = {
  address: {
    houseno: string;
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    country: string;
    state: string;
    city: string;
    pincode: string;
  };
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, scope: string) => void;
  errors: { [key: string]: string };
  countryOptions: string[];
  stateOptions: string[];
  cityOptions: string[];
  pincodeOptions: string[];
  toggleText: string;
};

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onChange,
  errors,
  countryOptions,
  stateOptions,
  cityOptions,
  pincodeOptions,
  toggleText ,
}) => {
  console.log("Select Values:", {
  countryValue: address.country,
  countryOptions,
  stateValue: address.state,
  stateOptions,
  cityValue: address.city,
  cityOptions,
  pincodeValue: address.pincode,
  pincodeOptions,
});
   const [toggleAddress, setToggleAddress] =  React.useState(false);
     const handleAddressToggle = () => {
      if (toggleAddress) {
        setToggleAddress(false);
      } else {
        setToggleAddress(true)
      }
      
    };
  return (
    <div className="space-y-4">
      <div className='flex gap-2 items-center'>
        <h1 className='text-black text-2xl'>Address</h1>
        <ChevronDown  onClick={handleAddressToggle} className={`text-black transition-all duration-300 ease-in-out ${toggleAddress ? "rotate-180" : "rotate-0"}`} />
      </div>
      {toggleAddress && <>
      <h4 className="text-black font-semibold">Address Details</h4>

      {[
        { name: 'houseno', label: 'House No*', type: 'text' },
        { name: 'addressLine1', label: 'Address Line 1*', type: 'text' },
        { name: 'addressLine2', label: 'Address Line 2', type: 'text' },
        { name: 'landmark', label: 'Landmark', type: 'text' },
      ].map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block font-medium mb-1 text-black">
            {field.label}
          </label>
          <input
  id={field.name}
  name={field.name}
  type={field.type}
  value={address[field.name as keyof typeof address] || ""}
  onChange={(e) => onChange(e, 'address')} // 👈 scope passed
  className= {`block border p-3 w-full  ${toggleText === 'Delete Country' || toggleText === 'Delete State' || toggleText === 'Delete City'  || toggleText === 'Delete Pincode' || toggleText === "Delete Company" || toggleText === "Delete Bank" || toggleText === "Delete Details"  ? "bg-gray-300 cursor-not-allowed" : ""}`}
 disabled={toggleText === 'Delete Company' }
/>
          {errors[`address.${field.name}`] && (
            <span className="text-red-500 text-sm">{errors[`address.${field.name}`]}</span>
          )}
        </div>
      ))}

      {[
        { name: 'country', label: 'Country*', options: countryOptions },
        { name: 'state', label: 'State*', options: stateOptions },
        { name: 'city', label: 'City*', options: cityOptions },
        { name: 'pincode', label: 'Pincode*', options: pincodeOptions },
      ].map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block font-medium mb-1 text-black">
            {field.label}
          </label>
<select
  id={field.name}
  name={`address.${field.name}`} // correct
  value={address[field.name as keyof typeof address] || ""} // correct
  onChange={(e) => onChange(e, 'address')}// no override here
  className={`block border p-3 w-full   ${toggleText === 'Delete Country' || toggleText === 'Delete State' || toggleText === 'Delete City'  || toggleText === 'Delete Pincode' || toggleText === "Delete Company" || toggleText === "Delete Bank" || toggleText === "Delete Details"  ? "bg-gray-300 cursor-not-allowed" : ""}`}
  disabled={toggleText === 'Delete Company' }
>
  <option value="" hidden disabled>Select {field.label}</option>
  {field.options.map((option, idx) => (
    <option key={idx} value={option}>
      {option}
    </option>
  ))}
</select>

          {errors[`address.${field.name}`] && (
            <span className="text-red-500 text-sm">{errors[`address.${field.name}`]}</span>
          )}
        </div>
      ))}
      </>}
    </div>
  );
};

export default AddressForm;