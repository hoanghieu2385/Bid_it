import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_service.dart';
import 'api_service.dart';

class UserService {
  static const String _baseUrl = ApiService.userBaseUrl;
  static const String baseUrlAuth = ApiService.authBaseUrl;
  static Future<Map<String, dynamic>?> getCurrentUser() async {
    final isValid = await AuthService.isTokenValid();
    if (!isValid) {
      await logout();
      return {'error': true, 'message': 'Session expired'};
    }

    final token = await _getToken();
    if (token == null) return null;

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
        return jsonDecode(utf8.decode(response.bodyBytes));
      } else {
        return {
          'error': true,
          'message': jsonDecode(utf8.decode(response.bodyBytes))['message'] ?? 'Failed to get user info',
        };
      }
    } on TimeoutException {
      return {'error': true, 'message': 'Request timed out'};
    } catch (e) {
      return {'error': true, 'message': e.toString()};
    }
  }

  static Future<bool> updateUserProfile(int id, Map<String, dynamic> data) async {
    final token = await _getToken();
    if (token == null) return false;

    final url = Uri.parse('$_baseUrl/$id/profile');

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

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await prefs.remove('jwt_expires_at');
    await prefs.remove('remember_me');
  }

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    return (token != null && token.isNotEmpty) ? token : null;
  }
  static Future<bool> changePassword(String currentPassword, String newPassword) async {
    final token = await _getToken();
    if (token == null) return false;

    final url = Uri.parse('$baseUrlAuth/change-password');

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'email': (await getCurrentUser())?['email'],
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

}
