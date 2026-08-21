import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";
const Logo = () => {
 const navigate = useNavigate();

 const handleLogoClick=()=> {
    navigate("/");
 }

  return (
    <div className="logo" onClick={handleLogoClick}>
      <h1>
        <EmailIcon />
        <span>DMail</span>
      </h1>
    </div>
  );
};

export default Logo;
