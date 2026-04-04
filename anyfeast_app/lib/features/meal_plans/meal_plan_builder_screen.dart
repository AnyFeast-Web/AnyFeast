import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class MealPlanBuilderScreen extends StatefulWidget {
  const MealPlanBuilderScreen({super.key});

  @override
  State<MealPlanBuilderScreen> createState() => _MealPlanBuilderScreenState();
}

class _MealPlanBuilderScreenState extends State<MealPlanBuilderScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _days.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(kToolbarHeight + 48),
        child: AppBar(
          title: const Text('Cutting Phase Plan — W1',
              style: TextStyle(fontSize: 16)),
          actions: [
            IconButton(icon: const Icon(Icons.ios_share), onPressed: () {}),
            IconButton(icon: const Icon(Icons.send), onPressed: () {}),
          ],
          bottom: TabBar(
            controller: _tabController,
            isScrollable: true,
            indicatorColor: AppTheme.brandPrimary,
            labelColor: AppTheme.brandPrimary,
            unselectedLabelColor: AppTheme.textSecondary,
            tabs: _days.map((day) => Tab(text: day)).toList(),
          ),
        ),
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            color: AppTheme.bgSurface,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildMacroStat('Cal', '1850', AppTheme.textPrimary),
                _buildMacroStat('Pro', '150g', AppTheme.brandPrimary),
                _buildMacroStat('Carb', '180g', Colors.blue),
                _buildMacroStat('Fat', '60g', AppTheme.accentAmber),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: _days.map((day) => _buildDayView(day)).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMacroStat(String label, String value, Color textCol) {
    return Column(
      children: [
        Text(value,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 16, color: textCol)),
        Text(label,
            style:
                const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
      ],
    );
  }

  Widget _buildDayView(String day) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildMealSection('Breakfast', [
          {'name': 'Oatmeal Bowl', 'cals': '400k', 'pro': '12p'}
        ]),
        const SizedBox(height: 16),
        _buildMealSection('Lunch', [
          {'name': 'Chicken Salad', 'cals': '550k', 'pro': '45p'}
        ]),
        const SizedBox(height: 16),
        _buildMealSection('Dinner', []),
        const SizedBox(height: 16),
        _buildMealSection('Snacks', []),
      ],
    );
  }

  Widget _buildMealSection(String title, List<Map<String, String>> meals) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16)),
                IconButton(
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  icon: const Icon(Icons.add_circle_outline,
                      color: AppTheme.brandPrimary),
                  onPressed: () {},
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (meals.isEmpty)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.borderSubtle),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Text('Add meal',
                      style: TextStyle(color: AppTheme.textMuted)),
                ),
              )
            else
              ...meals.map((m) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.borderSubtle),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(m['name']!,
                            style:
                                const TextStyle(fontWeight: FontWeight.w600)),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppTheme.brandPrimary
                                    .withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(m['cals']!,
                                  style: const TextStyle(
                                      color: AppTheme.brandPrimary,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(width: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.blue.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(m['pro']!,
                                  style: const TextStyle(
                                      color: Colors.blue,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  )),
          ],
        ),
      ),
    );
  }
}
