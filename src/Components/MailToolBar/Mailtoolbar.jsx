import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./Mailtoolbar.css";

const Mailtoolbar = () => {

  return (
    <div className="mail-toolbar">

      <Checkbox />
      <IconButton >
        <RefreshIcon />
      </IconButton>

      <IconButton>
        <MoreVertIcon />
      </IconButton>
    </div>
  );
};
export default Mailtoolbar;