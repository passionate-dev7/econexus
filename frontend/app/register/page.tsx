'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Upload, Check, AlertCircle, Loader2, Trees, Camera, Satellite } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RegistrationStep {
  id: number;
  title: string;
  description: string;
}

const steps: RegistrationStep[] = [
  {
    id: 1,
    title: 'Zone Information',
    description: 'Basic details about your conservation zone'
  },
  {
    id: 2,
    title: 'Location & Boundaries',
    description: 'Define the geographical area'
  },
  {
    id: 3,
    title: 'Verification Documents',
    description: 'Upload ownership and certification documents'
  },
  {
    id: 4,
    title: 'Baseline Metrics',
    description: 'Initial environmental measurements'
  }
];

export default function RegisterZonePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Zone Information
    zoneName: '',
    description: '',
    ownerName: '',
    ownerType: 'individual',
    email: '',
    phone: '',
    
    // Step 2: Location
    latitude: '',
    longitude: '',
    area: '',
    country: '',
    region: '',
    
    // Step 3: Documents
    ownershipDoc: null as File | null,
    satelliteImage: null as File | null,
    additionalDocs: [] as File[],
    
    // Step 4: Baseline Metrics
    currentCarbonStock: '',
    speciesCount: '',
    waterQualityIndex: '',
    soilOrganicMatter: '',
    existingCertifications: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      if (field === 'additionalDocs') {
        setFormData(prev => ({
          ...prev,
          additionalDocs: [...prev.additionalDocs, ...Array.from(e.target.files!)]
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare the registration data
      const registrationData = {
        name: formData.zoneName,
        description: formData.description,
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          area: parseFloat(formData.area)
        },
        ownerAccountId: '0.0.1234', // In production, get from wallet
        ownerName: formData.ownerName,
        ownerType: formData.ownerType,
        contact: {
          email: formData.email,
          phone: formData.phone
        },
        baseline: {
          carbonStock: parseFloat(formData.currentCarbonStock),
          speciesCount: parseInt(formData.speciesCount),
          waterQualityIndex: parseFloat(formData.waterQualityIndex),
          soilOrganicMatter: parseFloat(formData.soilOrganicMatter)
        }
      };

      // Call the API to register the zone
      const response = await fetch('/api/zones/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to dashboard with success message
        router.push(`/dashboard?newZone=${result.zone.id}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register zone. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Register Your Conservation Zone
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join the EcoNexus network and start generating environmental credits
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  step.id <= currentStep ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    step.id < currentStep
                      ? 'bg-green-600 text-white'
                      : step.id === currentStep
                      ? 'bg-green-100 text-green-600 border-2 border-green-600'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <p className="text-xs font-medium hidden sm:block">{step.title}</p>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
        >
          {/* Step 1: Zone Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zone Name *
                </label>
                <input
                  type="text"
                  name="zoneName"
                  value={formData.zoneName}
                  onChange={handleInputChange}
                  placeholder="e.g., Amazon Rainforest Conservation Area"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your conservation zone and its environmental importance..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="Individual or Organization Name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Owner Type *
                  </label>
                  <select
                    name="ownerType"
                    value={formData.ownerType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="individual">Individual</option>
                    <option value="community">Community</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 234 567 8900"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location & Boundaries */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Provide accurate GPS coordinates for your conservation zone. You can use tools like Google Maps to find the exact coordinates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="-3.4653"
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="-62.2159"
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Area (hectares) *
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="1250"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Brazil"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State/Region *
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Amazonas"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Map Preview (placeholder) */}
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Map preview will appear here</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verification Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      All documents will be verified through Hedera Guardian. Ensure documents are clear and valid.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Land Ownership Document *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Upload proof of ownership or usage rights
                  </p>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'ownershipDoc')}
                    className="hidden"
                    id="ownership-doc"
                    accept=".pdf,.jpg,.png"
                  />
                  <label
                    htmlFor="ownership-doc"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700"
                  >
                    Choose File
                  </label>
                  {formData.ownershipDoc && (
                    <p className="mt-2 text-sm text-green-600">
                      {formData.ownershipDoc.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recent Satellite Image
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Satellite className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Upload a recent satellite image of your zone
                  </p>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'satelliteImage')}
                    className="hidden"
                    id="satellite-image"
                    accept=".jpg,.png"
                  />
                  <label
                    htmlFor="satellite-image"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700"
                  >
                    Choose File
                  </label>
                  {formData.satelliteImage && (
                    <p className="mt-2 text-sm text-green-600">
                      {formData.satelliteImage.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Environmental assessments, certifications, photos, etc.
                  </p>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'additionalDocs')}
                    className="hidden"
                    id="additional-docs"
                    accept=".pdf,.jpg,.png"
                    multiple
                  />
                  <label
                    htmlFor="additional-docs"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700"
                  >
                    Choose Files
                  </label>
                  {formData.additionalDocs.length > 0 && (
                    <div className="mt-2">
                      {formData.additionalDocs.map((file, index) => (
                        <p key={index} className="text-sm text-green-600">
                          {file.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Baseline Metrics */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Trees className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 dark:text-green-300">
                      Provide current environmental metrics for your zone. These will serve as the baseline for measuring improvements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Carbon Stock (tons CO₂) *
                  </label>
                  <input
                    type="number"
                    name="currentCarbonStock"
                    value={formData.currentCarbonStock}
                    onChange={handleInputChange}
                    placeholder="450"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Species Count *
                  </label>
                  <input
                    type="number"
                    name="speciesCount"
                    value={formData.speciesCount}
                    onChange={handleInputChange}
                    placeholder="342"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Water Quality Index (0-100) *
                  </label>
                  <input
                    type="number"
                    name="waterQualityIndex"
                    value={formData.waterQualityIndex}
                    onChange={handleInputChange}
                    placeholder="85"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Soil Organic Matter (%) *
                  </label>
                  <input
                    type="number"
                    name="soilOrganicMatter"
                    value={formData.soilOrganicMatter}
                    onChange={handleInputChange}
                    placeholder="8.5"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Existing Certifications (if any)
                </label>
                <textarea
                  name="existingCertifications"
                  value={formData.existingCertifications}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="List any existing environmental certifications (e.g., FSC, Rainforest Alliance, etc.)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Previous
            </button>

            <button
              onClick={nextStep}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : currentStep === steps.length ? (
                'Submit Registration'
              ) : (
                'Next Step'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}