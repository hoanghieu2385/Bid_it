import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_service.dart';
import 'package:mobile_app/core/services/api_service.dart';

class UserService {
  static const String _baseUrl = ApiService.userBaseUrl;
  static const String baseUrlAuth = ApiService.authBaseUrl;

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    return (token != null && token.isNotEmpty) ? token : null;
  }
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
  static Future<int?> getUserIdFromToken(String token) async {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;

      final payload = _decodeBase64(parts[1]);
      final payloadMap = json.decode(payload);

      if (payloadMap is! Map<String, dynamic>) return null;

      return payloadMap['userId'] as int?;
    } catch (e) {
      print('Error decoding token: $e');
      return null;
    }
  }

  static String _decodeBase64(String str) {
    String output = str.replaceAll('-', '+').replaceAll('_', '/');
    while (output.length % 4 != 0) {
      output += '=';
    }
    return utf8.decode(base64Url.decode(output));
  }
  static Future<Map<String, dynamic>> getSellerById(int id) async {
    final url = Uri.parse("$_baseUrl/seller/$id");
    final response = await http.get(url);

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception("Error when load user's information: ${response.statusCode}");
    }
  }
  static Future<String?> getToken() => _getToken();
}
