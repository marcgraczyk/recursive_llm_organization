# Recursive research organization



### High-level
We propose a minimal design of a research organization:
*  the proposals can only be submitted through an LLM
* a proposal is the result of a prompt evaluated against an LLM with pre-committed weights 
* there are two key entities: a weight setter and a proposer/prompter (the one prompting the weight setter's LLM and submitting the proposal)
* there are mandatory prompt structures that each prompt should abide by 
* the prompter is the highest bidder for a given "slot" under a sequential model : only one prompt is active at the time 
* the prompter and the weight setter obtain a share (e.g 10% each) of the reward delta to the organization during their proposal timeframe (at least one slot) 
* the reward delta is currently the delta in market cap of the organization's token
* a higher evaluation horizon (more slots) also means higher bidding price since the bidder needs to buy out the opportunity cost of the experiments the organization isn't running (more sophisticated mechanisms could allow for non-interfering experiments)
    

### Specs v1

* There is only one entity called the prompter. The model against which prompts are evaluated is a constitutional model that can be changed through governance. It is a parameter `currentModelUrl` in the contract which would link to e.g a Hugging Face repo.
* All the logic is in a `PromptUpdate` contract containing a`updatePrompt` function that can be called every `epoch_length`
* The prompter is the first entity that manages to call the `updatePrompt` function in a block
* They submit a payment $b_1$ in their transaction  
* $b_1$ is stored by the contract
* To update the prompt again $n$ epochs since the last prompt update a prompter has to submit a payment that is greater than $\frac{b_1}{n}$ and be the first to do that in the block. 
* Suppose that the prompt which was submitted with $b_1$ was active during $n$ blocks. If the market cap increases, the underlying prompter receives 10% of the delta in market cap during those $n$ blocks.  
    * the `updatePrompt` function reads the pool's price and the total supply when the prompt is updated, stores the price and the supply. 
    * suppose the price and total supply at $t_1 are $p_1$ and $T_1$, similarly $p_2$ and $T_2$
    *  $\delta = p_2 T_2 - p_1 T_1$ in $
    *  the prompter receives $\frac{0.1 \delta}{p_2}$ tokens which are minted by the token contract
* If the market cap decreases the payment $b_1$ is burned
* There is a two speed system w.r.t the voting period on a proposal. By default it is a day and it is a week if the proposal wants to change the `currentModelUrl` or if the amount of funds allocated exceeds a critical threshold.

**Mint and Redeem contract**

This contract defines how the token of the research organization is issued to the market and how the market cap is computed for the allocation of the reward.

(token supply, reserve token supply) $=(s, s')$

To mint $x$ tokens one needs to supply reserve tokens according to a cost function:
$$c(x,s) = \int_s^{s+x} t dt = \frac{(2s + x)x}{2} $$

After a mint of $x$ tokens the supply is therefore $(s+x, s' + \frac{(2s + x)x}{2})$.
One can redeem the same $x$ tokens against reserve tokens according to a reward function that burns the given tokens:

$$r(x,s) = \int_{s-x}^s t dt = \frac{(2s-x)x}{2} $$

If someone mints and is the first one to interact with the contract after that, the burn reward would return exactly the invested money for the mint.
Minting tokens increases the price and vice versa for redeeming.

The marginal price is $s+x$ hence the market cap increase is  $(s+x)^2 - s^2$.


`costToMint()`

```
function costToMint(uint256 numTokens) public view returns (uint256) {
        uint256 netTokensMinted = totalTokensMinted - totalTokensBurned;
        return ((2*netTokensMinted + numTokens)*numTokens)/2;
    }
```

`rewardForBurn()`
```
function rewardForBurn(uint256 numTokens) public view returns (uint256) {
        return ((2*netTokensMinted - numTokens)*numTokens)/2;
    }
```

There are two minting functions

```
permissionlessMint()
```
and

```
governanceMint()
```

The first one uses the `costToMint()` function i.e one needs to supply reserve tokens to mint. The second one mints without supplying reserve tokens i.e directly increases the token supply without increasing the price in the mint and redeem contract.

There is also a `redeem()` function and a `burn()` function.
The `redeem()` function burns the submitted tokens and returns reserve tokens diminishing both supplies from the point of the view of the organization.

The `burn()` function only diminishes the token supply and does not change the reserve token supply. This increases the reserve token to token ratio.


**PromptUpdate contract**

There are three economic mechanisms in the contract:
* the slot payment by the prompter 
    * call `burn()` on the payment if the price goes down
    * keep it in a vault otherwise
* the fund allocation from the proposal uses `governanceMint()` and is restricted e.g can only increase the supply by 20%
* reward minting is set to use the `governanceMint()` - this is a variable parameter that can be changed by governance
 
## The general mechanism
### An LLM that serves the research organization

The research organization is structured as a group that is served by an LLM each slot. This LLM represents the group and acts on behalf of the group by submitting a proposal to the organization. Each slot a different proposal generated by an underlying LLM is chosen through an auction mechanism that we describe below. The entities behind the proposal are then rewarded in a token issued by the research organization. 

The proposal object is very general. It can be any change to the state of the organization. Initially, it should essentially be concerned with funding (retroactively) public good projects and with the fine-tuning of the variable governance parameters (voting period, minting function etc) . A proposal is constructed from two elements: the weights that define the underlying LLM and the prompting structure applied to the LLM. Each of these elements can involve a different entity, the entity that sets the weights (the weight setter) and the one that both writes the prompt and submits the proposal (the proposer). The weights of the LLM have to be pre-committed before the proposal is submitted. 

The only way to submit a proposal to the organization is through an LLM. The organization would enforce the following rules on a proposal:
* a prompt would need to be written according to pre-defined valid prompt structures
* the LLM needs to be aligned with the organization (a minima this means that the LLM is generated from the pre-commited weights)

Any proposal not abidding these rules would be rejected. This would initially be enforced by social consensus. A proposal would be submitted optimistically with a veto period before the proposal is executed during which anyone can challenge the proposal as not respecting the rules outlined above. The system would then fallback to a dispute resolution mechanism (e.g a trusted enclave). 

The advantage of this system is that you can always find some set of weights that could lead to a proposal. One could initially start with OpenAI models or simply with previously committed weights. This provides a minimal functional framework where we can re-use existing infra (basic DAO infra, OP stack etc). One of the first bounties the organization would then release would be about automating this social consensus.

### Advice auction mechanism


A second price auction would occur before each slot for the right to submit a proposal. The fact that after submission the proposal goes through a voting process structures the LLM generated proposal as an advice to a group since the group can decide to act or not upon it. This naturally induces an [Advice Auction](http://www.nikete.com/advice_auctions.pdf) mechanism where the organization will share a part of the reward it obtained from following the proposal with the auction winners. This reward is initially best quantified as the increase in the market cap of the organization's token. The auction winners, i.e a pair of a weight setter and a proposer, would then be rewarded by a linear share of the delta in market cap during a given timeframe minus the second highest bid. This timeframe could initially be the number of slots the proposal was active but this could be further refined. Importantly the rewards can be negative if the price of the token goes down therefore each entity would need to put forward collateral in the organization's token. One limitation of this reward mechanism is that we can only have one proposal submitted at the time.

The mechanism allows to bypass the problem of the initial offering since we reward participants based on their skills at executing the organization's objective. There is still the difficulty of the price that is part of the test function we are proposing. The network could hence auction off tokens each period to get a price for the allocation within the proposal.



### Reward mechanism : a share of the delta in market cap during the proposal time

The reward described above is justified at first since a sensible initial objective and measure of public good for the organization is the price of the organization's token. This reward share would be split between the weight setter and the proposer. The time delta should end when the proposal finalizes in case of the weight setter (the length of a slot could depend on the proposal or alternatively a proposal could be elected for various slots). This is less clear in the case of the proposer which could set a timeframe for their reward (shorter than the time length of the proposal) that would be subjectively evaluated. Initially, the evaluation timeframe would be equal for both entities. 

The simplest way of dividing the reward between the weight setter and the proposer is through a fixed percentage. For example, if the reward consists in 20% of the increase in market cap then this could be divided into two equal sub-allocations of 10%. A more involved method that could be developed in future work would be rewarding the entities based on their estimated contribution to the increased market cap. Intuitively, the real margin contribution should come from the weight setter since the prompt is only active during the time of the proposal execution. The expertise of the prompter (anchors the model in the real-world, brings market insight) also differs from that of the weight setter (defines the values and the predictive structure). 

If there are no active proposals during a slot, we could allocate the same reward regardless to the weight setter elected for the previous proposal. This would continue until there is a new proposal, they are out of collateral (in case of negative rewards) or until they force exit (and recuperate their collateral) bringing the DAO into a lock position.


### Formalism

A non empty slot $t$ consists of the following parameters $(t, b_i, P, A_w, A_p, \text{LLM}_w)$ where:
* $b_i$ is the winning bid in the advice auction
* $P$ is the generated proposal by the underlying $\text{LLM}_w$
* $A_w$ is the entity that set the weights
* $A_p$ is the entity that engineered the prompt and submitted the proposal. 

The payment rule to both $A_p$ and $A_w$ is:

$$\alpha r - \max b_{-i}$$
where $r$ is the delta in the nominal valuation of the total token supply during $t$.

### Generative governance

An appealing aspect of recursion and generative governance is that you can update to new reward methods via the mechanism itself. This evolution of the mechanism could be different depending on the type of the group served by the LLM e.g different between an LLM executing advisory governance (such as here) and an LLM that serves a marketplace. Initially, it is a key aspect of the design that some parameters are fixed and some others can be dynamically optimised through proposals.

### Addressing the intrinstic stochasticity of LLMs

LLMs are stochastic / non-deterministic since their outputs are generated from a probability distribution over the next token. Even with a fixed seed, floating point instabilities imply that one can obtain different equilibrias under the stochastic gradient descent underpinning the LLM. We therefore need a mechanism to deal with this stochasticity. The proposals could for example be composed of a sample of the LLM answers (e.g a 100 samples). The mechanism would then choose the median answer / model answer. This would also be the answer that would be verified in case of dispute. This would deserve more research and should be part of future work.

### Motivation : retroactive public good funding

The presented mechanism can be motivated by the integration of retroactive funding mechanisms within the proposals to allocate funds along the objectives of the research organization. This addresses the question of the initial value of the token issued by the research organization (there are no revenue streams initially). Indeed, the mechanism aims at identifying the LLM that will best allocate ressources to the future welfare maximising games. Hence, the value of the token is not justified by the initial present value of the mechanism but by the future value of the welfare maximising games. Under symmetry and under a retroactive mechanism, the welfare maximising games should emerge as natural Shelling points. This is particularly relevant when we expect multiple such networks (such as the research organization) to permissionlessly emerge and funding to be allocated across networks.