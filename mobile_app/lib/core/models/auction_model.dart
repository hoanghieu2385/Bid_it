// File: auction_model.dart
// Description: Model định nghĩa thông tin phiên đấu giá, bao gồm thông tin cơ bản và danh sách ảnh (mediaUrls).

class Auction {
  final int id;
  final String title;
  final String description;
  final double startingPrice;
  final String status;
  final DateTime startTime;
  final DateTime endTime;
  final String? thumbnailUrl;
  final List<String> mediaUrls;

  Auction({
    required this.id,
    required this.title,
    required this.description,
    required this.startingPrice,
    required this.status,
    required this.startTime,
    required this.endTime,
    this.thumbnailUrl,
    this.mediaUrls = const [],
  });

  factory Auction.fromJson(Map<String, dynamic> json) {
    return Auction(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      startingPrice: (json['startingPrice'] as num).toDouble(),
      status: json['status'],
      startTime: DateTime.parse(json['startTime']),
      endTime: DateTime.parse(json['endTime']),
      thumbnailUrl: json['thumbnailUrl'],
      mediaUrls: json['media'] != null
          ? List<String>.from(
          (json['media'] as List).map((m) => m['url'] ?? ''))
          : [],
    );
  }

}
