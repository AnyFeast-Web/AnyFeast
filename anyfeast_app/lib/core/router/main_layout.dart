import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MainLayout extends StatelessWidget {
  final Widget child;
  const MainLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();

    const navItems = [
      _NavItem(icon: Icons.dashboard_outlined, label: 'Dashboard', path: '/'),
      _NavItem(icon: Icons.people_outline, label: 'Clients', path: '/clients'),
      _NavItem(
          icon: Icons.restaurant_menu_outlined,
          label: 'Meal Plans',
          path: '/meal-plans'),
      _NavItem(
          icon: Icons.local_grocery_store_outlined,
          label: 'Nutrition DB',
          path: '/nutrition-db'),
      _NavItem(
          icon: Icons.chat_bubble_outline,
          label: 'Consultations',
          path: '/consultations'),
      _NavItem(
          icon: Icons.auto_awesome_outlined,
          label: 'Automation',
          path: '/automation'),
    ];

    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: _selectedIndex(location, navItems),
            onDestinationSelected: (i) => context.go(navItems[i].path),
            labelType: NavigationRailLabelType.all,
            destinations: navItems
                .map((e) => NavigationRailDestination(
                      icon: Icon(e.icon),
                      label: Text(e.label),
                    ))
                .toList(),
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(child: child),
        ],
      ),
    );
  }

  int _selectedIndex(String location, List<_NavItem> items) {
    for (int i = items.length - 1; i >= 0; i--) {
      if (location.startsWith(items[i].path) &&
          (items[i].path == '/' ? location == '/' : true)) {
        return i;
      }
    }
    return 0;
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final String path;
  const _NavItem({required this.icon, required this.label, required this.path});
}
