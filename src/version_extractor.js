// Extract version numbers from file names.
'use strict';
let versionMatcher = /^0*(\d+)/;

/**
 * Extract version number from file name.
 *
 * @param fileName Filename to extract version from.
 *
 * @return Number|Boolean Matched number, or boolean false if not found.
 */
module.exports = function (fileName) {
  var matches = fileName.match(versionMatcher);

  if (matches) {
    return parseInt(matches[1], 10);
  }

  return false;
};
