import { PrismaClient } from '@prisma/client';
import { PrismaClientOptions, RawValue } from '@prisma/client/runtime/library';
import { PRISMA, SQLITE, getDatabaseType } from 'lib/db';
import debug from 'debug';

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

  let client = new PrismaClient({
    errorFormat: 'pretty',
    ...(logQuery && PRISMA_LOG_OPTIONS),
    ...options,
  });

  if (logQuery) {
    client.$on('query', queryLogger || log);
  }

  if (getDatabaseType() === SQLITE) {
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
            needs: { createdAt: true },
            compute(model) {
              return model.createdAt * 1000;
            },
          },
          updatedAt: {
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
    client.$dbDate = arg => arg;
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
