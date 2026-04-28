import { config } from '@/config';
import { logger } from './logger';

export interface GenerateMealPlanInput {
  clientId: string;
  startDate: string;
  endDate: string;
  nutritionTargets?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
}

export interface GeneratedMealPlan {
  title: string;
  startDate: string;
  endDate: string;
  nutritionTargets: Record<string, unknown>;
  guidelines?: string;
  groceryList: unknown[];
  days: Array<{
    dayIndex: number;
    date?: string;
    meals: Array<{
      mealType:
        | 'breakfast'
        | 'snack_morning'
        | 'lunch'
        | 'snack_afternoon'
        | 'dinner'
        | 'snack_evening';
      position: number;
      title: string;
      ingredients: unknown[];
      macros: Record<string, unknown>;
      instructions?: string;
    }>;
  }>;
}

export class AiClientError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AiClientError';
  }
}

export const aiClient = {
  async generateMealPlan(input: GenerateMealPlanInput): Promise<GeneratedMealPlan> {
    const url = `${config.AI_SERVICE_URL}/generate-meal-plan`;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), config.AI_SERVICE_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
        signal: ac.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new AiClientError(`AI service ${res.status}: ${text.slice(0, 500)}`, res.status);
      }
      return (await res.json()) as GeneratedMealPlan;
    } catch (err) {
      const e = err as Error;
      logger.warn('ai client failure', { url, message: e.message });
      if (e.name === 'AbortError') throw new AiClientError('AI service timeout');
      if (e instanceof AiClientError) throw e;
      throw new AiClientError(e.message);
    } finally {
      clearTimeout(timer);
    }
  },
};
