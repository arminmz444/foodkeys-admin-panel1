import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import ListItemButton from "@mui/material/ListItemButton";
import Chip from "@mui/material/Chip";
import { getServerFile } from "src/utils/string-utils.js";

/**
 * The UserListItem component.
 */
function UserListItem(props) {
  const { user } = props;
  
  if (!user) {
    return null;
  }
  
  return (
    <>
      <ListItemButton
        className="px-32 py-16"
        sx={{ bgcolor: "background.paper" }}
        component={NavLinkAdapter}
        to={`/apps/users/${user.id}`}
      >
        <ListItemAvatar>
          <Avatar
            alt={`${user.firstName} ${user.lastName}`}
            src={user.avatar && getServerFile(user.avatar)}
            className="shadow-7"
          >
            {user.firstName?.charAt(0)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          classes={{
            root: "m-0",
            primary: "font-800 leading-5 truncate text-lg",
          }}
          primary={`${user.firstName} ${user.lastName}`}
          secondaryTypographyProps={{ component: "div" }}
          secondary={
            <div className="flex flex-col">
              <Typography
                className="inline text-base font-400"
                component="span"
                color="text.secondary"
              >
                {`${user.email || ""} ${user.username ? `| ${user.username}` : ""}`}
              </Typography>
              
              {user.jobPosition && (
                <Typography
                  className="inline text-sm font-400 mt-2"
                  component="span"
                  color="text.secondary"
                >
                  {user.jobPosition}
                </Typography>
              )}
              
              {user.roles && user.roles.length > 0 && (
                <div className="flex mt-4 flex-wrap">
                  {user.roles.map((role, index) => (
                    <Chip
                      key={index}
                      label={role}
                      size="small"
                      className="mr-2 mb-2"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </div>
              )}
            </div>
          }
        />
        <Chip
          size="small"
          label={user.active ? "فعال" : "غیرفعال"}
          color={user.active ? "success" : "error"}
          className="mr-8"
        />
      </ListItemButton>
      <Divider />
    </>
  );
}

export default UserListItem;