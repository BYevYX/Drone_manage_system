'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useDroneStore } from '@/src/lib/stores/drone';
import type { DroneFormData, DroneType } from '@/src/types/drone';

const droneRegistrationSchema = z.object({
  serialNumber: z.string().min(1, 'Serial number is required'),
  model: z.string().min(1, 'Model is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  type: z.enum(['multirotor', 'fixed-wing', 'hybrid', 'helicopter', 'vtol']),
  registrationNumber: z.string().optional(),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  warrantyExpiry: z.string().optional(),
  specifications: z.object({
    weight: z.number().min(0.1, 'Weight must be greater than 0'),
    dimensions: z.object({
      length: z.number().min(1, 'Length is required'),
      width: z.number().min(1, 'Width is required'),
      height: z.number().min(1, 'Height is required'),
      wingspan: z.number().optional(),
    }),
    batteryCapacity: z
      .number()
      .min(100, 'Battery capacity must be at least 100mAh'),
    flightTime: z.number().min(1, 'Flight time must be at least 1 minute'),
    maxSpeed: z.number().min(1, 'Max speed must be greater than 0'),
    maxAltitude: z.number().min(1, 'Max altitude must be greater than 0'),
    payloadCapacity: z.number().min(0, 'Payload capacity cannot be negative'),
    operatingTemperature: z.object({
      min: z.number(),
      max: z.number(),
    }),
    windResistance: z.number().min(0, 'Wind resistance cannot be negative'),
    range: z.number().min(0.1, 'Range must be greater than 0'),
    chargingTime: z.number().min(1, 'Charging time must be at least 1 minute'),
    ipRating: z.string().optional(),
  }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof droneRegistrationSchema>;

const droneTypes: { value: DroneType; label: string }[] = [
  { value: 'multirotor', label: 'Multirotor' },
  { value: 'fixed-wing', label: 'Fixed-Wing' },
  { value: 'hybrid', label: 'Hybrid VTOL' },
  { value: 'helicopter', label: 'Helicopter' },
  { value: 'vtol', label: 'VTOL' },
];

interface DroneRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DroneRegistrationForm({
  onSuccess,
  onCancel,
}: DroneRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { createDrone, isLoading } = useDroneStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(droneRegistrationSchema),
    mode: 'onChange',
    defaultValues: {
      specifications: {
        operatingTemperature: { min: -10, max: 40 },
        dimensions: {},
      },
    },
  });

  // const watchedType = watch('type');

  const steps = [
    { title: 'Basic Information', description: 'Enter basic drone details' },
    {
      title: 'Technical Specifications',
      description: 'Physical and performance specs',
    },
    { title: 'Additional Details', description: 'Notes and final details' },
  ];

  const nextStep = async () => {
    const isStepValid = await trigger();

    if (isStepValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const droneData: DroneFormData = {
        ...data,
        certifications: [],
        tags: [],
      };

      await createDrone(droneData);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating drone:', error);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Serial Number *
          </label>
          <input
            {...register('serialNumber')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter serial number"
          />
          {errors.serialNumber && (
            <p className="mt-1 text-sm text-red-600">
              {errors.serialNumber.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model *
          </label>
          <input
            {...register('model')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter model name"
          />
          {errors.model && (
            <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manufacturer *
          </label>
          <input
            {...register('manufacturer')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter manufacturer"
          />
          {errors.manufacturer && (
            <p className="mt-1 text-sm text-red-600">
              {errors.manufacturer.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drone Type *
          </label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select drone type</option>
                {droneTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Date *
          </label>
          <input
            {...register('purchaseDate')}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.purchaseDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.purchaseDate.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSpecifications = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight (kg) *
          </label>
          <input
            {...register('specifications.weight', { valueAsNumber: true })}
            type="number"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.0"
          />
          {errors.specifications?.weight && (
            <p className="mt-1 text-sm text-red-600">
              {errors.specifications.weight.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Battery Capacity (mAh) *
          </label>
          <input
            {...register('specifications.batteryCapacity', {
              valueAsNumber: true,
            })}
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
          {errors.specifications?.batteryCapacity && (
            <p className="mt-1 text-sm text-red-600">
              {errors.specifications.batteryCapacity.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flight Time (minutes) *
          </label>
          <input
            {...register('specifications.flightTime', { valueAsNumber: true })}
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
          {errors.specifications?.flightTime && (
            <p className="mt-1 text-sm text-red-600">
              {errors.specifications.flightTime.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Speed (km/h) *
          </label>
          <input
            {...register('specifications.maxSpeed', { valueAsNumber: true })}
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
          {errors.specifications?.maxSpeed && (
            <p className="mt-1 text-sm text-red-600">
              {errors.specifications.maxSpeed.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Altitude (m) *
          </label>
          <input
            {...register('specifications.maxAltitude', {
              valueAsNumber: true,
            })}
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
          {errors.specifications?.maxAltitude && (
            <p className="mt-1 text-sm text-red-600">
              {errors.specifications.maxAltitude.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payload Capacity (kg) *
          </label>
          <input
            {...register('specifications.payloadCapacity', {
              valueAsNumber: true,
            })}
            type="number"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.0"
          />
          {errors.specifications?.payloadCapacity && (
            <p className="mt-1 text-sm text-red-600">
              {errors.specifications.payloadCapacity.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderSpecifications();
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes about this drone..."
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Register New Drone
        </h2>
        <p className="text-gray-600">
          Add a new drone to your fleet with detailed specifications
        </p>
      </div>

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-full h-1 mx-4 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {steps[currentStep].title}
          </h3>
          <p className="text-sm text-gray-600">
            {steps[currentStep].description}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          <div className="flex space-x-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Register Drone
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
