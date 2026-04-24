// Browser stub for Node.js 'fs' module.
// @asyncapi/parser imports fs at module level but only calls it when loading
// local files; our usage goes through URL fetch so these are never invoked.
const noop = () => {};
const noopCb = (_path, _opts, cb) => { if (typeof _opts === 'function') _opts(null, ''); else if (cb) cb(null, ''); };

exports.readFile = noopCb;
exports.writeFile = noop;
exports.readFileSync = () => '';
exports.writeFileSync = noop;
exports.existsSync = () => false;
exports.statSync = () => ({ isFile: () => false, isDirectory: () => false });
exports.stat = (_p, cb) => cb && cb(null, { isFile: () => false, isDirectory: () => false });
exports.readdir = (_p, cb) => cb && cb(null, []);
exports.mkdir = (_p, _o, cb) => { if (typeof _o === 'function') _o(null); else if (cb) cb(null); };
exports.promises = {
  readFile: () => Promise.resolve(''),
  writeFile: () => Promise.resolve(),
  stat: () => Promise.resolve({ isFile: () => false, isDirectory: () => false }),
  readdir: () => Promise.resolve([]),
  mkdir: () => Promise.resolve(),
};
exports.default = exports;
