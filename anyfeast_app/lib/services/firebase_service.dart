import 'package:flutter_riverpod/flutter_riverpod.dart';

// Riverpod Provider for Firebase Auth State stub
final authStateProvider = StreamProvider<dynamic>((ref) {
  return Stream.value(null);
});

final firebaseServiceProvider = Provider<FirebaseService>((ref) {
  return FirebaseService();
});

class FirebaseService {
  dynamic get currentUser => null;

  Future<dynamic> signIn(String email, String password) async {
    return null;
  }

  Future<void> signOut() async {}
}
