import { Consultation } from '../types';

export const mockConsultations: Consultation[] = [
  {
    id: 'cs1',
    client_id: 'c1',
    client_name: 'Priya Sharma',
    date: '2026-03-28T10:00:00Z',
    duration_min: 30,
    notes: {
      goals: 'Reduce weight by 4kg in next 8 weeks while managing thyroid medication',
      issues: 'Feeling fatigued in afternoon. Skipping lunch occasionally.',
      plan: 'Adjusted meal timing. Added mid-morning snack. Increased protein at lunch.',
      follow_up: 'Check weight and energy levels in 2 weeks',
    },
    messages: [
      { id: 'msg1', sender: 'nutritionist', content: 'Hi Priya! How has your week been? Any changes in energy levels?', timestamp: '2026-03-28T10:00:00Z', type: 'text' },
      { id: 'msg2', sender: 'client', content: 'Hi Dr. Ananya! The mornings are better but I still feel tired after lunch.', timestamp: '2026-03-28T10:02:00Z', type: 'text' },
      { id: 'msg3', sender: 'nutritionist', content: 'That could be related to your lunch composition. Let me review your meal plan. Are you eating the full portion?', timestamp: '2026-03-28T10:03:00Z', type: 'text' },
      { id: 'msg4', sender: 'client', content: 'Actually, I\'ve been skipping lunch some days because I\'m not hungry. Could that be causing the fatigue?', timestamp: '2026-03-28T10:05:00Z', type: 'text' },
      { id: 'msg5', sender: 'nutritionist', content: 'Yes, absolutely. Skipping meals can cause blood sugar drops which lead to fatigue. Let\'s adjust your plan — I\'ll add a lighter lunch option and a mid-morning snack instead.', timestamp: '2026-03-28T10:07:00Z', type: 'text' },
      { id: 'msg6', sender: 'client', content: 'That sounds great. Also, should I continue the thyroid medication at the same time?', timestamp: '2026-03-28T10:09:00Z', type: 'text' },
      { id: 'msg7', sender: 'nutritionist', content: 'Yes, keep taking it first thing in the morning, 30 minutes before breakfast as your doctor advised. I\'ll make sure the meal timing works around that.', timestamp: '2026-03-28T10:10:00Z', type: 'text' },
    ],
    files: [],
  },
  {
    id: 'cs2',
    client_id: 'c3',
    client_name: 'Meera Patel',
    date: '2026-03-25T14:00:00Z',
    duration_min: 45,
    notes: {
      goals: 'Keep blood sugar stable. Maintain HbA1c under 7%.',
      issues: 'Blood sugar spikes after dinner. Weight stable.',
      plan: 'Reduced dinner carbs. Added post-dinner walk recommendation.',
      follow_up: 'Review blood sugar diary in 1 week',
    },
    messages: [
      { id: 'msg8', sender: 'nutritionist', content: 'Meera ji, how are your blood sugar readings this week?', timestamp: '2026-03-25T14:00:00Z', type: 'text' },
      { id: 'msg9', sender: 'client', content: 'Fasting is good, around 110-120. But after dinner it goes to 180-190.', timestamp: '2026-03-25T14:02:00Z', type: 'text' },
      { id: 'msg10', sender: 'nutritionist', content: 'I see. We need to modify your dinner composition. Let\'s reduce the rice portion and add more vegetables.', timestamp: '2026-03-25T14:04:00Z', type: 'text' },
    ],
    files: [],
  },
];
