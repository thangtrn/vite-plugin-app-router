import * as path from "path";
import * as fs from "fs";

/**
 * Recursively find all .tsx files under a directory
 * @param dir Directory to start
 * @param root Project root to produce relative paths
 */
export function findAllTsxFiles(dir: string, root: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findAllTsxFiles(fullPath, root));
    } else if (entry.isFile() && fullPath.endsWith(".tsx")) {
      const relativePath = path.relative(root, fullPath);
      files.push(relativePath.replace(/\\/g, "/"));
    }
  }

  return files;
}
