// components/AnnotationPopup.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AnnotationPopup = ({ annotation, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    body: annotation?.body?.value || '',
    title: annotation?.title || '',
    location: {
      latitude: annotation?.target?.selector?.geometry?.latitude || '',
      longitude: annotation?.target?.selector?.geometry?.longitude || ''
    },
    createdAt: new Date().toISOString()
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...annotation,
      body: { value: formData.body, purpose: 'describing' },
      title: formData.title,
      target: {
        ...annotation.target,
        selector: {
          ...annotation.target.selector,
          geometry: {
            ...annotation.target.selector.geometry,
            latitude: parseFloat(formData.location.latitude),
            longitude: parseFloat(formData.location.longitude)
          }
        }
      },
      created: formData.createdAt
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg shadow-lg max-w-md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200">Description</label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200">Latitude</label>
            <input
              type="number"
              step="any"
              value={formData.location.latitude}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, latitude: e.target.value }
              }))}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200">Longitude</label>
            <input
              type="number"
              step="any"
              value={formData.location.longitude}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, longitude: e.target.value }
              }))}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

AnnotationPopup.propTypes = {
  annotation: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default AnnotationPopup;