// MetadataSection.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MetadataSection = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left mb-2 text-white hover:text-gray-300"
      >
        <h3 className="text-lg font-medium">{title}</h3>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {isExpanded && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

MetadataSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default MetadataSection;
