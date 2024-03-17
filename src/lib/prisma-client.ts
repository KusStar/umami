import { PrismaClient } from '@prisma/client';
import { DriverAdapter, PrismaClientOptions, RawValue } from '@prisma/client/runtime/library';
import { PRISMA, SQLITE, getDatabaseType } from 'lib/db';
import debug from 'debug';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const log = debug('umami:prisma-client');

const PRISMA_LOG_OPTIONS = {
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
};

export function getClient(params?: {
  logQuery?: boolean;
  queryLogger?: () => void;
  options?: PrismaClientOptions;
}): PrismaClient {
  const { logQuery = !!process.env.LOG_QUERY, queryLogger, options } = params || {};
  let adapter: DriverAdapter = null;
  const dbType = getDatabaseType();

  if (dbType === SQLITE) {
    const libsql = createClient({
      url: `${process.env.TURSO_DATABASE_URL}`,
      authToken: `${process.env.TURSO_AUTH_TOKEN}`,
    });

    adapter = new PrismaLibSQL(libsql);
  }

  // @ts-expect-error ignore
  let client = new PrismaClient({
    errorFormat: 'pretty',
    adapter: adapter,
    ...(logQuery && PRISMA_LOG_OPTIONS),
    ...options,
  });

  if (logQuery) {
    // @ts-expect-error ignore
    client.$on('query', queryLogger || log);
  }

  if (dbType === SQLITE) {
    /*
     * Date
     */
    const dbDate = arg => Math.floor(arg.getTime() / 1000);

    const handleUpdate = ({ args, query }) => {
      args.data.updatedAt = dbDate(new Date());
      return query(args);
    };

    const queries = {};

    ['user', 'website', 'team', 'teamUser', 'report'].forEach(key => {
      queries[key] = {
        update: handleUpdate,
      };
    });

    queries['$queryRawUnsafe'] = ({ args, query }) => {
      for (let i = args.length; i > 1; i--) {
        if (args[i] instanceof Date) {
          args[i] = dbDate(args[i]);
        }
      }
      return query(args);
    };

    // @ts-expect-error ignore
    client = client.$extends({
      client: {
        $dbDate: dbDate,
        $rawDateQuery: arg => `${arg} * 1000`,
      },
      query: {
        ...queries,
      },
      result: {
        $allModels: {
          createdAt: {
            // @ts-expect-error ignore
            needs: { createdAt: true },
            compute(model) {
              return model.createdAt * 1000;
            },
          },
          updatedAt: {
            // @ts-expect-error ignore
            needs: { updatedAt: true },
            compute(model) {
              return model.updatedAt ? model.updatedAt * 1000 : null;
            },
          },
        },
      },
    });

    /*
     * CreateMany
     */
    const handleCreateMany = (model, { data: dataArray }) => {
      return Promise.all(
        dataArray.map(async data => {
          // @ts-expect-error ignore
          await client[model].create({
            data,
          });
        }),
      );
    };
    ['eventData', 'sessionData'].forEach(key => {
      client[key].createMany = handleCreateMany.bind(null, key);
    });
  } else {
    //  @ts-expect-error ignore
    client.$dbDate = arg => arg;
    // @ts-expect-error ignore
    client.$rawDateQuery = arg => arg;
  }

  if (process.env.NODE_ENV !== 'production') {
    global[PRISMA] = client;
  }

  log('Prisma initialized');

  return client;
}

const client = global[PRISMA] || getClient();

async function rawQuery(query: string, params: RawValue[] = []) {
  return client.$queryRawUnsafe.apply(client, [query, ...params]);
}

async function transaction(input: any, options?: any) {
  return client.$transaction(input, options);
}

export default { client, log, rawQuery, transaction };
