class Payment {
  final int id;
  final int userId;
  final int auctionId;
  final double amount;
  final String paymentType;
  final String paymentMethod;
  final String status;
  final String externalTransactionId;
  final String externalOrderId;
  final String description;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? completedAt;

  Payment({
    required this.id,
    required this.userId,
    required this.auctionId,
    required this.amount,
    required this.paymentType,
    required this.paymentMethod,
    required this.status,
    required this.externalTransactionId,
    required this.externalOrderId,
    required this.description,
    required this.createdAt,
    required this.updatedAt,
    this.completedAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'],
      userId: json['userId'],
      auctionId: json['auctionId'],
      amount: (json['amount'] as num).toDouble(),
      paymentType: json['paymentType'],
      paymentMethod: json['paymentMethod'],
      status: json['status'],
      externalTransactionId: json['externalTransactionId'] ?? '',
      externalOrderId: json['externalOrderId'] ?? '',
      description: json['description'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'])
          : null,
    );
  }
}
