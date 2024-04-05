async function main() {
    // Grab the contract factory 
    const MyGovernor = await ethers.getContractFactory("MyGovernor");

    // Start deployment, returning a promise that resolves to a contract object
    const myGovernor = await MyGovernor.deploy("0xb4E6439E5Be60E628a104bB1a65AB9Cf5B5Ed7c4"); // Instance of the contract taking token contract address as input
    console.log("Contract deployed to address:", myGovernor.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
