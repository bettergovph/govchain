import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
* Attempts to parse a string as JSON and returns an array of { label, value } pairs.
* If parsing fails, it returns null.
* @param {string} jsonString - The string to parse.
*/
export const tryParseData = (jsonString: string) => {
    try {
        const data = JSON.parse(jsonString);
        if (typeof data === 'object' && data !== null) {
            return data;
        }
        return null;
    } catch (error) {
        return null;
    }
};
