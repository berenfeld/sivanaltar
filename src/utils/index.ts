let _lang = 'he';

export function setCurrentLang(lang: string) {
  _lang = lang;
}

export function createPageUrl(pageName: string) {
  return `/${_lang}/${pageName.replace(/ /g, '-')}`;
}
