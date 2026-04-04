import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class IngredientDBScreen extends StatelessWidget {
  const IngredientDBScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppTheme.brandPrimary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Search ingredients...',
                      prefixIcon: const Icon(Icons.search),
                      filled: true,
                      fillColor: AppTheme.bgSurface,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.bgSurface,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.filter_list),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.separated(
              itemCount: 8,
              separatorBuilder: (context, index) => const Divider(height: 1),
              itemBuilder: (context, index) {
                const names = [
                  'Avocado (Raw)',
                  'Chicken Breast',
                  'Oats (Rolled)',
                  'Sweet Potato',
                  'Greek Yogurt',
                  'Almonds',
                  'Salmon',
                  'Broccoli'
                ];
                const cats = [
                  'Fats',
                  'Protein',
                  'Grains',
                  'Carbs',
                  'Dairy',
                  'Fats',
                  'Protein',
                  'Vegetables'
                ];
                const calories = [
                  '160k',
                  '165k',
                  '389k',
                  '86k',
                  '59k',
                  '579k',
                  '208k',
                  '34k'
                ];
                return ListTile(
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  title: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(names[index],
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color:
                                  AppTheme.brandPrimary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(calories[index],
                                style: const TextStyle(
                                    color: AppTheme.brandPrimary,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold)),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.edit,
                              size: 16, color: AppTheme.textMuted),
                        ],
                      ),
                    ],
                  ),
                  subtitle: Text('Category: ${cats[index]} • per 100g',
                      style: const TextStyle(fontSize: 12)),
                  onTap: () {},
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
