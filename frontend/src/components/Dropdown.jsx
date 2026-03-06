import "./Dropdown.css"

export default function Dropdown({label, value, onChange, options, placeholder = "Select an Option"}){
    return(
        <div className="dropdown-wrapper">
            {label && <label className="dropdown-label">{label}</label>}
            <select 
            className="dropdown" 
            value={value} 
            onChange={e => onChange(e.target.value)}>
                <option value="">{placeholder}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}