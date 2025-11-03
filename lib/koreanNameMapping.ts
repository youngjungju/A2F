// ===== 음역 변환 알고리즘 =====

// 로마자 -> 한글 초성 매핑
const INITIAL_CONSONANTS: Record<string, string> = {
  // 복합 자음 (긴 것부터)
  'ch': 'ㅊ',
  'kk': 'ㄲ',
  'tt': 'ㄸ',
  'pp': 'ㅃ',
  'ss': 'ㅆ',
  'th': 'ㅅ',  // 영어 th는 한글로 ㅅ
  'sh': 'ㅅ',  // 영어 sh는 한글로 ㅅ
  // 단일 자음
  'g': 'ㄱ',
  'k': 'ㄱ',
  'n': 'ㄴ',
  'd': 'ㄷ',
  't': 'ㄷ',
  'r': 'ㄹ',
  'l': 'ㄹ',
  'm': 'ㅁ',
  'b': 'ㅂ',
  'p': 'ㅂ',
  's': 'ㅅ',
  'j': 'ㅈ',
  'h': 'ㅎ',
  'v': 'ㅂ',  // 영어 v는 한글로 ㅂ
  'f': 'ㅍ',  // 영어 f는 한글로 ㅍ
  'z': 'ㅈ',  // 영어 z는 한글로 ㅈ
  'c': 'ㅋ',  // 영어 c는 보통 ㅋ (ch가 아닌 경우)
};

// 로마자 -> 한글 중성 매핑 (긴 것부터 체크해야 함)
const VOWELS: Record<string, string> = {
  // 복합 모음 (먼저 체크)
  'ae': 'ㅐ',
  'yae': 'ㅒ',
  'eo': 'ㅓ',
  'yeo': 'ㅕ',
  'ye': 'ㅖ',
  'wa': 'ㅘ',
  'wae': 'ㅙ',
  'oe': 'ㅚ',
  'wo': 'ㅝ',
  'we': 'ㅞ',
  'wi': 'ㅟ',
  'eu': 'ㅡ',
  'ui': 'ㅢ',
  // 복합 모음 추가 (영어 발음 고려)
  'ia': 'ㅣㅏ',
  'io': 'ㅣㅗ',
  'oo': 'ㅜ',
  'ee': 'ㅣ',
  // 단순 모음
  'ya': 'ㅑ',
  'yo': 'ㅛ',
  'yu': 'ㅠ',
  'a': 'ㅏ',
  'e': 'ㅔ',
  'i': 'ㅣ',
  'o': 'ㅗ',
  'u': 'ㅜ',
};

// 로마자 -> 한글 종성 매핑
const FINAL_CONSONANTS: Record<string, string> = {
  // 2글자 종성
  'ng': 'ㅇ',
  'ck': 'ㄱ',
  'll': 'ㄹ',
  'ss': 'ㅅ',
  'th': 'ㅅ',  // th는 종성에서도 ㅅ
  // 1글자 종성
  'k': 'ㄱ',
  'g': 'ㄱ',
  'n': 'ㄴ',
  't': 'ㄷ',
  'd': 'ㄷ',
  'l': 'ㄹ',
  'r': 'ㄹ',
  'm': 'ㅁ',
  'p': 'ㅂ',
  'b': 'ㅂ',
  's': 'ㅅ',
  'x': 'ㄱㅅ',
  'z': 'ㅈ',
};

// 한글 자모 조합
const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const JUNGSUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

const JONGSUNG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// 자모를 한글 음절로 조합
function combineHangul(cho: string, jung: string, jong: string = ''): string {
  const choIndex = CHOSUNG.indexOf(cho);
  const jungIndex = JUNGSUNG.indexOf(jung);
  const jongIndex = JONGSUNG.indexOf(jong);

  if (choIndex === -1 || jungIndex === -1 || jongIndex === -1) {
    return '';
  }

  const unicode = 0xAC00 + (choIndex * 21 * 28) + (jungIndex * 28) + jongIndex;
  return String.fromCharCode(unicode);
}

// 로마자를 한글로 변환하는 메인 함수
function romanToKorean(roman: string): string {
  const syllables: string[] = [];
  let i = 0;
  const text = roman.toLowerCase().trim();

  while (i < text.length) {
    // 공백이나 하이픈은 그대로 유지
    if (text[i] === ' ' || text[i] === '-') {
      syllables.push(text[i]);
      i++;
      continue;
    }

    // 1. 초성 찾기 (긴 패턴부터 체크)
    let chosung = 'ㅇ'; // 기본값: 무음
    let matched = false;

    // 2글자 초성 먼저 체크 (ch, th, sh, kk, tt, pp, ss)
    for (let len = 2; len >= 1; len--) {
      if (!matched && i + len <= text.length) {
        const consonantCandidate = text.substring(i, i + len);
        if (INITIAL_CONSONANTS[consonantCandidate]) {
          chosung = INITIAL_CONSONANTS[consonantCandidate];
          i += len;
          matched = true;
          break;
        }
      }
    }

    // 초성이 없으면 모음으로 시작
    if (!matched) {
      chosung = 'ㅇ';
    }

    // 2. 중성(모음) 찾기
    let jungsung = '';
    matched = false;

    // 긴 모음부터 체크 (yae, wae, yeo 등)
    for (let len = 3; len >= 1; len--) {
      if (i + len <= text.length) {
        const vowelCandidate = text.substring(i, i + len);
        if (VOWELS[vowelCandidate]) {
          jungsung = VOWELS[vowelCandidate];
          i += len;
          matched = true;
          break;
        }
      }
    }

    // 모음을 찾지 못하면 스킵
    if (!matched) {
      i++;
      continue;
    }

    // 3. 종성 찾기 (선택적)
    let jongsung = '';

    // 다음 문자가 모음이 아니고, 공백/하이픈이 아닌 경우 종성 체크
    if (i < text.length && text[i] !== ' ' && text[i] !== '-') {
      // 종성 후보를 2글자부터 1글자까지 체크
      for (let jongLen = 2; jongLen >= 1; jongLen--) {
        if (i + jongLen <= text.length) {
          const jongCandidate = text.substring(i, i + jongLen);

          // 종성 후보가 매핑에 있는지 확인
          if (FINAL_CONSONANTS[jongCandidate]) {
            // 종성 뒤에 모음이 오는지 확인
            let hasVowelNext = false;

            for (let vlen = 3; vlen >= 1; vlen--) {
              if (i + jongLen + vlen <= text.length) {
                const nextVowel = text.substring(i + jongLen, i + jongLen + vlen);
                if (VOWELS[nextVowel]) {
                  hasVowelNext = true;
                  break;
                }
              }
            }

            // 다음에 모음이 없으면 종성으로 처리
            if (!hasVowelNext) {
              jongsung = FINAL_CONSONANTS[jongCandidate];
              i += jongLen;
              break;
            }
          }
        }
      }
    }

    // 4. 한글 음절 조합
    const hangul = combineHangul(chosung, jungsung, jongsung);
    if (hangul) {
      syllables.push(hangul);
    }
  }

  return syllables.join('');
}

// 영어 이름을 한글로 변환 (이름 형식 처리)
function transliterateEnglishName(englishName: string): string {
  // "First Last" 또는 "First-Last" 형식 처리
  const parts = englishName.split(/[\s-]+/);
  const koreanParts = parts.map(part => romanToKorean(part));
  return koreanParts.join(' ');
}

// ===== 한글 → 로마자 변환 알고리즘 =====

// 한글 음절을 자모로 분해
function decomposeHangul(char: string): { cho: string; jung: string; jong: string } | null {
  const code = char.charCodeAt(0);

  // 한글 음절 범위 체크 (가-힣)
  if (code < 0xAC00 || code > 0xD7A3) {
    return null;
  }

  const index = code - 0xAC00;
  const choIndex = Math.floor(index / (21 * 28));
  const jungIndex = Math.floor((index % (21 * 28)) / 28);
  const jongIndex = index % 28;

  return {
    cho: CHOSUNG[choIndex],
    jung: JUNGSUNG[jungIndex],
    jong: JONGSUNG[jongIndex],
  };
}

// 초성 → 로마자 매핑
const CHO_TO_ROMAN: Record<string, string> = {
  'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt',
  'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp',
  'ㅅ': 's', 'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj',
  'ㅊ': 'ch', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h'
};

// 중성 → 로마자 매핑
const JUNG_TO_ROMAN: Record<string, string> = {
  'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae',
  'ㅓ': 'eo', 'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye',
  'ㅗ': 'o', 'ㅘ': 'wa', 'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo',
  'ㅜ': 'u', 'ㅝ': 'wo', 'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu',
  'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i'
};

// 종성 → 로마자 매핑
const JONG_TO_ROMAN: Record<string, string> = {
  '': '', 'ㄱ': 'k', 'ㄲ': 'k', 'ㄳ': 'k', 'ㄴ': 'n',
  'ㄵ': 'n', 'ㄶ': 'n', 'ㄷ': 't', 'ㄹ': 'l', 'ㄺ': 'k',
  'ㄻ': 'm', 'ㄼ': 'l', 'ㄽ': 'l', 'ㄾ': 'l', 'ㄿ': 'p',
  'ㅀ': 'l', 'ㅁ': 'm', 'ㅂ': 'p', 'ㅄ': 'p', 'ㅅ': 't',
  'ㅆ': 't', 'ㅇ': 'ng', 'ㅈ': 't', 'ㅊ': 't', 'ㅋ': 'k',
  'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 't'
};

// 한글을 로마자로 변환
function koreanToRoman(korean: string): string {
  const result: string[] = [];
  const text = korean.trim();

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // 공백이나 특수문자는 그대로 유지
    if (char === ' ' || char === '-') {
      result.push(char);
      continue;
    }

    // 한글이 아닌 경우 그대로 추가
    const decomposed = decomposeHangul(char);
    if (!decomposed) {
      result.push(char);
      continue;
    }

    const { cho, jung, jong } = decomposed;

    // 초성 추가
    const choRoman = CHO_TO_ROMAN[cho] || '';

    // 중성 추가
    const jungRoman = JUNG_TO_ROMAN[jung] || '';

    // 종성 추가 (다음 글자가 있는지 확인)
    let jongRoman = '';
    if (jong && i < text.length - 1) {
      // 다음 글자가 한글인 경우, 연음 규칙 적용
      const nextDecomposed = decomposeHangul(text[i + 1]);
      if (nextDecomposed && nextDecomposed.cho === 'ㅇ') {
        // 연음: 종성을 다음 음절의 초성으로 이동
        // 예: "한국" → "ha-n-guk"이 아니라 "han-guk"
        jongRoman = JONG_TO_ROMAN[jong] || '';
      } else {
        jongRoman = JONG_TO_ROMAN[jong] || '';
      }
    } else if (jong) {
      jongRoman = JONG_TO_ROMAN[jong] || '';
    }

    result.push(choRoman + jungRoman + jongRoman);
  }

  return result.join('');
}

// 한국어 이름을 영어로 변환 (이름 형식 처리)
function transliterateKoreanName(koreanName: string): string {
  // "성 이름" 또는 "성-이름" 형식 처리
  const parts = koreanName.split(/[\s-]+/);
  const romanParts = parts.map(part => {
    const roman = koreanToRoman(part);
    // 첫 글자만 대문자로
    return roman.charAt(0).toUpperCase() + roman.slice(1);
  });

  return romanParts.join('-');
}

// ===== 기존 매핑 데이터 =====

// 영어 이름 -> 한국어 이름 매핑
// 검색 기능 향상을 위해 사용
export const NAME_MAPPING: Record<string, string> = {
  'Ahn Jung-hwan': '안정환',
  'Cha Du-ri': '차두리',
  'Cho Gue-sung': '조규성',
  'Cho Yu-min': '조유민',
  'Chun Sung-hoon': '천성훈',
  'Hong Hyun-seok': '홍현석',
  'Hong Jeong-ho': '홍정호',
  'Hwang Hee-chan': '황희찬',
  'Hwang In-beom': '황인범',
  'Hwang Ui-jo': '황의조',
  'Jeong Sang-bin': '정상빈',
  'Ji Dong-won': '지동원',
  'Jung Ho-yeon': '정호연',
  'Jung Seung-hyun': '정승현',
  'Jung Sung-ryong': '정성룡',
  'Jung Woo-young': '정우영',
  'Ki Sung-yueng': '기성용',
  'Kim Bo-kyung': '김보경',
  'Kim Hyun-woo': '김현우',
  'Kim Ji-soo': '김지수',
  'Kim Jin-su': '김진수',
  'Kim Jun-hong': '김준홍',
  'Kim Jung-min': '김정민',
  'Kim Kee-hee': '김기희',
  'Kim Min-jae': '김민재',
  'Kim Moon-hwan': '김문환',
  'Kim Nam-il': '김남일',
  'Kim Seung-gyu': '김승규',
  'Kim Yong-hak': '김용학',
  'Kim Young-gwon': '김영권',
  'Ko Young-jun': '고영준',
  'Koo Ja-cheol': '구자철',
  'Kwon Chang-hoon': '권창훈',
  'Kwon Kyung-won': '권경원',
  'Lee Beom-young': '이범영',
  'Lee Chun-soo': '이천수',
  'Lee Chung-yong': '이청용',
  'Lee Dong-gook': '이동국',
  'Lee Dong-gyeong': '이동경',
  'Lee Dong-jun': '이동준',
  'Lee Eul-yong': '이을용',
  'Lee Jae-sung': '이재성',
  'Lee Jin-hyun': '이진현',
  'Lee Kang-in': '이강인',
  'Lee Keun-ho': '이근호',
  'Lee Myung-jae': '이명재',
  'Lee Seung-jun': '이승준',
  'Lee Seung-woo': '이승우',
  'Lee Young-pyo': '이영표',
  'Moon Seon-min': '문선민',
  'Noah': '노아',
  'Oh Hyeon-gyu': '오현규',
  'Paik Seung-ho': '백승호',
  'Park Chu-young': '박주영',
  'Park Ji-sung': '박지성',
  'Park Joo-ho': '박주호',
  'Park Kyu-hyun': '박규현',
  'Seol Ki-hyeon': '설기현',
  'Son Heung-min': '손흥민',
  'Song Chong-gug': '송종국',
  'Suk Hyun-jun': '석현준',
  'Um Ji-sung': '엄지성',
  'Won Du-jae': '원두재',
  'Yang Hyun-jun': '양현준',
  'Yang Min-hyeok': '양민혁',
  'Yoon Jung-hwan': '윤정환',
};

// 한국어 이름 -> 영어 이름 역매핑 (검색 최적화용)
export const REVERSE_NAME_MAPPING: Record<string, string> = Object.entries(NAME_MAPPING)
  .reduce((acc, [eng, kor]) => {
    acc[kor] = eng;
    return acc;
  }, {} as Record<string, string>);

// 주어진 영어 이름에 대한 한국어 이름 반환
// 1. 먼저 매핑 데이터에서 찾기
// 2. 없으면 음역 알고리즘 사용
export function getKoreanName(englishName: string): string {
  // 매핑 데이터에 있으면 정확한 한국어 이름 반환
  if (NAME_MAPPING[englishName]) {
    return NAME_MAPPING[englishName];
  }

  // 없으면 음역 알고리즘으로 변환
  return transliterateEnglishName(englishName);
}

// 주어진 한국어 이름에 대한 영어 이름 반환
// 1. 먼저 역매핑 데이터에서 찾기
// 2. 없으면 로마자 표기법으로 변환
export function getEnglishName(koreanName: string): string {
  // 역매핑 데이터에 있으면 정확한 영어 이름 반환
  if (REVERSE_NAME_MAPPING[koreanName]) {
    return REVERSE_NAME_MAPPING[koreanName];
  }

  // 없으면 로마자 표기법으로 변환
  return transliterateKoreanName(koreanName);
}

// 검색용: 주어진 쿼리와 이름이 매칭되는지 확인 (양방향)
export function matchesSearch(playerName: string, playerNameKo: string, query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // 1. 직접 매칭
  if (playerName.toLowerCase().includes(lowerQuery) ||
      playerNameKo.toLowerCase().includes(lowerQuery)) {
    return true;
  }

  // 2. 쿼리가 한글인 경우: 한글 → 영어로 변환하여 비교
  const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(query);
  if (hasKorean) {
    const transliteratedQuery = transliterateKoreanName(query).toLowerCase();
    if (playerName.toLowerCase().includes(transliteratedQuery)) {
      return true;
    }
  }

  // 3. 쿼리가 영어인 경우: 영어 → 한글로 변환하여 비교
  const hasEnglish = /[a-zA-Z]/.test(query);
  if (hasEnglish) {
    const transliteratedQuery = transliterateEnglishName(query).toLowerCase();
    if (playerNameKo.toLowerCase().includes(transliteratedQuery)) {
      return true;
    }
  }

  return false;
}
