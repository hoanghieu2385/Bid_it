// File: auction_create_request.dart
// Chứa model dữ liệu để gửi API tạo đấu giá

class AuctionCreateRequest {
  final String title;
  final String description;
  final int categoryId;
  final double startingPrice;
  final double incrementAmount;
  final String startTime;
  final String endTime;
  final bool requiresDeposit;
  final double securityDeposit;

  AuctionCreateRequest({
    required this.title,
    required this.description,
    required this.categoryId,
    required this.startingPrice,
    required this.incrementAmount,
    required this.startTime,
    required this.endTime,
    required this.requiresDeposit,
    required this.securityDeposit,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'categoryId': categoryId,
      'startingPrice': startingPrice,
      'incrementAmount': incrementAmount,
      'startTime': startTime,
      'endTime': endTime,
      'requiresDeposit': requiresDeposit,
      'securityDeposit': securityDeposit,
    };
  }
}
