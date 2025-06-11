/// lib/core/services/websocket_service.dart
/// This WebSocketService handles STOMP protocol-based connections for auction bid events.

import 'dart:convert';
import 'package:stomp_dart_client/stomp.dart';
import 'package:stomp_dart_client/stomp_config.dart';
import 'package:stomp_dart_client/stomp_frame.dart';

class WebSocketService {
  StompClient? _stompClient;
  bool isConnected = false;

  static const int _maxRetry = 5;
  int _retryCount = 0;

  int? _auctionId;
  int? _userId;
  String? _username;
  late void Function(Map<String, dynamic>) _onActivity;
  late void Function(String message) _onError;
  void Function(Map<String, dynamic>)? _onInit;
  void Function()? _onConnected;
  void Function()? _onDisconnected;

  void connect({
    required int auctionId,
    required int userId,
    required String username,
    required void Function(Map<String, dynamic>) onActivity,
    required void Function(String message) onError,
    void Function()? onConnected,
    void Function()? onDisconnected,
    void Function(Map<String, dynamic>)? onInit,
  }) {
    if (_stompClient != null && _stompClient!.connected) return;
    _auctionId = auctionId;
    _userId = userId;
    _username = username;
    _onActivity = onActivity;
    _onError = onError;
    _onInit = onInit;
    _onConnected = onConnected;
    _onDisconnected = onDisconnected;

    _stompClient = StompClient(
      config: StompConfig.SockJS(
        url: 'http://10.0.2.2:8085/ws',
        onConnect: (StompFrame frame) {
          isConnected = true;
          _retryCount = 0;
          _onConnected?.call();

          _stompClient!.subscribe(
            destination: '/topic/auction/$_auctionId',
            callback: (frame) {
              if (frame.body != null) {
                try {
                  final data = jsonDecode(frame.body!);
                  switch (data['type']) {
                    case 'NEW_BID':
                      _onActivity(data);
                      break;
                    case 'INIT':
                      _onInit?.call(data);
                      break;
                  }
                } catch (e) {
                  _onError('Error parsing message: $e');
                }
              }
            },
          );

          _stompClient!.send(
            destination: '/auction/$_auctionId/init',
            body: jsonEncode({
              'userId': _userId,
              'username': _username,
            }),
          );
        },
        beforeConnect: () async {
          await Future.delayed(const Duration(milliseconds: 300));
        },
        onWebSocketError: (dynamic error) {
          isConnected = false;
          _onError(error.toString());
          _tryReconnect();
        },
        onStompError: (StompFrame frame) {
          _onError(frame.body ?? 'Unknown STOMP error');
          _tryReconnect();
        },
        onDisconnect: (_) {
          isConnected = false;
          _onDisconnected?.call();
          _tryReconnect();
        },
        reconnectDelay: const Duration(seconds: 0),
        heartbeatIncoming: Duration.zero,
        heartbeatOutgoing: Duration.zero,
      ),
    );

    _stompClient!.activate();
  }

  void _tryReconnect() {
    if (_retryCount >= _maxRetry) {
      _onError('Max retry attempts reached. Could not reconnect.');
      return;
    }

    _retryCount++;
    final delay = Duration(seconds: 2 * _retryCount);
    Future.delayed(delay, () {
      connect(
        auctionId: _auctionId!,
        userId: _userId!,
        username: _username!,
        onActivity: _onActivity,
        onError: _onError,
        onConnected: _onConnected,
        onDisconnected: _onDisconnected,
        onInit: _onInit,
      );
    });
  }

  void sendBid({
    required int auctionId,
    required int userId,
    required double bidAmount,
  }) {
    if (_stompClient?.connected ?? false) {
      _stompClient!.send(
        destination: '/auction/$auctionId/bid',
        body: jsonEncode({
          'userId': userId,
          'bidAmount': bidAmount,
        }),
      );
    }
  }

  void disconnect() {
    _stompClient?.deactivate();
    isConnected = false;
  }
}
