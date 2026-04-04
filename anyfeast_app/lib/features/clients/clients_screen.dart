import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class ClientListScreen extends StatelessWidget {
  const ClientListScreen({super.key});

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
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search clients by name, email...',
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
          Expanded(
            child: ListView.separated(
              itemCount: 5, // Mock data
              separatorBuilder: (context, index) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final names = ['Sarah Johnson', 'Michael Chen', 'Emily Davis', 'James Wilson', 'Olivia Martinez'];
                final goals = ['Fat Loss', 'Muscle Gain', 'Maintenance', 'Diabetic Control', 'Fat Loss'];
                
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: CircleAvatar(
                    backgroundColor: AppTheme.brandPrimary.withOpacity(0.2),
                    child: Text(names[index].substring(0, 1), style: const TextStyle(color: AppTheme.brandPrimary)),
                  ),
                  title: Text(names[index], style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('Goal: ${goals[index]} • Last active 2d ago', style: const TextStyle(fontSize: 12)),
                  trailing: const Icon(Icons.chevron_right, color: AppTheme.textMuted),
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
