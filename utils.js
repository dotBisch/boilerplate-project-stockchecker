const crypto = require('crypto');

function anonymizeIP(ip) {
  // Hash the IP address with a salt for anonymization
  const hash = crypto.createHash('sha256');
  hash.update(ip + 'stockchecker_salt');
  return hash.digest('hex');
}

module.exports = { anonymizeIP };