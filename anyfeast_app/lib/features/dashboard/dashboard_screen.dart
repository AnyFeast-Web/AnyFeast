import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Overview',
                      style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary)),
                  const SizedBox(height: 24),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.5,
                    children: [
                      _buildStatCard('Active Clients', '12', Icons.group,
                          AppTheme.brandPrimary),
                      _buildStatCard('Pending Consults', '4', Icons.schedule,
                          AppTheme.accentAmber),
                      _buildStatCard('Meal Plans', '28', Icons.restaurant_menu,
                          AppTheme.accentTeal),
                      _buildStatCard('Compliance', '87%',
                          Icons.check_circle_outline, Colors.blue),
                    ],
                  ),
                  const SizedBox(height: 32),
                  Text('Attention Needed',
                      style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  Card(
                    color: AppTheme.accentRose.withValues(alpha: 0.05),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(
                          color: AppTheme.accentRose.withValues(alpha: 0.2)),
                    ),
                    child: ListTile(
                      leading: const Icon(Icons.warning_amber_rounded,
                          color: AppTheme.accentRose),
                      title: const Text('Expiring Plan',
                          style: TextStyle(
                              color: AppTheme.accentRose,
                              fontWeight: FontWeight.bold)),
                      subtitle: const Text(
                          'Sarah Johnson\'s meal plan expires in 2 days.'),
                      trailing: TextButton(
                        style: TextButton.styleFrom(
                            foregroundColor: AppTheme.accentRose),
                        onPressed: () {},
                        child: const Text('Resolve'),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text('Quick Actions',
                      style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildQuickAction('New Client', Icons.person_add,
                            AppTheme.brandPrimary),
                        const SizedBox(width: 12),
                        _buildQuickAction(
                            'New Plan', Icons.post_add, AppTheme.accentTeal),
                        const SizedBox(width: 12),
                        _buildQuickAction(
                            'Consultation', Icons.chat, AppTheme.accentAmber),
                        const SizedBox(width: 12),
                        _buildQuickAction(
                            'Add Food', Icons.add_circle, Colors.blue),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text('Recent Activity',
                      style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  _buildActivityItem(
                      'Meal Plan Generated',
                      'Sarah Johnson • 2h ago',
                      Icons.file_present,
                      AppTheme.brandPrimary),
                  _buildActivityItem(
                      'Consultation Completed',
                      'Michael Chen • 5h ago',
                      Icons.check_circle,
                      AppTheme.accentTeal),
                  _buildActivityItem('New Client Onboarded',
                      'Emily Davis • 1d ago', Icons.person, Colors.blue),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                    child: Text(title,
                        style: const TextStyle(
                            fontSize: 12, color: AppTheme.textSecondary),
                        maxLines: 1)),
                Icon(icon, size: 16, color: color),
              ],
            ),
            const SizedBox(height: 8),
            Text(value,
                style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary)),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction(String label, IconData icon, Color color) {
    return Container(
      width: 100,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.bgSurface,
        border: Border.all(color: AppTheme.borderSubtle),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 8),
          Text(label,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }

  Widget _buildActivityItem(
      String title, String subtitle, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 2),
                Text(subtitle,
                    style: const TextStyle(
                        color: AppTheme.textSecondary, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
