// lib/core/services/user_service.dart
import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_service.dart';
import 'api_service.dart';

class UserService {
  static const String _baseUrl = ApiService.userBaseUrl;

  static Future<Map<String, dynamic>?> getCurrentUser() async {
    final isValid = await AuthService.isTokenValid();
    if (!isValid) {
      await logout();
      return {'error': true, 'message': 'Session expired'};
    }

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null || token.isEmpty) return null;

    final url = Uri.parse('$_baseUrl/me');

    try {
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {
          'error': true,
          'message': jsonDecode(response.body)['message'] ?? 'Failed to get user info',
        };
      }
    } on TimeoutException {
      return {'error': true, 'message': 'Request timed out'};
    } catch (e) {
      return {'error': true, 'message': e.toString()};
    }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await prefs.remove('jwt_expires_at');
    await prefs.remove('remember_me');
  }

  static Future<bool> updateUserProfile(String id, Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final url = Uri.parse('$_baseUrl/$id');

    try {
      final response = await http.put(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(data),
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
