import { useState, useMemo } from "react";
import FlightEntry from "../components/FlightEntry.jsx";
import "../styles/flightHistory.css";

// placeholder flight data — will be replaced with real data from confirmed flights
const SAMPLE_FLIGHTS = [
  {
    id: 1,
    from: "MCO",
    to: "JFK",
    departureTime: "03:15 PM",
    duration: "2 hrs 32 min",
    warnings: [
      { type: "weather", icon: "○", label: "Clear" },
      { type: "turbulence", icon: "△", label: "Mild turbulence" },
      { type: "visibility", icon: "◐", label: "Reduced visibility" },
      { type: "wind", icon: "●", label: "Strong winds" },
    ],
    plannedDate: "Feb 12, 2026",
    starred: false,
    chanceOfSuccess: 82,
  },
  {
    id: 2,
    from: "MCO",
    to: "JFK",
    departureTime: "03:15 PM",
    duration: "2 hrs 32 min",
    warnings: [
      { type: "weather", icon: "○", label: "Clear" },
      { type: "turbulence", icon: "△", label: "Mild turbulence" },
      { type: "visibility", icon: "◐", label: "Reduced visibility" },
      { type: "wind", icon: "●", label: "Strong winds" },
    ],
    plannedDate: "Feb 12, 2026",
    starred: false,
    chanceOfSuccess: 75,
  },
  {
    id: 3,
    from: "MCO",
    to: "JFK",
    departureTime: "03:15 PM",
    duration: "2 hrs 32 min",
    warnings: [
      { type: "weather", icon: "○", label: "Clear" },
      { type: "turbulence", icon: "△", label: "Mild turbulence" },
      { type: "visibility", icon: "◐", label: "Reduced visibility" },
      { type: "wind", icon: "●", label: "Strong winds" },
    ],
    plannedDate: "Feb 12, 2026",
    starred: true,
    chanceOfSuccess: 91,
  },
  {
    id: 4,
    from: "MCO",
    to: "JFK",
    departureTime: "10:15 PM",
    duration: "2 hrs 32 min",
    warnings: [
      { type: "weather", icon: "○", label: "Clear" },
      { type: "turbulence", icon: "△", label: "Mild turbulence" },
      { type: "visibility", icon: "◐", label: "Reduced visibility" },
      { type: "wind", icon: "●", label: "Strong winds" },
    ],
    plannedDate: "Feb 12, 2026",
    starred: true,
    chanceOfSuccess: 68,
  },
  {
    id: 5,
    from: "LAX",
    to: "ORD",
    departureTime: "07:45 AM",
    duration: "3 hrs 50 min",
    warnings: [
      { type: "weather", icon: "○", label: "Clear" },
      { type: "turbulence", icon: "△", label: "Mild turbulence" },
    ],
    plannedDate: "Mar 3, 2026",
    starred: false,
    chanceOfSuccess: 88,
  },
  {
    id: 6,
    from: "ATL",
    to: "DFW",
    departureTime: "01:30 PM",
    duration: "1 hr 55 min",
    warnings: [
      { type: "wind", icon: "●", label: "Strong winds" },
      { type: "visibility", icon: "◐", label: "Reduced visibility" },
    ],
    plannedDate: "Mar 18, 2026",
    starred: true,
    chanceOfSuccess: 72,
  },
  {
    id: 7,
    from: "SFO",
    to: "SEA",
    departureTime: "05:20 PM",
    duration: "1 hr 48 min",
    warnings: [
      { type: "weather", icon: "○", label: "Clear" },
      { type: "wind", icon: "●", label: "Strong winds" },
      { type: "turbulence", icon: "△", label: "Mild turbulence" },
    ],
    plannedDate: "Apr 1, 2026",
    starred: false,
    chanceOfSuccess: 95,
  },
];

export default function FlightHistory() {
  // state for search, sorting, filtering, and managing flight entries
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest"); // "latest" | "chanceOfSuccess" | "plannedDate"
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [flights, setFlights] = useState(SAMPLE_FLIGHTS);

  // toggle the starred state on a flight entry
  const handleToggleStar = (id) => {
    setFlights((prev) =>
      prev.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f))
    );
  };

  // filter flights by search query — matches airport codes, date, or departure time
  const filteredFlights = useMemo(() => {
    let result = flights;
    if (filterFavorites) {
      result = result.filter((f) => f.starred);
    }
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (f) =>
          f.from.toLowerCase().includes(q) ||
          f.to.toLowerCase().includes(q) ||
          f.plannedDate.toLowerCase().includes(q) ||
          f.departureTime.toLowerCase().includes(q)
      );
    }
    return result;
  }, [flights, searchQuery, filterFavorites]);

  // sort filtered flights based on selected sort option
  const sortedFlights = useMemo(() => {
    const sorted = [...filteredFlights];
    switch (sortBy) {
      case "chanceOfSuccess":
        sorted.sort((a, b) => b.chanceOfSuccess - a.chanceOfSuccess);
        break;
      case "plannedDate":
        sorted.sort((a, b) => new Date(b.plannedDate) - new Date(a.plannedDate));
        break;
      case "latest":
      default:
        sorted.sort((a, b) => b.id - a.id);
        break;
    }
    return sorted;
  }, [filteredFlights, sortBy]);

  // labels for the sort dropdown options
  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "chanceOfSuccess", label: "Chance of success" },
    { value: "plannedDate", label: "Planned date" },
  ];

  return (
    <div className="flight-history-page">
      {/* search bar with sort/filter button */}
      <div className="flight-history-search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search past routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* sort/filter toggle button */}
        <button
          className="sort-filter-btn"
          onClick={() => setShowSortMenu((prev) => !prev)}
          aria-label="Sort options"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line x1="3" y1="5" x2="17" y2="5" stroke="#1b3a6b" strokeWidth="1.5" />
            <line x1="3" y1="10" x2="17" y2="10" stroke="#1b3a6b" strokeWidth="1.5" />
            <line x1="3" y1="15" x2="17" y2="15" stroke="#1b3a6b" strokeWidth="1.5" />
            <circle cx="7" cy="5" r="2" fill="#1b3a6b" />
            <circle cx="13" cy="10" r="2" fill="#1b3a6b" />
            <circle cx="9" cy="15" r="2" fill="#1b3a6b" />
          </svg>
        </button>

        {/* sort dropdown menu — radio buttons for sort, checkbox for favorites filter */}
        {showSortMenu && (
          <div className="sort-menu">
            <div className="sort-menu-header">Sort by:</div>
            {sortOptions.map((opt) => (
              <label key={opt.value} className="sort-option">
                <input
                  type="radio"
                  name="sortBy"
                  value={opt.value}
                  checked={sortBy === opt.value}
                  onChange={() => {
                    setSortBy(opt.value);
                    setShowSortMenu(false);
                  }}
                />
                <span className="sort-radio-custom" />
                {opt.label}
              </label>
            ))}
            <div className="sort-menu-divider" />
            <label className="sort-option">
              <input
                type="checkbox"
                checked={filterFavorites}
                onChange={() => setFilterFavorites((prev) => !prev)}
              />
              <span className="filter-checkbox-custom">{filterFavorites ? "★" : ""}</span>
              Favorites only
            </label>
          </div>
        )}
      </div>

      {/* scrollable list of flight history entries */}
      <div className="flight-history-list">
        {sortedFlights.length > 0 ? (
          sortedFlights.map((flight) => (
            <FlightEntry
              key={flight.id}
              from={flight.from}
              to={flight.to}
              departureTime={flight.departureTime}
              duration={flight.duration}
              warnings={flight.warnings}
              plannedDate={flight.plannedDate}
              starred={flight.starred}
              onToggleStar={() => handleToggleStar(flight.id)}
            />
          ))
        ) : (
          <p className="no-results">No flights match your search.</p>
        )}
      </div>
    </div>
  );
}