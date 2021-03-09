import { useState } from "react";

const useSyncState = (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const setter = (newValue) =>
    new Promise((resolve) => {
      setValue(newValue);
      resolve(newValue);
    });

  return [value, setter];
};

export default useSyncState;
