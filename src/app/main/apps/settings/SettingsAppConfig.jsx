// import { lazy } from "react";
// import { Navigate } from "react-router-dom";
// import WebsiteConfig from "@/app/main/apps/settings/WebsiteConfig.jsx";
//
// const WebsiteConfigsPageTab = lazy(
// 	() => import("./tabs/website-configs/WebsiteConfigsPageTab")
// );
// const SubscriptionTab = lazy(() => import("./tabs/subscription/SubscriptionTab"));
// const DiscountTab = lazy(() => import("./tabs/discount/DiscountTab"));
// const BundleList = lazy(() => import("./tabs/bundles/BundleList"));
// const BundlePageTab = lazy(() => import("./tabs/bundles/BundleTab"));
//
// const ConfigSchemasTab = lazy(() => import("./tabs/website-configs/ConfigSchemasTab"));
// const ConfigRecordsTab = lazy(() => import("./tabs/website-configs/ConfigRecordsTab"));
// const ServiceSchemasTab = lazy(() => import("./tabs/website-configs/ServiceSchemasTab"));
// const ServiceRecordsTab = lazy(() => import("./tabs/website-configs/ServiceRecordsTab"));
// const ClientManagementTab = lazy(() => import("./tabs/website-configs/ClientManagementTab"));
// const UserPanelConfigsPageTab = lazy(() => import("./tabs/user-panel-configs/UserPanelConfigsPageTab"))
//
//
// // const WebsiteConfigSettings = lazy(
// // 	() => import("./website-config-settings/WebsiteConfigSettings")
// // );
// const SettingsApp = lazy(() => import("./SettingsApp"));
// const CustomSettingsApp = lazy(() => import("./CustomSettingsApp"));
// const HomePageTab = lazy(() => import("./tabs/HomePageTab"));
// const CareerPageTab = lazy(() => import("./tabs/CareerPageTab"));
// const AboutUsPageTab = lazy(() => import("./tabs/AboutUsPageTab"));
// const AccountTab = lazy(() => import("./tabs/AccountTab"));
// const SecurityTab = lazy(() => import("./tabs/SecurityTab"));
// const PlanBillingTab = lazy(() => import("./tabs/PlanBillingTab"));
// const NotificationsTab = lazy(() => import("./tabs/NotificationsTab"));
// const FileServiceTypeEntityTab = lazy(() => import("./tabs/file-service-type-entity/FileServiceTypeEntityTab"));
// const TeamTab = lazy(() => import("./tabs/TeamTab"));
// /**
//  * The Settings app config.
//  */
// const SettingsAppConfig = {
// 	settings: {
// 		layout: {
// 			config: {},
// 		},
// 	},
// 	routes: [
// 		{
// 			path: "apps/settings",
// 			element: <SettingsApp />,
// 			children: [
// 				{
// 					path: "about-us-page",
// 					element: <AboutUsPageTab />,
// 				},
// 				// {
// 				// 	path: "homepage",
// 				// 	element: <HomePageTab />,
// 				// },
// 				// {
// 				// 	path: "career-page",
// 				// 	element: <CareerPageTab />,
// 				// },
// 				{
// 					path: "website-configs",
// 					element: <WebsiteConfig />,
// 				},
// 				{
// 					path: "user-panel-configs",
// 					element: <UserPanelConfigsPageTab />,
// 				},
// 				{
// 					path: "configs/schemas",
// 					element: <ConfigSchemasTab />,
// 				 },
// 				 {
// 					path: "configs/records",
// 					element: <ConfigRecordsTab />,
// 				 },
// 				 {
// 					path: "services/schemas",
// 					element: <ServiceSchemasTab />,
// 				 },
// 				 {
// 					path: "services/records",
// 					element: <ServiceRecordsTab />,
// 				 },
// 				 {
// 					path: "clients",
// 					element: <ClientManagementTab />,
// 				 },
// 				{
// 					path: "bundle",
// 					element: <BundlePageTab />,
// 				},
// 				{
// 					path: "subscription",
// 					element: <SubscriptionTab />,
// 				},
// 				{
// 					path: "discount",
// 					element: <DiscountTab />,
// 				},
// 				{
// 					path: "account",
// 					element: <AccountTab />,
// 				},
// 				{
// 					path: "security",
// 					element: <SecurityTab />,
// 				},
// 				{
// 					path: "plan-billing",
// 					element: <PlanBillingTab />,
// 				},
// 				{
// 					path: "security",
// 					element: <SecurityTab />,
// 				},
// 				{
// 					path: "notifications",
// 					element: <NotificationsTab />,
// 				},
// 				{
// 					path: "file-service-type-entity",
// 					element: <FileServiceTypeEntityTab />,
// 				},
// 				{
// 					path: "team",
// 					element: <TeamTab />,
// 				},
// 				{
// 					path: "",
// 					element: <Navigate to="account" />,
// 				},
// 			],
// 		},
// 		{
// 			path: "apps/settings/bundle",
// 			element: <CustomSettingsApp />,
// 			children: [
// 				{
// 					path: ":subCategoryId/*",
// 					element: <BundleList />,
// 				},
// 			],
// 		},
// 	],
// };
// export default SettingsAppConfig;

import { lazy } from "react";
import { Navigate } from "react-router-dom";
import WebsiteConfig from "@/app/main/apps/settings/WebsiteConfig.jsx";

const WebsiteConfigsPageTab = lazy(
	() => import("./tabs/website-configs/WebsiteConfigsPageTab")
);
const DiscountTab = lazy(() => import("./tabs/discount/DiscountTab"));
const BundleList = lazy(() => import("./tabs/bundles/BundleList"));
const BundlePageTab = lazy(() => import("./tabs/bundles/BundleTab"));

const ConfigSchemasTab = lazy(() => import("./tabs/website-configs/ConfigSchemasTab"));
const ConfigRecordsTab = lazy(() => import("./tabs/website-configs/ConfigRecordsTab"));
const ServiceSchemasTab = lazy(() => import("./tabs/website-configs/ServiceSchemasTab"));
const ServiceRecordsTab = lazy(() => import("./tabs/website-configs/ServiceRecordsTab"));
const ClientManagementTab = lazy(() => import("./tabs/website-configs/ClientManagementTab"));
const UserPanelConfigsPageTab = lazy(() => import("./tabs/user-panel-configs/UserPanelConfigsPageTab"));

// Individual Website Page Tabs
const HomePageTab = lazy(() => import("./tabs/HomePageTab"));
const CareerPageTab = lazy(() => import("./tabs/CareerPageTab"));
const FAQPageTab = lazy(() => import("./tabs/FAQPageTab"));
const GuidePageTab = lazy(() => import("./tabs/GuidePageTab"));
const ContactPageTab = lazy(() => import("./tabs/ContactPageTab"));

const SettingsApp = lazy(() => import("./SettingsApp"));
const CustomSettingsApp = lazy(() => import("./CustomSettingsApp"));
const AboutUsPageTab = lazy(() => import("./tabs/AboutUsPageTab"));
const AccountTab = lazy(() => import("./tabs/AccountTab"));
const SecurityTab = lazy(() => import("./tabs/SecurityTab"));
const PlanBillingTab = lazy(() => import("./tabs/PlanBillingTab"));
const NotificationsTab = lazy(() => import("./tabs/NotificationsTab"));
const FileServiceTypeEntityTab = lazy(() => import("./tabs/file-service-type-entity/FileServiceTypeEntityTab"));
const TeamTab = lazy(() => import("./tabs/TeamTab"));
const FavoritesTab = lazy(() => import("./tabs/favorites/FavoritesTab"));
const RelatedEntityTab = lazy(() => import("./tabs/related-entities/RelatedEntityTab"));

// Dynamic Configs
const DynamicConfigPage = lazy(() => import("./tabs/dynamic-configs/DynamicConfigPage"));
const DynamicConfigEditor = lazy(() => import("./tabs/dynamic-configs/DynamicConfigEditor"));

/**
 * The Settings app config.
 */
const SettingsAppConfig = {
	settings: {
		layout: {
			config: {},
		},
	},
	routes: [
		{
			path: "apps/settings",
			element: <SettingsApp />,
			children: [
			{
				path: "favorites",
				element: <FavoritesTab />,
			},
			{
				path: "related-entities",
				element: <RelatedEntityTab />,
			},
				{
					path: "about-us-page",
					element: <AboutUsPageTab />,
				},

				{
					path: "homepage",
					element: <HomePageTab />,
				},
				{
					path: "career-page",
					element: <CareerPageTab />,
				},
				{
					path: "faq-page",
					element: <FAQPageTab />,
				},
				{
					path: "guide-page",
					element: <GuidePageTab />,
				},
				{
					path: "contact-page",
					element: <ContactPageTab />,
				},

				{
					path: "website-configs",
					element: <WebsiteConfig />,
				},
				{
					path: "user-panel-configs",
					element: <UserPanelConfigsPageTab />,
				},
				{
					path: "configs/schemas",
					element: <ConfigSchemasTab />,
				},
				{
					path: "configs/records",
					element: <ConfigRecordsTab />,
				},
				{
					path: "services/schemas",
					element: <ServiceSchemasTab />,
				},
				{
					path: "services/records",
					element: <ServiceRecordsTab />,
				},
				{
					path: "clients",
					element: <ClientManagementTab />,
				},
				{
					path: "bundle",
					element: <BundlePageTab />,
				},
				{
					path: "discount",
					element: <DiscountTab />,
				},
				{
					path: "account",
					element: <AccountTab />,
				},
				{
					path: "security",
					element: <SecurityTab />,
				},
				{
					path: "plan-billing",
					element: <PlanBillingTab />,
				},
				{
					path: "notifications",
					element: <NotificationsTab />,
				},
				{
					path: "file-service-type-entity",
					element: <FileServiceTypeEntityTab />,
				},
{
				path: "team",
				element: <TeamTab />,
			},
			// Dynamic Configs Routes
			{
				path: "dynamic-configs",
				element: <DynamicConfigPage />,
			},
			{
				path: "dynamic-configs/:configName",
				element: <DynamicConfigEditor />,
			},
			{
				path: "",
				element: <Navigate to="dynamic-configs" />,
			},
			],
		},
		{
			path: "apps/settings/bundle",
			element: <CustomSettingsApp />,
			children: [
				{
					path: ":subCategoryId/*",
					element: <BundleList />,
				},
			],
		},
	],
};
export default SettingsAppConfig;