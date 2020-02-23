import { AccountsModule } from '@accounts/graphql-api';
import AccountsPassword from '@accounts/password';
import AccountsTypeorm, { User } from '@accounts/typeorm';
import GraphQLJSON from 'graphql-type-json';
import { defaults } from 'lodash';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { Settings } from '../../../entities/Settings';
import { UserMeta } from '../../../entities/UserMeta';
import { fields } from '../../../utils/fields';
import { PackageVersion } from '../types/PackageVersion';
import { PackageVersionInput } from '../types/PackageVersionInput';
import { PrimeField } from '../types/PrimeField';
import { Settings as SettingsType, SettingsAccessType } from '../types/Settings';
import { Authorized } from '../utils/Authorized';
import { getPackagesVersion } from '../utils/getPackagesVersion';
import { updateNpmPackages } from '../utils/updateNpmPackages';

@Resolver()
export class PrimeResolver {
  @InjectRepository(Settings)
  private readonly settingsRepository: Repository<Settings>;

  @Query(_returns => Boolean)
  public async isOnboarding(): Promise<boolean> {
    const count = await getRepository(User).count();
    return count === 0;
  }

  @Mutation(_returns => Boolean)
  public async onboard(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Arg('profile', _type => GraphQLJSON, { nullable: true }) profile: any
  ): Promise<boolean> {
    if (await this.isOnboarding()) {
      const accounts = AccountsModule.injector.get(AccountsPassword);
      const db = accounts.server.options.db as AccountsTypeorm;

      const userId = await accounts.createUser({ email, password });
      await accounts.server.activateUser(userId);

      if (profile) {
        const meta = new UserMeta();
        meta.id = userId;
        meta.profile = profile;

        await getRepository(UserMeta).save(meta);
      }

      await db.verifyEmail(userId, email);

      return true;
    }
    return false;
  }

  @Authorized()
  @Query(_returns => SettingsType)
  public async getSettings(): Promise<SettingsType> {
    let settings = await this.settingsRepository.findOne({
      order: { updatedAt: 'DESC' },
    });

    if (!settings) {
      settings = new Settings();

      settings.data = {
        accessType: SettingsAccessType[SettingsAccessType.PUBLIC] as any,
        previews: [],
        locales: [],
      };
    }

    settings.data!.env = {}; // eslint-disable-line

    fields.forEach(field => {
      if (field.env) {
        field.env.forEach(name => {
          if (process.env[name]) {
            // This literally can't be undefined
            settings!.data!.env[name] = process.env[name]; // eslint-disable-line
          }
        });
      }
    });

    settings.ensureMasterLocale();

    // Again this literally can't be undefined
    return settings!.data!; // eslint-disable-line
  }

  @Authorized()
  @Mutation(_returns => SettingsType)
  public async setSettings(
    @Arg('input', _type => SettingsType) input: SettingsType
  ): Promise<SettingsType> {
    const data = await this.getSettings();

    const settings = this.settingsRepository.create({
      data: defaults(input, data),
    });

    await this.settingsRepository.save(settings);

    return this.getSettings();
  }

  @Authorized()
  @Query(_returns => [PrimeField])
  public allFields(): PrimeField[] {
    return fields;
  }

  @Authorized()
  @Query(_returns => [PackageVersion], { nullable: true })
  public system(): Promise<(PackageVersion | null)[]> {
    return getPackagesVersion();
  }

  @Authorized()
  @Mutation(_returns => Boolean)
  public async updateSystem(
    @Arg('versions', _type => [PackageVersionInput]) packagesVersion: PackageVersionInput[]
  ): Promise<boolean> {
    const allowedPackages = [
      '@primecms/core',
      '@primecms/ui',
      ...fields.map(({ packageName }) => packageName),
    ];

    if (process.env.NODE_ENV !== 'production') {
      throw new Error('Cannot update packages without NODE_ENV=production');
    }

    const updateQueue = packagesVersion
      .filter(pkg => allowedPackages.includes(pkg.name))
      .map(pkg => `${pkg.name}@${pkg.version}`);

    await updateNpmPackages(updateQueue);

    return true;
  }
}
