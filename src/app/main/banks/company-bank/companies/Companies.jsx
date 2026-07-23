import FusePageCarded from '@fuse/core/FusePageCarded/index.js';
import { useThemeMediaQuery } from '@fuse/hooks/index.js';
import CompaniesHeader from './CompaniesHeader.jsx';
import CompaniesTable from './CompaniesTable.jsx';

/**
 * The generic companies page (per COMPANY category).
 */
function Companies() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	return (
		<FusePageCarded
			header={<CompaniesHeader />}
			content={<CompaniesTable />}
			scroll={isMobile ? 'normal' : 'content'}
		/>
	);
}

export default Companies;
