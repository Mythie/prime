import path from 'path';

import latest from 'latest';
import readPkg from 'read-pkg';

import { fields } from '../../../utils/fields';
import { PackageVersion } from '../types/PackageVersion';

const getLatestVersion = (packageName: string): Promise<string> =>
  new Promise<string>(resolve => {
    try {
      latest(packageName, (err, version: string) => {
        return resolve(version);
      });
    } catch (err) {
      resolve(null as any);
    }
  });

export const getPackagesVersion = async (): Promise<(PackageVersion | null)[]> => {
  const packages = [
    { packageName: '@primecms/core' },
    { packageName: '@primecms/ui' },
    ...fields.map(({ packageName, dir }) => ({ packageName, dir })),
  ];

  return await Promise.all(
    packages.map(async pkg => {
      try {
        const { version } = await readPkg({
          cwd: pkg.dir || path.dirname(require.resolve(`${pkg.packageName}/package.json`)),
        });

        const latestVersion = await getLatestVersion(pkg.packageName);

        return {
          name: pkg.packageName as string,
          currentVersion: version as string,
          latestVersion: latestVersion as string,
        };
      } catch (err) {
        return { name: pkg.packageName };
      }
    })
  );
};
