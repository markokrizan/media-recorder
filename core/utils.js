export const bytesToMB = (bytes) => {
  return bytes / (1024 * 1024);
};

export const differenceBy = (array1, array2, key) => {
  return array1.filter((a) => !array2.some((b) => b[key] === a[key]));
};

export const getVideoBlobDuration = async (blob) => {
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
