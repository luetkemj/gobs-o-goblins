export const cache = {
  entitiesAtLocation: {},
  z: 1,
};

export const addCache = (name, value) => {
  cache[name] = value;
};

export const readCache = (name) => cache[name];

export const addCacheSet = (name, key, value) => {
  if (cache[name][key]) {
    cache[name][key].add(value);
  } else {
    cache[name][key] = new Set();
    cache[name][key].add(value);
  }
};

export const deleteCacheSet = (name, key, value) => {
  if (cache[name][key] && cache[name][key].has(value)) {
    cache[name][key].delete(value);
  }
};

export const readCacheSet = (name, key, value) => {
  if (cache[name][key]) {
    if (value) {
      return cache[name][key].get(value);
    }

    return cache[name][key];
  }
};

export const serializeCache = () => {
  const entitiesAtLocation = Object.keys(cache.entitiesAtLocation).reduce(
    (acc, val) => {
      acc[val] = [...cache.entitiesAtLocation[val]];
      return acc;
    },
    {}
  );

  return {
    entitiesAtLocation,
    z: cache.z,
  };
};

export const deserializeCache = (data) => {
  const entitiesAtLocation = Object.keys(data.entitiesAtLocation).reduce(
    (acc, val) => {
      acc[val] = new Set(data.entitiesAtLocation[val]);
      return acc;
    },
    {}
  );

  return { entitiesAtLocation, z: data.z };
};

export const clearCache = () => {
  cache.entitiesAtLocation = {};
};

export default cache;
