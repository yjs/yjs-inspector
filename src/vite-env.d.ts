/// <reference types="vite/client" />
/// <reference types="unplugin-info/client" />

// Polyfill for `showOpenFilePicker` API
// See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/wicg-file-system-access/index.d.ts
// See also https://caniuse.com/?search=showOpenFilePicker
interface OpenFilePickerOptions {
  /**
   * A boolean value that defaults to `false`.
   * By default the picker should include an option to not apply any file type filters (instigated with the type option below). Setting this option to true means that option is not available.
   */
  excludeAcceptAllOption?: boolean | undefined;
  /**
   * By specifying an ID, the browser can remember different directories for different IDs. If the same ID is used for another picker, the picker opens in the same directory.
   */
  id?: string | undefined;
  /**
   * A boolean value that defaults to `false`.
   * When set to true multiple files may be selected.
   */
  multiple?: boolean | undefined;
  /**
   * A FileSystemHandle or a well known directory ("desktop", "documents", "downloads", "music", "pictures", or "videos") to open the dialog in.
   */
  startIn?:
    | "documents"
    | "desktop"
    | "downloads"
    | "home"
    | "pictures"
    | "videos"
    | "music"
    | "custom";
  /**
   * An Array of allowed file types to pick. Each item is an object with the following options.
   */
  types?:
    | {
        /**
         * An optional description of the category of files types allowed. Defaults to an empty string.
         */
        description?: string | undefined;
        /**
         * An Object with the keys set to the MIME type and the values an Array of file extensions (see below for an example).
         */
        accept: Record<string, string | string[]>;
      }[]
    | undefined;
}

export declare global {
  interface Window {
    /**
     * Window API: showOpenFilePicker
     *
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker)
     */
    showOpenFilePicker: (
      options?: OpenFilePickerOptions,
    ) => Promise<FileSystemFileHandle[]>;
  }
}
