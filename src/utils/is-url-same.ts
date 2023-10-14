import { URL } from 'node:url';

function removeTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export default function isUrlSame(href1: string, href2: string) {
  const url1 = new URL(removeTrailingSlash(href1));
  const url2 = new URL(removeTrailingSlash(href2));

  return url1.href === url2.href;
}
