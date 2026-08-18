import { useHomeStore, HomeState } from "../stores/homeStore";

/** thin wrapper kept so every existing call site
(useHomeSelector(userId, selector)) keeps working unchanged
**/
export const useHomeSelector = <T>(
  _userId: string | undefined,
  selector: (home: HomeState) => T,
): T | undefined => {
  return useHomeStore(selector);
};
