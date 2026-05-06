import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = join(repoRoot, "fixtures", "pets");
const targetRoot = join(repoRoot, "apps", "demo", "public", "pets");

async function readManifest(petId) {
  const manifestPath = join(sourceRoot, petId, "pet.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  if (
    typeof manifest.id !== "string" ||
    typeof manifest.displayName !== "string" ||
    typeof manifest.description !== "string" ||
    typeof manifest.spritesheetPath !== "string"
  ) {
    throw new Error(`Invalid pet manifest: ${manifestPath}`);
  }

  return manifest;
}

async function main() {
  await rm(targetRoot, { force: true, recursive: true });
  await mkdir(targetRoot, { recursive: true });

  const entries = await readdir(sourceRoot, { withFileTypes: true });
  const manifests = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const manifest = await readManifest(entry.name);
    await cp(join(sourceRoot, entry.name), join(targetRoot, entry.name), {
      recursive: true
    });
    manifests.push({
      ...manifest,
      manifestUrl: `/pets/${entry.name}/pet.json`,
      spritesheetUrl: `/pets/${entry.name}/${manifest.spritesheetPath}`
    });
  }

  manifests.sort((a, b) => a.displayName.localeCompare(b.displayName));
  await writeFile(
    join(targetRoot, "pets-index.json"),
    `${JSON.stringify({ pets: manifests }, null, 2)}\n`
  );

  console.log(`Copied ${manifests.length} fixture pets into demo public assets`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
