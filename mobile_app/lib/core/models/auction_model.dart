// File: auction_model.dart
// Description: Định nghĩa model Auction với các trường thông tin phiên đấu giá, bao gồm thời gian tạo (createdAt)

class Auction {
  final int id;
  final String title;
  final String description;
  late final double startingPrice;
  final double incrementAmount;
  final double securityDeposit;
  final String status;
  final DateTime startTime;
  final DateTime endTime;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int categoryId;
  final int sellerId;
  final bool requiresDeposit;
  final int bidCount;
  final double? currentBid;
  final int? winnerId;
  final DateTime? winnerPaymentDeadline;
  final DateTime? disputeRequestDeadline;
  final String? thumbnailUrl;
  final List<String> mediaUrls;

  Auction({
    required this.id,
    required this.title,
    required this.description,
    required this.startingPrice,
    required this.incrementAmount,
    required this.securityDeposit,
    required this.status,
    required this.startTime,
    required this.endTime,
    required this.createdAt,
    required this.updatedAt,
    required this.categoryId,
    required this.sellerId,
    required this.requiresDeposit,
    required this.bidCount,
    required this.currentBid,
    required this.winnerId,
    required this.winnerPaymentDeadline,
    required this.disputeRequestDeadline,
    this.thumbnailUrl,
    this.mediaUrls = const [],
  });

  factory Auction.fromJson(Map<String, dynamic> json) {
    return Auction(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      startingPrice: (json['startingPrice'] as num).toDouble(),
      incrementAmount: json['incrementAmount'] != null ? (json['incrementAmount'] as num).toDouble() : 0.0,
      securityDeposit: json['securityDeposit'] != null ? (json['securityDeposit'] as num).toDouble() : 0.0,
      status: json['status'],
      startTime: DateTime.parse(json['startTime']),
      endTime: DateTime.parse(json['endTime']),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      categoryId: json['categoryId'] ?? 0,
      sellerId: json['sellerId'] ?? 0,
      requiresDeposit: json['requiresDeposit'] ?? false,
      bidCount: json['bidCount'] ?? 0,
      currentBid: json['currentBid'] != null ? (json['currentBid'] as num).toDouble() : null,
      winnerId: json['winnerId'] as int?,
      winnerPaymentDeadline: json['winnerPaymentDeadline'] != null ? DateTime.tryParse(json['winnerPaymentDeadline']) : null,
      disputeRequestDeadline: json['disputeRequestDeadline'] != null ? DateTime.tryParse(json['disputeRequestDeadline']) : null,
      thumbnailUrl: json['thumbnailUrl'],
      mediaUrls: json['media'] != null ? List<String>.from((json['media'] as List).map((m) => m['url'] ?? '')) : [],
    );
  }
}
