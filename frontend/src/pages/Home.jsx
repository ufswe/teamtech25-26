export default function Home() {
  return (
    <div style={{
      backgroundColor: "#1a3a6e",
      minHeight: "calc(100vh - 60px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflow: "hidden",
    }}>
      <h1 style={{
        color: "#c8d8f0",
        fontSize: "2rem",
        fontWeight: "normal",
        marginTop: "50px",
        marginBottom: "0px",
        letterSpacing: "0.02em",
      }}>
        Welcome!
      </h1>
      <img
        src="/globe6.png"
        alt="Earth"
        style={{
          width: "100%",
          display: "block",
          marginTop: "-250px",
          marginBottom: "0px",
        }}
      />
    </div>
  );
}
