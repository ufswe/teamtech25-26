import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundColor: "#1a3a6e",
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Instrument Sans', sans-serif",
      }}
    >
      <h1 style={{ color: "#c8d8f0", marginTop: "50px" }}>
        Welcome!
      </h1>

      <Button
        style = {{fontFamily: "'Instrument Sans', sans-serif"}}
        onClick={() => {
          console.log("clicked");
          navigate("/flight");
        }}
      >
        Enter
      </Button>

      <img
        src="/globe6.png"
        alt="Earth"
        style={{
          width: "100%",
          marginTop: "-250px",
          marginBottom: "20px",
          pointerEvents: "none", 
        }}
      />

    </div>
  );
}
