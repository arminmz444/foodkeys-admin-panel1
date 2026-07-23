import { Outlet } from 'react-router-dom';

/**
 * The generic Company Bank shell.
 *
 * Serves every dynamically generated COMPANY category bank at
 * `banks/company/:categoryId/*`.
 */
function CompanyBank() {
	return <Outlet />;
}

export default CompanyBank;
