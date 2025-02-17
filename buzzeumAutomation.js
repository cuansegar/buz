// buzzeumAutomation.js
const { ethers } = require('ethers');
const fs = require('fs');

class BuzzeumAutomation {
    constructor() {
        this.baseUrl = 'https://airdrop.buzzeum.space';
    }

    generateWallet() {
        return ethers.Wallet.createRandom();
    }

    async signMessage(wallet, message) {
        try {
            return await wallet.signMessage(message);
        } catch (error) {
            console.error('Error signing message:', error);
            throw error;
        }
    }

    async registerWallet(wallet, referralCode = '') {
        try {
            // Register user
            console.log('📝 Mendaftarkan wallet...');
            const registerResponse = await fetch(`${this.baseUrl}/server.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address: wallet.address,
                    invited_by: ''
                })
            });

            const registerData = await registerResponse.json();
            
            if (!registerData.success) {
                throw new Error(registerData.message || 'Registrasi gagal');
            }

            // Submit referral if provided
            if (referralCode) {
                console.log('🔗 Menambahkan referral...');
                const referralResponse = await fetch(`${this.baseUrl}/jointeam.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        storedAddress: wallet.address,
                        inputInviteCode: referralCode
                    })
                });

                const referralData = await referralResponse.json();
                if (!referralData.success) {
                    console.warn('⚠️ Referral warning:', referralData.message);
                }
            }

            return registerData;
        } catch (error) {
            throw error;
        }
    }

    async claimDrops(wallet) {
        try {
            console.log('🎁 Claiming drops...');
            const message = "Claim Buzzeum Drops";
            const signature = await this.signMessage(wallet, message);

            const claimResponse = await fetch(`${this.baseUrl}/claimDrops.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uad: wallet.address,
                    sgn: signature
                })
            });

            const claimData = await claimResponse.json();
            if (!claimData.success) {
                throw new Error(claimData.message || 'Claim gagal');
            }

            return claimData;
        } catch (error) {
            throw error;
        }
    }

    async verifyTask(wallet) {
        try {
            console.log('✅ Verifying task...');
            const verifyResponse = await fetch(`${this.baseUrl}/verify_tweet.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tweet_id: 'https://x.com/buzzeum/status/1891225026944258421',
                    user_id: wallet.address,
                    task_id: '5',
                    rew: '700'
                })
            });

            const verifyData = await verifyResponse.json();
            if (!verifyData.success) {
                throw new Error(verifyData.message || 'Verifikasi task gagal');
            }

            return verifyData;
        } catch (error) {
            throw error;
        }
    }

    async processWallet(wallet, referralCode) {
        const result = {
            wallet: {
                address: wallet.address,
                privateKey: wallet.privateKey,
                mnemonic: wallet.mnemonic.phrase
            },
            steps: {}
        };

        try {
            // Step 1: Register
            result.steps.register = await this.registerWallet(wallet, referralCode);
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 2: Claim Drops
            result.steps.claim = await this.claimDrops(wallet);
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 3: Verify Task
            result.steps.verify = await this.verifyTask(wallet);

            result.success = true;
        } catch (error) {
            result.success = false;
            result.error = error.message;
        }

        return result;
    }

    async generateAndProcessMultiple(count, referralCode = '') {
        const results = [];
        let successCount = 0;
        let errorCount = 0;

        console.log(`\n🚀 Memulai proses untuk ${count} wallet...\n`);

        for (let i = 0; i < count; i++) {
            try {
                const wallet = this.generateWallet();
                console.log(`\n📍 Processing wallet ${i + 1}/${count}`);
                console.log(`📬 Address: ${wallet.address}`);

                const result = await this.processWallet(wallet, referralCode);
                results.push(result);

                if (result.success) {
                    successCount++;
                    console.log('✨ Sukses: Semua proses berhasil');
                } else {
                    errorCount++;
                    console.log('❌ Error:', result.error);
                }

                // Delay between wallets
                if (i < count - 1) {
                    console.log('\n⏳ Menunggu sebelum proses wallet berikutnya...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

            } catch (error) {
                errorCount++;
                console.error(`❌ Fatal error pada wallet ${i + 1}:`, error.message);
                results.push({
                    success: false,
                    error: error.message
                });
            }
        }

        // Save results
        const finalResult = {
            timestamp: new Date().toISOString(),
            totalWallets: count,
            successCount,
            errorCount,
            referralCode,
            results
        };

        const filename = `buzzeum_results_${new Date().toISOString().replace(/:/g, '-')}.json`;
        fs.writeFileSync(filename, JSON.stringify(finalResult, null, 2));
        console.log(`\n📝 Hasil telah disimpan ke ${filename}`);

        return finalResult;
    }
}

module.exports = BuzzeumAutomation;