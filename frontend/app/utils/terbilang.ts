/**
 * Converts a number into Indonesian words (Terbilang)
 * Example: 170000 -> "Seratus Tujuh Puluh Ribu Rupiah"
 */
export function terbilang(n: number): string {
  if (n === 0) return "Nol Rupiah";

  const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  
  function konversi(num: number): string {
    if (num === 0) return '';
    if (num < 12) return satuan[num] ?? '';
    if (num < 20) return konversi(num - 10) + ' Belas';
    if (num < 100) return konversi(Math.floor(num / 10)) + ' Puluh ' + konversi(num % 10);
    if (num < 200) return 'Seratus ' + konversi(num - 100);
    if (num < 1000) return konversi(Math.floor(num / 100)) + ' Ratus ' + konversi(num % 100);
    if (num < 2000) return 'Seribu ' + konversi(num - 1000);
    if (num < 1_000_000) return konversi(Math.floor(num / 1000)) + ' Ribu ' + konversi(num % 1000);
    if (num < 1_000_000_000) return konversi(Math.floor(num / 1_000_000)) + ' Juta ' + konversi(num % 1_000_000);
    if (num < 1_000_000_000_000) return konversi(Math.floor(num / 1_000_000_000)) + ' Miliar ' + konversi(num % 1_000_000_000);
    if (num < 1_000_000_000_000_000) return konversi(Math.floor(num / 1_000_000_000_000)) + ' Triliun ' + konversi(num % 1_000_000_000_000);
    return '';
  }

  const hasil = konversi(n).replace(/\s+/g, " ").trim();
  return hasil + " Rupiah";
}
