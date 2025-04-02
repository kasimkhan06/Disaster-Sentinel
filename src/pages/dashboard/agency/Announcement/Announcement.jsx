import React, { useState } from "react";
import EventListing from "./EventListing";
import { EventFormProvider  } from "../../../../hooks/useEventForm";
import EventForm from "./CreateEvent";
import "../../../../../public/css/Announcement.css";

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