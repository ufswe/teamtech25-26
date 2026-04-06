import "../styles/about.css";

export default function About() {
  return (
    <div className="about-page">
      <div className="about-cards">
        <div className="about-card">
          <div className="card-header">
            <h2>Team Tech</h2>
            <img src="/teamtech-logo.png" alt="Team Tech Logo" className="card-logo" />
          </div>
          <p>
            Team Tech, an interdisciplinary engineering design team affiliated with the 
            Society of Women Engineers (SWE), is dedicated to collaborating with 
            industry-leading companies to tackle their engineering challenges. Every year, 
            we partner with an industry company, develop a solution to one of their 
            engineering problems, and present our project findings at the SWE National Conference.
          </p>
          <p>
            At Team Tech, we foster a collaborative environment that values teamwork and 
            embraces challenges as opportunities for technical and professional skill 
            development. Our team typically comprises 6 to 12 undergraduate female engineers 
            from a variety of specialties, offering undergraduates a unique opportunity to 
            collaborate on industry-focused, hands-on projects. We have formed successful 
            partnerships with industry-leading companies, including CACI, Sandia National 
            Laboratories, UKG, P&G, Neilson, and RTI Surgical, in the past.
          </p>
        </div>

        <div className="about-card">
          <div className="card-header">
            <h2>Mission</h2>
            <img src="/globe.png" alt="Globe" className="card-logo" />
          </div>
          <p>
            As global air traffic increases, airlines face complex, evolving challenges 
            balancing safety, efficiency, and sustainability. The core challenge lies in 
            optimizing flight routes to minimize collision risk and environmental impact 
            while maintaining operational efficiency and complying with regulatory 
            requirements. This multifaceted problem requires innovative approaches that 
            account for real-time weather hazards, fuel consumption, airspace congestion, 
            and emissions targets.
          </p>
          <p>
            Our project demonstrates how flight planning can incorporate collision risk, 
            weather hazards, emissions, and travel time simultaneously! We have created a 
            tool for pilots and planners to quickly evaluate alternative flight paths. Our 
            application aligns with aviation's push toward greener operations and smarter 
            air traffic management. Companies like Delta, United, Boeing, Airbus, Lockheed 
            Martin, and NASA would benefit from similar tools in aviation research and operations.
          </p>
        </div>
      </div>

      <footer className="about-footer">
        <p>Copyright © 2026 UF SWE. All rights reserved.</p>
      </footer>
    </div>
  );
}