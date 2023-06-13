// DaoToken Values
export const TOKEN_NAME = "MyDaoToken"
export const TOKEN_SYMBOL = "MDT"
export const INIT_TOKEN_SUPPLY = "1000000000000000000000000"

// Governor Values
export const QUORUM_PERCENTAGE = 4  // need 4% of voters to pass
export const MIN_DELAY = 3600       // 1 hour - after a vote passes, you have 1 hour before you can enact
export const VOTING_PERIOD = 5      // 5 blocks - how long the vote lasts
export const VOTING_DELAY = 1       // 1 block - how many blocks till a proposal vote becomes active
export const PROPOSAL_THRESHOLD = 0 // 0 - how many votes required in order for a voter to become a proposer

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"