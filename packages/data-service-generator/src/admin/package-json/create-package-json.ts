import {
  CreateAdminUIPackageJsonParams,
  Module,
  EventNames,
} from "@amplication/code-gen-types";
import { readFile } from "fs/promises";
import { join, resolve } from "path";
import DsgContext from "../../dsg-context";
import pluginWrapper from "../../plugin-wrapper";
import { updatePackageJSONs } from "../../utils/update-package-jsons";
import { paramCase } from "param-case";
import { promises as fs } from "fs";

const PACKAGE_JSON_ENCODING = "utf-8";
const PACKAGE_JSON_FILE_NAME = "package.json";

const filePath = resolve(__dirname, PACKAGE_JSON_FILE_NAME);

export async function createAdminUIPackageJson(): Promise<Module[]> {
  const fileContent = await fs.readFile(filePath, PACKAGE_JSON_ENCODING);
  const { appInfo } = DsgContext.getInstance;
  const updateProperties = [
    {
      name: `@${paramCase(appInfo.name)}/admin`,
      version: appInfo.version,
      eslintConfig: {
        extends: ["react-app", "react-app/jest"],
      },
    },
  ];

  return pluginWrapper(
    createAdminUIPackageJsonInternal,
    EventNames.CreateAdminUIPackageJson,
    { fileContent, updateProperties }
  );
}

async function createAdminUIPackageJsonInternal({
  updateProperties,
}: CreateAdminUIPackageJsonParams): Promise<Module[]> {
  const { clientDirectories } = DsgContext.getInstance;
  const packageJsonModule = await readFile(
    resolve(__dirname, PACKAGE_JSON_FILE_NAME),
    PACKAGE_JSON_ENCODING
  );
  const mutatedPackageJson = updatePackageJSONs(
    [
      {
        path: join(clientDirectories.baseDirectory, PACKAGE_JSON_FILE_NAME),
        code: packageJsonModule,
      },
    ],
    clientDirectories.baseDirectory,
    updateProperties
  );
  return mutatedPackageJson;
}
