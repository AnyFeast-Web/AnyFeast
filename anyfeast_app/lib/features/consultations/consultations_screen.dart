import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class ConsultationsScreen extends StatelessWidget {
  const ConsultationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppTheme.brandPrimary,
        child: const Icon(Icons.add_comment, color: Colors.white),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search consultations...',
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
              itemCount: 4,
              separatorBuilder: (context, index) => const Divider(height: 1),
              itemBuilder: (context, index) {
                const headings = [
                  'Initial Assessment',
                  'W1 Check-in',
                  'Chat Message',
                  'W4 Review'
                ];
                const clients = [
                  'Sarah Johnson',
                  'Michael Chen',
                  'Emily Davis',
                  'James Wilson'
                ];
                const types = [
                  'Structured',
                  'Structured',
                  'Chat',
                  'Structured'
                ];
                return ListTile(
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: CircleAvatar(
                    backgroundColor: types[index] == 'Chat'
                        ? Colors.blue.withValues(alpha: 0.1)
                        : AppTheme.accentTeal.withValues(alpha: 0.1),
                    child: Icon(
                      types[index] == 'Chat'
                          ? Icons.chat_bubble
                          : Icons.assignment,
                      color: types[index] == 'Chat'
                          ? Colors.blue
                          : AppTheme.accentTeal,
                    ),
                  ),
                  title: Text('${headings[index]} • ${clients[index]}',
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 14)),
                  subtitle: Text('Type: ${types[index]} • Oct 24, 2023',
                      style: const TextStyle(fontSize: 12)),
                  trailing: const Icon(Icons.chevron_right,
                      color: AppTheme.textMuted),
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
