import crypto from 'crypto';

function validateHookOrigin(
  request: Request,
  apiUrl: string,
  trelloSecret: string,
  hookCallbackUrl: string,
) {
  const base64Digest = (str: string) =>
    crypto.createHmac('sha1', trelloSecret).update(str).digest('base64');

  const content = JSON.stringify(request.body) + hookCallbackUrl;
  const doubleHash = base64Digest(content);
  const headerHash = request.headers['x-trello-webhook'];

  return doubleHash === headerHash;
}

export default validateHookOrigin;
