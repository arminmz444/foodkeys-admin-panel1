import FusePageCarded from '@fuse/core/FusePageCarded/FusePageCarded.jsx';
import { useThemeMediaQuery } from '@fuse/hooks/index.js';
import GlobalStyles from '@mui/material/GlobalStyles';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import RequestsTable from './RequestsTable.jsx';
import DemoHeader from '@/app/shared-components/DemoHeader';

/**
 * The companies page.
 */
function RequestsList() {
	/**
	 * The SubCategories page.
	 */
	const breadcrumbs = [
		{ label: 'داشبورد', href: '/' },
		{ label: 'بانک‌ها', href: '/banks' },
		{ label: 'صنایع غذایی', href: '/food-industry' },
		{ label: 'مدیریت درخواست‌ها', href: '/requests' }
	];
	const Root = styled(FusePageCarded)({
		'& .FusePageCarded-header': {},
		'& .FusePageCarded-toolbar': {},
		'& .FusePageCarded-content': {},
		'& .FusePageCarded-sidebarHeader': {},
		'& .FusePageCarded-sidebarContent': {}
	});

	// return (
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
	const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
	useEffect(() => {
		setLeftSidebarOpen(!isMobile);
		setRightSidebarOpen(!isMobile);
	}, [isMobile]);
	return (
		<>
			<GlobalStyles
				styles={() => ({
					'#root': {
						maxHeight: '100vh'
					}
				})}
			/>
			<Root
				header={
					<DemoHeader
						title="مدیریت درخواست‌های بانک صنعت غذا"
						breadcrumbs={breadcrumbs}
						leftSidebarToggle={() => {
							setLeftSidebarOpen(!leftSidebarOpen);
						}}
						// rightSidebarToggle={() => {
						// 	setRightSidebarOpen(!rightSidebarOpen);
						// }}
					/>
				}
				content={
					<div className="w-full h-full container flex flex-col">
						{/* <SubCategoriesHeader /> */}
						<RequestsTable />
					</div>
				}
				// leftSidebarOpen={leftSidebarOpen}
				// leftSidebarOnClose={() => {
				// 	setLeftSidebarOpen(false);
				// }}
				// leftSidebarContent={<DemoSidebar />}
				scroll="normal"
			/>
		</>
	);
}

export default RequestsList;
