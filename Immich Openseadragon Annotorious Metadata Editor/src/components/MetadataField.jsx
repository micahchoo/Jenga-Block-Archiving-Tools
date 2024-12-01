// MetadataField.jsx
import PropTypes from 'prop-types';

const MetadataField = ({ 
  label, 
  value, 
  onChange, 
  type = 'text',
  multiline = false,
  readonly = false 
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={readonly}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:border-transparent disabled:opacity-50 
            disabled:cursor-not-allowed resize-y min-h-[100px]"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={readonly}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md 
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:border-transparent disabled:opacity-50 
            disabled:cursor-not-allowed"
        />
      )}
    </div>
  );
};

MetadataField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  type: PropTypes.string,
  multiline: PropTypes.bool,
  readonly: PropTypes.bool
};

export default MetadataField;