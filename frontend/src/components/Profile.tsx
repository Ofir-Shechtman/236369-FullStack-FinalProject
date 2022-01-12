import React, { useState, useEffect } from 'react';
import logo from '../logo.svg';
import "react-pro-sidebar/dist/css/styles.css";
import '../App.css';
import {Header} from "./Header/Header";
import {PageLayout} from "./Pages/PageLayout";
import axios from "axios";
interface ProfileProps {
    removeToken:any;
    token:string;

}

const Profile: React.FC<ProfileProps> = ({
    removeToken,token
}) => {
  const [page, setPage] = React.useState<number>(2);
  const changePage = (newPage: number) => {
    setPage(newPage);
    // Think about validations...
  }
  const [profileData, setProfileData] = useState<string>("AA")
  function getData() {
    axios({
      method: "GET",
      url:"/profile",
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    .then((response) => {
      const res =response.data
      setProfileData(res.username)
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
        }
    })}
  getData()
  return (
    <div className="App">
      <Header changePage={changePage} removeToken={removeToken}/>
      <PageLayout page={page} username={profileData}/>
    </div>
  );
}

export default Profile;
