// import React from 'react';
// import DuckDBInterface from '../../duckdb/components/DuckDBInterface';

// interface DuckDBProps {
//   autoInit?: boolean;
//   showSampleData?: boolean;
//   initialQuery?: string;
//   maxRows?: number;
//   className?: string;
//   style?: React.CSSProperties;
// }

// export const DuckDB: React.FC<DuckDBProps> = ({
//   autoInit = true,
//   showSampleData = true,
//   initialQuery = 'SELECT * FROM sample_data LIMIT 10;',
//   maxRows = 1000,
//   className = '',
//   style
// }) => {
//   return (
//     <DuckDBInterface
//       autoInit={autoInit}
//       showSampleData={showSampleData}
//       initialQuery={initialQuery}
//       maxRows={maxRows}
//       className={className}
//       style={style}
//     />
//   );
// };