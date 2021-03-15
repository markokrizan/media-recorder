export const bytesToMB = (bytes) => {
  return bytes / (1024 * 1024);
};

export const differenceBy = (array1, array2, key) => {
  return array1.filter((a) => !array2.some((b) => b[key] === a[key]));
};

export const getMediaBlobDuration = async (blob) => {
  const tempVideoEl = document.createElement("video");

  const durationPromise = new Promise((resolve) =>
    tempVideoEl.addEventListener("loadedmetadata", () => {
      if (tempVideoEl.duration === Infinity) {
        tempVideoEl.currentTime = Number.MAX_SAFE_INTEGER;

        tempVideoEl.ontimeupdate = () => {
          tempVideoEl.ontimeupdate = null;
          resolve(tempVideoEl.duration);
          tempVideoEl.currentTime = 0;
        };
      } else {
        resolve(tempVideoEl.duration);
      }

      tempVideoEl.remove();
    })
  );

  tempVideoEl.src =
    typeof blob === "string" || blob instanceof String
      ? blob
      : window.URL.createObjectURL(blob);

  return durationPromise;
};

export const getSecondsAsTimeString = (seconds) => {
  if (!Number.isInteger(seconds)) {
    return;
  }

  const date = new Date(0, 0, 0, 0, 0, seconds);

  const startIndex = date.getHours() >= 1 ? 11 : 14;
  const endIndex = 19;

  return date.toISOString().substring(startIndex, endIndex);
};

export const mapPluggedOutDevice = (devices, pluggedOutDevice) => {
  return [...devices].map((device) => {
    if (device.deviceId === pluggedOutDevice.deviceId) {
      return {
        ...device,
        isPluggedOut: true,
      };
    }

    return device;
  });
};

export const generateRandomString = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
