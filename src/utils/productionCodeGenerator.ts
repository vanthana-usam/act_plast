
export const generateProductionCode = (
  machine: string,
  productCode: string,
  date: string,
  shift: string,
  productionType: 'injection' | 'assembly' = 'injection'
): string => {
  // Production type prefix
  const typePrefix = productionType === 'injection' ? 'IM' : 'AP';
  
  // Extract machine number (e.g., "MACHINE-001" -> "01")
  const machineNumber = machine.replace(/[^0-9]/g, '').padStart(2, '0').slice(-2);
  
  // Format date as DDMMYY (from YYYY-MM-DD to DDMMYY)
  const dateObj = new Date(date);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString().slice(-2);
  const dateFormatted = `${day}${month}${year}`;
  
  return `${typePrefix}${machineNumber}${dateFormatted}${shift}`;
};

export const parseProductionCode = (code: string) => {
  if ((!code.startsWith('IM') && !code.startsWith('AP')) || code.length !== 12) {
    return null;
  }
  
  const productionType = code.startsWith('IM') ? 'injection' : 'assembly';
  const machineNumber = code.slice(2, 4);
  const date = code.slice(4, 10);
  const shift = code.slice(10, 12);
  
  // Convert DDMMYY back to YYYY-MM-DD
  const day = date.slice(0, 2);
  const month = date.slice(2, 4);
  const year = '20' + date.slice(4, 6);
  const formattedDate = `${year}-${month}-${day}`;
  
  return {
    productionType,
    machineNumber,
    date: formattedDate,
    shift
  };
};
