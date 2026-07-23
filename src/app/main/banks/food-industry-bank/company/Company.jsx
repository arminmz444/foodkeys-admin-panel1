import FuseLoading from "@fuse/core/FuseLoading";
import FusePageCarded from "@fuse/core/FusePageCarded";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import _ from "@lodash";
import { FormProvider, useForm } from "react-hook-form";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CompanyHeader from "./CompanyHeader";
import { useGetFoodIndustryCompanyDetailsQuery } from "../FoodIndustryBankApi";
import CompanyModel from "./models/CompanyModel";

const BasicInfoTab = lazy(() => import("./tabs/BasicInfoTab"));
const ProductsAndServicesTab = lazy(() => import("./tabs/ProductsAndServicesTab.jsx"));
const CompanyGalleryTab = lazy(() => import("./tabs/CompanyGalleryTab"));
const HistoryTab = lazy(() => import("./tabs/HistoryTab"));
const ContactInfoTab = lazy(() => import("./tabs/ContactInfoTab"));
const ManagementDescTab = lazy(() => import("./tabs/ManagementDescTab"));
const RegistrarTab = lazy(() => import("./tabs/RegistrarTab.jsx"));
const MapTab = lazy(() => import("./tabs/MapTab"));
const ArchivesTab = lazy(() => import("./tabs/ArchivesTab"));
const VersionHistoryTab = lazy(() => import("./tabs/VersionHistoryTab"));
const RelatedCompaniesTab = lazy(() =>
	import("src/app/shared-components/related-companies/RelatedCompaniesTab")
);
const AnnouncementsTab = lazy(() =>
	import("src/app/shared-components/announcements/AnnouncementsTab")
);
const AdvertisementsTab = lazy(() =>
	import("src/app/shared-components/advertisements/AdvertisementsTab")
);

/**
 * Form Validation Schema
 */
const schema = z.object({
  name: z
    .string()
    .nonempty("You must enter a company name")
    .min(5, "The company name must be at least 5 characters"),
});

/**
 * The Company page.
 */
function Company() {
  const isMobile = useThemeMediaQuery((_theme) =>
    _theme.breakpoints.down("lg")
  );
  const routeParams = useParams();
  const { companyId } = routeParams;
  const {
    data: company,
    isLoading,
    isError,
  } = useGetFoodIndustryCompanyDetailsQuery(companyId, {
    skip: !companyId || companyId === "new" || companyId === "additional-settings",
  });
  console.log(JSON.stringify(company));
  const [tabValue, setTabValue] = useState(0);
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      likes: 0,
      dislikes: 0,
    },
    resolver: zodResolver(schema),
  });
  const { reset, watch } = methods;
  const form = watch();
  useEffect(() => {
    if (companyId === "new") {
      reset(CompanyModel({}));
    }
  }, [companyId, reset]);
  useEffect(() => {
    if (company) {
      const location = company.location || {}
      const registrantId = company.registrant
      // Map websites from API response; fallback to legacy single website field
      let websites = company.websites;
      if ((!websites || websites.length === 0) && company.website) {
        websites = [{ name: company.website, visibility: 'FK_WEBSITE:ADMIN_PANEL' }];
      }

      reset({ ...company, 
        registrantId,
        websites: websites || [],
        officeState: location.officeState,
        officeCity: location.officeCity,
        officeLocation: location.officeLocation,
        officePoBox: location.officePoBox,
        factoryState: location.factoryState,
        factoryCity: location.factoryCity,
        factoryLocation: location.factoryLocation,
        factoryPoBox: location.factoryPoBox,
        industrialCity: location.industrialCity,
        latitude: location.latitude,
        longitude: location.longitude,
        fullAddress: location.fullAddress,
        commonName: location.commonName,
        status: company.status || 0,
        likes: Math.max(0, parseInt(company.likes, 10) || 0),
        dislikes: Math.max(0, parseInt(company.dislikes, 10) || 0),
      });
    }
    // Only re-seed the form when switching companies — avoid wiping edits on refetch
  }, [company?.id, reset]);

  /**
   * Tab Change
   */
  function handleTabChange(event, value) {
    setTabValue(value);
  }

  if (isLoading) {
    return <FuseLoading />;
  }

  /**
   * Show Message if the requested companies is not exists
   */
  if (isError && companyId !== "new") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          شرکتی با این شناسه پیدا نشد
        </Typography>
        <Button
          className="mt-24"
          component={Link}
          variant="outlined"
          to="/banks/food-industry-bank/company/list"
          color="inherit"
        >
          برگشت به لیست شرکت‌ها
        </Button>
      </motion.div>
    );
  }

  if (
    _.isEmpty(form) ||
    (company &&
      routeParams.companyId !== String(company.id) &&
      routeParams.companyId !== "new")
  ) {
    return <FuseLoading />;
  }

  return (
    <FormProvider {...methods}>
      <FusePageCarded
        header={<CompanyHeader />}
        content={
          <>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="secondary"
              textColor="secondary"
              variant="scrollable"
              scrollButtons="auto"
              classes={{ root: "w-full h-64 border-b-1" }}
            >
              <Tab className="h-64" label="معرفی شرکت" />
              <Tab className="h-64" label="تاریخچه" />
              <Tab className="h-64" label="محصولات یا خدمات" />
              <Tab className="h-64" label="اطلاعات تماس" />
              <Tab className="h-64" label="گالری" />
              <Tab className="h-64" label="توضیحات مدیریت" />
              <Tab className="h-64" label="مکان روی نقشه" />
              <Tab className="h-64" label="اطلاعات بیشتر" />
              <Tab className="h-64" label="آرشیوها" /> 
              {/* <Tab className="h-64" label="تاریخچه نسخه‌ها" /> */}
              <Tab className="h-64" label="شرکت‌های مرتبط" /> 
              <Tab className="h-64" label="شرکت‌های رقیب" /> 
              <Tab className="h-64" label="شرکت‌های زیرمجموعه" /> 
              <Tab className="h-64" label="اعلان‌ها" /> 
              <Tab className="h-64" label="تبلیغات" /> 
            </Tabs>
            <div className="p-16 sm:p-24 w-full">
              <Suspense fallback={<FuseLoading />}>
                {tabValue === 0 && <BasicInfoTab />}
                {tabValue === 1 && <HistoryTab />}
                {tabValue === 2 && <ProductsAndServicesTab />}
                {tabValue === 3 && <ContactInfoTab />}
                {tabValue === 4 && <CompanyGalleryTab />}
                {tabValue === 5 && <ManagementDescTab />}
                {tabValue === 6 && <MapTab tabValue={tabValue} myIndex={6} />}
                {tabValue === 7 && <RegistrarTab />}
                {tabValue === 8 && <ArchivesTab />}
                {tabValue === 9 && <RelatedCompaniesTab bankType="food" relationType="related" />}
                {tabValue === 10 && <RelatedCompaniesTab bankType="food" relationType="rival" />}
                {tabValue === 11 && <RelatedCompaniesTab bankType="food" relationType="sub-company" />}
                {tabValue === 12 && <AnnouncementsTab name="additionalInfo.announcements" />}
                {tabValue === 13 && <AdvertisementsTab name="additionalInfo.advertisements" />}
              </Suspense>
            </div>
          </>
        }
        scroll={isMobile ? "normal" : "content"}
      />
    </FormProvider>
  );
}

export default Company;
