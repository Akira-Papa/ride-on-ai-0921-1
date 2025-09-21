declare module "sanitize-html" {
  export type AllowedAttributes = Record<string, string[]>;

  export type SanitizeOptions = {
    allowedTags?: string[];
    allowedAttributes?: AllowedAttributes;
    allowedSchemes?: string[];
    allowedSchemesByTag?: Record<string, string[]>;
    disallowedTagsMode?: "discard" | "escape" | "recursiveEscape";
    nonTextTags?: string[];
    textFilter?: (text: string) => string;
  };

  export type Defaults = {
    allowedTags: string[];
    allowedAttributes: AllowedAttributes;
    allowedSchemes: string[];
  };

  export interface SanitizeHtml {
    (dirty: string, options?: SanitizeOptions): string;
    defaults: Defaults;
  }

  const sanitizeHtml: SanitizeHtml;
  export default sanitizeHtml;
}
