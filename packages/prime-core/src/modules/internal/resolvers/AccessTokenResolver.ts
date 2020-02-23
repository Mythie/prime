import crypto from 'crypto';

import { GraphQLResolveInfo } from 'graphql';
import Hashids from 'hashids/cjs';
import { Arg, Args, Ctx, ID, Info, Mutation, Query, Resolver } from 'type-graphql';
import { Repository } from 'typeorm';
import { EntityConnection } from 'typeorm-cursor-connection';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { AccessToken } from '../../../entities/AccessToken';
import { Context } from '../../../interfaces/Context';
import { AccessTokenInput } from '../types/AccessTokenInput';
import { ConnectionArgs, createConnectionType } from '../types/createConnectionType';
import { Authorized } from '../utils/Authorized';

const AccessTokenConnection = createConnectionType(AccessToken);

@Resolver(_of => AccessToken)
export class AccessTokenResolver {
  @InjectRepository(AccessToken)
  private readonly accessTokenRepository: Repository<AccessToken>;

  @Authorized()
  @Query(_returns => AccessToken, { nullable: true, description: 'Get Access Token by ID' })
  public AccessToken(
    @Arg('id', _type => ID) id: string,
    @Ctx() _context: Context,
    @Info() _info: GraphQLResolveInfo
  ): Promise<AccessToken | undefined> {
    return this.accessTokenRepository.findOne(id);
  }

  @Authorized()
  @Query(_returns => AccessTokenConnection, { description: 'Get many Access Tokens' })
  public async allAccessTokens(
    @Args() args: ConnectionArgs
  ): Promise<{
    edges: any[];
    totalCount: number;
  }> {
    const connection = await new EntityConnection(args, {
      repository: this.accessTokenRepository,
      sortOptions: [{ sort: '"createdAt"', order: 'DESC' }],
    });

    return {
      edges: await connection.edges,
      totalCount: await this.accessTokenRepository.count(),
    };
  }

  @Authorized()
  @Mutation(_returns => AccessToken, { description: 'Create Access Token' })
  public async createAccessToken(
    @Arg('input') input: AccessTokenInput,
    @Ctx() context: Context
  ): Promise<AccessToken> {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_.';
    const salt = String(process.env.HASHID_SALT || 'keyboard dart cat');
    const hash = crypto.createHmac('sha512', salt);
    const hashid = new Hashids(salt, 108, alphabet);
    hash.update(`${Math.floor(1000 * Math.random())}|${Date.now()}`);
    const accessToken = this.accessTokenRepository.create(input);
    const tokenSeed = hash.digest('hex').match(/.{1,8}/g) || [];
    const token = hashid.encode(tokenSeed.map(num => parseInt(num, 16)));
    if (!tokenSeed.length || token === '') {
      throw new Error('Failed to generate access token');
    }
    accessToken.token = token;
    accessToken.userId = context.user.id;
    await this.accessTokenRepository.save(accessToken);
    return accessToken;
  }

  @Authorized()
  @Mutation(_returns => Boolean, { description: 'Remove Access Token by ID' })
  public async removeAccessToken(
    @Arg('id', _type => ID) id: string,
    @Ctx() _context: Context
  ): Promise<boolean> {
    const accessToken = await this.accessTokenRepository.findOneOrFail(id);
    return Boolean(await this.accessTokenRepository.remove(accessToken));
  }
}
