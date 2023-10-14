function isStringSame(str1: string, str2: string) {
  str1 = str1.toLowerCase().trim();
  str2 = str2.toLowerCase().trim();

  return str1 === str2;
}

export default isStringSame;
