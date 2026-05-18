import { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  Clock3,
  CircleAlert,
  Eye,
  Filter,
  Globe,
  Plus,
  Tag,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { label: 'Pending Review', value: 'info' },
  { label: 'Approved',       value: 'success' },
  { label: 'Action Required',value: 'danger' },
  { label: 'Draft',          value: 'neutral' },
];

const ALL_STATUS_VALUES = new Set(STATUS_OPTIONS.map((o) => o.value));

// ─── Seed / dummy data ────────────────────────────────────────────────────────
const DUMMY_LOANS = [
  { id:'APP-2026-4501', applicant:'Abebe Girma',          type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'13 May 2026, 09:45 AM', amount:'45,000',   phone:'+251912345678', region:'Oromia',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Abebe Girma',          region:'Oromia',        mobilePhone:'+251912345678', requestedAmount:'45000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-3812', applicant:'Tigist Haile',          type:'Machinery / Equipment', status:'Approved',        statusTone:'success', updated:'12 May 2026, 02:30 PM', amount:'120,000',  phone:'+251922345678', region:'Amhara',        loanTerm:'24 Months (2 Years)',   formData:{ fullName:'Tigist Haile',          region:'Amhara',        mobilePhone:'+251922345678', requestedAmount:'120000', loanDuration:'24 Months (2 Years)'  } },
  { id:'APP-2026-5573', applicant:'Mulugeta Tadesse',      type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'13 May 2026, 08:15 AM', amount:'30,000',   phone:'+251933345678', region:'SNNP',          loanTerm:'6 Months',              formData:{ fullName:'Mulugeta Tadesse',      region:'SNNP',          mobilePhone:'+251933345678', requestedAmount:'30000',  loanDuration:'6 Months'              } },
  { id:'APP-2026-7219', applicant:'Selamawit Bekele',      type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'12 May 2026, 04:00 PM', amount:'60,000',   phone:'+251944345678', region:'Tigray',        loanTerm:'18 Months',             formData:{ fullName:'Selamawit Bekele',      region:'Tigray',        mobilePhone:'+251944345678', requestedAmount:'60000',  loanDuration:'18 Months'             } },
  { id:'APP-2026-2304', applicant:'Dawit Mengistu',        type:'Machinery / Equipment', status:'Action Required', statusTone:'danger',  updated:'10 May 2026, 11:20 AM', amount:'85,000',   phone:'+251955345678', region:'Oromia',        loanTerm:'24 Months (2 Years)',   formData:{ fullName:'Dawit Mengistu',        region:'Oromia',        mobilePhone:'+251955345678', requestedAmount:'85000',  loanDuration:'24 Months (2 Years)'  } },
  { id:'APP-2026-1887', applicant:'Hirut Alemu',           type:'Input Financing',       status:'Action Required', statusTone:'danger',  updated:'09 May 2026, 03:45 PM', amount:'22,000',   phone:'+251966345678', region:'Amhara',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Hirut Alemu',           region:'Amhara',        mobilePhone:'+251966345678', requestedAmount:'22000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-6640', applicant:'Yonas Tekeste',         type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'11 May 2026, 10:05 AM', amount:'50,000',   phone:'+251977345678', region:'Oromia',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Yonas Tekeste',         region:'Oromia',        mobilePhone:'+251977345678', requestedAmount:'50000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-9034', applicant:'Chaltu Wakjira',        type:'Machinery / Equipment', status:'Draft',           statusTone:'neutral', updated:'08 May 2026, 09:00 AM', amount:'95,000',   phone:'+251988345678', region:'Oromia',        loanTerm:'36 Months (3 Years)',   formData:{ fullName:'Chaltu Wakjira',        region:'Oromia',        mobilePhone:'+251988345678', requestedAmount:'95000',  loanDuration:'36 Months (3 Years)'   } },
  { id:'APP-2026-8102', applicant:'Zerihun Kebede',        type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'07 May 2026, 01:15 PM', amount:'38,000',   phone:'+251999345678', region:'Oromia',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Zerihun Kebede',        region:'Oromia',        mobilePhone:'+251999345678', requestedAmount:'38000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-3341', applicant:'Alemitu Tesfaye',       type:'Machinery / Equipment', status:'Pending Review',  statusTone:'info',    updated:'06 May 2026, 11:30 AM', amount:'74,000',   phone:'+251900345678', region:'SNNP',          loanTerm:'24 Months (2 Years)',   formData:{ fullName:'Alemitu Tesfaye',       region:'SNNP',          mobilePhone:'+251900345678', requestedAmount:'74000',  loanDuration:'24 Months (2 Years)'  } },
  { id:'APP-2026-1123', applicant:'Belayneh Assefa',       type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'05 May 2026, 10:00 AM', amount:'55,000',   phone:'+251911111111', region:'Oromia',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Belayneh Assefa',       region:'Oromia',        mobilePhone:'+251911111111', requestedAmount:'55000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-2290', applicant:'Mekdes Worku',          type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'04 May 2026, 02:15 PM', amount:'28,500',   phone:'+251922222222', region:'Amhara',        loanTerm:'6 Months',              formData:{ fullName:'Mekdes Worku',          region:'Amhara',        mobilePhone:'+251922222222', requestedAmount:'28500',  loanDuration:'6 Months'              } },
  { id:'APP-2026-7730', applicant:'Teshome Kifle',         type:'Machinery / Equipment', status:'Approved',        statusTone:'success', updated:'03 May 2026, 09:30 AM', amount:'200,000',  phone:'+251933333333', region:'Oromia',        loanTerm:'36 Months (3 Years)',   formData:{ fullName:'Teshome Kifle',         region:'Oromia',        mobilePhone:'+251933333333', requestedAmount:'200000', loanDuration:'36 Months (3 Years)'   } },
  { id:'APP-2026-4417', applicant:'Frehiwot Gebru',        type:'Input Financing',       status:'Action Required', statusTone:'danger',  updated:'02 May 2026, 03:50 PM', amount:'18,000',   phone:'+251944444444', region:'Tigray',        loanTerm:'6 Months',              formData:{ fullName:'Frehiwot Gebru',        region:'Tigray',        mobilePhone:'+251944444444', requestedAmount:'18000',  loanDuration:'6 Months'              } },
  { id:'APP-2026-5881', applicant:'Fikadu Negash',         type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'01 May 2026, 11:10 AM', amount:'42,000',   phone:'+251955555555', region:'SNNP',          loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Fikadu Negash',         region:'SNNP',          mobilePhone:'+251955555555', requestedAmount:'42000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-6654', applicant:'Kidane Habtezion',      type:'Machinery / Equipment', status:'Draft',           statusTone:'neutral', updated:'30 Apr 2026, 08:45 AM', amount:'160,000',  phone:'+251966666666', region:'Tigray',        loanTerm:'36 Months (3 Years)',   formData:{ fullName:'Kidane Habtezion',      region:'Tigray',        mobilePhone:'+251966666666', requestedAmount:'160000', loanDuration:'36 Months (3 Years)'   } },
  { id:'APP-2026-3909', applicant:'Amarech Desta',         type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'29 Apr 2026, 01:00 PM', amount:'33,000',   phone:'+251977777777', region:'Amhara',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Amarech Desta',         region:'Amhara',        mobilePhone:'+251977777777', requestedAmount:'33000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-8844', applicant:'Solomon Tesfaye',       type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'28 Apr 2026, 04:30 PM', amount:'47,500',   phone:'+251988888888', region:'Oromia',        loanTerm:'18 Months',             formData:{ fullName:'Solomon Tesfaye',       region:'Oromia',        mobilePhone:'+251988888888', requestedAmount:'47500',  loanDuration:'18 Months'             } },
  { id:'APP-2026-2775', applicant:'Meseret Abebe',         type:'Machinery / Equipment', status:'Action Required', statusTone:'danger',  updated:'27 Apr 2026, 10:20 AM', amount:'110,000',  phone:'+251999999999', region:'SNNP',          loanTerm:'24 Months (2 Years)',   formData:{ fullName:'Meseret Abebe',         region:'SNNP',          mobilePhone:'+251999999999', requestedAmount:'110000', loanDuration:'24 Months (2 Years)'  } },
  { id:'APP-2026-1468', applicant:'Girma Wolde',           type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'26 Apr 2026, 09:15 AM', amount:'40,000',   phone:'+251911223344', region:'Oromia',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Girma Wolde',           region:'Oromia',        mobilePhone:'+251911223344', requestedAmount:'40000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-7553', applicant:'Alem Hailu',            type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'25 Apr 2026, 02:45 PM', amount:'25,000',   phone:'+251922334455', region:'Amhara',        loanTerm:'6 Months',              formData:{ fullName:'Alem Hailu',            region:'Amhara',        mobilePhone:'+251922334455', requestedAmount:'25000',  loanDuration:'6 Months'              } },
  { id:'APP-2026-9921', applicant:'Tsehay Lemma',          type:'Machinery / Equipment', status:'Approved',        statusTone:'success', updated:'24 Apr 2026, 11:00 AM', amount:'175,000',  phone:'+251933445566', region:'Oromia',        loanTerm:'36 Months (3 Years)',   formData:{ fullName:'Tsehay Lemma',          region:'Oromia',        mobilePhone:'+251933445566', requestedAmount:'175000', loanDuration:'36 Months (3 Years)'   } },
  { id:'APP-2026-4362', applicant:'Tesfaye Darge',         type:'Input Financing',       status:'Draft',           statusTone:'neutral', updated:'23 Apr 2026, 03:20 PM', amount:'35,000',   phone:'+251944556677', region:'SNNP',          loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Tesfaye Darge',         region:'SNNP',          mobilePhone:'+251944556677', requestedAmount:'35000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-6089', applicant:'Hiwot Seyoum',          type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'22 Apr 2026, 08:30 AM', amount:'52,000',   phone:'+251955667788', region:'Tigray',        loanTerm:'18 Months',             formData:{ fullName:'Hiwot Seyoum',          region:'Tigray',        mobilePhone:'+251955667788', requestedAmount:'52000',  loanDuration:'18 Months'             } },
  { id:'APP-2026-3517', applicant:'Dereje Bekele',         type:'Machinery / Equipment', status:'Approved',        statusTone:'success', updated:'21 Apr 2026, 01:45 PM', amount:'145,000',  phone:'+251966778899', region:'Amhara',        loanTerm:'24 Months (2 Years)',   formData:{ fullName:'Dereje Bekele',         region:'Amhara',        mobilePhone:'+251966778899', requestedAmount:'145000', loanDuration:'24 Months (2 Years)'  } },
  { id:'APP-2026-8730', applicant:'Almaz Kassahun',        type:'Input Financing',       status:'Action Required', statusTone:'danger',  updated:'20 Apr 2026, 10:00 AM', amount:'19,500',   phone:'+251977889900', region:'Oromia',        loanTerm:'6 Months',              formData:{ fullName:'Almaz Kassahun',        region:'Oromia',        mobilePhone:'+251977889900', requestedAmount:'19500',  loanDuration:'6 Months'              } },
  { id:'APP-2026-5246', applicant:'Habtamu Tola',          type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'19 Apr 2026, 04:10 PM', amount:'43,000',   phone:'+251988990011', region:'SNNP',          loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Habtamu Tola',          region:'SNNP',          mobilePhone:'+251988990011', requestedAmount:'43000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-2163', applicant:'Wondwossen Alemu',      type:'Machinery / Equipment', status:'Draft',           statusTone:'neutral', updated:'18 Apr 2026, 09:00 AM', amount:'88,000',   phone:'+251999001122', region:'Amhara',        loanTerm:'24 Months (2 Years)',   formData:{ fullName:'Wondwossen Alemu',      region:'Amhara',        mobilePhone:'+251999001122', requestedAmount:'88000',  loanDuration:'24 Months (2 Years)'  } },
  { id:'APP-2026-7489', applicant:'Liya Tadesse',          type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'17 Apr 2026, 11:30 AM', amount:'36,000',   phone:'+251911234567', region:'Oromia',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Liya Tadesse',          region:'Oromia',        mobilePhone:'+251911234567', requestedAmount:'36000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-9302', applicant:'Biruk Abay',            type:'Machinery / Equipment', status:'Pending Review',  statusTone:'info',    updated:'16 Apr 2026, 02:00 PM', amount:'130,000',  phone:'+251922345678', region:'Tigray',        loanTerm:'36 Months (3 Years)',   formData:{ fullName:'Biruk Abay',            region:'Tigray',        mobilePhone:'+251922345678', requestedAmount:'130000', loanDuration:'36 Months (3 Years)'   } },
  { id:'APP-2026-4074', applicant:'Tigabu Gebre',          type:'Input Financing',       status:'Action Required', statusTone:'danger',  updated:'15 Apr 2026, 03:15 PM', amount:'27,000',   phone:'+251933456789', region:'Amhara',        loanTerm:'18 Months',             formData:{ fullName:'Tigabu Gebre',          region:'Amhara',        mobilePhone:'+251933456789', requestedAmount:'27000',  loanDuration:'18 Months'             } },
  { id:'APP-2026-6811', applicant:'Selam Gebremariam',     type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'14 Apr 2026, 10:45 AM', amount:'49,000',   phone:'+251944567890', region:'Tigray',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Selam Gebremariam',     region:'Tigray',        mobilePhone:'+251944567890', requestedAmount:'49000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-3648', applicant:'Eyob Zewdie',           type:'Machinery / Equipment', status:'Pending Review',  statusTone:'info',    updated:'13 Apr 2026, 01:30 PM', amount:'92,000',   phone:'+251955678901', region:'Oromia',        loanTerm:'24 Months (2 Years)',   formData:{ fullName:'Eyob Zewdie',           region:'Oromia',        mobilePhone:'+251955678901', requestedAmount:'92000',  loanDuration:'24 Months (2 Years)'  } },
  { id:'APP-2026-1955', applicant:'Yeshi Alemu',           type:'Input Financing',       status:'Draft',           statusTone:'neutral', updated:'12 Apr 2026, 09:00 AM', amount:'21,000',   phone:'+251966789012', region:'SNNP',          loanTerm:'6 Months',              formData:{ fullName:'Yeshi Alemu',           region:'SNNP',          mobilePhone:'+251966789012', requestedAmount:'21000',  loanDuration:'6 Months'              } },
  { id:'APP-2026-8567', applicant:'Negash Getu',           type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'11 Apr 2026, 04:00 PM', amount:'58,000',   phone:'+251977890123', region:'Oromia',        loanTerm:'18 Months',             formData:{ fullName:'Negash Getu',           region:'Oromia',        mobilePhone:'+251977890123', requestedAmount:'58000',  loanDuration:'18 Months'             } },
  { id:'APP-2026-5393', applicant:'Wubit Haile',           type:'Machinery / Equipment', status:'Action Required', statusTone:'danger',  updated:'10 Apr 2026, 11:15 AM', action: 'View', amount:'105,000',  phone:'+251988901234', region:'Amhara',        loanTerm:'24 Months (2 Years)',   formData:{ fullName:'Wubit Haile',           region:'Amhara',        mobilePhone:'+251988901234', requestedAmount:'105000', loanDuration:'24 Months (2 Years)'  } },
  { id:'APP-2026-7110', applicant:'Belete Tefera',         type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'09 Apr 2026, 02:30 PM', amount:'32,500',   phone:'+251999012345', region:'SNNP',          loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Belete Tefera',         region:'SNNP',          mobilePhone:'+251999012345', requestedAmount:'32500',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-2844', applicant:'Shewit Fisseha',        type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'08 Apr 2026, 10:00 AM', amount:'41,000',   phone:'+251911122233', region:'Tigray',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Shewit Fisseha',        region:'Tigray',        mobilePhone:'+251911122233', requestedAmount:'41000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-6432', applicant:'Kassa Abera',           type:'Machinery / Equipment', status:'Pending Review',  statusTone:'info',    updated:'07 Apr 2026, 01:15 PM', amount:'115,000',  phone:'+251922233344', region:'Oromia',        loanTerm:'36 Months (3 Years)',   formData:{ fullName:'Kassa Abera',           region:'Oromia',        mobilePhone:'+251922233344', requestedAmount:'115000', loanDuration:'36 Months (3 Years)'   } },
  { id:'APP-2026-4760', applicant:'Genet Yilma',           type:'Input Financing',       status:'Draft',           statusTone:'neutral', updated:'06 Apr 2026, 09:45 AM', amount:'29,000',   phone:'+251933344455', region:'Amhara',        loanTerm:'6 Months',              formData:{ fullName:'Genet Yilma',           region:'Amhara',        mobilePhone:'+251933344455', requestedAmount:'29000',  loanDuration:'6 Months'              } },
  { id:'APP-2026-9577', applicant:'Tsegay Berhe',          type:'Input Financing',       status:'Action Required', statusTone:'danger',  updated:'05 Apr 2026, 03:00 PM', amount:'23,500',   phone:'+251944455566', region:'Tigray',        loanTerm:'18 Months',             formData:{ fullName:'Tsegay Berhe',          region:'Tigray',        mobilePhone:'+251944455566', requestedAmount:'23500',  loanDuration:'18 Months'             } },
  { id:'APP-2026-3285', applicant:'Maryam Abdulahi',       type:'Machinery / Equipment', status:'Approved',        statusTone:'success', updated:'04 Apr 2026, 11:00 AM', amount:'180,000',  phone:'+251955566677', region:'Afar',          loanTerm:'36 Months (3 Years)',   formData:{ fullName:'Maryam Abdulahi',       region:'Afar',          mobilePhone:'+251955566677', requestedAmount:'180000', loanDuration:'36 Months (3 Years)'   } },
  { id:'APP-2026-1644', applicant:'Bisrat Getachew',       type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'03 Apr 2026, 02:30 PM', amount:'39,000',   phone:'+251966677788', region:'Oromia',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Bisrat Getachew',       region:'Oromia',        mobilePhone:'+251966677788', requestedAmount:'39000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-8379', applicant:'Yimam Dessie',          type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'02 Apr 2026, 10:15 AM', amount:'53,000',   phone:'+251977788899', region:'Amhara',        loanTerm:'18 Months',             formData:{ fullName:'Yimam Dessie',          region:'Amhara',        mobilePhone:'+251977788899', requestedAmount:'53000',  loanDuration:'18 Months'             } },
  { id:'APP-2026-5098', applicant:'Tigabu Hailu',          type:'Machinery / Equipment', status:'Pending Review',  statusTone:'info',    updated:'01 Apr 2026, 04:00 PM', amount:'98,000',   phone:'+251988899900', region:'SNNP',          loanTerm:'24 Months (2 Years)',   formData:{ fullName:'Tigabu Hailu',          region:'SNNP',          mobilePhone:'+251988899900', requestedAmount:'98000',  loanDuration:'24 Months (2 Years)'  } },
  { id:'APP-2026-7816', applicant:'Addis Alem Bekele',     type:'Input Financing',       status:'Draft',           statusTone:'neutral', updated:'31 Mar 2026, 09:00 AM', amount:'26,000',   phone:'+251999900011', region:'Oromia',        loanTerm:'6 Months',              formData:{ fullName:'Addis Alem Bekele',     region:'Oromia',        mobilePhone:'+251999900011', requestedAmount:'26000',  loanDuration:'6 Months'              } },
  { id:'APP-2026-4534', applicant:'Tadesse Woldemichael',  type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'30 Mar 2026, 01:30 PM', amount:'44,500',   phone:'+251911001100', region:'Amhara',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Tadesse Woldemichael',  region:'Amhara',        mobilePhone:'+251911001100', requestedAmount:'44500',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-6247', applicant:'Sara Nega',             type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'29 Mar 2026, 10:45 AM', amount:'31,000',   phone:'+251922002200', region:'Tigray',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Sara Nega',             region:'Tigray',        mobilePhone:'+251922002200', requestedAmount:'31000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-3062', applicant:'Mihret Habtom',         type:'Machinery / Equipment', status:'Action Required', statusTone:'danger',  updated:'28 Mar 2026, 03:00 PM', amount:'135,000',  phone:'+251933003300', region:'Tigray',        loanTerm:'36 Months (3 Years)',   formData:{ fullName:'Mihret Habtom',         region:'Tigray',        mobilePhone:'+251933003300', requestedAmount:'135000', loanDuration:'36 Months (3 Years)'   } },
  { id:'APP-2026-9185', applicant:'Robel Mehari',          type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'27 Mar 2026, 11:00 AM', amount:'62,000',   phone:'+251944004400', region:'Oromia',        loanTerm:'18 Months',             formData:{ fullName:'Robel Mehari',          region:'Oromia',        mobilePhone:'+251944004400', requestedAmount:'62000',  loanDuration:'18 Months'             } },
  { id:'APP-2026-5831', applicant:'Azeb Gebre',            type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'26 Mar 2026, 02:15 PM', amount:'34,000',   phone:'+251955005500', region:'Amhara',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Azeb Gebre',            region:'Amhara',        mobilePhone:'+251955005500', requestedAmount:'34000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-2649', applicant:'Henok Araya',           type:'Machinery / Equipment', status:'Draft',           statusTone:'neutral', updated:'25 Mar 2026, 09:30 AM', amount:'78,000',   phone:'+251966006600', region:'Tigray',        loanTerm:'24 Months (2 Years)',   formData:{ fullName:'Henok Araya',           region:'Tigray',        mobilePhone:'+251966006600', requestedAmount:'78000',  loanDuration:'24 Months (2 Years)'  } },
  { id:'APP-2026-7463', applicant:'Fikirte Mamo',          type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'24 Mar 2026, 01:00 PM', amount:'46,000',   phone:'+251977007700', region:'SNNP',          loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Fikirte Mamo',          region:'SNNP',          mobilePhone:'+251977007700', requestedAmount:'46000',  loanDuration:'12 Months (1 Year)'    } },
  { id:'APP-2026-4210', applicant:'Kinfe Tesfamariam',     type:'Input Financing',       status:'Action Required', statusTone:'danger',  updated:'23 Mar 2026, 04:30 PM', amount:'17,500',   phone:'+251988008800', region:'Tigray',        loanTerm:'6 Months',              formData:{ fullName:'Kinfe Tesfamariam',     region:'Tigray',        mobilePhone:'+251988008800', requestedAmount:'17500',  loanDuration:'6 Months'              } },
  { id:'APP-2026-6921', applicant:'Worknesh Tessema',      type:'Machinery / Equipment', status:'Pending Review',  statusTone:'info',    updated:'22 Mar 2026, 10:00 AM', amount:'150,000',  phone:'+251999009900', region:'Oromia',        loanTerm:'36 Months (3 Years)',   formData:{ fullName:'Worknesh Tessema',      region:'Oromia',        mobilePhone:'+251999009900', requestedAmount:'150000', loanDuration:'36 Months (3 Years)'   } },
  { id:'APP-2026-3771', applicant:'Abiy Hailu',            type:'Input Financing',       status:'Approved',        statusTone:'success', updated:'21 Mar 2026, 02:45 PM', amount:'57,000',   phone:'+251911010101', region:'Amhara',        loanTerm:'18 Months',             formData:{ fullName:'Abiy Hailu',            region:'Amhara',        mobilePhone:'+251911010101', requestedAmount:'57000',  loanDuration:'18 Months'             } },
  { id:'APP-2026-8548', applicant:'Senait Tesfaye',        type:'Input Financing',       status:'Pending Review',  statusTone:'info',    updated:'20 Mar 2026, 09:15 AM', amount:'48,000',   phone:'+251922020202', region:'Tigray',        loanTerm:'12 Months (1 Year)',    formData:{ fullName:'Senait Tesfaye',        region:'Tigray',        mobilePhone:'+251922020202', requestedAmount:'48000',  loanDuration:'12 Months (1 Year)'    } },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizeEntry(e) {
  const fd  = e.formData || {};
  const v   = (a, b, c) => (a && a !== '—' ? a : b && b !== '—' ? b : c || '—');
  const typeMap = { input: 'Input Financing', machinery: 'Machinery / Equipment' };
  return {
    ...e,
    applicant: v(e.applicant, fd.fullName, 'Unknown Applicant'),
    type:      v(e.type, typeMap[fd.loanType] || fd.loanType, 'Agricultural Loan'),
    region:    v(e.region, fd.region, 'Oromia'),
    loanTerm:  v(e.loanTerm, fd.loanDuration, '12 Months (1 Year)'),
    amount:    (e.amount && e.amount !== '') ? e.amount : (fd.requestedAmount && fd.requestedAmount !== '') ? fd.requestedAmount : '',
  };
}

function readStoredLoans() {
  try {
    const raw  = JSON.parse(localStorage.getItem('a2c_submitted_loans') || '[]');
    const real = raw.map(normalizeEntry);
    const realIds = new Set(real.map((r) => r.id));
    const uniqueDummy = DUMMY_LOANS.filter((d) => !realIds.has(d.id));
    return [...real, ...uniqueDummy];
  } catch {
    return DUMMY_LOANS;
  }
}

function fmtDate(str) {
  if (!str) return '—';
  // Already formatted (non-ISO) — return as-is
  if (!/^\d{4}-\d{2}-\d{2}T/.test(str)) return str;
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return str; }
}

function fmtType(t) {
  if (!t) return '—';
  if (t === 'input') return 'Input Financing';
  if (t === 'machinery') return 'Machinery / Equipment';
  return t;
}

function fmtAmount(val) {
  if (!val) return '—';
  const n = parseFloat(String(val).replace(/,/g, ''));
  if (isNaN(n)) return val;
  return n.toLocaleString() + ' ETB';
}

// ─── Date-filter helpers ──────────────────────────────────────────────────────
const DATE_FILTER_OPTIONS = [
  { id: 'all',        label: 'All Time'     },
  { id: 'today',      label: 'Today'        },
  { id: 'yesterday',  label: 'Yesterday'    },
  { id: 'this_week',  label: 'This Week'    },
  { id: 'this_month', label: 'This Month'   },
  { id: 'custom',     label: 'Custom Range' },
];

const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WDAY = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function sod(d) { const r = new Date(d); r.setHours(0, 0, 0, 0); return r; }
function eod(d) { const r = new Date(d); r.setHours(23, 59, 59, 999); return r; }

function parseLoanDate(str) {
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) { const d = new Date(str); return isNaN(d.getTime()) ? null : d; }
  try { const d = new Date(str.replace(',', '')); return isNaN(d.getTime()) ? null : d; } catch { return null; }
}

// ─── Date Filter Dropdown ─────────────────────────────────────────────────────
function DateFilterDropdown({ activeFilter, customFrom, customTo, onSelect, onCustomApply }) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [pendingFrom, setPendingFrom] = useState(null);
  const [pendingTo, setPendingTo] = useState(null);
  const [step, setStep] = useState('from');
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const ref = useRef(null);

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (activeFilter !== 'custom') { setPendingFrom(null); setPendingTo(null); setStep('from'); }
  }, [activeFilter]);

  function handlePreset(id) {
    if (id !== 'custom') { onSelect(id); setOpen(false); }
    else { onSelect('custom'); setPendingFrom(null); setPendingTo(null); setStep('from'); }
  }

  function handleDayClick(day) {
    const clicked = new Date(calYear, calMonth, day);
    if (clicked > today) return;
    if (step === 'from') { setPendingFrom(clicked); setPendingTo(null); setStep('to'); }
    else {
      let f = pendingFrom, t = clicked;
      if (t < f) { f = clicked; t = pendingFrom; }
      setPendingFrom(f); setPendingTo(t); setStep('from');
    }
  }

  function prevCal() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1);
  }
  function nextCal() {
    if (calYear > today.getFullYear() || (calYear === today.getFullYear() && calMonth >= today.getMonth())) return;
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1);
  }

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const nextDisabled = calYear > today.getFullYear() || (calYear === today.getFullYear() && calMonth >= today.getMonth());

  function cellClass(day) {
    const d = new Date(calYear, calMonth, day);
    if (d > today) return 'text-gray-200 cursor-not-allowed';
    const isFrom  = pendingFrom && d.toDateString() === pendingFrom.toDateString();
    const isTo    = pendingTo   && d.toDateString() === pendingTo.toDateString();
    const inRange = pendingFrom && pendingTo && d > pendingFrom && d < pendingTo;
    if (isFrom || isTo) return 'bg-[#16A34A] text-white rounded-full';
    if (inRange)        return 'bg-[#4a7c59]/15 text-[#3a6347] rounded-sm';
    return 'hover:bg-gray-100 rounded-full cursor-pointer text-gray-700';
  }

  const activeOption = DATE_FILTER_OPTIONS.find(o => o.id === activeFilter);
  const isActive     = activeFilter !== 'all';

  function fmtCustomLabel() {
    if (!customFrom) return 'Custom Range';
    const opts = { day: '2-digit', month: 'short' };
    const f = customFrom.toLocaleDateString('en-GB', opts);
    const t = customTo ? customTo.toLocaleDateString('en-GB', opts) : f;
    return f === t ? f : f + ' – ' + t;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={'inline-flex items-center gap-1.5 px-3.5 py-3 rounded-lg text-sm font-semibold border cursor-pointer transition-all ' +
          (isActive ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50')}
      >
        <Calendar size={14} strokeWidth={2.2} />
        <span>{isActive && activeFilter === 'custom' ? fmtCustomLabel() : isActive ? activeOption?.label : 'Date Filter'}</span>
        <ChevronDown size={12} strokeWidth={2.5} className={'transition-transform duration-200 ' + (open ? 'rotate-180' : '')} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden" style={{ minWidth: '220px' }}>
          <div className="p-2 flex flex-col gap-0.5">
            {DATE_FILTER_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handlePreset(opt.id)}
                className={'flex items-center justify-between w-full px-3 py-2 rounded-xl text-[13px] font-semibold text-left cursor-pointer border-0 transition-colors ' +
                  (activeFilter === opt.id ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-transparent text-gray-700 hover:bg-gray-50')}
              >
                <span>{opt.label}</span>
                {activeFilter === opt.id && <Check size={12} strokeWidth={2.5} />}
              </button>
            ))}
          </div>

          {activeFilter === 'custom' && (
            <div className="border-t border-gray-100 p-3">
              <p className="text-center text-[11px] font-semibold text-[#16A34A] mb-2 bg-[#4a7c59]/5 rounded-lg py-1">
                {step === 'from' ? '\u2460 Pick start date' : '\u2461 Pick end date'}
              </p>
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={prevCal} className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 border-0 cursor-pointer text-gray-500 transition-colors">
                  <ChevronLeft size={14} strokeWidth={2.5} />
                </button>
                <span className="text-[12px] font-bold text-gray-800">{MONTHS_FULL[calMonth]} {calYear}</span>
                <button type="button" onClick={nextCal} disabled={nextDisabled} className={'flex items-center justify-center w-7 h-7 rounded-lg border-0 cursor-pointer transition-colors ' + (nextDisabled ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500')}>
                  <ChevronRight size={14} strokeWidth={2.5} />
                </button>
              </div>
              <div className="grid grid-cols-7 mb-1">
                {WDAY.map(d => <span key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {Array.from({ length: firstDay }).map((_, i) => <span key={'e' + i} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={'flex items-center justify-center text-[11.5px] font-medium border-0 w-full aspect-square transition-colors ' + cellClass(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {pendingFrom && (
                <div className="mt-2 text-[10.5px] text-center text-gray-500 bg-gray-50 rounded-lg py-1 px-2">
                  {pendingFrom.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {pendingTo
                    ? ' \u2192 ' + pendingTo.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : ' \u2192 ?'}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => { setPendingFrom(null); setPendingTo(null); setStep('from'); onSelect('all'); setOpen(false); }}
                  className="flex-1 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 bg-white cursor-pointer transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  disabled={!pendingFrom}
                  onClick={() => { if (pendingFrom) { onCustomApply(pendingFrom, pendingTo || pendingFrom); setOpen(false); } }}
                  className={'flex-1 py-1.5 rounded-lg text-[12px] font-semibold border-0 cursor-pointer transition-colors ' +
                    (pendingFrom ? 'bg-[#16A34A] text-white hover:bg-[#3a6347]' : 'bg-gray-100 text-gray-300 cursor-not-allowed')}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────
const FARMING_PRACTICE_LABELS = {
  usesIrrigation: 'Uses Irrigation', usesImprovedSeeds: 'Uses Improved Seeds',
  usesFertilizers: 'Uses Fertilizers', memberOfCooperative: 'Member of Cooperative',
  improvedSeeds: 'Improved Seeds', fertilizerUse: 'Fertilizer Use',
  irrigation: 'Irrigation', cropRotation: 'Crop Rotation',
  pesticides: 'Pesticides', mechanization: 'Mechanization',
};

const INCOME_FIELDS = [
  { key: 'primaryCropSales',        label: 'Primary Crop Sales' },
  { key: 'livestockSales',          label: 'Livestock Sales' },
  { key: 'secondaryCropSalesIncome',label: 'Secondary Crop Sales' },
  { key: 'farmingIncome',           label: 'Other Farming Income' },
  { key: 'offFarmWage',             label: 'Off-farm / Wage' },
  { key: 'otherIncome',             label: 'Other Income' },
];

const EXPENDITURE_FIELDS = [
  { key: 'foodLivingCosts',         label: 'Food & Living Costs' },
  { key: 'educationCost',           label: 'Education' },
  { key: 'healthCost',              label: 'Health' },
  { key: 'farmingInputsSelf',       label: 'Farming Inputs (Self)' },
  { key: 'existingDebtRepayments',  label: 'Existing Debt Repayments' },
  { key: 'existingLoanRepayments',  label: 'Existing Loan Repayments' },
  { key: 'otherExpenditure',        label: 'Other Expenditure' },
];

// ─── Small UI helpers ─────────────────────────────────────────────────────────
function F({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-[13px] font-semibold text-gray-800 leading-snug">{value || '—'}</span>
    </div>
  );
}

function StatusBadge({ tone, label }) {
  const cls = {
    info:    'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-[#16A34A] border-green-200',
    danger:  'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const dot = {
    info: 'bg-blue-500', success: 'bg-green-500', danger: 'bg-red-500', neutral: 'bg-gray-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${cls[tone] || cls.neutral}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot[tone] || dot.neutral}`} />
      {label}
    </span>
  );
}

function StepBadge({ children }) {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#4a7c59] text-white text-[10px] font-bold flex-shrink-0 leading-none">
      {children}
    </span>
  );
}

function SectionHeading({ step, children }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
      {step && <StepBadge>{step}</StepBadge>}
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 m-0 leading-none">{children}</h4>
    </div>
  );
}

function MoneyRow({ label, value, isTotal }) {
  if (isTotal) {
    return (
      <div className="flex items-center justify-between pt-2.5 mt-1 border-t-2 border-gray-200 text-[13px] font-bold text-gray-800">
        <span>{label}</span>
        <span>{value}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 text-[12.5px] last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}

/* ── Field card used inside modal sections ── */
function FC({ label, value, wide }) {
  return (
    <div className={`flex flex-col gap-1 bg-gray-50 rounded-xl px-3.5 py-3 border border-gray-100 ${wide ? 'col-span-2 sm:col-span-3' : ''}`}>
      <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-gray-400">{label}</span>
      <span className="text-[13px] font-semibold text-gray-800 leading-snug break-words">{value || '—'}</span>
    </div>
  );
}

/* ── Section card wrapper ── */
function ModalSection({ icon, title, children, accent }) {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      <div className={`flex items-center gap-2.5 px-4 py-3 ${accent || 'bg-gray-50/80 border-b border-gray-100'}`}>
        {icon && <span className="text-base leading-none">{icon}</span>}
        <h4 className="text-[11.5px] font-extrabold uppercase tracking-widest text-gray-500 m-0">{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function DetailModal({ app, onClose }) {
  const [tab, setTab] = useState('overview');
  const fd = app.formData || {};

  const activePractices = Object.entries(fd.farmingPractices || {})
    .filter(([, v]) => v)
    .map(([k]) => FARMING_PRACTICE_LABELS[k] || k);

  const totalIncome      = INCOME_FIELDS.reduce((s, f) => s + (parseFloat(fd[f.key]) || 0), 0);
  const totalExpenditure = EXPENDITURE_FIELDS.reduce((s, f) => s + (parseFloat(fd[f.key]) || 0), 0);
  const netCashFlow      = totalIncome - totalExpenditure;

  const TABS = [
    { id: 'overview',   emoji: '📋', label: 'Overview'       },
    { id: 'applicant',  emoji: '👤', label: 'Applicant'      },
    { id: 'farm',       emoji: '🌾', label: 'Farm & Crops'   },
    { id: 'loan',       emoji: '💰', label: 'Loan'           },
    { id: 'finances',   emoji: '📊', label: 'Finances'       },
    { id: 'collateral', emoji: '🏦', label: 'Collateral'     },
  ];

  const statusGradient = {
    success: 'from-emerald-500 to-green-600',
    info:    'from-blue-500 to-blue-600',
    danger:  'from-red-500 to-rose-600',
    neutral: 'from-gray-400 to-gray-500',
  };
  const statusIcon = { success: '✅', info: '⏳', danger: '⚠️', neutral: '📝' };
  const initials = (app.applicant || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const timelineSteps = [
    { label: 'Application Submitted', sub: fmtDate(app.updated || app.submittedAt), done: true,  Icon: Check        },
    { label: 'Under Agent Review',    sub: 'Awaiting Development Agent sign-off',   done: false, Icon: Clock3       },
    { label: 'Bank Assessment',       sub: 'Pending financial institution review',  done: false, Icon: CheckCircle2 },
    { label: 'Decision',              sub: 'Approval or additional info request',   done: false, Icon: CheckCircle2 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl min-h-0 bg-white rounded-3xl flex flex-col overflow-hidden shadow-2xl"
        style={{
          animation: 'modalIn .22s cubic-bezier(.22,.68,0,1.15) both',
          height: 'min(90vh, calc(100dvh - 2rem))',
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity:0; transform:scale(.96) translateY(12px); }
            to { opacity:1; transform:scale(1) translateY(0); }
          }

          .detail-modal-tabs,
          .detail-modal-body {
            scrollbar-color: #cbd5e1 transparent;
            scrollbar-width: thin;
          }

          .detail-modal-tabs::-webkit-scrollbar {
            height: 8px;
          }

          .detail-modal-body::-webkit-scrollbar {
            width: 10px;
          }

          .detail-modal-tabs::-webkit-scrollbar-track,
          .detail-modal-body::-webkit-scrollbar-track {
            background: transparent;
          }

          .detail-modal-tabs::-webkit-scrollbar-thumb,
          .detail-modal-body::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 9999px;
          }

          .detail-modal-tabs::-webkit-scrollbar-thumb:hover,
          .detail-modal-body::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>

          {/* ── Hero header ── */}
          <div className={`relative flex-shrink-0 bg-gradient-to-br ${statusGradient[app.statusTone] || statusGradient.neutral} px-6 pt-6 pb-5 overflow-hidden`}>
          {/* decorative circles */}
          <div className="pointer-events-none absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/8" />

          {/* close button */}
          <button
            className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer transition-colors"
            onClick={onClose}
          >
            <X size={15} strokeWidth={2.5} />
          </button>

          {/* avatar + meta */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 text-white text-xl font-extrabold shrink-0 border-2 border-white/30 shadow-lg">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white/70 text-[11px] font-semibold tracking-wide mb-0.5">{app.id} · {fmtDate(app.updated)}</p>
              <h3 className="text-white text-[18px] font-extrabold leading-tight m-0 truncate">{app.applicant}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 border border-white/30 text-white text-[11px] font-semibold">
                  {statusIcon[app.statusTone]} {app.status}
                </span>
                {app.type && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-white/90 text-[11px] font-semibold">
                    {fmtType(app.type)}
                  </span>
                )}
                {app.region && app.region !== '—' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-white/90 text-[11px] font-semibold">
                    📍 {app.region}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* quick-stat strip */}
          {app.amount && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: 'Amount',  value: fmtAmount(app.amount) },
                { label: 'Term',    value: app.loanTerm || '—'   },
                { label: 'Phone',   value: app.phone   || '—'   },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col rounded-xl bg-white/15 border border-white/20 px-3 py-2">
                  <span className="text-[9.5px] font-bold uppercase tracking-widest text-white/60">{label}</span>
                  <span className="text-[12.5px] font-extrabold text-white leading-snug truncate">{value}</span>
                </div>
              ))}
            </div>
          )}
          </div>

          {/* ── Pill tab bar ── */}
          <div
            className="detail-modal-tabs flex-shrink-0 overflow-x-scroll overflow-y-hidden border-b border-gray-100 px-4 py-3"
            style={{ scrollbarGutter: 'stable' }}
          >
            <div className="flex gap-1.5 w-max pb-0.5">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11.5px] font-bold whitespace-nowrap border-0 cursor-pointer transition-all ' +
                    (tab === t.id
                      ? 'bg-[#16A34A] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700')}
                >
                  <span className="text-sm leading-none">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab body ── */}
          <div
            className="detail-modal-body min-h-0 flex-1 overflow-y-scroll overflow-x-hidden px-5 pt-4 pb-10 flex flex-col gap-4 overscroll-contain"
            style={{ scrollbarGutter: 'stable', WebkitOverflowScrolling: 'touch', scrollPaddingBottom: '2.5rem' }}
          >

          {/* ── Overview ── */}
          {tab === 'overview' && (
            <>
              <ModalSection icon="📋" title="Application Summary">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <FC label="Application ID"     value={app.id} />
                  <FC label="Loan Type"           value={fmtType(app.type)} />
                  <FC label="Requested Amount"    value={fmtAmount(app.amount)} />
                  <FC label="Loan Term"           value={app.loanTerm} />
                  <FC label="Preferred Bank"      value={fd.preferredBank} />
                  <FC label="Repayment Frequency" value={fd.repaymentFrequency} />
                </div>
              </ModalSection>

              <ModalSection icon="👤" title="Applicant at a Glance">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <FC label="Full Name"  value={app.applicant} />
                  <FC label="Mobile"     value={app.phone} />
                  <FC label="Region"     value={app.region || fd.region} />
                  <FC label="Gender"     value={fd.gender} />
                  <FC label="Education"  value={fd.educationLevel} />
                  <FC label="Fayda ID"   value={fd.faydaId} />
                </div>
              </ModalSection>

              <ModalSection icon="🕐" title="Submission Timeline">
                <div className="flex flex-col gap-0">
                  {timelineSteps.map(({ label, sub, done, Icon }, i, arr) => (
                    <div key={label} className="flex items-stretch gap-4">
                      <div className="flex flex-col items-center pt-0.5">
                        <div className={`flex w-8 h-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${done ? 'bg-[#16A34A] border-[#16A34A]' : 'bg-white border-gray-200'}`}>
                          <Icon size={13} strokeWidth={2.8} className={done ? 'text-white' : 'text-gray-300'} />
                        </div>
                        {i < arr.length - 1 && (
                          <div className={`w-0.5 flex-1 my-1 ${done ? 'bg-[#16A34A]/30' : 'bg-gray-100'}`} />
                        )}
                      </div>
                      <div className={`pb-4 flex-1 ${i < arr.length - 1 ? '' : 'pb-0'}`}>
                        <p className={`text-[13px] font-bold leading-tight ${done ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
                        <p className="text-[11.5px] text-gray-400 mt-0.5">{sub}</p>
                        {done && (
                          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                            <Check size={9} strokeWidth={3} /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ModalSection>
            </>
          )}

          {/* ── Applicant ── */}
          {tab === 'applicant' && (
            <>
              <ModalSection icon="👤" title="Personal Information">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <FC label="Full Name"          value={fd.fullName} />
                  <FC label="Father's Name"      value={fd.fatherName} />
                  <FC label="Grandfather's Name" value={fd.grandfatherName} />
                  <FC label="Date of Birth"      value={fd.dateOfBirth} />
                  <FC label="Gender"             value={fd.gender} />
                  <FC label="Marital Status"     value={fd.maritalStatus} />
                  <FC label="Education Level"    value={fd.educationLevel} />
                  <FC label="Mobile Phone"       value={fd.mobilePhone} />
                  <FC label="Alternate Phone"    value={fd.alternatePhone} />
                </div>
              </ModalSection>
              <ModalSection icon="📍" title="Residential Location">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <FC label="Region"          value={fd.region} />
                  <FC label="Zone"            value={fd.zone} />
                  <FC label="Woreda/District" value={fd.woreda} />
                  <FC label="Kebele"          value={fd.kebele} />
                </div>
              </ModalSection>
              <ModalSection icon="🪪" title="KYC / Fayda Identity">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <FC label="Fayda ID Number"     value={fd.faydaId} />
                  <FC label="Verification Status" value={fd.faydaId ? 'OTP Verified' : 'Not Provided'} />
                </div>
              </ModalSection>
            </>
          )}

          {/* ── Farm & Crops ── */}
          {tab === 'farm' && (
            <>
              <ModalSection icon="📍" title="Farm Location">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <FC label="Region" value={fd.farmRegion} />
                  <FC label="Zone"   value={fd.farmZone} />
                  <FC label="Woreda" value={fd.farmWoreda} />
                  <FC label="Kebele" value={fd.farmKebele} />
                </div>
              </ModalSection>
              <ModalSection icon="🌱" title="Land Details">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <FC label="Land Ownership"        value={fd.landOwnership} />
                  <FC label="Total Farm Size (ha)"  value={fd.totalFarmSize} />
                  <FC label="Land Certificate No."  value={fd.landCertificateNo} />
                  <FC label="Distance to Road (km)" value={fd.distanceToRoad} />
                </div>
              </ModalSection>
              <ModalSection icon="🌾" title="Agricultural Profile">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <FC label="Primary Crop"         value={fd.primaryCropType} />
                  <FC label="Secondary Crop"       value={fd.secondaryCrop} />
                  <FC label="Farming Season"       value={fd.farmingSeason} />
                  <FC label="Experience (Years)"   value={fd.farmingSeasonYears} />
                  <FC label="Expected Yield (Qt.)" value={fd.expectedYield} />
                </div>
                {activePractices.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {activePractices.map(p => (
                      <span key={p} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#4a7c59]/10 text-[#3a6347] border border-[#4a7c59]/20">{p}</span>
                    ))}
                  </div>
                )}
              </ModalSection>
              {fd.purposeOfLoan && (
                <ModalSection icon="📝" title="Purpose of Loan">
                  <p className="text-[13px] text-gray-700 leading-relaxed m-0">{fd.purposeOfLoan}</p>
                </ModalSection>
              )}
            </>
          )}

          {/* ── Loan ── */}
          {tab === 'loan' && (
            <>
              <ModalSection icon="💰" title="Loan Request">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <FC label="Loan Type"           value={fmtType(fd.loanType)} />
                  <FC label="Requested Amount"    value={fmtAmount(fd.requestedAmount || app.amount)} />
                  <FC label="Loan Duration"       value={fd.loanDuration || app.loanTerm} />
                  <FC label="Repayment Frequency" value={fd.repaymentFrequency} />
                  <FC label="Loan Purpose"        value={fd.loanPurpose} />
                  <FC label="Preferred Bank"      value={fd.preferredBank} />
                </div>
              </ModalSection>
              {(() => {
                const principal = parseFloat(String(fd.requestedAmount || app.amount || '').replace(/,/g, '')) || 0;
                const durationStr = fd.loanDuration || app.loanTerm || '';
                const months = parseInt(durationStr) || 0;
                if (!principal || !months) return null;
                const interest = principal * 0.18 * (months / 12);
                const fee      = principal * 0.02;
                const total    = principal + interest + fee;
                return (
                  <ModalSection icon="📈" title="Estimated Loan Breakdown">
                    <div className="flex flex-col divide-y divide-gray-100">
                      {[
                        ['Principal Amount',       fmtAmount(principal)],
                        ['Interest (18% p.a.)',    fmtAmount(Math.round(interest))],
                        ['Processing Fee (2%)',    fmtAmount(Math.round(fee))],
                      ].map(([l, v]) => (
                        <div key={l} className="flex items-center justify-between py-2.5 text-[12.5px]">
                          <span className="text-gray-500">{l}</span>
                          <span className="font-semibold text-gray-800">{v}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-3 mt-1">
                        <span className="text-[13px] font-extrabold text-gray-900">Total Repayment</span>
                        <span className="text-[14px] font-extrabold text-[#4a7c59]">{fmtAmount(Math.round(total))}</span>
                      </div>
                    </div>
                  </ModalSection>
                );
              })()}
              {fd.detailedUseOfFunds && (
                <ModalSection icon="📝" title="Detailed Use of Funds">
                  <p className="text-[13px] text-gray-700 leading-relaxed m-0">{fd.detailedUseOfFunds}</p>
                </ModalSection>
              )}
            </>
          )}

          {/* ── Finances ── */}
          {tab === 'finances' && (
            <>
              <ModalSection icon="📥" title="Annual Income Sources (ETB)">
                <div className="flex flex-col divide-y divide-gray-50">
                  {INCOME_FIELDS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-2.5 text-[12.5px]">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-800">{parseFloat(fd[key]) ? `${Number(fd[key]).toLocaleString()} ETB` : '—'}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-gray-200">
                    <span className="text-[13px] font-extrabold text-gray-900">Total Income</span>
                    <span className="text-[13px] font-extrabold text-emerald-700">{totalIncome.toLocaleString()} ETB</span>
                  </div>
                </div>
              </ModalSection>
              <ModalSection icon="📤" title="Annual Household Expenditures (ETB)">
                <div className="flex flex-col divide-y divide-gray-50">
                  {EXPENDITURE_FIELDS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-2.5 text-[12.5px]">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-800">{parseFloat(fd[key]) ? `${Number(fd[key]).toLocaleString()} ETB` : '—'}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-gray-200">
                    <span className="text-[13px] font-extrabold text-gray-900">Total Expenditure</span>
                    <span className="text-[13px] font-extrabold text-red-600">{totalExpenditure.toLocaleString()} ETB</span>
                  </div>
                </div>
              </ModalSection>
              <div className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 ${netCashFlow >= 0 ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50' : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'}`}>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-0.5">Net Cash Flow</p>
                  <p className="text-[11.5px] text-gray-500">{netCashFlow >= 0 ? 'Financially viable' : 'Review required'}</p>
                </div>
                <span className={`text-[22px] font-extrabold tabular-nums ${netCashFlow >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {netCashFlow >= 0 ? '+' : ''}{netCashFlow.toLocaleString()} <span className="text-[14px]">ETB</span>
                </span>
              </div>
            </>
          )}

          {/* ── Collateral ── */}
          {tab === 'collateral' && (
            <>
              <ModalSection icon="🏦" title="Collateral Information">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <FC label="Collateral Type"  value={fd.collateralType} />
                  <FC label="Estimated Value"  value={fmtAmount(fd.estimatedValue)} />
                  {fd.descriptionCondition && <FC label="Condition Notes" value={fd.descriptionCondition} wide />}
                </div>
              </ModalSection>
              <ModalSection icon="🤝" title="Guarantors">
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Guarantor 1', name: fd.guarantor1Name, rel: fd.guarantor1Relationship, phone: fd.guarantor1Phone, id: fd.guarantor1FaydaId },
                    { label: 'Guarantor 2', name: fd.guarantor2Name, rel: fd.guarantor2Relationship, phone: fd.guarantor2Phone, id: fd.guarantor2FaydaId },
                  ].map(({ label, name, rel, phone, id }) => (
                    <div key={label} className="rounded-xl border border-gray-100 p-3 bg-gray-50/60">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <FC label="Name"         value={name} />
                        <FC label="Relationship" value={rel}  />
                        <FC label="Phone"        value={phone}/>
                        <FC label="Fayda / ID"   value={id}   />
                      </div>
                    </div>
                  ))}
                </div>
              </ModalSection>
              <ModalSection icon="📜" title="Declaration">
                <div className="flex flex-col gap-2.5">
                  {[
                    { label: 'Applicant Declaration signed',          done: fd.declaration   },
                    { label: 'Development Agent verification signed', done: fd.agentVerified },
                  ].map(({ label, done }) => (
                    <div key={label} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 border ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`flex w-6 h-6 shrink-0 items-center justify-center rounded-full ${done ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                        <Check size={12} strokeWidth={3} className={done ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <span className={`text-[12.5px] font-semibold ${done ? 'text-emerald-800' : 'text-gray-400'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </ModalSection>
            </>
          )}
          </div>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
            <span className="text-[11px] text-gray-400">Application ID: <strong className="text-gray-600">{app.id}</strong></span>
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16A34A] text-white text-sm font-bold hover:bg-[#10883c] transition-colors border-0 cursor-pointer shadow-sm"
              onClick={onClose}
            >
              <X size={14} strokeWidth={2.5} />
              Close
            </button>
          </div>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ value, label, helper, trendLabel, trendDir, TrendIcon, IconComponent, iconBg, iconColor }) {
  const trendStyle =
    trendDir === 'up'   ? 'bg-green-50 text-green-700' :
    trendDir === 'down' ? 'bg-red-50 text-red-600'     :
                          'bg-gray-100 text-gray-500';
  return (
    <article className="relative bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all overflow-hidden">
      {/* Trend badge */}
      <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${trendStyle}`}>
        {TrendIcon && <TrendIcon size={10} strokeWidth={2.5} />}
        {trendLabel}
      </span>

      {/* Body: icon left, value+label right */}
      <div className="flex items-center justify-between mt-6">
        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl flex-shrink-0 ${iconBg}`}>
          <IconComponent size={30} strokeWidth={1.5} className={iconColor} />
        </div>
        <div className="text-right">
          <strong className="block text-[2.4rem] font-bold tracking-tight text-gray-900 leading-none">{value}</strong>
          <span className="block text-sm font-bold text-gray-700 mt-1 leading-tight">{label}</span>
        </div>
      </div>

      {/* Helper footer */}
      <div className="flex items-center justify-end gap-1.5 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
        {helper}
      </div>
    </article>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function NewLoanApplicationDashboard() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState(readStoredLoans);
  const [page, setPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(ALL_STATUS_VALUES));
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewApp, setViewApp] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const filterRef = useRef(null);

  useEffect(() => {
    function onFocus() { setLoans(readStoredLoans()); }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    function handleOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function applyDateFilter(list) {
    if (dateFilter === 'all') return list;
    const now = new Date();
    let from, to;
    if (dateFilter === 'today') {
      from = sod(now); to = eod(now);
    } else if (dateFilter === 'yesterday') {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      from = sod(y); to = eod(y);
    } else if (dateFilter === 'this_week') {
      const w = new Date(now); w.setDate(w.getDate() - w.getDay());
      from = sod(w); to = eod(now);
    } else if (dateFilter === 'this_month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = eod(now);
    } else if (dateFilter === 'custom') {
      if (!customFrom) return list;
      from = sod(customFrom);
      to = customTo ? eod(customTo) : eod(now);
    } else {
      return list;
    }
    return list.filter((l) => {
      const d = parseLoanDate(l.updated || l.submittedAt);
      if (!d) return true;
      return d >= from && d <= to;
    });
  }

  const dateFiltered  = applyDateFilter(loans);
  const totalCount    = dateFiltered.length;
  const pendingCount  = dateFiltered.filter((l) => l.statusTone === 'info').length;
  const approvedCount = dateFiltered.filter((l) => l.statusTone === 'success').length;
  const rejectedCount = dateFiltered.filter((l) => l.statusTone === 'danger').length;

  const allChecked = selectedStatuses.size === STATUS_OPTIONS.length;

  function toggleStatus(value) {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      if (next.size === 0) return new Set(ALL_STATUS_VALUES);
      return next;
    });
    setPage(1);
  }

  function toggleAll() {
    setSelectedStatuses(allChecked ? new Set() : new Set(ALL_STATUS_VALUES));
    setPage(1);
  }

  const filteredLoans = (selectedStatuses.size === 0 || allChecked)
    ? dateFiltered
    : dateFiltered.filter((l) => selectedStatuses.has(l.statusTone));

  const totalPages = Math.max(1, Math.ceil(filteredLoans.length / PAGE_SIZE));
  const pagedLoans = filteredLoans.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = !allChecked && selectedStatuses.size > 0;

  const dotColor = { info: 'bg-blue-500', success: 'bg-green-500', danger: 'bg-red-500', neutral: 'bg-gray-400' };

  return (
    <div className="flex flex-col gap-5 pb-6">
      <style>{`
        @keyframes rowFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .row-anim { animation: rowFadeUp 0.22s cubic-bezier(.22,.68,0,1.2) both; }
        .row-anim:hover td { background: #f8faf9; }
      `}</style>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-0.5 m-0">Loan Applications List</h1>
          <p className="text-sm text-gray-400 m-0">All applications submitted via the New Loan Application form.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateFilterDropdown
            activeFilter={dateFilter}
            customFrom={customFrom}
            customTo={customTo}
            onSelect={(id) => { setDateFilter(id); setPage(1); }}
            onCustomApply={(f, t) => { setCustomFrom(f); setCustomTo(t); setDateFilter('custom'); setPage(1); }}
          />
          <button
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg text-sm font-semibold bg-[#16A34A] text-white hover:bg-[#10883c] transition-colors cursor-pointer border-0"
            onClick={() => navigate('/loans/new')}
          >
            <Plus size={15} strokeWidth={2.5} />
            New Application
          </button>
        </div>
      </div>

      {/* ── KPI grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          value={totalCount}
          label="Total Applications"
          trendLabel="All loan types"
          trendDir={null}
          TrendIcon={Globe}
          IconComponent={ClipboardList}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          helper={<><Globe size={12} strokeWidth={2} className="opacity-60" /><span>All loan types</span></>}
        />
        <KpiCard
          value={approvedCount}
          label="Approved"
          trendLabel={approvedCount > 0 ? `${approvedCount} ready` : '—'}
          trendDir={approvedCount > 0 ? 'up' : null}
          TrendIcon={approvedCount > 0 ? TrendingUp : TrendingDown}
          IconComponent={CheckCircle2}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          helper={<><Tag size={12} strokeWidth={2} className="opacity-60" /><span>Ready to disburse</span></>}
        />
        <KpiCard
          value={pendingCount}
          label="Pending Review"
          trendLabel={pendingCount > 0 ? `${pendingCount} pending` : '—'}
          trendDir={pendingCount > 0 ? 'up' : null}
          TrendIcon={pendingCount > 0 ? TrendingUp : TrendingDown}
          IconComponent={Clock3}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          helper={<><Calendar size={12} strokeWidth={2} className="opacity-60" /><span>In this period</span></>}
        />
        <KpiCard
          value={rejectedCount}
          label="Rejected"
          trendLabel={rejectedCount > 0 ? `${rejectedCount} flagged` : '—'}
          trendDir={rejectedCount > 0 ? 'down' : null}
          TrendIcon={rejectedCount > 0 ? TrendingDown : TrendingUp}
          IconComponent={CircleAlert}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          helper={<><Clock3 size={12} strokeWidth={2} className="opacity-60" /><span>Needs attention</span></>}
        />
      </div>

      {/* ── Table card ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-2 m-0">
            <ClipboardList size={16} strokeWidth={2.2} />
             Applications List
            {loans.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                {filteredLoans.length}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                  isFiltered
                    ? 'bg-[#4a7c59] text-white border-[#16A34A]'
                    : filterOpen
                    ? 'bg-[#4a7c59]/5 text-[#16A34A] border-[#16A34A]'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Filter size={12} strokeWidth={2.5} />
                {isFiltered ? `Status (${selectedStatuses.size})` : 'Filter Status'}
                <ChevronDown size={11} strokeWidth={2.5} />
              </button>

              {filterOpen && (
                <div className="absolute top-[calc(100%+6px)] right-0 z-40 min-w-[180px] bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium w-full text-left cursor-pointer border-0 transition-colors ${allChecked ? 'bg-[#16A34A]/10 text-gray-900 font-semibold' : 'bg-transparent text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${allChecked ? 'bg-[#16A34A] border-[#16A34A] text-white' : 'border-gray-300'}`}>
                      {allChecked && <Check size={9} strokeWidth={3} />}
                    </span>
                    All Statuses
                  </button>
                  {STATUS_OPTIONS.map((opt) => {
                    const checked = selectedStatuses.has(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleStatus(opt.value)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium w-full text-left cursor-pointer border-0 transition-colors ${checked ? 'bg-[#16A34A]/10 text-gray-900 font-semibold' : 'bg-transparent text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${checked ? 'bg-[#16A34A] border-[#16A34A] text-white' : 'border-gray-300'}`}>
                          {checked && <Check size={9} strokeWidth={3} />}
                        </span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor[opt.value] || 'bg-gray-400'}`} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {loans.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#4a7c59]/10 text-[#4a7c59]">
              <ClipboardList size={28} strokeWidth={1.6} />
            </div>
            <h3 className="text-base font-bold text-gray-800 m-0">No Applications Yet</h3>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed m-0">
              Submitted loan applications will appear here automatically. Start a new application and complete all 9 steps to see it listed.
            </p>
            <button
              className="inline-flex items-center gap-1.5 mt-1 px-4 py-2 rounded-lg text-sm font-semibold bg-[#4a7c59] text-white hover:bg-[#3a6347] transition-colors border-0 cursor-pointer"
              onClick={() => navigate('/loans/new')}
            >
              <Plus size={15} strokeWidth={2.5} />
              Start New Application
            </button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['#', 'Application ID / Applicant', 'Loan Type', 'Amount', 'Region', 'Term', 'Status', 'Date Submitted', 'Action'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-widest text-gray-400 bg-gray-50/80 whitespace-nowrap first:rounded-l-none last:rounded-r-none border-b border-gray-100">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody key={'pg-' + page}>
                  {pagedLoans.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-sm text-gray-400">
                        No applications match the selected filter.
                      </td>
                    </tr>
                  ) : pagedLoans.map((app, idx) => {
                    const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
                    const initials = (app.applicant || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    const avatarColors = [
                      'bg-violet-100 text-violet-700', 'bg-blue-100 text-blue-700',
                      'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
                      'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700',
                    ];
                    const avatarColor = avatarColors[app.applicant.charCodeAt(0) % avatarColors.length];
                    const termShort = (app.loanTerm || '').replace(' Months (1 Year)', ' mo.').replace(' Months (2 Years)', ' mo.').replace(' Months (3 Years)', ' mo.').replace(' Months', ' mo.');
                    return (
                      <tr
                        key={app.id + '-' + page + '-' + idx}
                        className='row-anim border-b border-gray-50 transition-all duration-150 cursor-default'
                        style={{ animationDelay: (idx * 35) + 'ms' }}
                      >
                        {/* # */}
                        <td className="px-4 py-3.5 text-[11px] font-bold text-gray-300 tabular-nums w-8">{rowNum}</td>

                        {/* ID + Applicant */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className={'flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-extrabold shrink-0 ' + avatarColor}>{initials}</span>
                            <div>
                              <strong className="block text-[12.5px] font-bold text-[#10883c] leading-tight">{app.id}</strong>
                              <span className="text-[11px] text-gray-400 leading-tight">{app.applicant}</span>
                            </div>
                          </div>
                        </td>

                        {/* Loan Type */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11.5px] font-semibold bg-gray-100 text-gray-700 whitespace-nowrap">
                            {fmtType(app.type)}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {app.amount ? (
                            <span className="text-[13px] font-bold text-gray-900 tabular-nums">
                              {fmtAmount(app.amount)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-gray-100 text-gray-400">N/A</span>
                          )}
                        </td>

                        {/* Region */}
                        <td className="px-4 py-3.5 text-[12.5px] text-gray-600 whitespace-nowrap">{app.region || '—'}</td>

                        {/* Term */}
                        <td className="px-4 py-3.5">
                          {termShort ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 whitespace-nowrap border border-blue-100">
                              {termShort}
                            </span>
                          ) : '—'}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge tone={app.statusTone} label={app.status} />
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-[11.5px] text-gray-400 whitespace-nowrap">{fmtDate(app.updated)}</td>

                        {/* Action */}
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setViewApp(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold bg-[#16A34A]/8 border border-[#4a7c59]/20 text-[#16A34A] hover:bg-[#10883c] hover:text-white transition-all duration-150 cursor-pointer"
                          >
                            <Eye size={12} strokeWidth={2.2} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between flex-wrap gap-2 px-5 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredLoans.length)} of {filteredLoans.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    className="grid place-items-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    aria-label="Previous"
                  >
                    <ChevronLeft size={13} strokeWidth={2.5} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      aria-current={pg === page ? 'page' : undefined}
                      className={`grid place-items-center min-w-[2rem] h-8 px-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                        pg === page
                          ? 'bg-[#16A34A] border-[#16A34A] text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    className="grid place-items-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Next"
                  >
                    <ChevronRight size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail modal ── */}
      {viewApp && <DetailModal app={viewApp} onClose={() => setViewApp(null)} />}
    </div>
  );
}

export default NewLoanApplicationDashboard;
