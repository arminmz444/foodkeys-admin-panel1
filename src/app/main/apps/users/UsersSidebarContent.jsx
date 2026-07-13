import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import IconButton from '@mui/material/IconButton';
import { Outlet } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseScrollbars from '@fuse/core/FuseScrollbars';

function UsersSidebarContent() {
  return (
    <FuseScrollbars enable className="flex flex-col flex-auto h-full max-w-full w-md">
      <IconButton
        className="absolute top-0 right-0 my-16 mx-32 z-10"
        sx={{ color: 'white' }}
        component={NavLinkAdapter}
        to="/apps/users"
        size="large"
      >
        <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
      </IconButton>

      <Outlet />
    </FuseScrollbars>
  );
}

export default UsersSidebarContent;
