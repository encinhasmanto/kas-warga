/**
 * Utility to convert Static QRIS to Dynamic QRIS using EMVCo specifications.
 */

/**
 * Calculates the CRC16-CCITT (False) checksum required for the final Tag 63.
 * Polynomial: 0x1021, Initial Value: 0xFFFF
 * RefIn/RefOut: false
 * @param {string} data - The alphanumeric payload string
 * @returns {string} - 4-character Hexadecimal CRC
 */
function calculateCRC16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Transforms a static QRIS payload into a Dynamic one with a specific amount.
 * @param {string} staticPayload - The original Rp 0 alphanumeric string
 * @param {number} amount - The total amount to be paid
 * @returns {string} - Valid Dynamic QRIS payload
 */
export function generateDynamicQRIS(staticPayload: string, amount: number): string {
  if (!staticPayload || !amount || amount <= 0) return staticPayload;

  // 1. Updating Point of Initiation from Static (11) to Dynamic (12) for mobile payments
  let dynamicBase = staticPayload.replace('010211', '010212');

  // 2. Stripping the existing Tag 63 and its 4-digit CRC checksum
  let cleanPayload = dynamicBase.slice(0, -8); 

  // 3. Cleaning up any existing Tag 54 amount data to avoid duplicates
  cleanPayload = cleanPayload.replace(/54\d{2}\d+/, '');

  // 4. Building the new Amount Tag (Tag 54) using the provided payment total
  const amountValue = Math.floor(amount).toString();
  const amountLength = amountValue.length.toString().padStart(2, '0');
  const tag54 = `54${amountLength}${amountValue}`;

  // 5. Injecting the new amount tag before the Country Code (Tag 58) segment
  const parts = cleanPayload.split('5802ID');
  if (parts.length < 2) return staticPayload; 

  const payloadToSeal = `${parts[0]}${tag54}5802ID${parts[1]}6304`;

  // 6. Generating the final CRC16-CCITT checksum and sealing the payload
  const newCRC = calculateCRC16(payloadToSeal);

  return payloadToSeal + newCRC;
}
