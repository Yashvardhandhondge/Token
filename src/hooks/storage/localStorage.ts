import { useState, type Dispatch, type SetStateAction } from "react";
import secureLocalStorage from "react-secure-storage";

type UseLocalStorageReturnType<T> = [T, Dispatch<SetStateAction<T>>];

const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): UseLocalStorageReturnType<T> => {
  const [state, setState] = useState<T>(() => {
    try {
      const value = secureLocalStorage.getItem(key);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-base-to-string
      return value ? JSON.parse(value.toString()) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: SetStateAction<T>): void => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value;
      secureLocalStorage.setItem(key, JSON.stringify(valueToStore));
      setState(valueToStore);
    } catch (error) {}
  };

  return [state, setValue];
};

export default useLocalStorage;
