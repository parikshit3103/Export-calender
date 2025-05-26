import React, { useState } from 'react';

interface AddressBarProps {
    items: string[];
}

const AddressBar: React.FC<AddressBarProps> = ({ items }) => {
    

    const [selected, setSelected] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelected(event.target.value);
    };

    return (
        <div className="w-full max-w-xs  mt-4">
            <select
                value={selected}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="" disabled>
                    Country
                </option>
                {items.map((item, index) => (
                    <option key={index} value={item}>
                        {item}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default AddressBar;
