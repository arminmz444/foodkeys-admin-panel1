import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import FusePageCarded from '@fuse/core/FusePageCarded';
import FuseLoading from '@fuse/core/FuseLoading';
import EnhancedMiniAppViewer from './EnhancedMiniAppViewer';
import FederationMiniAppLoader from './FederationMiniAppLoader';

// Mock data for Module Federation MiniApp
const moduleFederationMiniApp = {
  id: 2,
  name: "InventoryManagement",
  version: "1.2.0",
  description: "Complete inventory management system for tracking products and stock levels",
  clientType: "ADMIN_PANEL_CLIENT",
  routePath: "inventory",
  integrationType: "moduleFederation",
  access: ["ADMIN", "INVENTORY_MANAGER"],
  componentProps: {
    defaultFilters: {
      showOutOfStock: true,
      categoryId: null
    },
    theme: "light"
  },
  createdAt: "2025-01-20T09:15:00",
  updatedAt: "2025-03-15T11:20:00",
  createdBy: "developer@example.com"
};

// Mock data for iframe MiniApp
const iframeMiniApp = {
  id: 1,
  name: "Customer Analytics Dashboard",
  version: "1.0.0",
  description: "Interactive dashboard showing customer engagement metrics",
  clientType: "ADMIN_PANEL_CLIENT",
  routePath: "analytics-dashboard",
  integrationType: "iframe",
  access: ["ADMIN", "MANAGER", "ANALYST"],
  content: {
    html: `<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Customer Analytics Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 font-sans">
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center text-blue-600 mb-8">داشبورد تحلیل مشتریان</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">مشتریان فعال</h2>
        <p class="text-4xl font-bold text-green-600">3,542</p>
        <p class="text-sm text-gray-500">+12% نسبت به ماه قبل</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">درآمد کل</h2>
        <p class="text-4xl font-bold text-blue-600">۸۶,۷۴۵,۰۰۰ تومان</p>
        <p class="text-sm text-gray-500">+5% نسبت به ماه قبل</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">سفارشات جدید</h2>
        <p class="text-4xl font-bold text-purple-600">824</p>
        <p class="text-sm text-gray-500">+18% نسبت به ماه قبل</p>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">روند فروش ماهانه</h2>
      <div class="h-64 bg-gray-100 rounded flex items-center justify-center">
        <p class="text-gray-500">نمودار فروش ماهانه</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">محصولات پرفروش</h2>
        <ul class="divide-y">
          <li class="py-3 flex justify-between">
            <span>محصول ۱</span>
            <span class="font-semibold">۴۵٪</span>
          </li>
          <li class="py-3 flex justify-between">
            <span>محصول ۲</span>
            <span class="font-semibold">۲۵٪</span>
          </li>
          <li class="py-3 flex justify-between">
            <span>محصول ۳</span>
            <span class="font-semibold">۱۵٪</span>
          </li>
          <li class="py-3 flex justify-between">
            <span>محصول ۴</span>
            <span class="font-semibold">۱۰٪</span>
          </li>
          <li class="py-3 flex justify-between">
            <span>سایر</span>
            <span class="font-semibold">۵٪</span>
          </li>
        </ul>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">توزیع مشتریان</h2>
        <div class="h-64 bg-gray-100 rounded flex items-center justify-center">
          <p class="text-gray-500">نمودار توزیع جغرافیایی</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
    css: `
body {
  font-family: 'Vazir', 'Tahoma', sans-serif;
  direction: rtl;
}

.dashboard-card {
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.chart-container {
  min-height: 300px;
  border-radius: 8px;
  overflow: hidden;
}`,
    js: `
document.addEventListener('DOMContentLoaded', function() {
  // Sample data for the charts
  const monthlyData = [
    { month: 'فروردین', sales: 45000000 },
    { month: 'اردیبهشت', sales: 52000000 },
    { month: 'خرداد', sales: 48000000 },
    { month: 'تیر', sales: 61000000 },
    { month: 'مرداد', sales: 58000000 },
    { month: 'شهریور', sales: 65000000 }
  ];

  // This is placeholder JS. In a real app, you would initialize charts here.
  console.log('Dashboard initialized with sample data:', monthlyData);
  
  // Add click event listeners to cards
  const cards = document.querySelectorAll('.bg-white');
  cards.forEach(card => {
    card.addEventListener('click', function() {
      console.log('Card clicked:', this.querySelector('h2').textContent);
    });
  });
});`
  },
  createdAt: "2025-02-15T10:30:00",
  updatedAt: "2025-03-10T15:45:00",
  createdBy: "admin@example.com"
};
/**
 * MiniApp Page Component
 * Renders a MiniApp in a Fuse page layout
 */
function MiniAppPage(props) {
  const { miniappId, companyId } = props;
  const params = useParams();
  const [miniapp, setMiniapp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // If miniappId or companyId are not provided as props, try to get them from route params
  const resolvedMiniappId = miniappId || params.miniappId;
  const resolvedCompanyId = companyId || params.companyId;
  
  // Use local mock data only (no /api/miniapps backend calls)
  useEffect(() => {
    setLoading(true);
    setError(null);

    const mockById = {
      [String(iframeMiniApp.id)]: iframeMiniApp,
      [String(moduleFederationMiniApp.id)]: moduleFederationMiniApp
    };

    const resolved =
      mockById[String(resolvedMiniappId)] ||
      (resolvedCompanyId ? iframeMiniApp : null) ||
      iframeMiniApp;

    setMiniapp(resolved);
    setLoading(false);
  }, [resolvedMiniappId, resolvedCompanyId]);
  
  // Create page header
  const renderHeader = () => (
    <Box 
      className="flex flex-col sm:flex-row flex-0 sm:items-center sm:justify-between p-24 sm:py-32 sm:px-40"
      sx={{ minHeight: 200 }}
    >
      <div className="flex flex-col">
        <Typography className="text-24 md:text-32 font-extrabold tracking-tight">
          {miniapp ? miniapp.name : 'MiniApp'}
        </Typography>
        <Typography variant="subtitle1" className="font-medium">
          {miniapp ? miniapp.description : 'Loading...'}
        </Typography>
      </div>
    </Box>
  );
  
  // Create page content
  const renderContent = () => {
    if (loading) {
      return <FuseLoading />;
    }
    
    if (error) {
      return (
        <Paper className="p-24 m-24">
          <Typography color="error" variant="h5">
            {error}
          </Typography>
        </Paper>
      );
    }
    
    if (!miniapp) {
      return (
        <Paper className="p-24 m-24">
          <Typography variant="h5">
            MiniApp not found
          </Typography>
        </Paper>
      );
    }
    
    // Determine which component to use based on integration type
    if (miniapp.integrationType === 'moduleFederation') {
      return (
        <FederationMiniAppLoader
          miniapp={miniapp}
          companyId={resolvedCompanyId || miniapp.targetCompanyId}
        />
      );
    }

    return (
      <EnhancedMiniAppViewer
        miniapp={miniapp}
        companyId={resolvedCompanyId || miniapp.targetCompanyId}
        className="m-24"
      />
    );
  };
  
  return (
    <FusePageCarded
      header={renderHeader()}
      content={renderContent()}
      scroll="content"
    />
  );
}

export default MiniAppPage;