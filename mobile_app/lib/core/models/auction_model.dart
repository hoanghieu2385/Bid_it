// File: auction_model.dart
class Auction {
  final int id;
  final String title;
  final String description;
  final int sellerId;
  final int categoryId;
  final DateTime startTime;
  final DateTime endTime;
  final double startingPrice;
  final double incrementAmount;
  final double? currentBid;
  final bool requiresDeposit;
  final double securityDeposit;
  final String status;
  final int bidCount;
  final int? winnerId;
  final DateTime? winnerPaymentDeadline;
  final DateTime? disputeRequestDeadline;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? thumbnailUrl;
  final String? sellerName;      // ✅ Thêm dòng này
  final String? categoryName;    // ✅ Thêm dòng này

  Auction({
    required this.id,
    required this.title,
    required this.description,
    required this.sellerId,
    required this.categoryId,
    required this.startTime,
    required this.endTime,
    required this.startingPrice,
    required this.incrementAmount,
    required this.currentBid,
    required this.requiresDeposit,
    required this.securityDeposit,
    required this.status,
    required this.bidCount,
    required this.winnerId,
    required this.winnerPaymentDeadline,
    required this.disputeRequestDeadline,
    required this.createdAt,
    required this.updatedAt,
    required this.thumbnailUrl,
    this.sellerName,
    this.categoryName,
  });

  factory Auction.fromJson(Map<String, dynamic> json) {
    return Auction(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      sellerId: json['sellerId'],
      categoryId: json['categoryId'],
      startTime: DateTime.parse(json['startTime']),
      endTime: DateTime.parse(json['endTime']),
      startingPrice: (json['startingPrice'] as num).toDouble(),
      incrementAmount: (json['incrementAmount'] as num).toDouble(),
      currentBid: json['currentBid'] != null ? (json['currentBid'] as num).toDouble() : null,
      requiresDeposit: json['requiresDeposit'],
      securityDeposit: (json['securityDeposit'] as num).toDouble(),
      status: json['status'],
      bidCount: json['bidCount'],
      winnerId: json['winnerId'],
      winnerPaymentDeadline: json['winnerPaymentDeadline'] != null
          ? DateTime.parse(json['winnerPaymentDeadline'])
          : null,
      disputeRequestDeadline: json['disputeRequestDeadline'] != null
          ? DateTime.parse(json['disputeRequestDeadline'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      thumbnailUrl: json['thumbnailUrl'],
      sellerName: json['sellerName'],
      categoryName: json['categoryName'],
    );
  }
}
