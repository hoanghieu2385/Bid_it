import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/services/user_service.dart';

class EkycVerificationPage extends StatefulWidget {
  const EkycVerificationPage({super.key});

  @override
  State<EkycVerificationPage> createState() => _EkycVerificationPageState();
}

class _EkycVerificationPageState extends State<EkycVerificationPage> {
  final UserService _userService = UserService();
  final TextEditingController _citizenIdController = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  final _formKey = GlobalKey<FormState>();

  XFile? _frontImage;
  XFile? _backImage;
  String? _frontImagePreview;
  String? _backImagePreview;

  String _status = 'Not Submitted';
  String? _message;
  bool _isSubmitting = false;
  bool _isVerified = false;

  Timer? _statusCheckTimer;


  @override
  void initState() {
    super.initState();
    _loadStatus().then((_) {
      if (_status == 'Pending') {
        _startStatusPolling();
      }
    });
    _loadUserImages();
  }

  void _startStatusPolling() {
    _statusCheckTimer?.cancel();
    _statusCheckTimer = Timer.periodic(const Duration(seconds: 10), (_) async {
      final oldStatus = _status;
      await _loadStatus();

      if (_status != oldStatus && _status == 'Verified') {
        _statusCheckTimer?.cancel();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('eKYC has been approved by admin!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    });
  }


  Future<void> _loadStatus() async {
    try {
      final data = await _userService.getCurrentUserVerificationStatus();
      setState(() {
        _citizenIdController.text = data['citizenId'] ?? '';
        _status = _mapStatus(data['cccdStatus']);
        _isVerified = data['cccdStatus']?.toUpperCase() == 'APPROVED';
      });
    } catch (e) {
      setState(() => _message = 'Failed to load status');
    }
  }

  Future<void> _loadUserImages() async {
    try {
      final user = await UserService.getCurrentUser();
      setState(() {
        _frontImagePreview = user?['citizenIdFrontImage'];
        _backImagePreview = user?['citizenIdBackImage'];
      });
    } catch (e) {
      setState(() => _message = 'Failed to load image data');
    }
  }

  String _mapStatus(String? value) {
    switch (value?.toUpperCase()) {
      case 'APPROVED':
        return 'Verified';
      case 'PENDING':
        return 'Pending';
      case 'REJECTED':
        return 'Rejected';
      default:
        return 'Not Submitted';
    }
  }

  Future<void> _pickImage(bool isFront) async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        if (isFront) {
          _frontImage = pickedFile;
          _frontImagePreview = pickedFile.path;
        } else {
          _backImage = pickedFile;
          _backImagePreview = pickedFile.path;
        }
      });
    }
  }

  Future<void> _submitEkyc() async {
    setState(() {
      _message = null;
      _isSubmitting = true;
    });

    if (!_formKey.currentState!.validate() || _frontImage == null || _backImage == null) {
      setState(() {
        _isSubmitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill all required fields and upload both images'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 3),
        ),
      );
      return;
    }

    try {
      String rawCccd = _citizenIdController.text.trim();

      if (!RegExp(r'^\d{12}$').hasMatch(rawCccd)) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Invalid Citizen ID: must be exactly 12 digits'),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 3),
          ),
        );
        return;
      }

      int frontLength = await _frontImage!.length();
      int backLength = await _backImage!.length();
      if (frontLength <= 0 || backLength <= 0) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Invalid image file'),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 3),
          ),
        );
        return;
      }

      final result = await _userService.updateCCCD(rawCccd, _frontImage!, _backImage!);
      print(result);
      if (result['success'] == true) {
        await _loadStatus();
        await _loadUserImages();
        setState(() {
          _status = 'Pending';
          _message = null;
        });
        _startStatusPolling();

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('eKYC submitted successfully!'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );
      } else {
        throw Exception('Unknown error occurred during submission.');
      }
    } catch (e) {
      print('Error during submission: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Submission failed: ${e.toString()}'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
        ),
      );
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }


  bool get _isEditable => _status == 'Not Submitted' || _status == 'Rejected';

  Widget _buildImageSection(String label, String? previewPath, bool isFront) {
    final imageWidget = previewPath != null && previewPath.isNotEmpty
        ? ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image(
        image: previewPath.startsWith('http')
            ? NetworkImage(previewPath)
            : FileImage(File(previewPath)) as ImageProvider,
        width: double.infinity,
        height: 180,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 40, color: Colors.red),
              const SizedBox(height: 8),
              Text('Failed to load $label', style: TextStyle(color: Colors.red)),
            ],
          ),
        ),
      ),
    )
        : Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.camera_alt_outlined, size: 40, color: Colors.orange),
          const SizedBox(height: 8),
          Text('Tap to upload $label', style: TextStyle(color: Colors.orange)),
        ],
      ),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        (_isVerified || _status == 'Pending')
            ? Container(
          width: double.infinity,
          height: 180,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.orange, width: 1.5),
          ),
          child: imageWidget,
        )
            : GestureDetector(
          onTap: _isEditable ? () => _pickImage(isFront) : null,
          child: Container(
            width: double.infinity,
            height: 180,
            decoration: BoxDecoration(
              color: Colors.orange.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.orange, width: 1.5),
            ),
            child: imageWidget,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('eKYC Verification'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Status: $_status', style: const TextStyle(fontSize: 16)),
              if (_status == 'Pending')
                const Padding(
                  padding: EdgeInsets.only(top: 6.0, bottom: 12.0),
                  child: Text(
                    'Documents submitted. Please wait for admin verification.',
                    style: TextStyle(color: Colors.orange, fontStyle: FontStyle.italic),
                  ),
                ),
              if (_status == 'Rejected')
                const Padding(
                  padding: EdgeInsets.only(top: 6.0, bottom: 12.0),
                  child: Text(
                    'Your documents were rejected. Please re-submit.',
                    style: TextStyle(color: Colors.red, fontStyle: FontStyle.italic),
                  ),
                ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _citizenIdController,
                decoration: const InputDecoration(
                  labelText: 'Citizen ID',
                  border: OutlineInputBorder(),
                ),
                enabled: _isEditable,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter Citizen ID';
                  }
                  if (value.length != 12 || !RegExp(r'^\d{12}$').hasMatch(value)) {
                    return 'Citizen ID must be 12 digits';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              _buildImageSection('Front of ID Card', _frontImagePreview, true),
              const SizedBox(height: 24),
              _buildImageSection('Back of ID Card', _backImagePreview, false),
              const SizedBox(height: 24),
              if (_message != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Text(_message!, style: const TextStyle(color: Colors.red)),
                ),
              if (_isEditable)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitEkyc,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.orange,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      _isSubmitting ? 'Submitting...' : 'Submit Verification',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _citizenIdController.dispose();
    _statusCheckTimer?.cancel();
    super.dispose();
  }
}