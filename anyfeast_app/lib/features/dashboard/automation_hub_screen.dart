import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class AutomationHubScreen extends StatefulWidget {
  const AutomationHubScreen({super.key});

  @override
  State<AutomationHubScreen> createState() => _AutomationHubScreenState();
}

class _AutomationHubScreenState extends State<AutomationHubScreen> {
  bool _isLoading = false;

  void _triggerWebhook() {
    setState(() => _isLoading = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Order dispatched via n8n webhook!'),
          backgroundColor: AppTheme.accentTeal,
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Quick Triggers',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                              color: Colors.blue.withValues(alpha: 0.1),
                              shape: BoxShape.circle),
                          child: const Icon(Icons.shopping_cart,
                              color: Colors.blue),
                        ),
                        const SizedBox(width: 12),
                        const Text('Trigger Ingredient Order',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                        'Fire n8n webhook to extract and dispatch meal plan ingredients.',
                        style: TextStyle(
                            fontSize: 12, color: AppTheme.textSecondary)),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 44)),
                      onPressed: _isLoading ? null : _triggerWebhook,
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white))
                          : const Text('Run Automation'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                              color:
                                  AppTheme.brandPrimary.withValues(alpha: 0.1),
                              shape: BoxShape.circle),
                          child: const Icon(Icons.picture_as_pdf,
                              color: AppTheme.brandPrimary),
                        ),
                        const SizedBox(width: 12),
                        const Text('Send Meal Plan to Client',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text('Generate PDF and email to associated client.',
                        style: TextStyle(
                            fontSize: 12, color: AppTheme.textSecondary)),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 12),
                            decoration: BoxDecoration(
                                border:
                                    Border.all(color: AppTheme.borderSubtle),
                                borderRadius: BorderRadius.circular(8)),
                            child: const Text('Sarah\'s Cutting Plan',
                                style: TextStyle(fontSize: 14)),
                          ),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.send, size: 16),
                          label: const Text('Send'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Job History',
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Text('View Log',
                    style: TextStyle(
                        color: AppTheme.brandPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 16),
            _buildJobLog('Send Meal Plan PDF', 'Sarah Johnson', 'Completed',
                AppTheme.accentTeal),
            _buildJobLog('Client Onboarding', 'Michael Chen', 'Failed',
                AppTheme.accentRose),
            _buildJobLog('Ingredient Order', 'Manual Trigger', 'Pending',
                AppTheme.accentAmber),
          ],
        ),
      ),
    );
  }

  Widget _buildJobLog(String title, String client, String status, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        title: Text(title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text('Client: $client', style: const TextStyle(fontSize: 12)),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withValues(alpha: 0.2)),
          ),
          child: Text(status,
              style: TextStyle(
                  color: color, fontSize: 10, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
