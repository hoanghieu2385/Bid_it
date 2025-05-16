import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;

class UserService {
  static const String baseUrl = 'http://10.22.184.81:8080/user-service';

  static Future<Map<String, dynamic>?> getUserProfile(String token) async {
    final url = Uri.parse('$baseUrl/auth/me');

    try {
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        print("✅ [UserService] Get user profile success");
        return jsonDecode(response.body);
      } else {
        print("❌ [UserService] Failed: ${response.statusCode}");
        print(response.body);
        return null;
      }
    } on TimeoutException catch (_) {
      print("⏱️ [UserService] Request timed out");
      return null;
    } catch (e) {
      print("❌ [UserService] Error: $e");
      return null;
    }
  }
}
