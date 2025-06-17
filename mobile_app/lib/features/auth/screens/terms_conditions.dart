import 'package:flutter/material.dart';

class TermsAndConditionsPage extends StatelessWidget {
  const TermsAndConditionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Terms and Conditions',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 2,
        shadowColor: Colors.grey.withOpacity(0.3),
      ),
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionTitle('1. Introduction'),
                _buildSectionContent(
                  'By accessing or using this auction application, you agree to comply with and be bound by these Terms and Conditions. Please read them carefully before using the platform. If you do not agree, you must not use the application.',
                ),
                _buildSectionTitle('2. User Responsibilities'),
                _buildSectionContent(
                  'Users must provide accurate, complete, and truthful information when registering or creating an auction. Any misleading or false information may lead to account suspension or termination. Users are responsible for maintaining the confidentiality of their account credentials.',
                ),
                _buildSectionTitle('3. Auction Conduct'),
                _buildSectionContent(
                  'All auctions must comply with the platform’s guidelines. Prohibited activities include, but are not limited to, posting inappropriate listings, engaging in fraudulent bidding, or manipulating auction outcomes. Violations may result in removal of listings or account bans.',
                ),
                _buildSectionTitle('4. Payment and Transactions'),
                _buildSectionContent(
                  'Buyers are responsible for completing payments for won auctions as per the agreed terms. Sellers must deliver items as described in the listing. The platform acts as a facilitator and is not responsible for disputes arising from transactions between users.',
                ),
                _buildSectionTitle('5. Intellectual Property'),
                _buildSectionContent(
                  'All content on the platform, including text, graphics, and logos, is the property of the application or its licensors and is protected by intellectual property laws. Users may not reproduce or distribute any content without prior written consent.',
                ),
                _buildSectionTitle('6. Liability Disclaimer'),
                _buildSectionContent(
                  'The platform is provided "as is" and we make no warranties regarding its functionality or availability. We are not liable for any losses, damages, or disputes arising from the use of the platform, including but not limited to financial losses or data breaches.',
                ),
                _buildSectionTitle('7. Termination of Access'),
                _buildSectionContent(
                  'We reserve the right to suspend or terminate access to the platform for any user who violates these terms, engages in fraudulent activity, or uses the platform in a manner that harms others.',
                ),
                _buildSectionTitle('8. Governing Law'),
                _buildSectionContent(
                  'These terms are governed by the laws of [Your Jurisdiction]. Any disputes arising from these terms or use of the platform will be resolved in the courts of [Your Jurisdiction].',
                ),
                _buildSectionTitle('9. Updates to Terms'),
                _buildSectionContent(
                  'We may update these terms at our discretion. Changes will be effective upon posting to the platform. Continued use of the application after changes constitutes acceptance of the updated terms.',
                ),
                _buildSectionTitle('10. Contact Information'),
                _buildSectionContent(
                  'For questions or concerns regarding these terms, please contact our support team at support@auctionapp.com.',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 24, bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
      ),
    );
  }

  Widget _buildSectionContent(String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        content,
        style: const TextStyle(
          fontSize: 16,
          height: 1.6,
          color: Colors.black87,
        ),
      ),
    );
  }
}
