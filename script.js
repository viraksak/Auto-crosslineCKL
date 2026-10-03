/**
 * Student Exam Result System
 * Authentic Cambodian School A4 Layout, Dynamic Feature System, Inline Editing, and Multi-Format Export
 * - Header in Moul (Khmer OS Muol Light)
 * - Table and Footer in Khmer OS Siemreap
 */

/* ========================================================
   Application State
   ======================================================== */
let allStudents = [];
let filteredStudents = [];
let useKhmerDigits = true;
let showScores = true;
let isEditMode = false;

// Features State
let featuresList = [];
let activeFeatureId = 'grade_7_promotion';
let activeFeature = null;

// Khmer Digits Utility
const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

function toKhmerNum(val) {
    if (val === null || val === undefined || val === '') return '';
    return String(val).replace(/[0-9]/g, d => KHMER_DIGITS[parseInt(d, 10)]);
}

function formatNumber(val) {
    return useKhmerDigits ? toKhmerNum(val) : String(val);
}

function parseScore(value) {
    if (value === null || value === undefined || value === "") return 0;
    const num = Number(String(value).trim());
    return Number.isNaN(num) ? 0 : num;
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ========================================================
   Default Features & Presets
   ======================================================== */
const DEFAULT_PRESET_FEATURES = [
    {
        id: "grade_7_promotion",
        name: "បញ្ជីស្រង់ពិន្ទុឡើងថ្នាក់ (Grade Promotion - 2 Subjects)",
        isCustom: false,
        description: "ទម្រង់ផ្លូវការប្រឡងឡើងថ្នាក់ ២ មុខវិជ្ជា (ខ្មែរ + គណិត ≥ 100 ជាប់)",
        ruleType: "total_threshold",
        passThreshold: 100,
        ruleText: "ខ្មែរ + គណិត ≥ 100 → ជាប់ | តិចជាង 100 → ធ្លាក់",
        format: {
            deptLine1: "ការិយាល័យ.អយក ស្រុកចំការលើ",
            deptLine2: "វិទ្យាល័យ ហ៊ុន សែន ចំការលើ",
            kingdomTitle: "ព្រះរាជាណាចក្រកម្ពុជា",
            kingdomMotto: "ជាតិ សាសនា ព្រះមហាក្សត្រ",
            roomNumber: "បន្ទប់ទី១",
            examTitle: "បញ្ជីស្រង់ពិន្ទុសិស្សឡើងថ្នាក់ទី ៧",
            examSession: "សម័យប្រឡង៖ ២៦ កញ្ញា ២០២៦",
            verifiers: [
                "បញ្ចូលពិន្ទុដោយ",
                "ផ្ទៀងផ្ទាត់ពិន្ទុដោយ",
                "ផ្ទៀងផ្ទាត់ចុងក្រោយដោយ"
            ],
            summaryLabel1: "បញ្ឈប់បញ្ជីត្រឹមចំនួនបេក្ខជនសរុប : ",
            summaryUnit1: " នាក់ក្នុងនោះស្រី : ",
            summaryEnd1: " នាក់",
            summaryLabel2: "បានប្រឡងជាប់សញ្ញាបត្រសរុបចំនួន ",
            summaryUnit2: " នាក់ក្នុងនោះស្រី : ",
            summaryEnd2: " នាក់",
            dateLunar: "ថ្ងៃសៅរ៍ ១៥កើត ខែភទ្របទ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០",
            dateSolar: "ត្រូវនឹង ថ្ងៃទី២៦ ខែកញ្ញា ឆ្នាំ២០២៦",
            signTitle: "នាយកវិទ្យាល័យ"
        },
        columns: [
            { key: "no", label: "លេខ", type: "no", width: "45px", align: "center" },
            { key: "name", label: "គោត្តនាម-នាម", type: "name", width: "165px", align: "left" },
            { key: "gender", label: "ភេទ", type: "gender", width: "50px", align: "center" },
            { key: "fromClass", label: "មកពីថ្នាក់", type: "class", width: "70px", align: "center" },
            { key: "khmer", label: "ខ្មែរ", type: "score", maxScore: 100, width: "55px", align: "center" },
            { key: "math", label: "គណិត", type: "score", maxScore: 100, width: "55px", align: "center" },
            { key: "total", label: "សរុប", type: "total", width: "60px", align: "center" },
            { key: "result", label: "លទ្ធផល", type: "result", width: "75px", align: "center" }
        ],
        sampleStudents: [
            { no: 1, name: "សុខ ចាន់ដារ៉ា", gender: "ប្រុស", fromClass: "9A", khmer: 60, math: 40 },
            { no: 2, name: "ចាន់ ធីតា", gender: "ស្រី", fromClass: "9B", khmer: 40, math: 40 },
            { no: 3, name: "កែវ វិបុល", gender: "ប្រុស", fromClass: "9A", khmer: 70, math: 50 },
            { no: 4, name: "ម៉ៅ ស្រីពៅ", gender: "ស្រី", fromClass: "9C", khmer: 49, math: 50 },
            { no: 5, name: "អ៊ុំ វាសនា", gender: "ប្រុស", fromClass: "9B", khmer: 100, math: 0 },
            { no: 6, name: "ស៊ិន រស្មី", gender: "ស្រី", fromClass: "9A", khmer: 30, math: 70 },
            { no: 7, name: "ហេង សុវណ្ណ", gender: "ប្រុស", fromClass: "9B", khmer: 65, math: 45 },
            { no: 8, name: "លី ស្រីណែត", gender: "ស្រី", fromClass: "9C", khmer: 35, math: 45 }
        ]
    },
    {
        id: "semester_exam",
        name: "បញ្ជីពិន្ទុប្រឡងឆមាស (Semester Exam - 5 Subjects, Avg, Rank, Grade)",
        isCustom: false,
        description: "ប្រឡងឆមាស ៥ មុខវិជ្ជា (ខ្មែរ, គណិត, រូប, គីមី, អង់គ្លេស) មានមធ្យមភាគ ចំណាត់ថ្នាក់ និងនិទ្ទេស A-F",
        ruleType: "average_threshold",
        passThreshold: 25.0,
        ruleText: "មធ្យមភាគ ≥ 25.0/50 → ជាប់ | < 25.0 → ធ្លាក់ (មានចំណាត់ថ្នាក់ & និទ្ទេស A-F)",
        format: {
            deptLine1: "ការិយាល័យ.អយក ស្រុកចំការលើ",
            deptLine2: "វិទ្យាល័យ ហ៊ុន សែន ចំការលើ",
            kingdomTitle: "ព្រះរាជាណាចក្រកម្ពុជា",
            kingdomMotto: "ជាតិ សាសនា ព្រះមហាក្សត្រ",
            roomNumber: "បន្ទប់ទី០២",
            examTitle: "បញ្ជីស្រង់ពិន្ទុប្រឡងឆមាសទី១ ថ្នាក់ទី ៩",
            examSession: "សម័យប្រឡង៖ ១៥ មីនា ២០២៦",
            verifiers: [
                "គ្រូបន្ទុកថ្នាក់",
                "ប្រធានដេប៉ាតឺម៉ង់",
                "ផ្ទៀងផ្ទាត់ដោយ"
            ],
            summaryLabel1: "ចំនួនសិស្សប្រឡងសរុប : ",
            summaryUnit1: " នាក់ក្នុងនោះស្រី : ",
            summaryEnd1: " នាក់",
            summaryLabel2: "សិស្សជាប់មធ្យមភាគសរុប : ",
            summaryUnit2: " នាក់ក្នុងនោះស្រី : ",
            summaryEnd2: " នាក់",
            dateLunar: "ថ្ងៃអង្គារ ០២កើត ខែចេត្រ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០",
            dateSolar: "ត្រូវនឹង ថ្ងៃទី១៥ ខែមីនា ឆ្នាំ២០២៦",
            signTitle: "នាយកវិទ្យាល័យ"
        },
        columns: [
            { key: "no", label: "លេខ", type: "no", width: "38px", align: "center" },
            { key: "name", label: "គោត្តនាម-នាម", type: "name", width: "140px", align: "left" },
            { key: "gender", label: "ភេទ", type: "gender", width: "42px", align: "center" },
            { key: "fromClass", label: "ថ្នាក់", type: "class", width: "48px", align: "center" },
            { key: "khmer", label: "ខ្មែរ", type: "score", maxScore: 100, width: "45px", align: "center" },
            { key: "math", label: "គណិត", type: "score", maxScore: 100, width: "45px", align: "center" },
            { key: "physics", label: "រូប", type: "score", maxScore: 50, width: "42px", align: "center" },
            { key: "chemistry", label: "គីមី", type: "score", maxScore: 50, width: "42px", align: "center" },
            { key: "english", label: "អង់គ្លេស", type: "score", maxScore: 50, width: "48px", align: "center" },
            { key: "total", label: "សរុប", type: "total", width: "48px", align: "center" },
            { key: "average", label: "មធ្យមភាគ", type: "average", width: "55px", align: "center" },
            { key: "rank", label: "ចំណាត់ថ្នាក់", type: "rank", width: "55px", align: "center" },
            { key: "grade", label: "និទ្ទេស", type: "grade", width: "48px", align: "center" },
            { key: "result", label: "លទ្ធផល", type: "result", width: "65px", align: "center" }
        ],
        sampleStudents: [
            { no: 1, name: "គឹម សុវណ្ណារ៉ា", gender: "ប្រុស", fromClass: "9A", khmer: 85, math: 92, physics: 46, chemistry: 45, english: 48 },
            { no: 2, name: "រឿន ចរិយា", gender: "ស្រី", fromClass: "9A", khmer: 88, math: 78, physics: 42, chemistry: 44, english: 45 },
            { no: 3, name: "ជា វិចិត្រ", gender: "ប្រុស", fromClass: "9B", khmer: 70, math: 85, physics: 38, chemistry: 40, english: 36 },
            { no: 4, name: "សេង ធីតា", gender: "ស្រី", fromClass: "9B", khmer: 65, math: 60, physics: 30, chemistry: 32, english: 35 },
            { no: 5, name: "ឌៀប ពិសិដ្ឋ", gender: "ប្រុស", fromClass: "9A", khmer: 55, math: 50, physics: 25, chemistry: 28, english: 30 },
            { no: 6, name: "អេង ស្រីម៉ៅ", gender: "ស្រី", fromClass: "9C", khmer: 48, math: 45, physics: 22, chemistry: 20, english: 25 },
            { no: 7, name: "ពៅ សុភ័ក្ត្រ", gender: "ប្រុស", fromClass: "9C", khmer: 40, math: 35, physics: 18, chemistry: 15, english: 20 },
            { no: 8, name: "ហេង រតនា", gender: "ស្រី", fromClass: "9B", khmer: 75, math: 70, physics: 35, chemistry: 38, english: 40 }
        ]
    },
    {
        id: "diploma_grade_9",
        name: "បញ្ជីប្រឡងសញ្ញាបត្របឋមភូមិ (Grade 9 Diploma - ឌីប្លូម)",
        isCustom: false,
        description: "ទម្រង់ផ្លូវការប្រឡងសញ្ញាបត្របឋមភូមិ ឌីប្លូម (ជាប់សញ្ញាបត្រ និងនិទ្ទេសផ្លូវការ)",
        ruleType: "total_threshold",
        passThreshold: 125,
        ruleText: "ពិន្ទុសរុប ≥ 125/250 → ជាប់សញ្ញាបត្រ | និទ្ទេស (ល្អប្រសើរ, ល្អ, ល្អបង្គួរ, មធ្យម)",
        format: {
            deptLine1: "មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តកំពង់ចាម",
            deptLine2: "ការិយាល័យប្រឡង និងវាយតម្លៃ",
            kingdomTitle: "ព្រះរាជាណាចក្រកម្ពុជា",
            kingdomMotto: "ជាតិ សាសនា ព្រះមហាក្សត្រ",
            roomNumber: "បន្ទប់ទី០៣",
            examTitle: "បញ្ជីលទ្ធផលការប្រឡងសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ",
            examSession: "សម័យប្រឡង៖ ១០ សីហា ២០២៦",
            verifiers: [
                "ប្រធានអនុគណៈកម្មការកែ",
                "ប្រធានមណ្ឌលកំណែ",
                "ប្រធានគណៈកម្មការរៀបចំ"
            ],
            summaryLabel1: "ចំនួនបេក្ខជនមានឈ្មោះសរុប : ",
            summaryUnit1: " នាក់ក្នុងនោះស្រី : ",
            summaryEnd1: " នាក់",
            summaryLabel2: "បានប្រឡងជាប់សញ្ញាបត្រសរុបចំនួន ",
            summaryUnit2: " នាក់ក្នុងនោះស្រី : ",
            summaryEnd2: " នាក់",
            dateLunar: "ថ្ងៃចន្ទ ១២កើត ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០",
            dateSolar: "ត្រូវនឹង ថ្ងៃទី១០ ខែសីហា ឆ្នាំ២០២៦",
            signTitle: "ប្រធានមន្ទីរអប់រំ យុវជន និងកីឡា"
        },
        columns: [
            { key: "no", label: "លេខ", type: "no", width: "42px", align: "center" },
            { key: "name", label: "គោត្តនាម-នាម", type: "name", width: "155px", align: "left" },
            { key: "gender", label: "ភេទ", type: "gender", width: "48px", align: "center" },
            { key: "fromClass", label: "មកពីវិទ្យាល័យ", type: "class", width: "90px", align: "center" },
            { key: "khmer", label: "តែងសេចក្តី", type: "score", maxScore: 50, width: "55px", align: "center" },
            { key: "math", label: "គណិត", type: "score", maxScore: 50, width: "50px", align: "center" },
            { key: "science", label: "វិទ្យាសាស្ត្រ", type: "score", maxScore: 50, width: "55px", align: "center" },
            { key: "english", label: "អង់គ្លេស", type: "score", maxScore: 50, width: "52px", align: "center" },
            { key: "social", label: "សង្គមវិជ្ជា", type: "score", maxScore: 50, width: "55px", align: "center" },
            { key: "total", label: "សរុប", type: "total", width: "52px", align: "center" },
            { key: "mention", label: "និទ្ទេស", type: "mention_khmer", width: "68px", align: "center" },
            { key: "result", label: "លទ្ធផល", type: "result", width: "75px", align: "center" }
        ],
        sampleStudents: [
            { no: 1, name: "ម៉ានិត វីរៈ", gender: "ប្រុស", fromClass: "ចំការលើ", khmer: 44, math: 48, science: 46, english: 45, social: 45 },
            { no: 2, name: "ភួង សុជាតា", gender: "ស្រី", fromClass: "ចំការលើ", khmer: 42, math: 40, science: 38, english: 42, social: 44 },
            { no: 3, name: "ឈួន ឧត្តម", gender: "ប្រុស", fromClass: "ស្ពឺ", khmer: 36, math: 35, science: 34, english: 32, social: 38 },
            { no: 4, name: "រិន សុផាត", gender: "ប្រុស", fromClass: "បុសខ្នុរ", khmer: 32, math: 30, science: 28, english: 26, social: 34 },
            { no: 5, name: "ម៉ម កល្យាណ", gender: "ស្រី", fromClass: "ចំការលើ", khmer: 28, math: 25, science: 24, english: 25, social: 28 },
            { no: 6, name: "ទេព មុន្នី", gender: "ប្រុស", fromClass: "ស្ពឺ", khmer: 22, math: 20, science: 21, english: 18, social: 24 },
            { no: 7, name: "សួស គន្ធា", gender: "ស្រី", fromClass: "បុសខ្នុរ", khmer: 38, math: 37, science: 36, english: 35, social: 40 },
            { no: 8, name: "វ៉ាន់ ដារ៉ូ", gender: "ប្រុស", fromClass: "ចំការលើ", khmer: 40, math: 42, science: 40, english: 38, social: 41 }
        ]
    },
    {
        id: "honor_outstanding",
        name: "តារាងកិត្តិយស និងប្រឡងសិស្សពូកែ (Outstanding Students & Honor Roll)",
        isCustom: false,
        description: "ការប្រឡងជ្រើសរើសសិស្សពូកែ ចំណាត់ថ្នាក់កិត្តិយស និងមេដាយជ័យលាភី (មាស, ប្រាក់, សំរឹទ្ធ)",
        ruleType: "rank_honor",
        passThreshold: 120,
        ruleText: "រៀបចំណាត់ថ្នាក់តាមពិន្ទុខ្ពស់បំផុត → 🥇 មេដាយមាស | 🥈 មេដាយប្រាក់ | 🥉 មេដាយសំរឹទ្ធ | 🎖️ កិត្តិយស",
        format: {
            deptLine1: "ការិយាល័យ.អយក ស្រុកចំការលើ",
            deptLine2: "វិទ្យាល័យ ហ៊ុន សែន ចំការលើ",
            kingdomTitle: "ព្រះរាជាណាចក្រកម្ពុជា",
            kingdomMotto: "ជាតិ សាសនា ព្រះមហាក្សត្រ",
            roomNumber: "បន្ទប់ប្រឡងពិសេស",
            examTitle: "បញ្ជីរាយនាមសិស្សជ័យលាភីប្រឡងសិស្សពូកែប្រចាំឆ្នាំ",
            examSession: "សម័យប្រឡង៖ ២០ មេសា ២០២៦",
            verifiers: [
                "គណៈកម្មការចេញវិញ្ញាសា",
                "គណៈកម្មការកំណែ",
                "ប្រធានគណៈកម្មការវាយតម្លៃ"
            ],
            summaryLabel1: "ចំនួនបេក្ខជនចូលរួមប្រឡងសរុប : ",
            summaryUnit1: " នាក់ក្នុងនោះស្រី : ",
            summaryEnd1: " នាក់",
            summaryLabel2: "ចំនួនសិស្សទទួលជ័យលាភីសរុប : ",
            summaryUnit2: " នាក់ក្នុងនោះស្រី : ",
            summaryEnd2: " នាក់",
            dateLunar: "ថ្ងៃចន្ទ ០៤កើត ខែពិសាខ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០",
            dateSolar: "ត្រូវនឹង ថ្ងៃទី២០ ខែមេសា ឆ្នាំ២០២៦",
            signTitle: "ប្រធានគណៈកម្មការរៀបចំការប្រឡង"
        },
        columns: [
            { key: "no", label: "លេខ", type: "no", width: "45px", align: "center" },
            { key: "name", label: "គោត្តនាម-នាម", type: "name", width: "165px", align: "left" },
            { key: "gender", label: "ភេទ", type: "gender", width: "50px", align: "center" },
            { key: "fromClass", label: "មកពីសាលា/ថ្នាក់", type: "class", width: "110px", align: "center" },
            { key: "theory", label: "វិញ្ញាសា១ (ទ្រឹស្តី)", type: "score", maxScore: 100, width: "80px", align: "center" },
            { key: "practice", label: "វិញ្ញាសា២ (អនុវត្ត)", type: "score", maxScore: 100, width: "80px", align: "center" },
            { key: "total", label: "ពិន្ទុសរុប", type: "total", width: "75px", align: "center" },
            { key: "rank", label: "ចំណាត់ថ្នាក់", type: "rank", width: "75px", align: "center" },
            { key: "award", label: "ជ័យលាភី / មេដាយ", type: "award", width: "115px", align: "center" }
        ],
        sampleStudents: [
            { no: 1, name: "សួស ច័ន្ទបុត្រ", gender: "ប្រុស", fromClass: "ថ្នាក់ទី ៩A", theory: 96, practice: 98 },
            { no: 2, name: "កុលាប សោភា", gender: "ស្រី", fromClass: "ថ្នាក់ទី ៩B", theory: 92, practice: 95 },
            { no: 3, name: "អ៊ិត វីរៈបុត្រ", gender: "ប្រុស", fromClass: "ថ្នាក់ទី ៩A", theory: 90, practice: 91 },
            { no: 4, name: "ភារម្យ ចិន្តា", gender: "ស្រី", fromClass: "ថ្នាក់ទី ៩C", theory: 86, practice: 88 },
            { no: 5, name: "មាស សម្បត្តិ", gender: "ប្រុស", fromClass: "ថ្នាក់ទី ៩B", theory: 82, practice: 85 },
            { no: 6, name: "គង់ គន្ធារី", gender: "ស្រី", fromClass: "ថ្នាក់ទី ៩C", theory: 78, practice: 80 },
            { no: 7, name: "ថុន សុផាន់ណា", gender: "ប្រុស", fromClass: "ថ្នាក់ទី ៩A", theory: 75, practice: 76 },
            { no: 8, name: "ឡេង មុន្នីរ័ត្ន", gender: "ស្រី", fromClass: "ថ្នាក់ទី ៩B", theory: 70, practice: 74 }
        ]
    },
    {
        id: "attendance_conduct",
        name: "បញ្ជីវត្តមាន និងការវាយតម្លៃអាកប្បកិរិយា (Attendance & Conduct)",
        isCustom: false,
        description: "តាមដានអវត្តមានសិស្ស (មានច្បាប់/ឥតច្បាប់) និងពិន្ទុអាកប្បកិរិយា/វិន័យប្រចាំខែ",
        ruleType: "attendance_conduct",
        passThreshold: 70,
        ruleText: "អវត្តមានសរុប ≤ 5 & វិន័យ ≥ 70 → ល្អ/ល្អណាស់ | អវត្តមាន > 10 ឬ វិន័យ < 50 → ត្រូវកែលម្អ",
        format: {
            deptLine1: "ការិយាល័យ.អយក ស្រុកចំការលើ",
            deptLine2: "វិទ្យាល័យ ហ៊ុន សែន ចំការលើ",
            kingdomTitle: "ព្រះរាជាណាចក្រកម្ពុជា",
            kingdomMotto: "ជាតិ សាសនា ព្រះមហាក្សត្រ",
            roomNumber: "បន្ទប់ ៧A",
            examTitle: "បញ្ជីតាមដានវត្តមាន និងកម្រិតវិន័យសិស្សប្រចាំខែ",
            examSession: "ប្រចាំខែ៖ កញ្ញា ២០២៦",
            verifiers: [
                "ប្រធានថ្នាក់",
                "គ្រូបន្ទុកថ្នាក់",
                "ទទួលបន្ទុកយុវជន/វិន័យ"
            ],
            summaryLabel1: "ចំនួនសិស្សក្នុងបញ្ជីសរុប : ",
            summaryUnit1: " នាក់ក្នុងនោះស្រី : ",
            summaryEnd1: " នាក់",
            summaryLabel2: "សិស្សមានវិន័យកម្រិតល្អឡើងទៅ : ",
            summaryUnit2: " នាក់ក្នុងនោះស្រី : ",
            summaryEnd2: " នាក់",
            dateLunar: "ថ្ងៃពុធ ០៥កើត ខែអស្សុជ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០",
            dateSolar: "ត្រូវនឹង ថ្ងៃទី៣០ ខែកញ្ញា ឆ្នាំ២០២៦",
            signTitle: "នាយកវិទ្យាល័យ"
        },
        columns: [
            { key: "no", label: "លេខ", type: "no", width: "45px", align: "center" },
            { key: "name", label: "គោត្តនាម-នាម", type: "name", width: "165px", align: "left" },
            { key: "gender", label: "ភេទ", type: "gender", width: "50px", align: "center" },
            { key: "fromClass", label: "ថ្នាក់", type: "class", width: "60px", align: "center" },
            { key: "excused", label: "មានច្បាប់", type: "score", width: "65px", align: "center" },
            { key: "unexcused", label: "ឥតច្បាប់", type: "score", width: "65px", align: "center" },
            { key: "totalAbsence", label: "សរុបអវត្តមាន", type: "total_absence", width: "75px", align: "center" },
            { key: "conductScore", label: "ពិន្ទុវិន័យ", type: "score", maxScore: 100, width: "68px", align: "center" },
            { key: "conductLevel", label: "កម្រិតវិន័យ", type: "conduct_level", width: "80px", align: "center" },
            { key: "result", label: "ការវាយតម្លៃ", type: "result", width: "75px", align: "center" }
        ],
        sampleStudents: [
            { no: 1, name: "ជា សុជាតិ", gender: "ប្រុស", fromClass: "7A", excused: 0, unexcused: 0, conductScore: 98 },
            { no: 2, name: "សុន ទេវី", gender: "ស្រី", fromClass: "7A", excused: 1, unexcused: 0, conductScore: 95 },
            { no: 3, name: "ភិន រតនៈ", gender: "ប្រុស", fromClass: "7A", excused: 2, unexcused: 0, conductScore: 90 },
            { no: 4, name: "នួន ធីតា", gender: "ស្រី", fromClass: "7A", excused: 1, unexcused: 1, conductScore: 85 },
            { no: 5, name: "ពេជ្រ ចំរើន", gender: "ប្រុស", fromClass: "7A", excused: 3, unexcused: 2, conductScore: 75 },
            { no: 6, name: "កែវ សោភា", gender: "ស្រី", fromClass: "7A", excused: 2, unexcused: 3, conductScore: 68 },
            { no: 7, name: "សួស សំណាង", gender: "ប្រុស", fromClass: "7A", excused: 4, unexcused: 7, conductScore: 45 },
            { no: 8, name: "ចាន់ ស៊ីណាត", gender: "ស្រី", fromClass: "7A", excused: 0, unexcused: 1, conductScore: 92 }
        ]
    },
    {
        id: "monthly_assessment",
        name: "បញ្ជីស្រង់ពិន្ទុប្រចាំខែទូទៅ (Monthly Test Evaluation)",
        isCustom: false,
        description: "ការប្រឡងប្រចាំខែ ៤ មុខវិជ្ជា (ខ្មែរ, គណិត, វិទ្យាសាស្ត្រ, សង្គមវិជ្ជា) មធ្យមភាគ និងចំណាត់ថ្នាក់",
        ruleType: "total_threshold",
        passThreshold: 50,
        ruleText: "ពិន្ទុសរុប ≥ 50/100 → ជាប់ | < 50 → ធ្លាក់ (មានមធ្យមភាគ & ចំណាត់ថ្នាក់)",
        format: {
            deptLine1: "ការិយាល័យ.អយក ស្រុកចំការលើ",
            deptLine2: "វិទ្យាល័យ ហ៊ុន សែន ចំការលើ",
            kingdomTitle: "ព្រះរាជាណាចក្រកម្ពុជា",
            kingdomMotto: "ជាតិ សាសនា ព្រះមហាក្សត្រ",
            roomNumber: "បន្ទប់ទី០៥",
            examTitle: "បញ្ជីស្រង់ពិន្ទុប្រចាំខែ កញ្ញា ថ្នាក់ទី ៧B",
            examSession: "សម័យប្រឡង៖ ៣០ កញ្ញា ២០២៦",
            verifiers: [
                "គ្រូបន្ទុកថ្នាក់",
                "ប្រធានក្រុមបច្ចេកទេស",
                "ផ្ទៀងផ្ទាត់ដោយ"
            ],
            summaryLabel1: "ចំនួនសិស្សប្រឡងសរុប : ",
            summaryUnit1: " នាក់ក្នុងនោះស្រី : ",
            summaryEnd1: " នាក់",
            summaryLabel2: "សិស្សប្រឡងជាប់សរុប : ",
            summaryUnit2: " នាក់ក្នុងនោះស្រី : ",
            summaryEnd2: " នាក់",
            dateLunar: "ថ្ងៃពុធ ០៥កើត ខែអស្សុជ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០",
            dateSolar: "ត្រូវនឹង ថ្ងៃទី៣០ ខែកញ្ញា ឆ្នាំ២០២៦",
            signTitle: "នាយកវិទ្យាល័យ"
        },
        columns: [
            { key: "no", label: "លេខ", type: "no", width: "42px", align: "center" },
            { key: "name", label: "គោត្តនាម-នាម", type: "name", width: "150px", align: "left" },
            { key: "gender", label: "ភេទ", type: "gender", width: "48px", align: "center" },
            { key: "fromClass", label: "ថ្នាក់", type: "class", width: "55px", align: "center" },
            { key: "khmer", label: "ខ្មែរ", type: "score", maxScore: 25, width: "50px", align: "center" },
            { key: "math", label: "គណិត", type: "score", maxScore: 25, width: "50px", align: "center" },
            { key: "science", label: "វិទ្យាសាស្ត្រ", type: "score", maxScore: 25, width: "60px", align: "center" },
            { key: "social", label: "សង្គម", type: "score", maxScore: 25, width: "50px", align: "center" },
            { key: "total", label: "សរុប", type: "total", width: "52px", align: "center" },
            { key: "average", label: "មធ្យមភាគ", type: "average", width: "58px", align: "center" },
            { key: "rank", label: "ចំណាត់ថ្នាក់", type: "rank", width: "58px", align: "center" },
            { key: "result", label: "លទ្ធផល", type: "result", width: "68px", align: "center" }
        ],
        sampleStudents: [
            { no: 1, name: "ភោគ សុខុម", gender: "ប្រុស", fromClass: "7B", khmer: 23, math: 24, science: 22, social: 23 },
            { no: 2, name: "នីតា សុវណ្ណី", gender: "ស្រី", fromClass: "7B", khmer: 22, math: 21, science: 20, social: 22 },
            { no: 3, name: "តេង វិសាល", gender: "ប្រុស", fromClass: "7B", khmer: 19, math: 20, science: 18, social: 19 },
            { no: 4, name: "ចិន្តា រស្មី", gender: "ស្រី", fromClass: "7B", khmer: 17, math: 18, science: 16, social: 17 },
            { no: 5, name: "អាន ពិសិដ្ឋ", gender: "ប្រុស", fromClass: "7B", khmer: 15, math: 14, science: 15, social: 16 },
            { no: 6, name: "សុភី ស្រីពៅ", gender: "ស្រី", fromClass: "7B", khmer: 12, math: 11, science: 13, social: 12 },
            { no: 7, name: "ម៉ម វណ្ណា", gender: "ប្រុស", fromClass: "7B", khmer: 10, math: 9, science: 11, social: 10 },
            { no: 8, name: "ឃីម ស្រីរ័ត្ន", gender: "ស្រី", fromClass: "7B", khmer: 20, math: 19, science: 18, social: 21 }
        ]
    }
];

/* ========================================================
   DOM Elements
   ======================================================== */
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const dropZone = document.getElementById('dropZone');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const studentTableBody = document.getElementById('studentTableBody');
const emptyNotice = document.getElementById('emptyNotice');
const studentTable = document.getElementById('studentTable');
const viewStatusMessage = document.getElementById('viewStatusMessage');
const activeFeatureRuleText = document.getElementById('activeFeatureRuleText');

const totalCountEl = document.getElementById('totalCount');
const passCountEl = document.getElementById('passCount');
const failCountEl = document.getElementById('failCount');

const summaryTotalEl = document.getElementById('summaryTotal');
const summaryFemaleEl = document.getElementById('summaryFemale');
const summaryPassedEl = document.getElementById('summaryPassed');
const summaryPassedFemaleEl = document.getElementById('summaryPassedFemale');

// Buttons & Feature Controls
const featureSelect = document.getElementById('featureSelect');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const sampleTemplateDropdownBtn = document.getElementById('sampleTemplateDropdownBtn');
const sampleTemplateDropdown = sampleTemplateDropdownBtn ? sampleTemplateDropdownBtn.closest('.dropdown') : null;
const downloadSampleExcelBtn = document.getElementById('downloadSampleExcelBtn');
const downloadSampleCsvBtn = document.getElementById('downloadSampleCsvBtn');
const viewSampleGuideBtn = document.getElementById('viewSampleGuideBtn');
const saveFeatureFormatBtn = document.getElementById('saveFeatureFormatBtn');
const saveFeatureBtnText = document.getElementById('saveFeatureBtnText');
const deleteFeatureFormatBtn = document.getElementById('deleteFeatureFormatBtn');
const openCreateFeatureModalBtn = document.getElementById('openCreateFeatureModalBtn');
const openManageFeaturesModalBtn = document.getElementById('openManageFeaturesModalBtn');
const deleteCurrentTemplateBtn = document.getElementById('deleteCurrentTemplateBtn');

const toggleScoresBtn = document.getElementById('toggleScoresBtn');
const scoreToggleLabel = document.getElementById('scoreToggleLabel');
const toggleDigitBtn = document.getElementById('toggleDigitBtn');
const digitModeLabel = document.getElementById('digitModeLabel');
const toggleEditBtn = document.getElementById('toggleEditBtn');
const editModeLabel = document.getElementById('editModeLabel');
const exportA4ImageBtn = document.getElementById('exportA4ImageBtn');
const printBtn = document.getElementById('printBtn');
const clearDataBtn = document.getElementById('clearDataBtn');

const exportDropdownBtn = document.getElementById('exportDropdownBtn');
const exportDropdown = exportDropdownBtn ? exportDropdownBtn.closest('.dropdown') : null;
const exportExcelAllBtn = document.getElementById('exportExcelAllBtn');
const exportExcelViewBtn = document.getElementById('exportExcelViewBtn');
const exportCsvAllBtn = document.getElementById('exportCsvAllBtn');
const exportCsvViewBtn = document.getElementById('exportCsvViewBtn');

const templateDropdownBtn = document.getElementById('templateDropdownBtn');
const templateDropdown = templateDropdownBtn ? templateDropdownBtn.closest('.dropdown') : null;
const saveTemplateBtn = document.getElementById('saveTemplateBtn');
const exportTemplateBtn = document.getElementById('exportTemplateBtn');
const importTemplateInput = document.getElementById('importTemplateInput');
const resetTemplateBtn = document.getElementById('resetTemplateBtn');
const addVerifierBtn = document.getElementById('addVerifierBtn');
const verifiersCol = document.getElementById('verifiersCol');

// Editable A4 Header & Footer
const deptLine1 = document.getElementById('deptLine1');
const deptLine2 = document.getElementById('deptLine2');
const kingdomTitle = document.getElementById('kingdomTitle');
const kingdomMotto = document.getElementById('kingdomMotto');
const examTitle = document.getElementById('examTitle');
const examSession = document.getElementById('examSession');
const roomNumber = document.getElementById('roomNumber');

const summaryLabel1 = document.getElementById('summaryLabel1');
const summaryUnit1 = document.getElementById('summaryUnit1');
const summaryEnd1 = document.getElementById('summaryEnd1');
const summaryLabel2 = document.getElementById('summaryLabel2');
const summaryUnit2 = document.getElementById('summaryUnit2');
const summaryEnd2 = document.getElementById('summaryEnd2');

const dateLunar = document.getElementById('dateLunar');
const dateSolar = document.getElementById('dateSolar');
const signTitle = document.getElementById('signTitle');

// Modals
const createFeatureModal = document.getElementById('createFeatureModal');
const closeCreateFeatureModalBtn = document.getElementById('closeCreateFeatureModalBtn');
const cancelCreateFeatureBtn = document.getElementById('cancelCreateFeatureBtn');
const saveCreateFeatureBtn = document.getElementById('saveCreateFeatureBtn');
const newFeatureName = document.getElementById('newFeatureName');
const newFeatureBase = document.getElementById('newFeatureBase');
const newFeatureExamTitle = document.getElementById('newFeatureExamTitle');
const newFeatureSession = document.getElementById('newFeatureSession');
const newFeatureRoom = document.getElementById('newFeatureRoom');
const newFeatureRuleType = document.getElementById('newFeatureRuleType');
const newFeatureThreshold = document.getElementById('newFeatureThreshold');
const addSubjectBtn = document.getElementById('addSubjectBtn');
const subjectsListContainer = document.getElementById('subjectsListContainer');
const calcIncludeTotal = document.getElementById('calcIncludeTotal');
const calcIncludeAverage = document.getElementById('calcIncludeAverage');
const calcIncludeRank = document.getElementById('calcIncludeRank');
const calcIncludeGrade = document.getElementById('calcIncludeGrade');
const calcIncludeResult = document.getElementById('calcIncludeResult');

const manageFeaturesModal = document.getElementById('manageFeaturesModal');
const closeManageFeaturesModalBtn = document.getElementById('closeManageFeaturesModalBtn');
const closeManageActionBtn = document.getElementById('closeManageActionBtn');
const manageFeaturesList = document.getElementById('manageFeaturesList');
const manageCreateNewBtn = document.getElementById('manageCreateNewBtn');

const sampleGuideModal = document.getElementById('sampleGuideModal');
const closeSampleGuideModalBtn = document.getElementById('closeSampleGuideModalBtn');
const closeSampleGuideActionBtn = document.getElementById('closeSampleGuideActionBtn');
const sampleGuidePreviewTable = document.getElementById('sampleGuidePreviewTable');
const guideLoadSampleActionBtn = document.getElementById('guideLoadSampleActionBtn');
const guideDownloadExcelBtn = document.getElementById('guideDownloadExcelBtn');
const guideDownloadCsvBtn = document.getElementById('guideDownloadCsvBtn');

function showBanner(message, type = 'info') {
    if (!viewStatusMessage) return;
    viewStatusMessage.className = 'view-status-banner no-print ' + type;
    viewStatusMessage.textContent = message;
    viewStatusMessage.style.display = 'block';
}

function hideBanner() {
    if (!viewStatusMessage) return;
    viewStatusMessage.style.display = 'none';
}

/* ========================================================
   Evaluation Engine (Universal for all Features)
   ======================================================== */

/**
 * Calculates total, average, ranks, grades, and pass/fail for a list of students
 * according to the active feature configuration.
 * @param {Array} list
 * @param {Object} feature
 * @returns {Array} processed students with computed fields
 */
function evaluateAllStudents(list, feature = activeFeature) {
    if (!list || !feature) return [];

    const scoreCols = (feature.columns || []).filter(c => c.type === 'score');
    const isAttendance = feature.ruleType === 'attendance_conduct';

    // 1. Calculate totals and individual scores
    const computed = list.map((st, index) => {
        const student = { ...st };

        if (isAttendance) {
            const excused = parseScore(student.excused);
            const unexcused = parseScore(student.unexcused);
            const totalAbs = excused + unexcused;
            const conduct = parseScore(student.conductScore);
            student.totalAbsence = totalAbs;
            student.conductScore = conduct;

            // Conduct Level
            if (conduct >= 90 && totalAbs <= 2) student.conductLevel = 'ល្អណាស់';
            else if (conduct >= 70 && totalAbs <= 5) student.conductLevel = 'ល្អ';
            else if (conduct >= 50 && totalAbs <= 10) student.conductLevel = 'មធ្យម';
            else student.conductLevel = 'ត្រូវកែលម្អ';

            student.isPassed = (totalAbs <= 5 && conduct >= (feature.passThreshold || 70));
            student.calculatedTotal = conduct;
            return student;
        }

        // Standard score calculation
        let sum = 0;
        let count = 0;
        scoreCols.forEach(col => {
            const val = parseScore(student[col.key]);
            sum += val;
            count++;
        });

        student.calculatedTotal = sum;
        student.total = sum;

        // Average
        if (count > 0) {
            let avg = sum / count;
            student.calculatedAverage = Math.round(avg * 10) / 10;
            student.average = student.calculatedAverage;
        } else {
            student.calculatedAverage = 0;
            student.average = 0;
        }

        // Pass/Fail evaluation
        if (feature.ruleType === 'average_threshold') {
            student.isPassed = student.calculatedAverage >= (feature.passThreshold || 25.0);
        } else if (feature.ruleType === 'rank_honor') {
            student.isPassed = student.calculatedTotal >= (feature.passThreshold || 100);
        } else {
            // total_threshold
            student.isPassed = student.calculatedTotal >= (feature.passThreshold || 100);
        }

        // Letter Grade (A-F) based on percentage of max
        let maxPossible = 0;
        scoreCols.forEach(c => { maxPossible += (c.maxScore || 100); });
        const pct = maxPossible > 0 ? (sum / maxPossible) * 100 : (count > 0 ? (sum / (count * 100)) * 100 : 0);

        if (pct >= 90) student.calculatedGrade = 'A';
        else if (pct >= 80) student.calculatedGrade = 'B';
        else if (pct >= 70) student.calculatedGrade = 'C';
        else if (pct >= 60) student.calculatedGrade = 'D';
        else if (pct >= 50) student.calculatedGrade = 'E';
        else student.calculatedGrade = 'F';
        student.grade = student.calculatedGrade;

        // Khmer Diploma Mention
        if (pct >= 85) student.calculatedMention = 'ល្អប្រសើរ';
        else if (pct >= 75) student.calculatedMention = 'ល្អ';
        else if (pct >= 65) student.calculatedMention = 'ល្អបង្គួរ';
        else if (pct >= 50) student.calculatedMention = 'មធ្យម';
        else student.calculatedMention = 'ធ្លាក់';
        student.mention = student.calculatedMention;

        return student;
    });

    // 2. Calculate Ranks
    const sortedForRank = [...computed].sort((a, b) => (b.calculatedTotal || 0) - (a.calculatedTotal || 0));
    const rankMap = new Map();
    let currentRank = 1;

    for (let i = 0; i < sortedForRank.length; i++) {
        if (i > 0 && sortedForRank[i].calculatedTotal < sortedForRank[i - 1].calculatedTotal) {
            currentRank = i + 1;
        }
        rankMap.set(sortedForRank[i].no, currentRank);
    }

    computed.forEach(st => {
        st.calculatedRank = rankMap.get(st.no) || 1;
        st.rank = st.calculatedRank;

        // Award badge for honor rule
        if (feature.ruleType === 'rank_honor') {
            if (st.calculatedRank === 1) st.award = '🥇 មេដាយមាស';
            else if (st.calculatedRank === 2) st.award = '🥈 មេដាយប្រាក់';
            else if (st.calculatedRank === 3) st.award = '🥉 មេដាយសំរឹទ្ធ';
            else st.award = '🎖️ កិត្តិយស';
        }
    });

    return computed;
}

function isStudentPassed(student) {
    if (student.isPassed !== undefined) return Boolean(student.isPassed);
    if (!activeFeature) return true;
    if (activeFeature.ruleType === 'average_threshold') {
        return (student.average || 0) >= (activeFeature.passThreshold || 25);
    }
    const total = student.total !== undefined ? Number(student.total) : (parseScore(student.khmer) + parseScore(student.math));
    return total >= (activeFeature.passThreshold || 100);
}

/* ========================================================
   Statistics & Summary
   ======================================================== */
function updateStatistics(list) {
    const total = list.length;
    let passed = 0;
    let failed = 0;
    let femaleCount = 0;
    let passedFemaleCount = 0;

    for (let i = 0; i < list.length; i++) {
        const student = list[i];
        const isPass = isStudentPassed(student);
        const g = String(student.gender || '').trim().toLowerCase();
        const isFemale = (g === 'ស' || g === 'ស្រី' || g === 'female' || g === 'f');

        if (isPass) {
            passed++;
            if (isFemale) passedFemaleCount++;
        } else {
            failed++;
        }

        if (isFemale) {
            femaleCount++;
        }
    }

    if (totalCountEl) totalCountEl.textContent = formatNumber(total);
    if (passCountEl) passCountEl.textContent = formatNumber(passed);
    if (failCountEl) failCountEl.textContent = formatNumber(failed);

    const femaleFormatted = femaleCount < 10 ? '0' + femaleCount : String(femaleCount);
    const passedFemaleFormatted = passedFemaleCount < 10 ? '0' + passedFemaleCount : String(passedFemaleCount);

    if (summaryTotalEl) summaryTotalEl.textContent = formatNumber(total);
    if (summaryFemaleEl) summaryFemaleEl.textContent = formatNumber(femaleFormatted);
    if (summaryPassedEl) summaryPassedEl.textContent = formatNumber(passed);
    if (summaryPassedFemaleEl) summaryPassedFemaleEl.textContent = formatNumber(passedFemaleFormatted);
}

/* ========================================================
   Dynamic Table Rendering
   Adapts cleanly to any feature's custom columns
   ======================================================== */
function renderTableHeader(feature = activeFeature) {
    const thead = studentTable.querySelector('thead');
    if (!thead || !feature || !feature.columns) return;

    let tr = thead.querySelector('tr');
    if (!tr) {
        tr = document.createElement('tr');
        tr.id = 'tableHeaderRow';
        thead.appendChild(tr);
    }

    tr.innerHTML = feature.columns.map((col, idx) => {
        const isScore = col.type === 'score' || col.type === 'total' || col.type === 'average';
        const scoreClass = isScore ? 'col-score' : '';
        const hideStyle = (!showScores && isScore && col.type !== 'total') ? 'style="display:none;"' : '';
        const thClass = `th-${col.key} ${scoreClass}`;
        return `<th class="${thClass}" contenteditable="true" data-key="${col.key}" data-index="${idx}" ${hideStyle}>${escapeHtml(col.label)}</th>`;
    }).join('');

    // Attach header edit auto-save listener
    tr.querySelectorAll('th').forEach(th => {
        th.addEventListener('blur', function() {
            const idx = parseInt(this.getAttribute('data-index'), 10);
            if (activeFeature && activeFeature.columns && activeFeature.columns[idx]) {
                activeFeature.columns[idx].label = this.innerText.trim();
                saveActiveFeatureFormat(false);
            }
        });
    });
}

function renderTable(list) {
    if (!activeFeature) return;

    // Check if multi-column condensed styling is needed
    const sheet = document.getElementById('a4Sheet');
    if (sheet) {
        sheet.classList.remove('dense-mode', 'ultra-dense-mode', 'multi-col-mode');
        const colCount = (activeFeature.columns || []).length;
        if (colCount >= 11) sheet.classList.add('multi-col-mode');
        if (list.length > 24) sheet.classList.add('ultra-dense-mode');
        else if (list.length > 18) sheet.classList.add('dense-mode');
    }

    if (!list || list.length === 0) {
        studentTableBody.innerHTML = '';
        studentTable.style.display = 'none';
        emptyNotice.style.display = 'block';
        return;
    }

    studentTable.style.display = 'table';
    emptyNotice.style.display = 'none';

    renderTableHeader(activeFeature);

    const evaluatedList = evaluateAllStudents(list, activeFeature);

    const rowsHtml = evaluatedList.map((student, idx) => {
        const passed = isStudentPassed(student);
        const rowClass = passed ? 'pass-row' : 'fail-row';

        const cellsHtml = activeFeature.columns.map(col => {
            const isScore = col.type === 'score' || col.type === 'total' || col.type === 'average';
            const hideStyle = (!showScores && isScore && col.type !== 'total') ? 'style="display:none;"' : '';

            // 1. Student Number
            if (col.type === 'no') {
                const displayNo = formatNumber(student.no);
                const circle = passed
                    ? `<span class="pass-circle">${displayNo}</span>`
                    : `<span class="fail-number">${displayNo}</span>`;
                return `<td class="td-no" ${hideStyle}>${circle}</td>`;
            }

            // 2. Name
            if (col.type === 'name') {
                return `<td class="td-name" contenteditable="true" data-field="name" ${hideStyle}>${escapeHtml(student.name)}</td>`;
            }

            // 3. Gender
            if (col.type === 'gender') {
                return `<td class="td-gender" contenteditable="true" data-field="gender" ${hideStyle}>${escapeHtml(student.gender)}</td>`;
            }

            // 4. Class / School
            if (col.type === 'class') {
                return `<td class="td-class" contenteditable="true" data-field="${col.key}" ${hideStyle}>${escapeHtml(student[col.key] || '')}</td>`;
            }

            // 5. Score Column (Editable)
            if (col.type === 'score') {
                const val = student[col.key] !== undefined && student[col.key] !== null ? student[col.key] : '';
                return `<td class="td-score score-cell col-score" contenteditable="true" data-field="${col.key}" ${hideStyle}>${formatNumber(val)}</td>`;
            }

            // 6. Total (Calculated)
            if (col.type === 'total') {
                return `<td class="td-score td-total col-score" ${hideStyle}>${formatNumber(student.calculatedTotal || 0)}</td>`;
            }

            // 7. Average (Calculated)
            if (col.type === 'average') {
                return `<td class="td-score td-avg col-score" ${hideStyle}><strong>${formatNumber(student.calculatedAverage || 0)}</strong></td>`;
            }

            // 8. Total Absence
            if (col.type === 'total_absence') {
                return `<td class="td-score col-score" ${hideStyle}>${formatNumber(student.totalAbsence || 0)}</td>`;
            }

            // 9. Conduct Level
            if (col.type === 'conduct_level') {
                let badgeClass = 'badge-conduct-good';
                if (student.conductLevel === 'ល្អណាស់') badgeClass = 'badge-conduct-excel';
                else if (student.conductLevel === 'ត្រូវកែលម្អ') badgeClass = 'badge-conduct-warn';
                return `<td class="td-conduct" ${hideStyle}><span class="${badgeClass}">${student.conductLevel || ''}</span></td>`;
            }

            // 10. Rank
            if (col.type === 'rank') {
                const rankNum = formatNumber(student.calculatedRank || 1);
                return `<td class="td-rank" ${hideStyle}><span class="badge-rank">ទី ${rankNum}</span></td>`;
            }

            // 11. Grade (A-F)
            if (col.type === 'grade') {
                const g = student.calculatedGrade || 'C';
                const gClass = `badge-grade-${g.toLowerCase()}`;
                return `<td class="td-grade" ${hideStyle}><span class="${gClass}">${g}</span></td>`;
            }

            // 12. Mention Khmer
            if (col.type === 'mention_khmer') {
                return `<td class="td-mention" ${hideStyle}>${escapeHtml(student.calculatedMention || '')}</td>`;
            }

            // 13. Award (Honor/Medals)
            if (col.type === 'award') {
                let badgeCls = 'badge-honor';
                if (student.calculatedRank === 1) badgeCls = 'badge-gold';
                else if (student.calculatedRank === 2) badgeCls = 'badge-silver';
                else if (student.calculatedRank === 3) badgeCls = 'badge-bronze';
                return `<td class="td-award" ${hideStyle}><span class="${badgeCls}">${student.award || ''}</span></td>`;
            }

            // 14. Result
            if (col.type === 'result') {
                const badge = passed
                    ? `<span class="badge badge-pass">✓ ជាប់</span>`
                    : `<span class="badge badge-fail">✕ ធ្លាក់</span>`;
                return `<td class="td-result" ${hideStyle}>${badge}</td>`;
            }

            // Custom / Fallback
            return `<td contenteditable="true" data-field="${col.key}" ${hideStyle}>${escapeHtml(student[col.key] || '')}</td>`;
        }).join('');

        return `<tr class="${rowClass}" data-index="${idx}">${cellsHtml}</tr>`;
    }).join('');

    studentTableBody.innerHTML = rowsHtml;
    attachInlineEditEvents();
}

/**
 * Inline Editing for any table cell
 */
function attachInlineEditEvents() {
    const editableCells = studentTableBody.querySelectorAll('[contenteditable="true"]');

    editableCells.forEach(cell => {
        cell.addEventListener('blur', function() {
            const row = this.closest('tr');
            const idx = parseInt(row.getAttribute('data-index'), 10);
            const field = this.getAttribute('data-field');
            const textVal = this.textContent.trim();

            if (idx >= 0 && idx < filteredStudents.length) {
                const targetStudent = filteredStudents[idx];

                // Check if field is score type
                const colDef = (activeFeature.columns || []).find(c => c.key === field);
                if (colDef && colDef.type === 'score') {
                    targetStudent[field] = parseScore(textVal);
                } else {
                    targetStudent[field] = textVal;
                }

                // Sync master
                const master = allStudents.find(s => s.no === targetStudent.no);
                if (master) master[field] = targetStudent[field];

                // Re-evaluate and re-render row & stats
                renderTable(filteredStudents);
                updateStatistics(filteredStudents);
            }
        });

        cell.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    });
}

/* ========================================================
   Feature Switching, Format Application, & Persistence
   ======================================================== */

function populateFeatureSelector() {
    if (!featureSelect) return;

    featureSelect.innerHTML = '';

    const presetsGroup = document.createElement('optgroup');
    presetsGroup.label = 'ទម្រង់ប្រឡងស្តង់ដារ (System Presets)';

    const customGroup = document.createElement('optgroup');
    customGroup.label = 'ទម្រង់បង្កើតដោយខ្លួនឯង (Custom Features)';

    featuresList.forEach(feat => {
        const opt = document.createElement('option');
        opt.value = feat.id;
        opt.textContent = feat.name;
        if (feat.id === activeFeatureId) {
            opt.selected = true;
        }

        if (feat.isCustom) {
            customGroup.appendChild(opt);
        } else {
            presetsGroup.appendChild(opt);
        }
    });

    featureSelect.appendChild(presetsGroup);
    if (customGroup.children.length > 0) {
        featureSelect.appendChild(customGroup);
    }
}

function applyFeature(featureId, loadSampleIfEmpty = true) {
    const feat = featuresList.find(f => f.id === featureId) || featuresList[0];
    if (!feat) return;

    activeFeatureId = feat.id;
    activeFeature = feat;

    // 1. Update rule badge
    if (activeFeatureRuleText) {
        activeFeatureRuleText.innerHTML = feat.ruleText || feat.description || '';
    }

    // 2. Update save button label
    if (saveFeatureBtnText) {
        saveFeatureBtnText.textContent = `រក្សាទុក «${feat.name.length > 15 ? feat.name.slice(0, 15) + '...' : feat.name}»`;
    }

    // 3. Apply format to A4 sheet
    applyFormatToDOM(feat.format);

    // 4. Update dropdown selection
    if (featureSelect) {
        featureSelect.value = activeFeatureId;
    }

    // 5. If allStudents is empty or contains sample from previous, load this feature's sample
    if (allStudents.length === 0 && loadSampleIfEmpty) {
        loadActiveFeatureSample();
    } else {
        renderTable(filteredStudents.length > 0 ? filteredStudents : allStudents);
        updateStatistics(filteredStudents.length > 0 ? filteredStudents : allStudents);
    }

    // 6. Save active ID to storage
    saveFeaturesState(false);
}

function applyFormatToDOM(fmt) {
    if (!fmt) return;
    if (fmt.deptLine1 && deptLine1) deptLine1.innerText = fmt.deptLine1;
    if (fmt.deptLine2 && deptLine2) deptLine2.innerText = fmt.deptLine2;
    if (fmt.kingdomTitle && kingdomTitle) kingdomTitle.innerText = fmt.kingdomTitle;
    if (fmt.kingdomMotto && kingdomMotto) kingdomMotto.innerText = fmt.kingdomMotto;
    if (fmt.roomNumber && roomNumber) roomNumber.innerText = fmt.roomNumber;
    if (fmt.examTitle && examTitle) examTitle.innerText = fmt.examTitle;
    if (fmt.examSession && examSession) examSession.innerText = fmt.examSession;

    // Verifiers Lines
    if (Array.isArray(fmt.verifiers) && verifiersCol) {
        const existingLines = verifiersCol.querySelectorAll('.verifier-line');
        existingLines.forEach(l => l.remove());

        fmt.verifiers.forEach(text => {
            const line = document.createElement('div');
            line.className = 'verifier-line';
            line.contentEditable = 'true';
            line.innerText = text;
            if (addVerifierBtn) {
                verifiersCol.insertBefore(line, addVerifierBtn);
            } else {
                verifiersCol.appendChild(line);
            }
        });
    }

    // Summary labels
    if (fmt.summaryLabel1 !== undefined && summaryLabel1) summaryLabel1.innerText = fmt.summaryLabel1;
    if (fmt.summaryUnit1 !== undefined && summaryUnit1) summaryUnit1.innerText = fmt.summaryUnit1;
    if (fmt.summaryEnd1 !== undefined && summaryEnd1) summaryEnd1.innerText = fmt.summaryEnd1;
    if (fmt.summaryLabel2 !== undefined && summaryLabel2) summaryLabel2.innerText = fmt.summaryLabel2;
    if (fmt.summaryUnit2 !== undefined && summaryUnit2) summaryUnit2.innerText = fmt.summaryUnit2;
    if (fmt.summaryEnd2 !== undefined && summaryEnd2) summaryEnd2.innerText = fmt.summaryEnd2;

    // Date & Principal
    if (fmt.dateLunar && dateLunar) dateLunar.innerText = fmt.dateLunar;
    if (fmt.dateSolar && dateSolar) dateSolar.innerText = fmt.dateSolar;
    if (fmt.signTitle && signTitle) signTitle.innerText = fmt.signTitle;
}

function getCurrentFormatFromDOM() {
    const verifiers = Array.from(document.querySelectorAll('#verifiersCol .verifier-line'))
        .map(el => el.innerText.trim())
        .filter(t => t.length > 0);

    return {
        deptLine1: deptLine1 ? deptLine1.innerText.trim() : '',
        deptLine2: deptLine2 ? deptLine2.innerText.trim() : '',
        kingdomTitle: kingdomTitle ? kingdomTitle.innerText.trim() : '',
        kingdomMotto: kingdomMotto ? kingdomMotto.innerText.trim() : '',
        roomNumber: roomNumber ? roomNumber.innerText.trim() : '',
        examTitle: examTitle ? examTitle.innerText.trim() : '',
        examSession: examSession ? examSession.innerText.trim() : '',
        verifiers: verifiers.length > 0 ? verifiers : (activeFeature ? activeFeature.format.verifiers : []),
        summaryLabel1: summaryLabel1 ? summaryLabel1.innerText : '',
        summaryUnit1: summaryUnit1 ? summaryUnit1.innerText : '',
        summaryEnd1: summaryEnd1 ? summaryEnd1.innerText : '',
        summaryLabel2: summaryLabel2 ? summaryLabel2.innerText : '',
        summaryUnit2: summaryUnit2 ? summaryUnit2.innerText : '',
        summaryEnd2: summaryEnd2 ? summaryEnd2.innerText : '',
        dateLunar: dateLunar ? dateLunar.innerText.trim() : '',
        dateSolar: dateSolar ? dateSolar.innerText.trim() : '',
        signTitle: signTitle ? signTitle.innerText.trim() : ''
    };
}

/**
 * Saves current format specifically for the active feature
 */
function saveActiveFeatureFormat(notify = true) {
    if (!activeFeature) return;

    activeFeature.format = getCurrentFormatFromDOM();

    // Also update column labels from table headers
    const ths = document.querySelectorAll('#tableHeaderRow th');
    ths.forEach((th, idx) => {
        if (activeFeature.columns && activeFeature.columns[idx]) {
            activeFeature.columns[idx].label = th.innerText.trim();
        }
    });

    saveFeaturesState(notify);
}

function saveFeaturesState(notify = true) {
    try {
        localStorage.setItem('student_exam_features_v2', JSON.stringify({
            activeFeatureId,
            features: featuresList
        }));
    } catch (e) {
        console.warn('LocalStorage error:', e);
    }

    // Persist to server
    fetch('/api/save-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeFeatureId, features: featuresList })
    }).catch(() => {});

    if (notify) {
        showBanner(`បានរក្សាទុកទម្រង់ «${activeFeature.name}» ដោយជោគជ័យ!`, 'success');
    }
}

/**
 * Core Function to Delete a Format / Feature (User requested function)
 * - If custom feature: Deletes permanently from storage and server
 * - If preset feature: Resets customized format back to original default
 * - Automatically switches to remaining feature and updates UI
 * @param {string} featureId
 */
function deleteFormat(featureId = activeFeatureId) {
    const feat = featuresList.find(f => f.id === featureId);
    if (!feat) return;

    if (featuresList.length <= 1) {
        alert("មិនអាចលុបទម្រង់ទាំងអស់បានទេ! ត្រូវរក្សាទុកយ៉ាងហោចណាស់មួយទម្រង់។");
        return;
    }

    const confirmMsg = feat.isCustom
        ? `តើអ្នកពិតជាចង់លុបទម្រង់ «${feat.name}» នេះចោលទាំងស្រុងមែនទេ? (Are you sure you want to delete this format?)`
        : `តើអ្នកពិតជាចង់លុបទម្រង់ដែលបានកែសម្រួលសម្រាប់ «${feat.name}» ហើយកំណត់គំរូដើមឡើងវិញមែនទេ?`;

    if (!confirm(confirmMsg)) return;

    const deletedName = feat.name;

    if (feat.isCustom) {
        // Remove from list
        featuresList = featuresList.filter(f => f.id !== feat.id);

        // Delete from server
        fetch('/api/delete-feature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ featureId: feat.id })
        }).catch(() => {});
    } else {
        // Reset preset to initial default
        const def = DEFAULT_PRESET_FEATURES.find(d => d.id === feat.id);
        if (def) {
            const idx = featuresList.findIndex(f => f.id === feat.id);
            featuresList[idx] = JSON.parse(JSON.stringify(def));
        }
    }

    // If deleting active feature, switch to first available feature
    if (activeFeatureId === feat.id) {
        activeFeatureId = featuresList[0].id;
        applyFeature(activeFeatureId, true);
    } else {
        saveFeaturesState(false);
        populateFeatureSelector();
    }

    if (manageFeaturesModal && manageFeaturesModal.classList.contains('active')) {
        openManageFeaturesModal();
    }

    showBanner(`បានលុបទម្រង់ «${deletedName}» ដោយជោគជ័យ! (Deleted Format Successfully)`, 'info');
}

/* ========================================================
   Sample Data Management (Easy Use Feature)
   ======================================================== */

function loadActiveFeatureSample() {
    if (!activeFeature) return;

    const sample = activeFeature.sampleStudents || [];
    allStudents = JSON.parse(JSON.stringify(sample));
    filteredStudents = [...allStudents];

    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';

    renderTable(allStudents);
    updateStatistics(allStudents);

    showBanner(`បានផ្ទុកទិន្នន័យគំរូសាកល្បងសម្រាប់ «${activeFeature.name}» ដោយជោគជ័យ!`, 'success');
}

/**
 * Downloads a sample Excel file perfectly matching active feature columns
 */
function downloadSampleExcelFile() {
    if (!activeFeature) return;

    const sampleData = (activeFeature.sampleStudents && activeFeature.sampleStudents.length > 0)
        ? activeFeature.sampleStudents
        : [
            { no: 1, name: "សុខ ចាន់ដារ៉ា", gender: "ប្រុស", fromClass: "9A", khmer: 75, math: 80 },
            { no: 2, name: "ចាន់ ធីតា", gender: "ស្រី", fromClass: "9B", khmer: 85, math: 90 }
        ];

    const fileName = `គំរូ_${activeFeature.name.replace(/[\/\\?%*:|"<>]/g, '_')}.xlsx`;
    exportToExcel(sampleData, fileName);
}

/**
 * Downloads a sample CSV file matching active feature columns
 */
function downloadSampleCsvFile() {
    if (!activeFeature) return;

    const sampleData = (activeFeature.sampleStudents && activeFeature.sampleStudents.length > 0)
        ? activeFeature.sampleStudents
        : [
            { no: 1, name: "សុខ ចាន់ដារ៉ា", gender: "ប្រុស", fromClass: "9A", khmer: 75, math: 80 }
        ];

    const fileName = `គំរូ_${activeFeature.name.replace(/[\/\\?%*:|"<>]/g, '_')}.csv`;
    exportToCSV(sampleData, fileName);
}

/**
 * Renders the Sample Format Guide modal preview
 */
function openSampleGuideModal() {
    if (!activeFeature || !sampleGuidePreviewTable) return;

    const sampleGuideTitle = document.getElementById('sampleGuideTitle');
    if (sampleGuideTitle) {
        sampleGuideTitle.textContent = `គំរូទម្រង់ឯកសារ៖ ${activeFeature.name}`;
    }

    const cols = activeFeature.columns || [];
    const sampleRows = activeFeature.sampleStudents || [];

    let thsHtml = cols.map(c => `<th>${escapeHtml(c.label)}</th>`).join('');
    let rowsHtml = sampleRows.slice(0, 5).map(st => {
        let tdsHtml = cols.map(c => {
            let val = st[c.key];
            if (c.type === 'total') val = st.calculatedTotal || '';
            if (c.type === 'result') val = isStudentPassed(st) ? 'ជាប់' : 'ធ្លាក់';
            return `<td>${escapeHtml(val !== undefined && val !== null ? val : '')}</td>`;
        }).join('');
        return `<tr>${tdsHtml}</tr>`;
    }).join('');

    sampleGuidePreviewTable.innerHTML = `<thead><tr>${thsHtml}</tr></thead><tbody>${rowsHtml}</tbody>`;

    if (sampleGuideModal) sampleGuideModal.classList.add('active');
}

/* ========================================================
   Create New Feature System (Can create new feature and save name)
   ======================================================== */

function openCreateFeatureModal() {
    if (!createFeatureModal) return;

    // Reset inputs
    if (newFeatureName) newFeatureName.value = '';
    if (newFeatureExamTitle) newFeatureExamTitle.value = 'បញ្ជីស្រង់ពិន្ទុការប្រឡង...';
    if (newFeatureSession) newFeatureSession.value = 'សម័យប្រឡង៖ ' + new Date().toLocaleDateString('km-KH');
    if (newFeatureRoom) newFeatureRoom.value = 'បន្ទប់ទី០១';
    if (newFeatureThreshold) newFeatureThreshold.value = '100';

    // Populate base template dropdown
    if (newFeatureBase) {
        newFeatureBase.innerHTML = '<option value="">-- ចាប់ផ្តើមពីទម្រង់ទទេ (New Custom) --</option>';
        featuresList.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.id;
            opt.textContent = f.name;
            if (f.id === activeFeatureId) opt.selected = true;
            newFeatureBase.appendChild(opt);
        });
    }

    // Default subject builder list
    renderSubjectBuilder([
        { name: 'ខ្មែរ', max: 100 },
        { name: 'គណិត', max: 100 }
    ]);

    createFeatureModal.classList.add('active');
    if (newFeatureName) newFeatureName.focus();
}

function renderSubjectBuilder(subjects = []) {
    if (!subjectsListContainer) return;
    subjectsListContainer.innerHTML = '';

    subjects.forEach((subj, idx) => {
        const row = document.createElement('div');
        row.className = 'subject-builder-row';
        row.innerHTML = `
            <input type="text" class="subj-name" placeholder="ឈ្មោះមុខវិជ្ជា (ឧ. គីមី)" value="${escapeHtml(subj.name)}" required>
            <input type="number" class="subj-max" placeholder="ពិន្ទុពេញ" value="${subj.max || 100}" min="1">
            <button type="button" class="btn-remove-subj" title="លុបមុខវិជ្ជានេះ">&times;</button>
        `;

        row.querySelector('.btn-remove-subj').addEventListener('click', () => {
            const allRows = subjectsListContainer.querySelectorAll('.subject-builder-row');
            if (allRows.length > 1) {
                row.remove();
            } else {
                alert('ត្រូវមានមុខវិជ្ជាយ៉ាងហោចណាស់ ១!');
            }
        });

        subjectsListContainer.appendChild(row);
    });
}

if (addSubjectBtn) {
    addSubjectBtn.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'subject-builder-row';
        row.innerHTML = `
            <input type="text" class="subj-name" placeholder="ឈ្មោះមុខវិជ្ជាថ្មី" value="" required>
            <input type="number" class="subj-max" placeholder="ពិន្ទុពេញ" value="50" min="1">
            <button type="button" class="btn-remove-subj" title="លុបមុខវិជ្ជានេះ">&times;</button>
        `;
        row.querySelector('.btn-remove-subj').addEventListener('click', () => {
            const allRows = subjectsListContainer.querySelectorAll('.subject-builder-row');
            if (allRows.length > 1) row.remove();
        });
        subjectsListContainer.appendChild(row);
        const nameInput = row.querySelector('.subj-name');
        if (nameInput) nameInput.focus();
    });
}

// When user changes base template in Create Feature Modal, prefill settings
if (newFeatureBase) {
    newFeatureBase.addEventListener('change', (e) => {
        const baseId = e.target.value;
        const baseFeat = featuresList.find(f => f.id === baseId);
        if (!baseFeat) return;

        if (newFeatureExamTitle && baseFeat.format) newFeatureExamTitle.value = baseFeat.format.examTitle || '';
        if (newFeatureSession && baseFeat.format) newFeatureSession.value = baseFeat.format.examSession || '';
        if (newFeatureRoom && baseFeat.format) newFeatureRoom.value = baseFeat.format.roomNumber || '';
        if (newFeatureRuleType) newFeatureRuleType.value = baseFeat.ruleType || 'total_threshold';
        if (newFeatureThreshold) newFeatureThreshold.value = baseFeat.passThreshold || 100;

        const scoreCols = (baseFeat.columns || []).filter(c => c.type === 'score');
        renderSubjectBuilder(scoreCols.map(c => ({ name: c.label, max: c.maxScore || 100 })));
    });
}

function handleSaveCreateFeature() {
    const nameVal = newFeatureName ? newFeatureName.value.trim() : '';
    if (!nameVal) {
        alert('សូមបញ្ចូលឈ្មោះមុខងារ / ទម្រង់ថ្មី (Feature Name)!');
        if (newFeatureName) newFeatureName.focus();
        return;
    }

    const examTitleVal = newFeatureExamTitle ? newFeatureExamTitle.value.trim() : 'បញ្ជីស្រង់ពិន្ទុការប្រឡង';
    const sessionVal = newFeatureSession ? newFeatureSession.value.trim() : 'សម័យប្រឡង៖ ២០២៦';
    const roomVal = newFeatureRoom ? newFeatureRoom.value.trim() : 'បន្ទប់ទី១';
    const ruleTypeVal = newFeatureRuleType ? newFeatureRuleType.value : 'total_threshold';
    const passThresholdVal = newFeatureThreshold ? parseFloat(newFeatureThreshold.value) || 100 : 100;

    // Collect subjects from builder
    const subjRows = subjectsListContainer ? subjectsListContainer.querySelectorAll('.subject-builder-row') : [];
    const subjects = [];
    subjRows.forEach((r, i) => {
        const sName = r.querySelector('.subj-name').value.trim();
        const sMax = parseFloat(r.querySelector('.subj-max').value) || 100;
        if (sName) {
            subjects.push({
                key: `subj_${i + 1}`,
                label: sName,
                maxScore: sMax
            });
        }
    });

    if (subjects.length === 0) {
        alert('សូមបញ្ចូលយ៉ាងហោចណាស់មួយមុខវិជ្ជា!');
        return;
    }

    // Build columns array
    const columns = [
        { key: "no", label: "លេខ", type: "no", width: "42px", align: "center" },
        { key: "name", label: "គោត្តនាម-នាម", type: "name", width: "160px", align: "left" },
        { key: "gender", label: "ភេទ", type: "gender", width: "48px", align: "center" },
        { key: "fromClass", label: "ថ្នាក់", type: "class", width: "55px", align: "center" }
    ];

    subjects.forEach(s => {
        columns.push({
            key: s.key,
            label: s.label,
            type: "score",
            maxScore: s.maxScore,
            width: "55px",
            align: "center"
        });
    });

    if (calcIncludeTotal && calcIncludeTotal.checked) {
        columns.push({ key: "total", label: "សរុប", type: "total", width: "55px", align: "center" });
    }
    if (calcIncludeAverage && calcIncludeAverage.checked) {
        columns.push({ key: "average", label: "មធ្យមភាគ", type: "average", width: "60px", align: "center" });
    }
    if (calcIncludeRank && calcIncludeRank.checked) {
        columns.push({ key: "rank", label: "ចំណាត់ថ្នាក់", type: "rank", width: "60px", align: "center" });
    }
    if (calcIncludeGrade && calcIncludeGrade.checked) {
        columns.push({ key: "grade", label: "និទ្ទេស", type: "grade", width: "50px", align: "center" });
    }
    if (calcIncludeResult && calcIncludeResult.checked) {
        columns.push({ key: "result", label: "លទ្ធផល", type: "result", width: "75px", align: "center" });
    }

    // Auto-generate realistic authentic sample students for this new feature
    const sampleNames = [
        { name: "សុខ វិសាល", gender: "ប្រុស", class: "10A" },
        { name: "ចាន់ សុជាតា", gender: "ស្រី", class: "10A" },
        { name: "កែវ ចំរើន", gender: "ប្រុស", class: "10B" },
        { name: "ម៉ៅ សុផល", gender: "ស្រី", class: "10B" },
        { name: "អ៊ុំ វាសនា", gender: "ប្រុស", class: "10A" },
        { name: "ស៊ិន រស្មី", gender: "ស្រី", class: "10C" }
    ];

    const sampleStudents = sampleNames.map((item, idx) => {
        const student = {
            no: idx + 1,
            name: item.name,
            gender: item.gender,
            fromClass: item.class
        };

        subjects.forEach((s, sIdx) => {
            const ratio = (idx === 0) ? 0.9 : (idx === 1) ? 0.82 : (idx === 2) ? 0.72 : (idx === 3) ? 0.58 : 0.45;
            student[s.key] = Math.round(s.maxScore * ratio);
        });

        return student;
    });

    const newFeatureId = 'custom_' + Date.now();
    let ruleText = '';
    if (ruleTypeVal === 'average_threshold') {
        ruleText = `មធ្យមភាគ ≥ ${passThresholdVal} → ជាប់ | < ${passThresholdVal} → ធ្លាក់`;
    } else if (ruleTypeVal === 'rank_honor') {
        ruleText = `រៀបចំណាត់ថ្នាក់តាមពិន្ទុខ្ពស់បំផុត → 🥇 មាស | 🥈 ប្រាក់ | 🥉 សំរឹទ្ធ | 🎖️ កិត្តិយស`;
    } else if (ruleTypeVal === 'attendance_conduct') {
        ruleText = `អវត្តមានសរុប ≤ 5 & វិន័យ ≥ ${passThresholdVal} → ជាប់/ល្អ`;
    } else {
        ruleText = `ពិន្ទុសរុប ≥ ${passThresholdVal} → ជាប់ | < ${passThresholdVal} → ធ្លាក់`;
    }

    const currentFmt = getCurrentFormatFromDOM();
    const newFeature = {
        id: newFeatureId,
        name: nameVal,
        isCustom: true,
        description: `ទម្រង់បង្កើតដោយខ្លួនឯង៖ ${nameVal}`,
        ruleType: ruleTypeVal,
        passThreshold: passThresholdVal,
        ruleText: ruleText,
        format: {
            ...currentFmt,
            examTitle: examTitleVal,
            examSession: sessionVal,
            roomNumber: roomVal
        },
        columns: columns,
        sampleStudents: sampleStudents
    };

    featuresList.push(newFeature);
    populateFeatureSelector();
    applyFeature(newFeatureId, true);

    if (createFeatureModal) createFeatureModal.classList.remove('active');
    showBanner(`បានបង្កើត និងរក្សាទុកទម្រង់ថ្មី «${nameVal}» ដោយជោគជ័យ!`, 'success');
}

/* ========================================================
   Manage Features System (Rename, Duplicate, Reset, Delete)
   ======================================================== */

function openManageFeaturesModal() {
    if (!manageFeaturesModal || !manageFeaturesList) return;

    manageFeaturesList.innerHTML = '';

    featuresList.forEach(feat => {
        const card = document.createElement('div');
        card.className = `manage-feature-card ${feat.id === activeFeatureId ? 'active-card' : ''}`;

        const isCurrent = feat.id === activeFeatureId;
        const badge = feat.isCustom
            ? `<span class="feature-badge-custom">ទម្រង់បង្កើតដោយខ្លួនឯង</span>`
            : `<span class="feature-badge-preset">ទម្រង់ស្តង់ដារ</span>`;

        card.innerHTML = `
            <div class="feature-card-info">
                <div class="feature-card-title-row">
                    <span class="feature-card-title">${escapeHtml(feat.name)}</span>
                    ${badge}
                    ${isCurrent ? '<strong class="text-success" style="font-size:0.8rem;">(កំពុងប្រើ)</strong>' : ''}
                </div>
                <div class="feature-card-meta">
                    <span>${(feat.columns || []).length} ជួរឈរ | ${feat.ruleText || feat.description || ''}</span>
                </div>
            </div>
            <div class="feature-card-actions">
                ${!isCurrent ? `<button type="button" class="btn btn-sm btn-primary action-select" data-id="${feat.id}">ជ្រើសរើស</button>` : ''}
                <button type="button" class="btn btn-sm btn-outline action-rename" data-id="${feat.id}">ប្តូរឈ្មោះ</button>
                <button type="button" class="btn btn-sm btn-outline action-clone" data-id="${feat.id}">ចម្លង</button>
                ${!feat.isCustom ? `<button type="button" class="btn btn-sm btn-outline text-danger action-reset" data-id="${feat.id}">កំណត់ឡើងវិញ</button>` : ''}
                ${feat.isCustom ? `<button type="button" class="btn btn-sm btn-danger-outline action-delete" data-id="${feat.id}">លុប</button>` : ''}
            </div>
        `;

        // Events
        const selectBtn = card.querySelector('.action-select');
        if (selectBtn) {
            selectBtn.addEventListener('click', () => {
                applyFeature(feat.id, false);
                manageFeaturesModal.classList.remove('active');
            });
        }

        const renameBtn = card.querySelector('.action-rename');
        if (renameBtn) {
            renameBtn.addEventListener('click', () => {
                const newName = prompt('បញ្ចូលឈ្មោះថ្មីសម្រាប់ទម្រង់នេះ៖', feat.name);
                if (newName && newName.trim() && newName.trim() !== feat.name) {
                    feat.name = newName.trim();
                    saveFeaturesState(false);
                    populateFeatureSelector();
                    openManageFeaturesModal();
                    if (feat.id === activeFeatureId && saveFeatureBtnText) {
                        saveFeatureBtnText.textContent = `រក្សាទុក «${feat.name.length > 15 ? feat.name.slice(0, 15) + '...' : feat.name}»`;
                    }
                    showBanner(`បានប្តូរឈ្មោះជា «${feat.name}» ដោយជោគជ័យ!`, 'success');
                }
            });
        }

        const cloneBtn = card.querySelector('.action-clone');
        if (cloneBtn) {
            cloneBtn.addEventListener('click', () => {
                const cloned = JSON.parse(JSON.stringify(feat));
                cloned.id = 'custom_' + Date.now();
                cloned.name = `${feat.name} (ចម្លង)`;
                cloned.isCustom = true;
                featuresList.push(cloned);
                saveFeaturesState(false);
                populateFeatureSelector();
                openManageFeaturesModal();
                showBanner(`បានចម្លងទម្រង់ថ្មី «${cloned.name}» ដោយជោគជ័យ!`, 'success');
            });
        }

        const resetBtn = card.querySelector('.action-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (!confirm(`តើអ្នកពិតជាចង់កំណត់គំរូដើមឡើងវិញសម្រាប់ «${feat.name}» មែនទេ?`)) return;
                const defaultFeat = DEFAULT_PRESET_FEATURES.find(d => d.id === feat.id);
                if (defaultFeat) {
                    const idx = featuresList.findIndex(f => f.id === feat.id);
                    featuresList[idx] = JSON.parse(JSON.stringify(defaultFeat));
                    saveFeaturesState(false);
                    if (feat.id === activeFeatureId) {
                        applyFeature(feat.id, false);
                    }
                    openManageFeaturesModal();
                    showBanner(`បានកំណត់គំរូដើមឡើងវិញសម្រាប់ «${feat.name}» ដោយជោគជ័យ!`, 'info');
                }
            });
        }

        const deleteBtn = card.querySelector('.action-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                deleteFormat(feat.id);
            });
        }

        manageFeaturesList.appendChild(card);
    });

    manageFeaturesModal.classList.add('active');
}

/* ========================================================
   Excel / CSV Import Engine
   Universal column matching for any active feature
   ======================================================== */
function normalizeText(str) {
    if (!str) return '';
    return String(str).trim();
}

function processFile(file) {
    if (!file) return;

    if (typeof XLSX === 'undefined') {
        alert("កម្មវិធីអាន Excel (SheetJS) មិនទាន់ដំណើរការឡើយ! សូមពិនិត្យឯកសារ xlsx.full.min.js ឬភ្ជាប់អ៊ីនធឺណិត។");
        return;
    }

    showBanner(`កំពុងដំណើរការអានឯកសារ «${file.name}»...`);

    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                showBanner("ឯកសារដែលបានបញ្ចូលមិនមាន Sheet ណាមួយឡើយ!", "error");
                return;
            }

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const sheetRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

            if (!sheetRows || sheetRows.length === 0) {
                showBanner("ឯកសារដែលបានបញ្ចូលមិនមានទិន្នន័យឡើយ!", "error");
                return;
            }

            // Adapt A4 Header texts if present in top 6 rows
            for (let r = 0; r < Math.min(6, sheetRows.length); r++) {
                const row = sheetRows[r];
                if (!Array.isArray(row)) continue;
                for (let c = 0; c < row.length; c++) {
                    const text = normalizeText(row[c]);
                    if (text.includes('ការិយាល័យ.អយក') && deptLine1) deptLine1.textContent = text;
                    if (text.includes('វិទ្យាល័យ') && !text.includes('បញ្ជី') && deptLine2) deptLine2.textContent = text;
                    if (text.includes('បញ្ជីស្រង់ពិន្ទុ') || text.includes('បញ្ជីវត្តមាន') || text.includes('ប្រឡងឡើងថ្នាក់') || text.includes('ឡើងថ្នាក់')) {
                        const parts = text.split('\n');
                        if (parts[0] && examTitle) examTitle.textContent = parts[0].trim();
                        if (parts[1] && parts[1].includes('សម័យប្រឡង') && examSession) examSession.textContent = parts[1].trim();
                    }
                    if (text.includes('បន្ទប់ទី') && roomNumber) roomNumber.textContent = text;
                }
            }

            // Detect Header Row by searching for student name or common columns
            let headerRowIndex = -1;
            const currentCols = activeFeature ? activeFeature.columns : [];

            for (let r = 0; r < Math.min(25, sheetRows.length); r++) {
                const row = sheetRows[r];
                if (!Array.isArray(row)) continue;

                let matchCount = 0;
                for (let c = 0; c < row.length; c++) {
                    const cellVal = normalizeText(row[c]).toLowerCase().replace(/\s+/g, '');
                    if (cellVal.includes('គោត្តនាម') || cellVal === 'ឈ្មោះ' || cellVal === 'name') matchCount++;
                    if (cellVal === 'លេខ' || cellVal === 'no' || cellVal.includes('ល.រ')) matchCount++;
                    if (cellVal.includes('ខ្មែរ') || cellVal.includes('គណិត') || cellVal.includes('ពិន្ទុ') || cellVal.includes('សរុប')) matchCount++;
                }

                if (matchCount >= 2) {
                    headerRowIndex = r;
                    break;
                }
            }

            // Map columns dynamically
            const colIndexMap = {};
            if (headerRowIndex !== -1) {
                const hRow = sheetRows[headerRowIndex];
                for (let c = 0; c < hRow.length; c++) {
                    const cellVal = normalizeText(hRow[c]);
                    const compact = cellVal.replace(/\s+/g, '').toLowerCase();

                    // Check against active feature columns
                    for (const fCol of currentCols) {
                        const colKey = fCol.key;
                        const colLabel = fCol.label.replace(/\s+/g, '').toLowerCase();

                        if (compact === colLabel || compact === colKey.toLowerCase()) {
                            colIndexMap[colKey] = c;
                        } else if (fCol.type === 'no' && (compact === 'លេខ' || compact === 'no' || compact.startsWith('ល.រ'))) {
                            colIndexMap.no = c;
                        } else if (fCol.type === 'name' && (compact.includes('គោត្តនាម') || compact === 'ឈ្មោះ' || compact === 'name')) {
                            colIndexMap.name = c;
                        } else if (fCol.type === 'gender' && (compact === 'ភេទ' || compact === 'gender')) {
                            colIndexMap.gender = c;
                        } else if (fCol.type === 'class' && (compact.includes('ថ្នាក់') || compact.includes('មកពី') || compact.includes('សាលា'))) {
                            colIndexMap[colKey] = c;
                        }
                    }
                }
            }

            const importedStudents = [];

            if (headerRowIndex !== -1 && (colIndexMap.name !== undefined || colIndexMap.no !== undefined)) {
                for (let r = headerRowIndex + 1; r < sheetRows.length; r++) {
                    const row = sheetRows[r];
                    if (!row || !Array.isArray(row) || row.length === 0) continue;

                    const rawName = colIndexMap.name !== undefined ? normalizeText(row[colIndexMap.name]) : '';
                    if (!rawName) continue;
                    if (rawName.startsWith('បញ្ឈប់បញ្ជី') || rawName.startsWith('សរុប') || rawName.startsWith('សរុបរួម')) continue;

                    const rawNo = (colIndexMap.no !== undefined && row[colIndexMap.no] !== undefined && row[colIndexMap.no] !== '')
                        ? row[colIndexMap.no]
                        : (importedStudents.length + 1);

                    const studentObj = {
                        no: rawNo,
                        name: rawName,
                        gender: colIndexMap.gender !== undefined ? normalizeText(row[colIndexMap.gender]) : '',
                    };

                    // Populate all columns
                    currentCols.forEach(col => {
                        if (col.key === 'no' || col.key === 'name' || col.key === 'gender') return;
                        if (colIndexMap[col.key] !== undefined) {
                            const val = row[colIndexMap[col.key]];
                            studentObj[col.key] = col.type === 'score' ? parseScore(val) : normalizeText(val);
                        }
                    });

                    importedStudents.push(studentObj);
                }
            }

            if (importedStudents.length === 0) {
                showBanner("មិនអាចរកឃើញទិន្នន័យសិស្សក្នុងឯកសារនេះឡើយ! សូមពិនិត្យមើលក្បាលតារាង ឬទាញយកទម្រង់គំរូ។", "error");
                return;
            }

            allStudents = importedStudents;
            filteredStudents = [...allStudents];

            if (searchInput) searchInput.value = '';
            if (clearSearchBtn) clearSearchBtn.style.display = 'none';

            renderTable(allStudents);
            updateStatistics(allStudents);

            showBanner(`បានបញ្ចូលជោគជ័យនូវទិន្នន័យសិស្សចំនួន ${allStudents.length} នាក់ ពីឯកសារ «${file.name}»`, "success");

        } catch (error) {
            console.error("Error reading file:", error);
            showBanner("មានបញ្ហាក្នុងការអានឯកសារ Excel/CSV! សូមពិនិត្យឯកសារម្តងទៀត។", "error");
        } finally {
            if (fileInput) fileInput.value = '';
        }
    };

    reader.onerror = function() {
        showBanner("មានកំហុសក្នុងការអានឯកសារ!", "error");
        if (fileInput) fileInput.value = '';
    };

    reader.readAsArrayBuffer(file);
}

/* ========================================================
   Export Excel / CSV Engine
   Fully dynamic matching the active feature's columns
   ======================================================== */

function prepareExportData(studentList) {
    const evaluated = evaluateAllStudents(studentList, activeFeature);
    const cols = activeFeature ? activeFeature.columns : [];

    return evaluated.map(student => {
        const row = {};
        cols.forEach(col => {
            if (col.type === 'no') row[col.label] = student.no;
            else if (col.type === 'name') row[col.label] = student.name;
            else if (col.type === 'gender') row[col.label] = student.gender;
            else if (col.type === 'total') row[col.label] = student.calculatedTotal || 0;
            else if (col.type === 'average') row[col.label] = student.calculatedAverage || 0;
            else if (col.type === 'rank') row[col.label] = student.calculatedRank || 1;
            else if (col.type === 'grade') row[col.label] = student.calculatedGrade || '';
            else if (col.type === 'mention_khmer') row[col.label] = student.calculatedMention || '';
            else if (col.type === 'award') row[col.label] = student.award || '';
            else if (col.type === 'result') row[col.label] = isStudentPassed(student) ? 'ជាប់' : 'ធ្លាក់';
            else row[col.label] = student[col.key] !== undefined ? student[col.key] : '';
        });
        return row;
    });
}

function exportToExcel(list, fileName) {
    if (!list || list.length === 0) {
        alert("មិនមានទិន្នន័យសម្រាប់នាំចេញឡើយ!");
        return;
    }

    const cols = activeFeature ? activeFeature.columns : [];
    const evaluated = evaluateAllStudents(list, activeFeature);

    if (typeof ExcelJS !== 'undefined') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(activeFeature ? activeFeature.name.slice(0, 30) : 'លទ្ធផលសិស្ស');

        worksheet.columns = cols.map(c => ({
            header: c.label,
            key: c.key,
            width: c.type === 'name' ? 26 : c.type === 'class' ? 16 : 12
        }));

        // Style Header Row
        const headerRow = worksheet.getRow(1);
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.font = { name: 'Khmer OS Siemreap', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
                left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
        });

        // Add Data Rows
        evaluated.forEach(student => {
            const passed = isStudentPassed(student);
            const rowData = {};

            cols.forEach(col => {
                if (col.type === 'no') rowData[col.key] = student.no;
                else if (col.type === 'name') rowData[col.key] = student.name;
                else if (col.type === 'gender') rowData[col.key] = student.gender;
                else if (col.type === 'total') rowData[col.key] = student.calculatedTotal || 0;
                else if (col.type === 'average') rowData[col.key] = student.calculatedAverage || 0;
                else if (col.type === 'rank') rowData[col.key] = student.calculatedRank || 1;
                else if (col.type === 'grade') rowData[col.key] = student.calculatedGrade || '';
                else if (col.type === 'mention_khmer') rowData[col.key] = student.calculatedMention || '';
                else if (col.type === 'award') rowData[col.key] = student.award || '';
                else if (col.type === 'result') rowData[col.key] = passed ? 'ជាប់' : 'ធ្លាក់';
                else rowData[col.key] = student[col.key] !== undefined ? student[col.key] : '';
            });

            const row = worksheet.addRow(rowData);
            row.height = 24;

            cols.forEach(col => {
                const cell = row.getCell(col.key);
                cell.alignment = {
                    horizontal: col.type === 'name' ? 'left' : 'center',
                    vertical: 'middle'
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
                };

                if (col.type === 'result') {
                    cell.font = {
                        name: 'Khmer OS Siemreap',
                        color: { argb: passed ? 'FF16A34A' : 'FFDC2626' },
                        bold: true
                    };
                } else if (!passed && activeFeature.ruleType === 'total_threshold') {
                    cell.font = { name: 'Khmer OS Siemreap', strike: true, color: { argb: 'FFDC2626' } };
                } else {
                    cell.font = { name: 'Khmer OS Siemreap', size: 10 };
                }
            });
        });

        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showBanner(`បាននាំចេញឯកសារ Excel «${fileName}» ដោយជោគជ័យ!`, 'success');
        }).catch(err => {
            console.error('ExcelJS error, fallback to SheetJS:', err);
            fallbackSheetJSExport(list, fileName);
        });
    } else {
        fallbackSheetJSExport(list, fileName);
    }
}

function fallbackSheetJSExport(list, fileName) {
    const exportRows = prepareExportData(list);
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "លទ្ធផលសិស្ស");
    XLSX.writeFile(workbook, fileName);
    showBanner(`បាននាំចេញឯកសារ «${fileName}» ដោយជោគជ័យ!`, 'success');
}

function exportToCSV(list, fileName) {
    if (!list || list.length === 0) {
        alert("មិនមានទិន្នន័យសម្រាប់នាំចេញឡើយ!");
        return;
    }

    const exportRows = prepareExportData(list);
    if (exportRows.length === 0) return;

    const headers = Object.keys(exportRows[0]);

    function escapeCSVValue(val) {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    }

    let csvContent = headers.map(escapeCSVValue).join(',') + '\r\n';

    for (const row of exportRows) {
        const line = headers.map(h => escapeCSVValue(row[h])).join(',');
        csvContent += line + '\r\n';
    }

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showBanner(`បាននាំចេញឯកសារ CSV «${fileName}» ដោយជោគជ័យ!`, 'success');
}

/* ========================================================
   Search Functionality
   ======================================================== */
function handleSearch() {
    const keyword = searchInput.value.trim().toLowerCase();

    if (keyword === '') {
        clearSearchBtn.style.display = 'none';
        filteredStudents = [...allStudents];
        hideBanner();
    } else {
        clearSearchBtn.style.display = 'block';
        filteredStudents = allStudents.filter(student => {
            const noMatch = String(student.no || '').toLowerCase().includes(keyword);
            const nameMatch = String(student.name || '').toLowerCase().includes(keyword);
            return noMatch || nameMatch;
        });

        showBanner(`លទ្ធផលស្វែងរក៖ បង្ហាញសិស្ស ${filteredStudents.length} នាក់ (ពីក្នុងចំណោមសិស្សសរុប ${allStudents.length} នាក់)`);
    }

    updateStatistics(filteredStudents);
    renderTable(filteredStudents);
}

if (searchInput) searchInput.addEventListener('input', handleSearch);

if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        handleSearch();
        searchInput.focus();
    });
}

/* ========================================================
   A4 Image Capture (html2canvas)
   ======================================================== */
function exportA4Image() {
    const a4SheetEl = document.getElementById('a4Sheet');
    if (!a4SheetEl) return;

    if (typeof html2canvas === 'undefined') {
        alert("កម្មវិធី html2canvas មិនទាន់ដំណើរការឡើយ! សូមពិនិត្យឯកសារ html2canvas.min.js។");
        return;
    }

    showBanner("កំពុងបង្កើតផ្ទាំងរូបភាព A4... សូមរង់ចាំមួយភ្លែត!");

    const origText = exportA4ImageBtn ? exportA4ImageBtn.innerHTML : '';
    if (exportA4ImageBtn) {
        exportA4ImageBtn.innerHTML = '<span>កំពុងបង្កើតរូបភាព...</span>';
        exportA4ImageBtn.disabled = true;
    }

    const wasEditMode = isEditMode;
    if (wasEditMode) setEditMode(false);

    const a4WidthPx = 794;
    const a4HeightPx = 1123;

    html2canvas(a4SheetEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: a4WidthPx,
        windowWidth: a4WidthPx,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: function(element) {
            return element.classList.contains('no-print') || element.hasAttribute('data-html2canvas-ignore');
        }
    }).then(canvas => {
        if (wasEditMode) setEditMode(true);

        const dataUrl = canvas.toDataURL('image/png');
        const fileName = `Exam_Result_${activeFeature ? activeFeature.id : 'A4'}.png`;

        // Direct server save
        fetch('/api/save-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUrl, filename: fileName })
        }).then(r => r.json()).catch(() => {});

        // Browser download
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Preview modal
        const modal = document.getElementById('imagePreviewModal');
        const modalImg = document.getElementById('modalPreviewImg');
        const modalLink = document.getElementById('modalDownloadLink');

        if (modalImg) modalImg.src = dataUrl;
        if (modalLink) {
            modalLink.href = dataUrl;
            modalLink.download = fileName;
        }
        if (modal) modal.classList.add('active');

        showBanner(`បានទាញយក និងរក្សាទុករូបភាព «${fileName}» ដោយជោគជ័យ!`, 'success');

    }).catch(err => {
        console.error("html2canvas export error:", err);
        showBanner("មានបញ្ហាក្នុងការបង្កើតរូបភាព!", "error");
        if (wasEditMode) setEditMode(true);
    }).finally(() => {
        if (exportA4ImageBtn) {
            exportA4ImageBtn.innerHTML = origText;
            exportA4ImageBtn.disabled = false;
        }
    });
}

function setEditMode(active) {
    isEditMode = active;
    document.body.classList.toggle('edit-mode-on', isEditMode);
    const sheet = document.getElementById('a4Sheet');
    if (sheet) sheet.classList.toggle('edit-mode-on', isEditMode);

    if (toggleEditBtn) toggleEditBtn.classList.toggle('active', isEditMode);
    if (editModeLabel) {
        editModeLabel.textContent = isEditMode ? 'កែសម្រួលទម្រង់ (បើក)' : 'កែសម្រួលទម្រង់ (បិទ)';
    }
}

/* ========================================================
   Initial Setup & Event Listeners
   ======================================================== */

// Feature select listener
if (featureSelect) {
    featureSelect.addEventListener('change', (e) => {
        applyFeature(e.target.value, false);
    });
}

// Load sample button listener
if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', () => {
        loadActiveFeatureSample();
    });
}

if (guideLoadSampleActionBtn) {
    guideLoadSampleActionBtn.addEventListener('click', () => {
        if (sampleGuideModal) sampleGuideModal.classList.remove('active');
        loadActiveFeatureSample();
    });
}

// Download Sample buttons
if (downloadSampleExcelBtn) {
    downloadSampleExcelBtn.addEventListener('click', () => {
        if (sampleTemplateDropdown) sampleTemplateDropdown.classList.remove('open');
        downloadSampleExcelFile();
    });
}

if (guideDownloadExcelBtn) {
    guideDownloadExcelBtn.addEventListener('click', () => {
        downloadSampleExcelFile();
    });
}

if (downloadSampleCsvBtn) {
    downloadSampleCsvBtn.addEventListener('click', () => {
        if (sampleTemplateDropdown) sampleTemplateDropdown.classList.remove('open');
        downloadSampleCsvFile();
    });
}

if (guideDownloadCsvBtn) {
    guideDownloadCsvBtn.addEventListener('click', () => {
        downloadSampleCsvFile();
    });
}

if (viewSampleGuideBtn) {
    viewSampleGuideBtn.addEventListener('click', () => {
        if (sampleTemplateDropdown) sampleTemplateDropdown.classList.remove('open');
        openSampleGuideModal();
    });
}

// Save Format button
if (saveFeatureFormatBtn) {
    saveFeatureFormatBtn.addEventListener('click', () => {
        saveActiveFeatureFormat(true);
    });
}

// Delete Active Format button (User requested feature)
if (deleteFeatureFormatBtn) {
    deleteFeatureFormatBtn.addEventListener('click', () => {
        deleteFormat(activeFeatureId);
    });
}

// Delete from Template dropdown
if (deleteCurrentTemplateBtn) {
    deleteCurrentTemplateBtn.addEventListener('click', () => {
        if (templateDropdown) templateDropdown.classList.remove('open');
        deleteFormat(activeFeatureId);
    });
}

// Create Feature Modal
if (openCreateFeatureModalBtn) {
    openCreateFeatureModalBtn.addEventListener('click', openCreateFeatureModal);
}
if (closeCreateFeatureModalBtn) {
    closeCreateFeatureModalBtn.addEventListener('click', () => {
        if (createFeatureModal) createFeatureModal.classList.remove('active');
    });
}
if (cancelCreateFeatureBtn) {
    cancelCreateFeatureBtn.addEventListener('click', () => {
        if (createFeatureModal) createFeatureModal.classList.remove('active');
    });
}
if (saveCreateFeatureBtn) {
    saveCreateFeatureBtn.addEventListener('click', handleSaveCreateFeature);
}

// Manage Features Modal
if (openManageFeaturesModalBtn) {
    openManageFeaturesModalBtn.addEventListener('click', openManageFeaturesModal);
}
if (closeManageFeaturesModalBtn) {
    closeManageFeaturesModalBtn.addEventListener('click', () => {
        if (manageFeaturesModal) manageFeaturesModal.classList.remove('active');
    });
}
if (closeManageActionBtn) {
    closeManageActionBtn.addEventListener('click', () => {
        if (manageFeaturesModal) manageFeaturesModal.classList.remove('active');
    });
}
if (manageCreateNewBtn) {
    manageCreateNewBtn.addEventListener('click', () => {
        if (manageFeaturesModal) manageFeaturesModal.classList.remove('active');
        openCreateFeatureModal();
    });
}

// Sample Guide Modal Close
if (closeSampleGuideModalBtn) {
    closeSampleGuideModalBtn.addEventListener('click', () => {
        if (sampleGuideModal) sampleGuideModal.classList.remove('active');
    });
}
if (closeSampleGuideActionBtn) {
    closeSampleGuideActionBtn.addEventListener('click', () => {
        if (sampleGuideModal) sampleGuideModal.classList.remove('active');
    });
}

// Dropdown Toggles
if (sampleTemplateDropdownBtn && sampleTemplateDropdown) {
    sampleTemplateDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(sampleTemplateDropdown);
        sampleTemplateDropdown.classList.toggle('open');
    });
}

if (exportDropdownBtn && exportDropdown) {
    exportDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(exportDropdown);
        exportDropdown.classList.toggle('open');
    });
}

if (templateDropdownBtn && templateDropdown) {
    templateDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(templateDropdown);
        templateDropdown.classList.toggle('open');
    });
}

function closeAllDropdowns(except = null) {
    const dds = document.querySelectorAll('.dropdown');
    dds.forEach(d => {
        if (d !== except) d.classList.remove('open');
    });
}

document.addEventListener('click', () => closeAllDropdowns());

// Digits Mode Toggle
if (toggleDigitBtn) {
    toggleDigitBtn.addEventListener('click', () => {
        useKhmerDigits = !useKhmerDigits;
        digitModeLabel.textContent = useKhmerDigits ? 'លេខខ្មែរ (១, ២...)' : 'លេខអារ៉ាប់ (1, 2...)';
        renderTable(filteredStudents);
        updateStatistics(filteredStudents);
    });
}

// Toggle Score Columns
if (toggleScoresBtn) {
    toggleScoresBtn.addEventListener('click', () => {
        showScores = !showScores;
        scoreToggleLabel.textContent = showScores ? 'បង្ហាញពិន្ទុ (Score)' : 'លាក់ពិន្ទុ (Hide Score)';
        renderTable(filteredStudents);
    });
}

// Edit Mode Toggle
if (toggleEditBtn) {
    toggleEditBtn.addEventListener('click', () => {
        setEditMode(!isEditMode);
    });
}

// File Upload
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    });
}

// Drag & Drop
window.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (dropZone) dropZone.classList.add('drag-over');
});
window.addEventListener('dragleave', (e) => {
    if (e.relatedTarget === null && dropZone) {
        dropZone.classList.remove('drag-over');
    }
});
window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (dropZone) dropZone.classList.remove('drag-over');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
    }
});

// Export Dropdown Listeners
if (exportExcelAllBtn) {
    exportExcelAllBtn.addEventListener('click', () => {
        closeAllDropdowns();
        exportToExcel(allStudents, `Exam_Result_${activeFeature ? activeFeature.id : 'All'}.xlsx`);
    });
}
if (exportExcelViewBtn) {
    exportExcelViewBtn.addEventListener('click', () => {
        closeAllDropdowns();
        exportToExcel(filteredStudents, `Exam_Result_View.xlsx`);
    });
}
if (exportCsvAllBtn) {
    exportCsvAllBtn.addEventListener('click', () => {
        closeAllDropdowns();
        exportToCSV(allStudents, `Exam_Result_${activeFeature ? activeFeature.id : 'All'}.csv`);
    });
}
if (exportCsvViewBtn) {
    exportCsvViewBtn.addEventListener('click', () => {
        closeAllDropdowns();
        exportToCSV(filteredStudents, `Exam_Result_View.csv`);
    });
}

// Export Image Button
if (exportA4ImageBtn) {
    exportA4ImageBtn.addEventListener('click', exportA4Image);
}

// Print Button
if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
}

// Clear Data
if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
        if (allStudents.length === 0) {
            alert("មិនទាន់មានទិន្នន័យដើម្បីលុបនៅឡើយទេ!");
            return;
        }
        if (confirm("តើអ្នកពិតជាចង់សម្អាតទិន្នន័យសិស្សទាំងអស់មែនទេ?")) {
            allStudents = [];
            filteredStudents = [];
            if (fileInput) fileInput.value = '';
            if (searchInput) searchInput.value = '';
            if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            hideBanner();
            updateStatistics([]);
            renderTable([]);
        }
    });
}

// Verifiers adder
if (addVerifierBtn && verifiersCol) {
    addVerifierBtn.addEventListener('click', () => {
        const newLine = document.createElement('div');
        newLine.className = 'verifier-line';
        newLine.contentEditable = 'true';
        newLine.innerText = 'ហត្ថលេខាដោយ';
        verifiersCol.insertBefore(newLine, addVerifierBtn);
        newLine.focus();
        saveActiveFeatureFormat(false);
    });

    verifiersCol.addEventListener('keydown', (e) => {
        if (e.target && e.target.classList.contains('verifier-line')) {
            if ((e.key === 'Backspace' || e.key === 'Delete') && e.target.innerText.trim() === '') {
                const lines = verifiersCol.querySelectorAll('.verifier-line');
                if (lines.length > 1) {
                    e.preventDefault();
                    const prev = e.target.previousElementSibling;
                    e.target.remove();
                    if (prev && prev.focus) prev.focus();
                    saveActiveFeatureFormat(false);
                }
            }
        }
    });
}

// Auto-save format on typing on A4 sheet
let autoSaveTimer = null;
const a4SheetEl = document.getElementById('a4Sheet');
if (a4SheetEl) {
    a4SheetEl.addEventListener('input', (e) => {
        if (e.target && !e.target.closest('#studentTableBody')) {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                saveActiveFeatureFormat(false);
            }, 1500);
        }
    });
}

// Preview Modal Close
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalCloseActionBtn = document.getElementById('modalCloseActionBtn');
const imagePreviewModal = document.getElementById('imagePreviewModal');

if (modalCloseBtn && imagePreviewModal) {
    modalCloseBtn.addEventListener('click', () => imagePreviewModal.classList.remove('active'));
}
if (modalCloseActionBtn && imagePreviewModal) {
    modalCloseActionBtn.addEventListener('click', () => imagePreviewModal.classList.remove('active'));
}

/* ========================================================
   Initialization
   ======================================================== */
async function initApp() {
    // 1. Initialize features list from DEFAULT_PRESET_FEATURES
    featuresList = JSON.parse(JSON.stringify(DEFAULT_PRESET_FEATURES));

    // 2. Load from localStorage if present
    try {
        const saved = localStorage.getItem('student_exam_features_v2');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed.features) && parsed.features.length > 0) {
                featuresList = parsed.features;
                if (parsed.activeFeatureId) activeFeatureId = parsed.activeFeatureId;
            }
        }
    } catch (e) {}

    // 3. Fetch from Server
    try {
        const res = await fetch('/api/get-features');
        if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.features) && data.features.length > 0) {
                featuresList = data.features;
                if (data.activeFeatureId) activeFeatureId = data.activeFeatureId;
            }
        }
    } catch (e) {}

    populateFeatureSelector();
    applyFeature(activeFeatureId, true);
}

// Start application
initApp();
