import { Language } from '../types/modules';

export interface Translations {
  appName: string;
  appSubtitle: string;
  dashboardTitle: string;
  smartAdminModules: string;
  sectionSubtitle: string;
  searchPlaceholder: string;
  systemStatus: string;
  allSystemsOperational: string;
  totalPendingTasks: string;
  quickActions: string;
  slaBreachAlert: string;
  navHome: string;
  navTasks: string;
  navNotifications: string;
  navProfile: string;
  viewAll: string;
  addNew: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  confirm: string;
  exportData: string;
  filterBy: string;
  allStatus: string;
  status: string;
  priority: string;
  actions: string;
  back: string;
  noRecordsFound: string;
  deleteConfirmTitle: string;
  deleteConfirmMsg: string;
  successCreated: string;
  successUpdated: string;
  successDeleted: string;
  hardwareDisclosure: string;
  languageSelect: string;
  themeToggle: string;
  lightMode: string;
  darkMode: string;

  // Modules titles & descriptions
  modules: {
    facility: { title: string; desc: string; tag: string };
    visitor: { title: string; desc: string; tag: string };
    transport: { title: string; desc: string; tag: string };
    asset: { title: string; desc: string; tag: string };
    vendor: { title: string; desc: string; tag: string };
    meeting: { title: string; desc: string; tag: string };
    gatepass: { title: string; desc: string; tag: string };
    housekeeping: { title: string; desc: string; tag: string };
    utilities: { title: string; desc: string; tag: string };
    cafeteria: { title: string; desc: string; tag: string };
    document: { title: string; desc: string; tag: string };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "ADMIN AI",
    appSubtitle: "Smart Admin Department",
    dashboardTitle: "Enterprise Admin Hub",
    smartAdminModules: "Section 2 – Admin AI Modules",
    sectionSubtitle: "11 Autonomous Smart Agents orchestrating operations",
    searchPlaceholder: "Search complaints, passes, rooms, assets...",
    systemStatus: "Department Health",
    allSystemsOperational: "All 11 Modules Active",
    totalPendingTasks: "Action Items",
    quickActions: "Quick Dispatch",
    slaBreachAlert: "Active SLA Watchdog",
    navHome: "Home",
    navTasks: "Tasks",
    navNotifications: "Alerts",
    navProfile: "Profile",
    viewAll: "View All",
    addNew: "Add Entry",
    edit: "Edit",
    delete: "Delete",
    save: "Save Changes",
    cancel: "Cancel",
    confirm: "Confirm",
    exportData: "Export CSV / Report",
    filterBy: "Filter By Status",
    allStatus: "All Records",
    status: "Status",
    priority: "Priority",
    actions: "Actions",
    back: "Back",
    noRecordsFound: "No entries recorded yet. Tap '+ Add Entry' to record.",
    deleteConfirmTitle: "Confirm Record Deletion",
    deleteConfirmMsg: "Are you sure you want to permanently delete this item? This action will be logged in the audit trail.",
    successCreated: "New record registered successfully",
    successUpdated: "Record successfully updated",
    successDeleted: "Record deleted from database",
    hardwareDisclosure: "Hardware Disclosures: Optical QR/Barcode scanning & Facial Recognition use device interfaces. Enterprise integrations require hardware camera APIs.",
    languageSelect: "Language / भाषा / भाषा",
    themeToggle: "Theme Mode",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    modules: {
      facility: {
        title: "Facility Maintenance AI",
        desc: "Complaint logging, auto-ticket assignment, SLA escalation & vendor dispatch.",
        tag: "Tickets & SLAs"
      },
      visitor: {
        title: "Visitor Management AI",
        desc: "Pre-approval, digital registration, Face/QR entry gate pass verification.",
        tag: "Access Control"
      },
      transport: {
        title: "Transport Management AI",
        desc: "Fleet allocation, route logistics, driver roster & passenger trip tracking.",
        tag: "Fleet & Routes"
      },
      asset: {
        title: "Asset Management AI",
        desc: "Asset tagging, QR codes, departmental transfers & depreciation lifecycle.",
        tag: "Tags & QR"
      },
      vendor: {
        title: "Vendor Management AI",
        desc: "Vendor directory, AMC renewal watch, PO follow-ups & invoice auditing.",
        tag: "AMC & Contracts"
      },
      meeting: {
        title: "Meeting Room AI",
        desc: "Smart room reservation, live occupancy calendar, in-app sync & check-in.",
        tag: "Schedules & Rooms"
      },
      gatepass: {
        title: "Gate Pass AI",
        desc: "Material inward/outward digital passes, multi-level approval & QR validation.",
        tag: "Material & Entry"
      },
      housekeeping: {
        title: "Housekeeping & Facility AI",
        desc: "Shift task distribution, sanitation checklists & supervisor sign-offs.",
        tag: "Hygiene & Checks"
      },
      utilities: {
        title: "Utilities & Energy AI",
        desc: "Electricity, water & DG meters, consumption spike alerts & cost tracking.",
        tag: "Power & Meters"
      },
      cafeteria: {
        title: "Cafeteria AI",
        desc: "Daily meal headcount, catering consumption logs & food wastage reduction.",
        tag: "Meals & Waste"
      },
      document: {
        title: "Document AI",
        desc: "Smart document repository, automated OCR text extraction & metadata search.",
        tag: "OCR & Contracts"
      }
    }
  },
  hi: {
    appName: "एडमिन AI",
    appSubtitle: "स्मार्ट प्रशासनिक विभाग",
    dashboardTitle: "उद्यम प्रशासनिक केंद्र",
    smartAdminModules: "अनुभाग 2 – एडमिन AI मॉड्यूल",
    sectionSubtitle: "11 स्वायत्त स्मार्ट एजेंट परिचालन का प्रबंधन कर रहे हैं",
    searchPlaceholder: "शिकायतें, पास, कक्ष, संपत्तियां खोजें...",
    systemStatus: "विभाग की स्थिति",
    allSystemsOperational: "सभी 11 मॉड्यूल सक्रिय हैं",
    totalPendingTasks: "लंबित कार्य",
    quickActions: "त्वरित कार्रवाई",
    slaBreachAlert: "सक्रिय एसएलए निगरानी",
    navHome: "होम",
    navTasks: "कार्य",
    navNotifications: "अलर्ट",
    navProfile: "प्रोफ़ाइल",
    viewAll: "सभी देखें",
    addNew: "नया जोड़ें",
    edit: "संपादित करें",
    delete: "हटाएं",
    save: "सहेजें",
    cancel: "रद्द करें",
    confirm: "पुष्टि करें",
    exportData: "रिपोर्ट निर्यात करें",
    filterBy: "स्थिति अनुसार फ़िल्टर",
    allStatus: "सभी रिकॉर्ड",
    status: "स्थिति",
    priority: "प्राथमिकता",
    actions: "कार्रवाई",
    back: "वापस जाएं",
    noRecordsFound: "कोई रिकॉर्ड नहीं मिला। नया रिकॉर्ड दर्ज करने के लिए ऊपर टैप करें।",
    deleteConfirmTitle: "रिकॉर्ड हटाने की पुष्टि",
    deleteConfirmMsg: "क्या आप वाकई इस आइटम को हटाना चाहते हैं? यह क्रिया ऑडिट लॉग में दर्ज की जाएगी।",
    successCreated: "नया रिकॉर्ड सफलतापूर्वक जोड़ा गया",
    successUpdated: "रिकॉर्ड सफलतापूर्वक अद्यतन किया गया",
    successDeleted: "रिकॉर्ड सफलतापूर्वक हटा दिया गया",
    hardwareDisclosure: "हार्डवेयर प्रकटीकरण: ऑप्टिकल स्कैनर और फेस रिकग्निशन डिवाइस इंटरफेस पर निर्भर करते हैं।",
    languageSelect: "भाषा चुनें",
    themeToggle: "थीम मोड",
    lightMode: "लाइट मोड",
    darkMode: "डार्क मोड",
    modules: {
      facility: {
        title: "सुविधा रखरखाव AI",
        desc: "शिकायत पंजीकरण, टिकट निर्माण, कार्य आवंटन एवं एसएलए निगरानी।",
        tag: "टिकट एवं एसएलए"
      },
      visitor: {
        title: "आगंतुक प्रबंधन AI",
        desc: "पूर्व-स्वीकृति, आगंतुक पंजीकरण, फेस/क्यूआर चेक-इन एवं गेट सुरक्षा।",
        tag: "प्रवेश नियंत्रण"
      },
      transport: {
        title: "परिवहन प्रबंधन AI",
        desc: "वाहन आवंटन, रूट योजना, चालक प्रबंधन एवं यात्रा ट्रैकिंग।",
        tag: "वाहन एवं मार्ग"
      },
      asset: {
        title: "संपत्ति प्रबंधन AI",
        desc: "संपत्ति पंजीकरण, क्यूआर कोड, आवंटन एवं जीवनचक्र प्रबंधन।",
        tag: "टैग एवं क्यूआर"
      },
      vendor: {
        title: "विक्रेता प्रबंधन AI",
        desc: "विक्रेता पंजीकरण, एएमसी नवीनीकरण, पीओ एवं चालान ट्रैकिंग।",
        tag: "एएमसी एवं अनुबंध"
      },
      meeting: {
        title: "मीटिंग रूम AI",
        desc: "कक्ष बुकिंग, उपलब्धता कैलेंडर, कैलेंडर सिंक एवं ऑटो चेक-इन।",
        tag: "शेड्यूल एवं कक्ष"
      },
      gatepass: {
        title: "गेट पास AI",
        desc: "डिजिटल गेट पास अनुरोध, अनुमोदन वर्कफ़्लो एवं क्यूआर सत्यापन।",
        tag: "सामग्री व प्रवेश"
      },
      housekeeping: {
        title: "हाउसकीपिंग एवं स्वच्छता AI",
        desc: "कार्य आवंटन, दैनिक चेकलिस्ट, पर्यवेक्षण एवं पूर्णता ट्रैकिंग।",
        tag: "स्वच्छता जाँच"
      },
      utilities: {
        title: "उपयोगिता एवं ऊर्जा AI",
        desc: "बिजली और पानी की निगरानी, मीटर रीडिंग, अलर्ट एवं लागत नियंत्रण।",
        tag: "ऊर्जा व मीटर"
      },
      cafeteria: {
        title: "कैफेटेरिया AI",
        desc: "दैनिक भोजन खपत, आहार रिकॉर्ड एवं भोजन बर्बादी नियंत्रण।",
        tag: "भोजन व बर्बादी"
      },
      document: {
        title: "दस्तावेज़ AI",
        desc: "दस्तावेज़ प्रबंधन, ओसीआर निष्कर्षण, स्मार्ट खोज एवं पूर्वावलोकन।",
        tag: "ओसीआर एवं अनुबंध"
      }
    }
  },
  mr: {
    appName: "अ‍ॅडमिन AI",
    appSubtitle: "स्मार्ट प्रशासकीय विभाग",
    dashboardTitle: "उद्योग प्रशासकीय केंद्र",
    smartAdminModules: "विभाग २ – अ‍ॅडमिन AI मॉड्यूल्स",
    sectionSubtitle: "११ स्मार्ट एजंट्स द्वारे स्वयंचलित प्रशासन व्यवस्थापन",
    searchPlaceholder: "तक्रारी, गेट पास, खोल्या, मालमत्ता शोधा...",
    systemStatus: "विभागाची स्थिती",
    allSystemsOperational: "सर्व ११ मॉड्यूल्स कार्यरत आहेत",
    totalPendingTasks: "प्रलंबित कामे",
    quickActions: "जलद कृती",
    slaBreachAlert: "सक्रिय एसएलए देखरेख",
    navHome: "मुख्यपृष्ठ",
    navTasks: "कामे",
    navNotifications: "सूचना",
    navProfile: "माहिती",
    viewAll: "सर्व पहा",
    addNew: "नवीन नोंद",
    edit: "संपादित करा",
    delete: "हटवा",
    save: "जतन करा",
    cancel: "रद्द करा",
    confirm: "पुष्टी करा",
    exportData: "अहवाल डाउनलोड करा",
    filterBy: "स्थितीनुसार फिल्टर",
    allStatus: "सर्व नोंदी",
    status: "स्थिती",
    priority: "प्राधान्य",
    actions: "कृती",
    back: "मागे जा",
    noRecordsFound: "कोणतीही नोंद उपलब्ध नाही. नवीन जोडण्यासाठी वरील बटण दाबा.",
    deleteConfirmTitle: "नोंद हटवण्याची पुष्टी",
    deleteConfirmMsg: "तुम्हाला ही नोंद कायमची हटवायची आहे का? ही क्रिया ऑडिट लॉगमध्ये नोंदवली जाईल.",
    successCreated: "नवीन नोंद यशस्वीरीत्या जतन केली गेली",
    successUpdated: "नोंद यशस्वीरीत्या अद्ययावत केली गेली",
    successDeleted: "नोंद यशस्वीरीत्या हटवली गेली",
    hardwareDisclosure: "हार्डवेअर प्रकटीकरण: क्यूआर स्कॅनर आणि फेस आयडी डिव्हाइस कॅमेरावर अवलंबून आहेत.",
    languageSelect: "भाषा निवडा",
    themeToggle: "थीम मोड",
    lightMode: "लाईट मोड",
    darkMode: "डार्क मोड",
    modules: {
      facility: {
        title: "सुविधा देखभाल AI",
        desc: "तक्रार नोंदणी, तिकीट ट्रॅकिंग, काम वाटप आणि एसएलए मॉनिटरिंग.",
        tag: "तिकीट व एसएलए"
      },
      visitor: {
        title: "अभ्यागत व्यवस्थापन AI",
        desc: "पूर्व-मंजुरी, अभ्यागत नोंदणी, फेस/क्यूआर चेक-इन आणि गेट व्यवस्थापन.",
        tag: "प्रवेश नियंत्रण"
      },
      transport: {
        title: "वाहतूक व्यवस्थापन AI",
        desc: "वाहन वाटप, मार्ग नियोजन, चालक व्यवस्थापन आणि सहल ट्रॅकिंग.",
        tag: "वाहन व मार्ग"
      },
      asset: {
        title: "मालमत्ता व्यवस्थापन AI",
        desc: "मालमत्ता नोंदणी, क्यूआर कोड, हस्तांतरण आणि जीवनचक्र व्यवस्थापन.",
        tag: "टॅग व क्यूआर"
      },
      vendor: {
        title: "विक्रेता व्यवस्थापन AI",
        desc: "विक्रेता नोंदणी, एएमसी नूतनीकरण, पीओ आणि इनव्हॉइस ट्रॅकिंग.",
        tag: "एएमसी व कंत्राट"
      },
      meeting: {
        title: "बैठक कक्ष AI",
        desc: "खोली बुकिंग, उपलब्धता दिनदर्शिका, कॅलेंडर सिंक आणि ऑटो चेक-इन.",
        tag: "वेळापत्रक व कक्ष"
      },
      gatepass: {
        title: "गेट पास AI",
        desc: "साहित्य इनवर्ड/आउटवर्ड डिजिटल पास, मंजुरी वर्कफ्लो आणि क्यूआर पडताळणी.",
        tag: "साहित्य व प्रवेश"
      },
      housekeeping: {
        title: "हाउसकीपिंग आणि स्वच्छता AI",
        desc: "कामाचे वाटप, दैनंदिन चेकलिस्ट, पर्यवेक्षण आणि पूर्णता ट्रॅकिंग.",
        tag: "स्वच्छता तपासणी"
      },
      utilities: {
        title: "ऊर्जा व उपयुक्तता AI",
        desc: "वीज आणि पाण्याचे निरीक्षण, मीटर रीडिंग, अलर्ट आणि खर्च नियंत्रण.",
        tag: "ऊर्जा व मीटर"
      },
      cafeteria: {
        title: "कॅफेटेरिया AI",
        desc: "दैनंदिन जेवण संख्या, आहार नोंदी आणि अन्न वाया जाण्यावर नियंत्रण.",
        tag: "अन्न व बचत"
      },
      document: {
        title: "दस्तऐवज AI",
        desc: "दस्तऐवज व्यवस्थापन, ओसीआर मजकूर काढणे, शोध आणि पूर्वावलोकन.",
        tag: "ओसीआर व कंत्राट"
      }
    }
  }
};
