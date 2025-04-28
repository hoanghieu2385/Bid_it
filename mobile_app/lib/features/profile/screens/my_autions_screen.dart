import 'package:flutter/material.dart';
import 'package:mobile_app/core/constants/app_colors.dart';

class MyAuctionList extends StatelessWidget {
  const MyAuctionList({super.key});

  static const List<Map<String, dynamic>> _auctions = [
    {
      'title': 'Luxury Sedan',
      'category': 'Cars/Trucks',
      'startingPrice': '\$50,000.00',
      'currentBid': '\$55,000.00',
      'bids': 15,
      'status': 'Active',
      'imageUrl': 'assets/images/sedan.jpg',
    },
    {
      'title': 'Vintage Watch',
      'category': 'Watches',
      'startingPrice': '\$5,000.00',
      'currentBid': '\$6,200.00',
      'bids': 8,
      'status': 'Active',
      'imageUrl': 'assets/images/watch.jpg',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      key: const ValueKey('auction_list'),
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.only(bottom: 16.0),
      itemCount: _auctions.length,
      itemBuilder: (context, index) {
        final item = _auctions[index];
        return _buildAuctionCard(context, item, index);
      },
    );
  }

  Widget _buildAuctionCard(
      BuildContext context, Map<String, dynamic> item, int index) {
    return AnimatedOpacity(
      opacity: 1.0,
      duration: Duration(milliseconds: 300 + (index * 100)),
      child: Container(
        key: ValueKey(item['title']),
        margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12.0),
          color: AppColors.white,
          boxShadow: [
            BoxShadow(
              color: AppColors.grey.withOpacity(0.2),
              blurRadius: 8.0,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(12.0),
          child: InkWell(
            onTap: () {
              debugPrint('Auction ${item['title']} tapped');
            },
            borderRadius: BorderRadius.circular(12.0),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildImage(context, item['imageUrl']),
                  const SizedBox(width: 12.0),
                  Expanded(child: _buildDetails(context, item)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildImage(BuildContext context, String imageUrl) {
    return Hero(
      tag: 'auction_image_${imageUrl.hashCode}',
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8.0),
        child: Image.asset(
          imageUrl,
          width: 80,
          height: 80,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => Container(
            width: 80,
            height: 80,
            color: AppColors.grey.withOpacity(0.1),
            child: const Icon(
              Icons.image_not_supported,
              size: 40,
              color: AppColors.grey,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetails(BuildContext context, Map<String, dynamic> item) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          item['title'],
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.black,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 4.0),
        Text(
          'Category: ${item['category']}',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppColors.grey,
          ),
        ),
        const SizedBox(height: 8.0),
        Row(
          children: [
            _buildPriceColumn(context, 'Starting', item['startingPrice']),
            const SizedBox(width: 16.0),
            _buildPriceColumn(context, 'Current', item['currentBid']),
          ],
        ),
        const SizedBox(height: 8.0),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.gavel, size: 16, color: AppColors.grey),
                const SizedBox(width: 4.0),
                Text(
                  '${item['bids']} bids',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.grey,
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
              decoration: BoxDecoration(
                color: item['status'] == 'Active'
                    ? Colors.green.withOpacity(0.1)
                    : Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12.0),
              ),
              child: Text(
                item['status'],
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: item['status'] == 'Active'
                      ? Colors.green
                      : Colors.red,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPriceColumn(BuildContext context, String label, String price) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$label Price',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: AppColors.grey,
          ),
        ),
        Text(
          price,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.black,
          ),
        ),
      ],
    );
  }
}