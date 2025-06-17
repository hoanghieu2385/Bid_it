class AuctionWinner {
  final int userId;
  final String username;
  final String email;
  final String bidAmount;
  final DateTime bidTime;

  const AuctionWinner({
    required this.userId,
    required this.username,
    required this.email,
    required this.bidAmount,
    required this.bidTime,
  });

  factory AuctionWinner.fromJson({
    required Map<String, dynamic> winnerJson,
    required Map<String, dynamic> userJson,
  }) {
    return AuctionWinner(
      userId: winnerJson['userId'] as int,
      username: userJson['username'] as String,
      email: userJson['email'] as String,
      bidAmount: winnerJson['bidAmount'].toString(),
      bidTime: DateTime.parse(winnerJson['bidTime']),
    );
  }
}
