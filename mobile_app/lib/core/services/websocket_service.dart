import 'dart:convert';
import 'package:stomp_dart_client/stomp.dart';
import 'package:stomp_dart_client/stomp_config.dart';
import 'package:stomp_dart_client/stomp_frame.dart';

typedef MessageCallback = void Function(Map<String, dynamic>);

enum WebSocketErrorType { stomp, websocket }

class WebSocketService {
  static final WebSocketService _instance = WebSocketService._internal();
  factory WebSocketService() => _instance;
  WebSocketService._internal();

  late StompClient _client;
  bool _connected = false;
  bool _subscribed = false;

  bool get isConnected => _connected;

  void connect({
    required int auctionId,
    required int userId,
    required String username,
    required MessageCallback onInit,
    required MessageCallback onActivity,
    required MessageCallback onError,
    bool enableLogging = false,
  }) {
    if (_connected) return;

    _client = StompClient(
      config: StompConfig.SockJS(
        url: 'http://10.0.2.2:8080/ws',
        onConnect: (frame) {
          _connected = true;

          _client.send(
            destination: '/auction/$auctionId/join',
            body: jsonEncode({
              'userId': userId,
              'username': username,
            }),
          );

          if (!_subscribed) {
            _client.subscribe(
              destination: '/user/queue/auction/$auctionId/init',
              callback: (frame) {
                if (frame.body != null) {
                  onInit(jsonDecode(frame.body!));
                }
              },
            );

            _client.subscribe(
              destination: '/topic/auction/$auctionId/activity',
              callback: (frame) {
                if (frame.body != null) {
                  onActivity(jsonDecode(frame.body!));
                }
              },
            );

            _client.subscribe(
              destination: '/user/queue/errors',
              callback: (frame) {
                if (frame.body != null) {
                  onError(jsonDecode(frame.body!));
                }
              },
            );

            _subscribed = true;
          }
        },
        onWebSocketError: (error) {
          if (enableLogging) {
            print("WebSocket Error: $error");
          }
          onError({'type': 'websocket', 'message': error.toString()});
        },
        onStompError: (frame) {
          if (enableLogging) {
            print("STOMP Error: ${frame.body}");
          }
          onError({'type': 'stomp', 'message': frame.body ?? 'Unknown STOMP error'});
        },
        onDisconnect: (_) {
          _connected = false;
          _subscribed = false;
        },
      ),
    );

    _client.activate();
  }

  void sendBid(int auctionId, int userId, double bidAmount) {
    if (!_connected) return;
    _client.send(
      destination: '/app/auction/$auctionId/bid',
      body: jsonEncode({
        'userId': userId,
        'bidAmount': bidAmount,
      }),
    );
  }

  void leaveAuction(int auctionId, int userId, String username) {
    if (!_connected) return;
    _client.send(
      destination: '/app/auction/$auctionId/leave',
      body: jsonEncode({
        'userId': userId,
        'username': username,
      }),
    );
  }

  void disconnect() {
    if (_connected) {
      _client.deactivate();
    }
    _connected = false;
    _subscribed = false;
  }
}
