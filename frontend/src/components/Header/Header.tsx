import React from "react";
import {
  ProSidebar,
  Menu,
  MenuItem,
  SidebarHeader,
  SidebarContent,
  SidebarFooter
} from "react-pro-sidebar";
import { FaPollH, FaList, FaSignOutAlt, FaInfo, FaPlusCircle, FaPoll } from "react-icons/fa";
export interface HeaderProps {
    changePage(newPage: number): void;
}

export const Header: React.FC<HeaderProps> = ({
    changePage,
}) => {
  const headerStyle: { [id: string] : string; } = {
    padding: "24px",
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: "1px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "noWrap"
  };

  return (
    <ProSidebar>
      <SidebarHeader style={headerStyle}>My Vote</SidebarHeader>
      <SidebarContent>
        <Menu iconShape="circle">
          <MenuItem icon={<FaInfo />} onClick={() => changePage(0)}>About</MenuItem>
          <MenuItem icon={<FaPlusCircle />} onClick={() => changePage(1)}>Add New Admin</MenuItem>
          <MenuItem icon={<FaPoll />} onClick={() => changePage(2)}>Add New Poll</MenuItem>
          <MenuItem icon={<FaList />} onClick={() => changePage(3)}>My Polls</MenuItem>
          <MenuItem icon={<FaPollH />} onClick={() => changePage(4)}>Poll View</MenuItem>
        </Menu>
      </SidebarContent>
      <SidebarFooter style={{ textAlign: "center" }}>
        <div className="sidebar-btn-wrapper">
          <a
            href="https://www.github.com"
            target="_blank"
            className="sidebar-btn"
            rel="noopener noreferrer"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </a>
        </div>
      </SidebarFooter>
    </ProSidebar>
  );
}
