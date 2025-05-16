import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;

class AuthService {
  static const String baseUrl = 'http://10.22.184.81:8080/user-service/auth';

  static Future<Map<String, dynamic>?> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/login');

    try {
      final response = await http
          .post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      )
          .timeout(const Duration(seconds: 20));

      if (response.statusCode == 200) {
        print("✅ Login successful: ${response.statusCode}");
        return jsonDecode(response.body);
      } else {
        print("❌ Login failed: ${response.statusCode}");
        print(response.body);
        return null;
      }
    } on TimeoutException catch (_) {
      print("⏱️ Login request timed out");
      return null;
    } catch (e) {
      print("❌ Login error: $e");
      return null;
    }
  }

  static Future<Map<String, dynamic>?> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String phoneNumber,
  }) async {
    final url = Uri.parse('$baseUrl/register');

    try {
      final response = await http
          .post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'id': 0,
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
          'phoneNumber': phoneNumber,
        }),
      )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200 || response.statusCode == 201) {
        print("✅ Register successful: ${response.statusCode}");
        return jsonDecode(response.body);
      } else {
        print("❌ Register failed: ${response.statusCode}");
        print(response.body);
        return null;
      }
    } on TimeoutException catch (_) {
      print("⏱️ Register request timed out");
      return null;
    } catch (e) {
      print("❌ Register error: $e");
      return null;
    }
  }
  static Future<Map<String, dynamic>?> getCurrentUser(String token) async {
    final url = Uri.parse('$baseUrl/me');

    try {
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        print("✅ Get current user success");
        return jsonDecode(response.body);
      } else {
        print("❌ Failed to get current user: ${response.statusCode}");
        print(response.body);
        return null;
      }
    } on TimeoutException catch (_) {
      print("⏱️ Get current user timed out");
      return null;
    } catch (e) {
      print("❌ Get current user error: $e");
      return null;
    }
  }
}
