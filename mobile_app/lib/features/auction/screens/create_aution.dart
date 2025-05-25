// File: create_auction_page.dart
// Chức năng: Màn hình tạo phiên đấu giá. Định dạng thời gian: yyyy-MM-dd'T'HH:mm:ss.SSS để tránh lỗi JSON parse ở backend Java.

import 'dart:convert' show jsonEncode;

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/core/models/category_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';

class CreateAuctionPage extends StatefulWidget {
  const CreateAuctionPage({super.key});

  @override
  State<CreateAuctionPage> createState() => _CreateAuctionPageState();
}

class _CreateAuctionPageState extends State<CreateAuctionPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _startingPriceController = TextEditingController();
  final _incrementAmountController = TextEditingController();

  List<Category> _categories = [];
  Category? _selectedCategory;
  bool _isLoadingCategories = true;

  final _dateFormatter = DateFormat("yyyy-MM-ddTHH:mm");
  String formatDate(DateTime dt) => _dateFormatter.format(dt);
  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      final categoriesData = await AuctionService.fetchCategories();
      final parsed = categoriesData.map((e) => Category(id: e['id'], name: e['name'])).toList();
      setState(() {
        _categories = parsed;
        _isLoadingCategories = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingCategories = false;
      });
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _startingPriceController.dispose();
    _incrementAmountController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      final startingPrice = double.tryParse(_startingPriceController.text) ?? 0.0;
      final incrementAmount = double.tryParse(_incrementAmountController.text) ?? 0.0;
      final now = DateTime.now();

      final auctionData = {
        "title": _titleController.text.trim(),
        "description": _descriptionController.text.trim(),
        "categoryId": _selectedCategory?.id,
        "startTime": formatDate(now),
        "endTime": formatDate(now.add(const Duration(days: 3))),
        "startingPrice": startingPrice,
        "incrementAmount": incrementAmount,
        "currentBid": null,
        "requiresDeposit": true,
        "securityDeposit": (startingPrice * 0.1).toDouble(),
        "status": "UPCOMING",
        "bidCount": 0,
        "winnerId": null,
        "winnerPaymentDeadline": null,
        "disputeRequestDeadline": null,
        "createdAt": formatDate(now),
        "updatedAt": formatDate(now),
        "deletedAt": null,
        "media": [],
        "thumbnailUrl": null,
      };

      final success = await AuctionService.createAuction(auctionData);

      if (mounted) {
        if (success) {
          _formKey.currentState?.reset();
          _titleController.clear();
          _descriptionController.clear();
          _startingPriceController.clear();
          _incrementAmountController.clear();
          setState(() {
            _selectedCategory = null;
          });

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text(
                "Auction has been created successfully.",
                style: TextStyle(color: Colors.black87),
              ),
              backgroundColor: Colors.white,
              elevation: 6,
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              duration: const Duration(seconds: 3),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text(
                "Failed to create auction. Please try again.",
                style: TextStyle(color: Colors.black87),
              ),
              backgroundColor: Colors.white,
              elevation: 6,
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              duration: const Duration(seconds: 3),
            ),
          );
        }
      }
    }
  }



  InputDecoration _inputDecoration(String label, {String? prefixText}) {
    return InputDecoration(
      labelText: label,
      prefixText: prefixText,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.0)),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label,
      {int maxLines = 1, String? prefixText, TextInputType keyboardType = TextInputType.text}) {
    return TextFormField(
      controller: controller,
      decoration: _inputDecoration(label, prefixText: prefixText),
      keyboardType: keyboardType,
      maxLines: maxLines,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter ${label.toLowerCase()}';
        }
        if ((label == 'Starting Price' || label == 'Increment Amount') &&
            (double.tryParse(value) == null || double.parse(value) <= 0)) {
          return 'Please enter a valid ${label.toLowerCase()}';
        }
        return null;
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoadingCategories
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              _buildTextField(_titleController, 'Auction Title'),
              const SizedBox(height: 16),
              _buildTextField(_descriptionController, 'Description', maxLines: 4),
              const SizedBox(height: 16),
              _buildTextField(_startingPriceController, 'Starting Price',
                  prefixText: '\$', keyboardType: TextInputType.number),
              const SizedBox(height: 16),
              _buildTextField(_incrementAmountController, 'Increment Amount',
                  prefixText: '\$', keyboardType: TextInputType.number),
              const SizedBox(height: 16),
              DropdownButtonFormField<Category>(
                decoration: _inputDecoration('Category'),
                value: _selectedCategory,
                items: _categories
                    .map((category) => DropdownMenuItem<Category>(
                  value: category,
                  child: Text(category.name),
                ))
                    .toList(),
                onChanged: (value) => setState(() => _selectedCategory = value),
                validator: (value) => value == null ? 'Please select a category' : null,
              ),
              const SizedBox(height: 24),
              CustomButton(
                text: 'Create Auction',
                onPressed: _submitForm,
                backgroundColor: AppColors.black,
                textColor: AppColors.white,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
