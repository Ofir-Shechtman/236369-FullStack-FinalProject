import React from "react";
import {
  ProSidebar,
  Menu,
  MenuItem,
  SidebarHeader,
  SidebarContent,
  SidebarFooter
} from 'react-pro-sidebar';
import { FaTelegramPlane, FaList, FaSignOutAlt, FaInfo, FaPlusCircle, FaPoll } from "react-icons/fa";
import axios from "axios";
interface HeaderProps {
    changePage(newPage: number): void;
    removeToken:any;

}

export const Header: React.FC<HeaderProps> = ({
    changePage,removeToken
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

  function logMeOut() {
    axios({
      method: "POST",
      url:"/logout",
    })
    .then((response) => {
       removeToken()
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
        }
    })}

  return (
    <div className={"Header"}>
      <ProSidebar>
        <SidebarHeader style={headerStyle}>My Vote</SidebarHeader>
        <SidebarContent>
          <Menu iconShape="circle">
            <MenuItem icon={<FaInfo />} onClick={() => changePage(0)}>About</MenuItem>
            <MenuItem icon={<FaPlusCircle />} onClick={() => changePage(1)}>Add New Admin</MenuItem>
            <MenuItem icon={<FaPoll />} onClick={() => changePage(2)}>Add New Poll</MenuItem>
            <MenuItem icon={<FaList />} onClick={() => changePage(3)}>My Polls</MenuItem>
            <MenuItem icon={<FaTelegramPlane />} onClick={() => changePage(4)}>Send Poll</MenuItem>
          </Menu>
        </SidebarContent>
        <SidebarFooter style={{ textAlign: "center" }}>
          <div className="sidebar-btn-wrapper">
            <a onClick={logMeOut} className="sidebar-btn" href="#">
                <FaSignOutAlt />
                <span>Logout</span>
            </a>
          </div>
        </SidebarFooter>
      </ProSidebar>
    </div>
  );
}
