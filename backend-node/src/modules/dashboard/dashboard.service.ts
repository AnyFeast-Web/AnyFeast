import { QueryTypes } from 'sequelize';
import { sequelize } from '@/db/sequelize';

const schema = () => sequelize.options.define?.schema ?? 'nutritionist';

export const dashboardService = {
  async stats(nutritionistId: string) {
    const s = schema();
    const [row] = await sequelize.query<{
      active_clients: string;
      total_clients: string;
      meal_plans: string;
      consultations: string;
      pending_consultations: string;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE c.deleted_at IS NULL AND c.status = 'active')::text AS active_clients,
         COUNT(*) FILTER (WHERE c.deleted_at IS NULL)::text                          AS total_clients,
         (SELECT COUNT(*) FROM "${s}"."meal_plans" mp WHERE mp.nutritionist_id = :uid)::text AS meal_plans,
         (SELECT COUNT(*) FROM "${s}"."consultations" k WHERE k.nutritionist_id = :uid)::text AS consultations,
         (SELECT COUNT(*) FROM "${s}"."consultations" k
            WHERE k.nutritionist_id = :uid AND k.status = 'draft')::text             AS pending_consultations
       FROM "${s}"."clients" c
       WHERE c.nutritionist_id = :uid`,
      { replacements: { uid: nutritionistId }, type: QueryTypes.SELECT },
    );

    return {
      activeClients: Number(row?.active_clients ?? 0),
      totalClients: Number(row?.total_clients ?? 0),
      mealPlans: Number(row?.meal_plans ?? 0),
      consultations: Number(row?.consultations ?? 0),
      pendingConsultations: Number(row?.pending_consultations ?? 0),
    };
  },

  async activity(nutritionistId: string, limit = 20) {
    const s = schema();
    const rows = await sequelize.query<{
      kind: string;
      id: string;
      label: string;
      at: Date;
    }>(
      `SELECT 'client' AS kind, c.id, c.first_name || ' ' || c.last_name AS label, c.updated_at AS at
         FROM "${s}"."clients" c
         WHERE c.nutritionist_id = :uid AND c.deleted_at IS NULL
       UNION ALL
       SELECT 'meal_plan', mp.id, mp.title, mp.updated_at
         FROM "${s}"."meal_plans" mp
         WHERE mp.nutritionist_id = :uid
       UNION ALL
       SELECT 'consultation', k.id, k.consultation_date::text, k.updated_at
         FROM "${s}"."consultations" k
         WHERE k.nutritionist_id = :uid
       ORDER BY at DESC
       LIMIT :limit`,
      { replacements: { uid: nutritionistId, limit }, type: QueryTypes.SELECT },
    );
    return rows.map((r) => ({ kind: r.kind, id: r.id, label: r.label, at: r.at }));
  },
};
