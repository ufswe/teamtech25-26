import "../styles/about.css";

export default function About() {
  const teamData = {
  sponsor: {
    title: "Our Industry Sponsor",
    logo: "/caci.png",
    name: "CACI International",
    description:
      "CACI provides the technology and expertise to support our mission. As our industry sponsor, they've given us access to real-world engineering challenges and guided our project from concept to implementation.",
  },
  leadership: [
    { role: "SWE VPI", name: "Clarissa Cheung" },
    { role: "Team Tech Chair", name: "Cara Kulhanjian" },
    { role: "Team Tech Chair", name: "Elise Lacey" },
    { role: "Backend Lead", name: "Vivian Li" },
    { role: "Frontend Lead", name: "Savana Pham" },
    { role: "Calculations Lead", name: "Mohana Pamidimukkala" },
    { role: "Design Co-Lead", name: "Allie Woodman" },
    { role: "Design Co-Lead", name: "Catherine Kennedy" },
    { role: "Frontend-Backend Liason", name: "Alyssa Griesman"}
  ],
  subteams: [
    {
      name: "Frontend",
      icon: "💻",
      members: [
        "Dhivya Kumar",
        "Nane Khachatryan",
        "Alyssa Griesman",
        "Kayla Bui",
        "Sarah Spellman",
        "Diya Patel",
        "Madeleine Eastwood",
        "Pranathi Madishetty"
      ],
    },
    {
      name: "Backend",
      icon: "📊",
      members: [
        "Elena Rivera",
        "Faith Osei",
        "Grace Liu",
        "Hannah Park",
      ],
    },
    {
      name: "Calculations",
      icon: "⚙️",
      members: [
        "Katya Tipps",
        "Claire Burnsides",
"Amaris Alverio-Serrano",
"Mia Sanders",
"Taylor Konz",
"Vaishnavi Vijay",
"Olive Palmer-Boyles",
"Jennavieve Keefer",
"Shilpa Shiva",
"Harper Perry",
"Taylor Renzi"
      ],
    },
    {
      name: "Design",
      icon: "🔬",
      members: [
        "Pamela Wong",
        "Masha Belyaeva",
        "Aubrey Lovering ",
        "Ryan Seiden",
        "Jahnavi Kompella",
        "Michaela Messina",
        "Isabel Sanchez",
        "Sophia DeRezende",
        "Yoon Eain"
      ],
    },
  ],
};

  return (
    <div className="about-page">
      <div className="about-cards">
        <div className="about-card">
          <div className="card-header">
            <a href="https://swe.org" target="_blank" rel="noreferrer">
            <h2>Society of Women Engineers</h2>
          </a>
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

      {/* ── Sponsor Section ── */}
      <section className="about-section sponsor-section">

        <h2 className="section-title">Industry Sponsor</h2>
        <div className="sponsor-card">
          <img src={teamData.sponsor.logo} alt="CACI Logo" className="sponsor-logo" />
          <div className="sponsor-info">

            <a href="https://www.caci.com" target="_blank" rel="noreferrer">
            <h3>{teamData.sponsor.name}</h3>
          
        </a>
            
            <p>{teamData.sponsor.description}</p>
          </div>
        </div>
      </section>

      {/* ── Mentor & Team Leads Section ── */}
      <section className="about-section leadership-section">
        <h2 className="section-title">Mentor &amp; Team Leads</h2>
        <div className="leadership-grid">
          {teamData.leadership.map((person) => (
            <div className="leadership-card" key={person.name}>
              <div className="leadership-avatar">
                {person.name.charAt(0)}
              </div>
              <p className="leadership-role">{person.role}</p>
              <p className="leadership-name">{person.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Subteams Section ── */}
      <section className="about-section subteams-section">
        <h2 className="section-title">Meet the Team</h2>
        <div className="subteams-grid">
          {teamData.subteams.map((subteam) => (
            <div className="subteam-card" key={subteam.name}>
              <div className="subteam-header">
                <span className="subteam-icon">{subteam.icon}</span>
                <h3>{subteam.name}</h3>
              </div>
              <ul className="subteam-members">
                {subteam.members.map((member) => (
                  <li key={member}>{member}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section group-photo-section">
      <h2 className="section-title">The Team</h2>
      <div className="group-photo-wrapper">
        <img src="/team.png" alt="Team Tech Group Photo" className="group-photo" />
      </div>
    </section>

      <footer className="about-footer">
        <p>Copyright © 2026 UF SWE. All rights reserved.</p>
      </footer>
    </div>
  );
}