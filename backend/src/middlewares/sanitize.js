import mongoSanitize from 'express-mongo-sanitize';

const prohibitedKey = /^\$|\./;

const sanitizeQueryString = (url) => {
  const separatorIndex = url.indexOf('?');
  if (separatorIndex === -1) return url;

  const path = url.slice(0, separatorIndex);
  const params = new URLSearchParams(url.slice(separatorIndex + 1));
  const sanitized = new URLSearchParams();

  for (const [key, value] of params) {
    if (prohibitedKey.test(key)) continue;
    sanitized.set(key, value);
  }

  return `${path}?${sanitized.toString()}`;
};

const sanitize = (req, _res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  req.url = sanitizeQueryString(req.url);
  next();
};

export default sanitize;
