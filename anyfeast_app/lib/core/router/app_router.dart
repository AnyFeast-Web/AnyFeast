import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/login_screen.dart';
import '../../features/dashboard/dashboard_screen.dart';
import '../../features/clients/clients_screen.dart';
import '../../features/meal_plans/meal_plan_builder_screen.dart';
import '../../features/meal_plans/ingredient_db_screen.dart';
import '../../features/consultations/consultations_screen.dart';
import '../../features/dashboard/automation_hub_screen.dart';
import 'main_layout.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

// Simple auth state - bypass Firebase for now
final isLoggedInProvider = StateProvider<bool>((ref) => false);

final routerProvider = Provider<GoRouter>((ref) {
  final isLoggedIn = ref.watch(isLoggedInProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggingIn = state.uri.toString() == '/login';
      if (!isLoggedIn && !isLoggingIn) return '/login';
      if (isLoggedIn && isLoggingIn) return '/';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          return MainLayout(child: child);
        },
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/clients',
            builder: (context, state) => const ClientListScreen(),
          ),
          GoRoute(
            path: '/meal-plans',
            builder: (context, state) => const MealPlanBuilderScreen(),
          ),
          GoRoute(
            path: '/nutrition-db',
            builder: (context, state) => const IngredientDBScreen(),
          ),
          GoRoute(
            path: '/consultations',
            builder: (context, state) => const ConsultationsScreen(),
          ),
          GoRoute(
            path: '/automation',
            builder: (context, state) => const AutomationHubScreen(),
          ),
        ],
      ),
    ],
  );
});