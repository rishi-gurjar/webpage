export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\(\)\?\[\]]/g, '')  // Remove parentheses and question marks
    .replace(/[^a-z0-9-\s]/g, '')  // Remove any remaining special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single hyphen
    .trim()                        // Remove leading/trailing spaces
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
}

// Accepts boolean `true` and string forms ("true", "True") — YAML parses
// unquoted `private: true` as a boolean, quoted values arrive as strings.
export function isPrivatePost(data: { [key: string]: any }): boolean {
  return String(data.private).toLowerCase() === 'true';
}