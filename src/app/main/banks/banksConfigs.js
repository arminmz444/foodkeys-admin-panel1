import AgricultureIndustryBankConfig from '@/app/main/banks/agriculture-industry-bank/AgricultureIndustryBankConfig.jsx';
import FoodIndustryBankConfig from '@/app/main/banks/food-industry-bank/FoodIndustryBankConfig.jsx';
import ServicesBankConfig from '@/app/main/banks/services/ServicesBankConfig.jsx';
import CompanyBankConfig from '@/app/main/banks/company-bank/CompanyBankConfig.jsx';

/**
 * Banks
 *
 * `CompanyBankConfig` handles every dynamically generated COMPANY category at
 * `banks/company/:categoryId/*`. The legacy food/agriculture configs are kept
 * registered so any existing deep links keep working, but the sidebar
 * navigation is now built dynamically (see `useDynamicBanksNavigation`).
 */
const banksConfigs = [
	CompanyBankConfig,
	AgricultureIndustryBankConfig,
	FoodIndustryBankConfig,
	ServicesBankConfig
];
export default banksConfigs;
