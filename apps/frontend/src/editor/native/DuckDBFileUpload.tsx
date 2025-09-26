import React from 'react';
import DuckDBFileUpload from '../../duckdb/components/DuckDBFileUpload';

interface DuckDBFileUploadProps {
  onFileLoaded?: (filename: string, size: number) => void;
  onError?: (error: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const DuckDBFileUploadComponent: React.FC<DuckDBFileUploadProps> = (props) => {
  return <DuckDBFileUpload {...props} />;
};