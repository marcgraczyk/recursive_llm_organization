
const bTokenAddress = "0x1dE66E61eBD4DD176F9F9da9Ec138B87395682ec";
const modelUrl = "https://hackmd.io/uCvCVxOxS6iuzkpT9q8MmQ";

async function main() {
    // Grab the contract factory 
    const MyGovernor = await ethers.getContractFactory("MyGovernor");
    // Start deployment, returning a promise that resolves to a contract object
    const myGovernor = await MyGovernor.deploy(bTokenAddress, modelUrl); // Instance of the contract taking token contract address as input
    console.log("Contract deployed to address:", myGovernor.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
