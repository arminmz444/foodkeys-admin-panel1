import _ from "@lodash";

/**
 * The company model with comprehensive fields matching CompanyCreateDTO structure.
 */
const CompanyModel = (data) => {
  return _.defaults(data || {}, {
    // Basic identification
    id: data?.id || _.uniqueId("company-"),
    activities: data?.activities || [],
    companyName: data?.companyName || "",
    companyNameEn: data?.companyNameEn || "",
    companyType: data?.companyType || "",
    companyTypeOther: data?.companyTypeOther || "",
    
    adminComment: data?.adminComment || "",
    // Categories and classification
    subCategoryId: data?.subCategoryId || null,
    subCategory: data?.subCategory || null,
    
    // Branding
    primaryBrand: data?.primaryBrand || "",
    mainBrand: data?.mainBrand || "",
    mainBrandEn: data?.mainBrandEn || "",
    brands: data?.brands || [],
    
    // Descriptions
    description: data?.description || "",
    history: data?.history || "",
    managementDesc: data?.managementDesc || "",
    advertisingSlogan: data?.advertisingSlogan || "",
    subjectOfActivity: data?.subjectOfActivity || "",
    
    // Establishment info
    establishDate: data?.establishDate || null,
    establishDateStr: data?.establishDateStr || "",
    activityType: data?.activityType || "",
    activityCapacity: data?.activityCapacity || "",
    
    // Classification and searchability
    companyKeyWords: data?.companyKeyWords || [],
    companyTags: data?.companyTags || [],
    
    // Physical properties
    landArea: data?.landArea || "",
    buildingArea: data?.buildingArea || "",
    
    // Key people
    ceo: data?.ceo || "",
    ceoPhoneNumber: data?.ceoPhoneNumber || "",
    owner: data?.owner || "",
    answerName: data?.answerName || "",
    
    // Staff and stakeholders
    employeesCount: data?.employeesCount || "",
    stakeholders: data?.stakeholders || [],
    companyStakeholders: data?.companyStakeholders || "",
    contacts: data?.contacts || [],
    
    // Company hierarchy
    parentCompanyId: data?.parentCompanyId || null,
    subCompanyIds: data?.subCompanyIds || [],
    
    // Products
    productTitles: data?.productTitles || "",
    outSourcedProductTitles: data?.outSourcedProductTitles || "",
    productAvailability: data?.productAvailability || "",
    rawMaterialsOrigin: data?.rawMaterialsOrigin || "",
    products: data?.products || [],
    outSourcedProducts: data?.outSourcedProducts || [],
    
    // Location data
    location: data?.location || null,
    officeLocation: data?.officeLocation || "",
    factoryLocation: data?.factoryLocation || "",
    officePoBox: data?.officePoBox || "",
    factoryPoBox: data?.factoryPoBox || "",
    officeState: data?.officeState || "",
    officeCity: data?.officeCity || "",
    factoryState: data?.factoryState || "",
    factoryCity: data?.factoryCity || "",
    industrialCity: data?.industrialCity || "",
    country: data?.country || "ایران",
    latitude: data?.latitude || null,
    longitude: data?.longitude || null,
    fullAddress: data?.fullAddress || "",
    commonName: data?.commonName || "",
    
    // For map input fields
    manualLatitude: data?.manualLatitude || "",
    manualLongitude: data?.manualLongitude || "",
    
    // Contact information
    factoryTels: data?.factoryTels || [],
    factoryFaxes: data?.factoryFaxes || [],
    officeTels: data?.officeTels || [],
    officeFaxes: data?.officeFaxes || [],
    emails: data?.emails || [],
    smsNumber: data?.smsNumber || "",
    specialLineNumber: data?.specialLineNumber || "",
    
    // Social media
    telegramId: data?.telegramId || "",
    telegramPhoneNo: data?.telegramPhoneNo || "",
    whatsAppId: data?.whatsAppId || "",
    whatsAppPhoneNo: data?.whatsAppPhoneNo || "",
    instagramId: data?.instagramId || "",
    linkedInId: data?.linkedInId || "",
    skypeId: data?.skypeId || "",
    eitaaPhoneNo: data?.eitaaPhoneNo || "",
    rubikaPhoneNo: data?.rubikaPhoneNo || "",
    website: data?.website || "",
    socialMedias: data?.socialMedias || [],
    
    // Display settings
    hasPrivatePage: data?.hasPrivatePage || false,
    miniAppIframeSource: data?.miniAppIframeSource || "",
    watermark: data?.watermark || "",
    
    // Images and media
    logo: data?.logo || "",
    backgroundImage: data?.backgroundImage || "",
    
    // Gallery file collections
    companyLogoFiles: data?.companyLogoFiles || [],
    companyBackgroundImages: data?.companyBackgroundImages || [],
    companyCertificates: data?.companyCertificates || [],
    companyGalleryDocument: data?.companyGalleryDocument || [],
    companyGalleryProduct: data?.companyGalleryProduct || [],
    companyGalleryContact: data?.companyGalleryContact || [],
    companyGalleryCatalog: data?.companyGalleryCatalog || [],
    companyGallerySlider: data?.companyGallerySlider || [],
    galleryFiles: data?.galleryFiles || [],
    
    // Registration info
    registrantId: data?.registrantId || null,
    registrantUser: data?.registrantUser || null,
    registrantUsername: data?.registrantUsername || "",
    registrantPhone: data?.registrantPhone || "",
    registrantTel: data?.registrantTel || "",
    registrant: data?.registrant || "",
    userId: data?.userId || null,
    
    // Status and metrics
    status: data?.status || "PENDING",
    visit: data?.visit || 0,
    ranking: data?.ranking || 0,
    rankingAll: data?.rankingAll || 0,
    
    // // Only keep legacy fields if there's migration needed
    // // These can be removed if not required
    // active: true,
    // image: "",
  });
};

export default CompanyModel;