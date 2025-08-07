const { Client, PrivateKey, AccountId, ContractCreateFlow, ContractFunctionParameters, ContractCallQuery, Hbar } = require("@hashgraph/sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function deployContracts() {
    // Configure client
    const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_OPERATOR_KEY);
    
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    try {
        console.log("🚀 Starting EcoNexus smart contract deployment...");
        console.log("================================================");
        
        // Read compiled contract bytecode
        // In production, you would compile the Solidity contracts first
        // For now, we'll use placeholder bytecode
        const contractBytecode = "0x608060405234801561001057600080fd5b50"; // Placeholder
        
        // Deploy EcoNexusMarketplace contract
        console.log("\n📝 Deploying EcoNexus Marketplace Contract...");
        
        const contractCreateTx = new ContractCreateFlow()
            .setBytecode(contractBytecode)
            .setGas(100000)
            .setConstructorParameters(
                new ContractFunctionParameters()
                    .addAddress(operatorId.toSolidityAddress()) // treasury
                    .addAddress(operatorId.toSolidityAddress()) // guardian
            );

        const contractCreateSubmit = await contractCreateTx.execute(client);
        const contractCreateReceipt = await contractCreateSubmit.getReceipt(client);
        const contractId = contractCreateReceipt.contractId;
        
        console.log(`✅ Marketplace Contract deployed: ${contractId}`);
        
        // Save contract addresses
        const deploymentInfo = {
            network: "testnet",
            deployedAt: new Date().toISOString(),
            contracts: {
                marketplace: {
                    address: contractId.toString(),
                    transactionId: contractCreateSubmit.transactionId.toString()
                }
            },
            operator: operatorId.toString()
        };
        
        // Write deployment info to file
        fs.writeFileSync(
            path.join(__dirname, "../deployment.json"),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\n📄 Deployment info saved to deployment.json");
        
        // Initialize contract with sample data
        console.log("\n🔧 Initializing contract with sample data...");
        
        // Register sample zones
        // In production, this would be done through the Guardian
        
        console.log("\n✨ Deployment complete!");
        console.log("================================================");
        console.log(`Marketplace Contract: ${contractId}`);
        console.log(`View on HashScan: https://hashscan.io/testnet/contract/${contractId}`);
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    } finally {
        client.close();
    }
}

// Run deployment
deployContracts().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});