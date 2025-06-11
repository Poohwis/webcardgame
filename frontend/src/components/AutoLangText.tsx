// Check if a single character is Thai
const isThaiChar = (char: string) => /[\u0E00-\u0E7F]/.test(char);

// Split the string into Thai and non-Thai runs
const splitByLanguage = (text: string) => {
  const result: { lang: string; text: string }[] = [];

  let current = '';
  let currentLang = isThaiChar(text[0]) ? 'th' : 'en';

  for (const char of text) {
    const charLang = isThaiChar(char) ? 'th' : 'en';
    if (charLang === currentLang) {
      current += char;
    } else {
      result.push({ lang: currentLang, text: current });
      current = char;
      currentLang = charLang;
    }
  }
  if (current) result.push({ lang: currentLang, text: current });

  return result;
};

export const AutoLangText = ({ children }: { children: string }) => {
  const chunks = splitByLanguage(children);
  return (
    <>
      {chunks.map((chunk, index) => (
        <span key={index} lang={chunk.lang}>
          {chunk.text}
        </span>
      ))}
    </>
  );
};
