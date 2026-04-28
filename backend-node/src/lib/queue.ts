import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '@/config';
import { logger } from './logger';

const connectionFactory = () =>
  new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });

const sharedConnection = connectionFactory();

export const QUEUE_NAMES = {
  email: 'email',
  sms: 'sms',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const queues = new Map<QueueName, Queue>();

export function getQueue(name: QueueName): Queue {
  let q = queues.get(name);
  if (!q) {
    q = new Queue(name, { connection: sharedConnection });
    queues.set(name, q);
  }
  return q;
}

export async function enqueue<T>(
  name: QueueName,
  jobName: string,
  data: T,
  opts?: JobsOptions,
): Promise<string> {
  const job = await getQueue(name).add(jobName, data, {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 3600 },
    ...opts,
  });
  return job.id ?? '';
}

export function startWorker<T>(
  name: QueueName,
  processor: (jobName: string, data: T) => Promise<void>,
): Worker {
  const w = new Worker<T>(
    name,
    async (job) => processor(job.name, job.data as T),
    { connection: connectionFactory() },
  );
  w.on('failed', (job, err) =>
    logger.error('queue job failed', { queue: name, jobName: job?.name, err: err.message }),
  );
  return w;
}

export async function closeQueues(): Promise<void> {
  for (const q of queues.values()) await q.close();
  queues.clear();
}

export const queueEvents = (name: QueueName) =>
  new QueueEvents(name, { connection: connectionFactory() });
