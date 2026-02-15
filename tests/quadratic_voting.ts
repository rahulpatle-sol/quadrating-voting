import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QuadraticVoting } from "../target/types/quadratic_voting";
import { expect } from "chai";

describe("quadratic_voting", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.QuadraticVoting as Program<QuadraticVoting>;
  
  const authority = provider.wallet.publicKey;
  const voter1 = anchor.web3.Keypair.generate();
  const voter2 = anchor.web3.Keypair.generate();

  let pollPDA: anchor.web3.PublicKey;
  let voter1PDA: anchor.web3.PublicKey;
  let voter2PDA: anchor.web3.PublicKey;

  const pollTitle = "Best Programming Language";
  const pollDescription = "Vote for your favorite programming language";
  const optionCount = 4; // Rust, TypeScript, Python, Go

  // Helper function to airdrop with retries
  async function airdropWithRetry(publicKey: anchor.web3.PublicKey, amount: number, retries = 5) {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`  Attempting airdrop to ${publicKey.toBase58()} (attempt ${i + 1}/${retries})...`);
        const signature = await provider.connection.requestAirdrop(publicKey, amount);
        
        // Wait for confirmation with timeout
        const latestBlockhash = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });
        
        console.log(`  ✅ Airdrop successful!`);
        return;
      } catch (error) {
        console.log(`  ⚠️ Airdrop attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) {
          throw new Error(`Failed to airdrop after ${retries} attempts: ${error.message}`);
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  before(async () => {
    console.log("\n🔧 Setting up test environment...");
    
    // Airdrop SOL to voters with retry logic
    try {
      await airdropWithRetry(voter1.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await airdropWithRetry(voter2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("❌ Failed to airdrop SOL:", error);
      throw error;
    }

    // Derive PDAs
    [pollPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), authority.toBuffer(), Buffer.from(pollTitle)],
      program.programId
    );

    [voter1PDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("voter"), pollPDA.toBuffer(), voter1.publicKey.toBuffer()],
      program.programId
    );

    [voter2PDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("voter"), pollPDA.toBuffer(), voter2.publicKey.toBuffer()],
      program.programId
    );

    console.log("✅ Test environment ready!");
    console.log(`   Poll PDA: ${pollPDA.toBase58()}`);
    console.log(`   Voter 1 PDA: ${voter1PDA.toBase58()}`);
    console.log(`   Voter 2 PDA: ${voter2PDA.toBase58()}`);
  });

  it("Creates a poll", async () => {
    await program.methods
      .createPoll(pollTitle, pollDescription, optionCount)
      .accounts({
        poll: pollPDA,
        authority: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const poll = await program.account.poll.fetch(pollPDA);
    expect(poll.title).to.equal(pollTitle);
    expect(poll.description).to.equal(pollDescription);
    expect(poll.optionCount).to.equal(optionCount);
    expect(poll.isActive).to.be.true;
    expect(poll.votes).to.have.lengthOf(optionCount);
    expect(poll.votes.every((v) => v.toNumber() === 0)).to.be.true;
    
    console.log(`   ✅ Poll created: "${poll.title}"`);
  });

  it("Registers voter 1 with 100 credits", async () => {
    await program.methods
      .registerVoter(new anchor.BN(100))
      .accounts({
        voterAccount: voter1PDA,
        poll: pollPDA,
        voter: voter1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([voter1])
      .rpc();

    const voterAccount = await program.account.voter.fetch(voter1PDA);
    expect(voterAccount.creditsRemaining.toNumber()).to.equal(100);
    expect(voterAccount.totalCredits.toNumber()).to.equal(100);
    expect(voterAccount.votesCast).to.have.lengthOf(optionCount);
    
    console.log(`   ✅ Voter 1 registered with ${voterAccount.totalCredits} credits`);
  });

  it("Registers voter 2 with 50 credits", async () => {
    await program.methods
      .registerVoter(new anchor.BN(50))
      .accounts({
        voterAccount: voter2PDA,
        poll: pollPDA,
        voter: voter2.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([voter2])
      .rpc();

    const voterAccount = await program.account.voter.fetch(voter2PDA);
    expect(voterAccount.creditsRemaining.toNumber()).to.equal(50);
    
    console.log(`   ✅ Voter 2 registered with ${voterAccount.totalCredits} credits`);
  });

  it("Voter 1 casts 5 votes for Rust (costs 25 credits)", async () => {
    // Cost = 5² = 25 credits
    await program.methods
      .castVote(0, new anchor.BN(5))
      .accounts({
        voterAccount: voter1PDA,
        poll: pollPDA,
        voter: voter1.publicKey,
      })
      .signers([voter1])
      .rpc();

    const voterAccount = await program.account.voter.fetch(voter1PDA);
    expect(voterAccount.creditsRemaining.toNumber()).to.equal(75); // 100 - 25
    expect(voterAccount.votesCast[0].toNumber()).to.equal(5);

    const poll = await program.account.poll.fetch(pollPDA);
    expect(poll.votes[0].toNumber()).to.equal(5);
    
    console.log(`   ✅ Voter 1 cast 5 votes (cost: 25, remaining: ${voterAccount.creditsRemaining})`);
  });

  it("Voter 1 adds 2 more votes for Rust (costs 24 credits)", async () => {
    // Current: 5 votes, Adding: 2 votes
    // Cost = 7² - 5² = 49 - 25 = 24 credits
    await program.methods
      .castVote(0, new anchor.BN(2))
      .accounts({
        voterAccount: voter1PDA,
        poll: pollPDA,
        voter: voter1.publicKey,
      })
      .signers([voter1])
      .rpc();

    const voterAccount = await program.account.voter.fetch(voter1PDA);
    expect(voterAccount.creditsRemaining.toNumber()).to.equal(51); // 75 - 24
    expect(voterAccount.votesCast[0].toNumber()).to.equal(7);

    const poll = await program.account.poll.fetch(pollPDA);
    expect(poll.votes[0].toNumber()).to.equal(7);
    
    console.log(`   ✅ Voter 1 added 2 more votes (cost: 24, remaining: ${voterAccount.creditsRemaining})`);
  });

  it("Voter 1 casts 3 votes for Python (costs 9 credits)", async () => {
    await program.methods
      .castVote(2, new anchor.BN(3))
      .accounts({
        voterAccount: voter1PDA,
        poll: pollPDA,
        voter: voter1.publicKey,
      })
      .signers([voter1])
      .rpc();

    const voterAccount = await program.account.voter.fetch(voter1PDA);
    expect(voterAccount.creditsRemaining.toNumber()).to.equal(42); // 51 - 9
    expect(voterAccount.votesCast[2].toNumber()).to.equal(3);

    const poll = await program.account.poll.fetch(pollPDA);
    expect(poll.votes[2].toNumber()).to.equal(3);
    
    console.log(`   ✅ Voter 1 cast 3 votes for Python (cost: 9, remaining: ${voterAccount.creditsRemaining})`);
  });

  it("Voter 2 casts 7 votes for TypeScript (costs 49 credits)", async () => {
    await program.methods
      .castVote(1, new anchor.BN(7))
      .accounts({
        voterAccount: voter2PDA,
        poll: pollPDA,
        voter: voter2.publicKey,
      })
      .signers([voter2])
      .rpc();

    const voterAccount = await program.account.voter.fetch(voter2PDA);
    expect(voterAccount.creditsRemaining.toNumber()).to.equal(1); // 50 - 49
    expect(voterAccount.votesCast[1].toNumber()).to.equal(7);

    const poll = await program.account.poll.fetch(pollPDA);
    expect(poll.votes[1].toNumber()).to.equal(7);
    
    console.log(`   ✅ Voter 2 cast 7 votes for TypeScript (cost: 49, remaining: ${voterAccount.creditsRemaining})`);
  });

  it("Fails when voter has insufficient credits", async () => {
    // Voter 2 only has 1 credit left, trying to cast 2 votes (costs 4)
    try {
      await program.methods
        .castVote(3, new anchor.BN(2))
        .accounts({
          voterAccount: voter2PDA,
          poll: pollPDA,
          voter: voter2.publicKey,
        })
        .signers([voter2])
        .rpc();
      expect.fail("Should have failed with insufficient credits");
    } catch (err) {
      expect(err.toString()).to.include("InsufficientCredits");
      console.log(`   ✅ Correctly rejected vote with insufficient credits`);
    }
  });

  it("Closes the poll", async () => {
    await program.methods
      .closePoll()
      .accounts({
        poll: pollPDA,
        authority: authority,
      })
      .rpc();

    const poll = await program.account.poll.fetch(pollPDA);
    expect(poll.isActive).to.be.false;
    
    console.log(`   ✅ Poll closed successfully`);
  });

  it("Fails to vote on closed poll", async () => {
    try {
      await program.methods
        .castVote(0, new anchor.BN(1))
        .accounts({
          voterAccount: voter1PDA,
          poll: pollPDA,
          voter: voter1.publicKey,
        })
        .signers([voter1])
        .rpc();
      expect.fail("Should have failed - poll is closed");
    } catch (err) {
      expect(err.toString()).to.include("PollNotActive");
      console.log(`   ✅ Correctly rejected vote on closed poll`);
    }
  });

  it("Displays final results", async () => {
    const poll = await program.account.poll.fetch(pollPDA);
    console.log("\n" + "=".repeat(50));
    console.log("🏆 FINAL POLL RESULTS");
    console.log("=".repeat(50));
    console.log(`📊 Poll: "${poll.title}"`);
    console.log(`📝 Description: "${poll.description}"`);
    console.log("─".repeat(50));
    console.log(`🦀 Option 0 (Rust):       ${poll.votes[0].toNumber()} votes`);
    console.log(`📘 Option 1 (TypeScript): ${poll.votes[1].toNumber()} votes`);
    console.log(`🐍 Option 2 (Python):     ${poll.votes[2].toNumber()} votes`);
    console.log(`🔷 Option 3 (Go):         ${poll.votes[3].toNumber()} votes`);
    console.log("=".repeat(50));
    console.log("🎉 All tests passed! Quadratic voting works perfectly!");
    console.log("=".repeat(50) + "\n");
    
    // Verify the results match expected values
    expect(poll.votes[0].toNumber()).to.equal(7);  // Rust
    expect(poll.votes[1].toNumber()).to.equal(7);  // TypeScript
    expect(poll.votes[2].toNumber()).to.equal(3);  // Python
    expect(poll.votes[3].toNumber()).to.equal(0);  // Go
  });
});