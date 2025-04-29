// React
import { useState } from "react";

// Contexts / Providers
import { EventFormProvider } from "../../../../hooks/useEventForm";

// Components
import EventForm from "./CreateEvent";
import EventListing from "./EventListing";

// Styles & Assets
import "../../../../../public/css/Announcement.css";
import worldMapBackground from "/assets/Background Image/world-map-background.jpg";

export default function AnnouncementPage() {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = ["Event", "Create Event"];

  return (
    <div className="tabContainer">
      {/* Folder-Style Tabs */}
      <div className="tabList">
        {tabs.map((label, index) => (
          <div
            key={index}
            className={selectedTab === index ? "tab activeTab" : "tab"}
            onClick={() => setSelectedTab(index)}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="content">
        {selectedTab === 0 && <div><EventListing /></div>}
        {selectedTab === 1 && 
        <div>
          <EventFormProvider>
            <EventForm />
          </EventFormProvider>
          </div>
        }
      </div>
    </div>
  );
}