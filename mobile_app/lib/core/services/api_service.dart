// lib/core/services/api_service.dart
class ApiService {
  static const String baseHost = 'http://10.0.2.2:8080';
  // static const String baseHost = 'http://10.22.184.71:8080';

  // Các base URL cụ thể cho từng service
  static const String authBaseUrl = '$baseHost/user-service/auth';
  static const String userBaseUrl = '$baseHost/user-service/api/users';
  static const String categoryBaseUrl = '$baseHost/category-service/categories';
  // static const String auctionBaseUrl = '$baseHost/auction-service/api/auctions';
  // static const String paymentBaseUrl = '$baseHost/payment-service/api';
  // static const String notificationWsUrl = 'ws://10.0.2.2:8080/notification-service/ws';
}
