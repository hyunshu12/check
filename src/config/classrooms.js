const parseList = (value) => value
    ? value
        .split(/\s*,\s*|\n+/)
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;
const defaultMain = ['305호', '301호', '체육관', '화장실', '세미나실', '외출', '기타', '복귀', '조기입실'];
const defaultExtra = [
    '기숙사',
    '급식실',
    '보건실',
    '과학실',
    '201호',
    '202호',
    '203호',
    '디지털 컨텐츠실',
    '대강당',
    '회계실습실',
    '302호',
    '303호',
    '304호',
    '306호',
    '307호',
    '휴머노이드실',
    '다목적 실습실',
    'IT 실습실',
    'IT프로젝트실',
    '크스실',
    'KT 실',
    '3D 애니메이션실',
    '앱창작실',
    '음악실',
    '교무실',
    '멀티미디어실',
    '비즈쿨실',
    '방송실',
    '시청각실',
    '귀가',
    '조기 입실',
    '소풍',
    '금요귀가',
    '복도',
    '아이맥실',
    '체육관',
];
export const defaultClassrooms = {
    main: defaultMain,
    extra: defaultExtra
};
const mainFromEnv = parseList(import.meta.env.VITE_CLASSROOMS_MAIN);
const extraFromEnv = parseList(import.meta.env.VITE_CLASSROOMS_EXTRA);
export const classroomSettings = {
    main: mainFromEnv && mainFromEnv.length > 0 ? mainFromEnv : defaultMain,
    extra: extraFromEnv && extraFromEnv.length > 0 ? extraFromEnv : defaultExtra
};
