import { useContext, useState , useEffect, useRef} from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import LogoutIcon from "@mui/icons-material/Logout";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";

import "./NavButtons.css";
const NavButtons = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { loggedInUser, setLoggedInUser } = useContext(UserContext);
  const [showProfile, setShowProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem(`profileImage_${loggedInUser?.email}`) || null);
  const navigate = useNavigate();
    const profileRef = useRef(null);
  // set profile picture
  const handleProfileImage = (event) => {
    const file = event.target.files[0];
    if (!file || !loggedInUser?.email) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = reader.result;
      setProfileImage(image);
      localStorage.setItem(`profileImage_${loggedInUser.email}`, image);
    };
    reader.readAsDataURL(file);
  };

  // handle remove profile image
  const handleRemoveProfileImage = (event) => {
        if(!loggedInUser?.email){
          return;
        }
        setProfileImage(null);
        localStorage.removeItem(`profileImage_${loggedInUser.email}`);
        toast.success("Profile Removed");
  }


  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("loggedInUser");
    navigate("/sign-in");
    toast.info(`${loggedInUser.email} logout successfully`);
  };

  useEffect(()=>{
      const handleClickOutside = (event) => {
          if(profileRef.current && !profileRef.current.contains(event.target)){
              setShowProfile(false)
          }
      }
       document.addEventListener("mousedown", handleClickOutside);
          return ()=> {
              document.removeEventListener("mousedown", handleClickOutside);
          }
  },[]);

  return (
    <>
      {loggedInUser ? (

        <div className="nav-buttons" ref={profileRef}>
          <IconButton onClick={() => setShowProfile(!showProfile)}
            color="primary"
            title="Profile">
            {profileImage ? (
              <img src={profileImage}
                alt="Profile"
                className="header-profile-image" />
            ) : (
              <PersonIcon />
            )}
          </IconButton>
          {showProfile && (
            <div className="profile-popup">
              <div className="profile-email">
                {loggedInUser.email}
              </div>
              <div className="profile-image-section">
                <label className="profile-image-container">
                  {profileImage ? (
                    <img src={profileImage}
                      alt="Profile"
                      className="profile-popup-image" />
                  ) :
                    (
                      <div className="profile-default-icon">
                        <PersonIcon />
                      </div>
                    )}
                  <span className="profile-add-button">
                    <AddIcon />
                  </span>
                  <input type="file" accept="image/*"
                    onChange={handleProfileImage} hidden />
                </label>
                <p>Add profile photo</p>
                { profileImage && (
                   <button className="remove-profile-button" onClick={handleRemoveProfileImage}>
                      remove profile
                   </button>
                )}
              </div>
              <div className="manage-account-link">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/manage-account");
                  }}>
                  Manage your account
                </button>
              </div>
              <div className="profile-logout">
                <IconButton
                  onClick={() => {
                    handleLogout();
                    setShowProfile(false);
                  }}
                  color="primary"
                  title="Logout" >
                  <LogoutIcon />
                </IconButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Logged-out user
        <div className="nav-buttons">
          <Link to="/sign-in">
            <button className="sign-in">
              Sign In
            </button>
          </Link>
          <div className="create-account-wrapper">
            <button className="create-acc"
              onClick={() => setShowDropdown(!showDropdown)}>
              Create account
              <span className="arrow">▾</span>
            </button>

            {showDropdown && (
              <div className="account-dropdown">
                <Link to="/create-acc"
                  onClick={() => setShowDropdown(false)}>
                  <button>
                    <strong>For personal use</strong>
                    <span>For yourself</span>
                  </button>
                </Link>

                <Link to="/create-acc"
                  onClick={() => setShowDropdown(false)}>
                  <button>
                    <strong>For work or business</strong>
                    <span>For your organization</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default NavButtons;
