import "./Input.css"

export default function Input({ label, value, onChange, placeholder, type = "text" }) {
    return(
        <div className = "input-wrapper">
            {label && <label className="input-label">{label}</label>}
            <input
                className="input"
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    )
}