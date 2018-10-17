"use strict";

const findRoot = require("find-root");
const flattenDeep = require("lodash.flattendeep");
const pathfinder = require("sass-pathfinder");
const packfinder = require("seed-packfinder");
const uniqBy = require("lodash.uniqby");

const root = findRoot(__dirname);

const getPackName = path => {
  if (!path || typeof path != "string") {
    return false;
  }
  const split = path.split("/");
  return split[split.length - 2];
};

const getPackPath = pack => {
  const pkgRoot = root.split("/node_modules")[0];
  if (!pack || typeof pack != "string") {
    return false;
  }
  return `${pkgRoot}/node_modules/${pack}/scss`;
};

const resolveImportDeps = packs => {
  var packs = packs.map(pack => {
    const packName = getPackName(pack);
    const packPath = getPackPath(packName);
    if (packs.includes(packPath)) {
      return packPath;
    } else {
      return pack;
    }
  });
  return packs;
};

const resolvePacks = packs => {
  let packList;
  packs ? packs : [];

  if (packs.length) {
    // Flatten the array to make it mapable
    packs = flattenDeep(packs);
    // Adjust pack list to respect project's deps
    packs = resolveImportDeps(packs);

    packList = packs.map(pack => {
      // Get the second last string within the path
      let packName = pack.split("/");
      packName = packName[packName.length - 2];
      // Return an object to make it possible to remove duplicates
      return {
        packName,
        path: pack
      };
    });

    // De-dup the pack list
    packList = uniqBy(packList, "packName");

    // Transform the list back into an array of paths
    packs = packList.map(pack => pack.path);
  }

  return packs;
};

const requirePack = pack => {
  if (!pack || typeof pack !== "string") {
    return;
  }
  pack = require(pack);
  if (typeof pack === "string" || pack instanceof Array === true) {
    return pack;
  } else {
    return "";
  }
};

const harvester = function() {
  // Define the export array
  let includePaths = [];
  const paths = pathfinder(arguments);
  const packs = packfinder.find();

  if (packs.length) {
    packs.forEach(pack => {
      includePaths.push(requirePack(pack));
    });
  }

  // Remove duplicate packs
  includePaths = resolvePacks(includePaths);

  // Add paths (arguments) to includePaths
  if (paths.length) {
    includePaths.push(paths);
  }

  // Return flattened array of paths from packs + arguments
  return pathfinder(includePaths);
};

module.exports = harvester;
