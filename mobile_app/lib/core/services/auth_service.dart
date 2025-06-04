// lib/core/services/auth_service.dart
import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthService {
  static const String _baseUrl = ApiService.authBaseUrl;
  static const String _baseUserUrl = ApiService.userBaseUrl;

  static Future<Map<String, dynamic>?> login(String email, String password, {bool rememberMe = false}) async {
    final url = Uri.parse('$_baseUrl/login');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();

        final now = DateTime.now();
        final expiresAt = rememberMe
            ? now.add(const Duration(days: 7))
            : now.add(const Duration(days: 1));

        await prefs.setString('jwt_token', data['token']);
        await prefs.setString('jwt_expires_at', expiresAt.toIso8601String());
        await prefs.setBool('remember_me', rememberMe);

        final meUrl = Uri.parse('$_baseUserUrl/me');
        final meRes = await http.get(
          meUrl,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ${data['token']}',
          },
        );
        if (meRes.statusCode == 200) {
          final userInfo = jsonDecode(meRes.body);
          await prefs.setString('user_info', jsonEncode(userInfo));
        } else {
          await prefs.remove('user_info');
        }

        return data;
      } else {
        return {
          'error': true,
          'message': jsonDecode(response.body)['message'] ?? 'Login failed.',
        };
      }
    } on TimeoutException {
      return {'error': true, 'message': 'Request timed out'};
    } catch (e) {
      return {'error': true, 'message': e.toString()};
    }
  }


  static Future<bool> isTokenValid() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final expiresAtString = prefs.getString('jwt_expires_at');

    if (token == null || expiresAtString == null) return false;

    final expiresAt = DateTime.tryParse(expiresAtString);
    if (expiresAt == null) return false;

    return DateTime.now().isBefore(expiresAt);
  }

  static Future<Map<String, dynamic>?> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
  }) async {
    final url = Uri.parse('$_baseUrl/register');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'id': 0,
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final body = jsonDecode(response.body);
        return {
          'error': true,
          'message': body['message'] ?? 'Unknown registration error',
        };
      }
    } on TimeoutException {
      return {'error': true, 'message': 'Request timed out'};
    } catch (e) {
      return {'error': true, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>?> forgotPassword(String email) async {
    final url = Uri.parse('$_baseUrl/forgot-password');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final body = jsonDecode(response.body);
        return {
          'error': true,
          'message': body['message'] ?? 'Failed to send reset link.',
        };
      }
    } on TimeoutException {
      return {'error': true, 'message': 'Request timed out'};
    } catch (e) {
      return {'error': true, 'message': e.toString()};
    }
  }
}