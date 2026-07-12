import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import { useEffect, useState } from 'react';

function ServicesBank() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Set active tab based on current path
    if (location.pathname.includes('/subcategory')) {
      setActiveTab(1);
    } else if (location.pathname.includes('/requests')) {
      setActiveTab(2);
    } else {
      setActiveTab(0);
    }
  }, [location]);

  const handleTabChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate('/banks/service');
        break;
      case 1:
        navigate('/banks/service/subcategory');
        break;
      case 2:
        navigate('/banks/service/requests');
        break;
      // case 3:
      //   navigate('/banks/service/archive');
      //   break;
      default:
        navigate('/banks/service');
    }
    setActiveTab(newValue);
  };

  return (
    <div className="flex flex-col w-full">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="سرویس‌ها" />
          <Tab label="ساختار سرویس" />
          <Tab label="درخواست‌های سرویس" />
        </Tabs>
      </Box>
      <Outlet />
    </div>
  );
}

export default ServicesBank;