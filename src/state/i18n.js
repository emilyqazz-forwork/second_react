import { useState, useEffect } from 'react';

export const translations = {
    ko: {
        nav_logo: "CHICKODE",
        nav_home: "홈",
        nav_play: "문제풀기",
        nav_note: "오답노트",
        nav_pattern: "패턴분석",
        nav_minigame: "미니게임",
        main_title: "CHICKODE",
        main_subtitle: "초보 개발자를 위한 자바 코딩도우미",
        modal_lang_title: "언어 선택",
        lang_java: "Java",
        lang_python: "Python (준비중)",
        lang_c: "C언어 (준비중)",
        modal_level_title: "난이도 선택",
        level_basic: "기초",
        level_mid: "중급",
        level_adv: "고급",
        modal_chapter_title: "챕터 선택",
        // Java 기초
        java_basic_1: "변수와 자료형",
        java_basic_2: "연산자와 표현식",
        java_basic_3: "조건문과 반복문",
        java_basic_4: "배열과 문자열",
        // Java 중급
        java_mid_1: "클래스와 객체",
        java_mid_2: "객체지향 핵심 4대 원칙",
        java_mid_3: "컬렉션 프레임워크",
        java_mid_4: "예외 처리",
        // Java 고급
        java_adv_1: "입출력과 파일",
        java_adv_2: "모던 자바",
        ch1_group: "Chapter 1. 자바 기초",
        ch1_1: "01. 자바 변수 기초",
        ch1_2: "02. 자바 출력 기초",
        ch2_group: "Chapter 2. 자바 제어문",
        ch2_1: "03. 조건문 (if, switch)",
        ch2_2: "04. 반복문 (for, while)",
        modal_quiz_title: "QUIZ SETTINGS",
        quiz_ratio: "객관식 / 주관식 비율",
        quiz_obj: "객관식",
        quiz_subj: "주관식",
        quiz_count: "문제 수 (1~20)",
        quiz_diff: "난이도",
        diff_easy: "하 (Easy)",
        diff_medium: "중 (Medium)",
        diff_hard: "상 (Hard)",
        btn_start_quiz: "퀴즈 시작",
        modal_settings_title: "설정",
        setting_theme: "테마 (Theme)",
        setting_language: "언어 (Language)",
        theme_light: "화이트 모드 (Light Mode)",
        theme_dark: "다크 모드 (Dark Mode)",
        btn_save: "저장",
        hint_1: "힌트 1",
        hint_2: "힌트 2",
        hint_3: "힌트 3",
        quiz_result_wait: "결과: 대기 중",
        btn_submit: "제출하기",
        chat_placeholder: "병아리 선배에게 질문하기...",
        btn_send: "전송",
        result_title: "QUIZ COMPLETE",
        res_total: "전체 문제 수",
        res_correct: "맞춘 문제 수",
        res_accuracy: "정답률",
        btn_go_home: "홈으로 돌아가기"
    },
    en: {
        nav_logo: "CHICKODE",
        nav_home: "Home",
        nav_play: "Play",
        nav_note: "Review Note",
        nav_pattern: "Pattern Analysis",
        nav_minigame: "Mini Game",
        main_title: "CHICKODE",
        main_subtitle: "Java Coding Assistant for Beginners",
        modal_lang_title: "Select Language",
        lang_java: "Java",
        lang_python: "Python (Coming Soon)",
        lang_c: "C Language (Coming Soon)",
        modal_level_title: "Select Level",
        level_basic: "Basic",
        level_mid: "Intermediate",
        level_adv: "Advanced",
        modal_chapter_title: "Select Chapter",
        java_basic_1: "Variables & Types",
        java_basic_2: "Operators & Expressions",
        java_basic_3: "Conditionals & Loops",
        java_basic_4: "Arrays & Strings",
        java_mid_1: "Classes & Objects",
        java_mid_2: "OOP Principles",
        java_mid_3: "Collections Framework",
        java_mid_4: "Exception Handling",
        java_adv_1: "I/O & Files",
        java_adv_2: "Modern Java",
        ch1_group: "Chapter 1. Java Basics",
        ch1_1: "01. Variables",
        ch1_2: "02. Standard Output",
        ch2_group: "Chapter 2. Control Flow",
        ch2_1: "03. Conditionals (if, switch)",
        ch2_2: "04. Loops (for, while)",
        modal_quiz_title: "QUIZ SETTINGS",
        quiz_ratio: "Multiple Choice / Coding Ratio",
        quiz_obj: "MCQ",
        quiz_subj: "Coding",
        quiz_count: "Questions (1~20)",
        quiz_diff: "Difficulty",
        diff_easy: "Easy",
        diff_medium: "Medium",
        diff_hard: "Hard",
        btn_start_quiz: "Start Quiz",
        modal_settings_title: "Global settings",
        setting_theme: "Theme",
        setting_language: "Language",
        theme_light: "Light Mode",
        theme_dark: "Dark Mode",
        btn_save: "Save",
        hint_1: "Hint 1",
        hint_2: "Hint 2",
        hint_3: "Hint 3",
        quiz_result_wait: "Result: Waiting",
        btn_submit: "Submit",
        chat_placeholder: "Ask Chick Senior...",
        btn_send: "Send",
        result_title: "QUIZ COMPLETE",
        res_total: "Total Questions",
        res_correct: "Correct Answers",
        res_accuracy: "Accuracy",
        btn_go_home: "Back to Home"
    }
};

export function loadPreferences() {
    return JSON.parse(localStorage.getItem('chickodePrefs') || '{"theme":"light", "lang":"ko"}');
}

export function savePreferences(prefs) {
    localStorage.setItem('chickodePrefs', JSON.stringify(prefs));
}

// React Hook for translations and theme
export function useI18n() {
    const [prefs, setPrefs] = useState(loadPreferences());

    useEffect(() => {
        if (prefs.theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.classList.remove('dark-mode');
        }
        savePreferences(prefs);
    }, [prefs.theme]);

    useEffect(() => {
        savePreferences(prefs);
    }, [prefs.lang]);

    const t = (key) => {
        const texts = translations[prefs.lang] || translations['ko'];
        return texts[key] || key;
    };

    return { params: prefs, setParams: setPrefs, t };
}
