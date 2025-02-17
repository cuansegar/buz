// index.js
const BuzzeumAutomation = require('./buzzeumAutomation');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    try {
        console.log('=== Buzzeum Automation Tool ===\n');
        
        // Tanya jumlah wallet yang ingin dibuat
        const walletCount = await askQuestion('Masukkan jumlah wallet yang ingin dibuat: ');
        
        // Tanya kode referral
        const referralCode = await askQuestion('Masukkan kode referral (kosongkan jika tidak ada): ');
        
        console.log('\nMemulai proses...');
        console.log(`Jumlah wallet: ${walletCount}`);
        console.log(`Kode referral: ${referralCode || 'Tidak ada'}`);
        console.log('------------------------\n');

        const automation = new BuzzeumAutomation();
        const results = await automation.generateAndProcessMultiple(
            parseInt(walletCount),
            referralCode
        );
        
        console.log('\n=== Hasil Akhir ===');
        console.log(`Total Wallet Dibuat: ${results.totalWallets}`);
        console.log(`Berhasil: ${results.successCount}`);
        console.log(`Gagal: ${results.errorCount}`);
        console.log('\nHasil lengkap telah disimpan di buzzeum_results.json');
        
    } catch (error) {
        console.error('Terjadi kesalahan:', error.message);
    } finally {
        rl.close();
    }
}

main();