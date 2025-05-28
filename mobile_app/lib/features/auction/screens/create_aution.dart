// File: create_auction_page.dart
// Description: Create auction page with image picker, preview, upload and permission handling. Includes delete image feature and price suggestions with original UI layout.

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:mobile_app/core/constants/app_colors.dart';
import 'package:mobile_app/core/widgets/custom_button.dart';
import 'package:mobile_app/core/models/category_model.dart';
import 'package:mobile_app/core/services/auction_service.dart';
import 'package:mobile_app/core/services/user_service.dart';

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
  final ImagePicker _picker = ImagePicker();

  List<XFile> _galleryImages = [];
  XFile? _thumbnailImage;
  bool _isUploading = false;
  List<Category> _categories = [];
  Category? _selectedCategory;
  bool _isLoadingCategories = true;

  DateTime? _startTime;
  DateTime? _endTime;

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
    } catch (_) {
      setState(() => _isLoadingCategories = false);
    }
  }

  Future<bool> _checkPhotoPermission() async {
    if (Platform.isAndroid) {
      final androidInfo = await DeviceInfoPlugin().androidInfo;
      final sdkInt = androidInfo.version.sdkInt;
      return sdkInt >= 33
          ? await Permission.photos.request().isGranted
          : await Permission.storage.request().isGranted;
    } else {
      return await Permission.photos.request().isGranted;
    }
  }

  Future<void> _pickThumbnail() async {
    final granted = await _checkPhotoPermission();
    if (!granted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Photo permission denied.')),
      );
      return;
    }

    final image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) setState(() => _thumbnailImage = image);
  }

  Future<void> _pickGalleryImages() async {
    final granted = await _checkPhotoPermission();
    if (!granted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Photo permission denied.')),
      );
      return;
    }

    final selected = await _picker.pickMultiImage();
    if (selected.isNotEmpty) {
      setState(() => _galleryImages = selected);
    }
  }

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(now),
      );
      if (time != null) {
        final fullDate = DateTime(picked.year, picked.month, picked.day, time.hour, time.minute);
        setState(() {
          if (isStart) _startTime = fullDate;
          else _endTime = fullDate;
        });
      }
    }
  }

  Future<bool> _confirmDelete() async {
    return await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Delete'),
        content: const Text('Are you sure you want to remove this image?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    ) ??
        false;
  }

  Widget _buildSuggestions(String value, TextEditingController controller) {
    if (value.isEmpty) return const SizedBox.shrink();
    final raw = int.tryParse(value);
    if (raw == null || raw <= 0) return const SizedBox.shrink();
    final suggestions = ['0', '00', '000'].map((s) => raw.toString() + s).toList();
    return Wrap(
      spacing: 8,
      children: suggestions.map((s) {
        final formatted = NumberFormat('#,###', 'vi_VN').format(int.parse(s));
        return GestureDetector(
          onTap: () => setState(() => controller.text = s),
          child: Chip(
            label: Text('$formatted VNĐ'),
            backgroundColor: Colors.grey.shade200,
          ),
        );
      }).toList(),
    );
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    final now = DateTime.now();

    if (_startTime == null || _endTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select start and end time.')),
      );
      return;
    }

    if (_startTime!.isBefore(now)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Start time cannot be in the past.')),
      );
      return;
    }

    if (_endTime!.isBefore(_startTime!)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('End time must be after start time.')),
      );
      return;
    }

    if (_thumbnailImage == null && _galleryImages.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one image (thumbnail or gallery).')),
      );
      return;
    }

    if (_titleController.text.trim().length < 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Title must be at least 5 characters long.')),
      );
      return;
    }

    if (_descriptionController.text.trim().length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Description must be at least 10 characters long.')),
      );
      return;
    }

    final startingPrice = double.tryParse(_startingPriceController.text);
    final incrementAmount = double.tryParse(_incrementAmountController.text);
    if (startingPrice == null || incrementAmount == null || _selectedCategory == null) return;

    final user = await UserService.getCurrentUser();
    if (user == null || user['id'] == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login to create auction.')),
      );
      return;
    }

    final auctionData = {
      "title": _titleController.text.trim(),
      "description": _descriptionController.text.trim(),
      "categoryId": _selectedCategory!.id,
      "startTime": formatDate(_startTime!),
      "endTime": formatDate(_endTime!),
      "startingPrice": startingPrice,
      "incrementAmount": incrementAmount,
      "requiresDeposit": true,
      "securityDeposit": (startingPrice * 0.1),
      "status": "UPCOMING",
      "bidCount": 0,
    };

    setState(() => _isUploading = true);
    final auction = await AuctionService.createAuction(auctionData);
    setState(() => _isUploading = false);

    if (auction == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to create auction.')));
      return;
    }

    if (_thumbnailImage != null) {
      final bytes = await _thumbnailImage!.readAsBytes();
      await AuctionService.uploadImage(bytes, _thumbnailImage!.name, auction.id, true);
    }

    for (final image in _galleryImages) {
      final bytes = await image.readAsBytes();
      await AuctionService.uploadImage(bytes, image.name, auction.id, false);
    }

    _formKey.currentState?.reset();
    _titleController.clear();
    _descriptionController.clear();
    _startingPriceController.clear();
    _incrementAmountController.clear();
    setState(() {
      _selectedCategory = null;
      _thumbnailImage = null;
      _galleryImages = [];
      _startTime = null;
      _endTime = null;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Auction created successfully.')),
    );
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.0)),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, {int maxLines = 1, TextInputType keyboardType = TextInputType.text}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: controller,
          decoration: _inputDecoration(label),
          keyboardType: keyboardType,
          maxLines: maxLines,
          validator: (value) {
            if (value == null || value.isEmpty) return 'Please enter ${label.toLowerCase()}';
            if ((label.contains('Price') || label.contains('Amount')) &&
                (double.tryParse(value) == null || double.parse(value) <= 0)) {
              return 'Please enter a valid ${label.toLowerCase()}';
            }
            return null;
          },
          onChanged: (_) => setState(() {}),
        ),
        if (label.contains('Price') || label.contains('Amount'))
          _buildSuggestions(controller.text, controller),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Create Auction'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0.5,
      ),
      backgroundColor: const Color(0xFFF9F9F9),
      body: _isLoadingCategories
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Auction Information", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              _buildTextField(_titleController, 'Title'),
              const SizedBox(height: 12),
              _buildTextField(_descriptionController, 'Description', maxLines: 3),
              const SizedBox(height: 12),
              DropdownButtonFormField<Category>(
                decoration: _inputDecoration('Category'),
                value: _selectedCategory,
                borderRadius: BorderRadius.circular(8),
                icon: const Icon(Icons.keyboard_arrow_down_rounded),
                items: _categories.map((category) => DropdownMenuItem<Category>(
                  value: category,
                  child: Text(category.name),
                )).toList(),
                onChanged: (value) => setState(() => _selectedCategory = value),
                validator: (value) => value == null ? 'Please select a category' : null,
              ),
              const SizedBox(height: 24),
              const Text("Pricing", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              _buildTextField(_startingPriceController, 'Starting Price (VNĐ)', keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              _buildTextField(_incrementAmountController, 'Increment Amount (VNĐ)', keyboardType: TextInputType.number),
              const SizedBox(height: 24),
              const Text("Auction Schedule", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => _selectDate(context, true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _startTime != null
                              ? DateFormat('dd/MM/yyyy HH:mm').format(_startTime!)
                              : 'Select Start Time',
                          style: const TextStyle(fontSize: 15),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => _selectDate(context, false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _endTime != null
                              ? DateFormat('dd/MM/yyyy HH:mm').format(_endTime!)
                              : 'Select End Time',
                          style: const TextStyle(fontSize: 15),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const Text("Choose Image", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _pickThumbnail,
                      icon: const Icon(Icons.image_outlined),
                      label: const Text("Thumbnail"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.deepPurple,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 3,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _pickGalleryImages,
                      icon: const Icon(Icons.photo_library_outlined),
                      label: const Text("Gallery"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.indigo,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 3,
                      ),
                    ),
                  ),
                ],
              ),
              if (_thumbnailImage != null || _galleryImages.isNotEmpty) const SizedBox(height: 12),
              if (_thumbnailImage != null)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Thumbnail Preview", style: TextStyle(fontSize: 14)),
                    const SizedBox(height: 6),
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(
                            File(_thumbnailImage!.path),
                            width: 120,
                            height: 120,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Positioned(
                          top: 4,
                          right: 4,
                          child: GestureDetector(
                            onTap: () async {
                              final confirm = await _confirmDelete();
                              if (confirm) setState(() => _thumbnailImage = null);
                            },
                            child: Container(
                              decoration: const BoxDecoration(
                                color: Colors.black54,
                                shape: BoxShape.circle,
                              ),
                              padding: const EdgeInsets.all(4),
                              child: const Icon(Icons.close, color: Colors.white, size: 16),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              if (_galleryImages.isNotEmpty)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),
                    const Text("Gallery Preview", style: TextStyle(fontSize: 14)),
                    const SizedBox(height: 6),
                    SizedBox(
                      height: 100,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _galleryImages.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          return Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.file(
                                  File(_galleryImages[index].path),
                                  width: 100,
                                  height: 100,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              Positioned(
                                top: 4,
                                right: 4,
                                child: GestureDetector(
                                  onTap: () async {
                                    final confirm = await _confirmDelete();
                                    if (confirm) {
                                      setState(() => _galleryImages.removeAt(index));
                                    }
                                  },
                                  child: Container(
                                    decoration: const BoxDecoration(
                                      color: Colors.black54,
                                      shape: BoxShape.circle,
                                    ),
                                    padding: const EdgeInsets.all(4),
                                    child: const Icon(Icons.close, color: Colors.white, size: 14),
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                  ],
                ),
              const SizedBox(height: 32),
              _isUploading
                  ? const Center(child: CircularProgressIndicator())
                  : SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _submitForm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.black,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 4,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: const Text(
                    'Create Auction',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
